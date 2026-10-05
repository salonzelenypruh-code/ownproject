import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";
import { Logo } from "@/components/Logo";
import { ReservationForm } from "@/components/ReservationForm";
import { WaIcon } from "@/components/icons";
import { getSettings, telHref, waHref } from "@/lib/settings";

export const metadata = pageMeta("/rezervace", "Rezervace termínu", "Objednejte se na kosmetiku nebo masáž v salonu na Zeleném pruhu, Praha 4 – online, telefonem nebo přes WhatsApp.");

export default async function Rezervace({ searchParams }: { searchParams: Promise<{ sluzba?: string }> }) {
  const [{ sluzba }, s] = await Promise.all([searchParams, getSettings()]);
  return (
    <>
      <Breadcrumbs items={[["Rezervace", "/rezervace"]]} />
      <div className="page-head wrap">
        <span className="eyebrow">Objednejte se na termín</span>
        <h1>Rezervace</h1>
      </div>
      <div className="wrap page-body">
        {s.bookingUrl && (
          <section className="panel book-online" aria-labelledby="online-h">
            <h2 id="online-h">Vyberte si volný termín online</h2>
            <p>Volné termíny a rezervaci najdete v rezervačním systému Notino. Rezervace je hned potvrzená v kalendáři salonu.</p>
            <a className="btn btn--primary btn--big" href={s.bookingUrl} target="_blank" rel="noopener">Rezervovat online</a>
          </section>
        )}
        <div className="form-grid">
          <section className="panel" aria-labelledby="form-h">
            <h2 id="form-h" className={s.bookingUrl ? undefined : "visually-hidden"}>{s.bookingUrl ? "Dárkový poukaz nebo dotaz" : "Formulář rezervace"}</h2>
            <ReservationForm preset={sluzba ?? (s.bookingUrl ? "poukaz" : undefined)} inquiry={Boolean(s.bookingUrl)} />
          </section>
          <aside className="panel call-panel" aria-labelledby="call-h">
            <Logo size={100} />
            <h2 id="call-h">Raději telefonicky?</h2>
            <p>Zavolejte{s.whatsapp ? " nebo napište na WhatsApp" : ""} a domluvíme termín, který vám vyhovuje.</p>
            <a className="call-panel__phone" href={telHref(s.phone)}>{s.phone}</a>
            {s.whatsapp && <p style={{ margin: "12px 0 0" }}><a className="btn btn--ghost" href={waHref(s.whatsapp)} target="_blank" rel="noopener"><WaIcon />Napsat na WhatsApp</a></p>}
            <p style={{ margin: "8px 0 0" }}>Po – Pá: {s.hoursWeek}<br />So: {s.hoursSat}</p>
          </aside>
        </div>
      </div>
    </>
  );
}
