import { about, projects, site } from "@/lib/content";
import { seo } from "@/lib/seo";

const personId = `${seo.url}/#person`;

// Billzy and KIRO are shipped products; the two n8n projects are automations, so CreativeWork.
const productIds = new Set(["billzy", "kiro"]);

const graph = [
  {
    "@type": "WebSite",
    "@id": `${seo.url}/#website`,
    url: seo.url,
    name: site.name,
    description: seo.description,
    inLanguage: "en",
    publisher: { "@id": personId },
  },
  {
    "@type": "ProfilePage",
    "@id": `${seo.url}/#profile`,
    url: seo.url,
    name: seo.title,
    isPartOf: { "@id": `${seo.url}/#website` },
    mainEntity: { "@id": personId },
  },
  {
    "@type": "Person",
    "@id": personId,
    name: site.name,
    url: seo.url,
    jobTitle: site.role,
    description: about.summary,
    email: `mailto:${site.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: seo.city,
      addressRegion: seo.region,
      addressCountry: seo.countryCode,
    },
    homeLocation: { "@type": "City", name: seo.city },
    worksFor: { "@type": "Organization", name: site.studio },
    knowsAbout: [...new Set(about.clusters.flatMap((c) => c.lines.flat()))],
    sameAs: [site.links.github, site.links.linkedin],
  },
  ...projects.map((p) => ({
    "@type": productIds.has(p.id) ? "SoftwareApplication" : "CreativeWork",
    "@id": `${seo.url}/#${p.id}`,
    name: p.name,
    ...(p.alias ? { alternateName: p.alias.replace(/^formerly\s+/i, "") } : {}),
    description: `${p.build} ${p.result}`,
    keywords: p.tech.join(", "),
    creator: { "@id": personId },
    ...(productIds.has(p.id) ? { applicationCategory: "BusinessApplication", operatingSystem: "Web" } : {}),
  })),
];

/** Structured data for search engines and AI assistants. Server-rendered, no client JS. */
export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so no string in the data can close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
