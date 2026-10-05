import "server-only";
import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import type { Voucher } from "@/db/schema";
import { formatPrice } from "./format";
import { SITE_URL } from "./seo";

// Bez snadno zaměnitelných znaků (0/O, 1/I/L)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function newCode() {
  const b = randomBytes(8);
  const s = Array.from(b, (x) => ALPHABET[x % ALPHABET.length]).join("");
  return `ZP-${s.slice(0, 4)}-${s.slice(4, 8)}`;
}
export const newToken = () => randomBytes(18).toString("base64url");

export const voucherUrl = (v: Pick<Voucher, "token">) => `${SITE_URL}/poukaz/${v.token}`;
export const qrPng = (v: Pick<Voucher, "token">) => QRCode.toBuffer(voucherUrl(v), { width: 480, margin: 2, errorCorrectionLevel: "M" });
export const qrDataUrl = (v: Pick<Voucher, "token">) => QRCode.toDataURL(voucherUrl(v), { width: 480, margin: 2, errorCorrectionLevel: "M" });

/** Dnešní datum v Praze jako „YYYY-MM-DD“. */
export const todayPrague = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Prague" }).format(new Date());
export const addMonths = (iso: string, m: number) => {
  const [y, mo, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1 + m, d));
  return dt.toISOString().slice(0, 10);
};
export const fmtCzDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d}. ${m}. ${y}`; };

export type VoucherState = "platny" | "pouzity" | "zruseny" | "propadly";
export function voucherState(v: Voucher): VoucherState {
  if (v.status === "pouzity") return "pouzity";
  if (v.status === "zruseny") return "zruseny";
  return v.validUntil < todayPrague() ? "propadly" : "platny";
}
export const STATE_LABEL: Record<VoucherState, string> = { platny: "Platný", pouzity: "Použitý", zruseny: "Zrušený", propadly: "Propadlý" };

export const voucherValue = (v: Voucher) => (v.amount != null ? `${formatPrice(v.amount)} Kč` : v.service);
