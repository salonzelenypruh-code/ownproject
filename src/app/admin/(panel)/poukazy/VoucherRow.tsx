"use client";
import { useState } from "react";
import { ActionForm, SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { resendVoucher, setVoucherStatus } from "../../actions";

export function VoucherShare({ id, url, code, value, email, phone }: { id: number; url: string; code: string; value: string; email: string; phone?: string }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/${(phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Dárkový poukaz – Kosmetika a masáže na Zeleném pruhu (${value}).\nKód ${code}\n${url}`)}`;
  return (
    <div className="a-stack">
      <div className="a-actions">
        <a className="a-btn a-btn--primary a-btn--sm" href={url} target="_blank" rel="noopener">Zobrazit / uplatnit</a>
        <button type="button" className="a-btn a-btn--sm" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt("Zkopírujte odkaz:", url); } }}>{copied ? "Zkopírováno ✓" : "Kopírovat odkaz"}</button>
        <a className="a-btn a-btn--sm" href={wa} target="_blank" rel="noopener">Poslat přes WhatsApp</a>
      </div>
      <details className="a-details">
        <summary>Poslat e-mailem{email ? " znovu" : ""}</summary>
        <ActionForm action={resendVoucher} className="a-stack">
          <input type="hidden" name="id" value={id} />
          <label className="a-field"><span>E-mail</span><input name="email" type="email" defaultValue={email} className="a-input" required /></label>
          <SubmitButton className="a-btn a-btn--sm" pendingText="Odesílám…">Odeslat</SubmitButton>
        </ActionForm>
      </details>
    </div>
  );
}

export function VoucherStatusForm({ id, status }: { id: number; status: string }) {
  return (
    <div className="a-actions">
      {status !== "zruseny" && (
        <form action={setVoucherStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="zruseny" />
          <ConfirmButton message="Zrušit poukaz? Přestane platit." className="a-btn a-btn--danger a-btn--sm">Zrušit poukaz</ConfirmButton></form>
      )}
      {status !== "aktivni" && (
        <form action={setVoucherStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="aktivni" />
          <ConfirmButton message="Vrátit poukaz zpět na platný?" className="a-btn a-btn--sm">Vrátit na platný</ConfirmButton></form>
      )}
    </div>
  );
}
