import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";
import { MissaoVisaoValores } from "@/components/sobre/MissaoVisaoValores";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Missão, visão e valores do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

export default function MissaoVisaoValoresPage() {
  return (
    <main className="bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2">
        <PageHeader
          title="Sobre nós"
          lead="O que nos move, onde queremos chegar e os princípios que orientam a atuação do Sindipro SE."
        />

        {/* Painel interativo: clicar em Missão, Visão ou Valores troca o conteúdo. */}
        <MissaoVisaoValores />

        {/* Continue conhecendo */}
        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <PillLink href="/sobre/diretoria" tone="brand">
            Quadro de diretoria
          </PillLink>
          <PillLink href="/sobre/imprensa" tone="white">
            Assessoria de imprensa
          </PillLink>
        </div>
      </div>
    </main>
  );
}
