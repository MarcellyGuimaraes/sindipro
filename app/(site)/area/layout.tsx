import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/auth/role";
import { InactivityGuard } from "@/components/auth/InactivityGuard";

/**
 * Layout da área do associado (CLAUDE.md §15) — fica dentro do route group
 * "(site)", então herda Navbar/Footer do site público (não é o dashboard
 * utilitário do painel).
 *
 * Defesa em profundidade: o middleware (lib/supabase/middleware.ts) já
 * bloqueia /area/* sem sessão/papel/perfil ativo; este layout revalida tudo
 * de novo no servidor, mesmo padrão já usado no painel da diretoria.
 */
export const metadata: Metadata = {
  title: "Área do associado",
  robots: { index: false, follow: false },
};

export default async function AreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar?next=/area");

  const role = roleFromUser(user);
  if (role !== "associado" && role !== "diretoria") redirect("/");

  if (role === "associado") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "ativo") {
      await supabase.auth.signOut();
      redirect("/entrar?erro=inativo");
    }
  }

  return (
    <>
      <InactivityGuard loginPath="/entrar" />
      {children}
    </>
  );
}
