"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { about } from "@/lib/content";

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
    },
    { scope: root },
  );

  return (
    <section
      id="about"
      ref={root}
      className="border-t border-line px-6 py-32 md:px-12 md:py-48"
    >
      <h2 className="about-statement display max-w-6xl text-[clamp(1.9rem,4.6vw,4.4rem)] leading-[1.08]">
        {about.statement.split(" ").map((w, i) => (
          <span key={i} className="about-word">
            {w}{" "}
          </span>
        ))}
      </h2>

      <div className="about-clusters mt-24 grid gap-14 sm:grid-cols-2 md:mt-32 lg:grid-cols-4 lg:gap-8">
        {about.clusters.map((c) => (
          <div key={c.title} className="border-t border-cream/25 pt-6">
            <h3 className="display text-[clamp(1.7rem,2.5vw,2.3rem)] leading-none">{c.title}</h3>
            <p className="mt-3 text-sm text-cream-dim">{c.note}</p>
            <ul className="mt-6 space-y-1.5 text-lg text-cream-dim">
              {c.items.map((item) => (
                <li key={item} className="transition-colors hover:text-cream">
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
