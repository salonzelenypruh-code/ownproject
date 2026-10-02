# Kosmetika a masáže na Zeleném pruhu – web + administrace

Next.js 16 · Drizzle + SQLite/Turso · Vercel Blob (fotky) · Resend (e-maily). Vzhled je převzatý 1:1 ze statické verze (git tag `staticka-verze`, soubory v `_staticka-verze/`).

## Spuštění na počítači

```bash
npm install
cp .env.example .env        # a doplnit AUTH_SECRET + ADMIN_PASSWORD (návod v souboru)
npm run db:push             # vytvoří tabulky (local.db)
npm run db:seed             # ceník, fotky, admin účet
npm run dev                 # http://localhost:8091
```

- Web: http://localhost:8091
- Administrace: http://localhost:8091/admin (účet z `ADMIN_EMAIL` / `ADMIN_PASSWORD` v `.env`)
- Změna hesla: v adminu Nastavení → Změna hesla, nebo `npm run admin:heslo -- email@x.cz NoveHeslo`

Bez klíčů vše funguje lokálně: fotky se ukládají do `public/uploads/`, e-maily se jen vypíšou do terminálu.

## Co umí administrace (/admin)

| Sekce | Co se tam dělá |
|---|---|
| **Přehled** | počet nových žádostí a recenzí ke schválení, rychlé akce |
| **Žádosti** | všechny žádosti z rezervačního formuláře; stav Nová / Vyřízená / Archiv, tlačítka Zavolat / WhatsApp / E-mail, vlastní poznámka. Každá žádost zároveň přijde e-mailem (adresa v Nastavení) |
| **Služby** | ceník – přidat, upravit, skrýt, smazat, změnit pořadí; víc délek a cen u jedné služby (60 / 90 min) |
| **Fotky** | tři fotky na úvodu, portrét, galerie – nahrát (i víc najednou z mobilu), vyměnit, popis, pořadí, smazat. Fotky se samy zmenší a převedou do WebP |
| **Recenze** | recenze od zákazníků z webu čekají na schválení; přidat / upravit / skrýt / smazat |
| **Nastavení** | telefon, WhatsApp, e-mail, adresa, mapa, otevírací doba, texty dárkového poukazu, kam chodí žádosti, změna hesla |

Admin je stavěný primárně pro mobil (spodní navigace, velká tlačítka); na počítači je menu vlevo.

## Struktura

```
src/app/(web)/        veřejný web (stránky, formuláře – actions.ts)
src/app/admin/        administrace (actions.ts = všechny úpravy dat, admin.css)
src/components/       Header, Footer, ceník, galerie, formuláře
src/db/schema.ts      tabulky: services, photos, reviews, submissions, settings, admin_users
src/lib/              přihlášení, ukládání fotek, e-maily, nastavení
scripts/              seed.ts (výchozí data), set-password.ts
```

## Co ještě chybí od majitelky

Doplňuje se přímo v adminu (Nastavení / Služby / Fotky) – pole s `[hranatými závorkami]` jsou zvýrazněná žlutě:
- adresa (číslo domu, PSČ), otevírací doba
- dárkový poukaz – hodnota, platnost, jak koupit
- cena a délka Hydratačního ošetření
- další fotky do galerie

## Nasazení (zatím neprovedeno – účty se zakládají na majitelku)

1. **Turso** (free): databáze → `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, pak `npm run db:push && npm run db:seed`.
2. **Vercel** (nebo Netlify): import repozitáře, proměnné z `.env.example`. Pozor: Vercel Hobby je podle podmínek jen pro nekomerční použití.
3. **Vercel Blob** (free) → `BLOB_READ_WRITE_TOKEN` (na Vercelu se doplní sám po vytvoření úložiště).
4. **Resend** (free, 100 e-mailů/den): ověřit doménu salonu → `RESEND_API_KEY`, `MAIL_FROM="Salon <web@domena.cz>"`.
5. `NEXT_PUBLIC_SITE_URL=https://www.domena.cz`, nový silný `AUTH_SECRET` a `ADMIN_PASSWORD`.
