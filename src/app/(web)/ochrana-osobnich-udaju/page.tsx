import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CookieSettingsLink } from "@/components/CookieBar";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const metadata = pageMeta("/ochrana-osobnich-udaju", "Ochrana osobních údajů", "Jak salon Kosmetika a masáže na Zeleném pruhu zpracovává osobní údaje z rezervací, dárkových poukazů a recenzí a jaká máte práva.");

const filled = (v: string) => Boolean(v) && !v.includes("[");

export default async function Gdpr() {
  const s = await getSettings();
  const operator = [filled(s.operatorName) ? s.operatorName : "Galyna Tretyak", filled(s.operatorId) && `IČO ${s.operatorId}`, filled(s.operatorAddress) && s.operatorAddress].filter(Boolean).join(", ");
  return (
    <>
      <Breadcrumbs items={[["Ochrana osobních údajů", "/ochrana-osobnich-udaju"]]} />
      <div className="page-head wrap">
        <span className="eyebrow">Informace</span>
        <h1>Ochrana osobních údajů</h1>
      </div>
      <div className="wrap wrap--narrow page-body">
        <section className="panel prose">
          <p>Vaše údaje používám jen k tomu, abych vyřídila vaši rezervaci, dárkový poukaz nebo recenzi. Nikomu je neprodávám a neposílám vám reklamní e-maily.</p>

          <h2>Kdo údaje zpracovává</h2>
          <p>Správce: <strong>{operator}</strong>, provozovatel salonu Kosmetika a masáže na Zeleném pruhu, {[s.street, s.city].filter(filled).join(", ")}.<br />
            Kontakt: <a href={`mailto:${s.email}`}>{s.email}</a>, {s.phone}.</p>

          <h2>Jaké údaje, proč a jak dlouho</h2>
          <div className="table-wrap">
            <table className="gdpr-table">
              <thead><tr><th>Kdy</th><th>Údaje</th><th>Proč (právní základ)</th><th>Jak dlouho</th></tr></thead>
              <tbody>
                <tr><td data-label="Kdy">Žádost o rezervaci</td><td data-label="Údaje">jméno, telefon, e-mail, služba, termín, poznámka</td><td data-label="Proč (právní základ)">abych vám termín domluvila a potvrdila (kroky před uzavřením smlouvy)</td><td data-label="Jak dlouho">1 rok od poslední návštěvy nebo kontaktu</td></tr>
                <tr><td data-label="Kdy">Dárkový poukaz</td><td data-label="Údaje">jméno kupujícího a obdarovaného, e-mail, věnování</td><td data-label="Proč (právní základ)">vystavení, zaslání a uplatnění poukazu (plnění smlouvy)</td><td data-label="Jak dlouho">po dobu platnosti poukazu a dál jen kvůli účetnictví podle zákona</td></tr>
                <tr><td data-label="Kdy">Recenze</td><td data-label="Údaje">jméno, hodnocení, text</td><td data-label="Proč (právní základ)">zveřejnění recenze na webu (váš souhlas odesláním recenze)</td><td data-label="Jak dlouho">dokud recenzi nesmažu nebo mě o smazání nepožádáte</td></tr>
                <tr><td data-label="Kdy">Měření návštěvnosti a reklama</td><td data-label="Údaje">anonymní údaje o návštěvě (cookies)</td><td data-label="Proč (právní základ)">statistiky a reklama – jen s vaším souhlasem v cookie liště</td><td data-label="Jak dlouho">podle nastavení Google a Meta, nejdéle 14 měsíců</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Komu údaje předávám</h2>
          <p>Jen službám, které web provozují, a vždy jen v nutném rozsahu:</p>
          <ul>
            <li><strong>Vercel</strong> – hosting webu,</li>
            <li><strong>Turso</strong> – databáze (servery v EU, Irsko),</li>
            <li><strong>Resend</strong> – odesílání e-mailů s rezervací a poukazy,</li>
            <li><strong>Google</strong> (Analytics, Mapy) a <strong>Meta</strong> (Facebook Pixel) – jen pokud v cookie liště zvolíte „Přijmout vše“.</li>
          </ul>
          <p>Některé z nich sídlí v USA; předání probíhá na základě rámce EU–USA pro ochranu osobních údajů (Data Privacy Framework) nebo standardních smluvních doložek EU.</p>

          <h2>Vaše práva</h2>
          <p>Máte právo na přístup ke svým údajům, jejich opravu nebo výmaz, omezení zpracování, přenositelnost a vznést námitku. Souhlas (recenze, cookies) můžete kdykoli odvolat – cookies přes <CookieSettingsLink />. Stačí napsat na <a href={`mailto:${s.email}`}>{s.email}</a>, odpovím do 30 dnů.</p>
          <p>Pokud nebudete spokojeni, můžete podat stížnost u Úřadu pro ochranu osobních údajů (<a href="https://uoou.gov.cz" target="_blank" rel="noopener">uoou.gov.cz</a>).</p>

          <p className="gdpr-meta">Více o cookies na stránce <Link href="/cookies">Cookies</Link>. Platné od 6. 10. 2026.</p>
        </section>
      </div>
    </>
  );
}
