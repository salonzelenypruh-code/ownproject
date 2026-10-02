import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 dní

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("Chybí AUTH_SECRET v .env (viz .env.example).");
  return new TextEncoder().encode(s);
}

export async function createSession(email: string) {
  const token = await new SignJWT({ email })
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

export async function getSession(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { email: String(payload.email) };
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
