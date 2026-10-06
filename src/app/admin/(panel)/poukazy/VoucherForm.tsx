"use client";
import { startTransition, useActionState, useState } from "react";
import { createVoucher } from "../../actions";

export function VoucherForm({ presets, months, prefill }: { presets: number[]; months: number; prefill?: { orderId: number; buyerName: string; email: string; note: string; amount?: number; recipientName?: string; message?: string } }) {
  const [state, action, pending] = useActionState(createVoucher, null);
  const [kind, setKind] = useState<"amount" | "service">("amount");
  const [amount, setAmount] = useState(prefill?.amount ? (presets.includes(prefill.amount) ? String(prefill.amount) : "jina") : String(presets[0] ?? ""));
  const [email, setEmail] = useState(prefill?.email ?? "");
  return (
    <form className="a-card a-stack" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }}>
      <h2 style={{ margin: 0 }}>{prefill ? `Poukaz pro objednávku – ${prefill.buyerName}` : "Nový poukaz"}</h2>
      {prefill && <input type="hidden" name="orderId" value={prefill.orderId} />}
      <div className="a-seg" role="radiogroup" aria-label="Typ poukazu">
        <label className={kind === "amount" ? "is-on" : ""}><input type="radio" name="kind" value="amount" checked={kind === "amount"} onChange={() => setKind("amount")} />Na částku</label>
        <label className={kind === "service" ? "is-on" : ""}><input type="radio" name="kind" value="service" checked={kind === "service"} onChange={() => setKind("service")} />Na službu</label>
      </div>
      {kind === "amount" ? (
        <fieldset className="a-fieldset">
          <legend>Hodnota</legend>
          <div className="a-chips">
            {presets.map((p) => (
              <label key={p} className={amount === String(p) ? "is-on" : ""}>
                <input type="radio" name="amount" value={p} checked={amount === String(p)} onChange={() => setAmount(String(p))} />{p.toLocaleString("cs-CZ")} Kč
              </label>
            ))}
            <label className={amount === "jina" ? "is-on" : ""}><input type="radio" name="amount" value="jina" checked={amount === "jina"} onChange={() => setAmount("jina")} />Jiná</label>
          </div>
          {amount === "jina" && <label className="a-field"><span>Částka (Kč)</span><input name="amountCustom" inputMode="numeric" className="a-input" placeholder="Např. 1500" required defaultValue={prefill?.amount && !presets.includes(prefill.amount) ? prefill.amount : undefined} /></label>}
        </fieldset>
      ) : (
        <label className="a-field"><span>Služba</span><input name="service" className="a-input" placeholder="Např. Aktivní anti-aging (100 min)" required /></label>
      )}
      <div className="a-grid2 a-grid2--even">
        <label className="a-field"><span>Pro koho (nepovinné)</span><input name="recipientName" className="a-input" placeholder="Jana" defaultValue={prefill?.recipientName} /></label>
        <label className="a-field"><span>Od koho (nepovinné)</span><input name="buyerName" className="a-input" placeholder="Petr" defaultValue={prefill?.buyerName} /></label>
      </div>
      <label className="a-field"><span>Věnování (nepovinné)</span><textarea name="message" rows={2} className="a-input" placeholder="Všechno nejlepší k narozeninám!" defaultValue={prefill?.message} /></label>
      <div className="a-grid2 a-grid2--even">
        <label className="a-field"><span>E-mail, kam poukaz poslat</span><input name="email" type="email" inputMode="email" className="a-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="zakaznice@email.cz" /></label>
        <label className="a-field"><span>Platnost (měsíců)</span><input name="months" type="number" min={1} max={36} defaultValue={months} className="a-input" /></label>
      </div>
      <label className="a-check"><input type="checkbox" name="send" defaultChecked disabled={!email} /> Hned poslat e-mailem</label>
      <label className="a-field"><span>Poznámka pro mě (zákaznice ji neuvidí)</span><input name="note" className="a-input" placeholder="Např. zaplaceno hotově 5. 10." defaultValue={prefill?.note} /></label>
      <button className="a-btn a-btn--primary a-btn--block" disabled={pending}>{pending ? "Vytvářím…" : "Vytvořit poukaz"}</button>
      {state && !state.ok && <p role="alert" className="a-msg a-msg--err">{state.message}</p>}
    </form>
  );
}
