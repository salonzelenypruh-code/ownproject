import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";
import { Logo } from "@/components/Logo";
import { getSettings } from "@/lib/settings";
import { VoucherOrderForm } from "@/components/VoucherOrderForm";

export const metadata = pageMeta("/darkovy-poukaz", "Dárkový poukaz na kosmetiku a masáž", "Darujte kosmetiku nebo masáž v Praze 4 – Braník. Dárkový poukaz salonu na Zeleném pruhu – ideální dárek k narozeninám i Vánocům.");

export default async function Poukaz() {
  const s = await getSettings();
  return (
    <>
      <Breadcrumbs items={[["Dárkový poukaz", "/darkovy-poukaz"]]} />
      <div className="page-head wrap">
        <span className="eyebrow">Darujte péči a relaxaci</span>
        <h1>Dárkový poukaz</h1>
      </div>
      <div className="wrap page-body">
        <div className="voucher-grid">
          <figure className="voucher" style={{ margin: 0 }} aria-label="Ukázka dárkového poukazu">
            <div className="voucher__inner">
              <div className="voucher__logo"><Logo size={120} /></div>
              <div>
                <p className="voucher__title">Dárkový poukaz</p>
                <p className="voucher__sub">Kosmetika a masáže na Zeleném pruhu</p>
                <p className="voucher__line">Hodnota: dle vašeho výběru</p>
                <p className="voucher__line">Platnost: {s.voucherValidity}</p>
              </div>
            </div>
          </figure>
          <section className="panel" aria-labelledby="radost-h">
            <h2 id="radost-h">Udělejte radost</h2>
            <p>{s.voucherIntro}</p>
            <dl className="facts">
              <div><dt>Hodnota</dt><dd>{s.voucherValue}</dd></div>
              <div><dt>Platnost</dt><dd>{s.voucherValidity}</dd></div>
              <div><dt>Jak koupit</dt><dd>{s.voucherHowTo}</dd></div>
            </dl>
            <a className="btn btn--primary" href="#objednat">Objednat poukaz</a>
          </section>
        </div>
        <section className="panel vo-panel" id="objednat" aria-labelledby="objednat-h">
          <h2 id="objednat-h">Objednat dárkový poukaz</h2>
          <VoucherOrderForm presets={(s.voucherValue.match(/\d[\d\s]*\d/g) || []).map((x) => Number(x.replace(/\s/g, ""))).filter((n) => n >= 100)} />
        </section>
      </div>
    </>
  );
}
