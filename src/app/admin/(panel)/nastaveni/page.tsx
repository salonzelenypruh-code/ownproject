import { ActionForm, SubmitButton } from "@/components/admin/ui";
import { getSettings, SETTINGS, type SettingKey } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { changePassword, logoutEverywhere, saveSettings } from "../../actions";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const metadata = { title: "Nastavení" };

export default async function Nastaveni() {
  const [s, session] = await Promise.all([getSettings(), getSession()]);
  const [user] = session ? await db.select({ last: schema.adminUsers.lastLoginAt }).from(schema.adminUsers).where(eq(schema.adminUsers.email, session.email)) : [];
  const groups = [...new Set(Object.values(SETTINGS).map((v) => v.group))];
  return (
    <>
      <h1 className="a-h1">Nastavení</h1>
      <p className="a-muted a-lead">Údaje se zobrazí v patičce, na stránce Kontakty, Rezervace a Dárkový poukaz. Texty v [hranatých závorkách] ještě čekají na doplnění.</p>
      <ActionForm action={saveSettings} className="a-stack">
        {groups.map((g) => (
          <fieldset key={g} className="a-card a-stack">
            <legend className="a-legend">{g}</legend>
            {(Object.keys(SETTINGS) as SettingKey[]).filter((k) => SETTINGS[k].group === g).map((k) => (
              <label key={k} className="a-field"><span>{SETTINGS[k].label}</span>
                {k.startsWith("voucherIntro")
                  ? <textarea name={k} defaultValue={s[k]} rows={3} className={`a-input${s[k].includes("[") ? " a-input--todo" : ""}`} />
                  : <input name={k} defaultValue={s[k]} className={`a-input${s[k].includes("[") ? " a-input--todo" : ""}`} />}
              </label>
            ))}
          </fieldset>
        ))}
        <div className="a-sticky-save"><SubmitButton className="a-btn a-btn--primary a-btn--block">Uložit nastavení</SubmitButton></div>
      </ActionForm>

      <section className="a-card">
        <h2>Změna hesla</h2>
        <p className="a-muted a-small">Přihlášena: {session?.email}{user?.last ? ` · poslední přihlášení ${user.last.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" })}` : ""}</p>
        <ActionForm action={changePassword} className="a-stack" resetOnSuccess>
          <label className="a-field"><span>Současné heslo</span><input type="password" name="current" autoComplete="current-password" required className="a-input" /></label>
          <label className="a-field"><span>Nové heslo (min. 10 znaků, písmena i číslice)</span><input type="password" name="next" autoComplete="new-password" minLength={10} required className="a-input" /></label>
          <label className="a-field"><span>Nové heslo znovu</span><input type="password" name="again" autoComplete="new-password" minLength={10} required className="a-input" /></label>
          <SubmitButton>Změnit heslo</SubmitButton>
        </ActionForm>
      </section>
      <section className="a-card">
        <h2>Zabezpečení</h2>
        <p className="a-muted a-small">Ztratila jste telefon nebo jste se přihlásila na cizím počítači? Odhlásí se všechna zařízení včetně tohoto.</p>
        <form action={logoutEverywhere}><button className="a-btn a-btn--danger">Odhlásit všechna zařízení</button></form>
      </section>
    </>
  );
}
