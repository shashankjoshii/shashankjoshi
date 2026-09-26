"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "@/lib/gsap";
import { about } from "@/lib/content";

// Same attention mechanism as Process: the line nearest the reading line is heavy and near-black,
// the rest thin out to grey. Unlike Process nothing pins; each line reads its own distance from the
// reading line as the page scrolls past, so it works identically on every screen size.
// A supporting section, so a gentle range: resting lines light and grey, the line being read a
// medium-heavy near-black. The static (reduced-motion) state is a calm 500 in ink for every line.
const HEAVY = { w: 660, d: 92 };
const LIGHT = { w: 300, d: 84 };
const DIM = "#8a8a8a";
// Phone-sized lines can't go that thin (hairline stems break up at ~2rem), so the resting state
// stays a readable medium weight in a darker grey. Mirrors Process's NARROW variant.
const LIGHT_NARROW = { w: 460, d: 88 };
const DIM_NARROW = "#6b6b6b";
const INK = "#0a0a0a";
// tablets and touch laptops too: hairlines break up on coarse-pointer screens at these sizes
const NARROW = "(max-width: 1023px), (pointer: coarse)";
/** Where the eye rests, as a fraction of the viewport height. */
const READING_LINE = 0.52;

export function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ".about-word",
          { opacity: 0.12 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: {
              trigger: ".about-statement",
              start: "top 80%",
              end: "bottom 45%",
              scrub: true,
            },
          },
        );
      });

      mm.add({ motion: MOTION_OK, narrow: NARROW }, (ctx) => {
        const { motion, narrow } = ctx.conditions as {
          motion: boolean;
          narrow: boolean;
        };
        if (!motion) return;
        const light = narrow ? LIGHT_NARROW : LIGHT;
        const toDim = gsap.utils.interpolate(narrow ? DIM_NARROW : DIM, INK);

        const lines = gsap.utils.toArray<HTMLElement>(
          ".skill-line",
          root.current,
        );
        const rules = gsap.utils.toArray<HTMLElement>(
          ".skill-rule",
          root.current,
        );
        const setters = lines.map((el, i) => ({
          el,
          row: el.closest("li")!,
          w: gsap.quickTo(el, "--wght", { duration: 0.5, ease: "power3" }),
          d: gsap.quickTo(el, "--wdth", { duration: 0.5, ease: "power3" }),
          r: gsap.quickTo(rules[i], "scaleX", {
            duration: 0.6,
            ease: "power3",
          }),
        }));
        gsap.set(lines, {
          "--wght": light.w,
          "--wdth": light.d,
          color: toDim(0),
        });
        gsap.set(rules, { opacity: 1, scaleX: 0, transformOrigin: "left" });

        const update = () => {
          const reading = window.innerHeight * READING_LINE;
          for (const s of setters) {
            const r = s.el.getBoundingClientRect();
            // falls off over roughly one row's pitch either side of the reading line
            // (within one pitch, so the neighbours are fully at rest: one line is emphasised at a time)
            const reach = Math.max(s.row.offsetHeight * 0.9, 44);
            const t = gsap.utils.clamp(
              0,
              1,
              1 - Math.abs(r.top + r.height / 2 - reading) / reach,
            );
            const k = t * t * (3 - 2 * t); // smoothstep: a clear winner, soft hand-over
            s.w(light.w + (HEAVY.w - light.w) * k);
            s.d(light.d + (HEAVY.d - light.d) * k);
            s.el.style.color = toDim(k);
            s.r(k);
          }
        };
        const st = ScrollTrigger.create({
          trigger: ".skill-list",
          start: "top bottom",
          end: "bottom top",
          onUpdate: update,
          onRefresh: update,
        });
        update();
        return () => st.kill();
      });
    },
    { scope: root },
  );

  return (
    <section
      id="about"
      ref={root}
      className="bg-bg px-4 py-32 md:px-12 md:py-48"
    >
      <h2 className="about-statement display max-w-6xl [--wght:600] text-[clamp(1.9rem,4.6vw,4.4rem)] leading-[1.08]">
        {about.statement.split(" ").map((w, i) => (
          <span key={i} className="about-word">
            {w}{" "}
          </span>
        ))}
      </h2>

      <h3 className="label mt-24 text-muted md:mt-32">What I work with</h3>
      <ul className="skill-list mt-6">
        {about.clusters.map((c, i) => (
          <li
            key={c.title}
            className="relative grid gap-1.5 py-4 md:grid-cols-12 md:items-baseline md:gap-10 md:py-5"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-line"
            />
            <div
              aria-hidden
              className="skill-rule absolute inset-x-0 top-0 h-px bg-accent opacity-0"
            />
            <p className="label flex flex-wrap items-baseline gap-x-3 text-muted md:col-span-3">
              <span className="tabular-nums text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-fg">{c.title}</span>
              <span>{c.note}</span>
            </p>
            {/* Lines are pre-broken in content and never wrap; the type is sized so the longest
                line still fits at full weight on every screen, so nothing reflows while it scrubs. */}
            <p className="skill-line display text-[clamp(1.05rem,5.2vw,1.6rem)] leading-[1.08] [--wdth:90] [--wght:500] md:col-span-9 md:text-[clamp(1.35rem,2.6vw,2.4rem)]">
              {c.lines.map((line) => (
                <span key={line.join()} className="block whitespace-nowrap">
                  {line.map((item, j) => (
                    <span key={item}>
                      {item}
                      {j < line.length - 1 && (
                        <span className="text-dim"> · </span>
                      )}
                    </span>
                  ))}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
