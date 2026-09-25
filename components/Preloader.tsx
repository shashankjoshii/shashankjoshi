"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { markReady } from "@/lib/ready";

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const html = document.documentElement;
        html.style.overflow = "hidden";
        const n = { v: 0 };

        const tl = gsap.timeline({
          onComplete: () => {
            html.style.overflow = "";
            gsap.set(root.current, { display: "none" });
          },
        });
        tl.to(n, {
          v: 100,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            if (count.current) count.current.textContent = `${Math.round(n.v)}%`;
          },
        })
          .to(bar.current, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0)
          // the count thickens as it climbs: the site's weight motif, introduced in the first second
          .fromTo(
            count.current,
            { "--wght": 200, "--wdth": 75 },
            { "--wght": 800, "--wdth": 100, duration: 1.1, ease: "power2.inOut" },
            0,
          )
          .to(".pre-fade", { opacity: 0, duration: 0.3, ease: "power2.in" }, 1.15)
          .to(root.current, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 1.25)
          .add(markReady, 1.6);

        return () => {
          html.style.overflow = "";
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        markReady();
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="preloader fixed inset-0 z-[80] flex items-end bg-bg p-4 md:p-10"
    >
      <span
        ref={count}
        className="pre-fade display text-[22vw] leading-none text-fg tabular-nums md:text-[12vw]"
      >
        0%
      </span>
      <div className="absolute inset-x-0 bottom-0 h-px bg-line">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
    </div>
  );
}
