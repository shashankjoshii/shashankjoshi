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

  const solid = mode === "solid";

  return (
    <header
      ref={root}
      data-mode={mode}
      // faded out during the dive: take the links out of the tab order and hit-testing too
      inert={mode === "away"}
      className={`nav-safe pointer-events-none fixed inset-x-0 top-0 z-50 transition-[opacity,transform] duration-300 ${
        mode === "away" ? "!opacity-0" : ""
      }`}
    >
      {/* Once the work begins the bar becomes a floating pill: it narrows to the content and a glass
          surface fades in behind it. Only the pill's max-width and padding move; the surface itself
          is a separate layer that fades and scales, so the change is one smooth morph. */}
      <div
        className={`relative mx-auto flex items-center justify-between transition-[max-width,padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          solid ? "max-w-[58rem] py-1 pl-4 pr-1 sm:pl-5" : "max-w-full px-0 py-0"
        }`}
      >
        <span
          aria-hidden
          className={`absolute inset-0 -z-10 rounded-full bg-bg/80 shadow-soft inset-shadow-highlight ring-1 ring-line backdrop-blur-md transition-[opacity,transform] duration-500 motion-reduce:transition-none ${
            solid ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"
          }`}
        />
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollTo(0);
          }}
          className="pointer-events-auto inline-flex min-h-11 min-w-11 items-center gap-2"
          aria-label="SJ, back to top"
        >
          <span className="display text-2xl text-fg [--wght:800]">SJ</span>
          {/* availability: a small ink dot with a slow breathing ring */}
          <span aria-hidden className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-fg/40 motion-safe:animate-[breathe_2.8s_ease-in-out_infinite]" />
            <span className="h-1.5 w-1.5 rounded-full bg-fg" />
          </span>
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
              className="group label inline-flex min-h-11 items-center gap-2 rounded-full border border-fg pl-4 pr-3.5 text-fg transition-colors hover:bg-fg hover:text-bg active:scale-[0.98]"
            >
              Contact me
              {/* the arrow leaves up-right and a fresh one arrives from bottom-left */}
              <span aria-hidden className="relative inline-block h-3 w-3 overflow-hidden">
                <Arrow className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-hover:translate-x-full" />
                <Arrow className="absolute inset-0 -translate-x-full translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:translate-y-0" />
              </span>
            </a>
          </Magnetic>
        </nav>
      {menu && (
        <ul
          id="mobile-menu"
          className="pointer-events-auto absolute right-0 top-full mt-2 min-w-44 rounded-2xl bg-bg py-1.5 shadow-soft inset-shadow-highlight ring-1 ring-line sm:hidden"
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
      </div>
    </header>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" />
    </svg>
  );
}
