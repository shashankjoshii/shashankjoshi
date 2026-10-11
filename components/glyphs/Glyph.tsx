"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * The site's small-scale vocabulary: a handful of hand-drawn SVG glyphs that share one stroke
 * weight and one 24-unit box, so they read as a set wherever they appear. Colour is currentColor.
 *
 * Loops are GSAP tweens, so they ride the same gsap.ticker as Lenis and the 3D canvases, and they
 * pause while the glyph is off screen. Reduced motion never starts them: the glyph is a still SVG.
 */
export type GlyphName = "spark" | "asterisk" | "orbit" | "nodes" | "sun" | "moon";
export type GlyphLoop = "none" | "spin" | "orbit" | "flow";

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round" } as const;

function Shape({ name, packet }: { name: GlyphName; packet?: string }) {
  switch (name) {
    case "spark":
      return <path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />;
    case "asterisk":
      return (
        <g {...STROKE} strokeWidth={3.2}>
          <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
        </g>
      );
    case "orbit":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" {...STROKE} strokeWidth={2} />
          <circle cx="12" cy="12" r="2.6" fill="currentColor" />
          <g data-orbit>
            <circle cx="20.5" cy="12" r="2.4" fill="currentColor" />
          </g>
        </>
      );
    case "nodes":
      // two workflow nodes and the connection between them; a packet rides the line when looping
      return (
        <>
          <line x1="5" y1="12" x2="19" y2="12" {...STROKE} strokeWidth={1.6} strokeDasharray="1.6 2.4" data-wire />
          <circle cx="3.6" cy="12" r="2.8" fill="currentColor" />
          <circle cx="20.4" cy="12" r="2.8" fill="currentColor" />
          <circle cx="6" cy="12" r="1.9" fill="currentColor" style={packet ? { fill: packet } : undefined} opacity="0" data-packet />
        </>
      );
    case "sun":
      return (
        <g {...STROKE} strokeWidth={2}>
          <circle cx="12" cy="12" r="4.4" />
          <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7" />
        </g>
      );
    case "moon":
      return <path {...STROKE} strokeWidth={2} strokeLinejoin="round" d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" />;
  }
}

export function Glyph({
  name,
  loop = "none",
  duration,
  packet,
  className,
  label,
}: {
  name: GlyphName;
  loop?: GlyphLoop;
  /** Seconds per cycle; each loop has its own default. */
  duration?: number;
  /** Colour of the travelling packet on "nodes" (defaults to currentColor). */
  packet?: string;
  className?: string;
  /** Accessible name. Omit for decorative glyphs (the default). */
  label?: string;
}) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (loop === "none") return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const svg = root.current!;
        const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "none" } });

        if (loop === "spin") {
          tl.to(svg, { rotation: 360, duration: duration ?? 8, transformOrigin: "50% 50%" });
        } else if (loop === "orbit") {
          tl.to(svg.querySelector("[data-orbit]"), { rotation: 360, svgOrigin: "12 12", duration: duration ?? 3.2 });
        } else if (loop === "flow") {
          const d = duration ?? 1.8;
          const wire = svg.querySelector("[data-wire]");
          const packet = svg.querySelector("[data-packet]");
          if (wire) tl.fromTo(wire, { strokeDashoffset: 0 }, { strokeDashoffset: -8, duration: d }, 0);
          if (packet)
            tl.fromTo(packet, { attr: { cx: 6 }, opacity: 0 }, { attr: { cx: 18 }, duration: d * 0.8, ease: "power1.inOut" }, 0)
              .to(packet, { opacity: 1, duration: d * 0.15 }, 0)
              .to(packet, { opacity: 0, duration: d * 0.15 }, d * 0.65);
        }

        // only run while on screen: a dozen idle loops cost nothing, a dozen running ones do
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { rootMargin: "60px" });
        io.observe(svg);
        return () => {
          io.disconnect();
          tl.kill();
        };
      });
    },
    { scope: root, dependencies: [loop, duration] },
  );

  return (
    <svg
      ref={root}
      viewBox="0 0 24 24"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <Shape name={name} packet={packet} />
    </svg>
  );
}
