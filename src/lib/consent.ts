"use client";
import { useEffect, useState } from "react";

/** Souhlas s cookies: "all" = i Google mapa, "necessary" = jen nezbytné. Uloženo v prohlížeči. */
export type Consent = "all" | "necessary";
const KEY = "cookie-consent-v1";
const EVENT = "cookie-consent-change";
export const OPEN_SETTINGS_EVENT = "cookie-settings-open";

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "all" || v === "necessary" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(v: Consent) {
  try { localStorage.setItem(KEY, v); } catch { /* soukromý režim – platí jen pro tuto návštěvu */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: v }));
}

/** undefined = ještě nenačteno (server / první render), null = bez volby. */
export function useConsent() {
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);
  useEffect(() => {
    setConsent(readConsent());
    const on = (e: Event) => setConsent((e as CustomEvent<Consent>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return consent;
}
