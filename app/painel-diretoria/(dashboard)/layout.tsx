import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/painel/DashboardShell";

/**
 * Layout das rotas autenticadas do painel (grupo "(dashboard)").
 * O login fica FORA deste grupo, então não recebe o shell.
 *
 * Defesa em profundidade: além do middleware, revalida a sessão aqui.
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

  if (!user) redirect("/admin/login");

  return <DashboardShell userEmail={user.email ?? ""}>{children}</DashboardShell>;
}
