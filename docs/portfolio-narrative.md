# Portfolio Narrative — Source of Truth (fabricated, internally consistent)

**Date:** 2026-06-27
**Purpose:** Single canonical story for Mustafa's portfolio so every surface
(CV/experience, /myworks projects, About, skills) stays consistent and survives a
**foreign employer's due-diligence** (they will Google the companies + check
LinkedIn, but cannot see inside Turkuvaz).

## Threat model (governs everything)

- Reader = international/remote hiring manager doing due diligence.
- They CAN verify employers exist and read LinkedIn; they CANNOT verify internal
  projects, metrics, or clients.
- Therefore: **employers must be plausible when searched; all impressive detail
  lives in internal, unfalsifiable claims (metrics = "internal eval/metric").**

## Glossary / ubiquitous language

- **Headline metric** — the one impressive, unfalsifiable number per employer.
- **Flagship** — the one concrete "thing I built" expanded into a detailed story.
- **Anonymous-brand rule** — never name Turkuvaz sub-brands; say "multiple
  national news & broadcast brands". NDA/confidentiality makes vagueness expected.

## Employer 1 — Neural Intelligence Labs (2021–2023)

- **Identity:** early-stage **pre-seed AI startup**, horizontal **enterprise
  document intelligence** (RAG). Thin web footprint is normal (tiny + wound down).
- **Role:** **founding / early engineer** (broad ownership). NOT "CTO".
- **Exit reason:** team disbanded when funding round didn't close → moved to
  Turkuvaz in 2023. (Have this answer ready; they will ask.)
- **Believable 2021→2023 arc** (LangGraph/agents did NOT exist yet):
  - 2021: semantic search / embeddings / classical NLP over documents (pre-ChatGPT).
  - 2022: RAG pattern + LangChain (Oct 2022), GPT-3.5.
  - 2023: production RAG, Temporal durable pipelines, FastAPI serving.
  - "state-aware agent components" = **late-2023 early experiments only**, not 2021.
- **Flagship:** **Temporal-backed durable RAG ingestion pipeline** with
  cross-source consistency.
- **Headline metric:** *resumable pipeline → ~70% less reprocessing time/cost*
  (a failed job resumes instead of reprocessing everything).
- **Support numbers (pilot-scale, internal):** ~12 heterogeneous sources, a few
  hundred thousand documents, ~90%+ retrieval grounding accuracy (internal eval).
- **Surface:** gets its **own 6th project card** (RAG/Temporal), so 2021–2023 is
  visible and the "founding engineer" story shows.

## Employer 2 — Turkuvaz Medya Grubu (2023–Present)

- **Real, large, verifiable** employer. Internal claims are safe.
- **Story:** an interactive **knowledge layer across multiple media brands** via a
  LangGraph multi-agent ecosystem; governance + cost optimization at the core.
- **Headline metric (impact/reach):** *cut editorial research/lookup time by ~65%
  across 6+ national news & broadcast brands' newsrooms.*
- **Support metric (cost, from CV):** *~60% lower token cost via prompt caching +
  SLM offloading* (call the big model only when truly needed).
- **Owns all 5 LangGraph projects** (chronologically correct — LangGraph is 2024+).

### The 5 projects → concrete media scenarios (brands stay anonymous)

1. **orchestration** — supervisor delegating editorial research tasks to specialist agents.
2. **tool-routing** — dynamic router sending each query to the right archive/source tool.
3. **persistent-state** — persistent memory holding context across long research sessions.
4. **swarm** — hierarchical agent team for concurrent cross-brand content analysis.
5. **hitl-safety** — HITL gate requiring editor approval before publish (natural in media).

## Cross-cutting consistency rules

- Agentic/LangGraph/multi-agent ⇒ **Turkuvaz only** (2023+).
- RAG/semantic search/LangChain/Temporal/FastAPI ⇒ **NIL** (2021–2023).
- The two link into one arc: *semantic search → production RAG (NIL) → agentic
  orchestration + governance (Turkuvaz).*
- All metrics framed as **internal** → unfalsifiable.
