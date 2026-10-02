export function Logo({ size, alt = "", className }: { size: number; alt?: string; className?: string }) {
  return (
    <picture className={className}>
      <source srcSet="/img/logo-havran.webp" type="image/webp" />
      <img src="/img/logo-havran.png" alt={alt} width={size} height={size} />
    </picture>
  );
}
