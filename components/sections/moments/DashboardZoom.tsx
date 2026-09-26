"use client";

import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ShotZoom } from "./ShotZoom";

// Native capture size. The zoom is built so the image is never shown above this width (scale <= 1).
const W = 1535;
const H = 797;
const TEAL = "#0F766E"; // Billzy's primary, sampled from the capture's "Create New Invoice" button

type Rect = { x: number; y: number; w: number; h: number };
/** Image-space regions. START: where the camera opens. END: what the static layout shows. */
const DESKTOP = {
  start: { x: 560, y: 92, w: 948, h: 318 }, // unpaid / stock / profit cards, GST reports, GSTR-1 due
  end: { x: 0, y: 0, w: W, h: H }, // the whole dashboard
};
const PHONE = {
  start: { x: 1098, y: 204, w: 410, h: 208 }, // GST reports + the GSTR-1 reminder, near 1:1
  end: { x: 882, y: 92, w: 626, h: 320 }, // the cards and the reminder, still readable
};
// The static layout of the phone frame shows PHONE.end: an image 245% of the frame, offset to it.
const PHONE_SCALE = W / PHONE.end.w;

/**
 * Billzy: a camera move over the real dashboard. It opens cropped tight on the GST reminder and
 * the money cards at native pixel size, then pulls back (the frame widening as it goes) until the
 * whole dashboard is in view. The un-animated markup is the end state (reduced motion).
 * Phones open on the reminder and pull back only as far as the cards stay readable; the full
 * capture is one tap away.
 */
export function DashboardZoom({ src, alt }: { src: string; alt: string }) {
  return (
    <div data-dz>
      <div className="relative">
        <div
          data-dz-frame
          className="relative overflow-hidden rounded-[8px] bg-[#fafafa] shadow-[0_0_0_1px_rgb(10_10_10/0.08),0_30px_60px_-30px_rgb(10_10_10/0.25)] max-md:aspect-[626/320] md:aspect-[1535/797]"
        >
          <Image
            data-dz-img
            src={src}
            alt={alt}
            width={W}
            height={H}
            sizes="(min-width: 1600px) 1535px, (min-width: 768px) 100vw, 960px"
            className="absolute left-0 top-0 h-auto max-w-none origin-top-left max-md:ml-[var(--px)] max-md:mt-[var(--py)] max-md:w-[var(--pw)] md:w-full"
            style={
              {
                "--pw": `${PHONE_SCALE * 100}%`,
                "--px": `${(-PHONE.end.x / PHONE.end.w) * 100}%`,
                "--py": `${(-PHONE.end.y / PHONE.end.w) * 100}%`,
              } as React.CSSProperties
            }
          />
        </div>
        {/* leader from the teal "Create New Invoice" button down to the note (desktop: the button is in frame) */}
        <span
          aria-hidden
          data-dz-leader
          className="pointer-events-none absolute hidden w-px origin-top bg-fg/45 md:block"
          style={{
            left: `${(1388 / W) * 100}%`,
            top: `${(762 / H) * 100}%`,
            height: `calc(${(1 - 762 / H) * 100}% + 1.6rem)`,
          }}
        />
      </div>

      {/* the teal is theirs, the blue is mine: said out loud, so the two read as a pairing */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-8 gap-y-2 md:mt-5">
        <ShotZoom
          src={src}
          alt={`${alt}, full view`}
          width={W}
          height={H}
          label="View the full dashboard"
          className="md:hidden"
        />
        <div data-dz-note className="ml-auto md:mr-[3.7%] md:pt-2">
          <p className="label flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-[3px]"
                style={{ background: TEAL }}
              />
              <span>
                <span className="text-fg">Teal</span> is their brand
              </span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-[3px] bg-accent"
              />
              <span>
                <span className="text-fg">Blue</span> is this site
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** Scrubbed camera pull-back. Geometry is re-measured on every refresh, so resizes stay exact. */
export function buildDashboardZoom(
  root: HTMLElement,
  scrollTrigger: ScrollTrigger.Vars,
  phone: boolean,
) {
  const frame = root.querySelector<HTMLElement>("[data-dz-frame]")!;
  const img = root.querySelector<HTMLElement>("[data-dz-img]")!;
  const note = root.querySelector<HTMLElement>("[data-dz-note]")!;
  const leader = root.querySelector<HTMLElement>("[data-dz-leader]")!;
  const { start, end } = phone ? PHONE : DESKTOP;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
  });

  let geo = {
    fw: 0,
    fh: 0,
    se: 1,
    startClip: { x: 0, y: 0, w: 0, h: 0 } as Rect,
  };
  const measure = () => {
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const se = fw / end.w; // static scale: end region fills the frame width
    const s0 = Math.min(1, fw / start.w, fh / start.h); // native size at most
    const cw = start.w * s0;
    const ch = start.h * s0;
    geo = {
      fw,
      fh,
      se,
      // hangs from the top edge, so it sits right under the facts and grows downward
      startClip: { x: (fw - cw) / 2, y: 0, w: cw, h: ch },
    };
  };

  const state = { p: 0 };
  const apply = () => {
    const { fw, fh, se, startClip } = geo;
    if (!fw) return;
    const t = state.p;
    // the window on screen, and the part of the image it shows, both travel start → end
    const clip = lerpRect(startClip, { x: 0, y: 0, w: fw, h: fh }, t);
    const view = lerpRect(start, end, t);
    const s = clip.w / view.w;
    // screen position of the image origin, relative to where the static layout puts it
    const ox = clip.x - s * view.x + end.x * se;
    const oy = clip.y - s * view.y + end.y * se;
    gsap.set(img, { x: ox, y: oy, scale: s / se, force3D: false });
    const r = gsap.utils.interpolate(14, 8, t);
    frame.style.clipPath = `inset(${clip.y}px ${fw - clip.x - clip.w}px ${fh - clip.y - clip.h}px ${clip.x}px round ${r}px)`;
  };

  measure();
  gsap.set(img, { transformOrigin: "0 0" });
  gsap.set(note, { opacity: 0, y: 10 });
  gsap.set(leader, { scaleY: 0 });

  const tl = gsap.timeline({ defaults: { ease: "none" } });
  tl.to(state, { p: 1, duration: 1, ease: "power2.inOut", onUpdate: apply }, 0)
    .to(leader, { scaleY: 1, duration: 0.14, ease: "power2.out" }, 0.9)
    .to(note, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.96)
    .to({}, { duration: 0.08 });
  apply();

  const st = ScrollTrigger.create({
    ...scrollTrigger,
    animation: tl,
    onRefresh: () => {
      measure();
      apply();
    },
  });

  return () => {
    st.kill();
    tl.kill();
    frame.style.clipPath = "";
    gsap.set([img, note, leader], { clearProps: "transform,opacity" });
  };
}
