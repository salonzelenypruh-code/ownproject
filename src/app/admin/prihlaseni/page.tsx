import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Přihlášení" };

export default async function Login() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="a-login">
      <div className="a-login__box">
        <img src="/img/logo-havran.webp" alt="" width={72} height={72} />
        <h1>Administrace webu</h1>
        <p className="a-muted">Kosmetika a masáže na Zeleném pruhu</p>
        <LoginForm />
      </div>
    </main>
  );
}
