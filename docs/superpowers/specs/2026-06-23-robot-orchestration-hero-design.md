# Robot Orchestration Hero — Design Spec

**Date:** 2026-06-23
**Status:** Approved design, pending implementation plan
**Author:** Mustafa Başar (with Claude)

## Summary

Replace (swappably) the portfolio's desktop 3D hero — currently an animated human character "at a desk" — with a **multi-agent orchestration scene**: a central **supervisor robot** that orchestrates **three worker robots**, symbolically representing Mustafa's work as an AI Solutions Engineer focused on agentic orchestration.

The current character (`Scene`) is **kept intact** as a one-flag fallback. If the robot scene underwhelms, flipping a single constant restores the original hero.

## Goals

- Hero reflects Mustafa's identity: **a robot managing other robots** = multi-agent orchestration, the core of his work.
- "Good presentation": visually striking, on-brand (dark/purple, #c2a4ff accents).
- **Lightly interactive**: supervisor gaze follows cursor; hovering a worker reveals its role; scroll advances the orchestration.
- **No performance regression**: stay within the budget the current scene already meets, reusing every optimization shipped today.
- **Safe fallback**: original character never removed; instant revert.

## Non-Goals (explicitly out of scope for this spec)

- Fully interactive "give the agents a task" playground (a later, separate phase).
- Per-section conceptual demos (HITL demo, live prompt-caching) — separate Phase 2 spec.
- Mobile 3D: mobile keeps the existing lightweight SVG `AgentGraph`. The robot scene is desktop-only (>1024px), like the current character.

## The Scene

- **Supervisor robot** — centered, slightly elevated, larger. The "orchestrator."
- **Three worker robots** — arranged in a shallow arc below/around the supervisor. Each has a role:
  - **Security** — guards/audits (ties to his HITL governance work).
  - **Document Analyst** — reads/analyzes documents (ties to his RAG / document-intelligence work).
  - **Code** — writes/runs code.
- **Connection edges** — glowing lines (supervisor → each worker). Animated **task pulses** (small emissive spheres) travel along edges to show dispatch/return.
- **Theme** — dark transparent background (composited over the page like the current hero), purple emissive accents, soft HDRI lighting, shadows off.

## Animation (no skeletal rig)

Workers use a **single shared low-poly model** rendered via `InstancedMesh` (shared geometry → few draw calls). The supervisor is the same model scaled up / re-tinted, or a distinct light model. Animation is transform + emissive only:

- **Idle**: gentle vertical bob (sine), slight yaw.
- **Orchestration loop**: supervisor dispatches → pulse travels supervisor→worker → that worker "activates" (emissive up + small scale/spin) → pulse returns → next worker. Cycles continuously.

## Interaction (lightly interactive)

- **Gaze**: supervisor tilts toward the cursor (reuse the existing head-tracking lerp pattern from `mouseUtils`).
- **Hover worker**: an HTML/sprite label shows the worker's role. Raycast against the worker instances to detect hover.
- **Scroll**: GSAP ScrollTrigger advances the orchestration / nudges the camera (reuse the `GsapScroll` timeline pattern).

## Performance

- Low-poly CC0 model (Quaternius / Poly Pizza), draco-compressed like the current model.
- `InstancedMesh` for the three workers (one geometry, three instances).
- Reuse shipped optimizations: off-screen render gating (IntersectionObserver + visibilitychange), `setPixelRatio` capped at 1.0, FXAA composer, shadows disabled, `frustumCulled`.
- Budget target: comparable to current scene — roughly ≤ 60k triangles, < 100 draw calls.

## Architecture & Module Shape

- `src/components/Robot/RobotScene.tsx` — self-contained Three.js setup: renderer + FXAA composer, lighting, builds supervisor + instanced workers + edges, runs the gated render loop, wires gaze/hover/scroll.
- `src/components/Robot/utils/robotModel.ts` — load + prepare the glTF (GLTFLoader + DRACOLoader), build the supervisor and the `InstancedMesh` workers, apply materials.
- `src/components/Robot/utils/orchestration.ts` — pure-ish orchestration logic: the dispatch cycle (which worker is active, pulse parametric position along an edge over time). Testable in isolation.
- Reuse existing `lighting`, resize, and head-tracking patterns where they fit.
- **Hero switch**: a single constant `HERO: "robot" | "character"` (e.g., in `Character/index.tsx` or a small `heroConfig.ts`) selects which component mounts. Original `Scene` untouched.

## Fallback / Safety

- The original `src/components/Character/**` stays exactly as-is.
- `HERO = "character"` restores the current hero instantly.
- Both heroes share the same lazy-load + `isDesktopView && !isMobile` gating and the mobile `AgentGraph` fallback.

## Implementation Notes

- **Consult context7 (mandatory) for every Three.js API before using it** — `InstancedMesh` (setMatrixAt / instanceMatrix / per-instance color), `GLTFLoader` + `DRACOLoader`, raycasting against instanced meshes (`instanceId`), `EffectComposer`/`FXAAShader`, materials/emissive. Training knowledge may be stale; pull current docs and paste/verify rather than guessing.

## Verification

- `npm run build` (TypeScript) + `npm run lint` (no new errors beyond pre-existing template debt).
- Playwright on local preview: confirm canvas transparency (no black box), measure scroll FPS with the existing harness, screenshot the hero.
- Manual: hover each worker shows the right role; supervisor gaze tracks cursor; scroll advances orchestration.

## Risks & Mitigations

- **Model licensing** → use CC0 (Quaternius / Poly Pizza), credit if required.
- **Multi-robot perf** → instancing + low-poly + existing render gating.
- **Rig-less animation looking stiff** → bob + emissive pulses + gaze sell "alive" without a skeleton.
- **Underwhelming result** → the one-flag fallback to the proven character.

## Open Questions

- Exact model: pick a CC0 robot during implementation (verify look + tri count).
- Worker label style: HTML overlay vs in-scene sprite — decide during implementation based on positioning.
