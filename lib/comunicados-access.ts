import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { roleFromUser, type AppRole } from "@/lib/auth/role";
import type { ComunicadoRow } from "@/lib/types";

/**
 * Autorização do feed de comunicados (CLAUDE.md §16).
 *
 * Mesma disciplina de member-files-access.ts: TODA checagem acontece no
 * servidor, antes de qualquer acesso a arquivo. A RLS da migration 0010 é a
 * segunda tranca — nunca a única, e nunca substituída por "a UI não mostra".
 */

export type MemberAccess = {
  userId: string;
  role: AppRole;
  isDirector: boolean;
};

/**
 * Sessão + papel + perfil ativo. Retorna null para qualquer falha, sem
 * distinguir o motivo — quem sondar recebe sempre a mesma resposta.
 *
 * O associado precisa de profiles.status = 'ativo'; a diretoria não tem
 * perfil em `profiles` e por isso não passa por essa checagem.
 */
export async function getMemberAccess(): Promise<MemberAccess | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const role = roleFromUser(user);
  if (role !== "associado" && role !== "diretoria") return null;

  if (role === "associado") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.status !== "ativo") return null;
  }

  return { userId: user.id, role, isDirector: role === "diretoria" };
}

/**
 * Busca um comunicado por id revalidando o acesso. Associado só alcança
 * post 'publicado'; a diretoria alcança rascunho também (é ela que edita).
 *
 * Retorna null para sessão inválida, papel errado, perfil inativo, id
 * inexistente E rascunho pedido por associado — indistinguíveis de
 * propósito: é o que impede descobrir a existência de um rascunho por
 * tentativa de id.
 */
export async function getAuthorizedComunicado(
  id: string
): Promise<ComunicadoRow | null> {
  const access = await getMemberAccess();
  if (!access) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comunicados")
    .select(
      "id, title, body, image_path, author_id, status, published_at, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const comunicado = data as ComunicadoRow;
  if (!access.isDirector && comunicado.status !== "publicado") return null;

  return comunicado;
}

/** Validade da URL assinada, em segundos. Curta de propósito (§15/§16). */
const SIGNED_URL_TTL_SECONDS = 60;

/**
 * URL assinada da imagem de um comunicado — SEMPRE no servidor, nunca no
 * client (gerar no client exigiria expor a chave secreta).
 *
 * A ordem importa: `getAuthorizedComunicado` valida sessão, papel, perfil
 * ativo e visibilidade do post ANTES de a chave secreta tocar no Storage.
 * O retorno é para consumo interno do route handler, que serve os bytes —
 * esta URL não deve ser devolvida ao navegador nem gravada em log (§15:
 * nunca logar URL assinada).
 */
export async function createComunicadoImageSignedUrl(
  comunicadoId: string
): Promise<string | null> {
  const comunicado = await getAuthorizedComunicado(comunicadoId);
  if (!comunicado?.image_path) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("comunicado-images")
    .createSignedUrl(comunicado.image_path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return null;
  return data.signedUrl;
}
