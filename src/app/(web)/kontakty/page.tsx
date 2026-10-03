import { pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { BookLink } from "@/components/BookLink";
import { WaIcon } from "@/components/icons";
import { getSettings, telHref, waHref } from "@/lib/settings";

export const metadata = pageMeta("/kontakty", "Kontakty a otevírací doba", "Adresa, telefon, WhatsApp, e-mail, otevírací doba a mapa salonu Kosmetika a masáže na Zeleném pruhu v Praze 4.");

export default async function Kontakty() {
  const s = await getSettings();
  return (
    <>
      <JsonLd s={s} />
      <div className="page-head wrap">
        <span className="eyebrow">Kde mě najdete</span>
        <h1>Kontakty</h1>
      </div>
      <div className="wrap page-body">
        <div className="contact-grid">
          <section className="panel" aria-label="Kontaktní údaje">
            <div className="contact-block"><span className="eyebrow">Adresa</span><address style={{ fontStyle: "normal" }}><p>{s.place && <>{s.place}<br /></>}{s.street}<br />{s.city}</p></address></div>
            <div className="contact-block"><span className="eyebrow">Telefon{s.whatsapp ? " a WhatsApp" : ""}</span>
              <p><a href={telHref(s.phone)}>{s.phone}</a></p>
              {s.whatsapp && <p><a className="wa-link" href={waHref(s.whatsapp)} target="_blank" rel="noopener"><WaIcon />Napsat na WhatsApp</a></p>}
            </div>
            <div className="contact-block"><span className="eyebrow">E-mail</span><p><a href={`mailto:${s.email}`}>{s.email}</a></p></div>
            <div className="contact-block"><span className="eyebrow">Otevírací doba</span>
              <dl className="hours">
                <div><dt>Po – Pá</dt><dd>{s.hoursWeek}</dd></div>
                <div><dt>So</dt><dd>{s.hoursSat}</dd></div>
                <div><dt>Ne</dt><dd>{s.hoursSun}</dd></div>
              </dl>
            </div>
            <BookLink url={s.bookingUrl}>Rezervovat termín</BookLink>
          </section>
          <div className="panel map-panel">
            <iframe title={`Mapa – ${s.mapQuery}`} src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </div>
    </>
  );
}
