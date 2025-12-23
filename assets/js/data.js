const PROJECTS = [
    {
        title: "CNN Cardiac Rhythm Classification",
        summary: "Built a convolutional neural network for cardiac rhythm classification on imbalanced clinical ECG data. Emphasized preprocessing, class imbalance handling, and failure inspection through saliency analysis rather than treating accuracy as the sole success metric.",
        tags: [
            "Python",
            "Deep Learning",
            "Applied ML",
            "Failure-Aware Design"
        ],
        span: "span-4"
    }

    ,
    {
        title: "ECG Ischemia Prediction (MLP Study)",
        summary: "Explored the limits of shallow, deep, and residual MLP architectures for ECG ischemia classification across multiple clinical datasets. Emphasized empirical comparison, convergence behavior, and identifying when model complexity is insufficient for richer ECG representations.",
        tags: [
            "Python",
            "Applied ML",
            "Clinical Signals",
            "Failure-Aware Design"
        ],
        span: "span-4"
    }
    ,
    {
        title: "QUIC Protocol Prototype",
        summary: "Designed a stateful application-layer protocol over QUIC as a proof of concept, defining explicit PDUs and a deterministic finite-state machine for client–server interaction. Emphasized message framing, state progression, and correctness over security hardening or production readiness.",
        tags: [
            "Networking",
            "Protocols",
            "Systems Design",
            "Failure-Aware Design"
        ],
        span: "span-4"
    }

    ,
    {
        title: "Schedule Templater",
        summary: "Designed a constraint-driven scheduling system where globally optimal solutions are impractical. Emphasized feasibility, constraint enforcement, and systematic repair using greedy initialization, simulated annealing, and post-processing recovery phases.",
        tags: [
            "Python",
            "Optimization",
            "Systems Design",
            "Failure-Aware Design"
        ],
        span: "span-4"
    }

    ,
    {
        title: "Scheduler (Workflow Integration)",
        summary: "Built a workflow layer that maps abstract scheduling templates onto real calendar structures, producing formatted, operational artifacts for end users. Emphasized correctness, repeatability, and separation between planning logic and execution.",
        tags: [
            "Python",
            "Workflow Engineering",
            "Systems Design"
        ],
        span: "span-4"
    }

    ,
    {
        title: "SynapSys",
        summary: "A failure-aware LLM orchestration framework that enforces structured execution, validation, and bounded local repair around probabilistic model output. Designed to make parsing, validation, and recovery explicit system concerns rather than assumed happy paths.",
        tags: [
            "Java",
            "Spring Boot",
            "LLM Orchestration",
            "Systems Design",
            "Failure-Aware Architecture"
        ],
        span: "span-8",
        spotlight: true,
        github: "https://github.com/dmeverly/synapsys"
    }
    ,
    {
        title: "Portfolio Chatbot",
        summary: "A reference implementation demonstrating controlled, policy-gated LLM interaction using SynapSys. Incorporates retrieval-augmented prompting, pre-LLM short-circuit guards, and post-LLM output validation to enforce explicit trust boundaries in a user-facing system.",
        tags: [
            "Java",
            "Spring Boot",
            "RAG",
            "Guardrails",
            "Trust Boundaries",
            "Applied AI Systems"
        ],
        span: "span-4",
        spotlight: true,
        github: "https://github.com/dmeverly/portfolio-chatbot-public"
    }
    ,
];
