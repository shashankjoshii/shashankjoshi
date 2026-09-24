"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { process } from "@/lib/content";
import { SplitReveal } from "../SplitReveal";

/** How I build: five steps that activate as they reach the reading line. */
export function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>(".step").forEach((row) => {
          const st = { trigger: row, start: "top 78%", end: "top 48%", scrub: true };
          gsap.fromTo(row, { opacity: 0.28 }, { opacity: 1, ease: "none", scrollTrigger: st });
          gsap.fromTo(
            row.querySelector(".step-rule"),
            { scaleX: 0 },
            { scaleX: 1, ease: "none", transformOrigin: "left", scrollTrigger: st },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="process"
      ref={root}
      aria-labelledby="process-title"
      className="border-t border-line px-6 py-32 md:px-12 md:py-44"
    >
      <h2 id="process-title" className="display text-[clamp(2.6rem,7vw,7rem)]">
        <SplitReveal text={process.title} />
      </h2>

      <ol className="mt-20 md:mt-28">
        {process.steps.map((s, i) => (
          <li key={s.title} className="step relative py-8 md:py-10">
            <div className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden />
            <div className="step-rule absolute inset-x-0 top-0 h-px bg-gold" aria-hidden />
            <div className="grid gap-4 md:grid-cols-12 md:items-baseline md:gap-10">
              <span className="display text-3xl font-light text-cream-dim md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display text-[clamp(1.6rem,3.6vw,3.4rem)] uppercase md:col-span-6">
                {s.title}
              </h3>
              <p className="max-w-md leading-snug text-cream-dim md:col-span-4 md:col-start-9">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
