"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  setComunicadoStatus,
  deleteComunicado,
} from "@/app/painel-diretoria/(dashboard)/comunicados/actions";

/**
 * Publicar/despublicar e excluir um comunicado, direto da listagem.
 *
 * Despublicar é a moderação rápida do §16: o post sai do feed do associado
 * na hora, sem apagar o texto nem as curtidas/comentários já existentes.
 * Excluir é destrutivo e leva tudo junto (cascade) — por isso confirma e
 * avisa o que vai embora.
 */
export function ComunicadoRowActions({
  id,
  status,
  commentCount,
  likeCount,
}: {
  id: string;
  status: "rascunho" | "publicado";
  commentCount: number;
  likeCount: number;
}) {
  const router = useRouter();
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onToggleStatus() {
    const next = status === "publicado" ? "rascunho" : "publicado";
    if (
      next === "rascunho" &&
      !window.confirm(
        "Despublicar este comunicado? Ele sai do feed dos associados imediatamente. As curtidas e os comentários são mantidos."
      )
    ) {
      return;
    }

    setStatusSaving(true);
    const result = await setComunicadoStatus({ id, status: next });
    setStatusSaving(false);

    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  async function onDelete() {
    const extras = [
      likeCount > 0 ? `${likeCount} ${likeCount === 1 ? "curtida" : "curtidas"}` : null,
      commentCount > 0
        ? `${commentCount} ${commentCount === 1 ? "comentário" : "comentários"}`
        : null,
    ].filter(Boolean);

    const warning = extras.length
      ? `\n\nVai apagar junto: ${extras.join(" e ")}.`
      : "";

    if (
      !window.confirm(
        `Excluir este comunicado? Esta ação não pode ser desfeita.${warning}`
      )
    ) {
      return;
    }

    setDeleting(true);
    const result = await deleteComunicado({ comunicadoId: id });
    setDeleting(false);

    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onToggleStatus}
        disabled={statusSaving}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
          status === "publicado"
            ? "text-black/55 hover:bg-black/5 hover:text-black"
            : "bg-brand/10 text-brand hover:bg-brand/15"
        }`}
      >
        {status === "publicado" ? "Despublicar" : "Publicar"}
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-black/55 transition hover:bg-black/5 hover:text-black disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Excluir
      </button>
    </div>
  );
}
