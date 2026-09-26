"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";
import { contact, site } from "@/lib/content";
import { Magnetic } from "../Magnetic";
import { useScrollTo } from "../SmoothScroll";
import { Scene3D } from "../three/Scene3D";

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
              ? "bg-white text-accent shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45)] transition-shadow hover:shadow-[0_28px_60px_-18px_rgb(0_0_0/0.55)]"
              : "border-2 border-white text-white transition-colors hover:bg-white hover:text-accent"
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
      <p className="label mt-3 pl-9 text-white/85">{note}</p>
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

        gsap.fromTo(
          ".contact-knot",
          { yPercent: 25, scale: 0.7, opacity: 0 },
          {
            yPercent: -10,
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: true },
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
      className="on-blue relative isolate flex min-h-svh flex-col justify-between overflow-clip bg-accent px-4 pb-8 pt-28 text-white md:px-12 md:pt-36"
    >
      {/* a slow glass knot turning behind the headline: the page ends on depth, not a flat colour */}
      {/* phones: the knot sits behind the type, so it is dimmed to keep the white text readable */}
      <div aria-hidden className="absolute inset-0 -z-10 opacity-40 md:opacity-100">
        <Scene3D
          kind="knot"
          className="contact-knot absolute right-[-30%] top-[6%] h-[44svh] w-[90vw] md:right-[-8%] md:top-[6%] md:h-[78svh] md:w-[50vw]"
        />
      </div>
      <div>
        <h2
          id="contact-title"
          className="contact-head display text-[min(21vw,30svh)] [--wdth:100] [--wght:800]"
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
        <div className="contact-meta mt-16 grid gap-8 border-t border-white/25 pt-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="label mb-2 text-white/85">Email</p>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-11 items-center break-all underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
            >
              {site.email}
            </a>
          </div>
          <div>
            <p className="label mb-2 text-white/85">Elsewhere</p>
            <p className="flex gap-5">
              <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white">
                GitHub
              </a>
              <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white">
                LinkedIn
              </a>
              {site.links.resume && (
                <a href={site.links.resume} className="inline-flex min-h-11 items-center underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white">
                  Résumé
                </a>
              )}
            </p>
          </div>
          <div>
            <p className="label mb-2 text-white/85">Studio</p>
            {site.links.nirmata ? (
              <a href={site.links.nirmata} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white">
                {site.studio}
              </a>
            ) : (
              <p className="flex min-h-11 items-center">{site.studio}</p>
            )}
          </div>
          <div>
            <p className="label mb-2 text-white/85">Availability</p>
            <p className="flex items-center gap-3">
              <span aria-hidden className="relative flex h-2 w-2 shrink-0"><span className="absolute inset-0 animate-ping rounded-full bg-white/70 motion-reduce:hidden" /><span className="h-2 w-2 rounded-full bg-white" /></span>
              Open to selected work
            </p>
          </div>
        </div>

        <p className="coda display mt-14 text-2xl text-white [--wght:700]">
          Wait — you&apos;re still here? Good.
        </p>

        <footer className="mt-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-white/25 pt-8">
          <div>
            <p className="display text-2xl [--wght:800]">{site.name}</p>
            <p className="label mt-2 text-white/85">Full-stack developer and AI generalist</p>
          </div>
          <div className="label flex items-center gap-8 text-white/85">
            <span>© {new Date().getFullYear()}</span>
            <button
              type="button"
              onClick={() => scrollTo(0)}
              className="min-h-11 transition-colors hover:text-white"
            >
              Back to top
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
