"use client";
import { createContext, startTransition, useActionState, useContext, useEffect, useRef } from "react";

const PendingCtx = createContext(false);
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/admin/actions";

/** Formulář se zprávou o výsledku (server action s useActionState). */
export function ActionForm({ action, children, className, resetOnSuccess, encType }: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode; className?: string; resetOnSuccess?: boolean; encType?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok && resetOnSuccess) ref.current?.reset(); }, [state, resetOnSuccess]);
  return (
    <form ref={ref} className={className} encType={encType}
      onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => formAction(fd)); }}>
      <PendingCtx.Provider value={pending}>{children}</PendingCtx.Provider>
      {state && <p role="status" className={`a-msg ${state.ok ? "a-msg--ok" : "a-msg--err"}`}>{state.message}</p>}
    </form>
  );
}

export function SubmitButton({ children, className = "a-btn a-btn--primary", pendingText = "Ukládám…" }: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const formPending = useFormStatus().pending;
  const ctxPending = useContext(PendingCtx);
  const pending = formPending || ctxPending;
  return <button className={className} type="submit" disabled={pending}>{pending ? pendingText : children}</button>;
}

/** Tlačítko s potvrzením (mazání). */
export function ConfirmButton({ children, message, className = "a-btn a-btn--danger" }: { children: React.ReactNode; message: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending}
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}

/** Odešle formulář hned po změně (select stavu apod.). */
export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
