import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: process.env.TURSO_AUTH_TOKEN ? { url, authToken: process.env.TURSO_AUTH_TOKEN } : { url },
});
