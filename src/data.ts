import {
  TechService,
  InternshipTrack,
  AcademicSupport,
  TrainingProgram,
} from "./types";

export const CORE_SERVICES: TechService[] = [
  {
    id: "web-app",
    title: "Web Application Development",
    description:
      "Robust, scalable, custom web apps built for demanding enterprise workloads and global user bases.",
    iconName: "Globe",
    category: "development",
    features: [
      "Distributed, cloud-native microservices architecture",
      "High-concurrency database configurations & replication",
      "Zero-downtime hot deployments & failover systems",
      "Enterprise security standards (OAuth 2.1, JWT, TLS 1.3)",
    ],
    technologies: [
      "React / vue.js",
      "Node.js (NestJS)",
      "Java (Spring Boot) / Python (Django / FastAPI)",
      "PostgreSQL/MySQL",
      "Docker / Kubernetes",
    ],
    enterpriseScale: "SLA backed 99.99% availability pipelines",
  },
  {
    id: "mobile-app",
    title: "Mobile App Development",
    description:
      "High-performing, native-feeling iOS & Android solutions that deliver elite user engagement.",
    iconName: "Smartphone",
    category: "development",
    features: [
      "Fluid 120Hz native animations & responsive states",
      "Robust offline-first synchronisation engines",
      "Biometric hardware-level security integrations",
      "Universal deep-linking & push notification pipelines",
    ],
    technologies: [
      "React Native",
      "Flutter",
      "Swift & Kotlin",
      "SQLite",
      "Firebase Core",
    ],
    enterpriseScale: "Architected for millions of active monthly users",
  },
  {
    id: "desktop-app",
    title: "Desktop App Development",
    description:
      "Secure, cross-platform applications featuring extreme offline performance and business automation workflows.",
    iconName: "Monitor",
    category: "development",
    features: [
      "Low-level desktop API access & peripheral driver binding",
      "Ultra-low latency multi-threaded file processors",
      "Secure background daemon processes & sync workers",
      "Native shell distribution (Windows, macOS, Linux)",
    ],
    technologies: [
      "Electron",
      "Tauri (Rust / React)",
      "C# .NET Core",
      "SQLite",
      "C++ bindings",
    ],
    enterpriseScale:
      "Lightweight native installers with automatic remote patching",
  },
  {
    id: "ux-ui",
    title: "UX/UI Design",
    description:
      "Captivating, data-informed, user-centered digital interfaces modeled for enterprise software efficiency.",
    iconName: "Palette",
    category: "design",
    features: [
      "Heuristic usability evaluations & structural site mapping",
      "Multi-platform design system engineering & handoff",
      "Atomic design pattern frameworks in Figma",
      "Interactive high-fidelity responsive click prototypes",
    ],
    technologies: [
      "Figma Enterprise",
      "Adobe CC",
      "Prototyping tools",
      "Storybook",
      "Tailwind styling",
    ],
    enterpriseScale:
      "User journey flows optimised for 40%+ completion efficiency",
  },
  {
    id: "iot-embedded",
    title: "IoT & Embedded Systems",
    description:
      "Advanced firmware engineering, smart sensor arrays, and reliable hardware-software integrations.",
    iconName: "Cpu",
    category: "ai",
    features: [
      "Custom micro-controller firmware engineering (RTOS)",
      "Low-power mesh networking & sensor array protocol",
      "Secure MQTT, CoAP, & WebSockets data pipelines",
      "Hardware diagnostic and telemetry feedback interfaces",
    ],
    technologies: [
      "C / C++",
      "FreeRTOS",
      "Raspberry Pi / ESP32",
      "Modbus & CAN Bus",
      "ARM architecture",
    ],
    enterpriseScale:
      "Industrial telemetry optimized for extreme environmental tolerance",
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    description:
      "Custom mathematical classifiers, intelligent regressors, and predictive LLM model implementations.",
    iconName: "BrainCircuit",
    category: "ai",
    features: [
      "Predictive analytics & intelligent forecasting engines",
      "Natural Language Processing (NLP) text miners",
      "Enterprise RAG (Retrieval-Augmented Generation) systems",
      "Optimized cloud model inference & orchestration",
    ],
    technologies: [
      "Python",
      "PyTorch / TensorFlow",
      "Gemini API SDK",
      "Hugging Face",
      "Pinecone Vector DB",
    ],
    enterpriseScale:
      "Real-time automated decision algorithms built for safety and scale",
  },
  {
    id: "consultancy",
    title: "IT & Technology Consultancy",
    description:
      "High-level technology advisory, system architecture reviews, and global digital transformation blueprints.",
    iconName: "ShieldCheck",
    category: "consulting",
    features: [
      "Technical audits & legacy architecture migration plans",
      "DevSecOps continuous delivery & infrastructure setup",
      "Cybersecurity risk assessment & compliance advisory",
      "Executive level technology roadmap strategies",
    ],
    technologies: [
      "AWS / GCP Arch",
      "Terraform",
      "CI/CD Pipelines",
      "OWASP Security",
      "ISO 27001 Guides",
    ],
    enterpriseScale:
      "Decades of combined technical leadership advising global corporations",
  },
  {
    id: "hardware",
    title: "Hardware Provisioning & Support",
    description:
      "Enterprise computer equipment sales, technical repairs, preventative maintenance, and physical network rollouts.",
    iconName: "ServerCrash",
    category: "hardware",
    features: [
      "Authorized corporate bulk hardware supply & rollout",
      "Server rack physical installation & cabling audits",
      "Critical component hardware diagnostic & clean repair",
      "Scheduled preventive physical maintenance SLAs",
    ],
    technologies: [
      "Cisco & MikroTik Hardware",
      "Server Rack configs",
      "Precision Micro-soldering",
      "Diagnostics tools",
    ],
    enterpriseScale:
      "On-site emergency hardware response and hot-swap provisioning",
  },
];

export const INTERNSHIP_TRACKS: InternshipTrack[] = [
  {
    id: "nit",
    title: "Virtual Internship — NIT",
    abbreviation: "Network & Internet Technology",
    tags: ["Open", "Remote", "2 Months"],
    contentSummary:
      "Master enterprise routing, switching, and firewall orchestration under the supervision of certified network engineers.",
    syllabus: [
      "Cisco IOS Command Interface & OSI Layer Routing",
      "MikroTik RouterOS Network Architectures & VPN tunnels",
      "Enterprise Firewall Policy Config, VLANs & DMZs",
      "Network Telemetry, Wireshark Packet Analysis, & Incident response",
    ],
    mentors: [
      "Silas HAKUZWIMANA, Cisco Certified Network Associate",
      "Fabrice NDAYISABA, Principal Network Architect",
    ],
    skillsAquired: [
      "Cisco Router Config",
      "Professional CISCO Packet Tracer Simulation",
      "Professional Network Design & Troubleshooting",
      "Network Hardening",
    ],
  },
  {
    id: "sod",
    title: "Virtual Internship — SOD",
    abbreviation: "Software Development",
    tags: ["Open", "Remote", "2 Months"],
    contentSummary:
      "Build high-performance, responsive full-stack applications with state-of-the-art frameworks while practicing production DevOps.",
    syllabus: [
      "Modern Frontends: React, Tailwind, TypeScript, & Advanced React Hooks",
      "Robust Backends: Express, Java (Spring Boot), Python(Django), FastAPI, RESTful APIs, & SQL schemas",
      "Asynchronous Orchestration: Redis, WebSockets, & Event Loops",
      "Enterprise DevSecOps: Docker containerisation & Cloud Run deployment",
    ],
    mentors: [
      "Magnifique NIRAGIRE, Principal Developer",
      "Silas HAKUZWIMANA, Lead Systems Architect",
    ],
    skillsAquired: [
      "React / TypeScript",
      "RESTful API Engineering",
      "Docker Containerization",
      "Database Normalization",
    ],
  },
];

export const ACADEMIC_DIVISIONS: AcademicSupport[] = [
  {
    id: "project-assistance",
    title: "Final Year Project Assistance",
    description:
      "Comprehensive engineering guidance from innovative topic selection to finalized product deliverables.",
    bullets: [
      "Collaborative topic brainstorming aligning to modern market trends",
      "Complete software architecture design including entity relations",
      "Direct code writing mentorship and regular source code reviews",
      "Academic standard thesis document write-up support (LaTeX / Word)",
    ],
    deliverables: [
      "Fully compiled project codebase",
      "Comprehensive architectural diagrams",
      "30,000+ words thesis draft",
    ],
  },
  {
    id: "system-dev",
    title: "System Development Support",
    description:
      "Technical wiring, system modeling, and production-grade setup to elevate student concepts to industry standards.",
    bullets: [
      "Relational & Vector database schema design & indexing",
      "Secure backend API frameworks with mock and live data streams",
      "Advanced frontend integration with interactive data visualisations",
      "Production cloud deployment blueprints (Docker, AWS, Google Cloud)",
    ],
    deliverables: [
      "Production-ready database migrations",
      "Interactive API documentation",
      "Live cloud deployment URL",
    ],
  },
  {
    id: "research-writing",
    title: "Research & Report Writing",
    description:
      "Structured academic assistance backing technical arguments with rigorous literature and empirical evidence.",
    bullets: [
      "State-of-the-art systemised literature review writing methodologies",
      "Structured research proposals detailing hardware/software specs",
      "Empirical methodology outlines with statistical analytics tools",
      "Strict formatting compliance (IEEE, APA, Harvard standards)",
    ],
    deliverables: [
      "Comprehensive literature matrices",
      "Methodological research proposal",
      "Formatted academic paper draft",
    ],
  },
];

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: "tvet-training",
    title: "TVET Student Training",
    audience: "TVET Student Training",
    level: "Levels 3, 4, & 5",
    duration: "6 Weeks (Intensive)",
    description:
      "Tailored educational modules specifically designed for TVET tracks to bridge classroom knowledge and enterprise-grade software and network implementations.",
    modules: [
      "Module 1: Professional Hands-on Equipment Usage & Safety Protocols",
      "Module 2: Practical Structured Cabling, Server Rack Assembly, & Patching",
      "Module 3: Introduction to Local Web Servers, DBMS, and Basic HTML/CSS Wiring",
      "Module 4: Practical Troubleshooting of LAN/WAN & Routing Interfaces",
    ],
    outcomes: [
      "Hands-on competence in physical server systems",
      "Professional certification preparation support",
      "Real-world tech project portfolio piece",
    ],
  },
  {
    id: "univ-acceleration",
    title: "University Student Technical Acceleration",
    audience: "University Student Technical Acceleration",
    level: "Advanced System Engineering",
    duration: "8 Weeks (Part-time / Immersive)",
    description:
      "Elite technical masterclasses engineered to pair with our SOD/NIT virtual tracks, propelling university students into production-ready cloud software engineering.",
    modules: [
      "Module 1: Advanced Distributed Architectures & System Scalability",
      "Module 2: High-Volume Event Streams & Vector Database Queries",
      "Module 3: Continuous Integration (CI/CD) and Automated Unit/Integration Testing",
      "Module 4: Enterprise-grade Cybersecurity Audits & Token Authentication",
    ],
    outcomes: [
      "Production-level architectural design skills",
      "Proficiency in automated deployment pipelines",
      "Direct priority channel for Solvertia Novarum full-time job openings",
    ],
  },
];

export const OFFICE_LOCATIONS = [
  {
    city: "Bugesera, Mareba (HQ)",
    address: "Bugesera, Mareba",
    phone: "+250 783 749 019",
    email: "mareba.office@solvertianovarum.com",
  },
  {
    city: "Mayange, Bugesera",
    address: " Bugesera, Mayange, Nyamata, Rwanda",
    phone: "+250 783 749 019",
    email: "mayange.office@solvertianovarum.com",
  },
  {
    city: "Kigali, Rwanda",
    address: "KN 2 Avenue, Kigali, Rwanda",
    phone: "+250 783 749 019",
    email: "kigali.office@solvertianovarum.com",
  },
];
