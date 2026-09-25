"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { gsap, type ScrollTrigger } from "@/lib/gsap";

const ASPECT = 1535 / 797;
const DESKTOP = { cols: 20, rows: 10 }; // 200 cells
const MOBILE = { cols: 10, rows: 5 }; // 50 cells

type Grid = { cols: number; rows: number };

/** 200 cells on desktop, 50 on narrow screens. Lives in the section so its GSAP context can rebuild. */
export function useMosaicGrid() {
  const [grid, setGrid] = useState<Grid>(DESKTOP);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setGrid(mq.matches ? DESKTOP : MOBILE);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return grid;
}

/**
 * KIRO: the real screenshot is always underneath. Under motion, a grid of slices of the same
 * image flies in from scatter and assembles, then hands off to the real image. Without motion the
 * slices stay invisible and the screenshot is simply there.
 */
export function MosaicShot({ src, alt, grid }: { src: string; alt: string; grid: Grid }) {
  const { cols, rows } = grid;
  const cells = Array.from({ length: cols * rows }, (_, i) => i);

  return (
    <div className="relative overflow-hidden rounded-[6px] border border-line bg-surface">
      <Image
        data-mosaic-real
        src={src}
        alt={alt}
        width={1535}
        height={797}
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="h-auto w-full"
      />
      <div
        aria-hidden
        data-mosaic
        data-cols={cols}
        data-rows={rows}
        className="pointer-events-none absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          aspectRatio: ASPECT,
        }}
      >
        {cells.map((i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          return (
            <span
              key={i}
              data-cell
              className="invisible block"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${(c / (cols - 1)) * 100}% ${(r / (rows - 1)) * 100}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function buildMosaic(root: HTMLElement, scrollTrigger: ScrollTrigger.Vars) {
  const mosaic = root.querySelector<HTMLElement>("[data-mosaic]")!;
  const real = root.querySelector<HTMLElement>("[data-mosaic-real]")!;
  const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", mosaic);
  const cols = Number(mosaic.dataset.cols);
  const rows = Number(mosaic.dataset.rows);

  gsap.set(real, { opacity: 0 });
  gsap.set(cells, {
    visibility: "visible",
    x: () => gsap.utils.random(-700, 700),
    y: () => gsap.utils.random(-420, 420),
    rotation: () => gsap.utils.random(-50, 50),
    scale: 0.3,
    opacity: 0,
  });

  return gsap
    .timeline({ defaults: { ease: "none" }, scrollTrigger })
    .to(
      cells,
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: { amount: 0.9, from: "center", grid: [rows, cols] },
      },
      0,
    )
    // hand off to the real image so no sub-pixel seams remain, then drop the slices
    .to(real, { opacity: 1, duration: 0.15 }, 1.5)
    .set(cells, { visibility: "hidden" }, 1.65)
    .to({}, { duration: 0.3 });
}
