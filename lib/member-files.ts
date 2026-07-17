import type { MemberFileFolder } from "@/lib/types";

/** Rótulos e ordem de exibição das pastas da área do associado. */
export const MEMBER_FILE_FOLDERS: { value: MemberFileFolder; label: string }[] = [
  { value: "arquivos", label: "Arquivos" },
  { value: "atas", label: "Atas" },
  { value: "editais", label: "Editais" },
  { value: "comunicados", label: "Comunicados" },
];

export function memberFileFolderLabel(folder: MemberFileFolder): string {
  return MEMBER_FILE_FOLDERS.find((f) => f.value === folder)?.label ?? folder;
}

/** Só as 4 pastas previstas (CLAUDE.md §15) — qualquer outra coisa é inválida. */
export function isMemberFileFolder(value: string): value is MemberFileFolder {
  return MEMBER_FILE_FOLDERS.some((f) => f.value === value);
}
