import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { SUBMISSION_STATUS, type SubmissionStatus } from "@/db/schema";
import { AutoSubmitSelect, ConfirmButton, SubmitButton } from "@/components/admin/ui";
import { deleteSubmission, saveSubmissionNote, setSubmissionStatus } from "../../actions";
import { fmtDate, fmtDateTime } from "@/lib/dates";
import { telHref, waHref } from "@/lib/settings";

export const metadata = { title: "Žádosti" };

export default async function Zadosti({ searchParams }: { searchParams: Promise<{ stav?: string }> }) {
  const { stav } = await searchParams;
  const filter = (stav && stav in SUBMISSION_STATUS ? stav : stav === "vse" ? "vse" : "nova") as SubmissionStatus | "vse";
  const rows = await db.select().from(schema.submissions)
    .where(filter === "vse" ? undefined : eq(schema.submissions.status, filter))
    .orderBy(desc(schema.submissions.createdAt));

  return (
    <>
      <h1 className="a-h1">Žádosti z webu</h1>
      <p className="a-muted a-lead">Každá žádost z rezervačního formuláře se uloží sem a zároveň přijde e-mailem.</p>
      <nav className="a-tabs" aria-label="Filtr">
        {[["nova", "Nové"], ["vyrizena", "Vyřízené"], ["archiv", "Archiv"], ["vse", "Vše"]].map(([k, l]) => (
          <Link key={k} href={`/admin/zadosti?stav=${k}`} aria-current={filter === k ? "page" : undefined}>{l}</Link>
        ))}
      </nav>
      {!rows.length && <p className="a-card a-muted">Nic tu není.</p>}
      <div className="a-stack">
        {rows.map((s) => (
          <article key={s.id} id={`z${s.id}`} className={`a-card a-sub a-sub--${s.status}`}>
            <div className="a-sub__head">
              <div>
                <h2 className="a-sub__name">{s.name}</h2>
                <p className="a-muted a-small">{fmtDateTime(s.createdAt)}{s.emailSent ? " · e-mail odeslán" : ""}</p>
              </div>
              <form action={setSubmissionStatus}>
                <input type="hidden" name="id" value={s.id} />
                <AutoSubmitSelect name="status" defaultValue={s.status} aria-label="Stav žádosti" className="a-select-sm">
                  {Object.entries(SUBMISSION_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </AutoSubmitSelect>
              </form>
            </div>
            <dl className="a-dl">
              <div><dt>Služba</dt><dd><strong>{s.service}</strong></dd></div>
              {s.preferredDate && <div><dt>Termín</dt><dd>{fmtDate(s.preferredDate)}</dd></div>}
              <div><dt>Telefon</dt><dd>{s.phone}</dd></div>
              <div><dt>E-mail</dt><dd className="a-break">{s.email}</dd></div>
            </dl>
            {s.note && <p className="a-note">{s.note}</p>}
            <div className="a-actions">
              <a className="a-btn a-btn--primary" href={telHref(s.phone)}>📞 Zavolat</a>
              <a className="a-btn" href={waHref(s.phone)} target="_blank" rel="noopener">WhatsApp</a>
              <a className="a-btn" href={`mailto:${s.email}?subject=${encodeURIComponent("Rezervace – Kosmetika a masáže na Zeleném pruhu")}`}>E-mail</a>
            </div>
            <details className="a-details">
              <summary>Poznámka pro mě{s.adminNote ? " ✓" : ""}</summary>
              <form action={saveSubmissionNote} className="a-stack">
                <input type="hidden" name="id" value={s.id} />
                <textarea name="adminNote" rows={3} defaultValue={s.adminNote} placeholder="Např. domluveno na čtvrtek 14:00" className="a-input" />
                <SubmitButton className="a-btn a-btn--sm">Uložit poznámku</SubmitButton>
              </form>
              <form action={deleteSubmission} style={{ marginTop: 12 }}>
                <input type="hidden" name="id" value={s.id} />
                <ConfirmButton message={`Opravdu smazat žádost od ${s.name}?`} className="a-btn a-btn--danger a-btn--sm">Smazat žádost</ConfirmButton>
              </form>
            </details>
          </article>
        ))}
      </div>
    </>
  );
}
