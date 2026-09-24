"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { onReady } from "@/lib/ready";
import { nav, contact } from "@/lib/content";
import { Magnetic } from "./Magnetic";
import { useScrollTo } from "./SmoothScroll";

export function Nav() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(root.current, { yPercent: -100, opacity: 0 });
        return onReady(() =>
          gsap.to(root.current, {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0.6,
          }),
        );
      });
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b from-ink via-ink/70 to-transparent px-6 pb-9 pt-5 md:px-12"
    >
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          scrollTo(0);
        }}
        className="display pointer-events-auto inline-flex min-h-11 min-w-11 items-center text-2xl text-cream"
        aria-label="Back to top"
      >
        SJ
      </a>
      <nav aria-label="Primary" className="pointer-events-auto flex items-center gap-6 md:gap-10">
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              scrollTo(item.href);
            }}
            className="label hidden min-h-11 min-w-11 items-center justify-center text-cream transition-opacity hover:opacity-60 sm:inline-flex"
          >
            {item.label}
          </a>
        ))}
        <Magnetic>
          <a
            href={contact.business.href}
            className="label inline-flex min-h-11 items-center rounded-full border border-cream/60 px-4 text-cream transition-colors hover:bg-cream hover:text-ink"
          >
            Let&apos;s talk
          </a>
        </Magnetic>
      </nav>
    </header>
  );
}
