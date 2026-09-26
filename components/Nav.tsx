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
  const toggle = useRef<HTMLButtonElement>(null);
  const scrollTo = useScrollTo();
  const [mode, setMode] = useState<Mode>("clear");
  const [menu, setMenu] = useState(false); // phones only: the inline links are hidden below sm

  /** Scroll to a section and move focus there, so keyboard and screen-reader users land with it
   *  (the menu link they used is unmounted, which would otherwise drop focus onto <body>). */
  const go = (href: string) => {
    scrollTo(href);
    const el = document.querySelector<HTMLElement>(href);
    if (!el) return;
    if (!el.hasAttribute("tabindex")) {
      el.setAttribute("tabindex", "-1");
      el.dataset.navTarget = "";
    }
    el.focus({ preventScroll: true });
  };

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenu(false);
      toggle.current?.focus(); // Escape hands focus back to the control that opened it
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setMenu(false);
    };
    // a dropdown left hanging over content the reader has scrolled to reads as a bug on phones
    const startY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 24) setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", onScroll);
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
      className={`nav-safe pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between transition-[background-color,border-color,opacity,transform] duration-300 ${
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
              go(item.href);
            }}
            className="label hidden min-h-11 min-w-11 items-center justify-center text-fg transition-opacity hover:opacity-60 sm:inline-flex"
          >
            {item.label}
          </a>
        ))}
        <button
          ref={toggle}
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
                  go(item.href);
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
