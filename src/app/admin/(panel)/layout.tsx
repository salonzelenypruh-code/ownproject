import { and, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [[{ n: newSubs }], [{ n: newOrders }], [{ n: pendingReviews }]] = await Promise.all([
    db.select({ n: count() }).from(schema.submissions).where(and(eq(schema.submissions.status, "nova"), eq(schema.submissions.kind, "rezervace"))),
    db.select({ n: count() }).from(schema.submissions).where(and(eq(schema.submissions.status, "nova"), eq(schema.submissions.kind, "poukaz"))),
    db.select({ n: count() }).from(schema.reviews).where(eq(schema.reviews.published, false)),
  ]);
  return (
    <div className="a-shell">
      <AdminNav badges={{ zadosti: newSubs, poukazy: newOrders, recenze: pendingReviews }} />
      <main className="a-main">{children}</main>
    </div>
  );
}
