import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { CATEGORIES, type Category } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { moveService, toggleService } from "../../actions";

export const metadata = { title: "Služby a ceník" };

export default async function Sluzby({ searchParams }: { searchParams: Promise<{ ulozeno?: string; smazano?: string }> }) {
  const sp = await searchParams;
  const all = await db.select().from(schema.services).orderBy(asc(schema.services.sortOrder), asc(schema.services.id));
  return (
    <>
      <div className="a-titlebar">
        <h1 className="a-h1">Služby a ceník</h1>
        <Link className="a-btn a-btn--primary" href="/admin/sluzby/nova">+ Přidat službu</Link>
      </div>
      {sp.ulozeno && <p className="a-msg a-msg--ok">Služba uložena, na webu je změna hned vidět.</p>}
      {sp.smazano && <p className="a-msg a-msg--ok">Služba smazána.</p>}
      <nav className="a-tabs a-tabs--scroll" aria-label="Kategorie">
        {Object.entries(CATEGORIES).map(([k, c]) => <a key={k} href={`#${k}`}>{c.label}</a>)}
      </nav>
      {(Object.keys(CATEGORIES) as Category[]).map((cat) => {
        const items = all.filter((s) => s.category === cat);
        return (
          <section key={cat} id={cat} className="a-card">
            <div className="a-card__head">
              <h2>{CATEGORIES[cat].label}</h2>
              <Link className="a-link" href={`/admin/sluzby/nova?kategorie=${cat}`}>+ Přidat</Link>
            </div>
            {!items.length && <p className="a-muted">Zatím žádné služby.</p>}
            <ul className="a-list">
              {items.map((s, i) => (
                <li key={s.id} className={`a-svc${s.published ? "" : " a-svc--hidden"}`}>
                  <Link href={`/admin/sluzby/${s.id}`} className="a-svc__main">
                    <strong>{s.name}</strong>
                    <span className="a-muted a-small">
                      {s.variants.length ? s.variants.map((v) => [v.minutes != null && `${v.minutes} min`, v.price != null && `${formatPrice(v.price)} Kč`].filter(Boolean).join(" · ")).join("  |  ") : "bez ceny"}
                      {!s.published && " · skryto"}
                    </span>
                  </Link>
                  <div className="a-svc__tools">
                    <form action={moveService}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="dir" value="up" />
                      <button className="a-icon-btn" disabled={i === 0} aria-label={`Posunout ${s.name} výš`}>↑</button></form>
                    <form action={moveService}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="dir" value="down" />
                      <button className="a-icon-btn" disabled={i === items.length - 1} aria-label={`Posunout ${s.name} níž`}>↓</button></form>
                    <form action={toggleService}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="published" value={s.published ? "0" : "1"} />
                      <button className="a-icon-btn" aria-label={s.published ? `Skrýt ${s.name}` : `Zobrazit ${s.name}`} title={s.published ? "Skrýt na webu" : "Zobrazit na webu"}>{s.published ? "👁" : "🚫"}</button></form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
