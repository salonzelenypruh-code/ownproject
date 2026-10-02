import { count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [[{ n: newSubs }], [{ n: pendingReviews }]] = await Promise.all([
    db.select({ n: count() }).from(schema.submissions).where(eq(schema.submissions.status, "nova")),
    db.select({ n: count() }).from(schema.reviews).where(eq(schema.reviews.published, false)),
  ]);
  return (
    <div className="a-shell">
      <AdminNav badges={{ zadosti: newSubs, recenze: pendingReviews }} />
      <main className="a-main">{children}</main>
    </div>
  );
}
