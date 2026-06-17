import { createClient } from "@/lib/supabase/server";
import { BOARD_GROUPS } from "@/lib/board";
import type { BoardGroup, BoardMemberRow } from "@/lib/types";

/**
 * Acesso de leitura ao quadro de diretoria (site público /sobre/diretoria).
 * Server Component. RLS libera SELECT para todos; ordenamos por display_order.
 */

export type BoardMemberPublic = {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
};

export type BoardSection = {
  group: BoardGroup;
  label: string;
  members: BoardMemberPublic[];
};

type Source = Pick<
  BoardMemberRow,
  "id" | "name" | "role" | "board_group" | "photo_url" | "display_order"
>;

/**
 * Seções na ordem oficial (Executiva, Titulares, Suplentes), cada uma com seus
 * membros já ordenados por display_order. Seções sem membros vêm vazias —
 * a página decide se as omite.
 */
export async function getBoardSections(): Promise<BoardSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_members")
    .select("id, name, role, board_group, photo_url, display_order")
    .order("display_order", { ascending: true });

  const rows = (error || !data ? [] : data) as Source[];

  return BOARD_GROUPS.map(({ value, label }) => ({
    group: value,
    label,
    members: rows
      .filter((m) => m.board_group === value)
      .map<BoardMemberPublic>((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        photoUrl: m.photo_url,
      })),
  }));
}

/** minúsculas, sem acento — para casar cargos de forma tolerante. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Texto do cargo que identifica a entrada da FOTO DO GRUPO no painel. */
export const GRUPO_ROLE = "Diretoria e Conselho Fiscal";

export type DiretoriaDestaque = {
  presidente: BoardMemberPublic | null;
  vice: BoardMemberPublic | null;
  grupo: BoardMemberPublic | null;
};

/**
 * Layout simplificado de /sobre/diretoria: Presidente, Vice-presidente e a
 * foto do grupo "Diretoria e Conselho Fiscal".
 * - presidente/vice: membros da Executiva por cargo (fallback: 1ª e 2ª ordem).
 * - grupo: membro cujo cargo é "Diretoria e Conselho Fiscal" (foto horizontal).
 */
export async function getDiretoriaDestaque(): Promise<DiretoriaDestaque> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_members")
    .select("id, name, role, board_group, photo_url, display_order")
    .order("display_order", { ascending: true });

  const rows = (error || !data ? [] : data) as Source[];
  const toPublic = (m: Source): BoardMemberPublic => ({
    id: m.id,
    name: m.name,
    role: m.role,
    photoUrl: m.photo_url,
  });

  const exec = rows.filter((m) => m.board_group === "executiva");
  const grupoRow = rows.find((m) => norm(m.role) === norm(GRUPO_ROLE));

  const presidente =
    exec.find((m) => norm(m.role).includes("presidente") && !norm(m.role).includes("vice")) ??
    exec[0] ??
    null;

  const vice =
    exec.find((m) => norm(m.role).includes("vice")) ??
    exec.filter((m) => m.id !== presidente?.id)[0] ??
    null;

  return {
    presidente: presidente ? toPublic(presidente) : null,
    vice: vice && vice.id !== presidente?.id ? toPublic(vice) : null,
    grupo: grupoRow ? toPublic(grupoRow) : null,
  };
}
