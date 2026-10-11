// All copy, project data and links live here.
// TODO: replace every value marked TODO with the real one.

export const site = {
  name: "Shashank Joshi",
  role: "Full-Stack Developer & AI Generalist",
  positioning:
    "I build products that ship and automations that run — for shops, studios and teams that need real results, not demos.",
  location: "Ahmedabad", // city, region and country for search live in lib/seo.ts
  timezone: "Asia/Kolkata",
  email: "shashankjoshi.imscit20@gmail.com",
  links: {
    github: "https://github.com/shashankjoshii",
    linkedin: "https://www.linkedin.com/in/shashankrjoshi/",
    // Empty = not shown. Set to "/resume.pdf" (file in /public) to bring it back.
    resume: "",
  },
};

export const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// Each project has its own authored motion moment, so each has its own visual kind.
// The two product projects break the shared template: each gets a full-width feature of its own.
export type ProjectVisual = "research-agent" | "invoice-pipeline" | "dashboard-zoom" | "brand-specimen";

export type Project = {
  id: string;
  index: string;
  name: string;
  alias?: string;
  problem: string;
  build: string;
  role: string;
  tech: string[];
  result: string;
  /** One problem → result sentence, for the features that compress the table into a facts line. */
  brief?: [problem: string, result: string];
  /** A phrase inside `result` that gets the blue selection sweep. Rationed: only where it earns it. */
  highlight?: string;
  href?: string; // TODO: live/demo links
  hrefLabel?: string;
  visual: ProjectVisual;
  image?: string;
  /** Small chip beside the kicker: a shipped product, or an automation. */
  status?: "live" | "workflow";
};

// Copy is derived from what each project actually is. No invented metrics, users or revenue.
export const projects: Project[] = [
  {
    id: "research-agent",
    index: "01",
    name: "AI Research Agent",
    problem: "Research questions have to be broken down, chased and written up by hand, every time.",
    build:
      "A planner breaks a question into angles, parallel researchers dig in, and a synthesis step writes it up. Fully local.",
    role: "Workflow design, build",
    tech: ["n8n", "Ollama", "Agentic workflows", "Prompt engineering"],
    result: "Multi-step agentic orchestration that runs without hand-holding.",
    visual: "research-agent",
    status: "workflow",
  },
  {
    id: "invoice-pipeline",
    index: "02",
    name: "Invoice Extraction Pipeline",
    problem: "Invoices arrive as documents, and the data inside gets re-typed.",
    build:
      "Drop an invoice into Drive, get structured data back out. OCR and extraction on Groq, no database in the loop.",
    role: "Automation design, build",
    tech: ["n8n", "Groq API", "OCR", "Google Drive"],
    result: "A production-shaped document pipeline built from n8n and an LLM API.",
    highlight: "document pipeline",
    visual: "invoice-pipeline",
    status: "workflow",
  },
  {
    id: "billzy",
    index: "03",
    name: "Billzy",
    alias: "formerly BizBook",
    problem:
      "Small retailers need billing, inventory and GST workflows without unnecessary complexity.",
    build: "GST invoicing and inventory ERP for kirana and retail shops.",
    role: "Product, UX, full-stack",
    tech: ["Next.js", "Supabase", "Prisma", "TypeScript"], // TODO: confirm stack
    result: "Deployed and in real use: a revenue-relevant product for small businesses.",
    brief: [
      "Kirana and retail shops need billing, stock and GST filing without the complexity",
      "deployed, and in real use by small businesses.",
    ],
    visual: "dashboard-zoom",
    status: "live",
    image: "/projects/billzy.png",
  },
  {
    id: "kiro",
    index: "04",
    name: "KIRO",
    problem: "AI tools multiply faster than anyone can keep track of them.",
    build: "A directory of 500+ AI tools, built, curated and run solo.",
    role: "Solo: design, build, curation",
    tech: ["Next.js", "Supabase", "Tailwind CSS"], // TODO: confirm stack
    result: "500+ tools catalogued, from data model to daily upkeep.",
    brief: [
      "AI tools multiply faster than anyone can keep track of them",
      "500+ catalogued and curated, from data model to daily upkeep, solo.",
    ],
    visual: "brand-specimen",
    status: "live",
    image: "/projects/kiro.png",
  },
];

/**
 * Case-study pages (/work/[slug]). Every sentence is a rewording of facts already in `projects`
 * and `invoiceStages` above: no invented metrics, users or revenue. Each answer is 30-75 words so
 * it can stand alone as a search snippet or an AI-assistant quote.
 */
export type CaseStudy = {
  /** <title>, kept under ~60 characters */
  title: string;
  /** meta description, under 160 characters */
  description: string;
  what: string;
  problem: string;
  howIntro: string;
  /** Optional numbered stages shown under "How does it work?" */
  steps?: { title: string; detail: string }[];
  stack: string;
  proves: string;
};

export const caseStudies: Record<string, CaseStudy> = {
  "research-agent": {
    title: "AI Research Agent: n8n and Ollama workflow | Shashank Joshi",
    description:
      "Agentic research workflow built with n8n and Ollama: a planner splits a question into angles, researchers work in parallel, and synthesis writes the report.",
    what: "The AI Research Agent is an agentic workflow built with n8n and Ollama that runs fully locally. A planner breaks a research question into angles, parallel researchers investigate each angle, and a synthesis step merges what they found into one written report. It was designed and built by Shashank Joshi.",
    problem:
      "Research questions have to be broken down, chased and written up by hand, every time. That repeated, multi-step work is what an agentic workflow can take over. The agent runs the whole loop, from the first question to the finished write-up, without anyone steering each step.",
    howIntro:
      "A question enters the workflow as a trigger. A planner decides which angles to investigate, three researchers work on those angles in parallel, and a synthesis step merges their results into the final report. Every step runs on local Ollama models, orchestrated by n8n.",
    steps: [
      { title: "Question", detail: "A question starts the workflow as a trigger." },
      { title: "Planner", detail: "Plans the angles worth investigating." },
      { title: "Researchers", detail: "Three researchers work the angles in parallel." },
      { title: "Synthesis", detail: "Merges the findings and writes the report." },
    ],
    stack:
      "It is built with n8n for orchestration and Ollama for local models, using agentic workflow design and prompt engineering to coordinate the planner, the researchers and the synthesis step.",
    proves:
      "Agentic AI and automation skill: multi-step orchestration across several cooperating model calls that runs without hand-holding, built from open tooling and running fully locally.",
  },
  "invoice-pipeline": {
    title: "Invoice Extraction Pipeline: n8n and Groq | Shashank Joshi",
    description:
      "An n8n and Groq workflow that reads invoices dropped into Google Drive, extracts the fields with OCR and an LLM, and writes structured data back.",
    what: "The Invoice Extraction Pipeline is an n8n workflow that turns invoices into structured data. An invoice dropped into a Google Drive folder is read with OCR, extracted by an LLM on the Groq API, validated, and written back to Drive as structured data. There is no database in the loop.",
    problem:
      "Invoices arrive as documents, and the data inside gets re-typed by hand. The pipeline removes that step: the document goes in, and the invoice number, vendor, line items, tax and total come out as consistent, structured fields.",
    howIntro:
      "Four stages run in order. Drive picks up the invoice, Groq reads and extracts it, a validation step checks and shapes the fields, and the result is written back to Drive. n8n orchestrates every hand-off, so the whole flow needs no database.",
    // steps are built from `invoiceStages` on the page, so the wording can't drift from the diagram
    stack:
      "It is built with n8n for orchestration, the Groq API for OCR and LLM extraction, and Google Drive for both input and output.",
    proves:
      "Automation depth: a production-shaped document pipeline built from n8n and an LLM API, running without a database.",
  },
  billzy: {
    title: "Billzy: GST invoicing app for retail shops | Shashank Joshi",
    description:
      "Billzy (formerly BizBook) is a deployed GST invoicing and inventory ERP for kirana and retail shops, built with Next.js, Supabase and Prisma.",
    what: "Billzy (formerly BizBook) is a GST invoicing and inventory ERP for kirana and retail shops. It covers billing, stock and GST workflows in one place and is built to stay simple for small shopkeepers. It is deployed and in real use by small businesses, and was designed and built end to end by Shashank Joshi.",
    problem:
      "Kirana and retail shops need billing, stock tracking and GST workflows without unnecessary complexity. Billzy brings those jobs together in one simple tool, so a small shop can keep its invoices and its inventory in the same place.",
    howIntro:
      "Billzy is a web application for GST invoicing and inventory. Shashank handled the product thinking and UX as well as the full-stack build, working across the interface, the backend and the data layer, and it is now deployed and in use.",
    stack:
      "Billzy is built with Next.js and TypeScript on the front end, with Supabase and Prisma behind it.",
    proves:
      "That Shashank ships real, revenue-relevant products for small businesses: a deployed application in real use, not a demo.",
  },
  kiro: {
    title: "KIRO: a directory of 500+ AI tools | Shashank Joshi",
    description:
      "KIRO is a directory of 500+ AI tools, designed, built and curated solo by Shashank Joshi with Next.js, Supabase and Tailwind CSS.",
    what: "KIRO is a directory of 500+ AI tools, designed, built, curated and run solo by Shashank Joshi. It covers the whole life of the product, from the data model and the interface to the daily upkeep of the catalogue, with one person responsible for all of it.",
    problem:
      "AI tools multiply faster than anyone can keep track of them. KIRO collects more than 500 of them in a single directory, curated and maintained by one person, so there is one place to look instead of many.",
    howIntro:
      "KIRO is a Next.js web application backed by Supabase. Shashank designed the interface, modelled the data, built the application and keeps the catalogue up to date himself, which is why the project spans everything from the data model to daily upkeep.",
    stack: "KIRO is built with Next.js, Supabase and Tailwind CSS.",
    proves:
      "Scale and independent execution: a 500+ tool catalogue built, curated and kept current by one person.",
  },
};

/** The four stages of the invoice pipeline, in the order a document travels. */
export const invoiceStages = [
  {
    phase: "Input",
    title: "Drive",
    detail: "An invoice lands in a Drive folder and n8n picks it up.",
  },
  {
    phase: "Process",
    title: "Groq OCR and extraction",
    detail:
      "The document is read and an LLM extracts the invoice number, vendor, line items, tax and total.",
  },
  {
    phase: "Transform",
    title: "Validate",
    detail: "Fields are checked and shaped into one consistent structure.",
  },
  {
    phase: "Output",
    title: "Drive",
    detail: "Structured data is written back to Drive. No database in the loop.",
  },
];

export const process = {
  title: "How I build",
  steps: [
    {
      title: "Start with the problem",
      body: "Who is this for, and what does it replace? Everything after follows from a clear answer.",
    },
    {
      title: "Design the system",
      body: "Complex products become easier to use when the underlying system is clear.",
    },
    {
      title: "Build the interface",
      body: "Type, spacing and motion are the first impression. Details are where trust starts.",
    },
    {
      title: "Automate the boring",
      body: "Anything repetitive gets a workflow: n8n, a model and a hand-off, not another tab to check.",
    },
    {
      title: "Ship the useful",
      body: "Small, real and in use beats large and imagined. Ship, watch, refine.",
    },
  ],
};

export const about = {
  // Plain third-person summary: who, what, where, stack. Shown on the page and reused by llms.txt
  // and the JSON-LD description, so search engines and AI assistants read the same facts.
  summary:
    "Shashank Joshi is a full-stack developer based in Ahmedabad, India. He builds with Next.js, TypeScript, Supabase and Prisma, and automates with n8n, Ollama and the Groq API. He ships web products and AI automations for small businesses, including Billzy, a GST invoicing and inventory app for retail shops, and KIRO, a directory of 500+ AI tools.",
  statement:
    "I'm a full-stack developer who treats AI as a material, not a buzzword. I design the interface, build the backend, and wire in the automation — so a small team can run like a big one.",
  // Small inline capsules set right after these words (matched without trailing punctuation).
  // Decorative: the sentence reads the same without them.
  capsules: {
    AI: { glyph: "spark" },
    buzzword: { image: "/capsules/kiro.webp" },
    interface: { image: "/capsules/billzy.webp" },
    automation: { glyph: "nodes" },
  } as Record<string, { glyph?: "spark" | "nodes"; image?: string }>,
  // Grouped by what the tool is for, not by how often it appears on a CV.
  // Each cluster is set as display lines, broken by hand so every line fits at full weight
  // without wrapping (the weight scrubs, so a line must never re-wrap mid-scroll).
  clusters: [
    {
      title: "Interface",
      note: "What people touch",
      lines: [["Next.js", "TypeScript", "Tailwind CSS"]],
    },
    {
      title: "Systems",
      note: "What holds it up",
      lines: [["Supabase", "Prisma", "Socket.io", "MERN"]],
    },
    {
      title: "AI & Automation",
      note: "What runs on its own",
      lines: [
        ["n8n", "Ollama", "Groq API"],
        ["Agentic AI", "Prompt engineering"],
      ],
    },
    {
      title: "Motion",
      note: "How it moves",
      lines: [["GSAP", "Framer Motion", "Lenis"]],
    },
  ],
};

// Question headings with 30-75 word direct answers, shown on the page and mirrored in FAQPage
// JSON-LD, so search snippets and AI assistants can quote them as written.
export const faq = [
  {
    q: "Who is Shashank Joshi?",
    a: "Shashank Joshi is a full-stack developer and AI generalist based in Ahmedabad, India. He designs and builds web products with Next.js, TypeScript, Supabase and Prisma, and automates routine work with n8n, Ollama and the Groq API. He works with small businesses, studios and teams that need software that ships.",
  },
  {
    q: "What can Shashank build for my business?",
    a: "Web apps, dashboards and internal tools, plus AI automations that run on their own. Past work includes Billzy, a deployed GST invoicing and inventory app for retail shops, and an n8n and Groq pipeline that extracts data from invoices and files it to Google Drive without a database.",
  },
  {
    q: "Which technologies does Shashank use?",
    a: "Interface work uses Next.js, TypeScript and Tailwind CSS. Systems use Supabase, Prisma, Socket.io and the MERN stack. AI and automation use n8n, Ollama, the Groq API, agentic workflows and prompt engineering. Motion is built with GSAP, Framer Motion and Lenis.",
  },
  {
    q: "Is Shashank available for freelance or full-time work?",
    a: "Yes. He is open to selected freelance and contract projects, and to hiring conversations. The quickest way to start is an email describing what you need and your timeline. He is based in Ahmedabad and works on India Standard Time, UTC+5:30.",
  },
];

export const currently = {
  building: "Billzy",
  exploring: "Local AI systems",
  availableFor: "Selected freelance / contract work",
};

export const contact = {
  headline: "Let's build something.",
  business: {
    label: "Start a project",
    note: "Business inquiry",
    href: `mailto:${site.email}?subject=${encodeURIComponent("Project inquiry")}`,
  },
  hire: {
    label: "Hire me",
    note: "Full-time or contract roles",
    href: `mailto:${site.email}?subject=${encodeURIComponent("Hiring inquiry")}`,
  },
};
