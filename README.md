# Kosmetika a masáže na Zeleném pruhu – web

Statický web (HTML + CSS + trochu JavaScriptu). Bez frameworku a bez build kroku: co je ve složce, to se nahraje na hosting.

## Náhled na počítači

```bash
cd kosmetika-zeleny-pruh
python3 -m http.server 8091
```
Pak otevřete http://localhost:8091. Soubory jdou otevřít i dvojklikem, ale mapa a formulář fungují spolehlivě až přes server.

## Struktura

| Soubor | Co obsahuje |
|---|---|
| `index.html` | Úvod: logo, fotky salonu, text Galyny, karty služeb |
| `kosmetika.html` | Ceník: kosmetické ošetření (`#osetreni`), přístrojové (`#pristrojove`), obličejové masáže (`#obliceje`) |
| `masaze.html` | Ceník: masáže (`#masaze`) a balíčky (`#balicky`) |
| `darkovy-poukaz.html` | Náhled poukazu a podmínky |
| `rezervace.html` | Rezervační formulář (FormSubmit → galinajork@gmail.com) |
| `kontakty.html` | Adresa, telefon, e-mail, otevírací doba, mapa |
| `galerie.html` | Fotky + lightbox |
| `css/style.css` | Všechny styly; barvy a písma jsou v proměnných nahoře v `:root` |
| `js/menu.js` | Hamburger a rozbalovací menu |
| `js/rezervace.js` | Odeslání a kontrola formuláře, konstanta `FORM_ENDPOINT` |
| `js/galerie.js` | Zvětšení fotek v galerii |
| `img/` | Fotky (každá jako `.webp` + `.jpg`), logo, OG obrázek |

Menu a patička jsou v každé stránce stejné. Když v nich něco měníte, změňte to ve všech 7 souborech (nejrychleji hromadným nahrazením v editoru).

## Jak upravit ceník

V `kosmetika.html` / `masaze.html` je každá služba jeden blok:

```html
<li class="price-item">
  <div><p class="price-item__name">Název</p><p class="price-item__desc">Krátký popis</p></div>
  <div class="price-item__meta"><span class="price-item__price">890 Kč</span><span class="price-item__time">60 min</span></div>
</li>
```
Novou službu přidáte zkopírováním celého bloku. Smazáním bloku ji odeberete.

## Jak upravit kontakty

Telefon, e-mail, adresa a otevírací doba jsou v patičce všech stránek, na `kontakty.html`, v panelu na `rezervace.html` a ve strukturovaných datech (`<script type="application/ld+json">`) na `index.html` a `kontakty.html`.
U odkazu na telefon pište číslo bez mezer: `href="tel:+420777123456"`.

## Co je potřeba doplnit

Všechna chybějící místa jsou v kódu v hranatých závorkách. Najdete je hledáním znaku `[` ve všech `.html` souborech.

- [ ] **Ceník**: ✅ doplněn (10/2026). U Hydratačního ošetření zatím chybí cena a délka (v kosmetika.html je položka bez ceny).
- [ ] **Adresa**: číslo domu `[ČÍSLO]` a `[PSČ]`; po doplnění upravte i adresu v mapě (`kontakty.html`, parametr `q=` v iframe)
- [x] **Telefon a WhatsApp**: +420 770 637 825 (doplněno; odkaz na WhatsApp je https://wa.me/420770637825)
- [x] **E-mail**: galinajork@gmail.com (doplněno)
- [ ] **Otevírací doba** `[OD – DO]` (i v JSON-LD jako `"opens": "09:00"`)
- [ ] **Dárkový poukaz**: hodnoty, platnost, jak koupit (`[ČÁSTKA]`, `[DATUM]`, `[POČET]`, …)
- [ ] **Další fotky do galerie**: místo bloků `[Další foto]`
- [ ] **Formulář**: nastaven na galinajork@gmail.com přes FormSubmit, zbývá jednorázová aktivace (viz níže)
- [ ] **Doména**: `[DOMENA]` v `<link rel="canonical">` a JSON-LD (např. `https://www.kosmetika-zelenypruh.cz`)
- [ ] **Logo ve vektoru**: teď je logo PNG/WebP vyřezané z grafického návrhu. Až bude k dispozici `logo-havran.svg`, stačí vyměnit soubory v `img/` a `favicon.svg`.

## Formulář (FormSubmit)

Žádosti o rezervaci chodí e-mailem na **galinajork@gmail.com** přes službu https://formsubmit.co (zdarma, bez účtu a bez serveru).

- **Jednorázová aktivace:** po úplně prvním odeslání formuláře z webu přijde na galinajork@gmail.com e-mail od FormSubmit („Action Required: Activate FormSubmit“). Klikněte v něm na *Activate Form*. Do té doby se žádosti nedoručují a návštěvník uvidí hlášku o chybě s odkazem na telefon.
- **Změna adresy:** v `js/rezervace.js` přepište e-mail na konci `FORM_ENDPOINT` a formulář znovu aktivujte.
- Proti spamu je ve formuláři skryté pole `_honey`. E-mail přijde jako přehledná tabulka (`_template=table`).

## Přidání fotky do galerie

1. Uložte fotku do `img/` jako JPG (max. 1600 px na šířku) a ideálně i jako WebP se stejným názvem (např. přes https://squoosh.app).
2. V `galerie.html` nahraďte jeden řádek `<li><div class="gallery__placeholder">…</div></li>` kopií řádku s existující fotkou a přepište název souboru a popis (`alt`).

## Nahrání na hosting

Nahrajte **celý obsah složky** (včetně `img/`, `css/`, `js/` a faviconů) do kořene webu:

- **Wedos / Forpsi / Active24**: přes FTP (např. FileZilla) do složky `www/` (Wedos: `www/domains/vase-domena.cz/`).
- **Netlify**: na app.netlify.com přetáhněte složku do „Deploy manually“.
- **GitHub Pages**: nahrajte soubory do repozitáře a v Settings → Pages zvolte větev `main`, složku `/ (root)`.

Web nepoužívá cookies ani měřicí skripty, takže cookie lišta není potřeba. Pokud se přidá Google Analytics apod., bude ji potřeba doplnit. Mapa Google se načítá až při posunu stránky k ní.
