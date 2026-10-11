"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED = "(prefers-reduced-motion: reduce)";

// ---- deferred setup -------------------------------------------------------------------------
// Every section used to build its timelines and pins inside the one hydration task, a single long
// task on phones. Below-the-fold sections now set up when the browser is idle instead. Idle
// callbacks run in the order they were queued (document order), so pins still stack top to bottom,
// and ScrollTrigger is refreshed once after the last one.

let pending = 0;

function whenIdle(job: () => void): () => void {
  let cancelled = false;
  pending++;
  const run = () => {
    if (!cancelled) job();
    if (--pending === 0) ScrollTrigger.refresh();
  };
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout: 700 });
    return () => {
      if (!cancelled) {
        cancelled = true;
        window.cancelIdleCallback(id);
        if (--pending === 0) ScrollTrigger.refresh();
      }
    };
  }
  const id = window.setTimeout(run, 60);
  return () => {
    if (!cancelled) {
      cancelled = true;
      window.clearTimeout(id);
      pending--;
    }
  };
}

type GSAPConfig = Parameters<typeof useGSAP>[1];

/** Same as useGSAP, but `setup` runs when the browser is idle, still inside the same context so it
 *  is reverted on unmount exactly like a normal useGSAP callback. */
export function useGSAPIdle(setup: () => void, config?: GSAPConfig) {
  useGSAP((ctx) => whenIdle(() => void ctx.add(setup)), config);
}
