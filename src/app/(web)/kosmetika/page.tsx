import Link from "next/link";
import { PriceSection } from "@/components/PriceSection";
import { getServices } from "@/lib/data";

export const metadata = {
  title: "Kosmetika – ošetření pleti",
  description: "Kosmetické ošetření s kosmetikou GIGI, přístrojové ošetření pleti a obličejové masáže v salonu na Zeleném pruhu v Praze 4. Ceník a délka ošetření.",
};

export default async function Kosmetika() {
  const all = await getServices(["osetreni", "pristrojove", "obliceje"]);
  const by = (c: string) => all.filter((s) => s.category === c);
  return (
    <>
      <div className="page-head wrap">
        <span className="eyebrow">Péče o pleť</span>
        <h1>Kosmetika</h1>
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
          <p>Pětikrokové ošetření očního okolí (péče v délce 100–130 min) je vhodné od 25–27 let.</p>
        </>} />
        <PriceSection id="pristrojove" title="Přístrojové ošetření" items={by("pristrojove")} />
        <PriceSection id="obliceje" title="Obličejové masáže" items={by("obliceje")}>
          <div className="btn-row"><Link className="btn btn--primary" href="/rezervace?sluzba=obliceje">Rezervovat termín</Link></div>
        </PriceSection>
      </div>
    </>
  );
}
