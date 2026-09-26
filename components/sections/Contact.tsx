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

        // the knot's own scroll depth: it keeps drifting and swelling for as long as any part of the
        // section is in view (not just while it's entering), so it reads as a background layer
        // receding at its own rate the whole time you're here — the headline and CTAs below have no
        // equivalent scroll transform of their own, so that difference in rate is what parallax is
        const knotScroll = gsap.fromTo(
          ".contact-knot",
          { yPercent: 30, scale: 0.65, opacity: 0 },
          {
            yPercent: -45,
            scale: 1.08,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );

        // cursor depth on top of the scroll drift: a small, damped offset (gsap.quickTo, ticked by
        // the same gsap.ticker loop that drives Lenis and the knot's own 3D canvas — see Stage.tsx's
        // FrameDriver) so the knot reads as sitting behind the headline/CTAs rather than pasted on.
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        let knotParallaxCleanup: (() => void) | undefined;
        if (fine.matches) {
          const knot = root.current!.querySelector<HTMLElement>(".contact-knot")!;
          const kx = gsap.quickTo(knot, "x", { duration: 1, ease: "power3" });
          const ky = gsap.quickTo(knot, "y", { duration: 1, ease: "power3" });
          const onMove = (e: PointerEvent) => {
            const r = root.current!.getBoundingClientRect();
            kx(((e.clientX - r.left) / r.width - 0.5) * 22);
            ky(((e.clientY - r.top) / r.height - 0.5) * 14);
          };
          const onLeave = () => {
            kx(0);
            ky(0);
          };
          root.current!.addEventListener("pointermove", onMove, { passive: true });
          root.current!.addEventListener("pointerleave", onLeave);
          knotParallaxCleanup = () => {
            root.current!.removeEventListener("pointermove", onMove);
            root.current!.removeEventListener("pointerleave", onLeave);
          };
        }

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
          knotScroll.scrollTrigger?.kill();
          knotScroll.kill();
          knotParallaxCleanup?.();
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
      {/* phones and tablets: the knot sits behind the type, so it stays small and dimmed to keep
          the white text (and the Hire me CTA, which the full-size knot reaches at md) readable */}
      <div aria-hidden className="absolute inset-0 -z-10 opacity-40 lg:opacity-100">
        <Scene3D
          kind="knot"
          className="contact-knot absolute right-[-30%] top-[6%] h-[44svh] w-[90vw] lg:right-[-8%] lg:top-[6%] lg:h-[78svh] lg:w-[50vw]"
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
        {/* 4 columns don't arrive until lg, and Email keeps extra share of that row (it's the
            longest single word here) — at exactly 1024 four EQUAL columns are still too narrow
            for the address and it wraps past the single @ break point below */}
        <div className="contact-meta mt-16 grid gap-8 border-t border-white/25 pt-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <p className="label mb-2 text-white/85">Email</p>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-11 items-center [overflow-wrap:anywhere] underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
            >
              {/* a real break opportunity at the @ (not mid-word) if the column is too narrow */}
              {site.email.split("@").map((part, i) => (
                <span key={i}>
                  {i > 0 && <wbr />}
                  {i > 0 && "@"}
                  {part}
                </span>
              ))}
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
            {/* small sizes need a wider cut and open tracking, or the condensed heavy glyphs clot */}
            <p className="display text-[1.75rem] [--wdth:112] [--wght:760]" style={{ letterSpacing: "0.01em" }}>
              {site.name}
            </p>
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
