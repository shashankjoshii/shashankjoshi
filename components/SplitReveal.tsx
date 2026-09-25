"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

type Props = {
  text: string;
  by?: "words" | "chars";
  /**
   * "scroll": animates itself when scrolled into view.
   * "manual": stays hidden (motion only) until a parent timeline animates `[data-inner]`.
   */
  trigger?: "scroll" | "manual";
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  stagger?: number;
  delay?: number;
};

/** Masked line/word/char reveal. Splits by hand — no paid SplitText. */
export function SplitReveal({
  text,
  by = "words",
  trigger = "scroll",
  as: Tag = "span",
  className,
  stagger,
  delay = 0,
}: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const inner = gsap.utils.toArray<HTMLElement>("[data-inner]", root.current);
        // y: 0 too, so a stale px offset parsed from an earlier inline transform (strict-mode re-run)
        // can never add to the percentage
        gsap.set(inner, { y: 0, yPercent: 115 });
        if (trigger === "manual") return;
        gsap.to(inner, {
          y: 0,
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: stagger ?? (by === "chars" ? 0.035 : 0.06),
          delay,
          scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
        });
      });
    },
    { scope: root },
  );

  const words = text.split(" ");

  return (
    <Tag
      ref={root as never}
      aria-label={text}
      className={className}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block whitespace-nowrap">
          {by === "chars" ? (
            [...word].map((ch, j) => (
              <span key={j} className="mask">
                <span data-inner>{ch}</span>
              </span>
            ))
          ) : (
            <span className="mask">
              <span data-inner>{word}</span>
            </span>
          )}
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
