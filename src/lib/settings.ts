import "server-only";
import { cache } from "react";
import { db, schema } from "@/db";

/** Všechna upravitelná nastavení s výchozími hodnotami a popisky pro admin. */
export const SETTINGS = {
  phone: { label: "Telefon", group: "Kontakt", value: "+420 770 637 825" },
  whatsapp: { label: "WhatsApp (číslo, prázdné = skrýt)", group: "Kontakt", value: "+420 770 637 825" },
  email: { label: "E-mail", group: "Kontakt", value: "galinajork@gmail.com" },
  place: { label: "Budova / upřesnění (nepovinné)", group: "Adresa", value: "Poliklinika Zelený pruh, přízemí u výtahu" },
  street: { label: "Ulice a číslo", group: "Adresa", value: "Roškotova 1717/2" },
  city: { label: "PSČ a město", group: "Adresa", value: "140 00 Praha 4 – Braník" },
  mapQuery: { label: "Adresa pro mapu", group: "Adresa", value: "Roškotova 1717/2, Praha 4" },
  hoursWeek: { label: "Po – Pá", group: "Otevírací doba", value: "8:00 – 20:00" },
  hoursSat: { label: "So", group: "Otevírací doba", value: "8:00 – 20:00" },
  hoursSun: { label: "Ne", group: "Otevírací doba", value: "zavřeno" },
  voucherIntro: { label: "Úvodní text", group: "Dárkový poukaz", value: "Darujte kosmetiku nebo masáž. Poukaz vystavím na zvolenou částku a pošlu e-mailem s QR kódem – můžete ho vytisknout, nebo poslat obdarované rovnou do mobilu." },
  voucherValue: { label: "Hodnota", group: "Dárkový poukaz", value: "1 100 Kč, 1 750 Kč nebo 2 300 Kč" },
  voucherValidity: { label: "Platnost", group: "Dárkový poukaz", value: "6 měsíců" },
  voucherHowTo: { label: "Jak koupit", group: "Dárkový poukaz", value: "přes formulář na webu nebo telefonicky" },
  bookingUrl: { label: "Odkaz na online rezervace (Notino) – prázdné = formulář na webu", group: "Rezervace", value: "" },
  operatorName: { label: "Jméno nebo název firmy", group: "Provozovatel (patička webu)", value: "[JMÉNO / FIRMA]" },
  operatorId: { label: "IČO", group: "Provozovatel (patička webu)", value: "[IČO]" },
  operatorAddress: { label: "Sídlo / místo podnikání", group: "Provozovatel (patička webu)", value: "[SÍDLO]" },
  operatorRegistry: { label: "Zápis v obchodním rejstříku (nepovinné)", group: "Provozovatel (patička webu)", value: "" },
  instagram: { label: "Instagram – odkaz na profil nebo @jméno", group: "Sociální sítě", value: "" },
  facebook: { label: "Facebook – odkaz na stránku (nepovinné)", group: "Sociální sítě", value: "" },
  googleMaps: { label: "Odkaz na firmu v Google Mapách (nepovinné)", group: "Google", value: "" },
  gaId: { label: "Google Analytics 4 – ID měření (G-XXXXXXX, nepovinné)", group: "Google", value: "" },
  fbPixelId: { label: "Facebook Pixel ID (jen číslice, nepovinné)", group: "Google", value: "" },
  googleVerification: { label: "Ověřovací kód Google Search Console (nepovinné)", group: "Google", value: "" },
  notifyEmail: { label: "Kam posílat žádosti z formulářů", group: "Formuláře", value: "galinajork@gmail.com" },
} as const;

export type SettingKey = keyof typeof SETTINGS;
export type Settings = Record<SettingKey, string>;

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.select().from(schema.settings);
  const out = Object.fromEntries(Object.entries(SETTINGS).map(([k, v]) => [k, v.value])) as Settings;
  for (const r of rows) if (r.key in SETTINGS) out[r.key as SettingKey] = r.value;
  return out;
});

/** „+420 770 637 825“ -> „+420770637825“ (pro tel: odkazy). */
export const telHref = (phone: string) => "tel:" + phone.replace(/[^+\d]/g, "");
export const waHref = (phone: string) => "https://wa.me/" + phone.replace(/\D/g, "");
