import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { qrPng } from "@/lib/vouchers";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [v] = await db.select({ token: schema.vouchers.token }).from(schema.vouchers).where(eq(schema.vouchers.token, token));
  if (!v) return new Response("Nenalezeno", { status: 404 });
  return new Response(new Uint8Array(await qrPng(v)), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" } });
}
