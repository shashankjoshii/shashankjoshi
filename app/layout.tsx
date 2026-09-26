import type { Metadata, Viewport } from "next";
import { Roboto_Flex } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import { LightField } from "@/components/LightField";
import { site } from "@/lib/content";
import "./globals.css";

// One tall variable family for everything. Roboto Flex runs from ultra-condensed to wide on its
// wdth axis, so the display type sits very narrow and tall and can still breathe in width and weight.
// No `weight` option means the full wght range ships; wdth, opsz and YTLC (x-height) are requested.
const flex = Roboto_Flex({
  variable: "--font-flex",
  subsets: ["latin"],
  axes: ["opsz", "wdth", "YTLC"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.positioning,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.positioning,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  // Full-bleed in landscape on notched phones, so the blue sections don't get white letterbox bars.
  // Every section already pads >= 48px at md (wider than any landscape notch inset); the fixed nav
  // pads with env(safe-area-inset-*) itself (.nav-safe in globals.css).
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={flex.variable}>
      <body>
        <LightField />
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
