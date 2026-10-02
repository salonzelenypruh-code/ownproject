import type { Metadata } from "next";

export const SITE_NAME = "Kosmetika a masáže na Zeleném pruhu";
export const TITLE_SUFFIX = "Zelený pruh";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8091").replace(/\/$/, "");
const OG_IMAGE = { url: "/img/og-image.jpg", width: 1200, height: 630, alt: "Kosmetika a masáže na Zeleném pruhu – logo salonu s havranem" };

/** Kompletní metadata stránky: title, description, canonical, Open Graph, Twitter.
 *  (Next metadata slučuje jen do hloubky jedné úrovně, proto se openGraph skládá celý tady.) */
export function pageMeta(path: string, title: string | null, description: string): Metadata {
  const fullTitle = title ? `${title} | ${TITLE_SUFFIX}` : `${SITE_NAME} | Praha 4`;
  return {
    title: title ?? { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "cs_CZ", siteName: SITE_NAME, url: path, title: fullTitle, description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [OG_IMAGE.url] },
  };
}
