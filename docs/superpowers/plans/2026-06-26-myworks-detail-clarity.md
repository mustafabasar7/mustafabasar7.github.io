# /myworks Detail Clarity + Hero Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/myworks/:slug` legible at a glance — promote the live chat to hero, calm the page on load, label every panel honestly, and replace animal/robot 3D models with an animated human cast.

**Architecture:** Pure front-end change. Restructure `ProjectDetail.tsx` (layout + load behavior + labels), add presentation fields to the `ProjectMeta` data in `agents.ts`, restyle `ProjectDetail.css`, and swap GLB model assets. No backend, no new dependencies.

**Tech Stack:** React 18 + TypeScript, Vite, Three.js / three-stdlib (`ModelViewer`), CSS. Spec: `docs/superpowers/specs/2026-06-26-myworks-detail-clarity-design.md`.

## Global Constraints

- **No new runtime dependencies.** Use what's already in `package.json`.
- **Verification cycle per task** (no meaningful unit-test surface for visual work): `npm run build` (runs `tsc -b && vite build`) MUST pass, `npm run lint` MUST pass, then the task's stated visual/behavioral check on `npm run dev` (http://localhost:5173/myworks/<slug>), then commit.
- **Preserve existing behavior:** live/cached/demo streaming + token telemetry, terminal scrubber, drag + click-to-play 3D, `document.body.style.overflow` unlock, GitHub Pages (LFS + SPA `404.html`) and Vercel deploys.
- **Models:** Quaternius *Ultimate Animated Character Pack*, **CC0**. GLBs go in `public/models/lib/` and are **Git LFS-tracked** (`.gitattributes` already globs `*.glb`). Same `CharacterArmature` rig + 24 clips as existing `BusinessMan.glb`.
- **Copy language:** UI strings in Turkish where user-facing labels were Turkish in the design (flow ribbon, subtitles, invitation); existing English technical strings stay as-is unless restyled.
- **Work branch:** `feat/myworks-detail-clarity` (already created; spec already committed there).

---

### Task 1: Add presentation fields to ProjectMeta (data layer)

Adds the flow-ribbon steps and per-panel subtitles to each project so the TSX can render them. No layout change yet.

**Files:**
- Modify: `src/lib/agents.ts` (the `ProjectMeta` interface near line 62–99, and each of the 5 `PROJECTS` entries)

**Interfaces:**
- Produces: `ProjectMeta.flow: [string, string, string, string]` (ribbon steps ①→④) and `ProjectMeta.subtitles: { spec: string; terminal: string; chat: string; scene: string }`. `ProjectDetail.tsx` consumes both in Task 3/5.

- [ ] **Step 1: Extend the interface.** In `src/lib/agents.ts`, inside `interface ProjectMeta` (after the `document` field), add:

```ts
  /** Four-step pipeline shown in the flow ribbon: ①spec ②terminal ③chat ④scene. */
  flow: [string, string, string, string];
  /** One-line plain-language subtitle under each panel title. */
  subtitles: { spec: string; terminal: string; chat: string; scene: string };
```

- [ ] **Step 2: Populate all 5 projects.** Add a `flow` and `subtitles` to each entry in `PROJECTS`. Use these exact values:

```ts
// orchestration
flow: ["spec'i okur", "ekibe dağıtır", "sana cevap verir", "sonucu sahnede gösterir"],
subtitles: {
  spec: "Ajanın uyması gereken gereksinimler",
  terminal: "Süpervizör işi adım adım dağıtırken",
  chat: "Senin sorduğun şeye gerçek yanıt",
  scene: "Ekibi yöneten şef — rolü canlandırıyor",
},
// tool-routing
flow: ["niyeti okur", "doğru araca yönlendirir", "sana cevap verir", "sonucu sahnede gösterir"],
subtitles: {
  spec: "Gelen isteğin niyet kırılımı",
  terminal: "Her adımı doğru araca yönlendirirken",
  chat: "Senin sorduğun şeye gerçek yanıt",
  scene: "İsteği doğru araca sevk eden figür",
},
// persistent-state
flow: ["durumu yükler", "adımları işler", "sana cevap verir", "sonucu sahnede gösterir"],
subtitles: {
  spec: "Kaydedilen kontrol noktası (checkpoint)",
  terminal: "Kaldığı yerden devam ederken",
  chat: "Senin sorduğun şeye gerçek yanıt",
  scene: "Duraklayıp kaldığı yerden dönen figür",
},
// swarm
flow: ["sürüyü kurar", "işi böler", "sana cevap verir", "sonucu sahnede gösterir"],
subtitles: {
  spec: "Sürünün iş bölümü haritası",
  terminal: "Ajanlar çakışmadan koordine olurken",
  chat: "Senin sorduğun şeye gerçek yanıt",
  scene: "Uyumlu çalışan küçük ekip",
},
// hitl-safety
flow: ["riskli adıma gelir", "insan onayını bekler", "sana cevap verir", "sonucu sahnede gösterir"],
subtitles: {
  spec: "İnsan onayı bekleyen aksiyon",
  terminal: "interrupt() ile durup beklerken",
  chat: "Senin sorduğun şeye gerçek yanıt",
  scene: "Onay veren insan — döngüdeki kişi",
},
```

- [ ] **Step 3: Verify build + lint.**
Run: `npm run build && npm run lint`
Expected: PASS (no TS errors — all 5 entries now satisfy the required `flow` + `subtitles`).

- [ ] **Step 4: Commit.**

```bash
git add src/lib/agents.ts
git commit -m "feat(myworks): add flow + subtitle copy to project metadata"
```

---

### Task 2: Calm-by-default load behavior (no auto-run, quiet terminal)

Stops the page from auto-running the agent and auto-playing the terminal on mount. Chat starts empty with the invitation; panels stay quiet until the visitor runs a task.

**Files:**
- Modify: `src/pages/ProjectDetail.tsx` (state init ~line 36–38; the auto-run effect ~line 94–99)

**Interfaces:**
- Consumes: existing `runAgent`, `step/playing/speed` state.
- Produces: on mount, `text === ""`, `playing === false`, `step === 0`; a task run (chip or Run button) still sets `playing = true` and replays the terminal (existing `runAgent` already does `setStep(0); setPlaying(true)`).

- [ ] **Step 1: Start the terminal paused.** Change the scrubber state init:

```ts
const [playing, setPlaying] = useState(false); // was true — page is calm until a task runs
```

- [ ] **Step 2: Remove auto-run on mount.** Replace the auto-run effect (currently calls `runAgent("")` on slug change) with a state reset that leaves the chat empty:

```ts
// Reset to a calm, empty state when the project changes — nothing runs until
// the visitor clicks a chip or hits Run.
useEffect(() => {
  acRef.current?.abort();
  setTask("");
  setText("");
  setStatus(null);
  setTelemetry(null);
  setStreaming(false);
  setStep(0);
  setPlaying(false);
  return () => acRef.current?.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [slug]);
```

- [ ] **Step 3: Verify behavior.**
Run: `npm run dev`, open `/myworks/orchestration`.
Expected: chat body is empty (no streamed answer), terminal shows step 0 (no lines scrolling), nothing auto-animates. Clicking a suggestion chip runs the agent AND the terminal starts playing.

- [ ] **Step 4: Verify build + lint.**
Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/pages/ProjectDetail.tsx
git commit -m "feat(myworks): calm-by-default load — no auto-run, quiet terminal"
```

---

### Task 3: Restructure layout — hero chat up, 3D aside, terminal+doc strip

Re-orders the panels so the chat is the visual hero. This is the core layout change in TSX + CSS.

**Files:**
- Modify: `src/pages/ProjectDetail.tsx` (the `pd-grid` block, ~line 170–289)
- Modify: `src/pages/ProjectDetail.css` (`.pd-grid`, `.pd-stage`, `.pd-workspace` and new classes)

**Interfaces:**
- Consumes: existing panel markup (chat/terminal/document/3D), `project.subtitles` from Task 1.
- Produces: DOM order — `.pd-hero` (chat + 3D row) then `.pd-evidence` (terminal + document row).

- [ ] **Step 1: Re-order the JSX.** Restructure the `pd-grid` so the chat and 3D form the top row and terminal+document form the bottom strip. Replace the `<div className="pd-grid">…</div>` block with:

```tsx
<div className="pd-grid">
  {/* HERO ROW: live chat (dominant) + 3D scene (supporting) */}
  <div className="pd-hero">
    <div className="pd-panel pd-chat pd-hero-chat">
      {/* …existing chat panel-bar, chat-body, telemetry, suggestions,
          chat-foot, hint — moved here verbatim from the old location… */}
    </div>
    <div className="pd-stage pd-hero-stage">
      {/* …existing 3D panel-bar + <Suspense><ModelViewer …/></Suspense>… */}
    </div>
  </div>

  {/* EVIDENCE STRIP: representational terminal + document */}
  <div className="pd-evidence">
    <div className="pd-panel pd-terminal">
      {/* …existing terminal panel-bar, term-body, scrub… */}
    </div>
    <div className="pd-panel pd-document">
      {/* …existing document panel-bar, doc-body… */}
    </div>
  </div>
</div>
```

(Move the existing inner markup verbatim — do not rewrite the chat/terminal/document internals in this task.)

- [ ] **Step 2: Lay out the rows in CSS.** In `ProjectDetail.css`, replace the `.pd-grid` rule and add the new containers:

```css
.pd-grid { display: flex; flex-direction: column; gap: 1.25rem; }

.pd-hero {
  display: grid;
  grid-template-columns: 1.7fr 1fr; /* chat dominant, 3D supporting */
  gap: 1.25rem;
  align-items: stretch;
}
.pd-hero-chat { min-height: 420px; }
.pd-hero-stage { min-height: 420px; }

.pd-evidence {
  display: grid;
  grid-template-columns: 1fr 1fr; /* terminal + document side by side */
  gap: 1.25rem;
  opacity: 0.82; /* quieter than the hero */
}

@media (max-width: 900px) {
  .pd-hero, .pd-evidence { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verify layout.**
Run: `npm run dev`, open `/myworks/orchestration` on a wide window, then narrow to mobile width.
Expected (desktop): chat large on the left, 3D smaller on the right, terminal + document in a quieter row below. (Mobile): single column, chat → 3D → terminal → document.

- [ ] **Step 4: Verify build + lint.**
Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/pages/ProjectDetail.tsx src/pages/ProjectDetail.css
git commit -m "feat(myworks): hero layout — chat up, 3D aside, evidence strip below"
```

---

### Task 4: Flow ribbon + per-panel subtitles + honest badges

Adds the orientation layer: numbered pipeline ribbon, plain-language subtitles, and honest live/example badges.

**Files:**
- Modify: `src/pages/ProjectDetail.tsx` (after `pd-head`, and each panel-bar)
- Modify: `src/pages/ProjectDetail.css` (ribbon, subtitle, badge styles)

**Interfaces:**
- Consumes: `project.flow`, `project.subtitles` (Task 1).

- [ ] **Step 1: Add the flow ribbon.** Immediately after the `</div>` closing `pd-head`, insert:

```tsx
<ol className="pd-flow" aria-label="agent pipeline">
  {project.flow.map((label, i) => (
    <li className="pd-flow-step" key={i}>
      <span className="pd-flow-num">{i + 1}</span>
      <span className="pd-flow-label">{label}</span>
    </li>
  ))}
</ol>
```

- [ ] **Step 2: Add subtitles under each panel name.** In each of the four panel-bars, after the `<span className="pd-panel-name">…</span>`, add a subtitle. Chat:

```tsx
<span className="pd-panel-sub">{project.subtitles.chat}</span>
```

Terminal → `{project.subtitles.terminal}`, document → `{project.subtitles.spec}`, 3D scene → `{project.subtitles.scene}`. (Panel-bar becomes name + subtitle on the left, badge on the right.)

- [ ] **Step 3: Make badges honest.** Change the representational badges so they read **örnek akış** instead of "simulated"/"step":
  - Terminal badge: keep the `step N / N` counter but label the panel state honestly — change the badge text to `{atEnd ? "örnek akış · tamam" : \`örnek akış · ${step}/${stepCount}\`}`.
  - Document badge: change `simulated` → `örnek akış`.
  - Chat badge: unchanged (already live/cached/demo — these are the honest "live" signals).
  - 3D badge: unchanged (`● drag · click to play`).

- [ ] **Step 4: Style ribbon + subtitle.** Add to `ProjectDetail.css`:

```css
.pd-flow {
  display: flex; flex-wrap: wrap; gap: 0.5rem 1rem;
  list-style: none; margin: 0.75rem 0 0; padding: 0;
  font-size: 0.85rem; color: var(--pd-muted, #9aa);
}
.pd-flow-step { display: inline-flex; align-items: center; gap: 0.45rem; }
.pd-flow-num {
  display: inline-grid; place-items: center;
  width: 1.4em; height: 1.4em; border-radius: 50%;
  background: rgba(255,255,255,0.08); font-weight: 700; font-size: 0.8em;
}
.pd-panel-sub { font-size: 0.78rem; opacity: 0.7; margin-left: 0.6rem; }
```

- [ ] **Step 5: Verify.**
Run: `npm run dev`, open `/myworks/tool-routing`.
Expected: a numbered 1→2→3→4 ribbon under the title; each panel shows a one-line subtitle; terminal/document badges read "örnek akış"; chat badge still shows live/cached/demo on run.

- [ ] **Step 6: Verify build + lint.**
Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add src/pages/ProjectDetail.tsx src/pages/ProjectDetail.css
git commit -m "feat(myworks): flow ribbon, panel subtitles, honest example/live badges"
```

---

### Task 5: Pulsing suggestion chips (cold-start call-to-action)

Make the one-click chips the visual call to action so an empty chat still invites engagement.

**Files:**
- Modify: `src/pages/ProjectDetail.css` (`.pd-chip`, add pulse)
- Modify: `src/pages/ProjectDetail.tsx` (only if a wrapper/empty-state hint is needed)

**Interfaces:**
- Consumes: existing `.pd-suggest` / `.pd-chip` markup and `text` state (empty = cold start).

- [ ] **Step 1: Add a pulse animation that only runs while the chat is empty.** In `ProjectDetail.tsx`, add a conditional class on the suggest wrapper:

```tsx
<div className={`pd-suggest${!text && !streaming ? " is-inviting" : ""}`}>
```

- [ ] **Step 2: Style the pulse.** In `ProjectDetail.css`:

```css
@keyframes pd-chip-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(120,170,255,0.0); }
  50% { box-shadow: 0 0 0 4px rgba(120,170,255,0.18); }
}
.pd-suggest.is-inviting .pd-chip { animation: pd-chip-pulse 2.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .pd-suggest.is-inviting .pd-chip { animation: none; }
}
```

- [ ] **Step 3: Verify.**
Run: `npm run dev`, open `/myworks/swarm`.
Expected: with an empty chat, the suggestion chips gently pulse; after running a task the pulse stops. Reduced-motion users see no pulse.

- [ ] **Step 4: Verify build + lint.**
Run: `npm run build && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/pages/ProjectDetail.tsx src/pages/ProjectDetail.css
git commit -m "feat(myworks): pulsing suggestion chips as cold-start call-to-action"
```

---

### Task 6: Source + wire the animated human cast (projects 1–4)

Download the Quaternius character GLBs and point the four non-human projects at them. Project 5 (hitl-safety) already uses `BusinessMan.glb` and is unchanged.

**Files:**
- Create: `public/models/lib/<Character>.glb` (LFS) — one per project 1–4 (project 1 may keep a single character or a small set; project 4 needs 3–4 for the team)
- Modify: `src/lib/agents.ts` (`modelUrl`, `clip`, `modelScale`, `flock`, `ground` for projects 1–4)

**Interfaces:**
- Consumes: `ModelViewer` props `url`, `scale`, `clip`, `flock`, `ground` (existing).

- [ ] **Step 1: Identify exact GLB URLs.** From the Quaternius *Ultimate Animated Character Pack* on poly.pizza, copy the direct `static.poly.pizza/...glb` URL for one character per role (suit/business look for conductor + dispatcher + approver-adjacent; distinct looks for the team). Record the chosen URLs in this step's checkbox before downloading.

- [ ] **Step 2: Download into the repo.** For each chosen character (example shows the pattern; substitute the real URL + filename):

```bash
curl -L "https://static.poly.pizza/<id>.glb" -o "public/models/lib/Conductor.glb"
```

- [ ] **Step 3: Confirm the rig + clips.** For each downloaded GLB, verify it carries the shared `CharacterArmature` clips (so `Interact`/`Wave`/`Walk`/`Idle` exist):

```bash
python -c "import json,struct; d=open('public/models/lib/Conductor.glb','rb').read(); j=json.loads(d[20:20+struct.unpack('<I',d[12:16])[0]]); print([a['name'] for a in j['animations']])"
```
Expected: a list including `CharacterArmature|Interact`, `CharacterArmature|Wave`, `CharacterArmature|Walk`, `CharacterArmature|Idle`.

- [ ] **Step 4: Wire the models in `agents.ts`.** Update projects 1–4. Use the clip names as they appear in Step 3 output (full `CharacterArmature|…` names):

```ts
// 1 orchestration (conductor — single figure leading)
modelUrl: "/models/lib/Conductor.glb", clip: "CharacterArmature|Interact", modelScale: 1.4,
// remove the old fox flock/ground (delete `flock` and `ground` from this entry)

// 2 tool-routing (dispatcher at a console)
modelUrl: "/models/lib/Dispatcher.glb", clip: "CharacterArmature|Interact", modelScale: 1.4,

// 3 persistent-state (pause/resume figure)
modelUrl: "/models/lib/Keeper.glb", clip: "CharacterArmature|Idle", modelScale: 1.4,

// 4 swarm (small coordinated team)
modelUrl: "/models/lib/TeamA.glb",
flock: ["/models/lib/TeamA.glb", "/models/lib/TeamB.glb", "/models/lib/TeamC.glb"],
ground: true, clip: "CharacterArmature|Walk", modelScale: 1.2,
```

- [ ] **Step 5: Verify each scene renders a human.**
Run: `npm run dev`, open `/myworks/orchestration`, `/tool-routing`, `/persistent-state`, `/swarm`.
Expected: each shows a recognizable animated human figure (no fox/bird/old robot), framed and visible, performing its clip; click cycles clips; drag rotates.

- [ ] **Step 6: Verify build + lint + LFS tracking.**
Run: `npm run build && npm run lint && git check-attr filter -- public/models/lib/Conductor.glb`
Expected: build/lint PASS; `git check-attr` reports `filter: lfs`.

- [ ] **Step 7: Commit.**

```bash
git add public/models/lib/*.glb src/lib/agents.ts
git commit -m "feat(myworks): animated human cast for projects 1-4 (Quaternius, CC0)"
```

---

### Task 7: Cross-slug verification + merge + deploy

Final pass across all five projects, then ship.

**Files:** none (verification + git)

- [ ] **Step 1: Walk every slug.**
Run: `npm run dev`, visit all of: `orchestration`, `tool-routing`, `persistent-state`, `swarm`, `hitl-safety`.
Verify for each: (a) eye lands on chat first, nothing auto-moves; (b) numbered ribbon + subtitles present; (c) a chip click streams an answer AND brings terminal/document alive; (d) 3D is an animated human performing a clip; (e) honest badges; (f) page scrolls; (g) mobile width collapses to one column.

- [ ] **Step 2: Production build sanity.**
Run: `npm run build && npm run preview`
Expected: builds clean; preview serves the detail pages with models loading.

- [ ] **Step 3: Merge to main.**

```bash
git checkout main
git merge --no-ff feat/myworks-detail-clarity -m "feat(myworks): detail-page clarity + hero redesign"
```

- [ ] **Step 4: Push (triggers GitHub Pages Action + Vercel).**

```bash
git push origin main
```

- [ ] **Step 5: Confirm live.** After the Pages Action completes, load https://mustafabasar7.github.io/myworks/orchestration and confirm the human model renders (LFS served) and the layout/labels match.

---

## Self-Review

**Spec coverage:**
- Hierarchy (hero up, 3D aside, evidence down) → Task 3. ✓
- Calm by default / no auto-play → Task 2. ✓
- Pulsing chips cold-start → Task 5. ✓
- Numbered flow ribbon + subtitles + honest badges → Tasks 1 (data) + 4 (render). ✓
- Animated human cast (projects 1–4), CC0/LFS → Task 6. ✓
- Preserve streaming/telemetry/scrubber/3D/deploys → Global Constraints + Task 7. ✓
- Mobile single column → Task 3 (media query) + Task 7 check. ✓

**Placeholder scan:** Task 6 intentionally defers the *exact* GLB URLs/filenames to Step 1 (they must be read from poly.pizza at implementation time) — this is a real external lookup, not a hand-wave; the step says to record them before downloading, and the wiring code shows the exact shape. All other steps carry concrete code/commands.

**Type consistency:** `flow` (4-tuple) and `subtitles` ({spec,terminal,chat,scene}) defined in Task 1 are consumed with the same names/shape in Tasks 3–4. Clip names use the full `CharacterArmature|…` form consistently in Task 6. `playing` init flips true→false in Task 2 and is the only state-init change.
