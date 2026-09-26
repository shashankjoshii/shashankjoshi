"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { onReady } from "@/lib/ready";
import { canRun3D } from "@/lib/capability";
import type { StageKind } from "./Stage";

// three + R3F are a separate chunk, fetched after the preloader and only when the browser is idle,
// so none of it is on the LCP path.
const Stage = dynamic(() => import("./Stage"), { ssr: false });

// @react-three/fiber 9.8.1 (the current latest stable release — there is no newer stable version,
// only unstable v10 canaries) unconditionally does `new THREE.Clock()` inside its own store creation
// to back state.clock, which three r183+ has deprecated in favour of THREE.Timer. That call site is
// inside fiber's bundled code, not ours, so it cannot be swapped for a Timer without patching a
// dependency or shipping an unstable major. This filters exactly that one known, harmless upstream
// message (by exact text, not a blanket suppression) so it doesn't clutter the console; every other
// warning, including any other THREE.* deprecation, still prints normally.
if (typeof window !== "undefined") {
  const w = window as typeof window & { __clockWarnFiltered?: boolean };
  if (!w.__clockWarnFiltered) {
    w.__clockWarnFiltered = true;
    const warn = console.warn.bind(console);
    console.warn = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("THREE.Clock: This module has been deprecated")) return;
      warn(...args);
    };
  }
}

/**
 * Lazy 3D slot. Fills its parent. On devices that cannot run WebGL it renders a CSS approximation
 * of the same object, so the blue is still there.
 */
export function Scene3D({ kind, className = "" }: { kind: StageKind; className?: string }) {
  const [mode, setMode] = useState<"wait" | "live" | "still" | "css">("wait");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ok = canRun3D();
    return onReady(() => {
      const go = () => setMode(!ok ? "css" : reduced ? "still" : "live");
      if ("requestIdleCallback" in window) window.requestIdleCallback(go, { timeout: 1200 });
      else setTimeout(go, 150);
    });
  }, []);

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      {(mode === "live" || mode === "still") && (
        <div className="h-full w-full animate-[fadein_1.4s_ease_both]">
          <Stage kind={kind} still={mode === "still"} />
        </div>
      )}
      {mode === "css" && (
        <div
          className="mx-auto aspect-square h-full max-h-full rounded-full"
          style={{
            background:
              kind === "orb"
                ? "radial-gradient(circle at 34% 28%, #dbe6ff 0%, #4f7dff 30%, #0038ff 62%, #0026b3 100%)"
                : "radial-gradient(circle at 34% 28%, #ffffff 0%, #b8ccff 40%, #5b84ff 100%)",
            boxShadow: "0 40px 80px -30px rgb(0 56 255 / 0.55)",
          }}
        />
      )}
    </div>
  );
}
