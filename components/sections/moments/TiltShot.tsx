import Image from "next/image";
import { gsap, type ScrollTrigger } from "@/lib/gsap";
import { ShotCrop, ShotZoom } from "./ShotZoom";

/** Billzy: the dashboard starts lying flat like a ledger on a shop counter, then stands up. */
export function TiltShot({ src, alt }: { src: string; alt: string }) {
  return (
    <div data-tilt-stage className="relative [perspective:1400px]">
      <div data-tilt className="relative [transform-origin:50%_100%]">
        <div className="relative overflow-hidden rounded-[6px] border border-line bg-surface">
          {/* phones: zoom on the stat cards + quick actions; tap for the whole dashboard */}
          <ShotCrop x={39} y={14}>
            <Image
              src={src}
              alt={alt}
              width={1535}
              height={797}
              sizes="(min-width: 1024px) 58vw, (min-width: 768px) 100vw, 250vw"
              className="h-auto w-full"
            />
          </ShotCrop>
          <ShotZoom src={src} alt={`${alt}, full view`} />
        </div>
      </div>
      {/* contact shadow: tightens as the screen lands upright */}
      <div
        aria-hidden
        data-tilt-shadow
        className="pointer-events-none absolute inset-x-[6%] -bottom-6 h-8 rounded-[50%] bg-black/25 blur-2xl"
      />
    </div>
  );
}

/** Transforms only, so it stays on the compositor. The resting state (no motion) is upright. */
export function buildTilt(root: HTMLElement, scrollTrigger: ScrollTrigger.Vars) {
  const tilt = root.querySelector<HTMLElement>("[data-tilt]")!;
  const shadow = root.querySelector<HTMLElement>("[data-tilt-shadow]")!;

  gsap.set(tilt, { rotateX: 62, y: 70, scale: 0.9 });
  gsap.set(shadow, { scaleX: 1.15, opacity: 0.9 });

  return gsap
    .timeline({ defaults: { ease: "power2.out" }, scrollTrigger })
    .to(tilt, { rotateX: 0, y: 0, scale: 1, duration: 1 }, 0)
    .to(shadow, { scaleX: 0.85, opacity: 0.35, duration: 1 }, 0);
}
