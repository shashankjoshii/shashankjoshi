import { gsap } from "@/lib/gsap";

type Axes = { w: number; d: number };

/**
 * Pointer weight field: glyphs near the cursor swell from `rest` toward `peak` and spring back.
 * Only the few glyphs inside `radius` of the pointer ever change, so the cost stays small.
 * Returns a cleanup. `enabled()` lets the caller suspend it (e.g. while the hero exit scrubs).
 */
export function attachWeightField(
  section: HTMLElement,
  chars: HTMLElement[],
  { rest, peak, enabled }: { rest: Axes; peak: Axes; enabled: () => boolean },
) {
  const set = chars.map((el) => ({
    el,
    w: gsap.quickTo(el, "--wght", { duration: 0.6, ease: "power3" }),
    d: gsap.quickTo(el, "--wdth", { duration: 0.6, ease: "power3" }),
  }));

  let raf = 0;
  let pt: { x: number; y: number } | null = null;

  const apply = () => {
    raf = 0;
    if (!pt || !enabled()) return;
    for (const c of set) {
      const r = c.el.getBoundingClientRect();
      const radius = r.height * 0.9;
      const dist = Math.hypot(pt.x - (r.left + r.width / 2), pt.y - (r.top + r.height / 2));
      const t = Math.max(0, 1 - dist / radius);
      c.w(rest.w + (peak.w - rest.w) * t);
      c.d(rest.d + (peak.d - rest.d) * t);
    }
  };
  const settle = () => {
    pt = null;
    set.forEach((c) => (c.w(rest.w), c.d(rest.d)));
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    pt = { x: e.clientX, y: e.clientY };
    if (!raf) raf = requestAnimationFrame(apply);
  };

  section.addEventListener("pointermove", move, { passive: true });
  section.addEventListener("pointerleave", settle);
  return () => {
    section.removeEventListener("pointermove", move);
    section.removeEventListener("pointerleave", settle);
    cancelAnimationFrame(raf);
  };
}
