// Portable Web-standard serverless function — runs on Vercel Functions and any
// Web-runtime host (Cloudflare, Netlify Edge, Deno) with little/no change.
//
// It proxies DeepSeek (OpenAI-compatible) so the API key never reaches the browser,
// and streams plain-text tokens back to the client. The agent personas are grounded
// in real LangChain / LangGraph behaviour so the demo stays technically accurate.

interface Persona {
  name: string;
  capability: string;
  grounding: string;
}

const PERSONAS: Persona[] = [
  {
    name: "Security Agent",
    capability:
      "human-in-the-loop governance: pausing autonomous agents for approval before sensitive actions, enforcing auditability and safety",
    grounding:
      "LangGraph human-in-the-loop: interrupt() pauses the graph before a sensitive action and surfaces a payload describing it for a human to approve; the run resumes via Command(resume=...), routing to proceed or cancel, so nothing irreversible runs unattended. Mustafa builds HITL governance nodes for auditability.",
  },
  {
    name: "Document Analyst Agent",
    capability:
      "retrieval-augmented document intelligence: semantic indexing and vector retrieval over large document sets",
    grounding:
      "Retrieval-augmented generation: semantically index sources into a vector store, then retrieve only the passages that ground an answer instead of stuffing whole files into context. Durable ingestion with Temporal keeps sources consistent. Mustafa cut media-asset retrieval time roughly 40%.",
  },
  {
    name: "Tester Agent",
    capability:
      "verifying agent outputs and running the pipeline cheaply via prompt caching and small-model (SLM) offloading / model routing",
    grounding:
      "Prompt caching reuses stable prompt prefixes (system prompt, tool definitions) so the model skips recomputing tokens it has already seen — lower input cost and latency. SLM offloading / the Router pattern sends simple steps to a smaller, cheaper model, reserving the frontier model for hard reasoning (about 5 calls / 9K tokens versus 7+ calls / 14K for naive handoffs). The tester then evaluates the outputs for quality.",
  },
];

const DEFAULT_TASKS = [
  "Review a tool call that will delete 3M production media assets.",
  "Find the data-retention policy across 12k ingested media documents.",
  "Cut the token cost of a 40-step summarization pipeline.",
];

function systemPrompt(p: Persona): string {
  return [
    `You are the "${p.name}", a live demo agent in Mustafa Başar's AI-engineering portfolio.`,
    `Your capability: ${p.capability}.`,
    `Grounding facts (stay technically accurate, never contradict these): ${p.grounding}`,
    "When given a task, answer in first person as this specialist agent in two short paragraphs, under 130 words total:",
    "(1) one sentence on how you / the technique work; (2) demonstrate concretely on the user's task.",
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

  let role = 0;
  let task = "";
  try {
    const body = (await req.json()) as { role?: unknown; task?: unknown };
    role = Number(body.role);
    task = String(body.task ?? "").slice(0, 600);
  } catch {
    return new Response("bad request", { status: 400 });
  }
  if (!Number.isInteger(role) || role < 0 || role >= PERSONAS.length) {
    return new Response("bad role", { status: 400 });
  }

  const persona = PERSONAS[role];
  const userTask = task.trim() || DEFAULT_TASKS[role];

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
        // network hiccup — close gracefully with whatever streamed so far
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
