import "server-only";
import sharp from "sharp";
import { put, del } from "@vercel/blob";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

// Na Vercelu stačí připojené úložiště (BLOB_STORE_ID + automatický OIDC token), lokálně BLOB_READ_WRITE_TOKEN.
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
/** Úložiště salonu je soukromé (Private) – fotky se servírují přes /foto/[soubor] s dlouhou mezipamětí. */
export const BLOB_ACCESS = (process.env.BLOB_ACCESS === "public" ? "public" : "private") as "public" | "private";
export const BLOB_PREFIX = "fotky/";

async function save(name: string, data: Buffer): Promise<string> {
  if (useBlob()) {
    const blob = await put(BLOB_PREFIX + name, data, {
      access: BLOB_ACCESS, contentType: "image/webp", addRandomSuffix: false, cacheControlMaxAge: 31536000,
    });
    return BLOB_ACCESS === "public" ? blob.url : `/foto/${name}`;
  }
  // Lokální vývoj bez Vercel Blob: public/uploads
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), data);
  return `/uploads/${name}`;
}

/** Zmenší fotku (max 1600 px + 800 px verze), převede do WebP a uloží. */
export async function storeImage(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  const base = sharp(input, { failOn: "none" }).rotate(); // rotate = podle EXIF z mobilu
  const meta = await base.metadata();
  if (!meta.width || !meta.height) throw new Error("Soubor není obrázek.");

  const id = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`;
  const big = await base.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer({ resolveWithObject: true });
  const small = await base.clone().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer();

  const [url, urlSmall] = await Promise.all([save(`${id}.webp`, big.data), save(`${id}-800.webp`, small)]);
  return { url, urlSmall, width: big.info.width, height: big.info.height };
}

/** Smaže soubor fotky (jen nahrané fotky, ne výchozí z /img). */
export async function deleteImage(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.startsWith("/uploads/")) await unlink(path.join(process.cwd(), "public", url));
    else if (url.startsWith("/foto/") && useBlob()) await del(BLOB_PREFIX + url.slice("/foto/".length));
    else if (url.includes("blob.vercel-storage.com") && useBlob()) await del(url);
  } catch {
    // soubor už neexistuje – nevadí
  }
}
