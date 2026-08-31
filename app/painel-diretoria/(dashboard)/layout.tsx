import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/auth/role";
import { DashboardShell } from "@/components/painel/DashboardShell";

/**
 * Layout das rotas autenticadas do painel (grupo "(dashboard)").
 * O login fica FORA deste grupo, então não recebe o shell.
 *
 * Defesa em profundidade: além do middleware, revalida sessão E papel aqui.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/painel-diretoria/login");
  if (roleFromUser(user) !== "diretoria") redirect("/");

  return <DashboardShell userEmail={user.email ?? ""}>{children}</DashboardShell>;
}
