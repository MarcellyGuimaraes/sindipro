import { createClient } from "@/lib/supabase/server";
import { getMemberAccess } from "@/lib/comunicados-access";

/**
 * Leitura do feed de comunicados para a ÁREA DO ASSOCIADO (CLAUDE.md §16).
 *
 * A RLS da migration 0010 já entrega só o que a pessoa pode ver — associado
 * ativo enxerga apenas 'publicado'. Filtramos por status assim mesmo: a
 * diretoria também abre esta tela e não deve ver rascunho no meio do feed.
 *
 * POR QUE SÃO TRÊS CONSULTAS, E NÃO UM SELECT ANINHADO SÓ
 * O caminho óbvio seria `comunicado_comments(..., profiles(full_name))`.
 * Não funciona: `comunicado_comments.user_id` aponta para auth.users, e
 * `profiles.id` também — não há FK DIRETA entre as duas, então o PostgREST
 * recusa o embed com PGRST200 e a consulta inteira volta 400.
 *
 * O nome vem da função member_names() (migration 0011), que devolve só
 * id + nome e só para quem tem acesso à área restrita — a RLS de `profiles`
 * continua fechada para o associado.
 */

export type ComentarioPublico = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  /** Se o comentário é de quem está lendo — habilita o "apagar". */
  isMine: boolean;
};

export type ComunicadoFeedItem = {
  id: string;
  title: string | null;
  body: string;
  hasImage: boolean;
  publishedAt: string | null;
  likeCount: number;
  likedByMe: boolean;
  comentarios: ComentarioPublico[];
};

export type Feed = {
  items: ComunicadoFeedItem[];
  /** Null quando a sessão não é válida — a página manda entrar de novo. */
  viewerId: string | null;
  /**
   * True quando a leitura falhou de verdade (erro de consulta), para a tela
   * poder dizer "deu problema" em vez de "não há comunicados". Feed vazio e
   * feed quebrado NÃO podem parecer a mesma coisa.
   */
  failed: boolean;
};

export async function getComunicadosFeed(): Promise<Feed> {
  const access = await getMemberAccess();
  if (!access) return { items: [], viewerId: null, failed: false };

  const supabase = await createClient();

  const [{ data: posts, error: postsError }, { data: myLikes }] = await Promise.all([
    supabase
      .from("comunicados")
      .select("id, title, body, image_path, published_at, comunicado_likes(count)")
      .eq("status", "publicado")
      .order("published_at", { ascending: false }),
    supabase
      .from("comunicado_likes")
      .select("comunicado_id")
      .eq("user_id", access.userId),
  ]);

  if (postsError) {
    console.error(`[comunicados] falha ao ler o feed: ${postsError.message}`);
    return { items: [], viewerId: access.userId, failed: true };
  }

  type PostRow = {
    id: string;
    title: string | null;
    body: string;
    image_path: string | null;
    published_at: string | null;
    comunicado_likes: { count: number }[];
  };
  const postRows = (posts ?? []) as unknown as PostRow[];

  const liked = new Set(
    ((myLikes ?? []) as { comunicado_id: string }[]).map((l) => l.comunicado_id)
  );

  const comentariosPorPost = await getComentarios(
    supabase,
    postRows.map((p) => p.id),
    access.userId
  );

  const items = postRows.map<ComunicadoFeedItem>((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    hasImage: Boolean(p.image_path),
    publishedAt: p.published_at,
    likeCount: p.comunicado_likes?.[0]?.count ?? 0,
    likedByMe: liked.has(p.id),
    comentarios: comentariosPorPost.get(p.id) ?? [],
  }));

  return { items, viewerId: access.userId, failed: false };
}

/** Comentários de vários posts de uma vez, já com o nome do autor. */
async function getComentarios(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postIds: string[],
  viewerId: string
): Promise<Map<string, ComentarioPublico[]>> {
  const out = new Map<string, ComentarioPublico[]>();
  if (postIds.length === 0) return out;

  const { data, error } = await supabase
    .from("comunicado_comments")
    .select("id, comunicado_id, body, created_at, user_id")
    .in("comunicado_id", postIds)
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) console.error(`[comunicados] falha ao ler comentários: ${error.message}`);
    return out;
  }

  type Row = {
    id: string;
    comunicado_id: string;
    body: string;
    created_at: string;
    user_id: string;
  };
  const rows = data as Row[];

  const nomes = await resolveNames(supabase, rows.map((c) => c.user_id));

  for (const c of rows) {
    const lista = out.get(c.comunicado_id) ?? [];
    lista.push({
      id: c.id,
      body: c.body,
      createdAt: c.created_at,
      // Sem nome = conta da diretoria (não tem linha em `profiles`).
      // Rótulo genérico em vez de vazio ou e-mail (LGPD, §15).
      authorName: nomes.get(c.user_id) ?? "Equipe do sindicato",
      isMine: c.user_id === viewerId,
    });
    out.set(c.comunicado_id, lista);
  }

  return out;
}

/** id -> nome, via member_names() (migration 0011). */
export async function resolveNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[]
): Promise<Map<string, string>> {
  const nomes = new Map<string, string>();
  const unicos = Array.from(new Set(userIds));
  if (unicos.length === 0) return nomes;

  const { data, error } = await supabase.rpc("member_names", { ids: unicos });

  if (error || !data) {
    // Degrada com elegância: sem nome, o comentário ainda aparece com o
    // rótulo genérico — melhor do que a tela inteira sumir.
    if (error) console.error(`[comunicados] member_names indisponível: ${error.message}`);
    return nomes;
  }

  for (const p of data as { id: string; full_name: string }[]) {
    nomes.set(p.id, p.full_name);
  }
  return nomes;
}
