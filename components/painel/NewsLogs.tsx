import { createClient } from "@/lib/supabase/server";
import type { PostLogAction, PostLogRow } from "@/lib/types";

/**
 * Histórico de auditoria de uma notícia (migration 0004): quem criou, editou,
 * publicou ou despublicou, e quando. Server Component — lê de post_logs (RLS
 * libera leitura só para a diretoria). Os registros são gravados por trigger no
 * banco, então refletem fielmente as ações, sem depender do painel.
 */

const ACTION_LABEL: Record<PostLogAction, string> = {
  created: "Criou o rascunho",
  updated: "Editou",
  published: "Publicou",
  unpublished: "Voltou para rascunho",
  deleted: "Excluiu",
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export async function NewsLogs({ newsId }: { newsId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("post_logs")
    .select("id, action, actor_email, created_at")
    .eq("news_id", newsId)
    .order("created_at", { ascending: false });

  const logs = (data ?? []) as Pick<
    PostLogRow,
    "id" | "action" | "actor_email" | "created_at"
  >[];

  if (logs.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl bg-white p-6 md:p-8">
      <h2 className="font-inter text-lg font-bold tracking-tight text-brand">
        Histórico
      </h2>
      <p className="mt-1 text-sm text-black/50">
        Registro automático de quem alterou esta notícia.
      </p>
      <ul className="mt-5 space-y-3">
        {logs.map((log) => (
          <li
            key={log.id}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-l-2 border-brand/20 pl-3 text-sm"
          >
            <span className="font-medium text-black">
              {ACTION_LABEL[log.action]}
            </span>
            <span className="text-black/60">
              {log.actor_email ?? "diretoria"}
            </span>
            <span className="text-black/45">·</span>
            <time dateTime={log.created_at} className="text-black/45">
              {formatDateTime(log.created_at)}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
