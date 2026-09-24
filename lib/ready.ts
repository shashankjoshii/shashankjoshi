// Tiny signal so entrance choreography waits for the preloader curtain.

const EVENT = "site:ready";

export function markReady() {
  document.documentElement.dataset.ready = "1";
  window.dispatchEvent(new Event(EVENT));
}

export function onReady(cb: () => void) {
  if (document.documentElement.dataset.ready === "1") {
    cb();
    return () => {};
  }
  window.addEventListener(EVENT, cb, { once: true });
  return () => window.removeEventListener(EVENT, cb);
}
