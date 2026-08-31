import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAuthorizedMemberFile } from "@/lib/member-files-access";
import { memberFileFolderLabel } from "@/lib/member-files";

type Params = { pasta: string; id: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const file = await getAuthorizedMemberFile(params.pasta, params.id);
  return { title: file?.title ?? "Documento" };
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Abre o PDF NA TELA (iframe apontando para a rota /pdf, que faz o stream
 * autenticado — o navegador nunca recebe uma URL assinada do Supabase).
 * "Abrir em nova aba" fica sempre visível como alternativa: em vez de tentar
 * detectar por JS se o navegador vai renderizar o PDF inline (frágil,
 * principalmente em mobile/webviews), oferecemos o link o tempo todo.
 */
export default async function AreaDocumentoPage({ params }: { params: Params }) {
  const file = await getAuthorizedMemberFile(params.pasta, params.id);
  if (!file) notFound();

  const pdfHref = `/area/${file.folder}/${file.id}/pdf`;

  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-4xl px-2 pb-16 pt-8 md:pb-24 md:pt-12">
        <Link
          href={`/area/${file.folder}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para {memberFileFolderLabel(file.folder)}
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-black/50">
              {memberFileFolderLabel(file.folder)}
            </p>
            <h1 className="mt-1 font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
              {file.title}
            </h1>
            {file.description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/60">
                {file.description}
              </p>
            )}
            <p className="mt-2 text-sm text-black/40">{formatDate(file.created_at)}</p>
          </div>

          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand shadow-sm transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Abrir em nova aba
          </a>
        </div>

        <div className="mt-6 overflow-hidden rounded-[20px] bg-white">
          <iframe
            src={pdfHref}
            title={file.title}
            className="h-[75vh] w-full md:h-[80vh]"
          />
        </div>
        <p className="mt-3 text-sm text-black/45">
          Não conseguiu ver o documento acima? Use "Abrir em nova aba".
        </p>
      </div>
    </main>
  );
}
