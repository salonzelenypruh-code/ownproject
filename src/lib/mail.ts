import "server-only";
import { Resend } from "resend";

type Mail = { to: string; subject: string; html: string; replyTo?: string };

/** Pošle e-mail přes Resend. Bez RESEND_API_KEY jen vypíše do konzole (vývoj). */
export async function sendMail({ to, subject, html, replyTo }: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[e-mail – RESEND_API_KEY chybí, neodesláno]\nKomu: ${to}\nPředmět: ${subject}\n${html.replace(/<[^>]+>/g, " ")}\n`);
    return false;
  }
  const from = process.env.MAIL_FROM || "Kosmetika na Zeleném pruhu <onboarding@resend.dev>";
  const { error } = await new Resend(key).emails.send({ from, to, subject, html, replyTo });
  if (error) {
    console.error("Resend chyba:", error);
    return false;
  }
  return true;
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
