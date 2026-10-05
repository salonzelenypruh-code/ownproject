import "server-only";
import type { Voucher } from "@/db/schema";
import { esc } from "./mail";
import { fmtCzDate, voucherUrl, voucherValue } from "./vouchers";
import { SITE_URL } from "./seo";
import type { Settings } from "./settings";

/** HTML e-mail s poukazem. QR obrázek se načítá z webu (/poukaz/[token]/qr.png). */
export function voucherEmail(v: Voucher, s: Settings) {
  const url = voucherUrl(v);
  const value = voucherValue(v).replace(/ /g, " ");
  const html = `<!doctype html><html lang="cs"><body style="margin:0;background:#0b1f12;font-family:Arial,Helvetica,sans-serif;color:#ecf2ee">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1f12;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#06160c;border:1px solid #d4b26a;border-radius:14px">
<tr><td align="center" style="padding:28px 24px 8px">
  <img src="${SITE_URL}/img/logo-havran-180.png" width="90" height="90" alt="Kosmetika a masáže na Zeleném pruhu" style="display:block;border-radius:50%">
  <p style="margin:16px 0 4px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#d4b26a">Dárkový poukaz</p>
  <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#ecf2ee">Kosmetika a masáže na Zeleném pruhu</p>
</td></tr>
<tr><td align="center" style="padding:18px 24px">
  ${v.recipientName ? `<p style="margin:0 0 6px;font-size:15px;color:#c9d6cc">Pro: <strong style="color:#fff">${esc(v.recipientName)}</strong></p>` : ""}
  ${v.buyerName ? `<p style="margin:0 0 14px;font-size:15px;color:#c9d6cc">Od: <strong style="color:#fff">${esc(v.buyerName)}</strong></p>` : ""}
  <p style="margin:0;font-family:Georgia,serif;font-size:34px;color:#e2c47f">${esc(value)}</p>
  <p style="margin:8px 0 0;font-size:14px;color:#c9d6cc">Platnost do ${fmtCzDate(v.validUntil)}</p>
  ${v.message ? `<p style="margin:18px 0 0;font-size:15px;font-style:italic;color:#ecf2ee">„${esc(v.message)}“</p>` : ""}
</td></tr>
<tr><td align="center" style="padding:8px 24px 4px">
  <img src="${url}/qr.png" width="200" height="200" alt="QR kód poukazu" style="display:block;background:#fff;border-radius:10px;padding:8px">
  <p style="margin:12px 0 0;font-size:18px;letter-spacing:2px;font-family:'Courier New',monospace;color:#fff">${v.code}</p>
</td></tr>
<tr><td align="center" style="padding:18px 24px 26px">
  <a href="${url}" style="display:inline-block;background:#ddf3e2;color:#050d08;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:999px">Zobrazit poukaz</a>
  <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#c9d6cc">Poukaz ukažte při návštěvě salonu (v mobilu nebo vytištěný).<br>Termín si domluvte na ${esc(s.phone)}${s.whatsapp ? " nebo přes WhatsApp" : ""}.<br>${esc([s.place, s.street, s.city].filter((x) => x && !x.includes("[")).join(", "))}</p>
</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: `Dárkový poukaz – Kosmetika a masáže na Zeleném pruhu (${v.code})`, html };
}
