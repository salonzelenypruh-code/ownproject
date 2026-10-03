import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Photo } from "@/components/Photo";
import { BookLink } from "@/components/BookLink";
import { getPhotos } from "@/lib/data";
import { getSettings } from "@/lib/settings";

export const metadata = pageMeta("/o-nas", "O salonu – Galyna Tretyak, Praha 4 – Braník", "Kosmetický a masážní salon Galyny Tretyak v Poliklinice Zelený pruh v Praze 4 – Braník. Péče o pleť s kosmetikou GIGI, přístrojová kosmetika a masáže.");

export default async function ONas() {
  const [portrait, trio, s] = await Promise.all([getPhotos("portret"), getPhotos("uvod"), getSettings()]);
  return (
    <>
      <Breadcrumbs items={[["O salonu", "/o-nas"]]} />
      <div className="page-head wrap">
        <span className="eyebrow">Kdo se o vás postará</span>
        <h1>O salonu<span className="h1-sub">Praha 4 – Braník</span></h1>
      </div>
      <div className="wrap wrap--narrow page-body">
        <section className="panel intro" aria-labelledby="galyna-h">
          {portrait[0] && <div className="intro__photo"><Photo photo={portrait[0]} lazy={false} sizes="(max-width: 760px) 220px, 300px" /></div>}
          <div>
            <h2 id="galyna-h">Galyna Tretyak</h2>
            <p>Jmenuji se Galyna Tretyak a v salonu na Zeleném pruhu se starám o péči o tělo a pleť. Věřím, že péče o tělo a pleť je umění, které vyžaduje nejen odborné znalosti, ale i lásku k práci.</p>
            <p>Snažím se, aby každá vaše návštěva byla příjemným zážitkem a relaxací. Mým cílem je, abyste odcházeli s úsměvem na tváři a s pocitem, že jste na správném místě.</p>
            <p className="intro__highlight">Krásné výsledky, rozumné ceny.</p>
          </div>
        </section>

        <section className="panel prose" aria-labelledby="pristup-h" style={{ marginTop: 24 }}>
          <h2 id="pristup-h">Jak pracuji</h2>
          <p>Nabízím kosmetické služby, při kterých nejde jen o kosmetiku, ale i o chvilku klidu a pohody, kdy si můžete odpočinout a zrelaxovat.</p>
          <p>Pracuji s moderními přístrojovými metodami v kombinaci s kvalitní izraelskou kosmetikou <strong>GIGI</strong> – kosmetikou, která spojuje farmaceutické standardy, přírodní ingredience, vysokou koncentraci aktivních látek a moderní biotechnologie pro okamžitě viditelné výsledky.</p>
          <p>Ošetření jsou vhodná pro různé věkové kategorie, typy a stavy pleti. Každý krok – volbu peelingu, sér a masek – přizpůsobuji aktuálním potřebám vaší pleti.</p>
          <h2>Co v salonu najdete</h2>
          <ul>
            <li><Link href="/kosmetika#osetreni">Kosmetická ošetření</Link> – od základního ošetření po aktivní anti-aging a super lifting</li>
            <li><Link href="/kosmetika#pristrojove">Přístrojová ošetření</Link> – karboxyterapie, mikroproudová terapie, neinvazivní mezoterapie</li>
            <li><Link href="/kosmetika#obliceje">Obličejové masáže</Link> – Kobido, myofasciální lifting, lymfatická masáž obličeje</li>
            <li><Link href="/masaze">Masáže těla</Link> – klasická, hloubková, lymfatická, sportovní, maderoterapie a Stop celulitidy</li>
            <li><Link href="/darkovy-poukaz">Dárkové poukazy</Link></li>
          </ul>
          <h2>Kde mě najdete</h2>
          <p>Salon sídlí v Poliklinice Zelený pruh, {s.street}, {s.city}. Otevřeno je pondělí až pátek {s.hoursWeek}, v sobotu {s.hoursSat}.</p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <BookLink url={s.bookingUrl}>Rezervovat termín</BookLink>
            <Link className="btn btn--ghost" href="/kontakty">Kontakty a mapa</Link>
          </div>
        </section>

        {trio.length > 0 && (
          <div className="photo-trio" style={{ marginTop: 24 }}>
            {trio.slice(0, 3).map((p) => <Photo key={p.id} photo={p} sizes="(max-width: 700px) calc(100vw - 32px), 280px" />)}
          </div>
        )}
      </div>
    </>
  );
}
