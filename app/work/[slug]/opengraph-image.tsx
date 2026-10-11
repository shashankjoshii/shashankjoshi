import { ImageResponse } from "next/og";
import { projects, site } from "@/lib/content";
import { seo } from "@/lib/seo";

export const alt = `Case study by ${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

// Same identity as the home card (app/opengraph-image.tsx): light, one blue accent, huge type.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = projects.findIndex((p) => p.id === slug);
  const project = projects[Math.max(i, 0)];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#0a0a0a",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, color: "#404040" }}>
          <div style={{ width: 16, height: 16, borderRadius: 16, background: "#0038ff" }} />
          Case study · Project {String(Math.max(i, 0) + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 700, lineHeight: 1, letterSpacing: -4 }}>{project.name}</div>
          <div style={{ marginTop: 28, fontSize: 36, lineHeight: 1.25, color: "#404040", maxWidth: 980 }}>
            {project.build}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#404040" }}>
          <span style={{ color: "#0038ff", fontWeight: 700 }}>{site.name}</span>
          <span>{seo.url.replace("https://", "")}</span>
        </div>
      </div>
    ),
    size,
  );
}
