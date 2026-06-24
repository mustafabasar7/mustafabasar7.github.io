// Agent + project roster for the interactive multi-agent show.
//
// Each entry maps to a real capability from Mustafa's CV, grounded in LangChain /
// LangGraph documentation (pulled via Context7). When the backend (/api/agent) is
// reachable, dispatching streams a *live* DeepSeek response. With no backend (e.g.
// a plain static build) the same entries fall back to doc-grounded canned demos —
// so the show works on any host.
//
// streamAgent() also caches responses: re-running an identical request replays
// instantly and reports "cached" — a real, observable prompt-caching demo.

export interface AgentMeta {
  /** Short label used on the 3D scene + chips. */
  short: string;
  /** Full display name in the transcript. */
  name: string;
  /** One-line capability summary. */
  tagline: string;
  /** Stat chips that visualize the (often invisible) technique when the agent runs. */
  metrics: string[];
  /** Task injected when the agent is dispatched with no typed task. */
  defaultTask: string;
  /** Keywords used to route a free-text task to this agent. */
  keywords: string[];
  /** Doc-grounded demonstration used when no live backend is available. */
  fallback: string;
}

export const AGENTS: AgentMeta[] = [
  {
    short: "Security",
    name: "Security Agent",
    tagline: "HITL governance — pauses for human approval before risky actions",
    metrics: ["interrupt() fired", "awaiting human approval", "0 irreversible actions"],
    defaultTask: "Review a tool call that will delete 3M production media assets.",
    keywords: ["secur", "safe", "safety", "govern", "approve", "approval", "audit", "hitl", "human", "review", "risk", "threat", "attack", "auth", "protect", "delete", "halt", "interrupt", "policy"],
    fallback:
      "As the security agent I run a human-in-the-loop governance node. Before any sensitive action executes, I call LangGraph's interrupt() to pause the graph and surface the exact payload — what's about to happen and why — for a human to approve. Execution only continues when you resume with Command(resume=...), routing to proceed or cancel, so nothing irreversible fires unattended. For your task: deleting 3M production assets is precisely the class of action I halt — I'd freeze the run, show the target set and blast radius, and require explicit sign-off, keeping the whole decision auditable. This is how Mustafa enforces safety and auditability in autonomous workflows.",
  },
  {
    short: "Document Analyst",
    name: "Document Analyst Agent",
    tagline: "Retrieval-augmented semantic search over large document sets",
    metrics: ["12,000 docs indexed", "8 passages retrieved", "retrieval 41% faster"],
    defaultTask: "Find the data-retention policy across 12k ingested media documents.",
    keywords: ["doc", "document", "retriev", "rag", "search", "index", "semantic", "summar", "analy", "extract", "knowledge", "vector", "embed", "find", "read"],
    fallback:
      "As the document analyst I run a retrieval-augmented pipeline. I semantically index every source into a vector store, then at query time retrieve only the passages that actually ground an answer instead of stuffing whole files into context. Durable ingestion with Temporal keeps sources consistent across systems. For your task: I'd embed the 12k media documents, run a semantic search for retention-policy language, and return the specific clauses with their source files — the same retrieval-augmented approach that cut media-asset retrieval time roughly 40% in Mustafa's work.",
  },
  {
    short: "Tester",
    name: "Tester Agent",
    tagline: "Verifies outputs and runs the pipeline cheaply (prompt caching + SLM offloading)",
    metrics: ["9,240 → 1,310 input tokens", "prompt cache hit", "token cost ↓ 78%"],
    defaultTask: "Run and cost-optimize a 40-step summarization pipeline.",
    keywords: ["test", "qa", "verify", "check", "bug", "lint", "eval", "run", "build", "cost", "cheap", "token", "cache", "caching", "optimize", "optimise", "offload", "slm", "route", "router", "latency", "budget", "efficien"],
    fallback:
      "As the tester I verify the workflow and keep it cheap to run. I pull two cost levers: prompt caching reuses stable prompt prefixes — the system prompt and tool definitions — so the model skips recomputing tokens it has already seen, cutting input cost and latency; and SLM offloading routes the easy steps to a smaller, cheaper model, reserving the frontier model for hard reasoning. A router pattern runs about 5 calls / 9K tokens versus 7+ calls / 14K for naive handoffs. For your 40-step pipeline: I'd cache the shared instructions once, offload the simple per-step summaries to a small model, then evaluate the outputs — typically a large cost drop with no quality loss on the easy steps.",
  },
];

export interface ProjectMeta {
  /** Route param. */
  slug: string;
  /** Matches the id in config.projects. */
  configId: number;
  name: string;
  category: string;
  /** One-line capability summary. */
  capability: string;
  /** Stat chips shown while the demo runs. */
  metrics: string[];
  /** Operation trace — lights up step by step in sync with the live action. */
  steps: string[];
  /** Ready-made robot.glb animation clips played to visualize the action. */
  clips: string[];
  /** Task used when the demo auto-runs. */
  defaultTask: string;
  /** Doc-grounded demonstration used when no live backend is available. */
  fallback: string;
  /** Ready-made GLB shown on the detail page (swap the URL to change the model). */
  modelUrl: string;
  /** Optional uniform scale override for the model. */
  modelScale?: number;
  /** Preferred animation clip name; falls back to the model's first clip. */
  clip?: string;
  /** If set, render a moving flock of these model URLs (swarm visual). */
  flock?: string[];
  /** Simulated terminal lines for the left panel (representational). */
  terminal: string[];
  /** Simulated document lines; entries wrapped in «» render as highlighted hits. */
  document: { title: string; lines: string[] };
}

/** Real, provider-reported telemetry surfaced under the live chat. */
export interface Telemetry {
  promptTokens?: number;
  completionTokens?: number;
  cacheHitTokens?: number;
  ms: number;
}

// One per /myworks project card — grounded in real LangGraph behaviour.
export const PROJECTS: ProjectMeta[] = [
  {
    slug: "orchestration",
    configId: 1,
    name: "Autonomous Multi-Agent Orchestration",
    category: "Agentic AI",
    capability: "A supervisor agent decomposes a goal and delegates to specialized workers.",
    metrics: ["supervisor → 3 workers", "tool-based handoff", "parallel Send dispatch"],
    steps: ["supervisor receives goal", "handoff → workers", "Send parallel dispatch", "results merged"],
    clips: ["Wave", "Running", "ThumbsUp"],
    defaultTask: "Decompose 'publish a vetted breaking-news article' across the agent team.",
    fallback:
      "I'm the orchestration layer. A central supervisor coordinates specialized agents, delegating through tool-based handoff — a handoff tool returns a Command that routes to the target agent with a task description, and Send dispatches multiple workers in parallel. For your task: the supervisor splits 'publish a vetted breaking-news article' into research, drafting, fact-check and compliance, hands each to the right worker, runs the independent ones in parallel, then merges results — the supervisor pattern Mustafa ships for multi-step agent workflows.",
    modelUrl: "/models/lib/Soldier.glb",
    clip: "Walk",
    terminal: [
      "$ langgraph run supervisor.py",
      "→ decompose goal into 4 subtasks",
      "→ handoff: research_agent",
      "→ handoff: draft_agent   (Send · parallel)",
      "→ handoff: factcheck_agent",
      "✓ results merged · 1 graph run",
    ],
    document: {
      title: "task_spec.md",
      lines: [
        "Goal: publish a vetted breaking-news article",
        "1. «research» sources and verify claims",
        "2. «draft» the article copy",
        "3. «fact-check» every claim",
        "4. «compliance» review before publish",
      ],
    },
  },
  {
    slug: "tool-routing",
    configId: 2,
    name: "Context-Aware Dynamic Tool Routing",
    category: "Agentic AI",
    capability: "An LLM routes each step to the right capability based on state and intent.",
    metrics: ["intent-routed", "~5 calls / 9K tokens", "no fixed toolchain"],
    steps: ["inspect state + intent", "route to capability", "parallel tool calls", "return result"],
    clips: ["Walking", "Yes", "Running"],
    defaultTask: "Route a mixed request: summarize a PDF, then check it for policy violations.",
    fallback:
      "I'm the dynamic router. Instead of a fixed toolchain, an LLM inspects the current state and user intent and routes each step to the right capability, then invokes agents in parallel — about 5 model calls and ~9K tokens, more efficient than sequential handoffs. For your task: I'd recognize two intents, route the PDF to the summarizer and the result to the policy checker, run what I can in parallel, and return one merged answer — real-time routing driven by latent context, not a hardcoded pipeline.",
    modelUrl: "/models/lib/Fox.glb",
    clip: "Run",
    terminal: [
      "$ langgraph run router.py",
      "→ inspect state + user intent",
      "→ route → summarizer_tool",
      "→ route → policy_checker_tool",
      "→ parallel tool calls",
      "✓ 5 calls · ~9K tokens",
    ],
    document: {
      title: "request.json",
      lines: [
        "{",
        "  intent_1: '«summarize» the PDF',",
        "  intent_2: '«check» policy compliance'",
        "}",
        "→ routed, not hardcoded",
      ],
    },
  },
  {
    slug: "persistent-state",
    configId: 3,
    name: "Persistent Memory & Agentic State",
    category: "Agentic AI",
    capability: "Durable state persistence so long-horizon agents resume cleanly.",
    metrics: ["checkpointer + thread_id", "resume after pause", "memory across steps"],
    steps: ["load checkpointer", "run with thread_id", "pause / interrupt", "resume from saved state"],
    clips: ["Sitting", "Standing", "Yes"],
    defaultTask: "Resume a 3-day ingestion workflow exactly where it was interrupted.",
    fallback:
      "I'm the persistence layer. The graph is compiled with a checkpointer and run under a thread_id, so state is saved at every step and a long-running task can pause and resume cleanly while retaining memory. For your task: the 3-day ingestion run is checkpointed continuously; after an interruption I reload the saved state for its thread_id and continue from the exact step it stopped on — no re-processing, no lost context. This is how Mustafa keeps long-horizon agents durable.",
    modelUrl: "/models/lib/BrainStem.glb",
    modelScale: 1.6,
    terminal: [
      "$ checkpointer = SqliteSaver(...)",
      "$ graph.invoke(state, thread_id='job-42')",
      "… step 18/40 · interrupted",
      "$ graph.invoke(None, thread_id='job-42')",
      "→ restored from checkpoint",
      "✓ resumed at step 18",
    ],
    document: {
      title: "checkpoint.db",
      lines: [
        "thread_id: job-42",
        "step: «18 / 40»",
        "memory: 12 docs · 3 entities",
        "status: «resumable»",
      ],
    },
  },
  {
    slug: "swarm",
    configId: 4,
    name: "Hierarchical Swarm Coordination",
    category: "Multi-Agent Systems",
    capability: "Structuring how large decentralized agent swarms divide and synchronize work.",
    metrics: ["dynamic handoff", "multi-level hierarchy", "decentralized swarm"],
    steps: ["spawn swarm", "dynamic handoffs", "multi-level hierarchy", "synchronize work"],
    clips: ["Running", "Jump", "Dance"],
    defaultTask: "Coordinate 20 agents indexing 50 media brands without collisions.",
    fallback:
      "I'm the swarm coordinator. Specialized agents dynamically hand off control to one another and resume conversations through handoff tools; combined with multi-level supervisor hierarchies, this structures how a large, decentralized swarm divides and synchronizes work. For your task: I'd shard the 50 media brands across 20 agents under sub-supervisors, let agents hand off edge cases to specialists, and synchronize state so nobody double-indexes — coordination models for decentralized agent ecosystems.",
    modelUrl: "/models/lib/Parrot.glb",
    flock: ["/models/lib/Parrot.glb", "/models/lib/Flamingo.glb", "/models/lib/Stork.glb"],
    terminal: [
      "$ langgraph-swarm up --agents 20",
      "→ shard 50 brands → 20 agents",
      "→ handoff: agent_07 → specialist",
      "→ sub-supervisor sync",
      "✓ 0 collisions",
    ],
    document: {
      title: "shard_map.yaml",
      lines: [
        "brands: «50»",
        "agents: «20»",
        "strategy: hierarchical",
        "handoff: dynamic",
        "collisions: «0»",
      ],
    },
  },
  {
    slug: "hitl-safety",
    configId: 5,
    name: "Adaptive HITL Safety Protocols",
    category: "AI Governance",
    capability: "Safety-focused interruption that preserves human agency inside automation.",
    metrics: ["interrupt() gate", "Command(resume=...)", "auditable + reversible"],
    steps: ["reach sensitive action", "interrupt() — pause", "await human approval", "Command(resume)"],
    clips: ["No", "ThumbsUp"],
    defaultTask: "Gate an automated mass-unpublish action behind human approval.",
    fallback:
      "I'm the HITL safety protocol. Before a sensitive action runs, interrupt() pauses the graph and surfaces a payload for approval; the run only continues when you resume with Command(resume=...), routing to proceed or cancel — preserving human agency and auditability. For your task: the automated mass-unpublish hits my gate, freezes, and waits for a human to approve or reject with the full context shown — safety-focused interruption patterns that keep a person in control of irreversible steps.",
    // Placeholder human until Mustafa's own exported GLB is dropped in.
    modelUrl: "/models/lib/CesiumMan.glb",
    modelScale: 1.4,
    terminal: [
      "$ graph reaches mass_unpublish",
      "⛔ interrupt() — paused",
      "→ awaiting human approval",
      "$ Command(resume='approve')",
      "✓ proceed · audit logged",
    ],
    document: {
      title: "action_review.txt",
      lines: [
        "action: «mass_unpublish»",
        "items: «128,400»",
        "impact: removes from public view",
        "decision: «awaiting human»",
      ],
    },
  },
];

export type AgentSet = "agent" | "project";
export type RunStatus = "live" | "cached" | "demo";

/** Short labels for the 3D scene + chips, in worker order. */
export const AGENT_LABELS = AGENTS.map((a) => a.short);

/** Route a free-text task to the most relevant agent by keyword match. */
export function routeTask(text: string): number {
  const t = text.toLowerCase();
  let best = -1;
  let bestScore = 0;
  AGENTS.forEach((a, i) => {
    const score = a.keywords.reduce((n, k) => (t.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best === -1 ? Math.floor(Math.random() * AGENTS.length) : best;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Sentinel byte separating the streamed text from the trailing telemetry JSON.
const SEP = "\x1e";

export interface RunResult {
  status: RunStatus;
  telemetry: Telemetry;
}

// In-memory cache so an identical re-run replays instantly (prompt-caching demo).
const responseCache = new Map<string, { text: string; telemetry: Telemetry }>();

/**
 * Stream an agent/project response one chunk at a time.
 *
 * - Identical re-runs replay from cache instantly and resolve to "cached".
 * - A successful live call resolves to "live" and surfaces DeepSeek's real
 *   token/cache usage (which cannot be faked).
 * - No backend → doc-grounded fallback, typed out, resolves to "demo".
 */
export async function streamAgent(
  set: AgentSet,
  role: number,
  task: string,
  onToken: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<RunResult> {
  const meta = set === "project" ? PROJECTS[role] : AGENTS[role];
  const resolved = (task || "").trim() || meta?.defaultTask || "";
  const key = `${set}:${role}:${resolved}`;
  const t0 = performance.now();

  const cached = responseCache.get(key);
  if (cached) {
    for (const piece of cached.text.match(/\s*\S+/g) ?? []) {
      if (signal?.aborted) break;
      onToken(piece);
      await sleep(9);
    }
    return {
      status: "cached",
      telemetry: { ...cached.telemetry, ms: Math.round(performance.now() - t0) },
    };
  }

  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set, role, task }),
      signal,
    });
    if (!res.ok || !res.body) throw new Error("no live backend");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let raw = "";
    let emitted = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
      const sep = raw.indexOf(SEP);
      const textEnd = sep === -1 ? raw.length : sep;
      if (textEnd > emitted) {
        onToken(raw.slice(emitted, textEnd));
        emitted = textEnd;
      }
    }

    const sep = raw.indexOf(SEP);
    const text = sep === -1 ? raw : raw.slice(0, sep);
    let usage: Partial<Telemetry> = {};
    if (sep !== -1) {
      try {
        usage = JSON.parse(raw.slice(sep + 1));
      } catch {
        /* ignore malformed telemetry */
      }
    }
    const telemetry: Telemetry = { ...usage, ms: Math.round(performance.now() - t0) };
    if (text.trim()) responseCache.set(key, { text, telemetry });
    return { status: "live", telemetry };
  } catch {
    const text = meta?.fallback ?? "";
    for (const piece of text.match(/\s*\S+/g) ?? []) {
      if (signal?.aborted) break;
      onToken(piece);
      await sleep(22);
    }
    return { status: "demo", telemetry: { ms: Math.round(performance.now() - t0) } };
  }
}
