"use client";

import { useEffect, useRef } from "react";
import { curtainGone, markReady } from "@/lib/ready";

/**
 * Intro curtain. The count, the weight swell and the bar are pure CSS (see "Preloader" in
 * globals.css), so they start at first paint instead of waiting for hydration, and a CSS fail-safe
 * lifts the curtain on its own if scripts are slow or fail. This component only does the part CSS
 * can't: wait for the count to finish *and* the page to hydrate, lift the curtain, release scroll,
 * and signal `markReady` so the hero entrance can start while the curtain is still clearing.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // reduced motion: the curtain is display:none in CSS, nothing to wait for
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || curtainGone()) {
      markReady();
      return;
    }

    // slow device: the CSS fail-safe is already lifting the curtain, so don't restart it
    const failsafe = el.getAnimations().find((a) => (a as CSSAnimation).animationName === "pre-failsafe");
    const progress = failsafe?.effect?.getComputedTiming().progress;
    if (progress != null && progress > 0) {
      const t = window.setTimeout(markReady, 250);
      return () => window.clearTimeout(t);
    }

    const html = document.documentElement;
    let cancelled = false;
    let timer = 0;
    html.style.overflow = "hidden";

    const end = (e: AnimationEvent) => {
      if (e.target !== el) return;
      el.style.display = "none";
      html.style.overflow = "";
    };

    const lift = () => {
      if (cancelled) return;
      el.addEventListener("animationend", end);
      el.dataset.lift = "";
      // the hero starts rising while the curtain is still clearing. data-intro is what starts the
      // CSS entrance (see "Hero entrance" in globals.css); it is only set on this path, never when
      // the CSS fail-safe lifted the curtain, because switching animations late would replay them.
      timer = window.setTimeout(() => {
        document.documentElement.dataset.intro = "1";
        markReady();
      }, 300);
    };

    const counting = count.current?.getAnimations() ?? [];
    void Promise.allSettled(counting.map((a) => a.finished)).then(lift);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      el.removeEventListener("animationend", end);
      html.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="preloader fixed inset-0 z-[80] flex items-end bg-bg p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] md:p-10"
    >
      {/* the digits are generated content (counter(n) in CSS), so they are not a text node: the
          curtain can never become the page's largest contentful paint */}
      <span
        ref={count}
        className="pre-count display text-[22vw] leading-none text-fg tabular-nums md:text-[12vw]"
      />
      <div className="absolute inset-x-0 bottom-0 h-px bg-line">
        <div className="pre-bar h-full origin-left bg-accent" />
      </div>
    </div>
  );
}
