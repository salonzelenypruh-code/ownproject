import { CATEGORIES } from "@/db/schema";
import { getServices } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/seo";

// Shrnutí pro AI asistenty (ChatGPT, Perplexity…) – generuje se z ceníku a nastavení v adminu.
export const revalidate = 3600;

export async function GET() {
  const [s, services] = await Promise.all([getSettings(), getServices(Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[])]);
  const ok = (v: string) => v && !v.includes("[");
  const price = (n: number | null) => (n == null ? "" : `${formatPrice(n).replace(/ /g, " ")} Kč`);
  const lines: string[] = [
    "# Kosmetika a masáže na Zeleném pruhu",
    "",
    "> Kosmetický a masážní salon Galyny Tretyak v Praze 4 – Braník (Poliklinika Zelený pruh). Ošetření pleti s izraelskou kosmetikou GIGI, přístrojová kosmetika, obličejové masáže, masáže těla a dárkové poukazy. Krásné výsledky, rozumné ceny.",
    "",
    "## Kontakt",
    `- Adresa: ${[s.place, s.street, s.city].filter(ok).join(", ")}`,
    `- Telefon: ${s.phone}${s.whatsapp ? " (i WhatsApp)" : ""}`,
    `- E-mail: ${s.email}`,
    `- Otevírací doba: Po–Pá ${s.hoursWeek}, So ${s.hoursSat}, Ne ${s.hoursSun}`,
    `- Rezervace: ${s.bookingUrl || `${SITE_URL}/rezervace`}`,
    "",
    "## Ceník",
  ];
  for (const [cat, c] of Object.entries(CATEGORIES)) {
    const items = services.filter((x) => x.category === cat);
    if (!items.length) continue;
    lines.push("", `### ${c.label}`);
    for (const x of items) {
      const v = x.variants.map((v) => [v.minutes != null && `${v.minutes} min`, price(v.price)].filter(Boolean).join(" / ")).filter(Boolean).join(", ");
      lines.push(`- ${x.name}${v ? ` – ${v}` : ""}`);
    }
  }
  lines.push("", "## Stránky",
    `- [Kosmetika](${SITE_URL}/kosmetika): kosmetická a přístrojová ošetření, obličejové masáže`,
    `- [Masáže](${SITE_URL}/masaze): masáže těla a balíčky masáž + kosmetika`,
    `- [Dárkový poukaz](${SITE_URL}/darkovy-poukaz)`,
    `- [Kontakty](${SITE_URL}/kontakty)`,
    `- [Galerie](${SITE_URL}/galerie)`, "");
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
