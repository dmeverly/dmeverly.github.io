const PROJECTS = [
    {
        title: "CNN Cardiac Rhythm Classification",
        summary: "Built a convolutional neural network for cardiac rhythm classification on imbalanced clinical ECG data. Emphasized preprocessing, class imbalance handling, and " +
            "failure inspection through saliency analysis.",
        generalSummary: "Built a system that reads cardiac rhythm from ECG tracings using a more complex model on more complex data to compare the performance to that of simpler models. ",
        tags: [
            "Python",
            "Deep Learning",
            "Applied ML"
        ],
        span: "span-4",
        github: "https://github.com/dmeverly/CNN-Cardiac-Rhythm-Classification"
    }

    ,
    {
        title: "ECG Ischemia Prediction",
        summary: "Exploratory project on the limitations of shallow, deep, and residual MLP architectures for ECG ischemia classification across multiple clinical datasets. " +
            "Emphasized empirical comparison, convergence behavior, and identifying when model complexity is insufficient for improving performance.",
        generalSummary: "Built a system that reads cardiac rhythm from ECG tracing using simpler models to determine whether chaining of simpler models is sufficient to improve model performance. ",
        tags: [
            "Python",
            "Deep Learning",
            "Applied ML"
        ],
        span: "span-4",
        github: "https://github.com/dmeverly/ECG-Ischemia-Prediction"
    }
    ,
    {
        title: "QUIC Protocol Prototype",
        summary: "Designed a stateful application-layer protocol over QUIC as a proof of concept, defining explicit PDUs and a deterministic finite-state machine for client–server interaction. " +
            "Emphasized message framing, state progression, and correctness over security hardening or production readiness.",
        generalSummary: "Explored how to create a communication protocol that connects computers between networks in a way that is secure and reliable.",
        tags: [
            "Networking",
            "Protocols",
            "Systems Design"
        ],
        span: "span-4",
        github: "https://github.com/dmeverly/QUIC-Protocol-Prototype"
    }

    ,
    {
        title: "Schedule Templater",
        summary: "Designed a constraint-driven scheduling system where globally optimal solutions are impractical. Emphasized feasibility, constraint enforcement, " +
            "and systematic repair using greedy initialization, simulated annealing, and post-processing recovery phases.",
        generalSummary: "Created a scheduling system that uses machine learning to generate schedules that meet the most individual's needs possible when those needs are in conflict with general organizational needs and the needs of others.",
        tags: [
            "Python",
            "Applied ML",
            "Optimization",
            "Systems Design"
        ],
        span: "span-4",
        github: "https://github.com/dmeverly/ScheduleTemplater"
    }

    ,
    {
        title: "Scheduler",
        summary: "Built a workflow layer that maps abstract scheduling templates onto real calendar structures, producing formatted, operational artifacts for end users. " +
            "Emphasized correctness, repeatability, and separation between planning logic and execution.",
        generalSummary: "Created a system that takes a recurring employee scheduling template and maps it to a real calendar.",
        tags: [
            "Python",
            "Workflow Engineering",
            "Systems Design"
        ],
        span: "span-4",
        github: "https://github.com/dmeverly/Scheduler"
    }

    ,
    {
        title: "SynapSys",
        summary: "LLM orchestration framework that enforces structured execution, validation, and bounded local repair around probabilistic model output. " +
            "Designed to make parsing, validation, and recovery explicit system concerns rather than assumed happy paths.",
        generalSummary: "Created a system that other applications can use to create customized LLM models (like ChatGPT or Gemini) easily and securely without the need to deeply understand the differences between the model provider's API.",
        tags: [
            "Java",
            "Spring Boot",
            "LLM Orchestration",
            "Systems Design",
            "Applied AI Systems",
            "Trust Boundaries"
        ],
        span: "span-8",
        spotlight: true,
        github: "https://github.com/dmeverly/SynapSys"
    }
    ,
    {
        title: "Everlybot",
        summary: "A reference implementation demonstrating controlled, policy-gated LLM interaction using SynapSys. Incorporates retrieval-augmented prompting, " +
            "pre-LLM short-circuit guards, and post-LLM output validation to enforce explicit trust boundaries in a user-facing system.",
        generalSummary: "Created a demo of a chatbot system that uses SynapSys to interact with users and present information about my portfolio.",
        tags: [
            "TypeScript",
            "RAG",
            "Guardrails",
            "Trust Boundaries",
            "Applied AI Systems"
        ],
        span: "span-4",
        spotlight: true,
        github: "https://github.com/dmeverly/everlybot"
    }
    ,
];
