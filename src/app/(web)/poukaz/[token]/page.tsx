import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { getSettings, telHref } from "@/lib/settings";
import { STATE_LABEL, fmtCzDate, qrDataUrl, voucherState, voucherValue } from "@/lib/vouchers";
import { Logo } from "@/components/Logo";
import { RedeemPanel } from "./RedeemPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dárkový poukaz", robots: { index: false, follow: false } };

export default async function VoucherPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [v] = await db.select().from(schema.vouchers).where(eq(schema.vouchers.token, token));
  if (!v) notFound();
  const [session, s, qr] = await Promise.all([getSession(), getSettings(), qrDataUrl(v)]);
  const state = voucherState(v);

  return (
    <div className="wrap page-body voucher-page">
      {session && <RedeemPanel id={v.id} code={v.code} state={state} stateLabel={STATE_LABEL[state]} value={voucherValue(v)} validUntil={fmtCzDate(v.validUntil)}
        usedAt={v.usedAt ? v.usedAt.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" }) : null} note={v.note} />}

      <article className={`gift gift--${state}`} aria-label="Dárkový poukaz">
        {state !== "platny" && <p className="gift__stamp">{STATE_LABEL[state]}</p>}
        <Logo size={96} className="gift__logo" />
        <p className="gift__eyebrow">Dárkový poukaz</p>
        <h1 className="gift__title">Kosmetika a masáže<br />na Zeleném pruhu</h1>
        {(v.recipientName || v.buyerName) && (
          <p className="gift__people">
            {v.recipientName && <>Pro: <strong>{v.recipientName}</strong></>}
            {v.recipientName && v.buyerName && <br />}
            {v.buyerName && <>Od: <strong>{v.buyerName}</strong></>}
          </p>
        )}
        <p className="gift__value">{voucherValue(v)}</p>
        <p className="gift__valid">Platnost do {fmtCzDate(v.validUntil)}</p>
        {v.message && <p className="gift__message">„{v.message}“</p>}
        <img className="gift__qr" src={qr} alt={`QR kód poukazu ${v.code}`} width={200} height={200} />
        <p className="gift__code">{v.code}</p>
        <p className="gift__info">
          Poukaz ukažte při návštěvě salonu. Termín si domluvte na <a href={telHref(s.phone)}>{s.phone}</a>.<br />
          {[s.place, s.street, s.city].filter((x) => x && !x.includes("[")).join(", ")}
        </p>
      </article>
      <p className="gift__print"><button type="button" className="btn btn--ghost" data-print>Vytisknout poukaz</button></p>
      <script dangerouslySetInnerHTML={{ __html: `document.querySelector("[data-print]")?.addEventListener("click",()=>print())` }} />
    </div>
  );
}
