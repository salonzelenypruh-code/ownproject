import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PHOTO_PLACES, type PhotoPlace } from "@/db/schema";
import { ActionForm, SubmitButton } from "@/components/admin/ui";
import { PhotoList } from "./PhotoList";
import { uploadPhotos } from "../../actions";

export const metadata = { title: "Fotky" };

const HINTS: Record<PhotoPlace, string> = {
  uvod: "Tři fotky vedle sebe pod nadpisem na úvodní stránce (na mobilu pod sebou). Ořezávají se na čtverec.",
  portret: "Kulatá fotka u úvodního textu. Ideální je portrét, obličej uprostřed.",
  galerie: "Fotky na stránce Galerie. Kliknutím se zvětší.",
};

export default async function Fotky() {
  const all = await db.select().from(schema.photos).orderBy(asc(schema.photos.sortOrder), asc(schema.photos.id));
  return (
    <>
      <h1 className="a-h1">Fotky na webu</h1>
      <p className="a-muted a-lead">Fotky z mobilu stačí nahrát tak, jak jsou – samy se zmenší a otočí správně.</p>
      {(Object.keys(PHOTO_PLACES) as PhotoPlace[]).map((place) => {
        const items = all.filter((p) => p.place === place);
        const { label, max } = PHOTO_PLACES[place];
        const full = items.length >= max;
        return (
          <section key={place} className="a-card" id={place}>
            <div className="a-card__head"><h2>{label}</h2><span className="a-muted a-small">{items.length} / {max}</span></div>
            <p className="a-hint">{HINTS[place]}</p>

            <PhotoList place={place} photos={items} sortable={max > 1} />

            {!full && (
              <ActionForm action={uploadPhotos} className="a-upload" resetOnSuccess>
                <input type="hidden" name="place" value={place} />
                <label className="a-field"><span>{max === 1 ? "Nahrát fotku" : "Přidat fotky"}</span>
                  <input type="file" name="files" accept="image/*" multiple={max > 1} required className="a-file" />
                </label>
                <label className="a-field"><span>Popis (nepovinné)</span><input name="alt" className="a-input" placeholder="Např. Ošetřovna s lůžkem" /></label>
                <SubmitButton className="a-btn a-btn--primary" pendingText="Nahrávám…">Nahrát</SubmitButton>
              </ActionForm>
            )}
          </section>
        );
      })}
    </>
  );
}
