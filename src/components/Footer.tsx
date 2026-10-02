import Link from "next/link";
import type { Settings } from "@/lib/settings";
import { telHref, waHref } from "@/lib/settings";
import { WaIcon } from "./icons";
import { Logo } from "./Logo";
import { BookLink } from "./BookLink";

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo size={72} />
            <p className="footer-brand__name">Kosmetika &amp; masáže<br />na Zeleném pruhu</p>
            <p className="footer-brand__claim">Krásné výsledky · Rozumné ceny</p>
          </div>
          <nav className="footer-col" aria-label="Menu v patičce">
            <h2>Menu</h2>
            <ul>
              <li><Link href="/kosmetika">Kosmetika</Link></li>
              <li><Link href="/masaze">Masáže a balíčky</Link></li>
              <li><Link href="/darkovy-poukaz">Dárkový poukaz</Link></li>
              <li><Link href="/galerie">Galerie</Link></li>
              <li><Link href="/kontakty">Kontakty</Link></li>
            </ul>
          </nav>
          <div className="footer-col">
            <h2>Kontakt</h2>
            <p>{s.street}<br />{s.city}</p>
            <p><a href={telHref(s.phone)}>{s.phone}</a></p>
            {s.whatsapp && <p><a className="wa-link" href={waHref(s.whatsapp)} target="_blank" rel="noopener"><WaIcon />WhatsApp</a></p>}
            <p><a href={`mailto:${s.email}`}>{s.email}</a></p>
          </div>
          <div className="footer-col">
            <h2>Otevírací doba</h2>
            <p>Po – Pá: {s.hoursWeek}<br />So: {s.hoursSat}<br />Ne: {s.hoursSun}</p>
            <BookLink url={s.bookingUrl}>Rezervace</BookLink>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Galyna Tretyak</span>
          <span>Kosmetika a masáže na Zeleném pruhu, Praha 4</span>
        </div>
      </div>
    </footer>
  );
}
