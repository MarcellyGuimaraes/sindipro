"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, Trash2 } from "lucide-react";
import {
  toggleLike,
  addComentario,
  deleteOwnComentario,
} from "@/app/(site)/area/comunicados/actions";
import { COMENTARIO_BODY_MAX } from "@/lib/validation/comunicado";
import type { ComunicadoFeedItem } from "@/lib/comunicados-feed";

/**
 * Um comunicado do feed (CLAUDE.md §16): texto, imagem opcional, curtir e
 * comentar.
 *
 * A inspiração em rede social é no COMPORTAMENTO, não no visual: o cartão
 * segue a identidade do site (cream/brand, Inter, cantos discretos), sem
 * avatar redondo, sem contador animado, sem "stories".
 *
 * SEGURANÇA DE RENDERIZAÇÃO: corpo do post e comentários saem como
 * `{texto}` em JSX — o React escapa. Nenhum dangerouslySetInnerHTML nesta
 * árvore, e nada de markdown no comentário. É o que impede um comentário
 * de virar código na tela de outro associado.
 */
export function ComunicadoCard({ item }: { item: ComunicadoFeedItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [comentando, setComentando] = useState(false);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

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
    setErro(null);
    setEnviando(true);

    const r = await addComentario({ comunicadoId: item.id, body: texto });
    setEnviando(false);

    if (!r.ok) {
      setErro(r.fieldErrors?.body ?? r.error);
      return;
    }
    setTexto("");
    setComentando(false);
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
        {item.publishedAt && (
          <p className="text-sm text-black/45">{formatDate(item.publishedAt)}</p>
        )}
        {item.title && (
          <h2 className="mt-1 text-xl font-bold tracking-tight text-brand md:text-2xl">
            {item.title}
          </h2>
        )}
        <p className="mt-3 whitespace-pre-wrap break-words text-base leading-relaxed text-black/80">
          {item.body}
        </p>
      </div>

      {item.hasImage && (
        // Rota autenticada que faz o stream do bucket privado — fora do
        // pipeline do next/image de propósito.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/area/comunicados/${item.id}/imagem`}
          alt={item.title ? `Imagem: ${item.title}` : "Imagem do comunicado"}
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

        <button
          type="button"
          onClick={() => setComentando((v) => !v)}
          aria-expanded={comentando}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black/55 transition hover:bg-black/5 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          {item.comentarios.length === 0
            ? "Comentar"
            : `${item.comentarios.length} ${item.comentarios.length === 1 ? "comentário" : "comentários"}`}
        </button>
      </div>

      {/* Comentários */}
      {(item.comentarios.length > 0 || comentando) && (
        <div className="border-t border-black/5 bg-black/[0.015] px-6 py-5 md:px-8">
          {item.comentarios.length > 0 && (
            <ul className="space-y-4">
              {item.comentarios.map((c) => (
                <li key={c.id} className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-black">
                      {c.authorName}
                      <span className="ml-2 font-normal text-black/40">
                        {formatDateTime(c.createdAt)}
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

          {comentando && (
            <form
              onSubmit={onSubmitComentario}
              className={item.comentarios.length > 0 ? "mt-5" : ""}
              noValidate
            >
              <label htmlFor={`comentario-${item.id}`} className="sr-only">
                Seu comentário
              </label>
              <textarea
                id={`comentario-${item.id}`}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={3}
                maxLength={COMENTARIO_BODY_MAX}
                placeholder="Escreva seu comentário. Todos os associados vão ler."
                className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-base text-black outline-none transition placeholder:text-black/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
              />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={enviando || texto.trim().length === 0}
                  className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enviando ? "Publicando…" : "Publicar comentário"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComentando(false);
                    setTexto("");
                    setErro(null);
                  }}
                  className="text-sm font-medium text-black/55 transition hover:text-black"
                >
                  Cancelar
                </button>
                {restantes < 200 && (
                  <span className="text-sm text-black/45">
                    {restantes} caracteres restantes
                  </span>
                )}
              </div>
              {erro && (
                <p
                  role="alert"
                  className="mt-2 border-l-2 border-brand pl-2 text-sm font-medium text-black"
                >
                  {erro}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </article>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
