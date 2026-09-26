// Device gates for the expensive effects. Everything here is conservative: when in doubt, the
// static fallback is shown instead of the effect.

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

let webglOk: boolean | undefined;

/** WebGL that isn't a software renderer (failIfMajorPerformanceCaveat). Probed once. */
function hasFastWebGL() {
  if (webglOk !== undefined) return webglOk;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    webglOk = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglOk = false;
  }
  return webglOk;
}

/** Whether the page-wide shader may run at all. */
export function canRunShader() {
  if (typeof window === "undefined") return false;
  const nav = navigator as NavigatorExtras;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return false;
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) return false;
  return hasFastWebGL();
}

/** Touch-first devices get a lower frame rate on the shader. */
export function isCoarsePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

/**
 * The 3D scenes (hero orb, Contact knot): working WebGL2 on a device with headroom. On touch-first
 * devices the shader's memory/core floor applies, so low-end phones get the static CSS fallback.
 * Desktops are not held to it: a 4-core / 4 GB laptop runs the orb comfortably, and the orb is a
 * core part of the hero.
 */
export function canRun3D() {
  if (typeof window === "undefined") return false;
  const nav = navigator as NavigatorExtras;
  if (nav.connection?.saveData) return false;
  if (isCoarsePointer()) {
    if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return false;
    if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) return false;
  }
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}
