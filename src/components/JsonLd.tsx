import type { Service } from "@/db/schema";
import { CATEGORIES } from "@/db/schema";
import type { Settings } from "@/lib/settings";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

/** Strukturovaná data pro Google: BeautySalon + ceník (OfferCatalog). */
export function JsonLd({ s, services = [] }: { s: Settings; services?: Service[] }) {
  const postal = s.city.match(/^(\d{3}\s?\d{2})/)?.[1];
  const sameAs = [s.instagram, s.facebook, s.googleMaps, s.bookingUrl].filter(Boolean);
  const prices = services.flatMap((x) => x.variants.map((v) => v.price)).filter((p): p is number => p != null);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${SITE_URL}/#salon`,
    name: SITE_NAME,
    description: "Kosmetický a masážní salon Galyny Tretyak na Zeleném pruhu v Praze 4 – kosmetická ošetření s kosmetikou GIGI, přístrojová kosmetika, obličejové masáže a masáže těla.",
    url: `${SITE_URL}/`,
    image: [`${SITE_URL}/img/og-image.jpg`, `${SITE_URL}/img/salon-1-luzko.jpg`],
    logo: `${SITE_URL}/img/logo-havran.png`,
    telephone: s.phone,
    email: s.email,
    founder: { "@type": "Person", name: "Galyna Tretyak" },
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street.includes("[") ? "Zelený pruh" : s.street,
      ...(postal ? { postalCode: postal } : {}),
      addressLocality: "Praha 4",
      addressRegion: "Praha",
      addressCountry: "CZ",
    },
    areaServed: { "@type": "City", name: "Praha" },
    currenciesAccepted: "CZK",
    ...(prices.length ? { priceRange: `${Math.min(...prices)}–${Math.max(...prices)} Kč` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  if (services.length) {
    data.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Ceník služeb",
      itemListElement: Object.entries(CATEGORIES).map(([cat, c]) => ({
        "@type": "OfferCatalog",
        name: c.label,
        itemListElement: services.filter((x) => x.category === cat).map((x) => {
          const v = x.variants.find((v) => v.price != null);
          return {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: x.name, ...(v?.minutes ? { description: `${v.minutes} min` } : {}) },
            ...(v?.price != null ? { price: v.price, priceCurrency: "CZK" } : {}),
            url: `${SITE_URL}/${c.page}#${cat}`,
          };
        }),
      })).filter((c) => c.itemListElement.length),
    };
  }

  // „<“ escapujeme, aby text nemohl ukončit <script>
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
