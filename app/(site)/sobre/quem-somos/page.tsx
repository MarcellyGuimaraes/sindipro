import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";

export const metadata: Metadata = {
  title: "Quem somos",
  description:
    "História, missão e objetivos do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

// Objetivos institucionais do sindicato patronal — papéis concretos, não
// estatísticas. Nada aqui é número inventado.
const objetivos = [
  "Representar a categoria patronal perante os órgãos públicos, os reguladores e a Justiça do Trabalho.",
  "Negociar e firmar a Convenção Coletiva de Trabalho (CCT) e os Acordos Coletivos (ACT) do setor.",
  "Acompanhar e influenciar as pautas regulatórias e legislativas que afetam os provedores de internet.",
  "Oferecer apoio técnico e jurídico às empresas associadas no dia a dia da operação.",
  "Promover capacitação e a troca de boas práticas entre os provedores do estado.",
  "Fortalecer a imagem institucional do setor junto à sociedade sergipana.",
];

export default function QuemSomosPage() {
  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 py-16 md:py-24">
        <PageHeader
          eyebrow="Sobre o sindicato"
          title={
            <>
              Quem somos.
            </>
          }
          lead="O Sindipro SE é o sindicato patronal que reúne e representa os provedores de internet e de serviço de comunicação multimídia do Estado de Sergipe, dando voz organizada ao setor perante o poder público, os órgãos reguladores e a sociedade."
        />

        {/* História — card branco dividido */}
        <div className="mt-14 grid overflow-hidden rounded-[28px] bg-white md:grid-cols-2">
          <div className="p-8 font-inter md:p-12">
            <p className="text-sm font-medium text-black/60">Nossa história</p>
            <h2 className="mt-3 font-inter text-4xl font-bold leading-[1.05] tracking-tight text-brand md:text-5xl">
              História
            </h2>
          </div>
          <div className="space-y-4 p-8 pt-0 font-inter text-sm leading-relaxed text-black/60 md:p-12 md:text-base">
            <p>
              {/* TODO: ano de fundação e contexto da criação do sindicato. */}
              O Sindipro SE foi constituído para organizar os provedores de
              internet de Sergipe em torno de interesses comuns, num momento de
              expansão da banda larga e de crescente complexidade regulatória e
              trabalhista no setor. (TODO: confirmar ano de fundação e o
              histórico de criação.)
            </p>
            <p>
              {/* TODO: marcos relevantes — primeiras CCT/ACT, conquistas, gestões. */}
              Desde então, atua de forma permanente na negociação coletiva, no
              acompanhamento das normas que regem a atividade e na defesa das
              empresas associadas. (TODO: marcos e conquistas relevantes ao
              longo das gestões.)
            </p>
          </div>
        </div>

        {/* Missão — declaração em destaque sobre brand */}
        <div className="mt-5 rounded-[28px] bg-brand p-8 font-inter text-white md:p-12">
          <p className="text-sm font-medium text-white/70">Nossa missão</p>
          <p className="mt-4 max-w-3xl text-2xl font-bold leading-snug tracking-tight md:text-4xl">
            Representar, defender e fortalecer os provedores de internet e de
            serviço de comunicação multimídia de Sergipe, assegurando um
            ambiente regulatório e trabalhista equilibrado para o
            desenvolvimento do setor.
          </p>
        </div>

        {/* Objetivos */}
        <div className="mt-5 rounded-[28px] bg-white p-8 font-inter md:p-12">
          <p className="text-sm font-medium text-black/60">O que fazemos</p>
          <h2 className="mt-3 font-inter text-4xl font-bold leading-[1.05] tracking-tight text-brand md:text-5xl">
            Nossos objetivos
          </h2>
          <ul className="mt-8 grid gap-x-10 gap-y-5 md:grid-cols-2">
            {objetivos.map((o, i) => (
              <li key={o} className="flex gap-4">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-black/70 md:text-base">
                  {o}
                </span>
              </li>
            ))}
          </ul>
        </div>

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
