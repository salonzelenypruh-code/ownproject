import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

// V produkci __Host- prefix: cookie jen přes HTTPS, jen pro tuto doménu, nejde podvrhnout ze subdomény.
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-admin_session" : "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dní

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("Chybí AUTH_SECRET (min. 32 znaků) v .env (viz .env.example).");
  return new TextEncoder().encode(s);
}

export async function createSession(email: string, version: number) {
  const token = await new SignJWT({ email, v: version })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Platný podpis + platná verze relace v databázi (změna hesla / odhlášení všude ji zneplatní). */
export async function getSession(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    const email = String(payload.email);
    const [user] = await db.select({ v: schema.adminUsers.sessionVersion }).from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
    if (!user || user.v !== Number(payload.v)) return null;
    return { email };
  } catch {
    return null;
  }
}

/** Volat na začátku každé admin stránky a server action. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/prihlaseni");
  return session;
}
