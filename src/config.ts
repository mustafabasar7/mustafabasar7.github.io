export const config = {
    developer: {
        name: "Mustafa",
        fullName: "Mustafa Başar",
        title: "AI Solutions Engineer",
        description: "AI Solutions Engineer building stateful multi-agent systems with LangGraph, HITL governance, and token-efficient routing."
    },
    social: {
        github: "mustafabasar7",
        email: "mustafa.r.basar@gmail.com",
        location: "Istanbul, TR"
    },
    about: {
        title: "About Me",
        description: "I build production multi-agent systems with LangGraph — combining stateful orchestration, human-in-the-loop safety, and token-efficient model routing."
    },
    experiences: [
        {
            position: "AI Solutions Engineer",
            company: "Turkuvaz Medya Grubu",
            period: "2023 - Present",
            location: "Istanbul, TR",
            description: "Multi-agent knowledge layer across 6+ national media brands — ~65% faster research, ~60% lower token cost.",
            responsibilities: [
                "Built an interactive knowledge layer across 6+ national news & broadcast brands via a LangGraph multi-agent ecosystem",
                "Cut editorial research and lookup time ~65% across newsrooms with state-aware agent orchestration",
                "Implemented HITL governance nodes to enforce editor approval before publish",
                "Reduced token cost ~60% with prompt caching and SLM offloading - calling the frontier model only when truly needed"
            ],
            technologies: ["LangGraph", "Multi-Agent Systems", "HITL Governance", "State Machines", "Prompt Caching"]
        },
        {
            position: "Founding AI Engineer",
            company: "Neural Intelligence Labs",
            period: "2021 - 2023",
            location: "Istanbul, TR",
            description: "Durable Temporal + RAG pipelines across 12+ enterprise sources — ~70% less reprocessing, ~90%+ grounding accuracy.",
            responsibilities: [
                "Built a Temporal-backed durable RAG ingestion pipeline; resumable runs cut reprocessing time ~70% after failures",
                "Indexed ~12 heterogeneous document sources with semantic search for cross-source consistency",
                "Reached ~90%+ retrieval grounding accuracy (internal eval), serving answers through FastAPI",
                "Owned the retrieval architecture end-to-end as an early engineer before the team wound down in 2023"
            ],
            technologies: ["RAG", "Semantic Search", "LangChain", "Temporal", "FastAPI"]
        }
    ],
    projects: [
        {
            id: 1,
            title: "Autonomous Multi-Agent Orchestration",
            category: "Agentic AI",
            technologies: "LangGraph, Python, Multi-Agent Systems",
            image: "/images/proj-1.svg",
            description: "Supervisor-worker task decomposition and state coordination."
        },
        {
            id: 2,
            title: "Context-Aware Dynamic Tool Routing",
            category: "Agentic AI",
            technologies: "LangGraph, Python, Adaptive RAG",
            image: "/images/proj-2.svg",
            description: "Intent-driven real-time tool and model routing."
        },
        {
            id: 3,
            title: "Persistent Memory & Agentic State",
            category: "Agentic AI",
            technologies: "LangGraph, State Machines, Python",
            image: "/images/proj-3.svg",
            description: "Checkpointed memory across long-running workflows."
        },
        {
            id: 4,
            title: "Hierarchical Swarm Coordination",
            category: "Multi-Agent Systems",
            technologies: "LangGraph, Multi-Agent Systems, Python",
            image: "/images/proj-4.svg",
            description: "Parallel fan-out and synchronization for agent swarms."
        },
        {
            id: 5,
            title: "Adaptive HITL Safety Protocols",
            category: "AI Governance",
            technologies: "HITL Governance, LangGraph, Python",
            image: "/images/proj-5.svg",
            description: "Human-in-the-loop approval gates for high-risk actions."
        },
        {
            id: 6,
            title: "Durable RAG Document Intelligence",
            category: "Retrieval / RAG",
            technologies: "RAG, Temporal, LangChain, FastAPI",
            image: "/images/proj-6.svg",
            description: "Resumable Temporal + RAG ingestion with cited answers."
        }
    ],
    contact: {
        email: "mustafa.r.basar@gmail.com",
        github: "https://github.com/mustafabasar7",
        linkedin: "https://www.linkedin.com/in/mustafa-basar7"
    },
    skills: {
        develop: {
            title: "AGENTIC AI",
            description: "Multi-agent orchestration & governance",
            details: "Supervisor graphs, checkpointed memory, dynamic routing, and HITL gates.",
            tools: ["LangGraph", "LangChain", "Multi-Agent Systems", "HITL Governance", "State Machines", "Adaptive RAG", "Context Engineering", "Python"]
        },
        design: {
            title: "AI PLATFORM",
            description: "Production AI systems & tooling",
            details: "Observability, evals, model routing, and durable execution.",
            tools: ["OpenAI Agents SDK", "Vercel AI SDK", "Haystack", "LiteLLM", "Langfuse", "OpenTelemetry", "Temporal", "FastAPI", "Next.js"]
        }
    }
};
