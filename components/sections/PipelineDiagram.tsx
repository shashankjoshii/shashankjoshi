import { useState } from "react";
import { gsap, type ScrollTrigger } from "@/lib/gsap";
import { invoiceStages } from "@/lib/content";

// SVG attributes can't take CSS variables and GSAP tweens concrete values, so the palette is
// mirrored here. Keep in sync with :root in app/globals.css.
const ACCENT = "#0038FF";
const INK = "#0A0A0A";
const SURFACE = "#F4F4F5";
const WHITE = "#FFFFFF";

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
  low,
  inspect,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  step: number;
  /** Labels sit in the lower band, leaving the upper half of the box free for what travels through. */
  low?: boolean;
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
        fill={SURFACE}
        stroke={INK}
        strokeOpacity={0.25}
      />
      <text
        x={x + w / 2}
        y={low ? y + h - 38 : y + h / 2 - 3}
        textAnchor="middle"
        fill={INK}
        fontSize={w > 150 ? 18 : 15}
        fontWeight={700}
        fontFamily="var(--font-bricolage), sans-serif"
      >
        {title}
      </text>
      <text
        x={x + w / 2}
        y={low ? y + h - 16 : y + h / 2 + 20}
        textAnchor="middle"
        fill={INK}
        fillOpacity={0.72}
        fontSize={16}
        fontFamily="var(--font-sans), sans-serif"
      >
        {sub}
      </text>
    </g>
  );
}

function Edge({ d, step }: { d: string; step: number }) {
  return (
    <path
      data-edge
      data-step={step}
      d={d}
      pathLength={100}
      strokeDasharray={100}
      fill="none"
      stroke={INK}
      strokeOpacity={0.35}
      strokeWidth={1.5}
    />
  );
}

/** A node lit blue, or returned to rest. Only the node data is currently in is ever blue. */
const LIT = { stroke: ACCENT, strokeOpacity: 1, fill: WHITE, duration: 0.25 };
const REST = { stroke: INK, strokeOpacity: 0.25, fill: SURFACE, duration: 0.25 };

/* -------------------------------------------------------------------------- */
/*  AI Research Agent: question → planner → 3 researchers → synthesis          */
/* -------------------------------------------------------------------------- */

/** A labelled packet that rides an edge. Hidden until the timeline sends it. */
function Packet({ attr, label }: { attr: string; label?: string }) {
  const props = { [attr]: true };
  return (
    <g {...props} opacity={0} pointerEvents="none">
      {label ? (
        <>
          <rect x={-27} y={-11} width={54} height={22} rx={11} fill={ACCENT} />
          <text
            y={4}
            textAnchor="middle"
            fill={WHITE}
            fontSize={12}
            fontWeight={600}
            fontFamily="var(--font-sans), sans-serif"
          >
            {label}
          </text>
        </>
      ) : (
        <circle r={6} fill={ACCENT} />
      )}
    </g>
  );
}

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
        <Edge step={1} d="M130 210 H175" />
        <Edge step={2} d="M295 210 C330 210 330 80 360 80" />
        <Edge step={2} d="M295 210 H360" />
        <Edge step={2} d="M295 210 C330 210 330 340 360 340" />
        <Edge step={3} d="M480 80 C520 80 520 210 570 210" />
        <Edge step={3} d="M480 210 H570" />
        <Edge step={3} d="M480 340 C520 340 520 210 570 210" />

        <Node step={0} x={10} y={182} w={120} h={56} title="Question" sub="trigger" />
        <Node step={1} x={175} y={182} w={120} h={56} title="Planner" sub="plans angles" />
        <Node step={2} x={360} y={52} w={120} h={56} title="Researcher" sub="angle A" />
        <Node step={2} x={360} y={182} w={120} h={56} title="Researcher" sub="angle B" />
        <Node step={2} x={360} y={312} w={120} h={56} title="Researcher" sub="angle C" />
        <Node step={3} x={570} y={182} w={120} h={56} title="Synthesis" sub="writes report" />

        {/* what is being asked, and what came out */}
        <text
          data-q-text
          x={10}
          y={262}
          textAnchor="start"
          fill={INK}
          fillOpacity={0.72}
          fontSize={15}
          fontFamily="var(--font-sans), sans-serif"
        >
          “Why do users churn?”
        </text>
        {["3 angles merged", "1 report written"].map((line, i) => (
          <text
            key={line}
            data-summary-line
            x={630}
            y={268 + i * 22}
            textAnchor="middle"
            fill={INK}
            fontSize={15}
            fontFamily="var(--font-sans), sans-serif"
          >
            {line}
          </text>
        ))}

        {/* researcher progress bars */}
        {[52, 182, 312].map((y) => (
          <rect key={y} data-bar x={372} y={y + 64} width={96} height={3} rx={1.5} fill={ACCENT} />
        ))}

        {/* packets */}
        <Packet attr="data-packet-q" />
        <Packet attr="data-packet-fan" label="angle A" />
        <Packet attr="data-packet-fan" label="angle B" />
        <Packet attr="data-packet-fan" label="angle C" />
        <Packet attr="data-packet-merge" />
        <Packet attr="data-packet-merge" />
        <Packet attr="data-packet-merge" />
      </svg>
    </div>
  );
}

/**
 * "Fan-out": one question becomes three parallel angles that travel together, get worked on at
 * once, then converge into a single write-up. Scrubbed; the caller owns the ScrollTrigger config.
 * The un-animated markup already shows the finished diagram (the reduced-motion state).
 */
export function buildResearchTimeline(root: HTMLElement, scrollTrigger: ScrollTrigger.Vars) {
  const q = <T extends Element>(s: string) => gsap.utils.toArray<T>(s, root);
  const nodes = q<SVGGElement>("[data-node]");
  const boxes = q<SVGRectElement>("[data-node] [data-box]");
  const edges = q<SVGPathElement>("[data-edge]");
  const byStep = <T extends SVGElement>(list: T[], step: number) =>
    list.filter((el) => Number(el.dataset.step) === step);
  const [edgeQP] = byStep(edges, 1);
  const fanEdges = byStep(edges, 2);
  const mergeEdges = byStep(edges, 3);
  const nodeAt = (step: number) => byStep(nodes, step);
  const bars = q<SVGRectElement>("[data-bar]");
  const packetQ = root.querySelector<SVGGElement>("[data-packet-q]")!;
  const fan = q<SVGGElement>("[data-packet-fan]");
  const merge = q<SVGGElement>("[data-packet-merge]");
  const summary = q<SVGTextElement>("[data-summary-line]");

  // box index by node order: 0 question, 1 planner, 2-4 researchers, 5 synthesis
  const boxOf = (node: SVGGElement) => boxes[nodes.indexOf(node)];

  // the question is already on stage at the first frame, so the pinned card never opens empty
  gsap.set(
    nodes.filter((n) => Number(n.dataset.step) > 0),
    { opacity: 0, scale: 0.9, transformBox: "fill-box", transformOrigin: "50% 50%" },
  );
  gsap.set(edges, { strokeDashoffset: 100 });
  gsap.set(bars, { scaleX: 0, transformBox: "fill-box", transformOrigin: "0% 50%" });
  gsap.set(summary, { opacity: 0, y: 6 });

  const ride = (tl: gsap.core.Timeline, pk: SVGGElement, path: SVGPathElement, at: number, dur: number) => {
    tl.set(pk, { opacity: 1 }, at)
      .to(
        pk,
        { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: dur, ease: "power1.inOut" },
        at,
      )
      .set(pk, { opacity: 0 }, at + dur);
  };
  const appear = (tl: gsap.core.Timeline, target: gsap.TweenTarget, at: number) =>
    tl.to(target, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)", stagger: 0.1 }, at);
  const light = (tl: gsap.core.Timeline, node: SVGGElement | SVGGElement[], at: number, keep = false) => {
    const list = Array.isArray(node) ? node : [node];
    list.forEach((n) => {
      tl.to(boxOf(n), LIT, at);
      if (!keep) tl.to(boxOf(n), REST, at + 0.9);
    });
  };

  // narrow screens scroll the diagram sideways; follow the action from left to right
  const scroller = root.querySelector<HTMLElement>("[data-lenis-prevent]");
  const tl: gsap.core.Timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger,
    onUpdate: () => {
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        const p = Math.min(1, tl.time() / 6.4);
        scroller.scrollLeft = p * (scroller.scrollWidth - scroller.clientWidth);
      }
    },
  });

  // 1. the question is asked
  light(tl, nodeAt(0)[0], 0.2);

  // 2. it goes to the planner
  tl.to(edgeQP, { strokeDashoffset: 0, duration: 0.6 }, 0.9);
  ride(tl, packetQ, edgeQP, 1.0, 0.7);
  appear(tl, nodeAt(1), 1.5);
  light(tl, nodeAt(1)[0], 1.7);

  // 3. fan-out: three angles leave together
  tl.to(fanEdges, { strokeDashoffset: 0, duration: 0.6 }, 2.4);
  fan.forEach((pk, i) => ride(tl, pk, fanEdges[i], 2.5, 1.0));
  appear(tl, nodeAt(2), 3.2);
  light(tl, nodeAt(2), 3.5);

  // 4. all three researchers work at the same time
  tl.to(bars, { scaleX: 1, duration: 1.0, stagger: 0.12 }, 3.6);

  // 5. converge into synthesis
  tl.to(mergeEdges, { strokeDashoffset: 0, duration: 0.6 }, 4.9);
  merge.forEach((pk, i) => ride(tl, pk, mergeEdges[i], 5.0, 0.9));
  appear(tl, nodeAt(3), 5.5);
  light(tl, nodeAt(3)[0], 5.8, true);

  // 6. the write-up
  tl.to(summary, { opacity: 1, y: 0, duration: 0.4, stagger: 0.25 }, 6.1);
  tl.to({}, { duration: 0.5 });
  return tl;
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
              fill={i === shown ? ACCENT : INK}
              fillOpacity={i === shown ? 1 : 0.72}
              fontSize={16}
              fontWeight={i === shown ? 700 : 400}
              fontFamily="var(--font-sans), sans-serif"
              aria-hidden
            >
              {`${i + 1}  ${s.phase}`}
            </text>
          ))}

          {/* extracted data block, drawn BEFORE the nodes so fields fly through Validate (behind it) instead of across its label */}
          <g data-json transform="translate(490 268)">
            <text
              data-json-title
              y={-14}
              fill={INK}
              fillOpacity={0.72}
              fontSize={16}
              fontFamily="var(--font-sans), sans-serif"
            >
              Sample output
            </text>
            {SAMPLE_LINES.map((line, i) => (
              <g key={i}>
                <text
                  data-json-line
                  xmlSpace="preserve"
                  y={i * 22 + 14}
                  fill={INK}
                  fillOpacity={0.85}
                  fontSize={16}
                  fontFamily="var(--font-sans), sans-serif"
                >
                  {line}
                </text>
                <path
                  data-check
                  d={`M216 ${i * 22 + 9} l4 4 l8 -9`}
                  pathLength={100}
                  strokeDasharray={100}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          </g>

          <Edge step={1} d="M180 158 H250" />
          <Edge step={2} d="M420 158 H490" />
          <Edge step={3} d="M660 158 H730" />

          <Node step={0} x={10} y={100} w={170} h={116} low title="Drive" sub="invoice in" inspect={inspect(0)} />
          <Node step={1} x={250} y={100} w={170} h={116} low title="Groq" sub="OCR + extract" inspect={inspect(1)} />
          <Node step={2} x={490} y={100} w={170} h={116} low title="Validate" sub="structure fields" inspect={inspect(2)} />
          <Node step={3} x={730} y={100} w={160} h={116} low title="Drive" sub="data out" inspect={inspect(3)} />

          {/* the finished record, which carries on to Drive */}
          <rect
            data-record
            x={482}
            y={266}
            width={254}
            height={70}
            rx={8}
            fill="none"
            stroke={ACCENT}
            strokeWidth={2}
            opacity={0}
            pointerEvents="none"
          />

          {/* the invoice travelling through the pipeline */}
          <g data-doc transform="translate(95 130)" opacity={0} pointerEvents="none">
            <g data-doc-inner>
              <rect x={-20} y={-26} width={40} height={52} rx={5} fill={WHITE} stroke={INK} strokeOpacity={0.7} />
              {[-16, -8, 0, 8, 16].map((y, i) => (
                <rect
                  key={y}
                  data-doc-line
                  x={-13}
                  y={y}
                  width={i === 0 ? 16 : 26}
                  height={3}
                  rx={1.5}
                  fill={INK}
                  fillOpacity={0.45}
                />
              ))}
              <rect data-scan x={-20} y={-26} width={40} height={2} fill={ACCENT} opacity={0} />
            </g>
          </g>
        </svg>
      </div>

      {/* Adjacent metadata: follows the document as it travels, or the node under the pointer */}
      <div
        aria-live="polite"
        className="mt-4 grid min-h-[6.5rem] gap-x-8 gap-y-2 border-t border-line pt-4 md:grid-cols-[9rem_1fr]"
      >
        <div>
          <p className="font-semibold text-accent">{info.phase}</p>
          <p className="label mt-1 text-muted">Step {shown + 1} of 4</p>
        </div>
        <div>
          <p className="display text-xl leading-tight [--wght:700]">{info.title}</p>
          <p className="mt-1 max-w-md text-sm leading-snug text-muted">{info.detail}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * "Document → data": the invoice is read at Groq, then consumed at Validate. Its fields lift off
 * and land as checked key/value rows, and the finished record (not the document) is what travels
 * on to Drive. The caller owns the ScrollTrigger config.
 */
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
  const checks = q<SVGPathElement>("[data-check]");
  const jsonTitle = root.querySelector<SVGTextElement>("[data-json-title]")!;
  const record = root.querySelector<SVGRectElement>("[data-record]")!;
  const edges = q<SVGPathElement>("[data-edge]");
  const scroller = root.querySelector<HTMLElement>("[data-scroller]");

  gsap.set(edges, { strokeDashoffset: 100 });
  gsap.set(checks, { strokeDashoffset: 100 });
  // the heading waits until the rows have landed, so no field flies through it
  gsap.set(jsonTitle, { opacity: 0 });
  gsap.set(doc, { opacity: 1 }); // parked hidden in the static markup; it exists only while this plays

  const HOP = 1.2;
  const VALIDATE = HOP * 2; // the document reaches Validate
  const SEND = VALIDATE + 2.9; // the record leaves for Drive
  const END = SEND + 1.0;

  const on = (tl: gsap.core.Timeline, i: number, at: number) => tl.to(boxes[i], LIT, at);
  const off = (tl: gsap.core.Timeline, i: number, at: number) => tl.to(boxes[i], REST, at);

  // derived from the playhead, so it is correct when scrubbing backwards too
  let lastStage = -1;
  const stageAt = (t: number) => (t < HOP + 0.1 ? 0 : t < VALIDATE + 0.1 ? 1 : t < SEND ? 2 : 3);
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger,
    onUpdate: () => {
      const stage = stageAt(tl.time());
      if (stage !== lastStage) onStage?.((lastStage = stage));
      // narrow screens scroll the diagram sideways; keep the travelling document in view
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        const p = Math.min(1, tl.time() / END);
        scroller.scrollLeft = p * (scroller.scrollWidth - scroller.clientWidth);
      }
    },
  });

  // Drive → Groq → Validate: the document travels
  on(tl, 0, 0);
  for (let i = 1; i <= 2; i++) {
    const t = i * HOP;
    tl.to(edges[i - 1], { strokeDashoffset: 0, duration: HOP * 0.6 }, t - HOP + 0.2);
    tl.to(doc, { x: [240, 480][i - 1], duration: HOP, ease: "power1.inOut" }, t - HOP + 0.2);
    off(tl, i - 1, t + 0.05);
    on(tl, i, t + 0.1);
  }

  // Groq: a scan beam sweeps the page and the text lights up
  tl.set(scan, { opacity: 1, y: 0 }, HOP + 0.1)
    .to(scan, { y: 50, duration: 0.5, yoyo: true, repeat: 1 }, HOP + 0.1)
    .to(docLines, { fill: ACCENT, fillOpacity: 0.9, stagger: 0.06, duration: 0.2 }, HOP + 0.3)
    .set(scan, { opacity: 0 }, HOP + 1.15);

  // Validate: the fields lift off the document and land as key/value rows
  tl.fromTo(
    jsonLines,
    { opacity: 0, x: 70, y: (i) => -(147 + 14 * i), scale: 0.6, fill: ACCENT },
    {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      fill: INK,
      transformBox: "fill-box",
      transformOrigin: "0% 50%",
      // bottom row first, and stagger > duration: each field lands before the next lifts off, and
      // never has to cross a row that has already landed
      stagger: { each: 0.5, from: "end" },
      duration: 0.45,
      ease: "power2.out",
    },
    VALIDATE + 0.2,
  )
    .to(docLines, { fillOpacity: 0.12, stagger: 0.05, duration: 0.3 }, VALIDATE + 0.3)
    .to(checks, { strokeDashoffset: 0, stagger: 0.18, duration: 0.3 }, VALIDATE + 1.8)
    .to(doc, { opacity: 0, duration: 0.4 }, VALIDATE + 1.2)
    .to(jsonTitle, { opacity: 1, duration: 0.3 }, VALIDATE + 1.7);

  // the finished record (not the document) carries on to Drive
  tl.fromTo(record, { opacity: 0 }, { opacity: 1, duration: 0.2 }, SEND - 0.2)
    .to(edges[2], { strokeDashoffset: 0, duration: 0.6 }, SEND - 0.1)
    // animate the rect's own geometry (not a transform): it shrinks to a chip and lands on Drive's
    // upper half (810,127), clear of its label. scale + transformBox on a rect with x/y attributes throws GSAP's origin off.
    .to(record, { attr: { x: 780, y: 114, width: 60, height: 26 }, duration: 0.8, ease: "power2.inOut" }, SEND)
    .to(record, { opacity: 0, duration: 0.2 }, SEND + 0.6);
  off(tl, 2, SEND + 0.5);
  on(tl, 3, SEND + 0.7);

  // hold on the finished state so the section doesn't unpin the instant it lands
  tl.to({}, { duration: 0.6 });
  return tl;
}
