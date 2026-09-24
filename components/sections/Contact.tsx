"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";
import { contact, site } from "@/lib/content";
import { SplitReveal } from "../SplitReveal";
import { Magnetic } from "../Magnetic";
import { useScrollTo } from "../SmoothScroll";

function Cta({
  href,
  label,
  note,
  primary,
}: {
  href: string;
  label: string;
  note: string;
  primary?: boolean;
}) {
  return (
    <Magnetic strength={0.2}>
      <a
        href={href}
        className={`cta group flex h-56 w-72 flex-col justify-between rounded-full px-14 py-11 md:h-64 md:w-80 ${
          primary
            ? "bg-gold text-ink"
            : "border border-cream/30 text-cream transition-colors hover:bg-cream hover:text-ink"
        }`}
      >
        <span className="label opacity-70">{note}</span>
        <span className="display flex items-end justify-between text-4xl md:text-5xl">
          {label}
          <span aria-hidden className="text-3xl transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">
            ↗
          </span>
        </span>
      </a>
    </Magnetic>
  );
}

/** How long someone has to stay at the very end before the coda appears. */
const CODA_DWELL_S = 2.4;

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(".cta", {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.15,
          scrollTrigger: { trigger: ".ctas", start: "top 85%", once: true },
        });
        // One editorial aside: if someone stays at the very end, the log answers.
        // Plain visible text when motion is reduced, since this branch never runs then.
        gsap.set(".coda", { opacity: 0, y: 10 });
        let wait: gsap.core.Tween | undefined;
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "bottom bottom+=2",
          onEnter: () => {
            wait = gsap.delayedCall(CODA_DWELL_S, () =>
              gsap.to(".coda", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }),
            );
          },
          onLeaveBack: () => wait?.kill(),
        });
        return () => {
          wait?.kill();
          st.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <section
      id="contact"
      ref={root}
      aria-labelledby="contact-title"
      className="flex min-h-svh flex-col justify-between border-t border-line px-6 pb-8 pt-32 md:px-12 md:pt-40"
    >
      <div>
        <h2 id="contact-title" className="display text-[clamp(2.6rem,11vw,11rem)]">
          <SplitReveal text={contact.headline} />
        </h2>
      </div>

      <div className="ctas mt-16 flex flex-wrap gap-6">
        <Cta primary {...contact.business} />
        <Cta {...contact.hire} />
      </div>

      <div>
        <div className="contact-meta mt-20 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="label mb-2 text-cream-dim">Email</p>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-11 items-center break-all transition-colors hover:text-gold"
            >
              {site.email}
            </a>
          </div>
          <div>
            <p className="label mb-2 text-cream-dim">Elsewhere</p>
            <p className="flex gap-5">
              <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-gold">
                GitHub
              </a>
              <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-gold">
                LinkedIn
              </a>
              <a href={site.links.resume} className="inline-flex min-h-11 items-center transition-colors hover:text-gold">
                Résumé
              </a>
            </p>
          </div>
          <div>
            <p className="label mb-2 text-cream-dim">Studio</p>
            <a href={site.links.nirmata} className="inline-flex min-h-11 items-center transition-colors hover:text-gold">
              {site.studio}
            </a>
          </div>
          <div>
            <p className="label mb-2 text-cream-dim">Availability</p>
            <p className="flex items-center gap-3">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              Open to selected work
            </p>
          </div>
        </div>

        <p className="coda display mt-16 text-2xl text-cream">
          Wait — you&apos;re still here? Good.
        </p>

        <footer className="mt-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-line pt-8">
          <div>
            <p className="display text-2xl">{site.name}</p>
            <p className="label mt-2 text-cream-dim">Full-stack developer and AI generalist</p>
          </div>
          <div className="label flex items-center gap-8 text-cream-dim">
            <span>© {new Date().getFullYear()}</span>
            <button
              type="button"
              onClick={() => scrollTo(0)}
              className="min-h-11 transition-colors hover:text-gold"
            >
              Back to top
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
