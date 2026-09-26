"use client";

import { useCallback, useEffect, useRef } from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

function ScrollSync() {
  useLenis(ScrollTrigger.update);
  return null;
}

/**
 * Lenis smooths the mouse wheel only. Touch scrolling stays native (syncTouch is off): momentum,
 * rubber-banding and the iOS toolbar collapse all behave as the platform expects.
 *
 * The tree is the same with and without reduced motion. The reduced-motion answer only arrives
 * after hydration (the server can't know it), and swapping the wrapper then would remount the
 * whole page, re-running every GSAP context and WebGL scene. Instead Lenis stays mounted but inert:
 * no smoothing, no RAF, native scroll.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (reduced) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reduced]);

  useEffect(() => {
    // images/fonts shift layout; re-measure pins and triggers once everything has loaded
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ autoRaf: false, lerp: 0.1, smoothWheel: !reduced }}
    >
      <ScrollSync />
      {children}
    </ReactLenis>
  );
}

/** Scroll to a selector/offset: eased with Lenis, instant under reduced motion. */
export function useScrollTo() {
  const lenis = useLenis();
  const reduced = useReducedMotion();
  return useCallback(
    (target: string | number) => {
      if (lenis) {
        lenis.scrollTo(target, reduced ? { immediate: true } : { duration: 1.6 });
        return;
      }
      if (typeof target === "number") {
        window.scrollTo({ top: target });
      } else {
        document.querySelector(target)?.scrollIntoView();
      }
    },
    [lenis, reduced],
  );
}
