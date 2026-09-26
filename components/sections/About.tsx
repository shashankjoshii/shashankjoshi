"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { about } from "@/lib/content";
import { SelectionSweep } from "../SelectionSweep";

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

        // each cluster: its rule draws in blue left to right, then the title and items rise
        gsap.utils.toArray<HTMLElement>(".cluster").forEach((c, i) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: ".about-clusters", start: "top 80%", once: true },
            delay: i * 0.12,
            defaults: { ease: "power4.out" },
          });
          tl.fromTo(c.querySelector(".cluster-rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.inOut" })
            .from(c.querySelector(".cluster-num"), { yPercent: 100, opacity: 0, duration: 0.8 }, 0.3)
            .from(c.querySelectorAll(".cluster-in"), { y: 26, opacity: 0, duration: 0.9, stagger: 0.06 }, 0.35);
        });
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

      <div className="about-clusters mt-24 grid gap-14 sm:grid-cols-2 md:mt-32 lg:grid-cols-4 lg:gap-8">
        {about.clusters.map((c, i) => (
          <div key={c.title} className="cluster group relative pt-6">
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-fg" />
            <div aria-hidden className="cluster-rule absolute inset-x-0 top-0 h-[3px] origin-left bg-accent" />
            <span aria-hidden className="block overflow-hidden">
              <span className="cluster-num display block text-sm tabular-nums text-accent [--wght:600]">
                {String(i + 1).padStart(2, "0")}
              </span>
            </span>
            <h3 className="cluster-in display mt-3 text-[clamp(1.7rem,2.5vw,2.3rem)] leading-none">
              {c.title === "AI & Automation" ? <SelectionSweep>{c.title}</SelectionSweep> : c.title}
            </h3>
            <p className="cluster-in mt-3 text-sm text-muted">{c.note}</p>
            <ul className="mt-6 space-y-1.5 text-lg text-muted">
              {c.items.map((item) => (
                <li
                  key={item}
                  className="cluster-in flex items-center gap-2 transition-[color,transform] duration-300 hover:translate-x-1.5 hover:text-accent"
                >
                  <span aria-hidden className="h-1 w-1 rounded-full bg-accent/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
