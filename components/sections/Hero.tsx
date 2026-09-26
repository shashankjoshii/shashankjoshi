"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";
import { onReady } from "@/lib/ready";
import { attachWeightField } from "@/lib/weightField";
import { site } from "@/lib/content";
import { SplitReveal } from "../SplitReveal";
import { SelectionSweep } from "../SelectionSweep";
import { Scene3D } from "../three/Scene3D";

// Pinning needs the whole hero to fit in the viewport for the zoom-through.
const CAN_PIN = "(min-width: 1024px) and (min-height: 820px)";

// The name rests below the font's maximum so the pointer field has room to swell it. Layout is
// fitted at the maximum (800/100), so swelling never overflows the gutter.
const REST = { w: 700, d: 96 };
const PEAK = { w: 800, d: 100 };
const START = { w: 200, d: 75 };

// The "o" counter is a tall narrow ellipse. Where its centre sits inside the o's box (fraction of
// the height) and its half-width / half-height as a fraction of the font size, measured from the
// rendered glyph. Only the zoom-through depends on them.
const COUNTER_Y = 0.5;
const COUNTER_RX = 0.1;
const COUNTER_RY = 0.26;

const SWEPT_PHRASE = "automations that run";

/** Sets --name-size so "Shashank" at max weight spans the container, capped by viewport height. */
function useFitName(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = root.current;
    const box = section?.querySelector<HTMLElement>(".hero-name")?.parentElement;
    if (!section || !box) return;

    const ghost = document.createElement("span");
    ghost.className = "display";
    ghost.setAttribute("aria-hidden", "true");
    ghost.textContent = "Shashank";
    Object.assign(ghost.style, {
      position: "absolute",
      visibility: "hidden",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      fontSize: "100px",
    });
    ghost.style.setProperty("--wght", String(PEAK.w));
    ghost.style.setProperty("--wdth", String(PEAK.d));
    section.appendChild(ghost);

    let last = 0;
    const fit = () => {
      const ratio = ghost.getBoundingClientRect().width / 100;
      if (!ratio || !box.clientWidth) return;
      const size = Math.min((box.clientWidth / ratio) * 0.995, window.innerHeight * (window.innerHeight < 500 ? 0.25 : 0.38));
      if (Math.abs(size - last) < 0.5) return;
      last = size;
      section.style.setProperty("--name-size", `${size.toFixed(1)}px`);
      ScrollTrigger.refresh();
    };

    fit();
    void document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      ro.disconnect();
      ghost.remove();
    };
  }, [root]);
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  useFitName(root);

  useGSAP(
    () => {
      const section = root.current!;
      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, pin: CAN_PIN }, (ctx) => {
        // GSAP runs this when ANY condition matches, so motion has to be checked explicitly
        const { motion, pin } = ctx.conditions as { motion: boolean; pin: boolean };
        if (!motion) return;

        const name = section.querySelector<HTMLElement>(".hero-name")!;
        const grid = section.querySelector<HTMLElement>(".hero-grid")!;
        const orb = section.querySelector<HTMLElement>(".hero-orb")!;
        const chars = gsap.utils.toArray<HTMLElement>("[data-name] [data-inner]", section);
        const rest = gsap.utils.toArray<HTMLElement>(".hero-rest", section);
        const fade = gsap.utils.toArray<HTMLElement>(".hero-fade", section);

        // "at rest" gates the cursor depth-parallax below: on the pinned path it must let go the
        // instant the zoom-through engages (progress is only ever written to by that branch, so it
        // stays 0 — always "at rest" — on the non-pinned path, where there is no exit to protect).
        let progress = 0;
        const atRest = () => progress < 0.001;

        // ---- entrance: letters rise through their masks while inflating from thin/narrow ----
        gsap.set(fade, { y: 24, opacity: 0 });
        gsap.set(".hero-line", { scaleX: 0 });
        gsap.set(".hero-role [data-inner]", { yPercent: 115 });
        gsap.set(".hero-p .sweep", { "--k": 0 });

        const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
        tl.fromTo(
          chars,
          { "--wght": START.w, "--wdth": START.d },
          {
            "--wght": REST.w,
            "--wdth": REST.d,
            duration: 1.5,
            ease: "back.out(1.3)",
            stagger: 0.045,
          },
          0,
        )
          .to(chars, { yPercent: 0, duration: 1.3, stagger: 0.045 }, 0)
          .to(".hero-line", { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, 0.5)
          .to(".hero-role [data-inner]", { yPercent: 0, duration: 1, stagger: 0.06 }, 0.8)
          .to(fade, { y: 0, opacity: 1, duration: 1 }, 1.1)
          .to(".hero-p .sweep", { "--k": 1, duration: 0.9, ease: "power3.inOut" }, 1.7);

        let entered = false;
        let onEntered = () => {};
        tl.eventCallback("onComplete", () => {
          entered = true;
          // per-glyph will-change would keep each letter a 1x bitmap; the exit needs live vectors
          gsap.set(chars, { willChange: "auto" });
          onEntered();
        });
        const off = onReady(() => tl.play());

        const cleanups: Array<() => void> = [off, () => tl.kill()];

        // ---- depth parallax: cursor moves the grid, orb and name at different rates, so the orb
        // reads as sitting in real space behind the letters rather than pasted flat on top of them.
        // Damped via gsap.quickTo (itself ticked by gsap.ticker, the same loop driving Lenis and the
        // 3D canvases — see Stage.tsx's FrameDriver), so nothing snaps between pointer samples.
        // Frozen the instant the zoom-through engages (atRest, above) and always live on the
        // non-pinned path, where there is no exit to protect.
        const fineForParallax = window.matchMedia("(hover: hover) and (pointer: fine)");
        if (fineForParallax.matches) {
          const layers = [
            { el: grid, rateX: 3, rateY: 2 }, // furthest: barely moves
            { el: orb, rateX: 8, rateY: 5 }, // middle
            { el: name, rateX: 11, rateY: 6 }, // nearest — the focus, so it leads, but only a few px
          ];
          const setters = layers.map(({ el }) => ({
            x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
            y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
          }));
          const onMove = (e: PointerEvent) => {
            if (!atRest()) return;
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            layers.forEach(({ rateX, rateY }, i) => {
              setters[i].x(nx * rateX);
              setters[i].y(ny * rateY);
            });
          };
          const onLeave = () =>
            layers.forEach((_, i) => {
              setters[i].x(0);
              setters[i].y(0);
            });
          section.addEventListener("pointermove", onMove, { passive: true });
          section.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            section.removeEventListener("pointermove", onMove);
            section.removeEventListener("pointerleave", onLeave);
          });
        }

        if (pin) {
          // ---- exit: hold the viewport, swell the name and dive through the "o" of Joshi ----
          // (progress and atRest are declared above, shared with the depth-parallax below)
          const o = section.querySelectorAll<HTMLElement>(".hero-l2 .mask")[1];

          // offset* ignores transforms, so this is valid at any scroll position; both boxes share
          // the same offsetParent (the positioned wrapper around the name)
          let origin = { x: 0, y: 0 }; // viewport position of the counter while the hero is pinned
          const setOrigin = () => {
            if (!o) return;
            const x = o.offsetLeft - name.offsetLeft + o.offsetWidth / 2;
            const y = o.offsetTop - name.offsetTop + o.offsetHeight * COUNTER_Y;
            gsap.set(name, { transformOrigin: `${x}px ${y}px` });
            const wrap = name.offsetParent as HTMLElement;
            origin = { x: wrap.offsetLeft + name.offsetLeft + x, y: wrap.offsetTop + name.offsetTop + y };
          };
          // scale at which the counter ellipse reaches every viewport edge (ellipse, so with margin)
          const target = () => {
            const size = parseFloat(getComputedStyle(name).fontSize);
            const dx = Math.max(origin.x, window.innerWidth - origin.x);
            const dy = Math.max(origin.y, window.innerHeight - origin.y);
            return Math.max(dx / (size * COUNTER_RX), dy / (size * COUNTER_RY)) * 1.12;
          };

          const exit = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=110%",
              pin: true,
              scrub: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefresh: setOrigin,
              onUpdate: (self) => {
                progress = self.progress;
                // glyph widths (and so the o's centre) can still be settling from the pointer field
                if (progress < 0.03) setOrigin();
              },
            },
            defaults: { ease: "none" },
          });
          exit
            // the cursor-parallax above stops updating once the exit engages (atRest goes false),
            // so whatever small offset it last held is pinned here instead of drifting further
            .set([grid, orb, name], { x: 0, y: 0 }, 0)
            .to(rest, { opacity: 0, y: -40, duration: 0.18 }, 0)
            // the graph paper leaves before the white-out, so the hand-off to the work is pure white
            .to(".hero-grid", { opacity: 0, duration: 0.4 }, 0.15)
            .to(".hero-orb", { opacity: 0, y: -60, duration: 0.35 }, 0.05)
            // the ink turns accent as it swells, so the frame you pass through is designed blue,
            // not an unstyled black flash; it is fully blue well before the glyph fills the screen
            .to(name, { color: "#0038ff", duration: 0.4, ease: "power1.inOut" }, 0.15)
            .to(name, { scale: () => target(), duration: 1, ease: "power3.in", force3D: false }, 0);

          // the letters only reach their final widths once the entrance ends
          onEntered = setOrigin;
          cleanups.push(() => {
            exit.scrollTrigger?.kill();
            exit.kill();
          });

          // ---- pointer weight field: fine pointers only, and only while the exit is idle ----
          const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
          if (fine.matches) {
            const field = attachWeightField(
              section,
              chars.filter((c) => !c.closest(".hero-role")),
              { rest: REST, peak: PEAK, enabled: () => entered && atRest() },
            );
            cleanups.push(field);
          }
        } else {
          // ---- no room to pin: the name thins and drifts away as the hero scrolls off ----
          const st = { trigger: section, start: "top top", end: "bottom top", scrub: true };
          const thin = gsap.fromTo(
            chars,
            { "--wght": REST.w, "--wdth": REST.d },
            { "--wght": 300, "--wdth": 80, ease: "none", scrollTrigger: st, immediateRender: false },
          );
          // three-tier scroll depth to match the cursor parallax above: grid (furthest) drifts the
          // least, the name (middle) a bit more, the orb (nearest, front-and-centre once the type
          // has scrolled up past it) the most — the same ordering the existing name/orb rates
          // already implied, just completed with the grid instead of it staying static.
          const drift = gsap.to(name, { yPercent: -14, ease: "none", scrollTrigger: st });
          const orbDrift = gsap.to(orb, { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: st });
          const gridDrift = gsap.to(grid, { yPercent: -6, opacity: 0, ease: "none", scrollTrigger: st });
          cleanups.push(() => {
            thin.scrollTrigger?.kill();
            thin.kill();
            drift.scrollTrigger?.kill();
            drift.kill();
            orbDrift.scrollTrigger?.kill();
            orbDrift.kill();
            gridDrift.scrollTrigger?.kill();
            gridDrift.kill();
          });
        }

        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  const [before, after] = site.positioning.split(SWEPT_PHRASE);
  const swept = after !== undefined;

  return (
    <section
      id="top"
      ref={root}
      className="relative isolate flex min-h-svh flex-col justify-end overflow-clip px-4 pb-14 pt-28 md:px-12 md:pb-16 [@media(max-height:500px)]:pb-4 [@media(max-height:500px)]:pt-[3.75rem]"
    >
      {/* graph-paper texture: hero only, faint, fading out toward the edges */}
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10" />

      {/* the liquid-glass orb: 3D depth behind the type, so the name sits in front of something */}
      <Scene3D
        kind="orb"
        className="hero-orb absolute -z-[5] left-1/2 top-[9%] h-[36svh] w-[78vw] -translate-x-1/2 md:left-auto md:right-[-3%] md:top-[5%] md:h-[74svh] md:w-[54vw] md:translate-x-0 [@media(max-height:500px)]:hidden"
      />

      <div className="relative">
        <div
          data-name
          className="hero-name display text-[length:var(--name-size,19vw)] [--wdth:96] [--wght:700]"
        >
          <h1 aria-label={site.name}>
            <span className="hero-l1 block">
              <SplitReveal text="Shashank" by="chars" trigger="manual" className="block whitespace-nowrap" />
            </span>
            <span className="hero-l2 block pl-[34%]">
              <SplitReveal text="Joshi" by="chars" trigger="manual" className="block whitespace-nowrap" />
            </span>
          </h1>
        </div>
      </div>

      <div className="hero-rest">
        <div className="hero-line mt-8 [@media(max-height:500px)]:mt-3 h-px origin-left bg-fg/30" />

        <div className="mt-6 [@media(max-height:500px)]:mt-3 grid gap-6 md:grid-cols-12 md:items-end">
          <p className="hero-role whitespace-nowrap text-lg font-medium text-fg md:col-span-5">
            <SplitReveal text={site.role} trigger="manual" />
          </p>
          <p className="hero-fade hero-p max-w-xl text-lg leading-snug text-muted md:col-span-6 md:col-start-7 md:text-xl">
            {swept ? (
              <>
                {before}
                <SelectionSweep trigger="manual">{SWEPT_PHRASE}</SelectionSweep>
                {after}
              </>
            ) : (
              site.positioning
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
