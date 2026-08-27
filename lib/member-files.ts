import type { MemberFileFolder } from "@/lib/types";

/**
 * Rótulos e ordem de exibição das pastas de PDF da área do associado.
 *
 * "Comunicados" NÃO está aqui de propósito (CLAUDE.md §16): deixou de ser
 * pasta de arquivo e virou feed de posts com curtida e comentário. A tela
 * dele é separada.
 */
export const MEMBER_FILE_FOLDERS: { value: MemberFileFolder; label: string }[] = [
  { value: "arquivos", label: "Arquivos" },
  { value: "atas", label: "Atas" },
  { value: "editais", label: "Editais" },
];

export function memberFileFolderLabel(folder: MemberFileFolder): string {
  return MEMBER_FILE_FOLDERS.find((f) => f.value === folder)?.label ?? folder;
}

/** Só as 3 pastas previstas (CLAUDE.md §16) — qualquer outra coisa é inválida. */
export function isMemberFileFolder(value: string): value is MemberFileFolder {
  return MEMBER_FILE_FOLDERS.some((f) => f.value === value);
}
