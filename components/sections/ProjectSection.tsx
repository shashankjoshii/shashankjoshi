"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, MOTION_OK, type ScrollTrigger } from "@/lib/gsap";
import type { Project } from "@/lib/content";
import { SplitReveal } from "../SplitReveal";
import { SelectionSweep } from "../SelectionSweep";
import {
  ResearchDiagram,
  InvoiceDiagram,
  buildResearchTimeline,
  buildInvoiceTimeline,
} from "./PipelineDiagram";
import { TiltShot, buildTilt } from "./moments/TiltShot";
import { MosaicShot, buildMosaic, useMosaicGrid } from "./moments/MosaicShot";

// Pinning needs the whole section to fit in the viewport, otherwise the bottom is cut off mid-pin.
const CAN_PIN = "(min-width: 1024px) and (min-height: 820px)";

/** Scroll distance (as % of the viewport) each pinned moment holds the screen for. */
const PIN_LENGTH: Partial<Record<Project["visual"], number>> = {
  "research-agent": 160,
  "invoice-pipeline": 260,
  mosaic: 110,
};

/** One editorial metadata row: label column + value. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-row grid grid-cols-[4.75rem_1fr] gap-4 py-3 sm:grid-cols-[5.5rem_1fr]">
      <dt className="label pt-px text-muted">{label}</dt>
      <dd className="text-[1.03rem] leading-snug text-muted">{children}</dd>
    </div>
  );
}

/** The result sentence, with its key phrase picked out by the blue selection sweep. */
function Result({ text, highlight }: { text: string; highlight: string }) {
  const at = text.indexOf(highlight);
  if (at < 0) return <span className="text-fg">{text}</span>;
  return (
    <span className="text-fg">
      {text.slice(0, at)}
      <SelectionSweep>{highlight}</SelectionSweep>
      {text.slice(at + highlight.length)}
    </span>
  );
}

export function ProjectSection({
  project,
  index,
  total,
  prevId,
}: {
  project: Project;
  index: number;
  total: number;
  prevId?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const grid = useMosaicGrid();

  const prevNumber = String(index).padStart(2, "0");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, pin: CAN_PIN }, (ctx) => {
        // GSAP runs this when ANY condition matches, so motion has to be checked explicitly
        const { motion, pin } = ctx.conditions as { motion: boolean; pin: boolean };
        if (!motion) return;
        const section = root.current!;

        // ---- shared, deliberately quiet frame -------------------------------------------
        // the kicker's number rolls from the previous project's to this one
        const roll = { trigger: section, start: "top 95%", end: "top 25%", scrub: true };
        gsap.set(".p-digit-out", { visibility: "visible" });
        gsap.fromTo(".p-digit-in", { yPercent: 100 }, { yPercent: 0, ease: "none", scrollTrigger: roll });
        gsap.fromTo(".p-digit-out", { yPercent: 0 }, { yPercent: -100, ease: "none", scrollTrigger: roll });

        gsap.from(gsap.utils.toArray<HTMLElement>(".p-row", section), {
          y: 18,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".p-dl", start: "top 82%", once: true },
        });

        // stacked sheets: this section slides over the previous one, which settles back
        if (prevId) {
          gsap.fromTo(
            `#${prevId} .p-inner`,
            { scale: 1, opacity: 1 },
            {
              scale: 0.95,
              opacity: 0.5,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: true },
            },
          );
        }

        // ---- this project's own moment ----------------------------------------------------
        const len = PIN_LENGTH[project.visual];
        // pinned + scrubbed when it fits; scrubbed through the section otherwise
        const trigger: ScrollTrigger.Vars =
          pin && len
            ? {
                trigger: section,
                start: "top top",
                end: `+=${len}%`,
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
              }
            : {
                trigger: visual.current,
                start: "top 75%",
                end: "bottom 45%",
                scrub: 0.6,
              };

        if (project.visual === "research-agent") buildResearchTimeline(visual.current!, trigger);
        if (project.visual === "invoice-pipeline")
          buildInvoiceTimeline(visual.current!, trigger, setStage);
        if (project.visual === "mosaic") buildMosaic(visual.current!, trigger);
        if (project.visual === "counter-tilt")
          buildTilt(visual.current!, {
            trigger: visual.current,
            start: "top 90%",
            end: "top 30%",
            scrub: 0.6,
          });
      });
    },
    { scope: root, dependencies: [grid.cols] },
  );

  return (
    <section
      id={project.id}
      ref={root}
      aria-labelledby={`${project.id}-title`}
      className={`relative bg-bg ${index > 0 ? "shadow-[0_-28px_50px_-30px_rgb(0_0_0/0.12)]" : ""}`}
      style={{ zIndex: index + 1 }}
    >
      <div className="p-inner relative flex min-h-svh flex-col justify-center overflow-hidden px-4 py-20 [transform-origin:50%_100%] md:px-12 lg:py-10">
        <div className="relative">
          <p className="label mb-3 flex items-center gap-1.5 text-muted">
            <span className="sr-only">
              Project {index + 1} of {total}
            </span>
            <span aria-hidden>Project</span>
            <span aria-hidden className="relative inline-block h-[1.4em] overflow-hidden tabular-nums">
              <span className="p-digit-in block leading-[1.4]">{project.index}</span>
              <span className="p-digit-out invisible absolute inset-x-0 top-0 block leading-[1.4]">
                {prevNumber}
              </span>
            </span>
            <span aria-hidden>/ {String(total).padStart(2, "0")}</span>
          </p>
          <h2
            id={`${project.id}-title`}
            className={`display ${
              PIN_LENGTH[project.visual]
                ? "text-[clamp(2.8rem,min(8.5vw,14svh),9rem)]"
                : "text-[clamp(3rem,min(12vw,22svh),13rem)]"
            }`}
          >
            <SplitReveal text={project.name} />
          </h2>
          {project.alias && <p className="mt-3 text-sm text-muted">{project.alias}</p>}
        </div>

        <div className="relative mt-8 grid w-full grid-cols-1 items-center gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-4">
            <dl className="p-dl max-w-md divide-y divide-line border-y border-line">
              <Row label="Problem">{project.problem}</Row>
              <Row label="Build">{project.build}</Row>
              <Row label="Role">{project.role}</Row>
              <Row label="Stack">
                <span className="text-fg">{project.tech.join(", ")}</span>
              </Row>
              <Row label="Result">
                <Result text={project.result} highlight={project.highlight} />
              </Row>
            </dl>

            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-8"
              >
                {project.hrefLabel ?? "View live"}
              </a>
            )}
          </div>

          <div className="relative min-w-0 lg:col-span-8">
            <div ref={visual}>
              {project.visual === "counter-tilt" && project.image && (
                <TiltShot src={project.image} alt={`${project.name} screenshot`} />
              )}
              {project.visual === "mosaic" && project.image && (
                <MosaicShot src={project.image} alt={`${project.name} screenshot`} grid={grid} />
              )}
              {project.visual === "research-agent" && (
                <div className="rounded-[6px] border border-line bg-surface p-4 md:p-6">
                  <ResearchDiagram />
                </div>
              )}
              {project.visual === "invoice-pipeline" && (
                <div className="rounded-[6px] border border-line bg-surface p-4 md:p-6">
                  <InvoiceDiagram stage={stage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
