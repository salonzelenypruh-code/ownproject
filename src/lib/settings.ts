import "server-only";
import { cache } from "react";
import { db, schema } from "@/db";

/** Všechna upravitelná nastavení s výchozími hodnotami a popisky pro admin. */
export const SETTINGS = {
  phone: { label: "Telefon", group: "Kontakt", value: "+420 770 637 825" },
  whatsapp: { label: "WhatsApp (číslo, prázdné = skrýt)", group: "Kontakt", value: "+420 770 637 825" },
  email: { label: "E-mail", group: "Kontakt", value: "galinajork@gmail.com" },
  street: { label: "Ulice a číslo", group: "Adresa", value: "Zelený pruh [ČÍSLO]" },
  city: { label: "PSČ a město", group: "Adresa", value: "[PSČ] Praha 4" },
  mapQuery: { label: "Adresa pro mapu", group: "Adresa", value: "Zelený pruh, Praha 4" },
  hoursWeek: { label: "Po – Pá", group: "Otevírací doba", value: "[OD – DO]" },
  hoursSat: { label: "So", group: "Otevírací doba", value: "[OD – DO / dle dohody]" },
  hoursSun: { label: "Ne", group: "Otevírací doba", value: "[zavřeno]" },
  voucherIntro: { label: "Úvodní text", group: "Dárkový poukaz", value: "[Krátce: na jaké služby nebo částku lze poukaz koupit.]" },
  voucherValue: { label: "Hodnota", group: "Dárkový poukaz", value: "[dle výběru / pevné částky]" },
  voucherValidity: { label: "Platnost", group: "Dárkový poukaz", value: "[POČET] měsíců" },
  voucherHowTo: { label: "Jak koupit", group: "Dárkový poukaz", value: "[osobně v salonu / telefonicky]" },
  bookingUrl: { label: "Odkaz na online rezervace (Notino) – prázdné = formulář na webu", group: "Rezervace", value: "" },
  instagram: { label: "Instagram (celý odkaz, nepovinné)", group: "Sociální sítě a Google", value: "" },
  facebook: { label: "Facebook (celý odkaz, nepovinné)", group: "Sociální sítě a Google", value: "" },
  googleMaps: { label: "Odkaz na firmu v Google Mapách (nepovinné)", group: "Sociální sítě a Google", value: "" },
  googleVerification: { label: "Ověřovací kód Google Search Console (nepovinné)", group: "Sociální sítě a Google", value: "" },
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
