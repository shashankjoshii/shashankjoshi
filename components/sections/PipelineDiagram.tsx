import { useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
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

/**
 * The route an edge will take, drawn as a faint dotted line so the whole pipeline is legible from
 * the first frame. Motion only: hidden in the static (reduced-motion) markup, where the solid edge
 * already says everything.
 */
function Track({ d }: { d: string }) {
  return (
    <path
      data-track
      d={d}
      fill="none"
      stroke={INK}
      strokeOpacity={0.22}
      strokeWidth={1.25}
      strokeDasharray="2 5"
      strokeLinecap="round"
      opacity={0}
    />
  );
}

/** An edge with its dotted track underneath. */
function Link({ d, step }: { d: string; step: number }) {
  return (
    <>
      <Track d={d} />
      <Edge d={d} step={step} />
    </>
  );
}

/** A node lit blue, or returned to rest. Only the node data is currently in is ever blue. */
const LIT = { stroke: ACCENT, strokeOpacity: 1, fill: WHITE, duration: 0.25 };
const REST = { stroke: INK, strokeOpacity: 0.25, fill: SURFACE, duration: 0.25 };
/** Nodes the data hasn't reached yet: present, but ghosted, so the first pinned frame shows the whole route. */
const GHOST = 0.34;

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
          <rect x={-31} y={-12} width={62} height={24} rx={12} fill={ACCENT} />
          <text
            y={4.5}
            textAnchor="middle"
            fill={WHITE}
            fontSize={13}
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
    <>
      <ResearchStack />
      <div className="hidden overflow-x-auto md:block" data-lenis-prevent>
      <svg
        data-diagram
        viewBox="0 0 720 420"
        className="mx-auto block h-auto w-full min-w-[600px]"
        role="img"
        aria-label="AI Research Agent workflow: a question goes to a planner, fans out to three parallel researchers, then a synthesis step writes the report."
      >
        <Link step={1} d="M130 210 H175" />
        <Link step={2} d="M295 210 C330 210 330 80 360 80" />
        <Link step={2} d="M295 210 H360" />
        <Link step={2} d="M295 210 C330 210 330 340 360 340" />
        <Link step={3} d="M480 80 C520 80 520 210 570 210" />
        <Link step={3} d="M480 210 H570" />
        <Link step={3} d="M480 340 C520 340 520 210 570 210" />

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

        {/* researcher progress bars, over a grey track that only exists while the scene plays */}
        {[52, 182, 312].map((y) => (
          <g key={y}>
            <rect data-bar-track x={372} y={y + 64} width={96} height={3} rx={1.5} fill={INK} fillOpacity={0.1} opacity={0} />
            <rect data-bar x={372} y={y + 64} width={96} height={3} rx={1.5} fill={ACCENT} />
          </g>
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
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Compact layouts for phones (< md). The SVGs are 600-680px wide and would    */
/*  either scroll sideways or shrink their text to ~5px, so phones get a         */
/*  vertical flow built from real HTML at real reading size.                     */
/* -------------------------------------------------------------------------- */

const REST_BORDER = "rgba(10,10,10,0.25)";

function MNode({ title, sub, step }: { title: string; sub: string; step: number }) {
  return (
    <div
      data-m-node
      data-m-step={step}
      className="rounded-[12px] border border-fg/25 bg-surface px-3 py-2.5 text-center"
    >
      <p className="display text-[1rem] leading-tight [--wght:700]">{title}</p>
      <p className="text-[0.8125rem] leading-snug text-muted">{sub}</p>
    </div>
  );
}

/** A vertical link over a faint track; the track only shows while the scene plays. */
function MLink({ step }: { step: number }) {
  return (
    <span aria-hidden className="relative mx-auto block h-6 w-px">
      <span data-m-track className="absolute inset-0 bg-fg/15 opacity-0" />
      <span data-m-link data-m-step={step} className="absolute inset-0 origin-top bg-fg/35" />
    </span>
  );
}

function ResearchStack() {
  return (
    <div
      data-m-research
      role="img"
      aria-label="AI Research Agent workflow: a question goes to a planner, fans out to three parallel researchers, then a synthesis step writes the report."
      className="md:hidden"
    >
      <MNode step={0} title="Question" sub="trigger" />
      <p data-m-text className="mt-2 text-center text-[0.875rem] text-muted">
        &ldquo;Why do users churn?&rdquo;
      </p>
      <MLink step={1} />
      <MNode step={1} title="Planner" sub="plans angles" />
      <MLink step={2} />
      <div className="grid grid-cols-3 gap-2">
        {["A", "B", "C"].map((a) => (
          <div
            key={a}
            data-m-node
            data-m-step={2}
            className="rounded-[12px] border border-fg/25 bg-surface px-1.5 py-2.5 text-center"
          >
            <p className="display text-[0.9375rem] leading-tight [--wght:700]">Researcher</p>
            <p className="text-[0.8125rem] leading-snug text-muted">angle {a}</p>
            <span className="relative mx-auto mt-2 block h-[3px] w-4/5 overflow-hidden rounded-full">
              <span data-m-track className="absolute inset-0 bg-fg/10 opacity-0" />
              <span data-m-bar className="absolute inset-0 origin-left bg-accent" />
            </span>
          </div>
        ))}
      </div>
      <MLink step={3} />
      <MNode step={3} title="Synthesis" sub="writes report" />
      <p data-m-summary className="mt-2 text-center text-[0.875rem] leading-snug text-fg">
        3 angles merged
        <br />1 report written
      </p>
    </div>
  );
}

/**
 * Scrubbed reveal for the phone layout, in the same three states as the desktop diagram: ghosted
 * (not reached), blue (working), solid (done). Every node is on screen from the start.
 * The un-animated markup is the finished (reduced-motion) state.
 */
export function buildResearchMobile(root: HTMLElement, scrollTrigger: ScrollTrigger.Vars) {
  const q = <T extends Element>(s: string) => gsap.utils.toArray<T>(s, root);
  const at = (sel: string, step: number) =>
    q<HTMLElement>(sel).filter((el) => Number(el.dataset.mStep) === step);
  const bars = q<HTMLElement>("[data-m-bar]");
  const summary = q<HTMLElement>("[data-m-summary]");
  const [question] = at("[data-m-node]", 0);

  gsap.set(q("[data-m-track]"), { opacity: 1 });
  gsap.set(
    q<HTMLElement>("[data-m-node]").filter((n) => n.dataset.mStep !== "0"),
    { opacity: GHOST },
  );
  gsap.set(question, { borderColor: ACCENT, backgroundColor: WHITE });
  gsap.set(q("[data-m-link]"), { scaleY: 0 });
  gsap.set(bars, { scaleX: 0 });
  gsap.set(summary, { opacity: 0, y: 6 });

  const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger });
  const arrive = (n: HTMLElement[], t: number) =>
    tl.to(n, { opacity: 1, borderColor: ACCENT, backgroundColor: WHITE, duration: 0.25, stagger: 0.06 }, t);
  const done = (n: HTMLElement[], t: number) =>
    tl.to(n, { borderColor: REST_BORDER, backgroundColor: SURFACE, duration: 0.25 }, t);
  const flow = (step: number, t: number) =>
    tl.to(at("[data-m-link]", step), { scaleY: 1, duration: 0.45, ease: "power2.inOut" }, t);

  flow(1, 0.3);
  done([question], 0.6);
  arrive(at("[data-m-node]", 1), 0.7);
  flow(2, 1.2);
  done(at("[data-m-node]", 1), 1.5);
  arrive(at("[data-m-node]", 2), 1.6);
  // the three work in parallel at their own pace, and each settles when its bar is full
  const pace = [0.9, 1.3, 1.1];
  const researchers = at("[data-m-node]", 2);
  bars.forEach((b, i) => {
    tl.to(b, { scaleX: 1, duration: pace[i], ease: "power1.inOut" }, 1.9 + i * 0.06);
    done([researchers[i]], 1.9 + i * 0.06 + pace[i]);
  });
  flow(3, 3.25);
  arrive(at("[data-m-node]", 3), 3.6);
  tl.to(summary, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 3.9);
  tl.to({}, { duration: 0.3 });
  return tl;
}

function InvoiceStack({
  shown,
  pick,
}: {
  shown: number;
  pick: (i: number) => { label: string; onOn: () => void; onOff: () => void };
}) {
  const nodes = [
    ["Drive", "invoice in"],
    ["Groq", "OCR + extract"],
    ["Validate", "structure fields"],
    ["Drive", "data out"],
  ];
  return (
    <div
      data-m-invoice
      className="md:hidden"
      role="group"
      aria-label="Invoice extraction pipeline: Drive in, Groq OCR and extraction, validate, Drive out. Tap a stage to inspect it."
    >
      {nodes.map(([title, sub], i) => {
        const on = i === shown;
        const p = pick(i);
        return (
          <div key={i}>
            {i > 0 && (
              <span
                aria-hidden
                className={`mx-auto block h-5 w-px transition-colors ${i <= shown ? "bg-accent" : "bg-fg/35"}`}
              />
            )}
            <button
              type="button"
              aria-label={p.label}
              aria-pressed={on}
              onClick={p.onOn}
              className={`grid min-h-14 w-full grid-cols-[5.75rem_1fr] items-center gap-2 rounded-[12px] border px-3 py-2 text-left transition-colors ${
                on ? "border-accent bg-bg" : "border-fg/25 bg-surface"
              }`}
            >
              <span className={`whitespace-nowrap text-[0.8125rem] ${on ? "font-bold text-accent" : "text-muted"}`}>
                {i + 1}&ensp;{invoiceStages[i].phase}
              </span>
              <span>
                <span className="display block text-[1rem] leading-tight [--wght:700]">{title}</span>
                <span className="block text-[0.8125rem] leading-snug text-muted">{sub}</span>
              </span>
            </button>
          </div>
        );
      })}
      <div className="mt-4 rounded-[8px] border border-line bg-bg px-3 py-2.5">
        <p className="text-[0.8125rem] text-muted">Sample output</p>
        <ul className="mt-1 space-y-0.5 text-[0.875rem] leading-snug">
          {SAMPLE_LINES.map((line) => {
            const [k, ...v] = line.split(/\s{2,}/);
            return (
              <li key={line} className="flex items-baseline justify-between gap-3">
                <span>
                  <span className="text-muted">{k}</span>&ensp;{v.join(" ")}
                </span>
                <span aria-hidden className="text-accent">
                  &#10003;
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Phone layout: scroll progress just advances the active stage. State-driven, no tweened SVG. */
export function buildInvoiceMobile(
  _root: HTMLElement,
  scrollTrigger: ScrollTrigger.Vars,
  onStage?: (stage: number) => void,
) {
  let last = -1;
  return ScrollTrigger.create({
    ...scrollTrigger,
    scrub: undefined,
    onUpdate: (self) => {
      const stage = Math.min(3, Math.floor(self.progress * 4));
      if (stage !== last) onStage?.((last = stage));
    },
  });
}

/**
 * "Fan-out": one question becomes three parallel angles that travel together, get worked on at
 * once, then converge into a single write-up. Scrubbed; the caller owns the ScrollTrigger config.
 *
 * Three node states, so the scrub reads at a glance: ghosted (not reached yet), blue (working now),
 * solid grey (done). Every node and route is on stage from the first frame; the data is what moves.
 * The researchers finish at different times, and each angle leaves the moment its own work is done.
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
  const [question] = byStep(nodes, 0);
  const [planner] = byStep(nodes, 1);
  const researchers = byStep(nodes, 2);
  const [synthesis] = byStep(nodes, 3);
  const bars = q<SVGRectElement>("[data-bar]");
  const packetQ = root.querySelector<SVGGElement>("[data-packet-q]")!;
  const fan = q<SVGGElement>("[data-packet-fan]");
  const merge = q<SVGGElement>("[data-packet-merge]");
  const summary = q<SVGTextElement>("[data-summary-line]");

  // box index by node order: 0 question, 1 planner, 2-4 researchers, 5 synthesis
  const boxOf = (node: SVGGElement) => boxes[nodes.indexOf(node)];

  // first frame: the whole route is visible and ghosted, and the question is already live
  gsap.set(q("[data-track], [data-bar-track]"), { opacity: 1 });
  // no transformBox here: GSAP resolves SVG origins from the bbox itself, and adding fill-box on
  // top offsets every in-between frame of a scale
  gsap.set(nodes.slice(1), { opacity: GHOST, transformOrigin: "50% 50%" });
  gsap.set(boxOf(question), { stroke: ACCENT, strokeOpacity: 1, fill: WHITE });
  gsap.set(edges, { strokeDashoffset: 100 });
  gsap.set(bars, { scaleX: 0, transformOrigin: "0% 50%" });
  gsap.set(summary, { opacity: 0, y: 8 });

  const tl: gsap.core.Timeline = gsap.timeline({ defaults: { ease: "none" } });

  /** A packet rides its route while the route draws in under it, head and packet in step. */
  const travel = (pk: SVGGElement, path: SVGPathElement, at: number, dur: number) => {
    const ease = "power2.inOut";
    tl.to(path, { strokeDashoffset: 0, duration: dur, ease }, at)
      .to(pk, { opacity: 1, duration: 0.12 }, at)
      .to(pk, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: dur, ease }, at)
      .to(pk, { opacity: 0, duration: 0.12 }, at + dur - 0.1);
  };
  /** Data arrives: the node wakes from ghost to full, lights blue and gives one small beat. */
  const arrive = (node: SVGGElement, at: number) => {
    tl.to(node, { opacity: 1, duration: 0.2 }, at)
      .to(boxOf(node), LIT, at)
      .to(node, { scale: 1.045, duration: 0.14, ease: "power2.out" }, at)
      .to(node, { scale: 1, duration: 0.3, ease: "power2.inOut" }, at + 0.14);
  };
  const done = (node: SVGGElement, at: number) => tl.to(boxOf(node), REST, at);

  // 1. the question goes to the planner
  travel(packetQ, edgeQP, 0.35, 0.8);
  done(question, 0.95);
  arrive(planner, 1.1);

  // 2. the planner splits it into three angles, which leave together on a slight stagger
  const FAN = 1.6;
  fan.forEach((pk, i) => travel(pk, fanEdges[i], FAN + i * 0.08, 1.0));
  done(planner, FAN + 0.5);
  researchers.forEach((r, i) => arrive(r, FAN + 0.95 + i * 0.08));

  // 3. all three work at once, at their own pace; each angle leaves as soon as its work is done
  const WORK = FAN + 1.2;
  const pace = [1.15, 1.7, 1.4];
  const finished = pace.map((p, i) => WORK + i * 0.08 + p);
  bars.forEach((b, i) => tl.to(b, { scaleX: 1, duration: pace[i], ease: "power1.inOut" }, WORK + i * 0.08));
  researchers.forEach((r, i) => {
    done(r, finished[i]);
    travel(merge[i], mergeEdges[i], finished[i] + 0.05, 0.8);
  });

  // 4. synthesis wakes on the first arrival, takes a beat for each one after, and stays live
  const arrivals = finished.map((f) => f + 0.8).sort((a, b) => a - b);
  arrive(synthesis, arrivals[0] - 0.05);
  arrivals.slice(1).forEach((t) => {
    tl.to(synthesis, { scale: 1.03, duration: 0.1, ease: "power2.out" }, t - 0.05).to(
      synthesis,
      { scale: 1, duration: 0.25, ease: "power2.inOut" },
      t + 0.05,
    );
  });

  // 5. the write-up
  const last = arrivals[arrivals.length - 1];
  tl.to(summary, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.28 }, last + 0.2);
  // hold on the finished state so the section doesn't unpin the instant it lands
  tl.to({}, { duration: 0.6 });

  // narrow screens scroll the diagram sideways; follow the action from left to right
  const scroller = root.querySelector<HTMLElement>("[data-lenis-prevent]");
  const total = tl.duration();
  tl.eventCallback("onUpdate", () => {
    if (scroller && scroller.scrollWidth > scroller.clientWidth) {
      const p = Math.min(1, tl.time() / (total - 0.6));
      scroller.scrollLeft = p * (scroller.scrollWidth - scroller.clientWidth);
    }
  });
  // attach the scrub only once the whole scene is built, so its length is final
  ScrollTrigger.create({ ...scrollTrigger, animation: tl });
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
      <InvoiceStack shown={shown} pick={inspect} />
      <div className="hidden overflow-x-auto md:block" data-scroller data-lenis-prevent>
        <svg
          data-diagram
          viewBox="0 58 900 292"
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
                {/* where each field will land: a grey slot while the scene plays, invisible at rest */}
                <rect
                  data-skel
                  x={0}
                  y={i * 22 + 2}
                  width={[168, 196, 132][i]}
                  height={14}
                  rx={3}
                  fill={INK}
                  fillOpacity={0.07}
                  opacity={0}
                />
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

          <Link step={1} d="M180 158 H250" />
          <Link step={2} d="M420 158 H490" />
          <Link step={3} d="M660 158 H730" />

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

          {/* what Drive receives at the end: the record, not the document */}
          <g transform="translate(810 128)" pointerEvents="none">
            <g data-chip opacity={0}>
            <rect x={-40} y={-12} width={80} height={24} rx={12} fill={ACCENT} />
            <text
              y={4.5}
              textAnchor="middle"
              fill={WHITE}
              fontSize={13}
              fontWeight={600}
              fontFamily="var(--font-sans), sans-serif"
            >
              data.json
            </text>
            </g>
          </g>

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
 * "Document → data": the invoice drops into Drive, is read at Groq, then consumed at Validate. Its
 * fields lift off and land in their slots as checked key/value rows, and the finished record (not
 * the document) is what travels on and lands in Drive as data.json. The whole route is on stage,
 * ghosted, from the first frame. The caller owns the ScrollTrigger config.
 */
export function buildInvoiceTimeline(
  root: HTMLElement,
  scrollTrigger: ScrollTrigger.Vars,
  onStage?: (stage: number) => void,
) {
  const q = <T extends Element>(s: string) => gsap.utils.toArray<T>(s, root);
  const nodes = q<SVGGElement>("[data-node]");
  const boxes = q<SVGRectElement>("[data-node] [data-box]");
  const doc = root.querySelector<SVGGElement>("[data-doc]")!;
  const docInner = root.querySelector<SVGGElement>("[data-doc-inner]")!;
  const docLines = q<SVGRectElement>("[data-doc-line]");
  const scan = root.querySelector<SVGRectElement>("[data-scan]")!;
  const jsonLines = q<SVGTextElement>("[data-json-line]");
  const slots = q<SVGRectElement>("[data-skel]");
  const checks = q<SVGPathElement>("[data-check]");
  const jsonTitle = root.querySelector<SVGTextElement>("[data-json-title]")!;
  const record = root.querySelector<SVGRectElement>("[data-record]")!;
  const chip = root.querySelector<SVGGElement>("[data-chip]")!;
  const edges = q<SVGPathElement>("[data-edge]");
  const scroller = root.querySelector<HTMLElement>("[data-scroller]");

  // first frame: the whole route, ghosted, with empty slots where the data will land
  gsap.set(q("[data-track]"), { opacity: 1 });
  gsap.set(nodes.slice(1), { opacity: GHOST, transformOrigin: "50% 50%" });
  gsap.set(nodes[0], { transformOrigin: "50% 50%" });
  gsap.set(boxes[0], { stroke: ACCENT, strokeOpacity: 1, fill: WHITE });
  gsap.set(edges, { strokeDashoffset: 100 });
  gsap.set(checks, { strokeDashoffset: 100 });
  gsap.set(slots, { opacity: 1 });
  // the heading waits until the rows have landed, so no field flies through it
  gsap.set(jsonTitle, { opacity: 0 });
  gsap.set(chip, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
  gsap.set(doc, { opacity: 1 }); // parked hidden in the static markup; it exists only while this plays

  const ARRIVE_GROQ = 1.6;
  const ARRIVE_VALIDATE = 3.55;
  const SEND = 5.55; // the record leaves for Drive
  const LAND = SEND + 0.85;

  const arrive = (tl: gsap.core.Timeline, i: number, at: number) =>
    tl
      .to(nodes[i], { opacity: 1, duration: 0.2 }, at)
      .to(boxes[i], LIT, at)
      .to(nodes[i], { scale: 1.04, duration: 0.14, ease: "power2.out" }, at)
      .to(nodes[i], { scale: 1, duration: 0.3, ease: "power2.inOut" }, at + 0.14);
  const done = (tl: gsap.core.Timeline, i: number, at: number) => tl.to(boxes[i], REST, at);
  /** The connection establishes first, then the document slides along it. */
  const hop = (tl: gsap.core.Timeline, edge: SVGPathElement, x: number, at: number) =>
    tl
      .to(edge, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, at)
      .to(doc, { x, duration: 0.85, ease: "power3.inOut" }, at + 0.1);

  // derived from the playhead, so it is correct when scrubbing backwards too
  let lastStage = -1;
  const stageAt = (t: number) => (t < ARRIVE_GROQ ? 0 : t < ARRIVE_VALIDATE ? 1 : t < LAND - 0.1 ? 2 : 3);
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger,
    onUpdate: () => {
      const stage = stageAt(tl.time());
      if (stage !== lastStage) onStage?.((lastStage = stage));
      // narrow screens scroll the diagram sideways; keep the travelling document in view
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        const p = Math.min(1, tl.time() / LAND);
        scroller.scrollLeft = p * (scroller.scrollWidth - scroller.clientWidth);
      }
    },
  });

  // 1. the invoice drops into the Drive folder
  tl.fromTo(docInner, { y: -34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 0);

  // 2. Drive → Groq
  hop(tl, edges[0], 240, 0.65);
  done(tl, 0, ARRIVE_GROQ - 0.05);
  arrive(tl, 1, ARRIVE_GROQ);

  // Groq: a scan beam sweeps the page and the text lights up line by line as it is read
  const SCAN = ARRIVE_GROQ + 0.15;
  tl.set(scan, { opacity: 1, y: 0 }, SCAN)
    .to(scan, { y: 50, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 1 }, SCAN)
    .to(docLines, { fill: ACCENT, fillOpacity: 0.9, stagger: 0.08, duration: 0.18 }, SCAN + 0.05)
    .set(scan, { opacity: 0 }, SCAN + 0.9);

  // 3. Groq → Validate
  hop(tl, edges[1], 480, ARRIVE_VALIDATE - 0.95);
  done(tl, 1, ARRIVE_VALIDATE - 0.05);
  arrive(tl, 2, ARRIVE_VALIDATE);

  // Validate: the fields lift off the document and land in their slots as key/value rows
  const LIFT = ARRIVE_VALIDATE + 0.15;
  tl.fromTo(
    jsonLines,
    { opacity: 0, x: 70, y: (i) => -(147 + 14 * i), scale: 0.6, fill: ACCENT },
    {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      fill: INK,
      transformOrigin: "0% 50%",
      // bottom row first, and stagger > duration: each field lands before the next lifts off, and
      // never has to cross a row that has already landed
      stagger: { each: 0.42, from: "end" },
      duration: 0.4,
      ease: "power3.out",
    },
    LIFT,
  )
    // each slot empties as its field lands in it
    .to([...slots].reverse(), { opacity: 0, duration: 0.15, stagger: 0.42 }, LIFT + 0.3)
    .to(docLines, { fillOpacity: 0.12, stagger: 0.05, duration: 0.3 }, LIFT + 0.1)
    .to(doc, { opacity: 0, duration: 0.35 }, LIFT + 1.0)
    .to(jsonTitle, { opacity: 1, duration: 0.3 }, LIFT + 1.25)
    .to(checks, { strokeDashoffset: 0, stagger: 0.16, duration: 0.28, ease: "power2.out" }, LIFT + 1.35);

  // 4. the finished record (not the document) carries on to Drive
  tl.fromTo(record, { opacity: 0 }, { opacity: 1, duration: 0.2 }, SEND - 0.25)
    .to(edges[2], { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, SEND - 0.1)
    // animate the rect's own geometry (not a transform): it shrinks to a chip and lands on Drive's
    // upper half (810,128), clear of its label. scale + transformBox on a rect with x/y attributes throws GSAP's origin off.
    .to(record, { attr: { x: 770, y: 116, width: 80, height: 24 }, duration: 0.85, ease: "power3.inOut" }, SEND)
    // ...and becomes the labelled data.json it is
    .to(record, { opacity: 0, duration: 0.15 }, LAND - 0.1)
    .to(chip, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, LAND - 0.12);
  done(tl, 2, SEND + 0.3);
  arrive(tl, 3, LAND - 0.1);

  // hold on the finished state so the section doesn't unpin the instant it lands
  tl.to({}, { duration: 0.7 });
  return tl;
}
