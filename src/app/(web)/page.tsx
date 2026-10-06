import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BookLink } from "@/components/BookLink";
import { Photo } from "@/components/Photo";
import { ReviewForm } from "@/components/ReviewForm";
import { Stars } from "@/components/icons";
import { FaqSection } from "@/components/FaqSection";
import { buildFaq } from "@/lib/faq";
import { instagram } from "@/lib/social";
import { IgIcon } from "@/components/icons";
import { getPhotos, getPublishedReviews, getServices } from "@/lib/data";
import { getSettings } from "@/lib/settings";

export const metadata = pageMeta("/", null, "Kosmetika a masáže v Praze 4 – Braník, v Poliklinice Zelený pruh. Ošetření pleti s kosmetikou GIGI, přístrojová kosmetika, masáže a dárkové poukazy.");

export default async function Home() {
  const [trio, portrait, reviews, s, allServices] = await Promise.all([
    getPhotos("uvod"), getPhotos("portret"), getPublishedReviews(), getSettings(), getServices(["osetreni", "pristrojove", "obliceje", "masaze", "balicky"]),
  ]);
  const massages = allServices.filter((x) => x.category === "masaze");
  const massageNames = massages.map((m) => m.name.replace(/ masáž$/, "")).join(", ");

  return (
    <>
      <section className="hero wrap">
        <div className="hero__logo"><Logo size={170} priority /></div>
        <h1>Kosmetika a masáže<br />na Zeleném pruhu</h1>
        <p className="claim"><span>Krásné výsledky</span><span className="claim__dot" aria-hidden="true">·</span><span className="visually-hidden"> · </span><span>Rozumné ceny</span></p>
        <div className="btn-row btn-row--center">
          <BookLink url={s.bookingUrl}>Rezervovat termín</BookLink>
          <a className="btn btn--ghost" href="#sluzby">Naše služby</a>
        </div>
      </section>

      {trio.length > 0 && (
        <section className="wrap section--tight" aria-label="Fotografie salonu">
          <div className="photo-trio">
            {trio.slice(0, 3).map((p) => <Photo key={p.id} photo={p} sizes="(max-width: 700px) calc(100vw - 32px), 380px" />)}
          </div>
        </section>
      )}

      <section className="wrap wrap--narrow section" aria-labelledby="uvod-nadpis">
        <div className="panel intro">
          {portrait[0] && <div className="intro__photo"><Photo photo={portrait[0]} sizes="(max-width: 760px) 220px, 300px" /></div>}
          <div>
            <h2 id="uvod-nadpis">Úvod</h2>
            <p>Vítejte na stránkách salonu Kosmetika a masáže na Zeleném pruhu. Jmenuji se Galyna Tretyak a ráda vás pozvu do salonu, který se zaměřuje na péči o tělo a pleť.</p>
            <p>Věřím, že péče o tělo a pleť je umění, které vyžaduje nejen odborné znalosti, ale i lásku k práci. Snažím se, aby každá vaše návštěva byla příjemným zážitkem a relaxací. Mým cílem je, abyste odcházeli s úsměvem na tváři a s pocitem, že jste na správném místě.</p>
            <p>Těším se na vaši návštěvu a na možnost postarat se o vás.</p>
            <p className="intro__highlight">Ponořte se do magické atmosféry salonu na Zeleném pruhu!</p>
            <p className="intro__sign">Galyna Tretyak</p>
          </div>
        </div>
      </section>

      <section className="wrap section" id="sluzby" aria-labelledby="sluzby-nadpis" style={{ paddingTop: 0 }}>
        <h2 id="sluzby-nadpis" className="section-title">Služby</h2>
        <div className="cards">
          <article className="panel card"><h3>Kosmetika</h3><p>Kosmetické ošetření, přístrojové ošetření a obličejové masáže</p><Link href="/kosmetika" aria-label="Více o kosmetice">Více</Link></article>
          <article className="panel card"><h3>Masáže</h3><p>{massageNames || "Masáže těla"}</p><Link href="/masaze#masaze" aria-label="Více o masážích">Více</Link></article>
          <article className="panel card"><h3>Balíčky</h3><p>Spojení masáže a kosmetiky v jedné návštěvě</p><Link href="/masaze#balicky" aria-label="Více o balíčcích">Více</Link></article>
          <article className="panel card card--wide"><h3>Dárkový poukaz</h3><p>Darujte svým blízkým péči a relaxaci</p><Link href="/darkovy-poukaz" aria-label="Více o dárkovém poukazu">Více</Link></article>
        </div>
      </section>

      <section className="wrap section" id="recenze" aria-labelledby="recenze-nadpis" style={{ paddingTop: 0 }}>
        <h2 id="recenze-nadpis" className="section-title">Recenze</h2>
        {reviews.length > 0 ? (
          <div className="reviews">
            {reviews.map((r) => (
              <figure key={r.id} className="panel review">
                <Stars value={r.rating} />
                <blockquote>{r.text}</blockquote>
                <figcaption>{r.name}</figcaption>
              </figure>
            ))}
          </div>
        ) : <p className="section-sub">Byli jste u nás spokojeni? Budeme rádi za vaši první recenzi.</p>}
        <ReviewForm />
      </section>

      {instagram(s.instagram) && (
        <section className="wrap wrap--narrow section" aria-labelledby="ig-nadpis" style={{ paddingTop: 0 }}>
          <div className="panel ig-band">
            <IgIcon />
            <div>
              <h2 id="ig-nadpis">Sledujte mě na Instagramu</h2>
              <p>Novinky, výsledky ošetření a volné termíny najdete na <strong>{instagram(s.instagram)!.handle}</strong>.</p>
            </div>
            <a className="btn btn--primary" href={instagram(s.instagram)!.url} target="_blank" rel="noopener me">Otevřít Instagram</a>
          </div>
        </section>
      )}

      <FaqSection items={buildFaq(s, allServices)} />
    </>
  );
}
