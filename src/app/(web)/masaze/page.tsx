import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { PriceSection } from "@/components/PriceSection";
import { getServices } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { BookLink } from "@/components/BookLink";

export const metadata = pageMeta("/masaze", "Masáže Praha 4 – klasická, lymfatická i sportovní", "Klasická, hloubková, lymfatická a sportovní masáž, maderoterapie a Stop celulitidy v Praze 4 na Zeleném pruhu. Balíčky masáže s kosmetikou. Ceník od 1 100 Kč.");

export default async function Masaze() {
  const [all, s] = await Promise.all([getServices(["masaze", "balicky"]), getSettings()]);
  return (
    <>
      <div className="page-head wrap">
        <span className="eyebrow">Péče o tělo</span>
        <h1>Masáže</h1>
        <ul className="chips" aria-label="Sekce stránky">
          <li><a href="#masaze">Masáže</a></li>
          <li><a href="#balicky">Balíčky masáže + kosmetika</a></li>
        </ul>
      </div>
      <div className="wrap wrap--narrow page-body">
        <PriceSection id="masaze" title="Masáže" items={all.filter((s) => s.category === "masaze")} />
        <PriceSection id="balicky" title="Balíčky masáže + kosmetika" lead={<p>Spojení masáže a kosmetického ošetření v jedné návštěvě.</p>} items={all.filter((s) => s.category === "balicky")}>
          <div className="btn-row">
            <BookLink url={s.bookingUrl} fallback="/rezervace?sluzba=masaz">Rezervovat termín</BookLink>
            <Link className="btn btn--ghost" href="/darkovy-poukaz">Darovat jako poukaz</Link>
          </div>
        </PriceSection>
      </div>
    </>
  );
}
