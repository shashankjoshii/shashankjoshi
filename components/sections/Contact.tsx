"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";
import { contact, site } from "@/lib/content";
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
    <div className="cta">
      <Magnetic strength={0.2}>
        <a
          href={href}
          className={`group inline-flex min-h-16 items-center gap-6 rounded-full px-9 text-xl font-semibold md:text-2xl ${
            primary
              ? "on-accent bg-accent text-white"
              : "border-2 border-fg text-fg transition-colors hover:bg-fg hover:text-bg"
          }`}
        >
          {label}
          <span
            aria-hidden
            className="text-2xl transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
          >
            ↗
          </span>
        </a>
      </Magnetic>
      <p className="label mt-3 pl-9 text-muted">{note}</p>
    </div>
  );
}

/** How long someone has to stay at the very end before the coda appears. */
const CODA_DWELL_S = 2.4;

// Reserved at full weight (the fit below is measured there), so it never reflows as it thickens.
const LIGHT = { w: 200, d: 75 };

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // The closing beat: the headline thickens from hairline to full weight as it arrives,
        // so it lands at its loudest exactly when the CTAs appear. One CSS variable, one element.
        gsap.fromTo(
          ".contact-head",
          { "--wght": LIGHT.w, "--wdth": LIGHT.d },
          {
            "--wght": 800,
            "--wdth": 100,
            ease: "none",
            scrollTrigger: { trigger: ".contact-head", start: "top 85%", end: "top 20%", scrub: true },
          },
        );

        gsap.from(".cta", {
          y: 40,
          opacity: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.15,
          scrollTrigger: { trigger: ".ctas", start: "top 90%", once: true },
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
      className="flex min-h-svh flex-col justify-between border-t border-line px-4 pb-8 pt-28 md:px-12 md:pt-36"
    >
      <div>
        <h2
          id="contact-title"
          className="contact-head display text-[min(14.5vw,30svh)] [--wdth:100] [--wght:800]"
        >
          <span className="block whitespace-nowrap">Let&apos;s build</span>
          <span className="block whitespace-nowrap">something.</span>
        </h2>
      </div>

      <div className="ctas mt-14 flex flex-wrap items-start gap-x-8 gap-y-10">
        <Cta primary {...contact.business} />
        <Cta {...contact.hire} />
      </div>

      <div>
        <div className="contact-meta mt-16 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="label mb-2 text-muted">Email</p>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-11 items-center break-all underline decoration-fg/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            >
              {site.email}
            </a>
          </div>
          <div>
            <p className="label mb-2 text-muted">Elsewhere</p>
            <p className="flex gap-5">
              <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-fg/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                GitHub
              </a>
              <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-fg/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                LinkedIn
              </a>
              <a href={site.links.resume} className="inline-flex min-h-11 items-center underline decoration-fg/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                Résumé
              </a>
            </p>
          </div>
          <div>
            <p className="label mb-2 text-muted">Studio</p>
            <a href={site.links.nirmata} className="inline-flex min-h-11 items-center underline decoration-fg/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
              {site.studio}
            </a>
          </div>
          <div>
            <p className="label mb-2 text-muted">Availability</p>
            <p className="flex items-center gap-3">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent" />
              Open to selected work
            </p>
          </div>
        </div>

        <p className="coda display mt-14 text-2xl text-fg [--wght:700]">
          Wait — you&apos;re still here? Good.
        </p>

        <footer className="mt-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-line pt-8">
          <div>
            <p className="display text-2xl [--wght:800]">{site.name}</p>
            <p className="label mt-2 text-muted">Full-stack developer and AI generalist</p>
          </div>
          <div className="label flex items-center gap-8 text-muted">
            <span>© {new Date().getFullYear()}</span>
            <button
              type="button"
              onClick={() => scrollTo(0)}
              className="min-h-11 transition-colors hover:text-fg"
            >
              Back to top
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
