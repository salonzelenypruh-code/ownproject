/** Instagram z nastavení: přijme „@jmeno“, „jmeno“ i celý odkaz. */
export function instagram(raw: string): { url: string; handle: string } | null {
  const v = (raw || "").trim();
  if (!v || v.includes("[")) return null;
  const m = v.match(/instagram\.com\/([A-Za-z0-9._]+)/i) || v.match(/^@?([A-Za-z0-9._]{1,30})$/);
  if (!m) return null;
  return { url: `https://www.instagram.com/${m[1]}/`, handle: `@${m[1]}` };
}
