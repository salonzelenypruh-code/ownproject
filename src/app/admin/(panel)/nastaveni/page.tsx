import { ActionForm, SubmitButton } from "@/components/admin/ui";
import { getSettings, SETTINGS, type SettingKey } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { changePassword, saveSettings } from "../../actions";

export const metadata = { title: "Nastavení" };

export default async function Nastaveni() {
  const [s, session] = await Promise.all([getSettings(), getSession()]);
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
        <p className="a-muted a-small">Přihlášena: {session?.email}</p>
        <ActionForm action={changePassword} className="a-stack" resetOnSuccess>
          <label className="a-field"><span>Současné heslo</span><input type="password" name="current" autoComplete="current-password" required className="a-input" /></label>
          <label className="a-field"><span>Nové heslo (min. 8 znaků)</span><input type="password" name="next" autoComplete="new-password" minLength={8} required className="a-input" /></label>
          <label className="a-field"><span>Nové heslo znovu</span><input type="password" name="again" autoComplete="new-password" minLength={8} required className="a-input" /></label>
          <SubmitButton>Změnit heslo</SubmitButton>
        </ActionForm>
      </section>
    </>
  );
}
