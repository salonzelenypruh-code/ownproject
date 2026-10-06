import type { Photo as PhotoRow } from "@/db/schema";

/** Fotka z databáze – WebP, menší verze pro mobil přes srcset. */
export function Photo({ photo, sizes = "100vw", lazy = true, priority = false, className }: { photo: PhotoRow; sizes?: string; lazy?: boolean; priority?: boolean; className?: string }) {
  const srcSet = photo.urlSmall ? `${photo.urlSmall} 800w, ${photo.url} ${photo.width}w` : undefined;
  return (
    <img
      src={photo.urlSmall ?? photo.url}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={lazy && !priority ? "lazy" : undefined}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
