import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { NewsCard } from "@/components/NewsCard";
import { getPagina } from "@/lib/noticias";

export const metadata: Metadata = {
  title: "Notícias",
  description:
    "Notícias e comunicados do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default function NoticiasPage({
  searchParams,
}: {
  searchParams: { page?: string | string[] };
}) {
  const { items, current, totalPages } = getPagina(parsePage(searchParams.page));

  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 py-16 md:py-24">
        <PageHeader
          eyebrow="Notícias"
          title={
            <>
              Notícias e
              <br /> comunicados.
            </>
          }
          lead="Acompanhe a atuação do Sindipro SE: negociações coletivas, pautas regulatórias, eventos e orientações para os provedores de Sergipe."
        />
        <p className="mt-4 text-center font-inter text-xs text-black/40">
          {/* visível enquanto o conteúdo é mockado */}
          Conteúdo em preparação — notícias de exemplo. (TODO)
        </p>

        <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((n, i) => {
            // Na 1ª página, a primeira notícia vira destaque (assimetria).
            const isFeature = current === 1 && i === 0;
            return (
              <li key={n.slug} className={isFeature ? "md:col-span-2" : ""}>
                <NewsCard
                  href={`/noticias/${n.slug}`}
                  date={n.date}
                  title={n.title}
                  summary={n.summary}
                  image={n.image}
                  imageAlt={n.imageAlt}
                  feature={isFeature}
                />
              </li>
            );
          })}
        </ul>

        {totalPages > 1 && (
          <Pagination current={current} totalPages={totalPages} />
        )}
      </div>
    </main>
  );
}

function Pagination({
  current,
  totalPages,
}: {
  current: number;
  totalPages: number;
}) {
  const prevHref = current - 1 <= 1 ? "/noticias" : `/noticias?page=${current - 1}`;
  const nextHref = `/noticias?page=${current + 1}`;
  const hasPrev = current > 1;
  const hasNext = current < totalPages;

  const base =
    "inline-flex h-10 items-center gap-1.5 rounded-full px-4 font-inter text-sm font-medium transition";

  return (
    <nav
      aria-label="Paginação de notícias"
      className="mt-12 flex items-center justify-between"
    >
      {hasPrev ? (
        <Link
          href={prevHref}
          aria-label="Página anterior"
          className={`${base} bg-white text-black shadow-sm hover:bg-white/80`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </Link>
      ) : (
        <span className={`${base} bg-black/5 text-black/35`} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </span>
      )}

      <span className="font-inter text-sm text-black/60">
        Página {current} de {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={nextHref}
          aria-label="Próxima página"
          className={`${base} bg-white text-black shadow-sm hover:bg-white/80`}
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={`${base} bg-black/5 text-black/35`} aria-disabled="true">
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
