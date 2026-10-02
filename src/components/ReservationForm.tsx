"use client";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { submitReservation, type FormState } from "@/app/(web)/actions";

const today = () => new Date().toISOString().slice(0, 10);

export function ReservationForm({ preset }: { preset?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitReservation, null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const err = (k: string) => state?.errors?.[k];

  useEffect(() => {
    if (!state) return;
    if (state.ok) formRef.current?.reset();
    const first = state.errors && Object.keys(state.errors)[0];
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    else statusRef.current?.focus();
  }, [state]);

  const field = (name: string) => ({ name, id: name, "aria-invalid": err(name) ? true : undefined, "aria-describedby": `${name}-error` });

  return (
    <form ref={formRef} className="form" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} noValidate>
      <div className="field">
        <label htmlFor="jmeno">Jméno a příjmení <span className="req" aria-hidden="true">*</span></label>
        <input {...field("jmeno")} type="text" autoComplete="name" required />
        <span className="field__error" id="jmeno-error" aria-live="polite">{err("jmeno")}</span>
      </div>
      <div className="field">
        <label htmlFor="telefon">Telefon <span className="req" aria-hidden="true">*</span></label>
        <input {...field("telefon")} type="tel" autoComplete="tel" inputMode="tel" required />
        <span className="field__error" id="telefon-error" aria-live="polite">{err("telefon")}</span>
      </div>
      <div className="field field--full">
        <label htmlFor="email">E-mail <span className="req" aria-hidden="true">*</span></label>
        <input {...field("email")} type="email" autoComplete="email" required />
        <span className="field__error" id="email-error" aria-live="polite">{err("email")}</span>
      </div>
      <div className="field">
        <label htmlFor="sluzba">Služba <span className="req" aria-hidden="true">*</span></label>
        <select {...field("sluzba")} required defaultValue={preset ?? ""}>
          <option value="">Vyberte službu…</option>
          <option value="kosmetika">Kosmetické ošetření</option>
          <option value="pristrojove">Přístrojové ošetření</option>
          <option value="obliceje">Obličejová masáž</option>
          <option value="masaz">Masáž</option>
          <option value="balicek">Balíček masáž + kosmetika</option>
          <option value="poukaz">Dárkový poukaz</option>
          <option value="jine">Jiné / poradím se</option>
        </select>
        <span className="field__error" id="sluzba-error" aria-live="polite">{err("sluzba")}</span>
      </div>
      <div className="field">
        <label htmlFor="termin">Preferovaný termín</label>
        <input name="termin" id="termin" type="date" min={today()} suppressHydrationWarning />
      </div>
      <div className="field field--full">
        <label htmlFor="poznamka">Poznámka</label>
        <textarea name="poznamka" id="poznamka" rows={4} placeholder="Např. preferovaný čas, alergie, dotaz…" />
      </div>
      <div className="hp-field" aria-hidden="true"><label htmlFor="_honey">Nevyplňujte</label><input id="_honey" name="_honey" type="text" tabIndex={-1} autoComplete="off" /></div>
      <p className="form__note">Pole označená * jsou povinná. Termín vám potvrdíme telefonicky nebo e-mailem. Údaje použijeme jen k vyřízení rezervace.</p>
      <div className="form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? "Odesílám…" : "Odeslat žádost o rezervaci"}</button>
      </div>
      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite"
        className={`form-status${state ? (state.ok ? " form-status--ok" : " form-status--err") : ""}`}>{state?.message}</div>
    </form>
  );
}
