"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { onReady } from "@/lib/ready";
import { site } from "@/lib/content";
import { SplitReveal } from "../SplitReveal";

const HeroAura = dynamic(() => import("../HeroAura"), { ssr: false });

const NAME_CLASS =
  "display text-[min(17rem,calc((100vw-3rem)/5.4))] font-[860] uppercase md:text-[min(17rem,calc((100vw-6rem)/5.4))]";

/** The name, two lines. Rendered twice: once for real, once as the aria-hidden front layer of the weave. */
function Name({ front = false }: { front?: boolean }) {
  const lines = (
    <>
      <SplitReveal text="Shashank" by="chars" trigger="manual" className="block" />
      <SplitReveal
        text="Joshi"
        by="chars"
        trigger="manual"
        className="block pl-[8%] text-gold sm:pl-[16%] lg:mr-[-0.05em]"
      />
    </>
  );
  return front ? (
    <div aria-hidden className={NAME_CLASS}>
      {lines}
    </div>
  ) : (
    <h1 className={NAME_CLASS} aria-label={site.name}>
      {lines}
    </h1>
  );
}

/**
 * The weave. The italic sits between two copies of the name: the real one below it and a
 * front copy above it. The front copy is clipped to the letters the italic should pass
 * *behind* (every second letter it crosses), so it threads through the name instead of
 * stamping over it. Everything is measured from the rendered letters.
 *
 * Fallback: if clip-path path() is unsupported, or a measurement looks wrong, the front copy
 * stays hidden and the effect degrades to the plain italic with its hairline halo.
 */
function useWeave(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = root.current;
    const name = section?.querySelector<HTMLElement>(".hero-name");
    const front = section?.querySelector<HTMLElement>(".hero-name-front");
    const script = section?.querySelector<HTMLElement>(".hero-script");
    if (!name || !front || !script) return;

    const supported =
      typeof CSS !== "undefined" && CSS.supports("clip-path", "path('M0 0H1V1Z')");

    const fallback = () => {
      front.dataset.weave = "off";
      front.style.clipPath = "";
    };

    const measure = () => {
      try {
        if (!supported) return fallback();
        const firstLine = name.querySelector("h1")?.firstElementChild;
        if (!firstLine) return fallback();
        const cells = [...firstLine.querySelectorAll<HTMLElement>(".mask")].map((l) =>
          l.getBoundingClientRect(),
        );
        const nr = name.getBoundingClientRect();
        const lr = firstLine.getBoundingClientRect();
        const sr = script.getBoundingClientRect();
        if (cells.length < 4 || nr.width < 100 || lr.height < 10 || sr.width < 10) return fallback();

        // letters of the first line the italic actually crosses (small margin so a graze doesn't count)
        const crossed = cells.filter((c) => c.width > 0 && c.right > sr.left + 8 && c.left < sr.right - 8);
        if (crossed.length < 2) return fallback();

        // italic passes in front of the 1st crossed letter, behind the 2nd, in front of the 3rd, ...
        const behind = crossed.filter((_, i) => i % 2 === 1);
        const top = lr.top - nr.top;
        const bottom = lr.bottom - nr.top;
        const d = behind
          .map((c) => {
            const l = c.left - nr.left;
            const r = c.right - nr.left;
            return `M${l.toFixed(1)} ${top.toFixed(1)}H${r.toFixed(1)}V${bottom.toFixed(1)}H${l.toFixed(1)}Z`;
          })
          .join("");
        if (!d || d.includes("NaN")) return fallback();

        front.style.clipPath = `path('${d}')`;
        front.dataset.weave = "on";
      } catch {
        fallback();
      }
    };

    fallback();
    const raf = requestAnimationFrame(measure);
    void document.fonts?.ready.then(measure);
    window.addEventListener("load", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(name);
    ro.observe(script);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", measure);
      ro.disconnect();
    };
  }, [root]);
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  useWeave(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const chars = gsap.utils.toArray<HTMLElement>("[data-name] [data-inner]");
        gsap.set(".hero-fade", { y: 24, opacity: 0 });
        gsap.set(".hero-line", { scaleX: 0 });
        gsap.set(".hero-role [data-inner]", { yPercent: 115 });
        gsap.set(".hero-script", { clipPath: "inset(-25% 100% -25% -10%)", skewX: -8 });

        const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
        tl.to(chars, { yPercent: 0, duration: 1.3, stagger: 0.045 })
          .to(".hero-line", { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, 0.5)
          .to(".hero-role [data-inner]", { yPercent: 0, duration: 1, stagger: 0.06 }, 0.8)
          .to(
            ".hero-script",
            { clipPath: "inset(-25% -10% -25% -10%)", skewX: 0, duration: 1.1, ease: "power3.out" },
            0.7,
          )
          .to(".hero-fade", { y: 0, opacity: 1, duration: 1 }, 1.1);

        const off = onReady(() => tl.play());

        // the two name layers and the italic leave at different rates so the stack reads as depth
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        const outs = [
          gsap.to(".hero-name, .hero-name-front", { yPercent: -18, opacity: 0.15, ease: "none", scrollTrigger: st }),
          gsap.to(".hero-script", { yPercent: -30, ease: "none", scrollTrigger: st }),
        ];

        return () => {
          off();
          tl.kill();
          outs.forEach((o) => o.kill());
        };
      });

      // Pointer depth: layers shift a few px at different rates. Fine pointers, motion allowed only.
      mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
        const section = root.current!;
        const layers = [
          { sel: ".hero-name", px: 1.5 },
          { sel: ".hero-name-front", px: 1.5 }, // must move exactly with the name it overlays
          { sel: ".hero-script", px: 3 },
        ].map(({ sel, px }) => ({
          px,
          x: gsap.quickTo(sel, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(sel, "y", { duration: 0.9, ease: "power3" }),
        }));

        const move = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          const r = section.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          layers.forEach((l) => {
            l.x(nx * l.px);
            l.y(ny * l.px);
          });
        };
        const rest = () => layers.forEach((l) => (l.x(0), l.y(0)));

        section.addEventListener("pointermove", move, { passive: true });
        section.addEventListener("pointerleave", rest);
        return () => {
          section.removeEventListener("pointermove", move);
          section.removeEventListener("pointerleave", rest);
        };
      });
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative isolate flex min-h-svh flex-col justify-end px-6 pb-16 pt-32 md:px-12 md:pb-20"
    >
      <HeroAura />

      <div className="relative grid">
        {/* layer 1: the name */}
        <div data-name className="hero-name relative z-10 col-start-1 row-start-1">
          <Name />
        </div>

        {/* layer 2: italic cross-line, knocked out of the name by a hairline gap */}
        <p
          aria-hidden
          data-text="full-stack & ai"
          className="hero-script script script-cut pointer-events-none relative z-20 col-start-1 row-start-1 ml-[6%] -translate-y-[0.24em] -rotate-2 self-center justify-self-start whitespace-nowrap text-gold-hi text-[clamp(1.9rem,9.6vw,7.6rem)] sm:ml-[14%] sm:-rotate-[4deg] sm:text-[clamp(1.6rem,8.4vw,8rem)]"
        >
          full-stack &amp; ai
        </p>

        {/* layer 3: front copy of the name, clipped to the letters the italic passes behind */}
        <div
          data-name
          aria-hidden
          data-weave="off"
          className="hero-name-front pointer-events-none relative z-30 col-start-1 row-start-1"
        >
          <Name front />
        </div>
      </div>

      <div className="hero-line mt-8 h-px origin-left bg-cream/30" />

      <div className="mt-6 grid gap-6 md:grid-cols-12 md:items-end">
        <p className="hero-role text-lg text-cream md:col-span-4">
          <SplitReveal text={site.role} trigger="manual" />
        </p>
        <p className="hero-fade max-w-xl text-lg leading-snug text-cream-dim md:col-span-6 md:col-start-7 md:text-xl">
          {site.positioning}
        </p>
      </div>

    </section>
  );
}
