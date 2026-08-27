import Link from "next/link";
import { Plus, Pencil, Heart, MessageSquare, ImageIcon } from "lucide-react";
import { PanelHeading } from "@/components/painel/PanelHeading";
import { ComunicadoRowActions } from "@/components/painel/ComunicadoRowActions";
import { listComunicadosForPanel } from "@/lib/comunicados-admin";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

/** Primeira linha do corpo, para identificar um comunicado sem título. */
function resumo(body: string): string {
  const clean = body.trim().replace(/\s+/g, " ");
  return clean.length > 110 ? `${clean.slice(0, 110)}…` : clean;
}

/** Lista dos comunicados do feed (CLAUDE.md §16), mais recente primeiro. */
export default async function ComunicadosAdminPage() {
  const { comunicados, error } = await listComunicadosForPanel();

  const publicados = comunicados.filter((c) => c.status === "publicado").length;

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelHeading
          title="Comunicados"
          subtitle={`${comunicados.length} ${comunicados.length === 1 ? "comunicado" : "comunicados"} · ${publicados} no feed dos associados.`}
        />
        <Link
          href="/painel-diretoria/comunicados/novo"
          className="group inline-flex items-center gap-2.5 rounded-full bg-brand py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
        >
          Novo comunicado
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {error ? (
        <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-black ring-1 ring-brand/20">
          Não foi possível carregar os comunicados. Verifique se as tabelas do
          feed foram criadas (migration 0010).
        </p>
      ) : comunicados.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center">
          <p className="text-base text-black/70">Nenhum comunicado publicado ainda.</p>
          <Link
            href="/painel-diretoria/comunicados/novo"
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Escrever o primeiro →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 overflow-hidden rounded-2xl bg-white">
          {comunicados.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 border-b border-black/5 px-4 py-4 last:border-0 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="min-w-0 sm:flex-1">
                <span className="flex items-center gap-2">
                  {c.image_path && (
                    <ImageIcon
                      className="h-4 w-4 shrink-0 text-black/35"
                      aria-label="Com imagem"
                    />
                  )}
                  <span className="truncate font-medium text-black">
                    {c.title ?? resumo(c.body)}
                  </span>
                </span>

                {c.title && (
                  <span className="mt-0.5 block truncate text-sm text-black/55">
                    {resumo(c.body)}
                  </span>
                )}

                <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-black/45">
                  <span>
                    {c.status === "publicado" && c.published_at
                      ? `Publicado em ${formatDate(c.published_at)}`
                      : `Criado em ${formatDate(c.created_at)}`}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                    {c.likeCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    {c.commentCount}
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                    c.status === "publicado"
                      ? "bg-brand text-white"
                      : "bg-black/5 text-black/50"
                  }`}
                >
                  {c.status === "publicado" ? "Publicado" : "Rascunho"}
                </span>

                <Link
                  href={`/painel-diretoria/comunicados/${c.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/5"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Editar
                </Link>

                <ComunicadoRowActions
                  id={c.id}
                  status={c.status}
                  likeCount={c.likeCount}
                  commentCount={c.commentCount}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
