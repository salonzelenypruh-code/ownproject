import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSettings } from "@/lib/settings";
import { STATE_LABEL, fmtCzDate, voucherState, voucherUrl, voucherValue, type VoucherState } from "@/lib/vouchers";
import { findVoucher, setSubmissionStatus } from "../../actions";
import { telHref, waHref } from "@/lib/settings";
import { fmtDate, fmtDateTime } from "@/lib/dates";
import { VoucherForm } from "./VoucherForm";
import { VoucherShare, VoucherStatusForm } from "./VoucherRow";

export const metadata = { title: "Dárkové poukazy" };
export const dynamic = "force-dynamic";

export default async function Poukazy({ searchParams }: { searchParams: Promise<{ stav?: string; novy?: string; nenalezen?: string; objednavka?: string }> }) {
  const sp = await searchParams;
  const [all, s, orders] = await Promise.all([
    db.select().from(schema.vouchers).orderBy(desc(schema.vouchers.createdAt)),
    getSettings(),
    db.select().from(schema.submissions).where(and(eq(schema.submissions.kind, "poukaz"), eq(schema.submissions.status, "nova"))).orderBy(desc(schema.submissions.createdAt)),
  ]);
  const order = sp.objednavka ? orders.find((o) => o.id === Number(sp.objednavka)) : undefined;
  const filter = (["platny", "pouzity", "propadly", "zruseny", "vse"].includes(sp.stav ?? "") ? sp.stav : "platny") as VoucherState | "vse";
  const rows = all.filter((v) => filter === "vse" || voucherState(v) === filter);
  const count = (st: VoucherState) => all.filter((v) => voucherState(v) === st).length;
  const months = Number(String(s.voucherValidity).match(/\d+/)?.[0]) || 6;
  const presets = (s.voucherValue.match(/\d[\d\s]*\d/g) || []).map((x) => Number(x.replace(/\s/g, ""))).filter((n) => n >= 100);
  const created = sp.novy ? all.find((v) => v.id === Number(sp.novy)) : undefined;

  return (
    <>
      <h1 className="a-h1">Dárkové poukazy</h1>
      <p className="a-muted a-lead">Vytvořený poukaz dostane zákaznice e-mailem s QR kódem. Při návštěvě QR kód naskenujte foťákem v telefonu – otevře se poukaz s tlačítkem <b>Uplatnit</b>.</p>

      {created && (
        <section className="a-card a-card--ok">
          <h2>Poukaz {created.code} vytvořen ✓</h2>
          <p className="a-muted">{voucherValue(created)} · platnost do {fmtCzDate(created.validUntil)} · {created.emailSentAt ? `odeslán na ${created.email}` : created.email ? "e-mail se nepodařilo odeslat – pošlete ho přes WhatsApp nebo odkazem" : "bez e-mailu"}</p>
          <VoucherShare id={created.id} url={voucherUrl(created)} code={created.code} value={voucherValue(created)} email={created.email} />
        </section>
      )}

      {orders.length > 0 && (
        <section className="a-card a-card--hot">
          <h2>Objednávky z webu ({orders.length})</h2>
          <ul className="a-stack">
            {orders.map((o) => (
              <li key={o.id} className="a-review">
                <p><strong>{o.name}</strong> <span className="a-muted a-small">· {fmtDateTime(o.createdAt)}</span></p>
                <p className="a-muted a-small">{o.phone} · <span className="a-break">{o.email}</span>{o.preferredDate ? ` · chce do ${fmtDate(o.preferredDate)}` : ""}</p>
                {o.note && <p className="a-note">{o.note}</p>}
                <div className="a-actions">
                  <Link className="a-btn a-btn--primary a-btn--sm" href={`/admin/poukazy?objednavka=${o.id}#vystavit`}>🎁 Vystavit poukaz</Link>
                  <a className="a-btn a-btn--sm" href={telHref(o.phone)}>Zavolat</a>
                  <a className="a-btn a-btn--sm" href={waHref(o.phone)} target="_blank" rel="noopener">WhatsApp</a>
                  <form action={setSubmissionStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="vyrizena" /><button className="a-btn a-btn--sm">Vyřízeno</button></form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form action={findVoucher} className="a-card a-search">
        <label className="a-field"><span>Najít poukaz podle kódu</span><input name="code" className="a-input" placeholder="ZP-XXXX-XXXX" autoCapitalize="characters" required /></label>
        <button className="a-btn a-btn--primary">Najít</button>
        {sp.nenalezen && <p className="a-msg a-msg--err" style={{ gridColumn: "1 / -1" }}>Poukaz {sp.nenalezen} nebyl nalezen.</p>}
      </form>

      <details className="a-card a-collapse" id="vystavit" open={all.length === 0 || !!order}>
        <summary><h2 style={{ margin: 0 }}>+ Vytvořit nový poukaz</h2></summary>
        <VoucherForm key={order?.id ?? "new"} presets={presets.length ? presets : [1100, 1750, 2300]} months={months}
          prefill={order ? { orderId: order.id, buyerName: order.name, email: order.email, note: [`Objednávka z webu ${fmtDateTime(order.createdAt)}, tel. ${order.phone}`, order.note].filter(Boolean).join(" – ").slice(0, 900) } : undefined} />
      </details>

      <nav className="a-tabs a-tabs--scroll" aria-label="Filtr">
        {([["platny", "Platné"], ["pouzity", "Použité"], ["propadly", "Propadlé"], ["zruseny", "Zrušené"], ["vse", "Vše"]] as const).map(([k, l]) => (
          <Link key={k} href={`/admin/poukazy?stav=${k}`} aria-current={filter === k ? "page" : undefined}>{l}{k !== "vse" ? ` (${count(k)})` : ""}</Link>
        ))}
      </nav>
      {!rows.length && <p className="a-card a-muted">Žádné poukazy.</p>}
      <div className="a-stack">
        {rows.map((v) => {
          const st = voucherState(v);
          return (
            <article key={v.id} className={`a-card a-voucher a-voucher--${st}`}>
              <div className="a-sub__head">
                <div>
                  <h2 className="a-sub__name">{voucherValue(v)}</h2>
                  <p className="a-muted a-small"><span className="a-mono">{v.code}</span> · platnost do {fmtCzDate(v.validUntil)}</p>
                </div>
                <span className={`a-pill ${st === "platny" ? "a-pill--ok" : "a-pill--off"}`}>{STATE_LABEL[st]}</span>
              </div>
              <dl className="a-dl">
                {v.recipientName && <div><dt>Pro</dt><dd>{v.recipientName}</dd></div>}
                {v.buyerName && <div><dt>Od</dt><dd>{v.buyerName}</dd></div>}
                <div><dt>E-mail</dt><dd className="a-break">{v.email || "—"}{v.emailSentAt ? " ✓ odesláno" : ""}</dd></div>
                <div><dt>Vytvořen</dt><dd>{v.createdAt.toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague" })}</dd></div>
                {v.usedAt && <div><dt>Uplatněn</dt><dd>{v.usedAt.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" })}</dd></div>}
                {v.note && <div><dt>Poznámka</dt><dd>{v.note}</dd></div>}
              </dl>
              <VoucherShare id={v.id} url={voucherUrl(v)} code={v.code} value={voucherValue(v)} email={v.email} />
              <details className="a-details"><summary>Změnit stav</summary><VoucherStatusForm id={v.id} status={v.status} /></details>
            </article>
          );
        })}
      </div>
    </>
  );
}
