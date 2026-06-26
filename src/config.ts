export const config = {
    developer: {
        name: "Mustafa",
        fullName: "Mustafa Başar",
        title: "AI Solutions Engineer",
        description: "AI Solutions Engineer focused on agentic orchestration and governance. I build state-aware multi-agent systems with LangGraph, add human-in-the-loop controls for auditability and safety, and drive token efficiency through prompt caching and SLM offloading."
    },
    social: {
        github: "mustafabasar7",
        email: "mustafa.r.basar@gmail.com",
        location: "Istanbul, TR"
    },
    about: {
        title: "About Me",
        description: "I'm an AI Solutions Engineer specializing in production-grade autonomous systems. My focus is the orchestration logic - the brain layer that handles state, memory, and multi-agent coordination for enterprise-scale agentic workflows. I design state-aware multi-agent systems with LangGraph, enforce auditability and safety through human-in-the-loop governance, and optimize cost with prompt caching and SLM offloading."
    },
    experiences: [
        {
            position: "AI Solutions Engineer",
            company: "Turkuvaz Medya Grubu",
            period: "2023 - Present",
            location: "Istanbul, TR",
            description: "Building an interactive knowledge layer across multiple media brands through a LangGraph-based multi-agent ecosystem, with governance and cost optimization at the core.",
            responsibilities: [
                "Built an interactive knowledge layer across multiple media brands via a LangGraph multi-agent ecosystem",
                "Delivered production-grade state-machine orchestration for multi-step agent workflows",
                "Implemented HITL governance nodes to enforce auditability in autonomous workflows",
                "Improved cost efficiency with prompt caching and SLM offloading"
            ],
            technologies: ["LangGraph", "Multi-Agent Systems", "HITL Governance", "State Machines", "Prompt Caching"]
        },
        {
            position: "AI Solutions Engineer",
            company: "Neural Intelligence Labs",
            period: "2021 - 2023",
            location: "Istanbul, TR",
            description: "Built retrieval-augmented architectures and state-aware agent components for enterprise document intelligence, with durable distributed pipelines.",
            responsibilities: [
                "Built retrieval-augmented architectures and semantic indexing for document intelligence",
                "Designed state-aware agent components for complex reasoning at production scale",
                "Deployed durable ingestion pipelines with Temporal for cross-source consistency"
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
            description: "A blueprint for decomposing complex tasks: a central supervisor delegates to specialized worker nodes, coordinating state and results across the swarm."
        },
        {
            id: 2,
            title: "Context-Aware Dynamic Tool Routing",
            category: "Agentic AI",
            technologies: "LangGraph, Python, Adaptive RAG",
            image: "/images/proj-2.svg",
            description: "Real-time tool selection driven by latent context and user intent, routing each step to the right capability instead of a fixed toolchain."
        },
        {
            id: 3,
            title: "Persistent Memory & Agentic State",
            category: "Agentic AI",
            technologies: "LangGraph, State Machines, Python",
            image: "/images/proj-3.svg",
            description: "Durable state persistence across long-horizon task execution, so agents retain memory and resume cleanly over multi-step workflows."
        },
        {
            id: 4,
            title: "Hierarchical Swarm Coordination",
            category: "Multi-Agent Systems",
            technologies: "LangGraph, Multi-Agent Systems, Python",
            image: "/images/proj-4.svg",
            description: "Coordination models for large-scale decentralized agent ecosystems, structuring how hierarchical swarms divide and synchronize work."
        },
        {
            id: 5,
            title: "Adaptive HITL Safety Protocols",
            category: "AI Governance",
            technologies: "HITL Governance, LangGraph, Python",
            image: "/images/proj-5.svg",
            description: "Safety-focused interruption patterns that preserve human agency inside complex automated systems, enforcing auditability and control."
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
            details: "Designing state-aware multi-agent systems with LangGraph - supervisor patterns, persistent memory, dynamic tool routing, and HITL governance for auditable, safe autonomous workflows.",
            tools: ["LangGraph", "LangChain", "Multi-Agent Systems", "HITL Governance", "State Machines", "Adaptive RAG", "Context Engineering", "Python"]
        },
        design: {
            title: "AI PLATFORM",
            description: "Production AI systems & tooling",
            details: "Shipping reliable AI platforms with the modern agentic stack - observability, evaluation, model routing, and durable orchestration across distributed services.",
            tools: ["OpenAI Agents SDK", "Vercel AI SDK", "Haystack", "LiteLLM", "Langfuse", "OpenTelemetry", "Temporal", "FastAPI", "Next.js"]
        }
    }
};
