import Link from "next/link";
import type { Settings } from "@/lib/settings";
import { telHref, waHref } from "@/lib/settings";
import { WaIcon } from "./icons";
import { Logo } from "./Logo";
import { BookLink } from "./BookLink";
import { CookieSettingsLink } from "./CookieBar";

const Icon = ({ d }: { d: string }) => (
  <svg className="f-ico" viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const PIN = "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z";
const PHONE = "M5 4h3l1.5 4.5-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2L20 16v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z";
const MAIL = "M4 6h16v12H4zM4 7l8 6 8-6";

/** Nevyplněný údaj ([HRANATÉ ZÁVORKY]) se na webu nezobrazuje. */
const filled = (v: string) => Boolean(v) && !v.includes("[");

export function Footer({ s }: { s: Settings }) {
  const mapsUrl = s.googleMaps || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.mapQuery)}`;
  const operator = [s.operatorName, s.operatorId && `IČO ${s.operatorId}`, s.operatorAddress].filter((x): x is string => Boolean(x) && filled(x));
  const hours: [string, string][] = [["Po – Pá", s.hoursWeek], ["Sobota", s.hoursSat], ["Neděle", s.hoursSun]];

  return (
    <footer className="site-footer">
      <div className="footer-line" aria-hidden="true" />
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo size={64} className="footer-brand__logo" />
            <div>
              <p className="footer-brand__name">Kosmetika &amp; masáže na Zeleném pruhu</p>
              <p className="footer-brand__claim">Krásné výsledky <span aria-hidden="true">·</span> Rozumné ceny</p>
            </div>
          </div>
          <div className="footer-top__cta">
            {(s.instagram || s.facebook) && (
              <p className="footer-social">
                {s.instagram && <a href={s.instagram} target="_blank" rel="noopener me">Instagram</a>}
                {s.facebook && <a href={s.facebook} target="_blank" rel="noopener me">Facebook</a>}
              </p>
            )}
            <BookLink url={s.bookingUrl} className="btn btn--primary">Rezervovat termín</BookLink>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h2>Kontakt</h2>
            <ul className="f-contact">
              <li><Icon d={PIN} /><span>{filled(s.place) && <>{s.place}<br /></>}{s.street}<br />{s.city}<br />
                <a className="f-link" href={mapsUrl} target="_blank" rel="noopener">Navigovat →</a></span></li>
              <li><Icon d={PHONE} /><a href={telHref(s.phone)}>{s.phone}</a></li>
              {s.whatsapp && <li><WaIcon /><a href={waHref(s.whatsapp)} target="_blank" rel="noopener">Napsat na WhatsApp</a></li>}
              <li><Icon d={MAIL} /><a href={`mailto:${s.email}`}>{s.email}</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h2>Otevírací doba</h2>
            <dl className="f-hours">
              {hours.map(([d, t]) => (
                <div key={d}><dt>{d}</dt><dd className={/zavřeno/i.test(t) ? "is-closed" : undefined}>{t}</dd></div>
              ))}
            </dl>
          </div>

          <nav className="footer-col" aria-label="Menu v patičce">
            <h2>Menu</h2>
            <ul className="f-menu">
              <li><Link href="/kosmetika">Kosmetika</Link></li>
              <li><Link href="/masaze">Masáže a balíčky</Link></li>
              <li><Link href="/darkovy-poukaz">Dárkový poukaz</Link></li>
              <li><Link href="/galerie">Galerie</Link></li>
              <li><Link href="/kontakty">Kontakty</Link></li>
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Kosmetika a masáže na Zeleném pruhu{operator.length > 0 && <> · Provozovatel: {operator.join(", ")}</>}</p>
          <p className="footer-bottom__links"><Link href="/cookies">Cookies</Link><CookieSettingsLink /><span>Navrhl a vytvořil <a href="https://weblyx.cz" target="_blank" rel="noopener">Weblyx</a></span></p>
        </div>
      </div>
    </footer>
  );
}
