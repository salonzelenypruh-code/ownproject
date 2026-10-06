/* Změna / vytvoření admin účtu: npm run admin:heslo -- email@example.cz NoveHeslo123 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db, schema } from "../src/db";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error("Použití: npm run admin:heslo -- email@example.cz NoveHeslo (min. 10 znaků)");
  process.exit(1);
}
const passwordHash = await bcrypt.hash(password, 12);
await db.insert(schema.adminUsers).values({ email: email.toLowerCase(), passwordHash })
  .onConflictDoUpdate({ target: schema.adminUsers.email, set: { passwordHash, sessionVersion: sql`${schema.adminUsers.sessionVersion} + 1` } });
console.log(`✓ heslo nastaveno pro ${email}`);
process.exit(0);
