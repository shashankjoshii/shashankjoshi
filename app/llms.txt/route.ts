import { about, currently, projects, site } from "@/lib/content";
import { seo } from "@/lib/seo";

// Plain-text summary for LLM crawlers (llmstxt.org). Built from the same content as the page,
// so it cannot drift. Static: rendered once at build.
export const dynamic = "force-static";

export function GET() {
  const stack = about.clusters.flatMap((c) => c.lines.flat()).join(", ");

  const body = `# ${site.name}

> ${site.role} based in ${seo.city}, ${seo.region}, ${seo.country}. ${site.positioning}

${about.summary}

- Website: ${seo.url}
- Email: ${site.email}
- GitHub: ${site.links.github}
- LinkedIn: ${site.links.linkedin}
- Availability: ${currently.availableFor}

## Skills

${stack}

## Projects

${projects
  .map((p) => `- [${p.name}](${seo.url}/work/${p.id})${p.alias ? ` (${p.alias})` : ""}: ${p.build} Stack: ${p.tech.join(", ")}. ${p.result}`)
  .join("\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
