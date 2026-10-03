import { SITE_URL } from "@/lib/seo";

/** Drobečková navigace pro Google (jen strukturovaná data, vizuálně se neukazuje). */
export function Breadcrumbs({ items }: { items: [string, string][] }) {
  const all: [string, string][] = [["Úvod", "/"], ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE_URL}${path === "/" ? "/" : path}` })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />;
}
