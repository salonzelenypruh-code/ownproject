import Link from "next/link";

export const metadata = { title: "Stránka nenalezena", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="page-head wrap" style={{ paddingBottom: 96 }}>
      <span className="eyebrow">Chyba 404</span>
      <h1>Tuhle stránku jsme nenašli</h1>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>Možná se změnila adresa. Zkuste začít na úvodní stránce.</p>
      <div className="btn-row btn-row--center">
        <Link className="btn btn--primary" href="/">Na úvodní stránku</Link>
        <Link className="btn btn--ghost" href="/kosmetika">Ceník kosmetiky</Link>
      </div>
    </div>
  );
}
