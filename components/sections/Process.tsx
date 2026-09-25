"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { process } from "@/lib/content";
import { SplitReveal } from "../SplitReveal";

// The list holds the screen while the steps pass a reading line; needs the whole thing to fit.
const CAN_PIN = "(min-width: 1024px) and (min-height: 820px)";

const HEAVY = { w: 800, d: 100 };
const LIGHT = { w: 300, d: 82 };

/**
 * How I build. Weight follows attention: the step you are reading is heavy and black, the rest
 * thin out to grey. It is the site's motif in its purest form, so it is the only motion here.
 * Titles are single pre-broken lines with room reserved at full weight, so nothing reflows.
 * At rest (no motion) every step is at full weight and full colour.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, pin: CAN_PIN }, (ctx) => {
        const { motion, pin } = ctx.conditions as { motion: boolean; pin: boolean };
        if (!motion) return;

        const steps = gsap.utils.toArray<HTMLElement>(".step", root.current);
        const titles = steps.map((s) => s.querySelector<HTMLElement>(".step-title")!);
        const bodies = steps.map((s) => s.querySelector<HTMLElement>(".step-body")!);
        const rules = steps.map((s) => s.querySelector<HTMLElement>(".step-rule")!);

        // every step but the first starts thin and grey
        titles.forEach((t, i) => {
          if (i) gsap.set(t, { "--wght": LIGHT.w, "--wdth": LIGHT.d, color: "#8a8a8a" });
        });
        // bodies only swap while pinned; unpinned, all stay readable and only the weight scrubs
        if (pin) gsap.set(bodies.slice(1), { opacity: 0 });
        // the blue rule only exists as motion; at rest the neutral hairline is enough
        gsap.set(rules, { opacity: 1, scaleX: 0, transformOrigin: "left" });
        gsap.set(rules[0], { scaleX: 1 });

        // a step is "active" while it is inside its slice of the scrub
        const slice = 1; // timeline units per step
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pin
            ? {
                trigger: ".process-stage",
                start: "top top",
                end: `+=${steps.length * 55}%`,
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
              }
            : {
                trigger: ".process-list",
                start: "top 70%",
                end: "bottom 45%",
                scrub: 0.6,
              },
        });

        steps.forEach((_, i) => {
          if (i === 0) return;
          const at = (i - 0.35) * slice;
          const d = 0.5 * slice;
          // the step that was heavy lets go...
          tl.to(titles[i - 1], { "--wght": LIGHT.w, "--wdth": LIGHT.d, color: "#8a8a8a", duration: d }, at)
            // ...and this one takes the weight
            .to(titles[i], { "--wght": HEAVY.w, "--wdth": HEAVY.d, color: "#0a0a0a", duration: d }, at)
            .to(rules[i], { scaleX: 1, duration: d }, at);
          if (pin) {
            tl.to(bodies[i - 1], { opacity: 0, duration: d }, at).to(bodies[i], { opacity: 1, duration: d }, at);
          }
        });
        tl.to({}, { duration: 0.4 * slice });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <section id="process" ref={root} aria-labelledby="process-title" className="bg-bg">
      <div className="process-stage flex min-h-svh flex-col justify-center px-4 py-20 md:px-12 lg:py-10">
        <h2 id="process-title" className="display text-[clamp(2.8rem,min(9vw,15svh),9.5rem)]">
          <SplitReveal text={process.title} />
        </h2>

        <ol className="process-list mt-10 md:mt-12">
          {process.steps.map((s, i) => (
            <li key={s.title} className="step relative py-4 md:py-5">
              <div className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden />
              <div className="step-rule absolute inset-x-0 top-0 h-px bg-accent opacity-0" aria-hidden />
              <div className="grid gap-2 md:grid-cols-12 md:items-center md:gap-10">
                <span className="display text-2xl text-muted [--wght:400] md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="step-title display whitespace-nowrap text-[clamp(1.6rem,7.6vw,2.2rem)] md:col-span-8 md:text-[clamp(1.6rem,min(4.4vw,8svh),4.6rem)]">
                  {s.title}
                </h3>
                <p className="step-body max-w-sm text-[0.95rem] leading-snug text-muted md:col-span-3">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
