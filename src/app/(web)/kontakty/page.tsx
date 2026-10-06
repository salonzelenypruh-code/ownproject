import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";
import { MapEmbed } from "@/components/MapEmbed";
import { BookLink } from "@/components/BookLink";
import { IgIcon, WaIcon } from "@/components/icons";
import { instagram } from "@/lib/social";
import { getSettings, telHref, waHref } from "@/lib/settings";

export const metadata = pageMeta("/kontakty", "Kontakt – Roškotova 1717/2, Praha 4 – Braník", "Salon najdete v Poliklinice Zelený pruh, Roškotova 1717/2, Praha 4 – Braník. Otevřeno Po–So 8:00–20:00. Telefon, WhatsApp, e-mail a mapa.");

export default async function Kontakty() {
  const s = await getSettings();
  return (
    <>
      <Breadcrumbs items={[["Kontakty", "/kontakty"]]} />
      <div className="page-head wrap">
        <span className="eyebrow">Kde mě najdete</span>
        <h1>Kontakty<span className="h1-sub">Poliklinika Zelený pruh, Praha 4 – Braník</span></h1>
      </div>
      <div className="wrap page-body">
        <div className="contact-grid">
          <section className="panel" aria-label="Kontaktní údaje">
            <div className="contact-block"><span className="eyebrow">Adresa</span><address style={{ fontStyle: "normal" }}><p>{s.place && <>{s.place}<br /></>}{s.street}<br />{s.city}</p></address></div>
            <div className="contact-block"><span className="eyebrow">Telefon{s.whatsapp ? " a WhatsApp" : ""}</span>
              <p><a href={telHref(s.phone)}>{s.phone}</a></p>
              {s.whatsapp && <p><a className="wa-link" href={waHref(s.whatsapp)} target="_blank" rel="noopener"><WaIcon />Napsat na WhatsApp</a></p>}
            </div>
            {instagram(s.instagram) && (
              <div className="contact-block"><span className="eyebrow">Instagram</span>
                <p><a className="wa-link" href={instagram(s.instagram)!.url} target="_blank" rel="noopener me"><IgIcon />{instagram(s.instagram)!.handle}</a></p>
              </div>
            )}
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
            <MapEmbed query={s.mapQuery} directionsUrl={s.googleMaps || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.mapQuery)}`} />
          </div>
        </div>
      </div>
    </>
  );
}
