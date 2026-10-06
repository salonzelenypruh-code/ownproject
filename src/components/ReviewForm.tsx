"use client";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { submitReview, type FormState } from "@/app/(web)/actions";

export function ReviewForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(submitReview, null);
  const formRef = useRef<HTMLFormElement>(null);
  const err = (k: string) => state?.errors?.[k];
  useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  if (!open) {
    return (
      <div className="btn-row btn-row--center">
        <button className="btn btn--ghost" type="button" onClick={() => setOpen(true)}>Napsat recenzi</button>
      </div>
    );
  }
  return (
    <form ref={formRef} className="panel form review-form" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} noValidate>
      <h3 className="field--full" style={{ margin: 0 }}>Vaše recenze</h3>
      <div className="field">
        <label htmlFor="r-jmeno">Jméno <span className="req" aria-hidden="true">*</span></label>
        <input id="r-jmeno" name="jmeno" type="text" autoComplete="given-name" required aria-invalid={err("jmeno") ? true : undefined} />
        <span className="field__error" aria-live="polite">{err("jmeno")}</span>
      </div>
      <div className="field">
        <label htmlFor="r-hodnoceni">Hodnocení</label>
        <select id="r-hodnoceni" name="hodnoceni" defaultValue="5">
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n} z 5)</option>)}
        </select>
      </div>
      <div className="field field--full">
        <label htmlFor="r-text">Text recenze <span className="req" aria-hidden="true">*</span></label>
        <textarea id="r-text" name="text" rows={4} required aria-invalid={err("text") ? true : undefined} />
        <span className="field__error" aria-live="polite">{err("text")}</span>
      </div>
      <div className="hp-field" aria-hidden="true"><input name="_honey" type="text" tabIndex={-1} autoComplete="off" aria-label="Nevyplňujte" /></div>
      <p className="form__note">Recenze se po schválení zobrazí na webu i s vaším jménem. <a href="/ochrana-osobnich-udaju">Ochrana osobních údajů</a></p>
      <div className="form__actions"><button className="btn btn--primary" type="submit" disabled={pending}>{pending ? "Odesílám…" : "Odeslat recenzi"}</button></div>
      <div role="status" aria-live="polite" className={`form-status${state ? (state.ok ? " form-status--ok" : " form-status--err") : ""}`}>{state?.message}</div>
    </form>
  );
}
