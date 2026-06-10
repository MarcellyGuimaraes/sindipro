import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";
import { Eyebrow } from "@/components/Eyebrow";
import { FeatherDivider } from "@/components/Feather";

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
    <main>
      {/* Cabeçalho da página */}
      <Section tone="bg">
        <SectionHeading
          eyebrow="Sobre o sindicato"
          title="Quem somos"
          as="h1"
        />
        <p className="mt-6 max-w-2xl text-body text-navy-900/85">
          O Sindipro SE é o sindicato patronal que reúne e representa os
          provedores de internet e de serviço de comunicação multimídia do
          Estado de Sergipe, dando voz organizada ao setor perante o poder
          público, os órgãos reguladores e a sociedade.
        </p>
      </Section>

      <FeatherDivider className="mx-auto max-w-container px-6 sm:px-8" />

      {/* História */}
      <Section tone="bg">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Nossa história" title="História" size="h2" />
          </div>
          <div className="space-y-4 text-body text-navy-900/85 lg:col-span-7 lg:col-start-6">
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
      </Section>

      {/* Missão — declaração em destaque */}
      <Section tone="tint">
        <Eyebrow>Nossa missão</Eyebrow>
        <p className="mt-5 max-w-3xl font-display text-h2 font-medium leading-snug text-navy-900">
          Representar, defender e fortalecer os provedores de internet e de
          serviço de comunicação multimídia de Sergipe, assegurando um ambiente
          regulatório e trabalhista equilibrado para o desenvolvimento do setor.
        </p>
      </Section>

      {/* Objetivos */}
      <Section tone="bg">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="O que fazemos"
              title="Nossos objetivos"
              size="h2"
            />
          </div>
          <ul className="lg:col-span-7 lg:col-start-6">
            {objetivos.map((o) => (
              <li
                key={o}
                className="flex gap-4 border-t border-blue-200 py-4 first:border-t-0 first:pt-0"
              >
                <span
                  className="mt-2.5 h-px w-6 shrink-0 bg-gold-600"
                  aria-hidden="true"
                />
                <span className="text-body text-navy-900/85">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Continue navegando em "Sobre nós" */}
      <Section tone="bg" className="border-t border-blue-200">
        <Eyebrow>Continue conhecendo</Eyebrow>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-8">
          <Link
            href="/sobre/diretoria"
            className="group inline-flex items-center gap-1.5 text-body font-medium text-navy-700 transition-colors hover:text-navy-900"
          >
            Quadro de diretoria
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/sobre/imprensa"
            className="group inline-flex items-center gap-1.5 text-body font-medium text-navy-700 transition-colors hover:text-navy-900"
          >
            Assessoria de imprensa
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Section>
    </main>
  );
}
