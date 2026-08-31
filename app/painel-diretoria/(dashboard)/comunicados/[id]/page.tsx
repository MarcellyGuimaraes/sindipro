import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ComunicadoForm } from "@/components/painel/ComunicadoForm";
import { ComentarioModeration } from "@/components/painel/ComentarioModeration";
import { listComentarios } from "@/lib/comunicados-admin";
import type { ComunicadoRow } from "@/lib/types";

/**
 * Edição de um comunicado + moderação dos comentários (CLAUDE.md §16).
 *
 * A leitura passa pela RLS da migration 0010 com a sessão da diretoria —
 * por isso alcança rascunho também. Quem não for diretoria nem chega aqui:
 * o layout do grupo (dashboard) redireciona antes.
 */
export default async function EditarComunicadoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const [{ data, error }, comentarios, { count: likeCount }] = await Promise.all([
    supabase.from("comunicados").select("*").eq("id", params.id).maybeSingle(),
    listComentarios(params.id),
    supabase
      .from("comunicado_likes")
      .select("id", { count: "exact", head: true })
      .eq("comunicado_id", params.id),
  ]);

  if (error || !data) notFound();
  const comunicado = data as ComunicadoRow;

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <Link
        href="/painel-diretoria/comunicados"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para os comunicados
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
          Editar comunicado
        </h1>
        <span className="inline-flex items-center gap-1.5 text-sm text-black/50">
          <Heart className="h-4 w-4" aria-hidden="true" />
          {likeCount ?? 0} {likeCount === 1 ? "curtida" : "curtidas"}
        </span>
      </div>

      <div className="mt-6">
        <ComunicadoForm initial={comunicado} />
      </div>

      <section className="mt-12 max-w-3xl" aria-labelledby="moderacao">
        <h2
          id="moderacao"
          className="font-inter text-xl font-bold tracking-tight text-brand"
        >
          Comentários
        </h2>
        <p className="mb-4 mt-1 text-sm text-black/55">
          {comentarios.length === 0
            ? "O mural é compartilhado: todo associado logado lê os comentários de todos."
            : `${comentarios.length} ${comentarios.length === 1 ? "comentário" : "comentários"}. O mural é compartilhado — todo associado logado lê os comentários de todos. A diretoria pode apagar qualquer um.`}
        </p>
        <ComentarioModeration comentarios={comentarios} />
      </section>
    </div>
  );
}
