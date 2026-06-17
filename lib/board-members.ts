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
