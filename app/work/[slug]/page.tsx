import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, contact, invoiceStages, projects, site } from "@/lib/content";
import { seo } from "@/lib/seo";

// One static page per project. No preloader, 3D or pinned scenes here: it is plain, server-rendered
// text, so it loads fast and every sentence is in the HTML for search engines and AI assistants.

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

function find(slug: string) {
  const i = projects.findIndex((p) => p.id === slug);
  const study = caseStudies[slug];
  if (i < 0 || !study) return null;
  return {
    project: projects[i],
    study,
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
    position: i + 1,
  };
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = find(slug);
  if (!found) return {};
  const { study } = found;
  const path = `/work/${slug}`;
  return {
    title: study.title,
    description: study.description,
    alternates: { canonical: path },
    openGraph: {
      title: study.title,
      description: study.description,
      url: path,
      siteName: site.name,
      locale: "en_IN",
      type: "article",
    },
    twitter: { card: "summary_large_image", title: study.title, description: study.description },
  };
}

const pill =
  "inline-flex min-h-12 items-center rounded-full px-6 font-semibold transition-colors";

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const found = find(slug);
  if (!found) notFound();
  const { project, study, prev, next, position } = found;

  const url = `${seo.url}/work/${slug}`;
  const steps =
    slug === "invoice-pipeline"
      ? invoiceStages.map((s) => ({ title: `${s.phase}: ${s.title}`, detail: s.detail }))
      : study.steps;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: seo.url },
          { "@type": "ListItem", position: 2, name: "Work", item: `${seo.url}/#work` },
          { "@type": "ListItem", position: 3, name: project.name, item: url },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: study.title,
        description: study.description,
        inLanguage: "en",
        isPartOf: { "@id": `${seo.url}/#website` },
        about: { "@id": `${seo.url}/#${project.id}` },
        author: { "@id": `${seo.url}/#person` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // `<` is escaped so no string in the data can close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="nav-safe flex items-center justify-between border-b border-line">
        <Link href="/" aria-label={`${site.name}, home`} className="inline-flex min-h-11 min-w-11 items-center">
          <span className="display text-2xl text-fg [--wght:800]">SJ</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 sm:gap-8">
          <Link href="/#work" className="label inline-flex min-h-11 items-center text-fg hover:opacity-60">
            All work
          </Link>
          <a
            href={contact.business.href}
            className="label inline-flex min-h-11 items-center rounded-full border border-fg px-4 text-fg transition-colors hover:bg-fg hover:text-bg"
          >
            Contact me
          </a>
        </nav>
      </header>

      <main id="main" className="px-4 pb-20 pt-14 md:px-12 md:pb-28 md:pt-24">
        <article className="mx-auto max-w-4xl">
          <p className="label text-muted">
            Case study · Project {String(position).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>
          <h1 className="display mt-4 text-[clamp(2.8rem,9vw,7rem)] [--wdth:96] [--wght:800]">{project.name}</h1>
          {project.alias && <p className="mt-3 text-lg text-muted">{project.alias}</p>}
          <p className="mt-8 max-w-2xl text-xl leading-snug text-fg md:text-2xl">{project.build}</p>

          <dl className="mt-10 grid gap-x-10 gap-y-6 border-y border-line py-6 sm:grid-cols-3">
            <div>
              <dt className="label mb-1 text-muted">Role</dt>
              <dd className="text-lg leading-snug">{project.role}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="label mb-1 text-muted">Stack</dt>
              <dd className="text-lg leading-snug">{project.tech.join(", ")}</dd>
            </div>
          </dl>

          <section aria-labelledby="what" className="mt-16">
            <h2 id="what" className="display text-3xl [--wght:700] md:text-4xl">
              What is {project.name}?
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">{study.what}</p>
          </section>

          <section aria-labelledby="problem" className="mt-14">
            <h2 id="problem" className="display text-3xl [--wght:700] md:text-4xl">
              What problem does it solve?
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">{study.problem}</p>
          </section>

          <section aria-labelledby="how" className="mt-14">
            <h2 id="how" className="display text-3xl [--wght:700] md:text-4xl">
              How does it work?
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">{study.howIntro}</p>
            {steps && (
              <ol className="mt-8 max-w-prose divide-y divide-line border-y border-line">
                {steps.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 py-4">
                    <span className="label pt-1 tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="display block text-xl [--wght:700]">{s.title}</span>
                      <span className="mt-1 block text-lg leading-snug text-muted">{s.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="stack" className="mt-14">
            <h2 id="stack" className="display text-3xl [--wght:700] md:text-4xl">
              What is it built with?
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">{study.stack}</p>
          </section>

          <section aria-labelledby="proves" className="mt-14">
            <h2 id="proves" className="display text-3xl [--wght:700] md:text-4xl">
              What does it show?
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">{study.proves}</p>
          </section>

          <section aria-labelledby="cta" className="mt-20 border-t border-line pt-12">
            <h2 id="cta" className="display text-3xl [--wght:800] md:text-5xl">
              Need something like this?
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={contact.business.href} className={`${pill} bg-accent text-white hover:bg-fg`}>
                {contact.business.label}
              </a>
              <a href={contact.hire.href} className={`${pill} border border-fg text-fg hover:bg-fg hover:text-bg`}>
                {contact.hire.label}
              </a>
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center font-semibold text-accent underline underline-offset-8"
                >
                  {project.hrefLabel ?? "View live"}
                </a>
              )}
            </div>
          </section>

          <nav aria-label="More projects" className="mt-20 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
            <Link href={`/work/${prev.id}`} className="group block py-2">
              <span className="label text-muted">Previous project</span>
              <span className="display mt-1 block text-2xl [--wght:700] group-hover:text-accent">{prev.name}</span>
            </Link>
            <Link href={`/work/${next.id}`} className="group block py-2 sm:text-right">
              <span className="label text-muted">Next project</span>
              <span className="display mt-1 block text-2xl [--wght:700] group-hover:text-accent">{next.name}</span>
            </Link>
          </nav>
        </article>
      </main>

      <footer className="border-t border-line px-4 py-8 md:px-12">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <p className="label text-muted">
            {site.name} · {site.role}
          </p>
          <p className="label flex gap-6">
            <Link href="/" className="inline-flex min-h-11 items-center underline underline-offset-4">
              Home
            </Link>
            <a
              href={site.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center underline underline-offset-4"
            >
              GitHub
            </a>
            <a
              href={site.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center underline underline-offset-4"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
