const ALT = "Logo salonu Kosmetika a masáže na Zeleném pruhu – havran na větvi";

/** Logo ve WebP (malá verze pro menu a patičku, větší pro úvod). */
export function Logo({ size, alt = ALT, className, priority }: { size: number; alt?: string; className?: string; priority?: boolean }) {
  const src = size <= 72 ? "/img/logo-havran-96.webp" : size <= 120 ? "/img/logo-havran-180.webp" : "/img/logo-havran.webp";
  return (
    <span className={className}>
      <img src={src} alt={alt} width={size} height={size} decoding="async" fetchPriority={priority ? "high" : undefined} />
    </span>
  );
}
