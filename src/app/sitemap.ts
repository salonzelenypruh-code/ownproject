import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  return ["", "/kosmetika", "/masaze", "/darkovy-poukaz", "/rezervace", "/kontakty", "/galerie"].map((p) => ({ url: `${site}${p}`, changeFrequency: "monthly", priority: p ? 0.8 : 1 }));
}
