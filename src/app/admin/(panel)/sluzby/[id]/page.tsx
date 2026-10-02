import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { CATEGORIES, type Category, type Service } from "@/db/schema";
import { ConfirmButton } from "@/components/admin/ui";
import { deleteService } from "../../../actions";
import { ServiceForm } from "./ServiceForm";

export const metadata = { title: "Úprava služby" };

export default async function EditService({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kategorie?: string }> }) {
  const [{ id }, { kategorie }] = await Promise.all([params, searchParams]);
  let service: Service | null = null;
  if (id !== "nova") {
    [service] = await db.select().from(schema.services).where(eq(schema.services.id, Number(id)));
    if (!service) notFound();
  }
  const defaultCat = (kategorie && kategorie in CATEGORIES ? kategorie : "osetreni") as Category;
  return (
    <>
      <Link href="/admin/sluzby" className="a-link">← Zpět na služby</Link>
      <h1 className="a-h1">{service ? service.name : "Nová služba"}</h1>
      <ServiceForm service={service} defaultCategory={defaultCat} />
      {service && (
        <form action={deleteService} className="a-card a-danger-zone">
          <input type="hidden" name="id" value={service.id} />
          <p className="a-muted">Pokud službu jen dočasně nenabízíte, stačí ji skrýt (zrušit „Zobrazit na webu“).</p>
          <ConfirmButton message={`Opravdu smazat službu „${service.name}“?`}>Smazat službu</ConfirmButton>
        </form>
      )}
    </>
  );
}
