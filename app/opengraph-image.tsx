import { ImageResponse } from "next/og";
import { site } from "@/lib/content";
import { seo } from "@/lib/seo";

export const alt = `${site.name}, ${site.role} in ${seo.city}, ${seo.country}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Light, one blue accent, huge name: the same identity as the site, drawn statically.
export default function OpengraphImage() {
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
          {seo.city}, {seo.country}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 156, fontWeight: 700, lineHeight: 1, letterSpacing: -6 }}>{site.name}</div>
          <div style={{ marginTop: 28, fontSize: 48, color: "#0038ff", fontWeight: 700 }}>{site.role}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#404040" }}>
          <span>Next.js · AI automation · n8n</span>
          <span>{seo.url.replace("https://", "")}</span>
        </div>
      </div>
    ),
    size,
  );
}
