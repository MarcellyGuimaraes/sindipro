import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/auth/role";
import { isMemberFileFolder } from "@/lib/member-files";
import type { MemberFileRow } from "@/lib/types";

/**
 * Busca um documento da área do associado por id e revalida TODAS as
 * permissões no servidor: sessão, papel, perfil ativo (associado) e se o
 * arquivo realmente pertence à pasta pedida na URL (evita pegar o id de um
 * documento e trocar a pasta na URL). Usado pela página de visualização E
 * pelo route handler que serve o PDF — nunca confie em nada vindo do client
 * além do id/pasta da própria URL, mesmo que pareçam coerentes.
 *
 * Retorna null pra QUALQUER falha (sem sessão, papel errado, inativo, pasta
 * errada, id inexistente) — de propósito indistinguível entre elas: quem
 * tentar adivinhar um id de outro documento recebe o mesmo "não encontrado"
 * de um id que nunca existiu. Isso, mais o id ser um UUID (não sequencial),
 * é a defesa contra IDOR aqui.
 */
export async function getAuthorizedMemberFile(
  pasta: string,
  id: string
): Promise<MemberFileRow | null> {
  if (!isMemberFileFolder(pasta)) return null;

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

  // RLS (migration 0007) já restringe o SELECT a quem tem permissão — esta
  // consulta é a segunda camada, explícita, da mesma regra.
  const { data: file, error } = await supabase
    .from("member_files")
    .select(
      "id, title, folder, description, storage_path, size_bytes, mime_type, uploaded_by, created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !file) return null;
  if (file.folder !== pasta) return null;

  return file as MemberFileRow;
}
