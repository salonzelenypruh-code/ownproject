/* Změna / vytvoření admin účtu: npm run admin:heslo -- email@example.cz NoveHeslo123 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db, schema } from "../src/db";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error("Použití: npm run admin:heslo -- email@example.cz NoveHeslo (min. 8 znaků)");
  process.exit(1);
}
const passwordHash = await bcrypt.hash(password, 12);
await db.insert(schema.adminUsers).values({ email: email.toLowerCase(), passwordHash })
  .onConflictDoUpdate({ target: schema.adminUsers.email, set: { passwordHash } });
console.log(`✓ heslo nastaveno pro ${email}`);
process.exit(0);
