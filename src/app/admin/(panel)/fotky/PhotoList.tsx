"use client";
import { useEffect, useState, useTransition } from "react";
import {
  DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Photo, PhotoPlace } from "@/db/schema";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/ui";
import { deletePhoto, reorderPhotos, replacePhoto, savePhotoAlt } from "../../actions";

function Tile({ photo, index, sortable, onFirst }: { photo: Photo; index: number; sortable: boolean; onFirst: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id, disabled: !sortable });
  return (
    <li ref={setNodeRef} className={`a-tile${isDragging ? " a-tile--drag" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}>
      <div className="a-tile__img">
        <img src={photo.urlSmall ?? photo.url} alt={photo.alt} loading="lazy" draggable={false} />
        {sortable && <span className="a-tile__num">{index + 1}</span>}
        {sortable && (
          <button ref={setActivatorNodeRef} type="button" className="a-tile__handle" aria-label={`Přesunout fotku ${index + 1} (${photo.alt})`} {...attributes} {...listeners}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-1.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-1.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18 19a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>
          </button>
        )}
      </div>
      <div className="a-tile__bar">
        {sortable && <button type="button" className="a-btn a-btn--sm" onClick={onFirst} disabled={index === 0}>⤒ Na začátek</button>}
        <details className="a-tile__more">
          <summary className="a-btn a-btn--sm">Upravit</summary>
          <div className="a-tile__panel">
            <form action={savePhotoAlt} className="a-stack">
              <input type="hidden" name="id" value={photo.id} />
              <label className="a-field"><span>Popis fotky (pro nevidomé a Google)</span>
                <input name="alt" defaultValue={photo.alt} className="a-input" />
              </label>
              <SubmitButton className="a-btn a-btn--sm">Uložit popis</SubmitButton>
            </form>
            <ActionForm action={replacePhoto} className="a-stack">
              <input type="hidden" name="id" value={photo.id} />
              <label className="a-field"><span>Vyměnit za jinou fotku</span>
                <input type="file" name="file" accept="image/*" required className="a-file" />
              </label>
              <SubmitButton className="a-btn a-btn--sm" pendingText="Nahrávám…">Vyměnit</SubmitButton>
            </ActionForm>
            <form action={deletePhoto}>
              <input type="hidden" name="id" value={photo.id} />
              <ConfirmButton message="Opravdu smazat tuto fotku z webu?" className="a-btn a-btn--danger a-btn--sm">Smazat fotku</ConfirmButton>
            </form>
          </div>
        </details>
      </div>
    </li>
  );
}

export function PhotoList({ place, photos, sortable }: { place: PhotoPlace; photos: Photo[]; sortable: boolean }) {
  const [items, setItems] = useState(photos);
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  useEffect(() => setItems(photos), [photos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const save = (next: Photo[]) => {
    const prev = items;
    setItems(next);
    setMsg(null);
    startTransition(async () => {
      const res = await reorderPhotos(place, next.map((p) => p.id));
      if (!res?.ok) setItems(prev);
      setMsg(res);
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((p) => p.id === active.id);
    const to = items.findIndex((p) => p.id === over.id);
    save(arrayMove(items, from, to));
  };

  if (!items.length) return <p className="a-muted">Zatím žádné fotky.</p>;
  return (
    <>
      {sortable && items.length > 1 && <p className="a-hint">Pořadí změníte přetažením za úchyt <b>⠿</b> v rohu fotky. Na webu se fotky zobrazí ve stejném pořadí.</p>}
      <DndContext id={`dnd-${place}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}
        accessibility={{ screenReaderInstructions: { draggable: "Mezerníkem fotku zvednete, šipkami posunete, mezerníkem položíte, Esc zruší." } }}>
        <SortableContext items={items.map((p) => p.id)} strategy={rectSortingStrategy}>
          <ul className={`a-tiles${place === "portret" ? " a-tiles--single" : ""}`}>
            {items.map((p, i) => (
              <Tile key={p.id} photo={p} index={i} sortable={sortable}
                onFirst={() => save([p, ...items.filter((x) => x.id !== p.id)])} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {(pending || msg) && <p role="status" className={`a-msg ${pending ? "" : msg?.ok ? "a-msg--ok" : "a-msg--err"}`}>{pending ? "Ukládám pořadí…" : msg?.message}</p>}
    </>
  );
}
