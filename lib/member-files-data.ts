import { createClient } from "@/lib/supabase/server";
import { MEMBER_FILE_FOLDERS } from "@/lib/member-files";
import type { MemberFileFolder, MemberFileRow } from "@/lib/types";

/**
 * Leitura da área do associado (/area). RLS (migration 0007) já garante que
 * só quem tem sessão + papel válido + perfil ativo enxerga essas linhas —
 * aqui é só a consulta.
 */

export type MemberFileSummary = Pick<
  MemberFileRow,
  "id" | "title" | "description" | "created_at"
>;

/** Arquivo recente com a pasta, para o bloco "Adicionados recentemente". */
export type RecentMemberFile = Pick<
  MemberFileRow,
  "id" | "title" | "folder" | "created_at"
>;

/** Quantidade de documentos por pasta, para o índice /area. */
export async function getMemberFileCounts(): Promise<Record<MemberFileFolder, number>> {
  const counts = Object.fromEntries(
    MEMBER_FILE_FOLDERS.map((f) => [f.value, 0])
  ) as Record<MemberFileFolder, number>;

  const supabase = await createClient();
  const { data } = await supabase.from("member_files").select("folder");
  (data ?? []).forEach((row) => {
    const folder = row.folder as MemberFileFolder;
    if (folder in counts) counts[folder]++;
  });

  return counts;
}

/** Arquivos mais recentes entre todas as pastas, para o /area. */
export async function getRecentMemberFiles(limit = 5): Promise<RecentMemberFile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("member_files")
    .select("id, title, folder, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as RecentMemberFile[];
}

/** Documentos de uma pasta (mais recente primeiro), para /area/[pasta]. */
export async function getMemberFilesInFolder(
  folder: MemberFileFolder
): Promise<MemberFileSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("member_files")
    .select("id, title, description, created_at")
    .eq("folder", folder)
    .order("created_at", { ascending: false });

  return (data ?? []) as MemberFileSummary[];
}
