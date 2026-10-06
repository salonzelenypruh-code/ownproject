import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Hrubá ochrana /admin – skutečná kontrola je i v každé stránce a akci (requireAdmin).
export async function proxy(req: NextRequest) {
  const token = req.cookies.get(process.env.NODE_ENV === "production" ? "__Host-admin_session" : "admin_session")?.value;
  const ok = token && process.env.AUTH_SECRET
    ? await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET)).then(() => true, () => false)
    : false;
  const res = ok ? NextResponse.next() : NextResponse.redirect(new URL("/admin/prihlaseni", req.url));
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin", "/admin/((?!prihlaseni).*)"] };
