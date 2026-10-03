import type { Service } from "@/db/schema";
import type { Settings } from "./settings";
import { formatPrice } from "./format";

export type Faq = { q: string; a: string };

const nbsp = (s: string) => s.replace(/ /g, " ");
const minPrice = (list: Service[]) => {
  const p = list.flatMap((s) => s.variants.map((v) => v.price)).filter((x): x is number => x != null);
  return p.length ? nbsp(formatPrice(Math.min(...p))) : null;
};

/** Časté otázky – odpovědi se skládají z nastavení a ceníku v adminu, takže zůstávají aktuální. */
export function buildFaq(s: Settings, services: Service[]): Faq[] {
  const cosm = services.filter((x) => ["osetreni", "pristrojove", "obliceje"].includes(x.category));
  const mass = services.filter((x) => x.category === "masaze");
  const mins = services.flatMap((x) => x.variants.map((v) => v.minutes)).filter((x): x is number => x != null);
  const address = [s.place, s.street, s.city].filter((x) => x && !x.includes("[")).join(", ");
  const contact = [s.phone && `telefonicky na čísle ${s.phone}`, s.whatsapp && "přes WhatsApp"].filter(Boolean).join(" nebo ");
  const out: Faq[] = [
    { q: "Kde salon najdu?", a: `Salon Kosmetika a masáže na Zeleném pruhu najdete na adrese ${address}. Na stránce Kontakty je mapa a odkaz na navigaci.` },
    { q: "Jaká je otevírací doba?", a: `Pondělí až pátek ${s.hoursWeek}, sobota ${s.hoursSat}, neděle ${s.hoursSun}.` },
    { q: "Jak se mohu objednat?", a: `Objednat se můžete ${contact}, nebo přes rezervaci na webu.` },
    { q: "S jakou kosmetikou pracujete?", a: "Pracuji s izraelskou kosmetikou GIGI, která spojuje farmaceutické standardy, přírodní ingredience, vysokou koncentraci aktivních látek a moderní biotechnologie. Kombinuji ji s moderními přístrojovými metodami." },
  ];
  const pc = minPrice(cosm), pm = minPrice(mass);
  if (pc || pm) out.push({ q: "Kolik stojí kosmetika a masáže?", a: [pc && `Kosmetická ošetření začínají na ${pc} Kč`, pm && `masáže na ${pm} Kč`].filter(Boolean).join(", ") + ". Kompletní ceník s délkou každého ošetření najdete na stránkách Kosmetika a Masáže." });
  if (mins.length) out.push({ q: "Jak dlouho ošetření trvá?", a: `Podle zvoleného ošetření ${Math.min(...mins)} až ${Math.max(...mins)} minut. Délka je uvedená u každé služby v ceníku.` });
  out.push(
    { q: "Pro koho jsou ošetření vhodná?", a: "Ošetření jsou vhodná pro různé věkové kategorie, typy a stavy pleti. Každý krok – volbu peelingu, sér a masek – přizpůsobuji aktuálním potřebám vaší pleti. Pětikrokové ošetření očního okolí je vhodné od 25–27 let." },
    { q: "Mohu koupit dárkový poukaz?", a: "Ano, dárkový poukaz můžete darovat na kosmetiku i masáže. Objednáte ho na stránce Dárkový poukaz nebo telefonicky." },
  );
  return out;
}
