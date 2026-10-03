import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [["", 1], ["/kosmetika", 0.9], ["/masaze", 0.9], ["/darkovy-poukaz", 0.7], ["/rezervace", 0.8], ["/kontakty", 0.8], ["/galerie", 0.5], ["/cookies", 0.2]];
  return pages.map(([p, priority]) => ({ url: `${SITE_URL}${p || "/"}`, lastModified: new Date(), changeFrequency: "monthly", priority }));
}
