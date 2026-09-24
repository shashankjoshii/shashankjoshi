"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import type { Project } from "@/lib/content";
import { SplitReveal } from "../SplitReveal";
import {
  ResearchDiagram,
  InvoiceDiagram,
  animateResearch,
  buildInvoiceTimeline,
} from "./PipelineDiagram";

// Pinning needs the whole section to fit in the viewport, otherwise the bottom is cut off mid-pin.
const CAN_PIN = "(min-width: 1024px) and (min-height: 820px)";

/** One editorial metadata row: label column + value. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[4.75rem_1fr] gap-4 py-3 sm:grid-cols-[5.5rem_1fr]">
      <dt className="label pt-px text-cream-dim">{label}</dt>
      <dd className="text-[1.03rem] leading-snug text-cream-dim">{children}</dd>
    </div>
  );
}

export function ProjectSection({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, pin: CAN_PIN }, (ctx) => {
        // GSAP runs this when ANY condition matches, so motion has to be checked explicitly
        const { motion, pin } = ctx.conditions as { motion: boolean; pin: boolean };
        if (!motion) return;
        const section = root.current!;

        // oversized index numeral drifts against the scroll
        gsap.fromTo(
          ".p-index",
          { yPercent: 25 },
          {
            yPercent: -25,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
          },
        );

        // small framed object → focus → expansion: the visual opens up inside its viewfinder ticks
        const arrive = { trigger: section, start: "top 90%", end: "top 25%", scrub: true };
        gsap.fromTo(
          visual.current,
          { clipPath: "inset(14% 10% 14% 10% round 6px)", scale: 0.94 },
          { clipPath: "inset(0% 0% 0% 0% round 6px)", scale: 1, ease: "none", scrollTrigger: arrive },
        );
        if (project.visual === "screenshot") {
          gsap.fromTo(".p-shot img", { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: arrive });
        }

        if (project.visual === "research-agent") {
          animateResearch(visual.current!);
        }

        if (project.visual === "invoice-pipeline") {
          // pinned + scrubbed when it fits; scrubbed through the section otherwise
          buildInvoiceTimeline(
            visual.current!,
            pin
              ? {
                  trigger: section,
                  start: "top top",
                  end: "+=150%",
                  pin: true,
                  scrub: 0.6,
                  anticipatePin: 1,
                }
              : {
                  trigger: visual.current,
                  start: "top 70%",
                  end: "bottom 40%",
                  scrub: 0.6,
                },
            setStage,
          );
        }
      });
    },
    { scope: root },
  );

  return (
    <section
      id={project.id}
      ref={root}
      aria-labelledby={`${project.id}-title`}
      className="relative flex min-h-svh items-center overflow-hidden border-t border-line px-6 py-24 md:px-12 lg:py-0"
    >
      <span
        aria-hidden
        className="p-index display pointer-events-none absolute -left-[2vw] top-1/2 -translate-y-1/2 select-none text-[38vw] text-transparent opacity-40 will-change-transform [-webkit-text-stroke:1px_rgb(242_235_221_/_0.18)] lg:text-[30vw]"
      >
        {project.index}
      </span>

      <div className="relative grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-5">
          <h2 id={`${project.id}-title`} className="display text-[clamp(2.4rem,5.2vw,5.2rem)]">
            <SplitReveal text={project.name} />
          </h2>
          {project.alias && <p className="mt-3 text-sm text-cream-dim">{project.alias}</p>}

          <dl className="mt-8 max-w-md divide-y divide-line border-y border-line">
            <Row label="Problem">{project.problem}</Row>
            <Row label="Build">{project.build}</Row>
            <Row label="Role">{project.role}</Row>
            <Row label="Stack">
              <span className="text-cream">{project.tech.join(", ")}</span>
            </Row>
            <Row label="Result">
              <span className="text-cream">{project.result}</span>
            </Row>
          </dl>

          {project.href && (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-11 items-center text-cream underline decoration-gold underline-offset-8 transition-colors hover:text-gold"
            >
              {project.hrefLabel ?? "View live"}
            </a>
          )}
        </div>

        <div className="relative min-w-0 lg:col-span-7">
          <div className="relative">
            <div
              ref={visual}
              className="overflow-hidden rounded-[6px] border border-line bg-ink-2 will-change-transform"
            >
              {project.visual === "screenshot" && project.image && (
                <div className="p-shot">
                  <div className="overflow-hidden">
                    <Image
                      src={project.image}
                      alt={`${project.name} screenshot`}
                      width={1535}
                      height={797}
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              )}
              {project.visual === "research-agent" && (
                <div className="p-6 md:p-10">
                  <ResearchDiagram />
                </div>
              )}
              {project.visual === "invoice-pipeline" && (
                <div className="p-6 md:p-10">
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
