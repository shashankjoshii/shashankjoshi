import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";
import { seo } from "@/lib/seo";

// The home page plus one case-study page per project (app/work/[slug]).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: seo.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({
      url: `${seo.url}/work/${p.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
