"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

/**
 * Phones only (< md). The desktop captures are 1535px wide, so at phone width the frame shows a
 * zoomed crop of the meaningful region and a tap opens the full capture in a pannable viewer.
 * From md up this renders its children untouched.
 */
export function ShotCrop({
  x,
  y,
  children,
}: {
  /** Top-left of the crop as a % of the container width (CSS margin percentages are width-relative). */
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:overflow-visible">
      <div
        className="relative ml-[var(--cx)] mt-[var(--cy)] w-[250%] max-w-none md:m-0 md:w-full"
        style={{ "--cx": `${-x}%`, "--cy": `${-y}%` } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

export function ShotZoom({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const btn = opener.current;
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge ${alt}`}
        className="absolute inset-0 z-10 md:hidden"
      >
        <span
          aria-hidden
          className="label absolute bottom-2 right-2 rounded-full bg-fg px-3 py-1.5 text-bg"
        >
          Tap to enlarge
        </span>
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-[200] flex flex-col bg-fg/95 md:hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 text-bg">
              <p className="label">Drag to pan</p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="label inline-flex min-h-11 items-center rounded-full border border-bg px-4"
              >
                Close
              </button>
            </div>
            <div data-lenis-prevent className="min-h-0 flex-1 overflow-auto overscroll-contain">
              <Image
                src={src}
                alt={alt}
                width={1535}
                height={797}
                sizes="1100px"
                className="h-auto w-[1100px] max-w-none"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
