import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Hrubá ochrana /admin – skutečná kontrola je i v každé stránce a akci (requireAdmin).
export async function proxy(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const ok = token && process.env.AUTH_SECRET
    ? await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET)).then(() => true, () => false)
    : false;
  if (!ok) return NextResponse.redirect(new URL("/admin/prihlaseni", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/((?!prihlaseni).*)"] };
