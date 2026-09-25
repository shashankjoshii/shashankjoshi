"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

type Props = {
  children: React.ReactNode;
  /** "scroll": sweeps itself when scrolled into view. "manual": a parent timeline tweens `--k`. */
  trigger?: "scroll" | "manual";
  delay?: number;
};

/** A blue selection block dragged across a phrase. Static (fully selected) when motion is reduced. */
export function SelectionSweep({ children, trigger = "scroll", delay = 0.2 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(ref.current, { "--k": 0 });
        if (trigger === "manual") return;
        gsap.to(ref.current, {
          "--k": 1,
          duration: 0.9,
          ease: "power3.inOut",
          delay,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className="sweep">
      {children}
    </span>
  );
}
