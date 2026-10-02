import { asc, desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/ui";
import { deleteReview, saveReview, setReviewPublished } from "../../actions";
import { fmtDateTime } from "@/lib/dates";
import type { Review } from "@/db/schema";

export const metadata = { title: "Recenze" };

function ReviewFields({ r }: { r?: Review }) {
  return (
    <>
      {r && <input type="hidden" name="id" value={r.id} />}
      <div className="a-grid2">
        <label className="a-field"><span>Jméno</span><input name="name" defaultValue={r?.name} required className="a-input" placeholder="Např. Jana N." /></label>
        <label className="a-field"><span>Hodnocení</span>
          <select name="rating" defaultValue={r?.rating ?? 5} className="a-input">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}</select>
        </label>
      </div>
      <label className="a-field"><span>Text</span><textarea name="text" defaultValue={r?.text} rows={4} required className="a-input" /></label>
      <label className="a-check"><input type="checkbox" name="published" defaultChecked={r?.published ?? true} /> Zobrazit na webu</label>
    </>
  );
}

export default async function Recenze() {
  const all = await db.select().from(schema.reviews).orderBy(asc(schema.reviews.published), desc(schema.reviews.createdAt));
  const pending = all.filter((r) => !r.published);
  const published = all.filter((r) => r.published);
  return (
    <>
      <h1 className="a-h1">Recenze</h1>
      <p className="a-muted a-lead">Recenze od zákazníků z webu čekají na vaše schválení. Můžete také přepsat recenzi, kterou jste dostala jinak (Google, WhatsApp…).</p>

      {pending.length > 0 && (
        <section className="a-card a-card--hot">
          <h2>Čeká na schválení ({pending.length})</h2>
          <ul className="a-stack">
            {pending.map((r) => (
              <li key={r.id} className="a-review">
                <p><strong>{r.name}</strong> <span className="a-stars">{"★".repeat(r.rating)}</span> <span className="a-muted a-small">· {r.source === "web" ? "z webu" : "ručně"} · {fmtDateTime(r.createdAt)}</span></p>
                <p className="a-note">{r.text}</p>
                <div className="a-actions">
                  <form action={setReviewPublished}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="published" value="1" /><SubmitButton>✓ Schválit</SubmitButton></form>
                  <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><ConfirmButton message="Opravdu smazat tuto recenzi?">Smazat</ConfirmButton></form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="a-card">
        <h2>Přidat recenzi</h2>
        <ActionForm action={saveReview} className="a-stack" resetOnSuccess>
          <ReviewFields />
          <SubmitButton>Přidat recenzi</SubmitButton>
        </ActionForm>
      </section>

      <section className="a-card">
        <h2>Na webu ({published.length})</h2>
        {!published.length && <p className="a-muted">Zatím žádné zveřejněné recenze – sekce Recenze na úvodní stránce zobrazuje jen výzvu k napsání.</p>}
        <ul className="a-stack">
          {published.map((r) => (
            <li key={r.id} className="a-review">
              <details>
                <summary><strong>{r.name}</strong> <span className="a-stars">{"★".repeat(r.rating)}</span><br /><span className="a-muted a-small">{r.text.slice(0, 90)}{r.text.length > 90 ? "…" : ""}</span></summary>
                <ActionForm action={saveReview} className="a-stack">
                  <ReviewFields r={r} />
                  <SubmitButton>Uložit</SubmitButton>
                </ActionForm>
                <form action={deleteReview} style={{ marginTop: 12 }}><input type="hidden" name="id" value={r.id} /><ConfirmButton message="Opravdu smazat tuto recenzi?" className="a-btn a-btn--danger a-btn--sm">Smazat</ConfirmButton></form>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
