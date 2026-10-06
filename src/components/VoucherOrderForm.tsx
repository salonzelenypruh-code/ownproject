"use client";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { submitVoucherOrder, type FormState } from "@/app/(web)/actions";

export function VoucherOrderForm({ presets }: { presets: number[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitVoucherOrder, null);
  const [value, setValue] = useState(String(presets[1] ?? presets[0] ?? "jina"));
  const [delivery, setDelivery] = useState("kupujici");
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const err = (k: string) => state?.errors?.[k];
  useEffect(() => {
    if (state?.ok) doneRef.current?.focus();
    const first = state?.errors && Object.keys(state.errors)[0];
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state]);
  const f = (name: string) => ({ name, id: `vo-${name}`, "aria-invalid": err(name) ? true : undefined });

  if (state?.ok && state.summary) {
    const sm = state.summary;
    return (
      <div className="form-done" role="status" tabIndex={-1} ref={doneRef}>
        <div className="form-done__icon" aria-hidden="true">✓</div>
        <h2 className="form-done__title">Objednávka odeslána</h2>
        <p className="form-done__lead">Děkujeme, {sm.name.split(" ")[0]}! Ozveme se vám na <strong>{sm.phone}</strong>, domluvíme platbu a poukaz vám pošleme.</p>
        <dl className="form-done__sum">
          <div><dt>Poukaz</dt><dd>{sm.service.replace("Dárkový poukaz ", "")}</dd></div>
          {sm.date && <div><dt>Pro</dt><dd>{sm.date}</dd></div>}
          <div><dt>Doručení</dt><dd>{sm.time}</dd></div>
        </dl>
      </div>
    );
  }

  return (
    <form ref={formRef} className="form" noValidate onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }}>
      <fieldset className="field field--full vo-values">
        <legend>Hodnota poukazu <span className="req" aria-hidden="true">*</span></legend>
        <div className="vo-chips">
          {presets.map((p) => (
            <label key={p} className={value === String(p) ? "is-on" : ""}><input type="radio" name="hodnota" value={p} checked={value === String(p)} onChange={() => setValue(String(p))} />{p.toLocaleString("cs-CZ")} Kč</label>
          ))}
          <label className={value === "jina" ? "is-on" : ""}><input type="radio" name="hodnota" value="jina" checked={value === "jina"} onChange={() => setValue("jina")} />Jiná částka</label>
        </div>
        {value === "jina" && (
          <div className="field" style={{ marginTop: 10 }}>
            <label htmlFor="vo-hodnotaJina">Částka (Kč)</label>
            <input {...f("hodnotaJina")} inputMode="numeric" placeholder="Např. 1500" />
            <span className="field__error" aria-live="polite">{err("hodnotaJina")}</span>
          </div>
        )}
      </fieldset>
      <div className="field">
        <label htmlFor="vo-proKoho">Pro koho (jméno na poukaz)</label>
        <input {...f("proKoho")} placeholder="Např. Jana" />
      </div>
      <div className="field">
        <label htmlFor="vo-doruceni">Kam poukaz poslat <span className="req" aria-hidden="true">*</span></label>
        <select {...f("doruceni")} value={delivery} onChange={(e) => setDelivery(e.target.value)}>
          <option value="kupujici">E-mailem mně</option>
          <option value="obdarovany">E-mailem přímo obdarované/mu</option>
          <option value="osobne">Vyzvednu si v salonu</option>
        </select>
      </div>
      {delivery === "obdarovany" && (
        <div className="field field--full">
          <label htmlFor="vo-emailObdarovane">E-mail obdarované/ho <span className="req" aria-hidden="true">*</span></label>
          <input {...f("emailObdarovane")} type="email" inputMode="email" />
          <span className="field__error" aria-live="polite">{err("emailObdarovane")}</span>
        </div>
      )}
      <div className="field field--full">
        <label htmlFor="vo-venovani">Věnování na poukaz</label>
        <textarea {...f("venovani")} rows={2} placeholder="Např. Všechno nejlepší k narozeninám!" />
      </div>
      <p className="form__note field--full" style={{ marginTop: 4 }}><strong>Vaše kontaktní údaje</strong></p>
      <div className="field">
        <label htmlFor="vo-jmeno">Jméno a příjmení <span className="req" aria-hidden="true">*</span></label>
        <input {...f("jmeno")} autoComplete="name" required />
        <span className="field__error" aria-live="polite">{err("jmeno")}</span>
      </div>
      <div className="field">
        <label htmlFor="vo-telefon">Telefon <span className="req" aria-hidden="true">*</span></label>
        <input {...f("telefon")} type="tel" autoComplete="tel" inputMode="tel" required />
        <span className="field__error" aria-live="polite">{err("telefon")}</span>
      </div>
      <div className="field field--full">
        <label htmlFor="vo-email">E-mail <span className="req" aria-hidden="true">*</span></label>
        <input {...f("email")} type="email" autoComplete="email" required />
        <span className="field__error" aria-live="polite">{err("email")}</span>
      </div>
      <div className="field field--full">
        <label htmlFor="vo-poznamka">Poznámka</label>
        <textarea {...f("poznamka")} rows={2} placeholder="Např. poukaz potřebuji do pátku" />
      </div>
      <div className="hp-field" aria-hidden="true"><input name="_honey" type="text" tabIndex={-1} autoComplete="off" aria-label="Nevyplňujte" /></div>
      <p className="form__note">Po odeslání vás kontaktujeme a domluvíme platbu. Poukaz pak dostanete e-mailem s QR kódem. <a href="/ochrana-osobnich-udaju">Ochrana osobních údajů</a></p>
      <div className="form__actions"><button className="btn btn--primary" type="submit" disabled={pending}>{pending ? "Odesílám…" : "Objednat poukaz"}</button></div>
      {state && !state.ok && <div className="form-status form-status--err" role="status">{state.message}</div>}
    </form>
  );
}
