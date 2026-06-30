import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PartnerCard } from "@/components/PartnerCard";
import { getPartners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Parceiros",
  description:
    "Empresas e instituições parceiras do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

/**
 * Página pública de parceiros. Lê a tabela `partners` do Supabase (mesma fonte
 * do carrossel da home) e exibe em grade de cards na identidade do site.
 * Server Component — RLS libera SELECT para todos.
 */
export default async function ParceirosPage() {
  const parceiros = await getPartners();

  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 pb-16 md:pb-24">
        <PageHeader
          title="Parceiros"
          lead="Empresas e instituições que caminham com o Sindipro SE no fortalecimento do setor de provedores de internet em Sergipe."
        />

        {parceiros.length === 0 ? (
          <p className="mt-12 text-center font-inter text-sm text-black/50">
            Os parceiros serão divulgados em breve.
          </p>
        ) : (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {parceiros.map((p) => (
              <PartnerCard key={p.id} partner={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
