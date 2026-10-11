// Tiny signal so entrance choreography waits for the preloader curtain.

const EVENT = "site:ready";

export function markReady() {
  document.documentElement.dataset.ready = "1";
  window.dispatchEvent(new Event(EVENT));
}

/** True once the intro curtain is off screen (or was never rendered), e.g. hydration on a slow
 *  device finished after the CSS fail-safe had already lifted it. */
export function curtainGone() {
  const pre = document.querySelector<HTMLElement>(".preloader");
  if (!pre) return true;
  const cs = getComputedStyle(pre);
  return cs.display === "none" || cs.visibility === "hidden";
}

export function onReady(cb: () => void) {
  if (document.documentElement.dataset.ready === "1") {
    cb();
    return () => {};
  }
  window.addEventListener(EVENT, cb, { once: true });
  return () => window.removeEventListener(EVENT, cb);
}
