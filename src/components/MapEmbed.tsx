"use client";
import { saveConsent, useConsent } from "@/lib/consent";

export function MapEmbed({ query, directionsUrl }: { query: string; directionsUrl: string }) {
  const consent = useConsent();
  if (consent === "all") {
    return <iframe title={`Mapa – ${query}`} src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />;
  }
  return (
    <div className="map-placeholder">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      <p className="map-placeholder__addr">{query}</p>
      <p className="map-placeholder__note">Mapa Google ukládá cookies, proto se načte až po vašem souhlasu.</p>
      <div className="btn-row btn-row--center">
        <button type="button" className="btn btn--primary" onClick={() => saveConsent("all")}>Zobrazit mapu</button>
        <a className="btn btn--ghost" href={directionsUrl} target="_blank" rel="noopener">Otevřít v Google Mapách</a>
      </div>
    </div>
  );
}
