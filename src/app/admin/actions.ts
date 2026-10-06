"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { and, asc, count, eq, gt, gte, lt, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { CATEGORIES, PHOTO_PLACES, type Category, type PhotoPlace, type SubmissionStatus, type Variant } from "@/db/schema";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { SETTINGS } from "@/lib/settings";
import { deleteImage, storeImage } from "@/lib/storage";

export type ActionState = { ok: boolean; message: string } | null;

const refreshWeb = () => { revalidatePath("/", "layout"); };
const num = (v: FormDataEntryValue | null) => Number(v);

/* ---------------- Přihlášení ---------------- */

// Omezení hádání hesla – uložené v databázi, takže platí napříč servery Vercelu.
const WINDOW_MS = 15 * 60_000;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;
// Hash pro neexistující účet – porovnání trvá stejně dlouho, z doby odpovědi nejde poznat, jestli e-mail existuje.
const DUMMY_HASH = "$2b$12$WM3OWP13N0Mo73UnK8KoQOm4TxBE1tt/89Y.qaMnpoTxhWq3P4KE2";

async function clientIp() {
  const h = await (await import("next/headers")).headers();
  return h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  if (fd.get("website")) return { ok: false, message: "Nesprávný e-mail nebo heslo." }; // honeypot
  const email = String(fd.get("email") || "").toLowerCase().trim().slice(0, 200);
  const password = String(fd.get("password") || "").slice(0, 200);
  const ip = await clientIp();
  const since = new Date(Date.now() - WINDOW_MS);
  const t = schema.loginAttempts;
  const [[{ n: byEmail }], [{ n: byIp }]] = await Promise.all([
    db.select({ n: count() }).from(t).where(and(eq(t.email, email), eq(t.ok, false), gt(t.createdAt, since))),
    db.select({ n: count() }).from(t).where(and(eq(t.ip, ip), eq(t.ok, false), gt(t.createdAt, since))),
  ]);
  if (byEmail >= MAX_PER_EMAIL || byIp >= MAX_PER_IP) {
    return { ok: false, message: "Příliš mnoho neúspěšných pokusů. Zkuste to znovu za 15 minut." };
  }
  const [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  await db.insert(t).values({ ip, email, ok: Boolean(user && valid) });
  if (!user || !valid) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
    const left = MAX_PER_EMAIL - byEmail - 1;
    return { ok: false, message: left === 2 ? "Nesprávný e-mail nebo heslo. Zbývají 2 pokusy." : left === 1 ? "Nesprávný e-mail nebo heslo. Zbývá poslední pokus." : left <= 0 ? "Nesprávný e-mail nebo heslo. Přihlášení je na 15 minut zablokované." : "Nesprávný e-mail nebo heslo." };
  }
  await db.update(schema.adminUsers).set({ lastLoginAt: new Date() }).where(eq(schema.adminUsers.id, user.id));
  // úklid starých záznamů
  await db.delete(t).where(lt(t.createdAt, new Date(Date.now() - 30 * 86_400_000)));
  await createSession(user.email, user.sessionVersion);
  redirect("/admin");
}

/** Odhlásí všechna zařízení (např. ztracený telefon). */
export async function logoutEverywhere() {
  const { email } = await requireAdmin();
  const [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  if (user) await db.update(schema.adminUsers).set({ sessionVersion: user.sessionVersion + 1 }).where(eq(schema.adminUsers.id, user.id));
  await destroySession();
  redirect("/admin/prihlaseni");
}

export async function logout() {
  await destroySession();
  redirect("/admin/prihlaseni");
}

export async function changePassword(_: ActionState, fd: FormData): Promise<ActionState> {
  const { email } = await requireAdmin();
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  if (next.length < 10) return { ok: false, message: "Nové heslo musí mít alespoň 10 znaků." };
  if (/^[a-zà-ž]+$/i.test(next) || /^\d+$/.test(next)) return { ok: false, message: "Heslo musí obsahovat písmena i číslice nebo jiné znaky." };
  if (next !== fd.get("again")) return { ok: false, message: "Nová hesla se neshodují." };
  const [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { ok: false, message: "Současné heslo není správné." };
  const version = user.sessionVersion + 1;
  await db.update(schema.adminUsers).set({ passwordHash: await bcrypt.hash(next, 12), sessionVersion: version }).where(eq(schema.adminUsers.id, user.id));
  await createSession(user.email, version); // toto zařízení zůstane přihlášené, ostatní se odhlásí
  return { ok: true, message: "Heslo bylo změněno. Ostatní zařízení byla odhlášena." };
}

/* ---------------- Žádosti z formulářů ---------------- */

export async function setSubmissionStatus(fd: FormData) {
  await requireAdmin();
  const status = String(fd.get("status")) as SubmissionStatus;
  await db.update(schema.submissions).set({ status }).where(eq(schema.submissions.id, num(fd.get("id"))));
  revalidatePath("/admin", "layout");
}

export async function saveSubmissionNote(fd: FormData) {
  await requireAdmin();
  await db.update(schema.submissions).set({ adminNote: String(fd.get("adminNote") || "").slice(0, 2000) }).where(eq(schema.submissions.id, num(fd.get("id"))));
  revalidatePath("/admin", "layout");
}

export async function deleteSubmission(fd: FormData) {
  await requireAdmin();
  await db.delete(schema.submissions).where(eq(schema.submissions.id, num(fd.get("id"))));
  revalidatePath("/admin", "layout");
}

/* ---------------- Služby ---------------- */

const serviceSchema = z.object({
  category: z.enum(Object.keys(CATEGORIES) as [Category, ...Category[]]),
  name: z.string().trim().min(2, "Vyplňte název služby.").max(120),
  description: z.string().max(4000).default(""),
  published: z.boolean(),
});

function parseVariants(fd: FormData): Variant[] {
  const minutes = fd.getAll("minutes").map(String);
  const prices = fd.getAll("price").map(String);
  const toNum = (s: string) => { const n = Number(s.replace(/\s/g, "").replace(",", ".")); return s.trim() && Number.isFinite(n) && n >= 0 ? Math.round(n) : null; };
  return minutes.map((m, i) => ({ minutes: toNum(m), price: toNum(prices[i] ?? "") })).filter((v) => v.minutes != null || v.price != null);
}

export async function saveService(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse({
    category: fd.get("category"), name: fd.get("name"), description: String(fd.get("description") || ""), published: fd.get("published") === "on",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const data = { ...parsed.data, variants: parseVariants(fd), updatedAt: new Date() };
  const id = num(fd.get("id"));
  if (id) {
    await db.update(schema.services).set(data).where(eq(schema.services.id, id));
  } else {
    const [last] = await db.select({ o: schema.services.sortOrder }).from(schema.services).where(eq(schema.services.category, data.category)).orderBy(desc(schema.services.sortOrder)).limit(1);
    await db.insert(schema.services).values({ ...data, sortOrder: (last?.o ?? 0) + 1 });
  }
  refreshWeb();
  redirect(`/admin/sluzby?ulozeno=1#${data.category}`);
}

export async function toggleService(fd: FormData) {
  await requireAdmin();
  await db.update(schema.services).set({ published: fd.get("published") === "1" }).where(eq(schema.services.id, num(fd.get("id"))));
  refreshWeb();
  revalidatePath("/admin/sluzby");
}

export async function deleteService(fd: FormData) {
  await requireAdmin();
  await db.delete(schema.services).where(eq(schema.services.id, num(fd.get("id"))));
  refreshWeb();
  redirect("/admin/sluzby?smazano=1");
}

/** Prohodí pořadí se sousedem v rámci kategorie / místa. */
export async function moveService(fd: FormData) {
  await requireAdmin();
  const id = num(fd.get("id")); const dir = fd.get("dir") === "up" ? "up" : "down";
  const [cur] = await db.select().from(schema.services).where(eq(schema.services.id, id));
  if (!cur) return;
  const t = schema.services;
  const [other] = await db.select().from(t)
    .where(and(eq(t.category, cur.category), dir === "up" ? lt(t.sortOrder, cur.sortOrder) : gt(t.sortOrder, cur.sortOrder)))
    .orderBy(dir === "up" ? desc(t.sortOrder) : asc(t.sortOrder)).limit(1);
  if (!other) return;
  await db.update(t).set({ sortOrder: other.sortOrder }).where(eq(t.id, cur.id));
  await db.update(t).set({ sortOrder: cur.sortOrder }).where(eq(t.id, other.id));
  refreshWeb();
  revalidatePath("/admin/sluzby");
}

/* ---------------- Fotky ---------------- */

export async function uploadPhotos(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const place = String(fd.get("place")) as PhotoPlace;
  if (!(place in PHOTO_PLACES)) return { ok: false, message: "Neznámé místo." };
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { ok: false, message: "Vyberte prosím fotku." };
  const existing = await db.select().from(schema.photos).where(eq(schema.photos.place, place)).orderBy(desc(schema.photos.sortOrder));
  const max = PHOTO_PLACES[place].max;
  if (existing.length + files.length > max) return { ok: false, message: `Sem patří nejvýš ${max} ${max === 1 ? "fotka – nejdřív starou smažte nebo použijte Vyměnit" : "fotek"}.` };
  let order = existing[0]?.sortOrder ?? 0;
  for (const f of files) {
    if (f.size > 15 * 1024 * 1024) return { ok: false, message: `${f.name}: soubor je větší než 15 MB.` };
    try {
      const img = await storeImage(f);
      await db.insert(schema.photos).values({ place, ...img, alt: String(fd.get("alt") || "").trim() || "Fotografie salonu", sortOrder: ++order });
    } catch {
      return { ok: false, message: `${f.name}: tento soubor se nepodařilo zpracovat (podporované jsou JPG, PNG, WebP, HEIC).` };
    }
  }
  refreshWeb();
  return { ok: true, message: files.length === 1 ? "Fotka nahrána." : `Nahráno ${files.length} fotek.` };
}

export async function replacePhoto(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = num(fd.get("id"));
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, message: "Vyberte prosím fotku." };
  const [old] = await db.select().from(schema.photos).where(eq(schema.photos.id, id));
  if (!old) return { ok: false, message: "Fotka nenalezena." };
  try {
    const img = await storeImage(file);
    await db.update(schema.photos).set(img).where(eq(schema.photos.id, id));
  } catch {
    return { ok: false, message: "Soubor se nepodařilo zpracovat." };
  }
  await deleteImage(old.url); await deleteImage(old.urlSmall);
  refreshWeb();
  return { ok: true, message: "Fotka vyměněna." };
}

export async function savePhotoAlt(fd: FormData) {
  await requireAdmin();
  await db.update(schema.photos).set({ alt: String(fd.get("alt") || "").slice(0, 200) }).where(eq(schema.photos.id, num(fd.get("id"))));
  refreshWeb();
  revalidatePath("/admin/fotky");
}

export async function deletePhoto(fd: FormData) {
  await requireAdmin();
  const [p] = await db.select().from(schema.photos).where(eq(schema.photos.id, num(fd.get("id"))));
  if (!p) return;
  await db.delete(schema.photos).where(eq(schema.photos.id, p.id));
  await deleteImage(p.url); await deleteImage(p.urlSmall);
  refreshWeb();
  revalidatePath("/admin/fotky");
}

/** Nové pořadí fotek v jednom místě (po přetažení). ids = celé pořadí od první fotky. */
export async function reorderPhotos(place: PhotoPlace, ids: number[]): Promise<ActionState> {
  await requireAdmin();
  if (!(place in PHOTO_PLACES)) return { ok: false, message: "Neznámé místo." };
  const rows = await db.select({ id: schema.photos.id }).from(schema.photos).where(eq(schema.photos.place, place));
  const known = new Set(rows.map((r) => r.id));
  const clean = ids.filter((id) => known.has(id));
  if (clean.length !== known.size) return { ok: false, message: "Pořadí se nepodařilo uložit, obnovte stránku." };
  await db.batch(clean.map((id, i) => db.update(schema.photos).set({ sortOrder: i + 1 }).where(eq(schema.photos.id, id))) as [never, ...never[]]);
  refreshWeb();
  revalidatePath("/admin/fotky");
  return { ok: true, message: "Pořadí uloženo." };
}

export async function movePhoto(fd: FormData) {
  await requireAdmin();
  const id = num(fd.get("id")); const dir = fd.get("dir") === "up" ? "up" : "down";
  const t = schema.photos;
  const [cur] = await db.select().from(t).where(eq(t.id, id));
  if (!cur) return;
  const [other] = await db.select().from(t)
    .where(and(eq(t.place, cur.place), dir === "up" ? lt(t.sortOrder, cur.sortOrder) : gt(t.sortOrder, cur.sortOrder)))
    .orderBy(dir === "up" ? desc(t.sortOrder) : asc(t.sortOrder)).limit(1);
  if (!other) return;
  await db.update(t).set({ sortOrder: other.sortOrder }).where(eq(t.id, cur.id));
  await db.update(t).set({ sortOrder: cur.sortOrder }).where(eq(t.id, other.id));
  refreshWeb();
  revalidatePath("/admin/fotky");
}

/* ---------------- Recenze ---------------- */

export async function saveReview(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(fd.get("name") || "").trim();
  const text = String(fd.get("text") || "").trim();
  const rating = Math.min(5, Math.max(1, num(fd.get("rating")) || 5));
  if (name.length < 2 || text.length < 3) return { ok: false, message: "Vyplňte jméno i text recenze." };
  const id = num(fd.get("id"));
  const published = fd.get("published") === "on";
  if (id) await db.update(schema.reviews).set({ name, text, rating, published }).where(eq(schema.reviews.id, id));
  else await db.insert(schema.reviews).values({ name, text, rating, published, source: "admin" });
  refreshWeb();
  revalidatePath("/admin", "layout");
  return { ok: true, message: id ? "Recenze uložena." : "Recenze přidána." };
}

export async function setReviewPublished(fd: FormData) {
  await requireAdmin();
  await db.update(schema.reviews).set({ published: fd.get("published") === "1" }).where(eq(schema.reviews.id, num(fd.get("id"))));
  refreshWeb();
  revalidatePath("/admin", "layout");
}

export async function deleteReview(fd: FormData) {
  await requireAdmin();
  await db.delete(schema.reviews).where(eq(schema.reviews.id, num(fd.get("id"))));
  refreshWeb();
  revalidatePath("/admin", "layout");
}

/* ---------------- Nastavení ---------------- */

export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  if (fd.has("instagram")) {
    const { instagram } = await import("@/lib/social");
    const raw = String(fd.get("instagram") || "").trim();
    if (raw && !instagram(raw)) return { ok: false, message: "Instagram: vložte odkaz na profil (instagram.com/…) nebo @jméno." };
  }
  if (fd.has("bookingUrl")) {
    const url = String(fd.get("bookingUrl") || "").trim();
    if (url && !/^https:\/\/[^\s]+\.[^\s]+/.test(url)) return { ok: false, message: "Odkaz na rezervace musí začínat https:// (zkopírujte ho celý z Notina)." };
  }
  for (const key of Object.keys(SETTINGS)) {
    if (!fd.has(key)) continue;
    const value = String(fd.get(key) || "").trim().slice(0, 500);
    await db.insert(schema.settings).values({ key, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  }
  refreshWeb();
  return { ok: true, message: "Nastavení uloženo." };
}

/* ---------------- Dárkové poukazy ---------------- */

export async function createVoucher(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const { newCode, newToken, addMonths, todayPrague } = await import("@/lib/vouchers");
  const kind = fd.get("kind") === "service" ? "service" : "amount";
  const amountRaw = String(fd.get("amount") === "jina" ? fd.get("amountCustom") : fd.get("amount") || "").replace(/\s/g, "");
  const amount = kind === "amount" ? Number(amountRaw) : null;
  const service = kind === "service" ? String(fd.get("service") || "").trim().slice(0, 160) : "";
  if (kind === "amount" && (!Number.isFinite(amount) || !amount || amount < 100 || amount > 100000)) return { ok: false, message: "Zadejte hodnotu poukazu v Kč." };
  if (kind === "service" && service.length < 2) return { ok: false, message: "Napište, na jakou službu poukaz je." };
  const months = Math.min(36, Math.max(1, Number(fd.get("months")) || 6));
  const email = String(fd.get("email") || "").trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "E-mail nemá správný tvar." };

  let created: schema.Voucher | undefined;
  for (let i = 0; i < 5 && !created; i++) {
    try {
      [created] = await db.insert(schema.vouchers).values({
        code: newCode(), token: newToken(), amount, service,
        recipientName: String(fd.get("recipientName") || "").trim().slice(0, 120),
        buyerName: String(fd.get("buyerName") || "").trim().slice(0, 120),
        email, message: String(fd.get("message") || "").trim().slice(0, 400),
        note: String(fd.get("note") || "").trim().slice(0, 1000),
        validUntil: addMonths(todayPrague(), months),
      }).returning();
    } catch { /* kolize kódu – zkusit znovu */ }
  }
  if (!created) return { ok: false, message: "Poukaz se nepodařilo vytvořit, zkuste to znovu." };
  if (email && fd.get("send") === "on") await sendVoucher(created.id);
  const orderId = num(fd.get("orderId"));
  if (orderId) {
    await db.update(schema.submissions).set({ status: "vyrizena", adminNote: `Vystaven poukaz ${created.code}` })
      .where(and(eq(schema.submissions.id, orderId), eq(schema.submissions.kind, "poukaz")));
    revalidatePath("/admin", "layout");
  }
  revalidatePath("/admin/poukazy");
  redirect(`/admin/poukazy?novy=${created.id}`);
}

async function sendVoucher(id: number) {
  const [v] = await db.select().from(schema.vouchers).where(eq(schema.vouchers.id, id));
  if (!v?.email) return false;
  const { voucherEmail } = await import("@/lib/voucher-email");
  const { getSettings } = await import("@/lib/settings");
  const { sendMail } = await import("@/lib/mail");
  const { subject, html } = voucherEmail(v, await getSettings());
  const ok = await sendMail({ to: v.email, subject, html });
  if (ok) await db.update(schema.vouchers).set({ emailSentAt: new Date() }).where(eq(schema.vouchers.id, id));
  return ok;
}

export async function resendVoucher(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = num(fd.get("id"));
  const email = String(fd.get("email") || "").trim().toLowerCase();
  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "E-mail nemá správný tvar." };
    await db.update(schema.vouchers).set({ email }).where(eq(schema.vouchers.id, id));
  }
  const ok = await sendVoucher(id);
  revalidatePath("/admin/poukazy");
  return ok ? { ok: true, message: "Poukaz odeslán e-mailem." } : { ok: false, message: "E-mail se nepodařilo odeslat. Pošlete poukaz přes WhatsApp nebo zkopírujte odkaz." };
}

/** Uplatnění – projde jen u platného poukazu (atomicky, nejde uplatnit dvakrát). */
export async function redeemVoucher(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const { todayPrague } = await import("@/lib/vouchers");
  const id = num(fd.get("id"));
  const res = await db.update(schema.vouchers)
    .set({ status: "pouzity", usedAt: new Date() })
    .where(and(eq(schema.vouchers.id, id), eq(schema.vouchers.status, "aktivni"), gte(schema.vouchers.validUntil, todayPrague())))
    .returning({ id: schema.vouchers.id });
  revalidatePath("/admin/poukazy");
  revalidatePath("/poukaz/[token]", "page");
  if (!res.length) return { ok: false, message: "Poukaz nelze uplatnit – už byl použit, zrušen, nebo mu vypršela platnost." };
  return { ok: true, message: "Poukaz uplatněn ✓ Už nebude platit." };
}

export async function setVoucherStatus(fd: FormData) {
  await requireAdmin();
  const status = String(fd.get("status")) as schema.VoucherStatus;
  if (!(status in schema.VOUCHER_STATUS)) return;
  await db.update(schema.vouchers).set({ status, usedAt: status === "pouzity" ? new Date() : null }).where(eq(schema.vouchers.id, num(fd.get("id"))));
  revalidatePath("/admin/poukazy");
  revalidatePath("/poukaz/[token]", "page");
}

export async function findVoucher(fd: FormData) {
  await requireAdmin();
  const raw = String(fd.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const code = raw.startsWith("ZP") && raw.length === 10 ? `ZP-${raw.slice(2, 6)}-${raw.slice(6, 10)}` : String(fd.get("code") || "").trim().toUpperCase();
  const [v] = await db.select({ token: schema.vouchers.token }).from(schema.vouchers).where(eq(schema.vouchers.code, code));
  if (v) redirect(`/poukaz/${v.token}`);
  redirect(`/admin/poukazy?nenalezen=${encodeURIComponent(code)}`);
}
