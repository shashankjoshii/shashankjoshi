import { useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { invoiceStages } from "@/lib/content";

const GOLD = "#C9A45C";
const CREAM = "#F2EBDD";

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                               */
/* -------------------------------------------------------------------------- */

function Node({
  x,
  y,
  w,
  h,
  title,
  sub,
  step,
  inspect,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  step: number;
  /** Makes the node focusable/hoverable; used by the invoice pipeline. */
  inspect?: { label: string; onOn: () => void; onOff: () => void };
}) {
  const interactive = inspect
    ? {
        role: "button" as const,
        tabIndex: 0,
        "aria-label": inspect.label,
        style: { cursor: "pointer" },
        onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && inspect.onOn(),
        onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && inspect.onOff(),
        onFocus: inspect.onOn,
        onBlur: inspect.onOff,
        onClick: inspect.onOn,
        onKeyDown: (e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && inspect.onOn(),
      }
    : {};
  return (
    <g data-node data-step={step} {...interactive}>
      <rect
        data-box
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill="#0B0A09"
        stroke={CREAM}
        strokeOpacity={0.25}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 - 3}
        textAnchor="middle"
        fill={CREAM}
        fontSize={w > 150 ? 18 : 15}
        fontFamily="var(--font-fraunces), serif"
      >
        {title}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2 + 20}
        textAnchor="middle"
        fill={CREAM}
        fillOpacity={0.62}
        fontSize={16}
        fontFamily="var(--font-sans), sans-serif"
      >
        {sub}
      </text>
    </g>
  );
}

function Edge({ d, step, pulse }: { d: string; step: number; pulse?: boolean }) {
  return (
    <>
      <path
        data-edge
        data-step={step}
        d={d}
        pathLength={100}
        strokeDasharray={100}
        fill="none"
        stroke={CREAM}
        strokeOpacity={0.35}
        strokeWidth={1.5}
      />
      {pulse && (
        <path
          data-pulse
          data-step={step}
          d={d}
          pathLength={100}
          strokeDasharray="7 93"
          fill="none"
          stroke={GOLD}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  AI Research Agent: question → planner → 3 researchers → synthesis          */
/* -------------------------------------------------------------------------- */

export function ResearchDiagram() {
  return (
    <div className="overflow-x-auto" data-lenis-prevent>
      <svg
        data-diagram
        viewBox="0 0 720 420"
        className="mx-auto block h-auto w-full min-w-[600px]"
        role="img"
        aria-label="AI Research Agent workflow: a question goes to a planner, fans out to three parallel researchers, then a synthesis step writes the report."
      >
        <Edge step={1} pulse d="M130 210 H175" />
        <Edge step={2} pulse d="M295 210 C330 210 330 80 360 80" />
        <Edge step={2} pulse d="M295 210 H360" />
        <Edge step={2} pulse d="M295 210 C330 210 330 340 360 340" />
        <Edge step={3} pulse d="M480 80 C520 80 520 210 570 210" />
        <Edge step={3} pulse d="M480 210 H570" />
        <Edge step={3} pulse d="M480 340 C520 340 520 210 570 210" />

        <Node step={0} x={10} y={182} w={120} h={56} title="Question" sub="trigger" />
        <Node step={1} x={175} y={182} w={120} h={56} title="Planner" sub="plans angles" />
        <Node step={2} x={360} y={52} w={120} h={56} title="Researcher" sub="angle A" />
        <Node step={2} x={360} y={182} w={120} h={56} title="Researcher" sub="angle B" />
        <Node step={2} x={360} y={312} w={120} h={56} title="Researcher" sub="angle C" />
        <Node step={3} x={570} y={182} w={120} h={56} title="Synthesis" sub="writes report" />
      </svg>
    </div>
  );
}

export function animateResearch(root: HTMLElement) {
  const q = <T extends Element>(s: string) => gsap.utils.toArray<T>(s, root);
  const nodes = q<SVGGElement>("[data-node]");
  const edges = q<SVGPathElement>("[data-edge]");
  const pulses = q<SVGPathElement>("[data-pulse]");

  gsap.set(nodes, { opacity: 0, scale: 0.85, transformBox: "fill-box", transformOrigin: "50% 50%" });
  gsap.set(edges, { strokeDashoffset: 100 });

  const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
  pulses.forEach((p) => {
    const step = Number(p.dataset.step);
    loop.fromTo(
      p,
      { strokeDashoffset: 7, opacity: 1 },
      { strokeDashoffset: -100, duration: 1.1, ease: "power1.inOut" },
      (step - 1) * 0.9,
    );
  });

  let introDone = false;
  let active = false;
  const sync = () => (introDone && active ? loop.play() : loop.pause());

  const intro = gsap.timeline({
    scrollTrigger: { trigger: root, start: "top 75%", once: true },
    onComplete: () => {
      introDone = true;
      sync();
    },
  });
  for (let step = 0; step <= 3; step++) {
    const at = step * 0.55;
    intro.to(
      nodes.filter((n) => Number(n.dataset.step) === step),
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.08 },
      at,
    );
    // the last step has no outgoing edges
    const outgoing = edges.filter((e) => Number(e.dataset.step) === step + 1);
    if (outgoing.length) {
      intro.to(outgoing, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, at + 0.3);
    }
  }

  ScrollTrigger.create({
    trigger: root,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      active = self.isActive;
      sync();
    },
  });
}

/* -------------------------------------------------------------------------- */
/*  Invoice pipeline: Drive in → Groq extract → validate → Drive out           */
/* -------------------------------------------------------------------------- */

const SAMPLE_LINES = [
  "Vendor  Sharma Traders",
  "GSTIN  27AAAPS0000A1Z5",
  "Total  ₹4,250.00",
];

const STAGE_X = [95, 335, 575, 810]; // node centres, for the phase labels

export function InvoiceDiagram({ stage }: { stage: number }) {
  // hover / focus / tap overrides the scroll-driven stage until it lets go
  const [picked, setPicked] = useState<number | null>(null);
  const shown = picked ?? stage;
  const info = invoiceStages[shown];
  const inspect = (i: number) => ({
    label: `${invoiceStages[i].phase}: ${invoiceStages[i].title}`,
    onOn: () => setPicked(i),
    onOff: () => setPicked((p) => (p === i ? null : p)),
  });

  return (
    <div>
      <div className="overflow-x-auto" data-scroller data-lenis-prevent>
        <svg
          data-diagram
          viewBox="0 0 900 360"
          className="mx-auto block h-auto w-full min-w-[680px]"
          role="group"
          aria-label="Invoice extraction pipeline: an invoice enters Google Drive, is read and extracted with Groq, validated and structured, then written back to Drive. Each stage can be inspected."
        >
          {invoiceStages.map((s, i) => (
            <text
              key={s.phase}
              x={STAGE_X[i]}
              y={84}
              textAnchor="middle"
              fill={i === shown ? GOLD : CREAM}
              fillOpacity={i === shown ? 1 : 0.62}
              fontSize={16}
              fontFamily="var(--font-sans), sans-serif"
              aria-hidden
            >
              {`${i + 1}  ${s.phase}`}
            </text>
          ))}

          <Edge step={1} d="M180 150 H250" />
          <Edge step={2} d="M420 150 H490" />
          <Edge step={3} d="M660 150 H730" />

          <Node step={0} x={10} y={100} w={170} h={100} title="Drive" sub="invoice in" inspect={inspect(0)} />
          <Node step={1} x={250} y={100} w={170} h={100} title="Groq" sub="OCR + extract" inspect={inspect(1)} />
          <Node step={2} x={490} y={100} w={170} h={100} title="Validate" sub="structure fields" inspect={inspect(2)} />
          <Node step={3} x={730} y={100} w={160} h={100} title="Drive" sub="data out" inspect={inspect(3)} />

          {/* extracted data block */}
          <g data-json transform="translate(490 224)">
            <text
              y={-8}
              fill={CREAM}
              fillOpacity={0.62}
              fontSize={16}
              fontFamily="var(--font-sans), sans-serif"
            >
              Sample output
            </text>
            {SAMPLE_LINES.map((line, i) => (
              <text
                key={i}
                data-json-line
                xmlSpace="preserve"
                y={i * 22 + 14}
                fill={CREAM}
                fillOpacity={0.8}
                fontSize={16}
                fontFamily="var(--font-sans), sans-serif"
              >
                {line}
              </text>
            ))}
          </g>

          {/* the invoice travelling through the pipeline */}
          <g data-doc transform="translate(95 150)" pointerEvents="none">
            <g data-doc-inner>
              <rect x={-30} y={-42} width={60} height={84} rx={6} fill="#141210" stroke={CREAM} strokeOpacity={0.7} />
              {[-26, -14, -2, 10, 22].map((y, i) => (
                <rect
                  key={y}
                  data-doc-line
                  x={-20}
                  y={y}
                  width={i === 0 ? 24 : 40}
                  height={3}
                  rx={1.5}
                  fill={CREAM}
                  fillOpacity={0.45}
                />
              ))}
              <rect data-scan x={-30} y={-42} width={60} height={2} fill={GOLD} opacity={0} />
            </g>
          </g>
        </svg>
      </div>

      {/* Adjacent metadata: follows the document as it travels, or the node under the pointer */}
      <div
        aria-live="polite"
        className="mt-4 grid min-h-[7.5rem] gap-x-8 gap-y-2 border-t border-line pt-4 md:grid-cols-[9rem_1fr]"
      >
        <div>
          <p className="text-gold">{info.phase}</p>
          <p className="label mt-1 text-cream-dim">Step {shown + 1} of 4</p>
        </div>
        <div>
          <p className="display text-xl leading-tight">{info.title}</p>
          <p className="mt-1 max-w-md text-sm leading-snug text-cream-dim">{info.detail}</p>
        </div>
      </div>
    </div>
  );
}

/** Builds the scrubbed timeline; the caller owns the ScrollTrigger config. */
export function buildInvoiceTimeline(
  root: HTMLElement,
  scrollTrigger: ScrollTrigger.Vars,
  onStage?: (stage: number) => void,
) {
  const q = <T extends Element>(s: string) => gsap.utils.toArray<T>(s, root);
  const boxes = q<SVGRectElement>("[data-node] [data-box]");
  const doc = root.querySelector<SVGGElement>("[data-doc]")!;
  const docLines = q<SVGRectElement>("[data-doc-line]");
  const scan = root.querySelector<SVGRectElement>("[data-scan]")!;
  const jsonLines = q<SVGTextElement>("[data-json-line]");
  const edges = q<SVGPathElement>("[data-edge]");
  const scroller = root.querySelector<HTMLElement>("[data-scroller]");

  gsap.set(edges, { strokeDashoffset: 100 });
  gsap.set(jsonLines, { opacity: 0, x: -8 });

  const activate = (tl: gsap.core.Timeline, i: number, at: number) =>
    tl.to(
      boxes[i],
      { stroke: GOLD, strokeOpacity: 1, fill: "#1E1A13", duration: 0.25 },
      at,
    );

  const HOP = 1.2;
  // derived from the playhead, so it is correct when scrubbing backwards too
  let lastStage = -1;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger,
    onUpdate: () => {
      const stage = Math.min(3, Math.max(0, Math.floor((tl.time() - 0.1) / HOP)));
      if (stage !== lastStage) onStage?.((lastStage = stage));
      // narrow screens scroll the diagram sideways; keep the travelling document in view
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        const p = Math.min(1, tl.time() / (3 * HOP + 0.2));
        scroller.scrollLeft = p * (scroller.scrollWidth - scroller.clientWidth);
      }
    },
  });

  activate(tl, 0, 0);
  for (let i = 1; i <= 3; i++) {
    const t = i * HOP;
    tl.to(edges[i - 1], { strokeDashoffset: 0, duration: HOP * 0.6 }, t - HOP + 0.2);
    tl.to(doc, { x: [240, 480, 715][i - 1], duration: HOP, ease: "power1.inOut" }, t - HOP + 0.2);
    activate(tl, i, t + 0.1);
  }

  // Groq stage: scan sweep, text lines light up
  tl.set(scan, { opacity: 1, y: 0 }, HOP + 0.1)
    .to(scan, { y: 82, duration: 0.5, yoyo: true, repeat: 1 }, HOP + 0.1)
    .to(docLines, { fill: GOLD, fillOpacity: 0.9, stagger: 0.06, duration: 0.2 }, HOP + 0.3)
    .set(scan, { opacity: 0 }, HOP + 1.15);

  // Validate stage: structured data appears
  tl.to(jsonLines, { opacity: 1, x: 0, stagger: 0.14, duration: 0.3 }, HOP * 2 + 0.2);

  // hold on the finished state so the section doesn't unpin the instant it lands
  tl.to({}, { duration: 0.6 });
  return tl;
}
