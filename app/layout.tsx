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
  // No <link rel="preload">: Chrome holds text paint until a preloaded font arrives, which pushed first
  // paint (and so FCP/LCP) out by ~1s on a slow connection. The font is still fetched the moment the
  // inlined CSS needs it, and FONT_GATE below hides the page, not the intro curtain, until it lands.
  preload: false,
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

// The display face is a 197 KB variable font that usually lands just after first paint. Painting the
// fallback first and swapping re-sets every glyph, so the hero name and nav jump (CLS 0.15 on desktop).
// Instead the name and nav stay invisible (see "Font gate" in globals.css) until the font is ready.
// Layout still happens, it just isn't painted, so nothing visible moves.
// The 1.5 s timer means a slow or failed font can never hold the page back; without JS the class is
// never added, so content shows normally.
const FONT_GATE = `(function(){var d=document.documentElement,f=document.fonts;if(!f)return;d.classList.add("fonts-pending");var done=function(){d.classList.remove("fonts-pending")};setTimeout(done,1500);document.addEventListener("DOMContentLoaded",function(){void document.body.offsetHeight;f.ready.then(done)})})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: FONT_GATE adds a class to <html> before React hydrates
    <html lang="en" className={flex.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: FONT_GATE }} />
      </head>
      <body>
        <JsonLd />
        <LightField />
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
