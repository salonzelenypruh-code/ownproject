"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { and, asc, eq, gt, lt, desc } from "drizzle-orm";
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

const attempts = new Map<string, number[]>();

export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = String(fd.get("email") || "").toLowerCase().trim();
  const password = String(fd.get("password") || "");
  const now = Date.now();
  const list = (attempts.get(email) || []).filter((t) => now - t < 15 * 60_000);
  if (list.length >= 8) return { ok: false, message: "Příliš mnoho pokusů. Zkuste to za 15 minut." };
  const [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    attempts.set(email, [...list, now]);
    return { ok: false, message: "Nesprávný e-mail nebo heslo." };
  }
  attempts.delete(email);
  await createSession(user.email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/prihlaseni");
}

export async function changePassword(_: ActionState, fd: FormData): Promise<ActionState> {
  const { email } = await requireAdmin();
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  if (next.length < 8) return { ok: false, message: "Nové heslo musí mít alespoň 8 znaků." };
  if (next !== fd.get("again")) return { ok: false, message: "Nová hesla se neshodují." };
  const [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { ok: false, message: "Současné heslo není správné." };
  await db.update(schema.adminUsers).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(schema.adminUsers.id, user.id));
  return { ok: true, message: "Heslo bylo změněno." };
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
