"use client";

import { currently, site } from "@/lib/content";
import { useLocalTime } from "@/lib/useLocalTime";

/** Small living-status strip. Tertiary in the hierarchy, so it stays quiet and static. */
export function Currently() {
  const time = useLocalTime();

  const items = [
    { k: "Building", v: currently.building },
    { k: "Exploring", v: currently.exploring },
    { k: "Available for", v: currently.availableFor },
  ];

  return (
    <section
      id="currently"
      aria-labelledby="currently-title"
      className="border-t border-line px-6 py-16 md:px-12 md:py-20"
    >
      <h2 id="currently-title" className="display mb-10 text-3xl">
        Currently
      </h2>
      <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.k}>
            <dt className="label mb-2 text-cream-dim">{it.k}</dt>
            <dd className="text-lg leading-snug">{it.v}</dd>
          </div>
        ))}
        <div>
          <dt className="label mb-2 text-cream-dim">Local time</dt>
          <dd className="text-lg tabular-nums" suppressHydrationWarning>
            {time ? `${time.toUpperCase()}, ${site.location}` : "\u2014"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
