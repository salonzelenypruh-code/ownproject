import "server-only";
import { Resend } from "resend";

/** Příloha: content musí být base64 řetězec (Buffer Resend v JSON tiše zahodí). contentId = vložený obrázek (cid:). */
export type MailAttachment = { filename: string; content: string; contentType?: string; contentId?: string };
type Mail = { to: string; subject: string; html: string; replyTo?: string; attachments?: MailAttachment[] };

const FALLBACK_FROM = "Salon Zelený pruh <onboarding@resend.dev>";

/**
 * Pošle e-mail přes Resend. Bez RESEND_API_KEY jen vypíše do konzole (vývoj).
 * Odpovědi zákaznic jdou na MAIL_REPLY_TO (galinajork@gmail.com), pokud volající neurčí jinak.
 * Dokud není doména v Resend ověřená, odešle se z náhradní adresy Resend.
 */
export async function sendMail({ to, subject, html, replyTo, attachments }: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const reply = replyTo || process.env.MAIL_REPLY_TO || undefined;
  if (!key) {
    console.log(`\n[e-mail – RESEND_API_KEY chybí, neodesláno]\nKomu: ${to}\nOdpověď na: ${reply}\nPředmět: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 600)}\n`);
    return false;
  }
  const resend = new Resend(key);
  const from = process.env.MAIL_FROM || FALLBACK_FROM;
  let { error } = await resend.emails.send({ from, to, subject, html, replyTo: reply, attachments });
  if (error && from !== FALLBACK_FROM && /domain/i.test(error.message)) {
    console.warn("Resend: doména odesílatele není ověřená, posílám z náhradní adresy.", error.message);
    ({ error } = await resend.emails.send({ from: FALLBACK_FROM, to, subject, html, replyTo: reply, attachments }));
  }
  if (error) {
    console.error("Resend chyba:", error);
    return false;
  }
  return true;
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
