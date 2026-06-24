import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer, RenderPass, ShaderPass, FXAAShader } from "three-stdlib";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildRobotTeam, RobotInstance } from "./utils/robotModel";
import { setRobotLighting } from "./utils/robotLighting";
import { WORKER_COUNT } from "./utils/orchestration";

gsap.registerPlugin(ScrollTrigger);

const WORKER_POSITIONS = [
  new THREE.Vector3(-2.7, -1.8, 0.2),
  new THREE.Vector3(0, -2.1, 0.9),
  new THREE.Vector3(2.7, -1.8, 0.2),
];
const SUPERVISOR_ANCHOR = new THREE.Vector3(0, 0.1, 0);
export const ROLES = ["Security", "Document Analyst", "Tester"];
// Role-specific "action" each worker performs when activated.
// Security (Death — neutralizes & stays down), Document Analyst (Dance), Tester (Running — runs the suite).
const ROLE_ACTIONS = ["Death", "Dance", "Running"];
const ROLE_ONCE = [true, false, false]; // Death plays once and holds the pose
// The supervisor is the only one who "likes" (ThumbsUp) — it approves the work.
const SUPERVISOR_GESTURE = "ThumbsUp";

export interface RobotController {
  dispatch: (workerIndex: number, task?: string) => void;
}

interface Props {
  onReady?: (c: RobotController) => void;
  onWorkerClick?: (index: number) => void;
}

const RobotScene = ({ onReady, onWorkerClick }: Props) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    mount.style.position = "relative";
    const rect = mount.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    let disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
    camera.position.set(0, 1.4, 15);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
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

    // edges supervisor -> each worker
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x9d7bff, transparent: true, opacity: 0.5 });
    WORKER_POSITIONS.forEach((p) => {
      const g = new THREE.BufferGeometry().setFromPoints([SUPERVISOR_ANCHOR, p]);
      scene.add(new THREE.Line(g, edgeMat));
    });

    // task pulse
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xe6c3ff })
    );
    pulse.visible = false;
    scene.add(pulse);

    // gaze
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    document.addEventListener("mousemove", onMouseMove);

    // hover role label
    const label = document.createElement("div");
    label.className = "robot-role-label";
    label.style.cssText =
      "position:absolute;pointer-events:none;padding:4px 10px;border-radius:14px;" +
      "background:rgba(31,27,56,.9);color:#e6dcff;font:600 12px/1 'Segoe UI',sans-serif;" +
      "letter-spacing:.05em;opacity:0;transition:opacity .15s;transform:translate(-50%,-130%);z-index:5;";
    mount.appendChild(label);

    // gentle scroll parallax (kept subtle so robots stay fully framed)
    const st = gsap.fromTo(
      camera.position,
      { y: 1.9 },
      {
        y: 1.0,
        ease: "none",
        scrollTrigger: { trigger: ".robot-section", start: "top bottom", end: "center center", scrub: 0.6 },
      }
    );

    let team: { supervisor: RobotInstance; workers: RobotInstance[] } | null = null;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let onHover: ((e: MouseEvent) => void) | null = null;
    let onClick: ((e: MouseEvent) => void) | null = null;

    // Raycast helper: which worker (0..n) is under the pointer, or -1.
    const pickWorker = (e: MouseEvent, roots: THREE.Object3D[]): number => {
      const r = mount.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(roots, true);
      if (!hits.length) return -1;
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj) {
        const idx = roots.indexOf(obj);
        if (idx !== -1) return idx;
        obj = obj.parent;
      }
      return -1;
    };

    // --- orchestration target state (drives both auto-demo and manual dispatch) ---
    let target = 0;
    let dispatchAt = 0;
    let autoAt = 2.5;
    let manualPauseUntil = 0;
    // The supervisor only "likes" after a worker we clicked finishes its task.
    const LIKE_DELAY = 2.4; // let the worker's action play out first
    const LIKE_HOLD = 1.8; // how long to hold the ThumbsUp before idling
    let likeAt = 0; // when to play the supervisor's ThumbsUp (0 = none pending)
    let supervisorIdleAt = 0; // when to return the supervisor to Idle

    const setTarget = (i: number, manual: boolean, t: number) => {
      target = i;
      dispatchAt = t;
      pulse.visible = true;
      if (manual) {
        manualPauseUntil = t + 7;
        // approve only the worker the user assigned, once it has finished acting
        likeAt = t + LIKE_DELAY;
        supervisorIdleAt = 0;
      }
      if (!team) return;
      team.workers.forEach((wk, idx) => {
        if (idx === i) wk.play(ROLE_ACTIONS[i], { once: ROLE_ONCE[i] });
        else wk.play("Idle");
      });
    };

    const clock = new THREE.Clock();
    const controller: RobotController = {
      dispatch: (i: number) => {
        if (i < 0 || i >= WORKER_COUNT) return;
        setTarget(i, true, clock.getElapsedTime());
      },
    };
    let rafId = 0;
    let running = false;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      if (team) {
        team.supervisor.mixer.update(dt);
        team.workers.forEach((wk) => wk.mixer.update(dt));

        team.supervisor.root.position.y = SUPERVISOR_ANCHOR.y + Math.sin(t * 1.4) * 0.05;
        team.supervisor.root.rotation.y = THREE.MathUtils.lerp(
          team.supervisor.root.rotation.y,
          mouse.x * 0.5,
          0.07
        );

        // supervisor approves with a ThumbsUp once the clicked worker finishes
        if (likeAt && t >= likeAt) {
          team.supervisor.play(SUPERVISOR_GESTURE, { once: true });
          likeAt = 0;
          supervisorIdleAt = t + LIKE_HOLD;
        }
        if (supervisorIdleAt && t >= supervisorIdleAt) {
          team.supervisor.play("Idle");
          supervisorIdleAt = 0;
        }

        // ambient auto-demo unless the user recently took control
        if (t > manualPauseUntil && t > autoAt) {
          autoAt = t + 2.6;
          setTarget((target + 1) % WORKER_COUNT, false, t);
        }

        // pulse travels supervisor -> target over ~0.8s, then rests at the worker
        const since = t - dispatchAt;
        const ph = Math.min(1, since / 0.8);
        pulse.position.lerpVectors(SUPERVISOR_ANCHOR, WORKER_POSITIONS[target], ph);
        const s = 1 + Math.sin(t * 8) * 0.15 * (1 - ph);
        pulse.scale.setScalar(s);
      }

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
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
      setFxaa();
    };
    window.addEventListener("resize", onResize);
    start();

    buildRobotTeam(WORKER_POSITIONS)
      .then((built) => {
        if (disposed) return;
        team = built;
        scene.add(built.supervisor.root);
        built.workers.forEach((wk) => scene.add(wk.root));
        built.workers.forEach((wk) => wk.play("Idle"));
        built.supervisor.play("Idle");
        setTarget(0, false, clock.getElapsedTime());
        onReady?.(controller);

        const workerRoots = built.workers.map((wk) => wk.root);
        onHover = (e: MouseEvent) => {
          const idx = pickWorker(e, workerRoots);
          if (idx !== -1) {
            const r = mount.getBoundingClientRect();
            label.textContent = `${ROLES[idx]} — click to assign`;
            label.style.left = `${e.clientX - r.left}px`;
            label.style.top = `${e.clientY - r.top}px`;
            label.style.opacity = "1";
            renderer.domElement.style.cursor = "pointer";
          } else {
            label.style.opacity = "0";
            renderer.domElement.style.cursor = "default";
          }
        };
        mount.addEventListener("mousemove", onHover);

        onClick = (e: MouseEvent) => {
          const idx = pickWorker(e, workerRoots);
          if (idx !== -1) {
            setTarget(idx, true, clock.getElapsedTime());
            onWorkerClick?.(idx);
          }
        };
        renderer.domElement.addEventListener("click", onClick);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("mousemove", onMouseMove);
      if (onHover) mount.removeEventListener("mousemove", onHover);
      if (onClick) renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      st.scrollTrigger?.kill();
      st.kill();
      label.remove();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [onReady, onWorkerClick]);

  return <div className="robot-canvas" ref={mountRef} />;
};

export default RobotScene;
