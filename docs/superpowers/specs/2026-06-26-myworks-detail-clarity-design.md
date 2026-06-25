# /myworks Detail Page — Clarity & Hero Redesign

**Date:** 2026-06-26
**Status:** Approved (design), pending implementation plan
**Scope:** `/myworks/:slug` detail pages only. Home-page sections are separate sub-projects (see "Out of Scope").

## Problem

The detail page shows four panels (3D scene, terminal, document, live chat) that **all auto-play simultaneously on load**. A visitor's eye has no anchor — nothing is the "hero," nothing explains *what* each panel is or *why* it's there. Recruiters can't tell what they're looking at in the first 10 seconds; even technical visitors have to reverse-engineer how the panels relate. The page is impressive but exhausting and unclear at a glance.

## Audience & Goal

Two audiences, one design serves both via **one clear hook, then optional depth**:

- **Recruiter / non-technical** — needs trust + impact: "this person built *real*, working AI agent systems." One legible message.
- **Technical / engineer** — wants to see *how* it works, but **in order**, not all at once.

**Hero (the one thing the eye lands on first): the live chat** — a real DeepSeek-backed agent the visitor can task and watch answer, with real token telemetry. This is the genuine differentiator most portfolios lack.

## Design

### 1. Hierarchy — hero up, evidence down

Restructure the page so the chat is the visual hero:

- **Chat panel** becomes large and occupies the upper area; carries a bright **live** badge.
- **3D scene** shrinks to a supporting panel beside/adjacent to the chat.
- **Terminal + document** drop to a lower "behind the scenes" evidence strip, visually quieter.

Desktop: chat (upper-left, dominant) + 3D (upper-right, smaller); terminal + document as a bottom strip.
Mobile: single column, top→bottom — head → flow ribbon → **chat (hero)** → 3D → terminal → document.

### 2. Calm by default (no simultaneous auto-play)

- On load the page does **not** auto-run everything. The chat starts **empty** with an invitation ("Bana bir görev ver →") and the existing one-click **suggestion chips pulsing** as the call to action.
- The terminal / document / 3D sit quiet (not animating) until the visitor runs a task.
- When a task runs, terminal + document + 3D come alive **together, softly** as "proof" alongside the streaming answer.
- Cold-start risk (visitor types nothing → sees no answer) is mitigated by the pulsing one-click chips, which run a task instantly.

### 3. Every panel says what it is

- **Numbered flow ribbon** near the top: `① reads the spec → ② works the steps → ③ answers you (below) → ④ renders the result`. Establishes the logical pipeline regardless of visual placement.
- **Per-panel one-line subtitle** under each panel title, in plain language (e.g. terminal → "the agent working through it, step by step"; task_spec → "the requirements the agent must satisfy"; chat → "a real answer to what you asked"; 3D → "the result, brought to life").
- **Honest badges** replace the vague "simulated": chat + token telemetry = **live**; terminal + document = **example flow** (örnek akış). The page never implies the representational panels are live calls.

### 4. 3D models — animated human cast (Quaternius, CC0)

Replace the disliked animal/robot models with a consistent cast of **animated human characters** from the Quaternius *Ultimate Animated Character Pack* (poly.pizza, **CC0** — free, no attribution). All characters share the same `CharacterArmature` rig and 24 animation clips (Wave, Idle, Interact, Walk, Run, …), already present in the existing `BusinessMan.glb`. Click-to-play clip cycling (already supported by `ModelViewer`) lets the figures actually *do* something.

| # | Project | Character + activity |
|---|---------|----------------------|
| 1 | orchestration | conductor — `Interact`/`Wave` (liked, keep theme) |
| 2 | tool-routing | dispatcher at a console — `Interact`; click → `Walk/Run` |
| 3 | persistent-state | `Idle` → `Walk away` → returns = pause/resume |
| 4 | swarm | small 3–4 character coordinated team (not a crowd) |
| 5 | hitl-safety | approver — `Wave`/`Interact` (liked, keep) |

Sourcing: download GLBs from Quaternius/poly.pizza into `public/models/lib/` (Git LFS-tracked), same method used previously for `Grabbot.glb` / `BusinessMan.glb`. Final character-to-project picks may be tuned during implementation against what the pack actually contains; the *roles, clips, and "animated human" direction* are fixed.

## Components Touched

- `src/pages/ProjectDetail.tsx` — layout restructure (hero chat up, 3D aside, terminal+doc strip), remove auto-run-on-load, add flow ribbon + per-panel subtitles + honest badges, soft "come alive together on run" behavior.
- `src/pages/ProjectDetail.css` — new hierarchy, hero emphasis, quiet evidence strip, flow ribbon, subtitle, pulsing chips, badge styles.
- `src/lib/agents.ts` — model URLs / clips / flock for projects 1–4; optional per-panel subtitle + badge-honesty fields if not derivable.
- `src/components/Robot/ModelViewer.tsx` — only if the new cast / small-team (project 4) needs adjustment beyond current `flock`/`ground`/clip support.
- `public/models/lib/*.glb` — new Quaternius character GLBs (LFS).

## Success Criteria

- On load, a first-time visitor's eye lands on the chat first; nothing else is moving.
- Within ~10s a visitor can answer "what is this and what do I do" without scrolling docs.
- One click on a suggestion chip produces a real (or demo) answer with the other panels animating as supporting evidence.
- Each panel's purpose is readable from its subtitle; live vs. example is never ambiguous.
- 3D figures are recognizable human characters that perform a role-relevant activity; no leftover fox/bird/generic-robot on projects 1–4.
- Existing behaviors preserved: live/cached/demo streaming + telemetry, scrubber, drag/click-to-play 3D, body-scroll unlock, GitHub Pages (LFS + SPA) + Vercel deploys.

## Out of Scope (separate sub-projects)

Home-page sections — Hero/Landing, About, WhatIDo, Career, RobotSection, Work, TechStack, CallToAction, Contact — and the `/myworks` list page. These get their own spec → plan cycles after this one ships.

## Revision (2026-06-26) — 3D character → per-project agent graph

After implementing the animated human cast, every character (King, Worker, SWAT,
astronaut…) still read as **irrelevant** to AI agents — the recurring complaint
across the whole project. Root cause: a character beside the demo is decorative;
nothing about a human depicts multi-agent orchestration. Decision: **drop the 3D
character entirely** and replace the stage panel with a per-project LangGraph-style
topology (pure SVG/CSS, built on the existing `AgentGraph`). Five distinct shapes —
supervisor fan-out, tool router, checkpoint loop, swarm hierarchy, HITL gate — so
the visual *is* the system and "what's this got to do with it?" becomes impossible.
Lightly reactive (intensifies while a task streams). `ModelViewer` + all
`public/models/lib/*.glb` removed (only the detail page used them). All detail-page
UI copy unified to **English** to match the rest of the site. Implemented in commit
6b855ee; supersedes the "animated human cast" section above.
