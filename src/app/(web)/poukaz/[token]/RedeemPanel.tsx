"use client";
import { startTransition, useActionState } from "react";
import Link from "next/link";
import { redeemVoucher, type ActionState } from "@/app/admin/actions";

export function RedeemPanel({ id, code, state, stateLabel, value, validUntil, usedAt, note }: {
  id: number; code: string; state: string; stateLabel: string; value: string; validUntil: string; usedAt: string | null; note: string;
}) {
  const [res, action, pending] = useActionState<ActionState, FormData>(redeemVoucher, null);
  const current = res?.ok ? "pouzity" : state;
  return (
    <section className={`redeem redeem--${current}`} aria-label="Uplatnění poukazu (administrace)">
      <p className="redeem__label">Administrace · poukaz {code}</p>
      <p className="redeem__state">{res?.ok ? "Použitý" : stateLabel}</p>
      <p className="redeem__meta">{value} · platnost do {validUntil}{usedAt && !res?.ok ? ` · uplatněn ${usedAt}` : ""}</p>
      {note && <p className="redeem__meta">Poznámka: {note}</p>}
      {current === "platny" && (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!window.confirm(`Uplatnit poukaz ${code} (${value})? Poté už nebude platit.`)) return;
          const fd = new FormData(e.currentTarget); startTransition(() => action(fd));
        }}>
          <input type="hidden" name="id" value={id} />
          <button className="redeem__btn" disabled={pending}>{pending ? "Uplatňuji…" : "✓ Uplatnit poukaz"}</button>
        </form>
      )}
      {res && <p role="status" className={`redeem__msg ${res.ok ? "is-ok" : "is-err"}`}>{res.message}</p>}
      <Link href="/admin/poukazy" className="redeem__link">← Všechny poukazy</Link>
    </section>
  );
}
