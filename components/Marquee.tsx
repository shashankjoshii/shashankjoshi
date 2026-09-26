"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";

const WORDS = ["Products that ship", "Automations that run", "Agents that reason", "Interfaces that move"];

function Row() {
  return (
    <div className="marquee-row flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center gap-10 md:gap-16">
          <span className="display whitespace-nowrap text-[clamp(2.4rem,7vw,6.5rem)] [--wght:760]">{w}</span>
          <svg aria-hidden viewBox="0 0 24 24" className="marquee-star h-[0.5em] w-[0.5em] shrink-0 text-[clamp(2.4rem,7vw,6.5rem)]">
            <path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/**
 * A full-bleed blue band between the work and the process: the loudest the accent gets outside
 * Contact. It drifts on its own, speeds up and leans with scroll velocity, and reverses direction
 * when the scroll does. Reduced motion shows one static line.
 */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const track = root.current!.querySelector<HTMLElement>(".marquee-track")!;
        const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 28, repeat: -1 });
        const lean = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
        const stars = gsap.to(".marquee-star", { rotation: 360, ease: "none", duration: 8, repeat: -1 });

        let dir = 1;
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity();
            if (self.direction !== dir) dir = self.direction;
            const boost = Math.min(Math.abs(v) / 260, 6);
            gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.25, overwrite: true });
            gsap.to(stars, { timeScale: dir * (1 + boost), duration: 0.25, overwrite: true });
            lean(gsap.utils.clamp(-10, 10, -v / 180));
          },
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });
        // settle back to cruising speed once the scroll stops
        const settle = gsap.ticker.add(() => {
          if (Math.abs(st.getVelocity()) < 10) {
            loop.timeScale(gsap.utils.interpolate(loop.timeScale(), dir, 0.05));
            stars.timeScale(gsap.utils.interpolate(stars.timeScale(), dir, 0.05));
            lean(0);
          }
        });

        // the band slides in slightly rotated and straightens as it crosses the viewport
        const tilt = gsap.fromTo(
          root.current,
          { rotate: -2.5 },
          { rotate: 1.5, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );

        return () => {
          gsap.ticker.remove(settle);
          st.kill();
          loop.kill();
          stars.kill();
          tilt.scrollTrigger?.kill();
          tilt.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <div className="relative z-[6] overflow-x-clip py-10 md:py-16">
      <div ref={root} aria-hidden className="on-blue -mx-[4vw] bg-accent py-5 text-white shadow-[0_30px_60px_-30px_rgb(0_56_255/0.6)] md:py-7">
        <div className="marquee-track flex w-max will-change-transform">
          <Row />
          <Row />
        </div>
      </div>
    </div>
  );
}

/** A 2px blue line along the top edge that tracks reading progress. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
      );
    });
  });
  return (
    <div
      ref={bar}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0 bg-accent motion-reduce:hidden"
    />
  );
}
