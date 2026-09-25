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
