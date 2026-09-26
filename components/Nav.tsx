"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { onReady } from "@/lib/ready";
import { nav, contact } from "@/lib/content";
import { Magnetic } from "./Magnetic";
import { useScrollTo } from "./SmoothScroll";

// Same query the hero uses to decide it is pinned for its zoom-through.
const HERO_PINNED = "(min-width: 1024px) and (min-height: 820px)";

/**
 * "clear": over the hero, on white. "away": the hero is diving through a letter and the screen is
 * mostly black, so the bar steps out of the way. "solid": a white bar once the work begins.
 */
type Mode = "clear" | "away" | "solid";

export function Nav() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  const [mode, setMode] = useState<Mode>("clear");
  const [menu, setMenu] = useState(false); // phones only: the inline links are hidden below sm

  useEffect(() => {
    const pinned = window.matchMedia(HERO_PINNED);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let last: Mode = "clear";
    const update = () => {
      const y = window.scrollY;
      // the hero only pins (and dives) when motion is allowed and the viewport is big enough
      const diving = pinned.matches && !reduced.matches;
      const heroEnd = window.innerHeight * 1.1;
      const next: Mode = y <= 40 ? "clear" : diving && y < heroEnd ? "away" : "solid";
      if (next !== last) setMode((last = next));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!menu) return;
    const close = (e: KeyboardEvent | PointerEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !root.current?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", close);
    };
  }, [menu]);

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
      data-mode={mode}
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 [@media(max-height:500px)]:py-1 transition-[background-color,border-color,opacity,transform] duration-300 md:px-12 ${
        mode === "solid" ? "border-b border-line bg-bg/95 backdrop-blur" : "border-b border-transparent"
      } ${mode === "away" ? "!opacity-0" : ""}`}
    >
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          scrollTo(0);
        }}
        className="display pointer-events-auto inline-flex min-h-11 min-w-11 items-center text-2xl text-fg [--wght:800]"
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
            className="label hidden min-h-11 min-w-11 items-center justify-center text-fg transition-opacity hover:opacity-60 sm:inline-flex"
          >
            {item.label}
          </a>
        ))}
        <button
          type="button"
          aria-expanded={menu}
          aria-controls="mobile-menu"
          onClick={() => setMenu((m) => !m)}
          className="label inline-flex min-h-11 items-center px-1 text-fg sm:hidden"
        >
          {menu ? "Close" : "Menu"}
        </button>
        <Magnetic>
          <a
            href={contact.business.href}
            className="label inline-flex min-h-11 items-center rounded-full border border-fg px-4 text-fg transition-colors hover:bg-fg hover:text-bg"
          >
            Let&apos;s talk
          </a>
        </Magnetic>
      </nav>
      {menu && (
        <ul
          id="mobile-menu"
          className="pointer-events-auto absolute right-4 top-full mt-1 min-w-44 rounded-[6px] border border-line bg-bg py-1 sm:hidden"
        >
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setMenu(false);
                  scrollTo(item.href);
                }}
                className="label flex min-h-11 items-center px-4 text-fg"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
