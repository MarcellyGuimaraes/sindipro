import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/auth/role";
import type { NavUser } from "@/components/AuthNavButton";

/**
 * Layout do site institucional público.
 * Envolve todas as rotas públicas (route group "(site)" — não altera as URLs)
 * com a Navbar e o Footer. O /painel-diretoria fica FORA deste grupo e não
 * recebe essa moldura.
 *
 * getUser() aqui (uma vez, no layout) é o que permite a Navbar mostrar
 * "Entrar" vs. o menu de perfil ("Mudar senha", "Sair") em qualquer página do
 * site. Quando há sessão, buscamos nome + provedor do associado para o menu
 * (diretoria não tem linha em `profiles` e cai só no e-mail).
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authRole = roleFromUser(user);

  let navUser: NavUser | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, company, providers(name)")
      .eq("id", user.id)
      .maybeSingle();

    // PostgREST devolve o embed como objeto OU array conforme a cardinalidade;
    // normalizamos os dois casos para o nome do provedor.
    const providerRel = profile?.providers as
      | { name: string }
      | { name: string }[]
      | null
      | undefined;
    const providerName = Array.isArray(providerRel)
      ? providerRel[0]?.name
      : providerRel?.name;

    navUser = {
      name: profile?.full_name ?? user.email ?? "Conta",
      email: user.email ?? "",
      company: providerName ?? profile?.company ?? null,
    };
  }

  return (
    <>
      <Navbar authRole={authRole} user={navUser} />
      {children}
      <Footer />
    </>
  );
}
