"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteComentario } from "@/app/painel-diretoria/(dashboard)/comunicados/actions";
import type { ComunicadoCommentItem } from "@/lib/comunicados-admin";

/**
 * Moderação dos comentários de um comunicado (CLAUDE.md §16): a diretoria
 * lê todos e pode apagar qualquer um.
 *
 * O corpo é renderizado como TEXTO PURO — `{c.body}` em JSX, que o React
 * escapa. Nada de dangerouslySetInnerHTML nem markdown aqui: é o que fecha
 * o XSS por comentário, e o comentário é o único texto do sistema escrito
 * por alguém de fora da diretoria.
 */
export function ComentarioModeration({
  comentarios,
}: {
  comentarios: ComunicadoCommentItem[];
}) {
  if (comentarios.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-black/60">
        Nenhum comentário neste comunicado ainda.
      </p>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl bg-white">
      {comentarios.map((c) => (
        <ComentarioRow key={c.id} comentario={c} />
      ))}
    </ul>
  );
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function ComentarioRow({ comentario }: { comentario: ComunicadoCommentItem }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    if (
      !window.confirm(
        `Apagar o comentário de ${comentario.authorName}? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setDeleting(true);
    const result = await deleteComentario({ comentarioId: comentario.id });
    setDeleting(false);

    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <li className="flex flex-col gap-2 border-b border-black/5 px-5 py-4 last:border-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-black">
          {comentario.authorName}
          <span className="ml-2 font-normal text-black/45">
            {formatDateTime(comentario.created_at)}
          </span>
        </p>
        {/* Texto puro, escapado pelo React — nunca HTML. */}
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-black/75">
          {comentario.body}
        </p>
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-sm font-medium text-black/55 transition hover:bg-black/5 hover:text-black disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Apagar
      </button>
    </li>
  );
}
