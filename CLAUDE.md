# Shashank Joshi — Portfolio

## Goal
An Awwwards-level personal portfolio for Shashank Joshi (Full-Stack Developer & AI Generalist).
Audience: both SME/business clients (freelance work via Nirmata Designs) AND recruiters/employers.
Direction: **bold, animated, motion-forward** — the animation quality itself is part of the pitch
(proof of frontend/motion skill), not just decoration.

Benchmark quality bar: Awwwards Site of the Day-tier developer portfolios — cinematic, confident,
uncluttered. Reference repos for technique (not to copy 1:1, study the approach):
- github.com/2trung/portfolio — Three.js + GSAP + Lenis, choreographed entrances, custom preloader
- github.com/zickrian/motionfolio — GSAP + Lenis + reusable animation patterns, case-study pages
- github.com/Ali-Sanati/awwwards-portfolio — GSAP + Three.js + Tailwind reference build

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger — scroll-linked timelines, pinned sections, entrance choreography
- Lenis — smooth scroll, synced with GSAP/ScrollTrigger
- Framer Motion — micro-interactions, hover states, page/route transitions
- Deploy target: **Vercel**

## Recommended Skill
Add the open-source Claude Skill **"awwwards-animations"** by DevMartinese (skills.cat) before
starting build-out — it's purpose-built for GSAP/Framer Motion/Lenis award-level animations
(custom cursors, page transitions, split-text reveals, parallax, 60fps micro-interactions).
Pull this in via the skills downloader first, then scaffold.

## Structure
1. **Hero** — bold animated intro. Name, role, one-line positioning. Entrance choreography
   (staggered text reveal / masked type-in), not a static headline.
2. **About / Skills** — core stack (Next.js, Supabase, Prisma, GSAP, Framer Motion, Socket.io,
   Ollama, N8N) + MERN, agentic/generative AI, prompt engineering. Keep this readable, not a
   dense grid — a few grouped clusters with subtle motion on scroll.
3. **Projects** — 4 full-bleed sections, each gets room to breathe (no cramped cards).
   Each project: name, one-line pitch, what it proves, tech used, scroll-triggered reveal,
   link/screens if available.
   - **Billzy (formerly BizBook)** — deployed GST invoicing & inventory ERP for kirana/retail
     shops. Proves: ships real, revenue-relevant products for SMEs.
   - **KIRO** — directory of 200+ AI tools, built and run solo. Proves: scale + independent
     execution.
   - **AI Research Agent** — n8n + Ollama planner → researchers → synthesis automation.
     Proves: agentic AI / automation skill (priority showcase).
   - **Invoice Extraction Pipeline** — n8n + Groq API invoice OCR/extraction workflow, Drive
     in/out, no database. Proves: automation depth, second n8n showcase — give this real
     visual treatment (e.g. an animated workflow/pipeline diagram), automation is the skill
     being sold hardest here.
4. **Contact** — simple, direct. CTA for both a business inquiry and a hire inquiry.

*(RAG "chat with my resume" widget — Groq-powered, Supabase pgvector for retrieval — is a
planned future addition. Not in this initial build.)*

## Design Principles
- Motion should feel intentional and choreographed, never gratuitous — every animation earns
  its place or it gets cut.
- Respect `prefers-reduced-motion` throughout (Lenis, GSAP timelines, entrance animations).
- Performance matters as much as polish: optimize images/fonts, lazy-load below-the-fold,
  keep Lighthouse scores healthy despite the animation load.
- Typography-led design — confident type scale, generous whitespace, let the 4 projects be
  the visual centerpiece rather than decorative clutter.
- Dark-leaning or bold color direction fits the "bold & animated" brief — final palette to be
  decided during build, but should feel premium, not generic SaaS-template.

## Build Order
1. Scaffold Next.js + TypeScript + Tailwind, set up Lenis + GSAP/ScrollTrigger + Framer Motion.
2. Build hero with entrance choreography.
3. Build one full project section end-to-end (motion pattern reference for the other 3).
4. Repeat for remaining 3 projects, reusing the motion pattern.
5. Skills/About section.
6. Contact + footer.
7. Performance pass (reduced-motion, image optimization, Lighthouse).
8. Deploy to Vercel.
