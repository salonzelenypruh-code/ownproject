import type { Metadata, Viewport } from "next";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSettings } from "@/lib/settings";
import { SITE_NAME, SITE_URL, TITLE_SUFFIX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${SITE_NAME} | Praha 4`, template: `%s | ${TITLE_SUFFIX}` },
    description: "Kosmetický a masážní salon Galyny Tretyak na Zeleném pruhu v Praze 4.",
    applicationName: SITE_NAME,
    authors: [{ name: "Galyna Tretyak" }],
    formatDetection: { telephone: false },
    icons: {
      icon: [{ url: "/favicon.ico?v=2", sizes: "any" }, { url: "/favicon.svg?v=2", type: "image/svg+xml" }, { url: "/favicon-512.png?v=2", sizes: "512x512" }],
      apple: "/apple-touch-icon.png?v=2",
    },
    verification: s.googleVerification ? { google: s.googleVerification } : undefined,
  };
}

export const viewport: Viewport = { themeColor: "#06160c" };

export default async function WebLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <html lang="cs">
      <head>
        <link rel="preload" href="/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/marcellus-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <a className="skip-link" href="#obsah">Přeskočit na obsah</a>
        <Header bookingUrl={s.bookingUrl} />
        <main id="obsah">{children}</main>
        <Footer s={s} />
      </body>
    </html>
  );
}
