"use client";
import { startTransition, useActionState, useState } from "react";
import { CATEGORIES, type Category, type Service } from "@/db/schema";
import { saveService } from "../../../actions";

type Row = { key: number; minutes: string; price: string };

export function ServiceForm({ service, defaultCategory }: { service: Service | null; defaultCategory: Category }) {
  const [state, action, pending] = useActionState(saveService, null);
  const [rows, setRows] = useState<Row[]>(() => {
    const vs = service?.variants?.length ? service.variants : [{ minutes: null, price: null }];
    return vs.map((v, i) => ({ key: i, minutes: v.minutes?.toString() ?? "", price: v.price?.toString() ?? "" }));
  });
  const update = (key: number, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  return (
    <form className="a-card a-stack" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }}>
      {service && <input type="hidden" name="id" value={service.id} />}
      <label className="a-field"><span>Kategorie</span>
        <select name="category" defaultValue={service?.category ?? defaultCategory} className="a-input">
          {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
        </select>
      </label>
      <label className="a-field"><span>Název služby</span>
        <input name="name" defaultValue={service?.name} required className="a-input" placeholder="Např. Klasická masáž" />
      </label>

      <fieldset className="a-fieldset">
        <legend>Délka a cena</legend>
        <p className="a-hint">Když má služba víc délek (např. 60 i 90 min), přidejte další řádek. Cenu můžete nechat prázdnou.</p>
        {rows.map((r, i) => (
          <div key={r.key} className="a-variant">
            <label className="a-field"><span>Délka (min)</span>
              <input name="minutes" inputMode="numeric" value={r.minutes} onChange={(e) => update(r.key, { minutes: e.target.value })} className="a-input" placeholder="60" />
            </label>
            <label className="a-field"><span>Cena (Kč)</span>
              <input name="price" inputMode="numeric" value={r.price} onChange={(e) => update(r.key, { price: e.target.value })} className="a-input" placeholder="1200" />
            </label>
            {rows.length > 1 && <button type="button" className="a-icon-btn" aria-label={`Odebrat řádek ${i + 1}`} onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}>✕</button>}
          </div>
        ))}
        <button type="button" className="a-btn a-btn--sm" onClick={() => setRows((rs) => [...rs, { key: Date.now(), minutes: "", price: "" }])}>+ Další délka</button>
      </fieldset>

      <label className="a-field"><span>Popis</span>
        <textarea name="description" defaultValue={service?.description} rows={8} className="a-input" placeholder="Krátký popis ošetření…" />
        <small className="a-hint">Nový odstavec = prázdný řádek. Odrážku napíšete pomlčkou na začátku řádku („- čištění pleti“).</small>
      </label>
      <label className="a-check"><input type="checkbox" name="published" defaultChecked={service?.published ?? true} /> Zobrazit na webu</label>
      <div className="a-sticky-save">
        <button className="a-btn a-btn--primary a-btn--block" disabled={pending}>{pending ? "Ukládám…" : "Uložit službu"}</button>
        {state && !state.ok && <p role="alert" className="a-msg a-msg--err">{state.message}</p>}
      </div>
    </form>
  );
}
