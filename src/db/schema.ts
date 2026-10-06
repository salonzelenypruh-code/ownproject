import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const now = sql`(unixepoch() * 1000)`;

/** Kategorie ceníku – pořadí určuje i pořadí na webu. */
export const CATEGORIES = {
  osetreni: { label: "Kosmetické ošetření", page: "kosmetika" },
  pristrojove: { label: "Přístrojové ošetření", page: "kosmetika" },
  obliceje: { label: "Obličejové masáže", page: "kosmetika" },
  masaze: { label: "Masáže", page: "masaze" },
  balicky: { label: "Balíčky masáže + kosmetika", page: "masaze" },
} as const;
export type Category = keyof typeof CATEGORIES;

/** Varianta délky a ceny – např. masáž 60 min / 1 100 Kč a 90 min / 1 500 Kč. */
export type Variant = { minutes: number | null; price: number | null };

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").$type<Category>().notNull(),
  name: text("name").notNull(),
  /** Popis: odstavce oddělené prázdným řádkem, řádky začínající „- “ jsou odrážky. */
  description: text("description").notNull().default(""),
  variants: text("variants", { mode: "json" }).$type<Variant[]>().notNull().default(sql`'[]'`),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(now),
});

/** Místa, kde se fotky zobrazují. */
export const PHOTO_PLACES = {
  uvod: { label: "Úvod – tři fotky salonu", max: 3 },
  portret: { label: "Úvod – kulatá fotka Galyny", max: 1 },
  galerie: { label: "Galerie", max: 60 },
} as const;
export type PhotoPlace = keyof typeof PHOTO_PLACES;

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  place: text("place").$type<PhotoPlace>().notNull(),
  url: text("url").notNull(),
  /** Menší verze (800 px) pro mobil. */
  urlSmall: text("url_small"),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  alt: text("alt").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull().default(5),
  /** Recenze z webu čekají na schválení (published = false). */
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  source: text("source").$type<"web" | "admin">().notNull().default("admin"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
});

export type VoucherOrderMeta = { amount?: number; recipientName?: string; message?: string; deliverTo?: "kupujici" | "obdarovany" | "osobne"; recipientEmail?: string };

export const SUBMISSION_STATUS = {
  nova: "Nová",
  vyrizena: "Vyřízená",
  archiv: "Archiv",
} as const;
export type SubmissionStatus = keyof typeof SUBMISSION_STATUS;

export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").$type<"rezervace" | "poukaz">().notNull().default("rezervace"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  service: text("service").notNull().default(""),
  preferredDate: text("preferred_date").notNull().default(""),
  preferredTime: text("preferred_time").notNull().default(""),
  note: text("note").notNull().default(""),
  status: text("status").$type<SubmissionStatus>().notNull().default("nova"),
  adminNote: text("admin_note").notNull().default(""),
  emailSent: integer("email_sent", { mode: "boolean" }).notNull().default(false),
  /** Údaje objednávky poukazu: hodnota, pro koho, věnování, kam poslat. */
  meta: text("meta", { mode: "json" }).$type<VoucherOrderMeta>().notNull().default(sql`'{}'`),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
});

/** Jednoduché klíč–hodnota nastavení (kontakty, otevírací doba, texty poukazu). */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  /** Zvýšení odhlásí všechna zařízení (změna hesla, „odhlásit všude“). */
  sessionVersion: integer("session_version").notNull().default(1),
  lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
});

export type Service = typeof services.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Submission = typeof submissions.$inferSelect;

/* ---------------- Dárkové poukazy ---------------- */
export const VOUCHER_STATUS = { aktivni: "Platný", pouzity: "Použitý", zruseny: "Zrušený" } as const;
export type VoucherStatus = keyof typeof VOUCHER_STATUS;

export const vouchers = sqliteTable("vouchers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Krátký kód pro lidi (např. ZP-7K4M-Q2XD) – na poukazu a pro ruční vyhledání. */
  code: text("code").notNull().unique(),
  /** Dlouhý náhodný klíč v odkazu a QR kódu – podle kódu se poukaz uhodnout nedá. */
  token: text("token").notNull().unique(),
  /** Hodnota v Kč, nebo null když je poukaz na konkrétní službu. */
  amount: integer("amount"),
  service: text("service").notNull().default(""),
  recipientName: text("recipient_name").notNull().default(""),
  buyerName: text("buyer_name").notNull().default(""),
  email: text("email").notNull().default(""),
  message: text("message").notNull().default(""),
  /** Poslední den platnosti „YYYY-MM-DD“ (platí včetně). */
  validUntil: text("valid_until").notNull(),
  status: text("status").$type<VoucherStatus>().notNull().default("aktivni"),
  usedAt: integer("used_at", { mode: "timestamp_ms" }),
  note: text("note").notNull().default(""),
  emailSentAt: integer("email_sent_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
});
export type Voucher = typeof vouchers.$inferSelect;

/** Pokusy o přihlášení – omezení hádání hesla (podle IP i e-mailu). */
export const loginAttempts = sqliteTable("login_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ip: text("ip").notNull(),
  email: text("email").notNull(),
  ok: integer("ok", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
});
