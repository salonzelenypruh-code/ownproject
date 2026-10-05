import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { fmtDateTime } from "@/lib/dates";
import { getSettings } from "@/lib/settings";
import { ActionForm, SubmitButton } from "@/components/admin/ui";
import { saveSettings } from "../actions";

export const metadata = { title: "Přehled" };

export default async function Dashboard() {
  const s = await getSettings();
  const [latest, [{ n: newSubs }], [{ n: pending }], [{ n: services }], [{ n: photos }]] = await Promise.all([
    db.select().from(schema.submissions).where(and(eq(schema.submissions.status, "nova"), eq(schema.submissions.kind, "rezervace"))).orderBy(desc(schema.submissions.createdAt)).limit(5),
    db.select({ n: count() }).from(schema.submissions).where(and(eq(schema.submissions.status, "nova"), eq(schema.submissions.kind, "rezervace"))),
    db.select({ n: count() }).from(schema.reviews).where(eq(schema.reviews.published, false)),
    db.select({ n: count() }).from(schema.services),
    db.select({ n: count() }).from(schema.photos),
  ]);
  return (
    <>
      <h1 className="a-h1">Dobrý den 👋</h1>
      <div className="a-stats">
        <Link href="/admin/zadosti" className={`a-stat${newSubs ? " a-stat--hot" : ""}`}><b>{newSubs}</b><span>nových rezervací</span></Link>
        <Link href="/admin/recenze" className={`a-stat${pending ? " a-stat--hot" : ""}`}><b>{pending}</b><span>recenzí ke schválení</span></Link>
        <Link href="/admin/sluzby" className="a-stat"><b>{services}</b><span>služeb v ceníku</span></Link>
        <Link href="/admin/fotky" className="a-stat"><b>{photos}</b><span>fotek na webu</span></Link>
      </div>

      <section className="a-card">
        <h2>Rychlé akce</h2>
        <div className="a-actions">
          <Link className="a-btn a-btn--primary" href="/admin/poukazy">🎁 Vytvořit poukaz</Link>
          <Link className="a-btn" href="/admin/sluzby/nova">+ Přidat službu</Link>
          <Link className="a-btn" href="/admin/fotky">Nahrát fotky</Link>
          <Link className="a-btn" href="/admin/recenze">Přidat recenzi</Link>
          <Link className="a-btn" href="/admin/nastaveni">Kontakty a otevírací doba</Link>
        </div>
      </section>

      <section className="a-card">
        <div className="a-card__head"><h2>Nové rezervace</h2><Link href="/admin/zadosti" className="a-link">Všechny →</Link></div>
        {latest.length ? (
          <ul className="a-list">
            {latest.map((s) => (
              <li key={s.id}><Link href={`/admin/zadosti#z${s.id}`} className="a-list__row">
                <span><strong>{s.name}</strong><br /><span className="a-muted">{s.service}</span></span>
                <span className="a-muted a-small">{fmtDateTime(s.createdAt)}</span>
              </Link></li>
            ))}
          </ul>
        ) : <p className="a-muted">Žádné nové žádosti.</p>}
      </section>

      <section className={`a-card${s.bookingUrl ? "" : " a-card--hot"}`} id="notino">
        <div className="a-card__head">
          <h2>Online rezervace (Notino)</h2>
          <span className={`a-pill ${s.bookingUrl ? "a-pill--ok" : "a-pill--off"}`}>{s.bookingUrl ? "Zapnuto" : "Vypnuto"}</span>
        </div>
        <p className="a-hint">
          {s.bookingUrl
            ? "Tlačítka „Rezervace“ na webu vedou do Notina. Formulář na webu slouží jen pro dárkové poukazy a dotazy."
            : "Vložte odkaz na profil salonu v Notino Partner (najdete ho v aplikaci Notino Partner). Dokud je pole prázdné, rezervace chodí přes formulář na webu."}
        </p>
        <ActionForm action={saveSettings} className="a-stack">
          <label className="a-field"><span>Odkaz na profil salonu</span>
            <input name="bookingUrl" type="url" inputMode="url" defaultValue={s.bookingUrl} className="a-input" placeholder="https://partner.notino.com/…" />
          </label>
          <div className="a-actions">
            <SubmitButton>Uložit odkaz</SubmitButton>
            {s.bookingUrl && <a className="a-btn" href={s.bookingUrl} target="_blank" rel="noopener">Vyzkoušet odkaz ↗</a>}
          </div>
          <p className="a-hint" style={{ margin: 0 }}>Vypnutí: smažte odkaz a uložte.</p>
        </ActionForm>
      </section>

    </>
  );
}
