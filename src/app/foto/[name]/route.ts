import { get } from "@vercel/blob";
import { BLOB_ACCESS, BLOB_PREFIX } from "@/lib/storage";

// Fotky ze soukromého Vercel Blob úložiště. Názvy souborů jsou unikátní a nemění se,
// takže je prohlížeč i CDN Vercelu můžou držet v mezipaměti rok – server se volá jen poprvé.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-z0-9-]+\.webp$/.test(name) || !(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)) return new Response("Nenalezeno", { status: 404 });
  const res = await get(BLOB_PREFIX + name, { access: BLOB_ACCESS }).catch(() => null);
  if (!res || res.statusCode !== 200) return new Response("Nenalezeno", { status: 404 });
  return new Response(res.stream, {
    headers: {
      "Content-Type": res.blob.contentType || "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
