import { pageMeta } from "@/lib/seo";
import { CookieSettingsLink } from "@/components/CookieBar";

export const metadata = pageMeta("/cookies", "Cookies", "Jaké cookies používá web salonu Kosmetika a masáže na Zeleném pruhu a jak změnit svůj souhlas.");

export default function Cookies() {
  return (
    <>
      <div className="page-head wrap">
        <span className="eyebrow">Informace</span>
        <h1>Cookies</h1>
      </div>
      <div className="wrap wrap--narrow page-body">
        <section className="panel prose">
          <p>Cookies jsou malé soubory, které si web ukládá ve vašem prohlížeči. Nezbytné cookies ukládáme vždy, ostatní jen s vaším souhlasem („Přijmout vše“).</p>
          <h2>Nezbytné</h2>
          <p>Bez nich web nefunguje správně a souhlas nepotřebují:</p>
          <ul>
            <li><strong>Uložení vaší volby cookies</strong> – aby se lišta nezobrazovala při každé návštěvě (uloženo ve vašem prohlížeči).</li>
            <li><strong>Přihlášení do administrace</strong> – jen pro provozovatelku salonu, návštěvníků se netýká.</li>
          </ul>
          <h2>Se souhlasem</h2>
          <ul>
            <li><strong>Google Analytics 4</strong> – anonymní statistiky návštěvnosti (které stránky se čtou, odkud návštěvníci přicházejí). Provozuje Google.</li>
            <li><strong>Facebook Pixel</strong> – měření a cílení reklam na Facebooku a Instagramu. Provozuje Meta.</li>
            <li><strong>Mapa Google</strong> na stránce Kontakty – při jejím načtení ukládá cookies společnost Google. Bez souhlasu se mapa nenačte a místo ní je odkaz do Google Map. Více v <a href="https://policies.google.com/technologies/cookies?hl=cs" target="_blank" rel="noopener">zásadách Googlu</a>.</li>
          </ul>
          <h2>Změna souhlasu</h2>
          <p>Svou volbu můžete kdykoli změnit: <CookieSettingsLink />.</p>
        </section>
      </div>
    </>
  );
}
