"use client";
import { useRef, useState } from "react";
import type { Photo as PhotoRow } from "@/db/schema";
import { Photo } from "./Photo";

export function Gallery({ photos, placeholders }: { photos: PhotoRow[]; placeholders: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<PhotoRow | null>(null);
  const open = (p: PhotoRow) => { setActive(p); dialog.current?.showModal(); };
  return (
    <>
      <ul className="gallery">
        {photos.map((p) => (
          <li key={p.id}>
            <button className="gallery__btn" type="button" aria-label={`Zvětšit fotku: ${p.alt}`} onClick={() => open(p)}>
              <Photo photo={p} sizes="(max-width: 760px) calc(100vw - 32px), 780px" />
            </button>
          </li>
        ))}
        {Array.from({ length: placeholders }, (_, i) => <li key={`ph${i}`}><div className="gallery__placeholder">Další fotky připravujeme</div></li>)}
      </ul>
      <dialog ref={dialog} className="lightbox" aria-label="Zvětšená fotografie"
        onClick={(e) => { if ((e.target as HTMLElement).tagName !== "IMG") dialog.current?.close(); }}
        onClose={() => setActive(null)}>
        <button className="lightbox__close" type="button" aria-label="Zavřít">×</button>
        {active && <img src={active.url} alt={active.alt} />}
      </dialog>
    </>
  );
}
