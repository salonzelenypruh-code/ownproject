/* Naplní prázdnou databázi výchozím obsahem (ceník, fotky, admin účet).
   Spuštění: npm run db:seed   – už existující data nepřepisuje. */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";
import { db, schema } from "../src/db";
import type { Variant } from "../src/db/schema";

const v = (minutes: number | null, price: number | null): Variant => ({ minutes, price });
const H1 = v(60, 1100), H15 = v(90, 1500);

const SERVICES: { category: schema.Category; name: string; description: string; variants: Variant[] }[] = [
  { category: "osetreni", name: "Základní kosmetické ošetření", variants: [v(60, 1200)],
    description: "Enzymatický peeling, rýžový peeling, ultrazvuková špachtle, booster podle typu a stavu pleti, kosmetická masáž obličeje, dekoltu a očního okolí. Maska na obličej a dekolt zvolená podle pleti, speciální maska na oční okolí zapracovaná během masáže, LED terapie, sérum, krém a krém na oční okolí." },
  { category: "osetreni", name: "Aktivní anti-aging", variants: [v(100, 1750)],
    description: "Zaměřuje se na aktivní omlazení pleti, která má problém se začínajícími nebo pokročilejšími vráskami. Hydratace a lifting, stimulace tvorby kolagenu a elastinu, sjednocení tónu pleti.\n\nEnzymatický peeling, rýžový peeling, chemický peeling podle problematiky pleti, čištění ultrazvukovou špachtlí, neinvazivní přístrojová mezoterapie, pětikrokové ošetření očního okolí, masáž obličeje, dekoltu a očního okolí, maska, sérum, krém a krém na oční okolí." },
  { category: "osetreni", name: "Hydratační ošetření", variants: [v(100, 1750)],
    description: "Zaměřené na suchou, tenkou a šupinatou pleť.\n\nEnzymatický peeling, rýžový peeling, chemický peeling, čištění ultrazvukovou špachtlí, neinvazivní mezoterapie, booster, pětikrokové ošetření očního okolí, masáž, maska a LED terapie." },
  { category: "osetreni", name: "Ošetření pro citlivou pleť", variants: [v(60, 1300)],
    description: "Zklidňující péče pro zjemnění pleti, posílení mikrobiomu a dermální bariéry. Pleť je po ošetření klidnější, hydratovaná a chráněná.\n\nEnzymatický peeling, chemický peeling, čištění ultrazvukovou špachtlí, masáž, maska a LED terapie." },
  { category: "osetreni", name: "Super lifting", variants: [v(130, 2300)],
    description: "Zaměřené na obnovu objemu a zpevnění ochablých kontur, omlazení a celkovou regeneraci.\n\nEnzymatický peeling, rýžový peeling, chemický peeling, čištění ultrazvukovou špachtlí, neinvazivní mezoterapie, pětikrokové ošetření očního okolí, gold/hot terapie, myofasciální masáž obličeje (45 min), alginátová maska a LED terapie." },
  { category: "pristrojove", name: "Karboxyterapie", variants: [v(60, 1200)],
    description: "Neinvazivní metoda, která je řešením v pěti směrech najednou:\n- důkladné a hluboké čištění\n- zlepšení přirozených funkcí kůže\n- účinné omlazení tkání\n- korekce kosmetických vad\n- posílení stěn kapilár" },
  { category: "pristrojove", name: "Mikroproudová terapie", variants: [v(60, 1200)],
    description: "Příjemná a účinná metoda, která bojuje proti přirozenému stárnutí pleti. Impulsy působí na svaly a podkožní tkáň, což vede ke zlepšení turgoru, zvýraznění kontur obličeje a výraznému liftingu." },
  { category: "pristrojove", name: "Neinvazivní mezoterapie", variants: [v(60, 1200)],
    description: "Řeší ztrátu pružnosti pleti, změnu kontur obličeje, dehydrataci a jemné vrásky. Průnik účinných látek do hlubokých vrstev pleti zajišťují elektrické impulzy." },
  { category: "obliceje", name: "Kobido", variants: [v(60, 1200)],
    description: "Tradiční japonská liftingová masáž obličeje, která kombinuje jemné relaxační techniky s rychlejšími, precizními hmaty zaměřenými na hlubší vrstvy tkání. Jejím cílem je přirozené omlazení pleti, zlepšení tonusu svalů, podpora mikrocirkulace a rozjasnění pokožky." },
  { category: "obliceje", name: "Myofasciální lifting", variants: [v(60, 1200)],
    description: "Technika, která spojuje prvky manuální masáže a manipulace s fasciemi. Omlazuje pleť, modeluje kontury obličeje, zmírňuje vrásky a obnovuje pružnost pleti." },
  { category: "obliceje", name: "Lymfatická masáž obličeje", variants: [v(60, 1200)],
    description: "Redukuje otoky, zjemňuje jemné vrásky a navrací pleti svěžest a jas." },
  { category: "masaze", name: "Klasická masáž", variants: [H1, H15], description: "" },
  { category: "masaze", name: "Hloubková masáž", variants: [H1, H15], description: "" },
  { category: "masaze", name: "Lymfatická masáž", variants: [H15], description: "" },
  { category: "masaze", name: "Sportovní masáž", variants: [H1, H15], description: "" },
  { category: "masaze", name: "Maderoterapie", variants: [H1], description: "" },
  { category: "masaze", name: "Stop celulitidy", variants: [H1, H15],
    description: "Procedura spojuje tři metody:\n- manuální lymfodrenáž\n- maderoterapii\n- přístrojovou vakuovou masáž\n\nZaměřuje se jak na omlazení pokožky díky zvýšené tvorbě vlastního kolagenu a elastinu, tak na odvodnění těla, detoxikaci, zrychlení metabolismu a boj proti celulitidě. Výsledek uvidíte už po první návštěvě." },
  { category: "balicky", name: "Masáž + kosmetika na míru", variants: [v(90, 1700)], description: "Masáž (40 min) a kosmetické ošetření na míru (50 min)." },
  { category: "balicky", name: "Masáž + kosmetika na míru", variants: [v(120, 2200)], description: "Masáž (30 min) a kosmetické ošetření na míru (90 min)." },
];

const PHOTOS: (Omit<typeof schema.photos.$inferInsert, "url" | "urlSmall"> & { file: string; small?: boolean })[] = [
  { place: "uvod", file: "salon-1-luzko", small: true, width: 1200, height: 1799, alt: "Kosmetické lůžko se zeleným podsvícením – kosmetika Praha 4 Braník, salon Zelený pruh", sortOrder: 1 },
  { place: "uvod", file: "salon-2-cekarna", small: true, width: 1600, height: 706, alt: "Čekárna kosmetického salonu v Poliklinice Zelený pruh, Praha 4", sortOrder: 2 },
  { place: "uvod", file: "salon-3-masazni-mistnost", small: true, width: 1600, height: 620, alt: "Masážní místnost s tapetou s liliemi – masáže Praha 4 Braník", sortOrder: 3 },
  { place: "portret", file: "galyna-tretyak", width: 700, height: 700, alt: "Galyna Tretyak, kosmetička a masérka – salon na Zeleném pruhu, Praha 4", sortOrder: 1 },
  { place: "galerie", file: "salon-1-luzko", small: true, width: 1200, height: 1799, alt: "Kosmetické lůžko se zeleným podsvícením", sortOrder: 1 },
  { place: "galerie", file: "salon-3-masazni-mistnost", small: true, width: 1600, height: 620, alt: "Masážní místnost s tapetou s liliemi", sortOrder: 2 },
  { place: "galerie", file: "salon-2-cekarna", small: true, width: 1600, height: 706, alt: "Čekárna salonu s pohovkou a vitrínou", sortOrder: 3 },
];

async function main() {
  const [{ n: nServices }] = await db.select({ n: count() }).from(schema.services);
  if (nServices === 0) {
    await db.insert(schema.services).values(SERVICES.map((s, i) => ({ ...s, sortOrder: i + 1 })));
    console.log(`✓ služby: ${SERVICES.length}`);
  } else console.log(`• služby už existují (${nServices}), přeskakuji`);

  const [{ n: nPhotos }] = await db.select({ n: count() }).from(schema.photos);
  if (nPhotos === 0) {
    await db.insert(schema.photos).values(PHOTOS.map(({ file, small, ...p }) => ({
      ...p, url: `/img/${file}.webp`, urlSmall: small ? `/img/${file}-800.webp` : null,
    })));
    console.log(`✓ fotky: ${PHOTOS.length}`);
  } else console.log(`• fotky už existují (${nPhotos}), přeskakuji`);

  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const [{ n: nAdmins }] = await db.select({ n: count() }).from(schema.adminUsers);
  if (nAdmins === 0 && email && password) {
    await db.insert(schema.adminUsers).values({ email, passwordHash: await bcrypt.hash(password, 12) });
    console.log(`✓ admin účet: ${email}`);
  } else if (nAdmins === 0) console.log("! admin účet nevytvořen – doplňte ADMIN_EMAIL a ADMIN_PASSWORD do .env");
  else console.log("• admin účet už existuje");
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
