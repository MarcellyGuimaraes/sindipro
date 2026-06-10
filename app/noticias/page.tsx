import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";
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
    <main>
      <Section tone="bg">
        <SectionHeading eyebrow="Notícias" title="Notícias e comunicados" as="h1" />
        <p className="mt-6 max-w-2xl text-body text-navy-900/85">
          Acompanhe a atuação do Sindipro SE: negociações coletivas, pautas
          regulatórias, eventos e orientações para os provedores de Sergipe.
        </p>
        <p className="mt-4 max-w-2xl text-small text-navy-900/80">
          {/* visível enquanto o conteúdo é mockado */}
          Conteúdo em preparação — notícias de exemplo. (TODO)
        </p>
      </Section>

      <Section tone="bg" className="pt-0">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n, i) => {
            // Na 1ª página, a primeira notícia vira destaque editorial (assimetria).
            const isFeature = current === 1 && i === 0;
            return (
              <li
                key={n.slug}
                className={isFeature ? "sm:col-span-2 lg:col-span-2" : ""}
              >
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
      </Section>
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
    "inline-flex h-10 items-center gap-1.5 rounded border px-4 text-small font-medium transition-colors";

  return (
    <nav
      aria-label="Paginação de notícias"
      className="mt-12 flex items-center justify-between border-t border-blue-200 pt-6"
    >
      {hasPrev ? (
        <Link
          href={prevHref}
          aria-label="Página anterior"
          className={`${base} border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-surface`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </Link>
      ) : (
        <span
          className={`${base} border-blue-200 text-navy-900/40`}
          aria-disabled="true"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </span>
      )}

      <span className="text-small text-navy-900/80">
        Página {current} de {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={nextHref}
          aria-label="Próxima página"
          className={`${base} border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-surface`}
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span
          className={`${base} border-blue-200 text-navy-900/40`}
          aria-disabled="true"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
