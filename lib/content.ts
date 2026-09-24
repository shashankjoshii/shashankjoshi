// All copy, project data and links live here.
// TODO: replace every value marked TODO with the real one.

export const site = {
  name: "Shashank Joshi",
  role: "Full-Stack Developer & AI Generalist",
  positioning:
    "I build products that ship and automations that run — for shops, studios and teams that need real results, not demos.",
  studio: "Nirmata Designs",
  location: "India", // TODO
  timezone: "Asia/Kolkata",
  email: "shashankjoshi.imscit20@gmail.com",
  links: {
    github: "https://github.com/", // TODO
    linkedin: "https://linkedin.com/", // TODO
    resume: "#", // TODO: /resume.pdf
    nirmata: "#", // TODO: Nirmata Designs URL
  },
};

export const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export type ProjectVisual = "research-agent" | "invoice-pipeline" | "screenshot";

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
  href?: string; // TODO: live/demo links
  hrefLabel?: string;
  visual: ProjectVisual;
  image?: string;
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
    visual: "invoice-pipeline",
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
    visual: "screenshot",
    image: "/projects/billzy.png",
  },
  {
    id: "kiro",
    index: "04",
    name: "KIRO",
    problem: "AI tools multiply faster than anyone can keep track of them.",
    build: "A directory of 200+ AI tools, built, curated and run solo.",
    role: "Solo: design, build, curation",
    tech: ["Next.js", "Supabase", "Tailwind CSS"], // TODO: confirm stack
    result: "200+ tools catalogued, from data model to daily upkeep.",
    visual: "screenshot",
    image: "/projects/kiro.png",
  },
];

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
  statement:
    "I'm a full-stack developer who treats AI as a material, not a buzzword. I design the interface, build the backend, and wire in the automation — so a small team can run like a big one.",
  // Grouped by what the tool is for, not by how often it appears on a CV.
  clusters: [
    {
      title: "Interface",
      note: "What people touch",
      items: ["Next.js", "TypeScript", "Tailwind CSS"],
    },
    {
      title: "Systems",
      note: "What holds it up",
      items: ["Supabase", "Prisma", "Socket.io", "MERN"],
    },
    {
      title: "AI & Automation",
      note: "What runs on its own",
      items: ["n8n", "Ollama", "Groq API", "Agentic AI", "Prompt engineering"],
    },
    {
      title: "Motion",
      note: "How it moves",
      items: ["GSAP", "Framer Motion", "Lenis"],
    },
  ],
};

export const currently = {
  building: "Billzy",
  exploring: "Local AI systems",
  availableFor: "Selected freelance / contract work",
};

export const contact = {
  headline: "Let's build something.",
  business: {
    label: "Start a project",
    note: `Business inquiry via ${site.studio}`,
    href: `mailto:${site.email}?subject=${encodeURIComponent("Project inquiry — Nirmata Designs")}`,
  },
  hire: {
    label: "Hire me",
    note: "Full-time or contract roles",
    href: `mailto:${site.email}?subject=${encodeURIComponent("Hiring inquiry")}`,
  },
};
