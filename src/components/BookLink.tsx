import Link from "next/link";

/** Tlačítko „Rezervovat“: s odkazem na externí rezervační systém (Notino) vede tam, jinak na formulář /rezervace. */
export function BookLink({ url, fallback = "/rezervace", className = "btn btn--primary", children, ...rest }: {
  url: string; fallback?: string; className?: string; children: React.ReactNode; "aria-current"?: "page" | undefined;
}) {
  if (url) return <a className={className} href={url} target="_blank" rel="noopener">{children}</a>;
  return <Link className={className} href={fallback} {...rest}>{children}</Link>;
}
