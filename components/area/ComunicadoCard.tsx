"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, Send, Trash2 } from "lucide-react";
import {
  toggleLike,
  addComentario,
  deleteOwnComentario,
} from "@/app/(site)/area/comunicados/actions";
import { COMENTARIO_BODY_MAX } from "@/lib/validation/comunicado";
import { formatRelative } from "@/lib/format-relative";
import { initials } from "@/lib/initials";
import type { ComunicadoFeedItem } from "@/lib/comunicados-feed";

/** Remetente fixo de todo comunicado (CLAUDE.md §16, decisão do cliente). */
const SENDER_NAME = "Diretoria Sindipro-SE";

/**
 * Um comunicado do feed (CLAUDE.md §16): autor fixo, texto, imagem opcional,
 * curtir e comentar.
 *
 * A inspiração em rede social é no COMPORTAMENTO, não no visual: o cartão
 * segue a identidade do site (cream/brand, Inter, cantos discretos). Os
 * avatares são só iniciais — não há foto de perfil.
 *
 * SEGURANÇA DE RENDERIZAÇÃO: corpo do post e comentários saem como
 * `{texto}` em JSX — o React escapa. Nenhum dangerouslySetInnerHTML nesta
 * árvore, e nada de markdown no comentário. É o que impede um comentário
 * de virar código na tela de outro associado.
 */
export function ComunicadoCard({
  item,
  viewerName,
}: {
  item: ComunicadoFeedItem;
  viewerName?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Se a imagem não carrega (arquivo removido do bucket, URL assinada
  // expirada, etc.), escondemos o <img> para não sobrar um bloco vazio no
  // lugar dela — o comunicado fica só com o texto.
  const [imagemOk, setImagemOk] = useState(true);

  // Estado otimista só do botão de curtir: o clique responde na hora e o
  // servidor confirma no refresh. Se falhar, voltamos ao valor real.
  const [curtido, setCurtido] = useState(item.likedByMe);
  const [curtidas, setCurtidas] = useState(item.likeCount);

  function onToggleLike() {
    const antesCurtido = curtido;
    const antesTotal = curtidas;
    setCurtido(!antesCurtido);
    setCurtidas(antesTotal + (antesCurtido ? -1 : 1));

    startTransition(async () => {
      const r = await toggleLike({ comunicadoId: item.id });
      if (!r.ok) {
        setCurtido(antesCurtido);
        setCurtidas(antesTotal);
        window.alert(r.error);
        return;
      }
      router.refresh();
    });
  }

  async function onSubmitComentario(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim().length === 0) return;
    setErro(null);
    setEnviando(true);

    const r = await addComentario({ comunicadoId: item.id, body: texto });
    setEnviando(false);

    if (!r.ok) {
      setErro(r.fieldErrors?.body ?? r.error);
      return;
    }
    setTexto("");
    router.refresh();
  }

  async function onDeleteComentario(id: string) {
    if (!window.confirm("Apagar seu comentário?")) return;
    const r = await deleteOwnComentario({ comentarioId: id });
    if (!r.ok) {
      window.alert(r.error);
      return;
    }
    router.refresh();
  }

  const restantes = COMENTARIO_BODY_MAX - texto.trim().length;

  return (
    <article className="overflow-hidden rounded-[28px] bg-white font-inter">
      <div className="p-6 md:p-8">
        {/* Cabeçalho: remetente fixo + data relativa */}
        <div className="flex items-center gap-3">
          <Avatar name={SENDER_NAME} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand">{SENDER_NAME}</p>
            {item.publishedAt && (
              <p className="text-xs text-black/45">{formatRelative(item.publishedAt)}</p>
            )}
          </div>
        </div>

        {item.title && (
          <h2 className="mt-4 text-xl font-bold tracking-tight text-brand md:text-2xl">
            {item.title}
          </h2>
        )}
        <p className="mt-2 whitespace-pre-wrap break-words text-base leading-relaxed text-black/80">
          {item.body}
        </p>
      </div>

      {item.hasImage && imagemOk && (
        // Rota autenticada que faz o stream do bucket privado — fora do
        // pipeline do next/image de propósito.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/area/comunicados/${item.id}/imagem`}
          alt={item.title ? `Imagem: ${item.title}` : "Imagem do comunicado"}
          onError={() => setImagemOk(false)}
          className="max-h-[28rem] w-full object-cover"
        />
      )}

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-2 border-t border-black/5 px-6 py-3 md:px-8">
        <button
          type="button"
          onClick={onToggleLike}
          disabled={pending}
          aria-pressed={curtido}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 ${
            curtido
              ? "bg-brand/10 text-brand"
              : "text-black/55 hover:bg-black/5 hover:text-black"
          }`}
        >
          <Heart
            className="h-4 w-4"
            aria-hidden="true"
            fill={curtido ? "currentColor" : "none"}
          />
          {curtidas === 0
            ? "Curtir"
            : `${curtidas} ${curtidas === 1 ? "curtida" : "curtidas"}`}
        </button>

        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black/55">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          {item.comentarios.length === 0
            ? "Sem comentários"
            : `${item.comentarios.length} ${item.comentarios.length === 1 ? "comentário" : "comentários"}`}
        </span>
      </div>

      {/* Comentários + campo sempre visível */}
      <div className="border-t border-black/5 bg-black/[0.015] px-6 py-5 md:px-8">
        {item.comentarios.length > 0 && (
          <ul className="mb-5 space-y-4">
            {item.comentarios.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <Avatar name={c.authorName} size="sm" />
                <div className="min-w-0 flex-1 rounded-2xl bg-white px-3.5 py-2.5">
                  <p className="text-sm font-semibold text-black">
                    {c.authorName}
                    <span className="ml-2 font-normal text-black/40">
                      {formatRelative(c.createdAt)}
                    </span>
                  </p>
                  {/* Texto puro, escapado pelo React. */}
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-black/75">
                    {c.body}
                  </p>
                </div>
                {c.isMine && (
                  <button
                    type="button"
                    onClick={() => onDeleteComentario(c.id)}
                    aria-label="Apagar meu comentário"
                    className="shrink-0 rounded-full p-1.5 text-black/40 transition hover:bg-black/5 hover:text-black"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={onSubmitComentario} noValidate>
          <div className="flex items-center gap-3">
            {viewerName && <Avatar name={viewerName} size="sm" />}
            <label htmlFor={`comentario-${item.id}`} className="sr-only">
              Seu comentário
            </label>
            <input
              id={`comentario-${item.id}`}
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={COMENTARIO_BODY_MAX}
              placeholder="Escreva um comentário…"
              className="h-11 min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 text-base text-black outline-none transition placeholder:text-black/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
            />
            <button
              type="submit"
              disabled={enviando || texto.trim().length === 0}
              aria-label="Publicar comentário"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 pl-1">
            {restantes < 200 && (
              <span className="text-xs text-black/45">
                {restantes} caracteres restantes
              </span>
            )}
            {erro && (
              <p
                role="alert"
                className="border-l-2 border-brand pl-2 text-sm font-medium text-black"
              >
                {erro}
              </p>
            )}
          </div>
        </form>
      </div>
    </article>
  );
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-brand font-semibold text-white ${cls}`}
    >
      {initials(name)}
    </span>
  );
}
