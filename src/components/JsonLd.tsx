import type { Review, Service } from "@/db/schema";
import { CATEGORIES } from "@/db/schema";
import type { Settings } from "@/lib/settings";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { instagram } from "@/lib/social";

/** Strukturovaná data pro Google: BeautySalon + ceník (OfferCatalog). */
export function JsonLd({ s, services = [], reviews = [] }: { s: Settings; services?: Service[]; reviews?: Review[] }) {
  const postal = s.city.match(/^(\d{3}\s?\d{2})/)?.[1];
  const sameAs = [instagram(s.instagram)?.url, s.facebook, s.googleMaps, s.bookingUrl].filter(Boolean);
  // „8:00 – 20:00“ -> otevírací doba pro Google (texty jako „zavřeno“ nebo „dle dohody“ se vynechají)
  const span = (t: string) => { const m = t.match(/(\d{1,2})[:.](\d{2})\s*[–-]\s*(\d{1,2})[:.](\d{2})/); return m ? [`${m[1].padStart(2, "0")}:${m[2]}`, `${m[3].padStart(2, "0")}:${m[4]}`] : null; };
  const hours = ([[["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], s.hoursWeek], [["Saturday"], s.hoursSat], [["Sunday"], s.hoursSun]] as [string[], string][])
    .flatMap(([days, t]) => { const h = span(t); return h ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens: h[0], closes: h[1] }] : []; });
  const prices = services.flatMap((x) => x.variants.map((v) => v.price)).filter((p): p is number => p != null);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["BeautySalon", "LocalBusiness", "Organization"],
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
    geo: { "@type": "GeoCoordinates", latitude: 50.0408, longitude: 14.4292 },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapQuery)}`,
    containedInPlace: { "@type": "Place", name: "Poliklinika Zelený pruh", address: "Roškotova 1717/2, 140 00 Praha 4" },
    areaServed: ["Praha 4", "Braník", "Krč", "Podolí", "Pankrác", "Modřany"].map((name) => ({ "@type": "Place", name })),
    knowsLanguage: ["cs"],
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
    currenciesAccepted: "CZK",
    ...(prices.length ? { priceRange: `${Math.min(...prices)}–${Math.max(...prices)} Kč` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(reviews.length ? {
      aggregateRating: { "@type": "AggregateRating", ratingValue: (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1), reviewCount: reviews.length, bestRating: 5, worstRating: 1 },
      review: reviews.slice(0, 10).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.name }, reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 }, reviewBody: r.text, datePublished: r.createdAt.toISOString().slice(0, 10) })),
    } : {}),
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
