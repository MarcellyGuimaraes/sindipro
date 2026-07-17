import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/auth/role";

/**
 * Layout do site institucional público.
 * Envolve todas as rotas públicas (route group "(site)" — não altera as URLs)
 * com a Navbar e o Footer. O /painel-diretoria fica FORA deste grupo e não
 * recebe essa moldura.
 *
 * getUser() aqui (uma vez, no layout) é o que permite a Navbar mostrar
 * "Entrar" vs. "Minha área" + "Sair" em qualquer página do site.
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

  return (
    <>
      <Navbar authRole={roleFromUser(user)} />
      {children}
      <Footer />
    </>
  );
}
