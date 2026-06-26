import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FileCard } from "@/components/FileCard";
import { getArquivosAgrupados } from "@/lib/files";

export const metadata: Metadata = {
  title: "Arquivos",
  description:
    "Convenções Coletivas (CCT) e Acordos Coletivos (ACT) do setor de provedores de internet de Sergipe, disponíveis para download.",
};

/**
 * Arquivos públicos para download (CCT/ACT/outros), agrupados por tipo e
 * mais recente primeiro. Lê da tabela `files` do Supabase (Server Component);
 * o botão "Baixar" aponta para a URL pública do bucket `downloads`.
 */

export default async function ArquivosPage() {
  const grupos = await getArquivosAgrupados();

  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 py-16 md:py-24">
        <PageHeader
          title={
            <>
              Convenções e acordos
              <br /> para download.
            </>
          }
          lead="Acesse as Convenções Coletivas de Trabalho (CCT) e os Acordos Coletivos (ACT) que regem a categoria. Os documentos estão em PDF."
        />

        {grupos.length === 0 ? (
          <p className="mt-12 text-center font-inter text-sm text-black/50">
            Ainda não há arquivos disponíveis para download.
          </p>
        ) : (
          <div className="mt-14 space-y-16">
            {grupos.map((g) => (
              <div key={g.titulo}>
                <h2 className="text-center font-inter text-3xl font-bold tracking-tight text-brand md:text-4xl">
                  {g.titulo}
                </h2>
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  {g.arquivos.map((a) => (
                    <FileCard key={a.href} {...a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
