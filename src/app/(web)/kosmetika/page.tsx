import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";
import { PriceSection } from "@/components/PriceSection";
import { getServices } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { BookLink } from "@/components/BookLink";

export const metadata = pageMeta("/kosmetika", "Kosmetika Praha 4 – Braník, ošetření pleti", "Kosmetika v Praze 4 – Braník: ošetření pleti s kosmetikou GIGI, anti-aging, karboxyterapie, mezoterapie a masáž Kobido. Ceník a délky ošetření.");

export default async function Kosmetika() {
  const [all, s] = await Promise.all([getServices(["osetreni", "pristrojove", "obliceje"]), getSettings()]);
  const by = (c: string) => all.filter((s) => s.category === c);
  return (
    <>
      <Breadcrumbs items={[["Kosmetika", "/kosmetika"]]} />
      <div className="page-head wrap">
        <span className="eyebrow">Péče o pleť</span>
        <h1>Kosmetika<span className="h1-sub">Praha 4 – Braník</span></h1>
        <p className="page-lead">Salon v Poliklinice Zelený pruh, Roškotova 1717/2, Praha 4 – Braník. Kousek od Krče, Podolí i Pankráce.</p>
        <ul className="chips" aria-label="Sekce stránky">
          <li><a href="#osetreni">Kosmetické ošetření</a></li>
          <li><a href="#pristrojove">Přístrojové ošetření</a></li>
          <li><a href="#obliceje">Obličejové masáže</a></li>
        </ul>
      </div>
      <div className="wrap wrap--narrow page-body">
        <PriceSection id="osetreni" title="Kosmetické ošetření" items={by("osetreni")} lead={<>
          <p>Nabízím kosmetické služby, při kterých nejde jen o kosmetiku, ale i o chvilku klidu a pohody, kdy si můžete odpočinout a zrelaxovat.</p>
          <p>Pracuji s moderními přístrojovými metodami v kombinaci s kvalitní izraelskou kosmetikou GIGI – kosmetikou, která spojuje farmaceutické standardy, přírodní ingredience, vysokou koncentraci aktivních látek a moderní biotechnologie pro okamžitě viditelné výsledky.</p>
          <p>Ošetření jsou vhodná pro různé věkové kategorie, typy a stavy pleti. Každý krok – volbu peelingu, sér a masek – přizpůsobuji aktuálním potřebám vaší pleti.</p>
          <p>Pětikrokové ošetření očního okolí je součástí kosmetických ošetření v délce 100–130 minut (není součástí základního ošetření ani ošetření pro citlivou pleť) a je vhodné od 25–27 let.</p>
        </>} />
        <PriceSection id="pristrojove" title="Přístrojové ošetření" items={by("pristrojove")} />
        <PriceSection id="obliceje" title="Obličejové masáže" items={by("obliceje")}>
          <div className="btn-row"><BookLink url={s.bookingUrl} fallback="/rezervace?sluzba=obliceje">Rezervovat termín</BookLink></div>
        </PriceSection>
      </div>
    </>
  );
}
