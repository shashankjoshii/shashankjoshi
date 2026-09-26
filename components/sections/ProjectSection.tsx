"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "@/lib/gsap";
import type { Project } from "@/lib/content";
import { SplitReveal } from "../SplitReveal";
import { SelectionSweep } from "../SelectionSweep";
import {
  ResearchDiagram,
  InvoiceDiagram,
  buildResearchTimeline,
  buildInvoiceTimeline,
  buildResearchMobile,
  buildInvoiceMobile,
} from "./PipelineDiagram";
import { DashboardZoom, buildDashboardZoom } from "./moments/DashboardZoom";
import { BrandSpecimen, buildBrandSpecimen } from "./moments/BrandSpecimen";

// Pinning needs the whole section to fit in the viewport, otherwise the bottom is cut off mid-pin.
const CAN_PIN = "(min-width: 1024px) and (min-height: 820px)";
/** Below this the diagrams swap to their compact, purpose-built layouts (see PipelineDiagram). */
const WIDE = "(min-width: 768px)";

/** Scroll distance (as % of the viewport) each pinned moment holds the screen for. */
const PIN_LENGTH: Partial<Record<Project["visual"], number>> = {
  "research-agent": 200,
  "invoice-pipeline": 360,
};
/** The product projects break the shared template: a facts line and a full-width feature. */
const isFeature = (v: Project["visual"]) =>
  v === "dashboard-zoom" || v === "brand-specimen";

/** One editorial metadata row: label column + value. */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-row grid grid-cols-[4.75rem_1fr] gap-4 py-3 sm:grid-cols-[5.5rem_1fr]">
      <dt className="label pt-px text-muted">{label}</dt>
      <dd className="text-[1.03rem] leading-snug text-muted">{children}</dd>
    </div>
  );
}

/** The table compressed to one line: role · stack, then problem → result. */
function Facts({ project }: { project: Project }) {
  const [problem, result] = project.brief ?? [project.problem, project.result];
  return (
    <div className="p-dl max-w-xl">
      <p className="p-row label text-muted">
        <span className="text-fg">{project.role}</span>
        <span aria-hidden> · </span>
        {project.tech.join(", ")}
      </p>
      <p className="p-row mt-3 text-[1.1rem] leading-snug text-muted md:text-[1.2rem]">
        {problem}
        <span className="text-accent"> &rarr; </span>
        <span className="text-fg">{result}</span>
      </p>
      {project.href && (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-row mt-4 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-8"
        >
          {project.hrefLabel ?? "View live"}
        </a>
      )}
    </div>
  );
}

/** The result sentence, with its key phrase picked out by the blue selection sweep. */
function Result({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <span className="text-fg">{text}</span>;
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
  const feature = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const featured = isFeature(project.visual);

  const prevNumber = String(index).padStart(2, "0");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ motion: MOTION_OK, pin: CAN_PIN, wide: WIDE }, (ctx) => {
        // GSAP runs this when ANY condition matches, so motion has to be checked explicitly
        const { motion, pin, wide } = ctx.conditions as {
          motion: boolean;
          pin: boolean;
          wide: boolean;
        };
        if (!motion) return;
        const section = root.current!;

        // ---- shared, deliberately quiet frame -------------------------------------------
        // the kicker's number rolls from the previous project's to this one. Wide screens only:
        // on phones a scrubbed roll leaves two clipped digits overlapping mid-view, so the current
        // number just sits there.
        if (wide) {
          const roll = {
            trigger: section,
            start: "top 95%",
            end: "top 25%",
            scrub: true,
          };
          gsap.set(".p-digit-out", { visibility: "visible" });
          gsap.fromTo(
            ".p-digit-in",
            { yPercent: 100 },
            { yPercent: 0, ease: "none", scrollTrigger: roll },
          );
          gsap.fromTo(
            ".p-digit-out",
            { yPercent: 0 },
            { yPercent: -100, ease: "none", scrollTrigger: roll },
          );
        }

        // ---- depth: the outlined numeral drifts slower than the page and inflates from hairline to
        // heavy as it passes (the site's weight motif); the visual tilts toward the pointer
        const ghost = gsap.fromTo(
          ".p-ghost",
          { yPercent: 30, "--wght": 150, "--wdth": 80 },
          {
            yPercent: -30,
            "--wght": 900,
            "--wdth": 100,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        const cleanups: Array<() => void> = [
          () => {
            ghost.scrollTrigger?.kill();
            ghost.kill();
          },
        ];
        if (
          !featured &&
          window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
          visual.current?.parentElement
        ) {
          // the wrapper, not the visual: the moments animate transforms on the visual itself
          const card = visual.current.parentElement;
          gsap.set(card, {
            transformPerspective: 1400,
            transformStyle: "preserve-3d",
          });
          const rx = gsap.quickTo(card, "rotationX", {
            duration: 0.8,
            ease: "power3.out",
          });
          const ry = gsap.quickTo(card, "rotationY", {
            duration: 0.8,
            ease: "power3.out",
          });
          const move = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 7);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 5);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          card.addEventListener("pointermove", move);
          card.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerleave", leave);
            gsap.set(card, { clearProps: "transform" });
          });
        }

        // Metadata rows. Deliberately NOT a scrollTrigger-bound tween: a once-trigger that fires
        // while a ScrollTrigger.refresh() is in flight (images, fonts, the KIRO grid swap) has its
        // linked animation reverted/killed mid-play and the rows stay at ~0.1 opacity forever on
        // phones. The trigger only starts a free-standing tween, so a refresh can't strand it.
        const rows = gsap.utils.toArray<HTMLElement>(".p-row", section);
        gsap.set(rows, { y: 18, opacity: 0 });
        let shown = false;
        const showRows = () => {
          if (shown) return;
          shown = true;
          gsap.to(rows, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          });
        };
        ScrollTrigger.create({
          trigger: section.querySelector(".p-dl"),
          start: "top 88%",
          once: true,
          onEnter: showRows,
        });
        // belt and braces: if the section is well into view and the trigger never fired, show anyway
        ScrollTrigger.create({
          trigger: section,
          start: "top 40%",
          once: true,
          onEnter: showRows,
        });

        // stacked sheets: this section slides over the previous one, which settles back.
        // Real elements, not a selector string: the previous section is outside this scope.
        const prevInner = prevId
          ? document
              .getElementById(prevId)
              ?.querySelector<HTMLElement>(".p-inner")
          : null;
        if (prevInner) {
          gsap.fromTo(
            prevInner,
            { scale: 1, opacity: 1 },
            {
              scale: 0.95,
              opacity: 0.5,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
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
                // phones: the visual sits at the bottom of a short section, so "bottom 45%" is
                // often unreachable and the moment would stop half-built. Finish while it's on screen.
                start: wide ? "top 75%" : "top 88%",
                end: wide ? "bottom 45%" : "bottom 78%",
                scrub: 0.6,
              };

        if (project.visual === "research-agent")
          (wide ? buildResearchTimeline : buildResearchMobile)(
            visual.current!,
            trigger,
          );
        if (project.visual === "invoice-pipeline")
          (wide ? buildInvoiceTimeline : buildInvoiceMobile)(
            visual.current!,
            trigger,
            setStage,
          );
        // the features scrub through the section as it passes; nothing pins
        if (project.visual === "dashboard-zoom")
          cleanups.push(
            buildDashboardZoom(
              feature.current!,
              {
                trigger: feature.current,
                start: wide ? "top 88%" : "top 90%",
                end: wide ? "top 12%" : "top 40%",
                scrub: 0.6,
              },
              !wide,
            ),
          );
        if (project.visual === "brand-specimen")
          cleanups.push(
            buildBrandSpecimen(feature.current!, {
              trigger: feature.current,
              start: "top 92%",
              end: wide ? "top 30%" : "top 45%",
              scrub: 0.6,
            }),
          );

        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
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
        {/* a huge blue numeral behind everything, drifting at its own speed: a second plane of depth */}
        <span
          aria-hidden
          className="p-ghost display pointer-events-none absolute -right-[4vw] top-[6%] select-none text-[clamp(14rem,42vw,44rem)] leading-none text-transparent [-webkit-text-stroke:1.5px_rgb(0_56_255/0.55)] [--wdth:90] [--wght:520] max-md:-right-[20vw] max-md:top-[1%] max-md:text-[clamp(9rem,46vw,13rem)] max-md:opacity-50 md:max-lg:right-[1vw] md:max-lg:text-[25vw]"
        >
          {project.index}
        </span>
        <div className="relative">
          <p className="label mb-3 flex items-center gap-1.5 text-muted">
            <span className="sr-only">
              Project {index + 1} of {total}
            </span>
            <span aria-hidden>Project</span>
            <span
              aria-hidden
              className="relative inline-block h-[1.4em] overflow-hidden tabular-nums"
            >
              <span className="p-digit-in block leading-[1.4] text-accent">
                {project.index}
              </span>
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
                : "text-[clamp(3rem,min(11vw,19svh),12rem)]"
            }`}
          >
            <SplitReveal text={project.name} />
          </h2>
          {project.alias && (
            <p className="mt-3 text-sm text-muted">{project.alias}</p>
          )}
          {featured && (
            <div className="mt-6 lg:mt-8">
              <Facts project={project} />
            </div>
          )}
        </div>

        {featured && project.image && (
          <div ref={feature} className="relative mt-10 lg:mt-12">
            {project.visual === "dashboard-zoom" && (
              <DashboardZoom
                src={project.image}
                alt={`${project.name} dashboard`}
              />
            )}
            {project.visual === "brand-specimen" && (
              <BrandSpecimen src={project.image} name={project.name} />
            )}
          </div>
        )}

        {!featured && (
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
        )}
      </div>
    </section>
  );
}
