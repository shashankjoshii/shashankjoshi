"use client";

import { currently, site } from "@/lib/content";
import { useLocalTime } from "@/lib/useLocalTime";
import { Glyph } from "../glyphs/Glyph";

/** Hour of day (0-23) in the site's timezone, for the day/night glyph. */
const localHour = () =>
  Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: site.timezone }).format(new Date()));

/**
 * Small living-status strip. Tertiary in the hierarchy, so its only motion is the clock's colon
 * ticking; a still sun or moon says whether it is day where I am.
 */
export function Currently() {
  const time = useLocalTime();
  const day = time ? (h => h >= 6 && h < 18)(localHour()) : true;
  const [hh, rest] = time.toUpperCase().split(":");

  const items = [
    { k: "Building", v: currently.building },
    { k: "Exploring", v: currently.exploring },
    { k: "Available for", v: currently.availableFor },
  ];

  return (
    <section
      id="currently"
      aria-labelledby="currently-title"
      className="border-t border-line bg-bg px-4 py-16 md:px-12 md:py-20"
    >
      <h2 id="currently-title" className="display mb-10 text-3xl [--wght:700]">
        Currently
      </h2>
      <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.k}>
            <dt className="label mb-2 text-muted">{it.k}</dt>
            <dd className="text-lg leading-snug">{it.v}</dd>
          </div>
        ))}
        <div>
          <dt className="label mb-2 text-muted">Local time</dt>
          <dd className="flex items-center gap-2.5 text-lg tabular-nums" suppressHydrationWarning>
            {time && rest !== undefined ? (
              <>
                <Glyph
                  name={day ? "sun" : "moon"}
                  label={day ? "Daytime" : "Night-time"}
                  className="h-[1.05em] w-[1.05em] shrink-0 text-muted"
                />
                <span>
                  {hh}
                  <span className="blink">:</span>
                  {rest}, {site.location}
                </span>
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
