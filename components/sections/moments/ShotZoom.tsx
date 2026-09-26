"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

/**
 * "See the whole capture": a small text button the caller places next to (never over) a cropped
 * shot, opening the full screenshot in a viewer. Phones get a pannable native-size view; wider
 * screens get it fitted, never above its native width.
 */
export function ShotZoom({
  src,
  alt,
  width,
  height,
  label = "View full screenshot",
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  label?: string;
  className?: string;
}) {
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
        className={`label inline-flex min-h-11 items-center gap-2 text-fg underline decoration-fg/30 underline-offset-4 transition-colors hover:decoration-accent ${className}`}
      >
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M8.5 1.5h4v4M12.5 1.5 8 6M5.5 12.5h-4v-4M1.5 12.5 6 8" />
        </svg>
        {label}
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-[200] flex flex-col bg-fg/95"
          >
            <div className="flex items-center justify-between px-4 py-2 text-bg md:px-8">
              <p className="label md:invisible">Drag to pan</p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="label inline-flex min-h-11 items-center rounded-full border border-bg px-4"
              >
                Close
              </button>
            </div>
            <div
              data-lenis-prevent
              className="min-h-0 flex-1 overflow-auto overscroll-contain md:flex md:items-center md:justify-center md:p-8"
            >
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                sizes={`(min-width: 768px) min(100vw, ${width}px), 1100px`}
                className="h-auto w-[1100px] max-w-none md:max-h-[calc(100svh-8rem)] md:w-auto md:max-w-full"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
