import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PHOTO_PLACES, type PhotoPlace } from "@/db/schema";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/ui";
import { deletePhoto, movePhoto, replacePhoto, savePhotoAlt, uploadPhotos } from "../../actions";

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

            <ul className="a-photos">
              {items.map((p, i) => (
                <li key={p.id} className="a-photo">
                  <img src={p.urlSmall ?? p.url} alt={p.alt} loading="lazy" />
                  <form action={savePhotoAlt} className="a-photo__alt">
                    <input type="hidden" name="id" value={p.id} />
                    <label className="a-field"><span>Popis fotky (pro nevidomé a Google)</span>
                      <input name="alt" defaultValue={p.alt} className="a-input" />
                    </label>
                    <SubmitButton className="a-btn a-btn--sm">Uložit popis</SubmitButton>
                  </form>
                  <div className="a-photo__tools">
                    {max > 1 && <>
                      <form action={movePhoto}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="up" /><button className="a-icon-btn" disabled={i === 0} aria-label="Posunout dopředu">←</button></form>
                      <form action={movePhoto}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="down" /><button className="a-icon-btn" disabled={i === items.length - 1} aria-label="Posunout dozadu">→</button></form>
                    </>}
                    <details className="a-replace">
                      <summary className="a-btn a-btn--sm">Vyměnit</summary>
                      <ActionForm action={replacePhoto} className="a-stack">
                        <input type="hidden" name="id" value={p.id} />
                        <input type="file" name="file" accept="image/*" required className="a-file" />
                        <SubmitButton className="a-btn a-btn--sm a-btn--primary" pendingText="Nahrávám…">Nahrát novou</SubmitButton>
                      </ActionForm>
                    </details>
                    <form action={deletePhoto}><input type="hidden" name="id" value={p.id} />
                      <ConfirmButton message="Opravdu smazat tuto fotku z webu?" className="a-btn a-btn--danger a-btn--sm">Smazat</ConfirmButton></form>
                  </div>
                </li>
              ))}
            </ul>

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
