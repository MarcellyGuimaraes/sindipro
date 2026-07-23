import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteNewsButton } from "@/components/painel/DeleteNewsButton";
import { PanelHeading } from "@/components/painel/PanelHeading";
import type { NewsRow } from "@/lib/types";

/** Lista de notícias do painel (rascunhos + publicadas) — visual Lovable. */
export default async function NoticiasAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("id, title, slug, status, published_at, created_at")
    .order("created_at", { ascending: false });

  const news = (data ?? []) as Pick<
    NewsRow,
    "id" | "title" | "slug" | "status" | "published_at" | "created_at"
  >[];

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelHeading
          title="Notícias"
          subtitle={`${news.length} ${news.length === 1 ? "notícia" : "notícias"}.`}
        />
        <Link
          href="/admin/noticias/nova"
          className="group inline-flex items-center gap-2.5 rounded-full bg-brand py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
        >
          Nova notícia
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {error ? (
        <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-black ring-1 ring-brand/20">
          Não foi possível carregar as notícias. Verifique se a tabela{" "}
          <code>news</code> foi criada (migration §14).
        </p>
      ) : news.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center">
          <p className="text-base text-black/70">Nenhuma notícia ainda.</p>
          <Link
            href="/admin/noticias/nova"
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Criar a primeira →
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-black/10 text-[11px] uppercase tracking-[0.08em] text-black/45">
                <th className="px-5 py-3.5 font-semibold">Título</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Data</th>
                <th className="px-5 py-3.5 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {news.map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-black/5 align-middle last:border-0"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-black">{n.title}</span>
                    <span className="block text-sm text-black/45">/{n.slug}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={n.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-black/60">
                    {formatDate(n.published_at ?? n.created_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/noticias/${n.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/5"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Editar
                      </Link>
                      <DeleteNewsButton id={n.id} title={n.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  if (status === "published") {
    return (
      <span className="inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
        Publicado
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-black/55">
      Rascunho
    </span>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}
