"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../actions";

const ITEMS = [
  { href: "/admin", label: "Přehled", icon: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/admin/zadosti", label: "Rezervace", key: "zadosti", icon: "M4 5h16v14H4zM4 7l8 6 8-6" },
  { href: "/admin/poukazy", label: "Poukazy", key: "poukazy", icon: "M3 8h18v4H3zM5 12v8h14v-8M12 8v12M12 8c-2-4-6-4-6-1.5S9 8 12 8Zm0 0c2-4 6-4 6-1.5S15 8 12 8Z" },
  { href: "/admin/sluzby", label: "Služby", icon: "M5 6h14M5 12h14M5 18h9" },
  { href: "/admin/fotky", label: "Fotky", icon: "M4 6h16v12H4zM8 14l3-3 3 3 2-2 4 4M9 9.5a1 1 0 1 0 0-.01" },
  { href: "/admin/recenze", label: "Recenze", key: "recenze", icon: "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" },
  { href: "/admin/nastaveni", label: "Nastavení", icon: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L15 3h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1L11 21h4l.4-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.4z" },
] as const;

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  return (
    <>
      <header className="a-top">
        <Link href="/admin" className="a-top__brand"><img src="/img/logo-havran.webp" alt="" width={32} height={32} /><span>Administrace</span></Link>
        <div className="a-top__right">
          <a href="/" target="_blank" rel="noopener" className="a-btn a-btn--ghost a-btn--sm">Zobrazit web ↗</a>
          <form action={logout}><button className="a-btn a-btn--ghost a-btn--sm">Odhlásit</button></form>
        </div>
      </header>
      <nav className="a-nav" aria-label="Administrace">
        {ITEMS.map((it) => {
          const badge = "key" in it ? badges[it.key] : 0;
          return (
            <Link key={it.href} href={it.href} className="a-nav__item" aria-current={active(it.href) ? "page" : undefined}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={it.icon} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" /></svg>
              <span>{it.label}</span>
              {badge > 0 && <b className="a-badge" aria-label={`${badge} nových`}>{badge}</b>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
