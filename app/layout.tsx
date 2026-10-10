import type { Metadata, Viewport } from "next";
import { Roboto_Flex } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import { LightField } from "@/components/LightField";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/content";
import { seo } from "@/lib/seo";
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
  metadataBase: new URL(seo.url),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: site.name, url: seo.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: "/",
    siteName: site.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
  },
  robots: { index: true, follow: true },
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
        <JsonLd />
        <LightField />
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
