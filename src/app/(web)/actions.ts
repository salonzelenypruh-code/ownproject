"use server";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { esc, sendMail } from "@/lib/mail";
import { getSettings } from "@/lib/settings";
import { TIME_SLOTS } from "@/lib/time-slots";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string>; summary?: { service: string; date: string; time: string; name: string; email: string; phone: string } } | null;

const SERVICE_LABELS: Record<string, string> = {
  kosmetika: "Kosmetické ošetření", pristrojove: "Přístrojové ošetření", obliceje: "Obličejová masáž",
  masaz: "Masáž", balicek: "Balíček masáž + kosmetika", poukaz: "Dárkový poukaz", jine: "Jiné / poradím se",
};

const reservationSchema = z.object({
  jmeno: z.string().trim().min(2, "Vyplňte prosím jméno a příjmení.").max(120),
  telefon: z.string().trim().regex(/^[+0-9 ()-]{9,20}$/, "Vyplňte prosím telefon, ať vám můžeme termín potvrdit."),
  email: z.string().trim().email("Zadejte prosím platný e-mail (např. jana@email.cz).").max(160),
  sluzba: z.string().refine((v) => v in SERVICE_LABELS, "Vyberte prosím službu."),
  termin: z.string().max(20).optional().default(""),
  cas: z.string().max(20).optional().default(""),
  poznamka: z.string().max(2000).optional().default(""),
});

// Jednoduchá ochrana proti spamu: max. 5 odeslání z jedné IP za 10 minut (v rámci jedné instance serveru).
const hits = new Map<string, number[]>();
async function rateLimited() {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

const row = (k: string, v: string) => v ? `<tr><td style="padding:6px 12px 6px 0;color:#555">${k}</td><td style="padding:6px 0"><strong>${esc(v)}</strong></td></tr>` : "";

export async function submitReservation(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("_honey")) return { ok: true, message: "Děkujeme." };
  const parsed = reservationSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Zkontrolujte prosím zvýrazněná pole.", errors };
  }
  if (await rateLimited()) return { ok: false, message: "Odesíláte příliš často. Zkuste to prosím za chvíli, nebo zavolejte." };

  const d = parsed.data;
  const service = SERVICE_LABELS[d.sluzba];
  const [created] = await db.insert(schema.submissions).values({
    kind: d.sluzba === "poukaz" ? "poukaz" : "rezervace",
    name: d.jmeno, phone: d.telefon, email: d.email, service, preferredDate: d.termin, preferredTime: TIME_SLOTS[d.cas] ?? "", note: d.poznamka,
  }).returning();

  const s = await getSettings();
  const date = d.termin ? new Date(d.termin).toLocaleDateString("cs-CZ") : "";
  const sent = await sendMail({
    to: s.notifyEmail,
    replyTo: d.email,
    subject: `📅 REZERVACE – ${service}${date ? `, ${date}` : ""} – ${d.jmeno}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
      <p style="display:inline-block;margin:0 0 10px;padding:4px 12px;border-radius:999px;background:#1d5a35;color:#fff;font-weight:bold;letter-spacing:1px">📅 REZERVACE</p>
      <h2 style="margin:0 0 12px">Nová žádost o termín</h2>
      <table>${row("Jméno", d.jmeno)}${row("Telefon", d.telefon)}${row("E-mail", d.email)}${row("Služba", service)}${row("Preferovaný termín", date)}${row("Přibližný čas", TIME_SLOTS[d.cas] ?? "")}</table>
      ${d.poznamka ? `<p style="margin-top:12px"><strong>Poznámka:</strong><br>${esc(d.poznamka).replace(/\n/g, "<br>")}</p>` : ""}
      <p style="margin-top:16px;color:#555">Na tento e-mail můžete rovnou odpovědět – odpověď půjde zákazníkovi. Žádost najdete i v administraci v sekci Žádosti.</p></div>`,
  });
  if (sent) await db.update(schema.submissions).set({ emailSent: true }).where(eq(schema.submissions.id, created.id));
  revalidatePath("/admin", "layout");

  return { ok: true, message: "Děkujeme, žádost o rezervaci jsme přijali.", summary: { service, date, time: TIME_SLOTS[d.cas] ?? "", name: d.jmeno, email: d.email, phone: d.telefon } };
}

const reviewSchema = z.object({
  jmeno: z.string().trim().min(2, "Vyplňte prosím jméno.").max(80),
  hodnoceni: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10, "Napište prosím alespoň pár slov.").max(1500),
});

export async function submitReview(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("_honey")) return { ok: true, message: "Děkujeme." };
  const parsed = reviewSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Zkontrolujte prosím zvýrazněná pole.", errors };
  }
  if (await rateLimited()) return { ok: false, message: "Odesíláte příliš často. Zkuste to prosím za chvíli." };
  const d = parsed.data;
  await db.insert(schema.reviews).values({ name: d.jmeno, rating: d.hodnoceni, text: d.text, source: "web", published: false });
  const s = await getSettings();
  await sendMail({
    to: s.notifyEmail,
    subject: `⭐ RECENZE ke schválení – ${d.jmeno} (${d.hodnoceni}/5)`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px"><p><strong>${esc(d.jmeno)}</strong> – ${"★".repeat(d.hodnoceni)}</p><p>${esc(d.text).replace(/\n/g, "<br>")}</p><p style="color:#555">Recenze čeká na schválení v administraci (Recenze).</p></div>`,
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Děkujeme za recenzi! Na webu se objeví po schválení." };
}

const DELIVERY: Record<string, string> = {
  kupujici: "E-mailem mně (kupujícímu)",
  obdarovany: "E-mailem přímo obdarované/mu",
  osobne: "Vyzvednu si osobně v salonu",
};

const voucherOrderSchema = z.object({
  jmeno: z.string().trim().min(2, "Vyplňte prosím své jméno a příjmení.").max(120),
  telefon: z.string().trim().regex(/^[+0-9 ()-]{9,20}$/, "Vyplňte prosím telefon."),
  email: z.string().trim().email("Zadejte prosím platný e-mail.").max(160),
  hodnota: z.string(),
  hodnotaJina: z.string().optional().default(""),
  proKoho: z.string().trim().max(120).optional().default(""),
  venovani: z.string().trim().max(400).optional().default(""),
  doruceni: z.string().refine((v) => v in DELIVERY, "Vyberte, kam poukaz poslat."),
  emailObdarovane: z.string().trim().max(160).optional().default(""),
  poznamka: z.string().max(1000).optional().default(""),
});

export async function submitVoucherOrder(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("_honey")) return { ok: true, message: "Děkujeme." };
  const parsed = voucherOrderSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Zkontrolujte prosím zvýrazněná pole.", errors };
  }
  const d = parsed.data;
  const amount = Number((d.hodnota === "jina" ? d.hodnotaJina : d.hodnota).replace(/\s/g, ""));
  if (!Number.isFinite(amount) || amount < 300 || amount > 50000) return { ok: false, message: "Zkontrolujte prosím zvýrazněná pole.", errors: { hodnotaJina: "Zadejte hodnotu poukazu v Kč (300–50 000)." } };
  if (d.doruceni === "obdarovany" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.emailObdarovane)) {
    return { ok: false, message: "Zkontrolujte prosím zvýrazněná pole.", errors: { emailObdarovane: "Zadejte e-mail obdarované/ho." } };
  }
  if (await rateLimited()) return { ok: false, message: "Odesíláte příliš často. Zkuste to prosím za chvíli, nebo zavolejte." };

  const value = `${amount.toLocaleString("cs-CZ")} Kč`;
  const [created] = await db.insert(schema.submissions).values({
    kind: "poukaz", name: d.jmeno, phone: d.telefon, email: d.email, service: `Dárkový poukaz ${value}`, note: d.poznamka,
    meta: { amount, recipientName: d.proKoho, message: d.venovani, deliverTo: d.doruceni as "kupujici", recipientEmail: d.emailObdarovane },
  }).returning();

  const s = await getSettings();
  const sent = await sendMail({
    to: s.notifyEmail,
    replyTo: d.email,
    subject: `🎁 DÁRKOVÝ POUKAZ – objednávka ${value} – ${d.jmeno}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
      <p style="display:inline-block;margin:0 0 10px;padding:4px 12px;border-radius:999px;background:#b8860b;color:#fff;font-weight:bold;letter-spacing:1px">🎁 DÁRKOVÝ POUKAZ</p>
      <h2 style="margin:0 0 12px">Objednávka poukazu ${esc(value)}</h2>
      <table>${row("Hodnota", value)}${row("Objednává", d.jmeno)}${row("Telefon", d.telefon)}${row("E-mail", d.email)}${row("Pro koho", d.proKoho)}${row("Věnování", d.venovani)}${row("Doručení", DELIVERY[d.doruceni])}${row("E-mail obdarované/ho", d.doruceni === "obdarovany" ? d.emailObdarovane : "")}</table>
      ${d.poznamka ? `<p style="margin-top:12px"><strong>Poznámka:</strong><br>${esc(d.poznamka).replace(/\n/g, "<br>")}</p>` : ""}
      <p style="margin-top:16px;color:#555">Poukaz vystavíte v administraci: Poukazy → Objednávky z webu → Vystavit poukaz (údaje se předvyplní).</p></div>`,
  });
  if (sent) await db.update(schema.submissions).set({ emailSent: true }).where(eq(schema.submissions.id, created.id));
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Děkujeme za objednávku.", summary: { service: `Dárkový poukaz ${value}`, date: d.proKoho, time: DELIVERY[d.doruceni], name: d.jmeno, email: d.email, phone: d.telefon } };
}
