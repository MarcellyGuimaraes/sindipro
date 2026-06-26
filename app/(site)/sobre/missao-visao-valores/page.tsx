import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";
import { MissaoVisaoValores } from "@/components/sobre/MissaoVisaoValores";

export const metadata: Metadata = {
  title: "Missão, visão e valores",
  description:
    "Missão, visão e valores do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

export default function MissaoVisaoValoresPage() {
  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 py-16 md:py-24">
        <PageHeader
          title="Missão, visão e valores"
          lead="O que nos move, onde queremos chegar e os princípios que orientam a atuação do Sindipro SE. Role para percorrer cada um."
        />

        {/* Painel interativo: a rolagem troca o destaque entre os três. */}
        <MissaoVisaoValores />

        {/* Continue conhecendo */}
        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <PillLink href="/sobre/quem-somos" tone="brand">
            Quem somos
          </PillLink>
          <PillLink href="/sobre/diretoria" tone="white">
            Quadro de diretoria
          </PillLink>
        </div>
      </div>
    </main>
  );
}
