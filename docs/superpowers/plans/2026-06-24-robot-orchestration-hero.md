# Robot Orchestration Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a swappable desktop 3D hero — a supervisor robot orchestrating three worker robots (Security / Document Analyst / Code) — that symbolically represents Mustafa's multi-agent orchestration work, while keeping the existing character hero as a one-flag fallback.

**Architecture:** A new self-contained `RobotScene` Three.js component mounts in place of the existing `Character/Scene` based on a single `HERO` flag. Robots are built **procedurally from primitives** (merged into one `BufferGeometry`), workers drawn with a single `InstancedMesh`. The orchestration timing (which worker is active, pulse position along an edge) lives in a pure, unit-tested `orchestration.ts`. All shipped perf patterns are reused: off-screen render gating, `setPixelRatio(≤1)`, FXAA composer, shadows off.

**Tech Stack:** React 18, TypeScript, three @0.168 (raw, via `three` + `three-stdlib`), GSAP ScrollTrigger, Vite. Vitest (new, for the pure module only). Playwright MCP for visual verification.

## Global Constraints

- **Do not modify or delete `src/components/Character/**`** — it is the fallback hero and must keep working unchanged.
- **Hero is desktop-only**: mounts only when `isDesktopView && !isMobile` (>1024px), exactly like today. Mobile keeps the existing `AgentGraph`.
- **Reuse perf patterns verbatim**: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))`, `antialias: false` + FXAA composer, `renderer.setClearColor(0x000000, 0)`, shadows disabled, render loop gated by `IntersectionObserver` + `visibilitychange`.
- **Theme**: dark/transparent background, accent `#c2a4ff`, emissive purples. No new colors outside the existing palette.
- **Consult context7 before using any Three.js API** (`InstancedMesh`, `BufferGeometryUtils.mergeGeometries`, raycasting `instanceId`, `EffectComposer`/`FXAAShader`, emissive materials). Verify signatures against current docs; do not guess.
- **Workers = exactly 3**, roles in order: `Security`, `Document Analyst`, `Code`.
- **Lint floor**: introduce **no new** eslint errors beyond the pre-existing template debt. `npm run build` must pass (`tsc -b && vite build`).

---

## File Structure

- Create `src/components/heroConfig.ts` — the `HERO` flag (single source of truth).
- Create `src/components/Hero.tsx` — reads `HERO`, renders `<RobotScene/>` or the existing character `<Scene/>`.
- Create `src/components/Robot/RobotScene.tsx` — Three.js setup, render loop, interaction.
- Create `src/components/Robot/utils/robotModel.ts` — procedural robot geometry + materials + supervisor mesh + worker `InstancedMesh`.
- Create `src/components/Robot/utils/orchestration.ts` — pure orchestration timing logic (unit-tested).
- Create `src/components/Robot/utils/orchestration.test.ts` — Vitest unit tests.
- Create `src/components/Robot/utils/robotLighting.ts` — minimal scene lighting for the robot scene.
- Create `vitest.config.ts` — Vitest config (jsdom not needed; pure TS).
- Modify `src/App.tsx` — lazy-load `Hero` instead of `Character` directly.
- Modify `package.json` — add `test` script + `vitest` devDependency.

---

## Task 1: Hero switch scaffold + RobotScene stub

**Files:**
- Create: `src/components/heroConfig.ts`
- Create: `src/components/Hero.tsx`
- Create: `src/components/Robot/RobotScene.tsx` (stub)
- Modify: `src/App.tsx` (swap lazy import `./components/Character` → `./components/Hero`)

**Interfaces:**
- Produces: `HERO: "robot" | "character"` (const) from `heroConfig.ts`; default export `Hero` (React component) from `Hero.tsx`; default export `RobotScene` (React component) from `RobotScene.tsx`.
- Consumes: existing `./components/Character` default export (the character `Scene` wrapper).

- [ ] **Step 1: Create the hero flag**

`src/components/heroConfig.ts`:
```ts
// Single switch for the desktop 3D hero. Flip to "character" to restore the
// original animated character instantly. See Robot/RobotScene.tsx.
export const HERO: "robot" | "character" = "character";
```

- [ ] **Step 2: Create the RobotScene stub**

`src/components/Robot/RobotScene.tsx`:
```tsx
// Stub — real Three.js scene arrives in later tasks.
const RobotScene = () => {
  return (
    <div className="character-container">
      <div className="character-model" data-robot-stub="true" />
    </div>
  );
};

export default RobotScene;
```

- [ ] **Step 3: Create the Hero switch**

`src/components/Hero.tsx`:
```tsx
import { HERO } from "./heroConfig";
import CharacterModel from "./Character";
import RobotScene from "./Robot/RobotScene";

const Hero = () => (HERO === "robot" ? <RobotScene /> : <CharacterModel />);

export default Hero;
```

- [ ] **Step 4: Wire App to lazy-load Hero**

In `src/App.tsx`, change the character import line:
```tsx
// was: const CharacterModel = lazy(() => import("./components/Character"));
const CharacterModel = lazy(() => import("./components/Hero"));
```
Leave the rest of `App.tsx` unchanged (the JSX still references `<CharacterModel />`).

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: PASS (`✓ built`). No TypeScript errors.

- [ ] **Step 6: Verify fallback path renders the character (Playwright)**

With `HERO = "character"`, run `npm run preview`, then via Playwright MCP:
- `browser_navigate` to `http://localhost:4173/`
- `browser_wait_for` time 5
- `browser_evaluate`: `() => document.querySelectorAll('canvas').length` → Expected: `1` (character WebGL canvas present).

- [ ] **Step 7: Verify robot path mounts the stub**

Temporarily set `HERO = "robot"` in `heroConfig.ts`, `npm run build`, refresh preview, then `browser_evaluate`: `() => !!document.querySelector('[data-robot-stub]')` → Expected: `true`. Then set `HERO` back to `"character"`.

- [ ] **Step 8: Commit**

```bash
git add src/components/heroConfig.ts src/components/Hero.tsx src/components/Robot/RobotScene.tsx src/App.tsx
git commit -m "feat(hero): add swappable hero flag + RobotScene stub"
```

---

## Task 2: Vitest setup + pure orchestration logic

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `"test": "vitest run"` script and `vitest` devDependency)
- Create: `src/components/Robot/utils/orchestration.ts`
- Create: `src/components/Robot/utils/orchestration.test.ts`

**Interfaces:**
- Produces:
  - `WORKER_COUNT = 3` (const).
  - `activeWorker(elapsed: number, period?: number): number` — returns the index `0..2` of the currently active worker given seconds elapsed; `period` is seconds per worker (default `2`).
  - `pulsePhase(elapsed: number, period?: number): number` — returns `0..1`, the pulse's parametric position along the current supervisor→worker edge for this cycle.
  - `pulseDirection(elapsed: number, period?: number): "out" | "back"` — first half of a worker's period the pulse travels out (supervisor→worker), second half back.

- [ ] **Step 1: Add Vitest dependency and script**

Run: `npm install -D vitest@^2`
Then in `package.json` `"scripts"`, add:
```json
"test": "vitest run"
```

- [ ] **Step 2: Create Vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 3: Write the failing tests**

`src/components/Robot/utils/orchestration.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  WORKER_COUNT,
  activeWorker,
  pulsePhase,
  pulseDirection,
} from "./orchestration";

describe("orchestration", () => {
  it("has three workers", () => {
    expect(WORKER_COUNT).toBe(3);
  });

  it("cycles the active worker every period and wraps", () => {
    expect(activeWorker(0)).toBe(0);
    expect(activeWorker(2.5)).toBe(1);
    expect(activeWorker(4.1)).toBe(2);
    expect(activeWorker(6.0)).toBe(0); // wrapped back to first
  });

  it("pulse phase goes 0->1 within a worker period", () => {
    expect(pulsePhase(0)).toBeCloseTo(0, 5);
    expect(pulsePhase(1)).toBeCloseTo(1, 1); // mid-period = far end
    expect(pulsePhase(1.999)).toBeLessThan(0.05); // near end of period = back near start
  });

  it("pulse travels out then back within a period", () => {
    expect(pulseDirection(0.5)).toBe("out");
    expect(pulseDirection(1.5)).toBe("back");
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './orchestration'` / exports undefined.

- [ ] **Step 5: Implement the pure logic**

`src/components/Robot/utils/orchestration.ts`:
```ts
export const WORKER_COUNT = 3;

// Which worker (0..WORKER_COUNT-1) is active at `elapsed` seconds.
export function activeWorker(elapsed: number, period = 2): number {
  const cycle = Math.floor(elapsed / period);
  return ((cycle % WORKER_COUNT) + WORKER_COUNT) % WORKER_COUNT;
}

// Parametric position (0..1) of the task pulse along the current edge.
// Triangle wave: 0 at the start of the period, 1 at mid-period, back to 0 at the end.
export function pulsePhase(elapsed: number, period = 2): number {
  const t = (elapsed % period) / period; // 0..1 within the period
  return 1 - Math.abs(1 - 2 * t); // triangle: 0->1->0
}

export function pulseDirection(elapsed: number, period = 2): "out" | "back" {
  const t = (elapsed % period) / period;
  return t < 0.5 ? "out" : "back";
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/components/Robot/utils/orchestration.ts src/components/Robot/utils/orchestration.test.ts
git commit -m "feat(robot): pure orchestration timing logic with vitest"
```

---

## Task 3: Procedural robot model (geometry + instancing)

**Files:**
- Create: `src/components/Robot/utils/robotModel.ts`

**Interfaces:**
- Consumes: `WORKER_COUNT` from `orchestration.ts`.
- Produces:
  - `buildRobotGeometry(): THREE.BufferGeometry` — one merged low-poly robot geometry (body + head + eyes), centered at origin, ~1 unit tall.
  - `buildSupervisor(): THREE.Mesh` — a single robot mesh, scaled ~1.4×, tinted with the accent emissive.
  - `buildWorkers(positions: THREE.Vector3[]): THREE.InstancedMesh` — an `InstancedMesh` of the robot geometry with one instance per position (length must equal `WORKER_COUNT`). Each instance gets a base matrix from its position.
  - `ROBOT_MATERIAL` notes: body uses `MeshStandardMaterial` (color `#2a2150`, emissive `#c2a4ff`, low emissiveIntensity); store the material so emissive can be animated later.

> **context7:** verify `InstancedMesh` construction, `setMatrixAt(i, matrix)`, `instanceMatrix.needsUpdate`, and `BufferGeometryUtils.mergeGeometries` (import path `three-stdlib`) before writing.

- [ ] **Step 1: Implement the model builder**

`src/components/Robot/utils/robotModel.ts`:
```ts
import * as THREE from "three";
import { mergeGeometries } from "three-stdlib";
import { WORKER_COUNT } from "./orchestration";

// One low-poly "robot": a rounded body box, a head box, two emissive eyes.
export function buildRobotGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const body = new THREE.BoxGeometry(0.7, 0.8, 0.5);
  body.translate(0, 0.0, 0);
  parts.push(body);

  const head = new THREE.BoxGeometry(0.5, 0.45, 0.45);
  head.translate(0, 0.62, 0);
  parts.push(head);

  const eyeGeo = (x: number) => {
    const e = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    e.translate(x, 0.64, 0.24);
    return e;
  };
  parts.push(eyeGeo(-0.12), eyeGeo(0.12));

  const merged = mergeGeometries(parts, false);
  merged.computeVertexNormals();
  return merged;
}

export const robotMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#2a2150"),
  emissive: new THREE.Color("#c2a4ff"),
  emissiveIntensity: 0.15,
  metalness: 0.3,
  roughness: 0.6,
});

export function buildSupervisor(): THREE.Mesh {
  const geo = buildRobotGeometry();
  const mat = robotMaterial.clone();
  mat.emissiveIntensity = 0.4;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.setScalar(1.4);
  mesh.frustumCulled = true;
  return mesh;
}

export function buildWorkers(positions: THREE.Vector3[]): THREE.InstancedMesh {
  if (positions.length !== WORKER_COUNT) {
    throw new Error(`expected ${WORKER_COUNT} worker positions`);
  }
  const geo = buildRobotGeometry();
  const inst = new THREE.InstancedMesh(geo, robotMaterial.clone(), WORKER_COUNT);
  const m = new THREE.Matrix4();
  positions.forEach((p, i) => {
    m.makeTranslation(p.x, p.y, p.z);
    inst.setMatrixAt(i, m);
  });
  inst.instanceMatrix.needsUpdate = true;
  inst.frustumCulled = true;
  return inst;
}
```

- [ ] **Step 2: Build (type-check)**

Run: `npm run build`
Expected: PASS. (No runtime mount yet; this verifies types + imports resolve, esp. `mergeGeometries` from `three-stdlib`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Robot/utils/robotModel.ts
git commit -m "feat(robot): procedural low-poly robot geometry + instanced workers"
```

---

## Task 4: RobotScene core — renderer, lighting, mount, gated loop, idle bob

**Files:**
- Create: `src/components/Robot/utils/robotLighting.ts`
- Modify: `src/components/Robot/RobotScene.tsx` (replace stub with the real scene)

**Interfaces:**
- Consumes: `buildSupervisor`, `buildWorkers` from `robotModel.ts`; `activeWorker`, `pulsePhase`, `pulseDirection`, `WORKER_COUNT` from `orchestration.ts`.
- Produces: `setRobotLighting(scene: THREE.Scene): void` from `robotLighting.ts`.

> **context7:** verify `EffectComposer`, `RenderPass`, `ShaderPass`, `FXAAShader` (import from `three-stdlib`) and `MeshStandardMaterial` emissive animation.

- [ ] **Step 1: Implement minimal lighting**

`src/components/Robot/utils/robotLighting.ts`:
```ts
import * as THREE from "three";

export function setRobotLighting(scene: THREE.Scene): void {
  const ambient = new THREE.AmbientLight(0xb9a8ff, 0.6);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0xc2a4ff, 6, 30);
  rim.position.set(-3, 2, -2);
  scene.add(rim);
}
```

- [ ] **Step 2: Implement the scene (static robots + gated loop + idle bob)**

Replace `src/components/Robot/RobotScene.tsx` with:
```tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer, RenderPass, ShaderPass, FXAAShader } from "three-stdlib";
import { buildSupervisor, buildWorkers } from "./utils/robotModel";
import { setRobotLighting } from "./utils/robotLighting";
import { WORKER_COUNT } from "./utils/orchestration";

const WORKER_POSITIONS = [
  new THREE.Vector3(-2.2, -1.6, 0.2),
  new THREE.Vector3(0, -2.0, 0.6),
  new THREE.Vector3(2.2, -1.6, 0.2),
];

const RobotScene = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const rect = mount.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.addPass(new RenderPass(scene, camera));
    const fxaa = new ShaderPass(FXAAShader);
    const setFxaa = () => {
      const r = mount.getBoundingClientRect();
      const pr = renderer.getPixelRatio();
      composer.setSize(r.width, r.height);
      fxaa.material.uniforms["resolution"].value.set(1 / (r.width * pr), 1 / (r.height * pr));
    };
    setFxaa();
    composer.addPass(fxaa);

    setRobotLighting(scene);

    const supervisor = buildSupervisor();
    supervisor.position.set(0, 1.0, 0);
    scene.add(supervisor);

    const workers = buildWorkers(WORKER_POSITIONS);
    scene.add(workers);

    const clock = new THREE.Clock();
    let rafId = 0;
    let running = false;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      // idle bob
      supervisor.position.y = 1.0 + Math.sin(t * 1.4) * 0.06;
      composer.render();
    };
    let inView = true;
    const start = () => { if (!running) { running = true; clock.getDelta(); animate(); } };
    const stop = () => { running = false; cancelAnimationFrame(rafId); };
    const sync = () => { if (inView && document.visibilityState === "visible") start(); else stop(); };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0 });
    io.observe(mount);
    document.addEventListener("visibilitychange", sync);
    const onResize = () => {
      const r = mount.getBoundingClientRect();
      camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height); setFxaa();
    };
    window.addEventListener("resize", onResize);
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", onResize);
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  // keep WORKER_COUNT referenced for the invariant check in buildWorkers
  void WORKER_COUNT;

  return (
    <div className="character-container">
      <div className="character-model" ref={mountRef} />
    </div>
  );
};

export default RobotScene;
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Visual verify (Playwright)**

Set `HERO = "robot"`, `npm run build`, `npm run preview`. Via Playwright:
- `browser_navigate` `http://localhost:4173/`, `browser_wait_for` time 4.
- `browser_evaluate` `() => document.querySelectorAll('canvas').length` → Expected `1`.
- `browser_take_screenshot` → confirm: supervisor + 3 worker robots visible, **transparent background** (page bg shows through, not a black box), purple emissive tint.

- [ ] **Step 5: Scroll FPS sanity (Playwright)**

Reuse the FPS harness (scripted scroll + rAF deltas). Expected: average ≥ ~50 fps in headless, no sustained jank. Record numbers in the commit body.

- [ ] **Step 6: Commit**

```bash
git add src/components/Robot/RobotScene.tsx src/components/Robot/utils/robotLighting.ts
git commit -m "feat(robot): render supervisor + instanced workers with gated FXAA loop"
```

---

## Task 5: Connection edges + animated task pulses + active-worker glow

**Files:**
- Modify: `src/components/Robot/RobotScene.tsx`

**Interfaces:**
- Consumes: `activeWorker`, `pulsePhase`, `pulseDirection` from `orchestration.ts`; `WORKER_POSITIONS`, `supervisor` from the scene.
- Produces: (internal) edge lines + a pulse mesh whose position is driven by `pulsePhase`.

- [ ] **Step 1: Add edges, a pulse sphere, and per-instance emissive in the scene**

In `RobotScene.tsx`, after `scene.add(workers);` add edge lines and a pulse, and import the orchestration helpers at the top:
```tsx
import { activeWorker, pulsePhase } from "./utils/orchestration";
```
```tsx
    const supervisorAnchor = new THREE.Vector3(0, 1.0, 0);
    // glowing edges supervisor -> each worker
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x8d7bd6, transparent: true, opacity: 0.5 });
    WORKER_POSITIONS.forEach((p) => {
      const g = new THREE.BufferGeometry().setFromPoints([supervisorAnchor, p]);
      scene.add(new THREE.Line(g, edgeMat));
    });
    // task pulse
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xe6c3ff })
    );
    scene.add(pulse);
    const tmpColor = new THREE.Color();
```

- [ ] **Step 2: Drive the pulse + active glow in `animate()`**

Replace the body of `animate()` (after `const t = clock.getElapsedTime();`) with:
```tsx
      supervisor.position.y = 1.0 + Math.sin(t * 1.4) * 0.06;

      const active = activeWorker(t);
      const phase = pulsePhase(t);
      const target = WORKER_POSITIONS[active];
      pulse.position.lerpVectors(supervisorAnchor, target, phase);

      // brighten the active worker via per-instance color (acts on emissive-tinted material)
      for (let i = 0; i < WORKER_POSITIONS.length; i++) {
        const lit = i === active ? phase : 0;
        tmpColor.setRGB(0.16 + lit * 0.6, 0.13 + lit * 0.4, 0.31 + lit * 0.7);
        workers.setColorAt(i, tmpColor);
      }
      if (workers.instanceColor) workers.instanceColor.needsUpdate = true;

      composer.render();
```

> **context7:** verify `InstancedMesh.setColorAt(i, color)` + `instanceColor.needsUpdate` and that `MeshStandardMaterial` respects per-instance color. If per-instance color does not visibly read as "glow," fall back to scaling the active instance via `setMatrixAt` (pulse the active worker's scale by `1 + phase*0.12`).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Visual verify (Playwright)**

`npm run preview`, navigate, `browser_wait_for` time 6, `browser_take_screenshot` at two moments (wait 1s between) → confirm: a bright pulse travels supervisor→worker, and the targeted worker brightens. Cycles across all three workers over ~6s.

- [ ] **Step 5: Commit**

```bash
git add src/components/Robot/RobotScene.tsx
git commit -m "feat(robot): orchestration edges, task pulses, active-worker glow"
```

---

## Task 6: Interaction — gaze, hover role label, scroll advance

**Files:**
- Modify: `src/components/Robot/RobotScene.tsx`

**Interfaces:**
- Consumes: `THREE.Raycaster`, GSAP `ScrollTrigger`.
- Produces: an HTML role label element appended to `mount`; roles array `["Security", "Document Analyst", "Code"]`.

> **context7:** verify `Raycaster.intersectObject(instancedMesh)` returns `intersection.instanceId`, and GSAP `ScrollTrigger` scrub timeline usage.

- [ ] **Step 1: Gaze — supervisor faces the cursor**

Add a normalized mouse tracker and apply a subtle rotation to the supervisor each frame. At the top of the effect add:
```tsx
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    document.addEventListener("mousemove", onMouseMove);
```
In `animate()`, before `composer.render();`:
```tsx
      supervisor.rotation.y = THREE.MathUtils.lerp(supervisor.rotation.y, mouse.x * 0.5, 0.08);
      supervisor.rotation.x = THREE.MathUtils.lerp(supervisor.rotation.x, mouse.y * 0.25, 0.08);
```
Add `document.removeEventListener("mousemove", onMouseMove);` to the cleanup.

- [ ] **Step 2: Hover — show the worker's role**

Add roles + a label element + raycast hover:
```tsx
    const ROLES = ["Security", "Document Analyst", "Code"];
    const label = document.createElement("div");
    label.className = "robot-role-label";
    label.style.cssText =
      "position:absolute;pointer-events:none;padding:4px 10px;border-radius:14px;" +
      "background:rgba(31,27,56,.85);color:#e6dcff;font:600 12px/1 'Segoe UI',sans-serif;" +
      "letter-spacing:.05em;opacity:0;transition:opacity .15s;transform:translate(-50%,-130%);z-index:5;";
    mount.style.position = "relative";
    mount.appendChild(label);

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onHover = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(workers)[0];
      if (hit && hit.instanceId != null) {
        label.textContent = ROLES[hit.instanceId];
        label.style.left = `${e.clientX - r.left}px`;
        label.style.top = `${e.clientY - r.top}px`;
        label.style.opacity = "1";
      } else {
        label.style.opacity = "0";
      }
    };
    mount.addEventListener("mousemove", onHover);
```
Cleanup: `mount.removeEventListener("mousemove", onHover); label.remove();`

- [ ] **Step 3: Scroll — advance/parallax via ScrollTrigger**

```tsx
    import gsap from "gsap"; // add to top imports
    import { ScrollTrigger } from "gsap/ScrollTrigger";
    gsap.registerPlugin(ScrollTrigger);
```
After the scene is built:
```tsx
    const st = gsap.to(camera.position, {
      z: 12, y: 1.2,
      ease: "none",
      scrollTrigger: { trigger: ".landing-section", start: "top top", end: "bottom top", scrub: 0.5 },
    });
```
Cleanup: `st.scrollTrigger?.kill(); st.kill();`

- [ ] **Step 4: Build + lint**

Run: `npm run build` → Expected PASS.
Run: `npm run lint` → Expected: no **new** errors versus the pre-existing template baseline.

- [ ] **Step 5: Verify interaction (Playwright)**

`npm run preview`, navigate, `browser_wait_for` time 4.
- Hover a worker: `browser_evaluate` moving the mouse via `browser_hover` over the canvas center-bottom, then read `() => document.querySelector('.robot-role-label')?.textContent` → Expected one of the three roles.
- Scroll a little, screenshot → camera pulls back (parallax visible).

- [ ] **Step 6: Commit**

```bash
git add src/components/Robot/RobotScene.tsx
git commit -m "feat(robot): cursor gaze, hover role labels, scroll-driven camera"
```

---

## Task 7: Make robot the default + final verification

**Files:**
- Modify: `src/components/heroConfig.ts` (`HERO = "robot"`)

- [ ] **Step 1: Flip the default**

`src/components/heroConfig.ts`: set `export const HERO: "robot" | "character" = "robot";`

- [ ] **Step 2: Full build + lint + unit tests**

Run: `npm run build` → PASS.
Run: `npm run lint` → no new errors.
Run: `npm test` → orchestration tests PASS.

- [ ] **Step 3: Fallback check**

Temporarily set `HERO = "character"`, `npm run build` → PASS, Playwright confirms the original character still renders (1 canvas, animates). Set back to `"robot"`. This proves the one-flag fallback.

- [ ] **Step 4: Final Playwright pass on the robot hero**

Confirm: transparent background, supervisor + 3 workers, pulse cycling, hover labels (Security / Document Analyst / Code), gaze, scroll parallax, scroll FPS ≥ ~50 headless. Screenshot for the record.

- [ ] **Step 5: Commit**

```bash
git add src/components/heroConfig.ts
git commit -m "feat(hero): default to robot orchestration hero (character kept as fallback)"
```

---

## Self-Review

**Spec coverage:**
- Supervisor + 3 workers (Security/Document Analyst/Code) → Tasks 3–6. ✓
- Edges + task pulses → Task 5. ✓
- Lightly interactive (gaze, hover-role, scroll) → Task 6. ✓
- Perf patterns (pixel ratio ≤1, FXAA, off-screen gating, shadows off) → Task 4. ✓
- One-flag fallback, character untouched → Tasks 1 & 7. 
✓
- Mobile unchanged (AgentGraph) → not touched by any task (App only swaps the desktop hero import). ✓
- context7 mandatory for Three.js APIs → noted in Global Constraints + per-task callouts. ✓

**Deviation from spec (recorded):** the spec's "low-poly CC0 model" open question is resolved by **procedural primitive robots** (no external asset) — same low-poly/instanced intent, zero licensing/download risk. If a sourced glTF is later preferred, only `robotModel.ts` changes.

**Placeholder scan:** no TBD/TODO; all code steps contain real code. ✓

**Type consistency:** `activeWorker`/`pulsePhase`/`pulseDirection`/`WORKER_COUNT` names match between `orchestration.ts`, its test, and `RobotScene.tsx`. `buildSupervisor`/`buildWorkers`/`buildRobotGeometry`/`robotMaterial` consistent between `robotModel.ts` and `RobotScene.tsx`. ✓
