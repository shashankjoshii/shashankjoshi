import type { MetadataRoute } from "next";
import { seo } from "@/lib/seo";

// One page today. Add a route here when /projects/[slug] pages exist.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: seo.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
