// Portable Web-standard serverless function. Runs on the Edge runtime (Web
// Request/Response + streaming) — the same shape as Cloudflare Workers / Deno, so
// it stays portable if this ever moves off Vercel. It proxies DeepSeek
// (OpenAI-compatible) so the API key never reaches the browser, and streams
// plain-text tokens back to the client.
//
// Personas are grounded in real LangChain / LangGraph behaviour (pulled via
// Context7) so every live demo stays technically accurate.

export const config = { runtime: "edge" };

interface Persona {
  name: string;
  capability: string;
  grounding: string;
  defaultTask: string;
}

// Home "How I orchestrate" agents (the 3D robots).
const AGENT_PERSONAS: Persona[] = [
  {
    name: "Security Agent",
    capability:
      "human-in-the-loop governance: pausing autonomous agents for approval before sensitive actions, enforcing auditability and safety",
    grounding:
      "LangGraph human-in-the-loop: interrupt() pauses the graph before a sensitive action and surfaces a payload describing it for a human to approve; the run resumes via Command(resume=...), routing to proceed or cancel, so nothing irreversible runs unattended. Mustafa builds HITL governance nodes for auditability.",
    defaultTask: "Review a tool call that will delete 3M production media assets.",
  },
  {
    name: "Document Analyst Agent",
    capability:
      "retrieval-augmented document intelligence: semantic indexing and vector retrieval over large document sets",
    grounding:
      "Retrieval-augmented generation: semantically index sources into a vector store, then retrieve only the passages that ground an answer instead of stuffing whole files into context. Durable ingestion with Temporal keeps sources consistent. Mustafa cut media-asset retrieval time roughly 40%.",
    defaultTask: "Find the data-retention policy across 12k ingested media documents.",
  },
  {
    name: "Tester Agent",
    capability:
      "verifying agent outputs and running the pipeline cheaply via prompt caching and small-model (SLM) offloading / model routing",
    grounding:
      "Prompt caching reuses stable prompt prefixes (system prompt, tool definitions) so the model skips recomputing tokens it has already seen — lower input cost and latency. SLM offloading / the Router pattern sends simple steps to a smaller, cheaper model, reserving the frontier model for hard reasoning (about 5 calls / 9K tokens versus 7+ calls / 14K for naive handoffs). The tester then evaluates the outputs for quality.",
    defaultTask: "Run and cost-optimize a 40-step summarization pipeline.",
  },
];

// /myworks project demos — one persona per project card.
const PROJECT_PERSONAS: Persona[] = [
  {
    name: "Autonomous Multi-Agent Orchestration",
    capability: "supervisor-driven task decomposition across specialized worker agents",
    grounding:
      "LangGraph Supervisor: a central supervisor agent coordinates specialized agents, delegating through tool-based handoff — a handoff tool returns a Command that routes to the target agent, optionally carrying a task description and updated state. Send enables parallel dispatch of multiple workers, and supervisors can be nested for multi-level hierarchies.",
    defaultTask: "Decompose 'publish a vetted breaking-news article' across the agent team.",
  },
  {
    name: "Context-Aware Dynamic Tool Routing",
    capability: "real-time routing of each step to the right capability based on state and intent",
    grounding:
      "Router pattern: an LLM inspects current state and user intent, then routes each step to the right capability instead of a fixed toolchain, and invokes agents in parallel — about 5 model calls and ~9K tokens, more efficient than sequential handoffs (7+ calls, 14K+ tokens).",
    defaultTask: "Route a mixed request: summarize a PDF, then check it for policy violations.",
  },
  {
    name: "Persistent Memory & Agentic State",
    capability: "durable state persistence so long-horizon agents retain memory and resume cleanly",
    grounding:
      "LangGraph persistence: compile the graph with a checkpointer (InMemorySaver in tests, a durable store in production) and run with a thread_id; state is saved at every step, so a long-running task can pause and resume cleanly while retaining memory across steps.",
    defaultTask: "Resume a 3-day ingestion workflow exactly where it was interrupted.",
  },
  {
    name: "Hierarchical Swarm Coordination",
    capability: "structuring how large decentralized agent ecosystems divide and synchronize work",
    grounding:
      "langgraph-swarm: specialized agents dynamically hand off control to one another and resume conversations through handoff tools; combined with multi-level supervisor hierarchies, this structures how large, decentralized agent swarms divide and synchronize work.",
    defaultTask: "Coordinate 20 agents indexing 50 media brands without collisions.",
  },
  {
    name: "Adaptive HITL Safety Protocols",
    capability: "safety-focused interruption that preserves human agency inside automated systems",
    grounding:
      "LangGraph human-in-the-loop: interrupt() pauses the graph before a sensitive action and surfaces a payload for approval; resume with Command(resume=...) to proceed or cancel — enforcing auditability and keeping a human in control of irreversible steps.",
    defaultTask: "Gate an automated mass-unpublish action behind human approval.",
  },
];

function systemPrompt(p: Persona): string {
  return [
    `You are "${p.name}", a live demo in Mustafa Başar's AI-engineering portfolio.`,
    `Capability: ${p.capability}.`,
    `Grounding facts (stay technically accurate, never contradict these): ${p.grounding}`,
    "When given a task, answer in first person as this specialist in two short paragraphs, under 130 words total:",
    "(1) one sentence on how the technique works; (2) demonstrate concretely on the user's task.",
    "Confident, specific, technical but readable. Plain prose only — no markdown headings, no bullet characters.",
  ].join(" ");
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return new Response("missing DEEPSEEK_API_KEY", { status: 503 });
  }

  let set = "agent";
  let role = 0;
  let task = "";
  try {
    const body = (await req.json()) as { set?: unknown; role?: unknown; task?: unknown };
    set = body.set === "project" ? "project" : "agent";
    role = Number(body.role);
    task = String(body.task ?? "").slice(0, 600);
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const personas = set === "project" ? PROJECT_PERSONAS : AGENT_PERSONAS;
  if (!Number.isInteger(role) || role < 0 || role >= personas.length) {
    return new Response("bad role", { status: 400 });
  }

  const persona = personas[role];
  const userTask = task.trim() || persona.defaultTask;

  let upstream: Response;
  try {
    upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        stream: true,
        temperature: 0.5,
        max_tokens: 260,
        messages: [
          { role: "system", content: systemPrompt(persona) },
          { role: "user", content: userTask },
        ],
      }),
    });
  } catch {
    return new Response("upstream unreachable", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("upstream error", { status: 502 });
  }

  // Re-stream DeepSeek's SSE as plain text tokens.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // ignore keep-alive lines / partial JSON
            }
          }
        }
      } catch {
        // network hiccup — close with whatever streamed so far
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
