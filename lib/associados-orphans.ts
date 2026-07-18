import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Usuário com papel 'associado' no Auth (app_metadata) sem linha
 * correspondente em `profiles` — sobra de uma criação que falhou no meio
 * (Auth criou a conta, mas o insert em profiles não foi salvo e o rollback
 * também não completou). CLAUDE.md §15.
 */
export type OrphanedAssociado = {
  id: string;
  email: string | null;
  createdAt: string;
};

/** Lista todos os usuários do Auth com app_metadata.role === 'associado'. */
async function listAssociadoAuthUsers(
  admin: ReturnType<typeof createAdminClient>
): Promise<OrphanedAssociado[]> {
  const perPage = 200;
  const out: OrphanedAssociado[] = [];

  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data) break;

    for (const u of data.users) {
      const role = (u.app_metadata as { role?: string } | null)?.role;
      if (role === "associado") {
        out.push({ id: u.id, email: u.email ?? null, createdAt: u.created_at });
      }
    }

    if (data.users.length < perPage) break;
  }

  return out;
}

/**
 * Contas de associado que existem no Auth mas não têm perfil em `profiles`.
 * Usada para avisar a diretoria na listagem de associados e oferecer a
 * criação manual do perfil faltante.
 */
export async function listOrphanedAssociados(): Promise<OrphanedAssociado[]> {
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: profiles }, associadoUsers] = await Promise.all([
    supabase.from("profiles").select("id"),
    listAssociadoAuthUsers(admin),
  ]);

  const profileIds = new Set((profiles ?? []).map((p) => p.id as string));
  return associadoUsers.filter((u) => !profileIds.has(u.id));
}
