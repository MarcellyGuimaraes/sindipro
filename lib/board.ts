import type { BoardGroup } from "@/lib/types";

/** Rótulos e ordem de exibição dos grupos do quadro de diretoria. */
export const BOARD_GROUPS: { value: BoardGroup; label: string }[] = [
  { value: "executiva", label: "Diretoria Executiva" },
  { value: "conselho_titular", label: "Conselho Fiscal — Titulares" },
  { value: "conselho_suplente", label: "Conselho Fiscal — Suplentes" },
];

export function boardGroupLabel(group: BoardGroup): string {
  return BOARD_GROUPS.find((g) => g.value === group)?.label ?? group;
}

/** Cargos da Diretoria Executiva (sugestão no formulário). */
export const EXECUTIVA_ROLES = [
  "Presidente",
  "Vice-presidente",
  "Secretário-geral",
  "Suplente de secretário",
  "Tesoureiro",
  "Suplente de tesoureiro",
];

/** Cargo padrão por grupo. */
export function defaultRole(group: BoardGroup): string {
  if (group === "conselho_titular") return "Conselheiro fiscal titular";
  if (group === "conselho_suplente") return "Conselheiro fiscal suplente";
  return "";
}
