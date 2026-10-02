"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Caret } from "./icons";
import { Logo } from "./Logo";

const SUBMENUS = [
  { href: "/kosmetika", label: "Kosmetika", id: "sub-kosmetika", items: [["osetreni", "Kosmetické ošetření"], ["pristrojove", "Přístrojové ošetření"], ["obliceje", "Obličejové masáže"]] },
  { href: "/masaze", label: "Masáže", id: "sub-masaze", items: [["masaze", "Masáže"], ["balicky", "Balíčky masáže + kosmetika"]] },
] as const;
const LINKS = [["/darkovy-poukaz", "Dárkový poukaz"], ["/galerie", "Galerie"], ["/kontakty", "Kontakty"]] as const;

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [closedSub, setClosedSub] = useState<string | null>(null); // Esc na desktopu
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMenuOpen(false); setOpenSub(null); }, [pathname]);
  useEffect(() => { document.body.classList.toggle("nav-is-open", menuOpen); }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (!mq.matches) {
        const item = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>(".nav__item--has-sub");
        const id = openSub ?? item?.dataset.sub ?? null;
        if (id) {
          setOpenSub(null);
          setClosedSub(id);
          document.querySelector<HTMLButtonElement>(`[aria-controls="${id}"]`)?.focus();
        }
      } else if (menuOpen) {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!mq.matches && !(e.target as HTMLElement).closest(".nav__item--has-sub")) setOpenSub(null);
    };
    const onChange = () => { setMenuOpen(false); setOpenSub(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    mq.addEventListener("change", onChange);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); mq.removeEventListener("change", onChange); };
  }, [menuOpen, openSub]);

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link className="brand" href="/"><Logo size={52} /><span>Kosmetika &amp; masáže</span></Link>
        <button ref={toggleRef} className="nav-toggle" type="button" aria-expanded={menuOpen} aria-controls="hlavni-menu"
          aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"} onClick={() => setMenuOpen((o) => !o)}>
          <span className="nav-toggle__bars" />
        </button>
        <nav className={`nav${menuOpen ? " nav--open" : ""}`} id="hlavni-menu" aria-label="Hlavní menu">
          <ul className="nav__list">
            {SUBMENUS.map((m) => {
              const open = openSub === m.id;
              const cls = ["nav__item", "nav__item--has-sub", pathname === m.href && "nav__item--current", open && "nav__item--open", closedSub === m.id && "nav__item--closed"].filter(Boolean).join(" ");
              return (
                <li key={m.id} className={cls} data-sub={m.id}
                  onMouseLeave={() => setClosedSub(null)}
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setClosedSub(null); if (!window.matchMedia("(max-width: 900px)").matches) setOpenSub(null); } }}>
                  <div className="nav__row">
                    <Link className="nav__link" href={m.href} aria-current={current(m.href)}>{m.label}</Link>
                    <button className="nav__subtoggle" type="button" aria-expanded={open} aria-controls={m.id} aria-label={`Podmenu ${m.label}`}
                      onClick={(e) => { e.stopPropagation(); setClosedSub(null); setOpenSub(open ? null : m.id); }}>
                      <Caret />
                    </button>
                  </div>
                  <ul className="submenu" id={m.id}>
                    {m.items.map(([hash, label]) => (
                      <li key={hash}><Link href={`${m.href}#${hash}`} onClick={() => { setMenuOpen(false); setOpenSub(null); }}>{label}</Link></li>
                    ))}
                  </ul>
                </li>
              );
            })}
            {LINKS.map(([href, label]) => (
              <li key={href} className="nav__item"><Link className="nav__link" href={href} aria-current={current(href)}>{label}</Link></li>
            ))}
            <li className="nav__item nav__cta"><Link className="btn btn--primary" href="/rezervace" aria-current={current("/rezervace")}>Rezervace</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
