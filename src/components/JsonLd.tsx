import type { Settings } from "@/lib/settings";

export function JsonLd({ s }: { s: Settings }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const data = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "Kosmetika a masáže na Zeleném pruhu",
    image: `${site}/img/og-image.jpg`,
    url: `${site}/`,
    telephone: s.phone,
    email: s.email,
    founder: { "@type": "Person", name: "Galyna Tretyak" },
    priceRange: "1100–2300 Kč",
    address: { "@type": "PostalAddress", streetAddress: s.street, addressLocality: "Praha 4", postalCode: s.city.split(" Praha")[0], addressCountry: "CZ" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
