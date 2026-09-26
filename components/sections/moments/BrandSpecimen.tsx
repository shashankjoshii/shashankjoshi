"use client";

import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ShotZoom } from "./ShotZoom";

// Native capture size; crops are shown at native size at most, never enlarged.
const W = 1530;
const H = 793;
const CREAM = "#F8F6F2"; // KIRO's page colour, sampled from the capture, so the crops sit seamlessly
const HEADLINE = { x: 172, y: 246, w: 518, h: 174 };
const FOX = { x: 950, y: 225, w: 360, h: 320 };
/** Type guides on the headline crop, in crop pixels (measured on the capture). */
const GUIDES = [
  { y: 18, label: "Cap height" },
  { y: 72, label: "Baseline" },
  { y: 101, label: "x-height" },
  { y: 147, label: "Baseline" },
];

/** A region of the capture at native size (or smaller when the column is narrower). */
function Crop({
  src,
  r,
  alt,
  className = "",
  sizes,
}: {
  src: string;
  r: typeof HEADLINE;
  alt: string;
  className?: string;
  sizes: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: `${r.w}px`, maxWidth: "100%", aspectRatio: `${r.w} / ${r.h}` }}
    >
      <Image
        src={src}
        alt={alt}
        width={W}
        height={H}
        sizes={sizes}
        className="absolute left-0 top-0 h-auto max-w-none"
        style={{
          width: `${(W / r.w) * 100}%`,
          marginLeft: `${(-r.x / r.w) * 100}%`,
          marginTop: `${(-r.y / r.w) * 100}%`,
        }}
      />
    </div>
  );
}

/**
 * KIRO: its brand, framed on purpose. A full-bleed band in KIRO's own cream holds their serif
 * headline presented as a type specimen (quoted, with its guides drawn), and their fox mascot,
 * at native size, cropped by the edge of the page. Their serif against this site's condensed sans
 * is the contrast, and the band says whose voice is whose.
 */
export function BrandSpecimen({ src, name }: { src: string; name: string }) {
  return (
    <div
      data-bs-band
      className="relative -mx-4 mt-8 overflow-hidden md:-mx-12 lg:mt-10"
      style={{ background: CREAM }}
    >
      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-0 pt-8 md:px-12 md:pt-12 lg:min-h-[25rem] lg:grid-cols-12 lg:gap-10 lg:py-14">
        <figure className="relative z-[1] min-w-0 lg:col-span-7">
          <figcaption className="label flex flex-wrap gap-x-3 text-muted">
            <span className="text-fg">Specimen</span>
            <span>{name}&rsquo;s display serif, from its homepage</span>
          </figcaption>

          <blockquote className="relative mt-6 md:mt-8">
            <span
              aria-hidden
              className="display absolute -left-1 -top-6 select-none text-[4.5rem] leading-none text-fg/15 [--wght:700] md:-left-8 md:-top-7 md:text-[6rem]"
            >
              &ldquo;
            </span>
            <div data-bs-spec className="relative w-fit max-w-full">
              <Crop
                src={src}
                r={HEADLINE}
                alt="KIRO's headline, set in their serif: “AI tools, actually useful.”"
                sizes="(min-width: 768px) 518px, 92vw"
              />
              {/* guides: they extend past the crop and are labelled at the right on wider screens */}
              {GUIDES.map((g, i) => (
                <span
                  key={i}
                  aria-hidden
                  data-bs-guide
                  className="pointer-events-none absolute -left-3 -right-3 h-px origin-left md:-right-28"
                  style={{
                    top: `${(g.y / HEADLINE.h) * 100}%`,
                    background:
                      i % 2 ? "rgb(0 56 255 / 0.45)" : "rgb(10 10 10 / 0.16)",
                  }}
                >
                  <span className="label absolute -top-2.5 right-0 hidden translate-x-full whitespace-nowrap pl-2 text-[0.75rem] text-muted md:block">
                    {g.label}
                  </span>
                </span>
              ))}
            </div>
          </blockquote>

          <p className="label mt-8 max-w-sm text-muted">
            <span className="text-fg">The serif is their voice.</span> The
            condensed sans is this site&rsquo;s. Each keeps its own.
          </p>
          <ShotZoom
            src={src}
            alt={`${name} homepage`}
            width={W}
            height={H}
            label="View the full homepage"
            className="mt-2"
          />
        </figure>

        {/* the mascot, at native size, walking off the edge of the page */}
        <figure className="relative flex justify-end self-end max-lg:-mr-24 lg:absolute lg:bottom-0 lg:right-0 lg:-mr-16">
          <div data-bs-fox className="relative w-[360px] max-w-full origin-bottom">
            <Crop src={src} r={FOX} alt={`${name}'s fox mascot`} sizes="360px" />
            <figcaption className="label absolute bottom-6 right-[calc(100%-3.5rem)] whitespace-nowrap pr-3 text-muted lg:right-full">
              Kiro, their mascot
            </figcaption>
          </div>
        </figure>
      </div>
    </div>
  );
}

export function buildBrandSpecimen(
  root: HTMLElement,
  scrollTrigger: ScrollTrigger.Vars,
) {
  const band = root.querySelector<HTMLElement>("[data-bs-band]")!;
  const spec = root.querySelector<HTMLElement>("[data-bs-spec] > div")!;
  const guides = gsap.utils.toArray<HTMLElement>("[data-bs-guide]", root);
  const fox = root.querySelector<HTMLElement>("[data-bs-fox]")!;

  gsap.set(band, { clipPath: "inset(0% 0% 0% 100%)" });
  gsap.set(guides, { scaleX: 0 });
  gsap.set(spec, { clipPath: "inset(0% 100% 0% 0%)" });
  gsap.set(fox, { yPercent: 45, rotation: -5 });

  const tl = gsap.timeline({ defaults: { ease: "none" } });
  // the band, in their colour, wipes in from the edge the fox will walk off
  tl.to(
    band,
    { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "power3.inOut" },
    0,
  )
    // the guides are ruled first, then the line is set on them, left to right
    .to(
      guides,
      { scaleX: 1, duration: 0.3, ease: "power2.out", stagger: 0.05 },
      0.3,
    )
    .to(
      spec,
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power2.inOut" },
      0.45,
    )
    // the fox peeks up from the bottom of the band
    .to(
      fox,
      { yPercent: 0, rotation: 0, duration: 0.45, ease: "back.out(1.4)" },
      0.55,
    )
    .to({}, { duration: 0.1 });

  const st = ScrollTrigger.create({ ...scrollTrigger, animation: tl });
  return () => {
    st.kill();
    tl.kill();
    gsap.set([band, spec, fox, ...guides], {
      clearProps: "transform,clipPath",
    });
  };
}
