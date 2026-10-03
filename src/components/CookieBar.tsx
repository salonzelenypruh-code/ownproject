"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OPEN_SETTINGS_EVENT, saveConsent, useConsent } from "@/lib/consent";

export function CookieBar() {
  const consent = useConsent();
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const open = () => setForced(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  // Lišta je v HTML hned (rychlé vykreslení); kdo už zvolil, tomu ji skryje skript v <head> (html[data-consent]).
  if (consent && !forced) return null;
  const choose = (v: "all" | "necessary") => { saveConsent(v); setForced(false); };

  return (
    <div className={`cookie-bar${forced ? " cookie-bar--forced" : ""}`} role="dialog" aria-live="polite" aria-labelledby="cookie-h" aria-describedby="cookie-t">
      <div className="cookie-bar__inner">
        <div>
          <p id="cookie-h" className="cookie-bar__title">Cookies</p>
          <p id="cookie-t" className="cookie-bar__text">
            Používáme nezbytné cookies a se souhlasem i cookies pro měření návštěvnosti, reklamu a mapu Google.{" "}
            <Link href="/cookies">Více informací</Link>
          </p>
        </div>
        <div className="cookie-bar__actions">
          <button type="button" className="btn btn--ghost" onClick={() => choose("necessary")}>Jen nezbytné</button>
          <button type="button" className="btn btn--primary" onClick={() => choose("all")}>Přijmout vše</button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsLink() {
  return (
    <button type="button" className="link-btn" onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}>
      Nastavení cookies
    </button>
  );
}
