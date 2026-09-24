"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** A small ring that follows the pointer and grows over anything clickable. Fine pointers only. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const r = ring.current;
    if (reduced || !fine || !r) return;

    document.documentElement.classList.add("has-cursor");
    gsap.set(r, { xPercent: -50, yPercent: -50 });
    const x = gsap.quickTo(r, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(r, "y", { duration: 0.35, ease: "power3" });

    const move = (e: MouseEvent) => {
      gsap.to(r, { opacity: 1, duration: 0.3, overwrite: "auto" });
      x(e.clientX);
      y(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const hot = (e.target as HTMLElement).closest("a, button, [role='button']");
      gsap.to(r, { scale: hot ? 2.4 : 1, duration: 0.35, ease: "power3.out", overwrite: "auto" });
    };
    const leave = () => gsap.to(r, { opacity: 0, duration: 0.3 });

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [reduced]);

  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] h-4 w-4 rounded-full border border-cream/70 opacity-0"
    />
  );
}
