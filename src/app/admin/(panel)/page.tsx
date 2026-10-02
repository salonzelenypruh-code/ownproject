import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { fmtDateTime } from "@/lib/dates";

export const metadata = { title: "Přehled" };

export default async function Dashboard() {
  const [latest, [{ n: newSubs }], [{ n: pending }], [{ n: services }], [{ n: photos }]] = await Promise.all([
    db.select().from(schema.submissions).where(eq(schema.submissions.status, "nova")).orderBy(desc(schema.submissions.createdAt)).limit(5),
    db.select({ n: count() }).from(schema.submissions).where(eq(schema.submissions.status, "nova")),
    db.select({ n: count() }).from(schema.reviews).where(eq(schema.reviews.published, false)),
    db.select({ n: count() }).from(schema.services),
    db.select({ n: count() }).from(schema.photos),
  ]);
  return (
    <>
      <h1 className="a-h1">Dobrý den 👋</h1>
      <div className="a-stats">
        <Link href="/admin/zadosti" className={`a-stat${newSubs ? " a-stat--hot" : ""}`}><b>{newSubs}</b><span>nových žádostí</span></Link>
        <Link href="/admin/recenze" className={`a-stat${pending ? " a-stat--hot" : ""}`}><b>{pending}</b><span>recenzí ke schválení</span></Link>
        <Link href="/admin/sluzby" className="a-stat"><b>{services}</b><span>služeb v ceníku</span></Link>
        <Link href="/admin/fotky" className="a-stat"><b>{photos}</b><span>fotek na webu</span></Link>
      </div>

      <section className="a-card">
        <div className="a-card__head"><h2>Nové žádosti</h2><Link href="/admin/zadosti" className="a-link">Všechny →</Link></div>
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

      <section className="a-card">
        <h2>Rychlé akce</h2>
        <div className="a-actions">
          <Link className="a-btn a-btn--primary" href="/admin/sluzby/nova">+ Přidat službu</Link>
          <Link className="a-btn" href="/admin/fotky">Nahrát fotky</Link>
          <Link className="a-btn" href="/admin/recenze">Přidat recenzi</Link>
          <Link className="a-btn" href="/admin/nastaveni">Kontakty a otevírací doba</Link>
        </div>
      </section>
    </>
  );
}
