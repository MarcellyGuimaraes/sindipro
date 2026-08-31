import { createClient } from "@/lib/supabase/server";
import type { ComunicadoRow } from "@/lib/types";

/**
 * Leitura dos comunicados para o PAINEL (CLAUDE.md §16).
 *
 * A RLS da migration 0010 já restringe estas consultas a quem tem papel
 * válido — a diretoria enxerga rascunho e publicado. Aqui é só a consulta;
 * a autorização de verdade está no layout do painel, nas Server Actions e
 * na RLS, nunca nesta camada.
 */

export type ComunicadoListItem = Pick<
  ComunicadoRow,
  "id" | "title" | "body" | "image_path" | "status" | "published_at" | "created_at"
> & {
  likeCount: number;
  commentCount: number;
};

/** Comentário com o nome de quem escreveu, para a tela de moderação. */
export type ComunicadoCommentItem = {
  id: string;
  body: string;
  created_at: string;
  userId: string;
  authorName: string;
};

/**
 * Todos os comunicados, mais recente primeiro (rascunho junto — é o painel).
 *
 * Ordena por created_at e não por published_at: rascunho tem published_at
 * nulo e sumiria do topo da lista justamente quando ainda está em edição.
 */
export async function listComunicadosForPanel(): Promise<{
  comunicados: ComunicadoListItem[];
  error: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comunicados")
    .select(
      "id, title, body, image_path, status, published_at, created_at, comunicado_likes(count), comunicado_comments(count)"
    )
    .order("created_at", { ascending: false });

  if (error) return { comunicados: [], error: true };

  type Aggregated = Omit<ComunicadoListItem, "likeCount" | "commentCount"> & {
    comunicado_likes: { count: number }[];
    comunicado_comments: { count: number }[];
  };

  const comunicados = ((data ?? []) as unknown as Aggregated[]).map<ComunicadoListItem>(
    ({ comunicado_likes, comunicado_comments, ...c }) => ({
      ...c,
      likeCount: comunicado_likes?.[0]?.count ?? 0,
      commentCount: comunicado_comments?.[0]?.count ?? 0,
    })
  );

  return { comunicados, error: false };
}

/**
 * Comentários de um comunicado, do mais antigo para o mais novo (ordem de
 * leitura de uma conversa), para a moderação.
 *
 * O nome vem de `profiles` por FK. Comentário da própria diretoria não tem
 * linha em profiles (só associado tem) — nesse caso o join volta nulo e
 * mostramos um rótulo genérico em vez de vazar o e-mail de ninguém.
 */
export async function listComentarios(
  comunicadoId: string
): Promise<ComunicadoCommentItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comunicado_comments")
    .select("id, body, created_at, user_id")
    .eq("comunicado_id", comunicadoId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) console.error(`[comunicados] falha ao ler comentários: ${error.message}`);
    return [];
  }

  type Row = { id: string; body: string; created_at: string; user_id: string };
  const rows = data as Row[];

  // Aqui a consulta direta a `profiles` funciona porque quem chega nesta
  // função é a diretoria, e a RLS (migration 0006) libera todos os perfis
  // para ela. No FEED do associado é diferente — lá o nome vem da função
  // member_names() (ver lib/comunicados-feed.ts).
  const nomes = new Map<string, string>();
  const ids = Array.from(new Set(rows.map((c) => c.user_id)));
  if (ids.length > 0) {
    const { data: perfis } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    for (const p of (perfis ?? []) as { id: string; full_name: string }[]) {
      nomes.set(p.id, p.full_name);
    }
  }

  return rows.map<ComunicadoCommentItem>((c) => ({
    id: c.id,
    body: c.body,
    created_at: c.created_at,
    userId: c.user_id,
    authorName: nomes.get(c.user_id) ?? "Equipe do sindicato",
  }));
}
