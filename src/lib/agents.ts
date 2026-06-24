// Agent roster for the interactive multi-agent show.
//
// Each agent maps to a real capability from Mustafa's CV, grounded in LangChain /
// LangGraph documentation (pulled via Context7). When the backend (/api/agent) is
// reachable, clicking/dispatching an agent streams a *live* DeepSeek response. When
// there is no backend (e.g. a plain static GitHub Pages build), the same agents fall
// back to the doc-grounded `fallback` copy below — so the show works on any host.

export interface AgentMeta {
  /** Short label used on the 3D scene + chips. Keep ~1–2 words. */
  short: string;
  /** Full display name in the transcript. */
  name: string;
  /** One-line capability summary. */
  tagline: string;
  /** Short stat chips that visualize the (often invisible) technique when the agent runs. */
  metrics: string[];
  /** Task injected when the agent is clicked with no typed task. */
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

/**
 * Stream an agent's response one chunk at a time.
 *
 * Tries the live backend first; on any failure it transparently falls back to the
 * doc-grounded `fallback` copy, typed out for the same live feel. Resolves when the
 * full response has been delivered. Returns whether the response was live.
 */
export async function streamAgent(
  role: number,
  task: string,
  onToken: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<boolean> {
  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, task }),
      signal,
    });
    if (!res.ok || !res.body) throw new Error("no live backend");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) onToken(chunk);
    }
    return true;
  } catch {
    // Portable fallback — type the doc-grounded demo locally.
    const text = AGENTS[role]?.fallback ?? "";
    const pieces = text.match(/\s*\S+/g) ?? [];
    for (const piece of pieces) {
      if (signal?.aborted) return false;
      onToken(piece);
      await new Promise((r) => setTimeout(r, 22));
    }
    return false;
  }
}
