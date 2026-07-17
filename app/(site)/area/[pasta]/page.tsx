import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { isMemberFileFolder, memberFileFolderLabel } from "@/lib/member-files";
import { getMemberFilesInFolder } from "@/lib/member-files-data";

type Params = { pasta: string };

export function generateMetadata({ params }: { params: Params }): Metadata {
  if (!isMemberFileFolder(params.pasta)) return {};
  return { title: memberFileFolderLabel(params.pasta) };
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function AreaPastaPage({ params }: { params: Params }) {
  // Parâmetro de rota é texto livre na URL — valida contra a lista permitida
  // antes de tocar no banco. Fora da lista, 404 (não tenta consultar).
  if (!isMemberFileFolder(params.pasta)) notFound();

  const arquivos = await getMemberFilesInFolder(params.pasta);

  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-4xl px-2 pb-16 pt-8 md:pb-24 md:pt-12">
        <Link
          href="/area"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para a área do associado
        </Link>

        <PageHeader
          align="left"
          eyebrow="Área do associado"
          title={memberFileFolderLabel(params.pasta)}
          className="mt-4"
        />

        {arquivos.length === 0 ? (
          <div className="mt-10 rounded-[28px] bg-white p-10 text-center font-inter">
            <p className="text-base text-black/60">Nenhum documento nesta pasta ainda.</p>
          </div>
        ) : (
          <ul className="mt-10 overflow-hidden rounded-[28px] bg-white font-inter">
            {arquivos.map((a) => (
              <li key={a.id} className="border-b border-black/5 last:border-0">
                <Link
                  href={`/area/${params.pasta}/${a.id}`}
                  className="flex items-start gap-4 p-6 transition hover:bg-black/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
                >
                  <span
                    className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"
                    aria-hidden="true"
                  >
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-black">{a.title}</p>
                    {a.description && (
                      <p className="mt-1 text-sm leading-relaxed text-black/60">
                        {a.description}
                      </p>
                    )}
                    <p className="mt-1.5 text-sm text-black/40">{formatDate(a.created_at)}</p>
                  </div>
                  <ChevronRight
                    className="mt-2 h-4 w-4 shrink-0 text-black/30"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
