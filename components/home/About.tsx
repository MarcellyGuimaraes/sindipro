import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * Seção "Sobre / objetivo do sindicato" da Home (CLAUDE.md §9).
 * Bloco de texto institucional alinhado à esquerda + faixa de números.
 *
 * IMPORTANTE: nenhuma estatística inventada. Os números abaixo são
 * placeholders ("—") aguardando os dados reais da diretoria.
 */

// TODO: substituir pelos números reais (valor + rótulo). Enquanto não houver
// dado confirmado, o valor fica como "—" e NÃO se inventa estatística.
const numeros: { valor: string; rotulo: string }[] = [
  { valor: "—", rotulo: "Provedores associados" }, // TODO
  { valor: "—", rotulo: "Municípios com associados" }, // TODO
  { valor: "—", rotulo: "Ano de fundação" }, // TODO
];

export function About() {
  return (
    <Section tone="tint" id="sobre">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Texto institucional */}
        <div className="lg:col-span-7">
          <SectionHeading
            eyebrow="Sobre o sindicato"
            title="A voz organizada dos provedores de internet de Sergipe"
          />

          <div className="mt-6 max-w-xl space-y-4 text-body text-navy-900/85">
            <p>
              O Sindipro SE representa os provedores de internet e de serviço de
              comunicação multimídia do Estado de Sergipe perante o poder
              público, os órgãos reguladores e a sociedade. Como sindicato
              patronal, reúne as empresas do setor em torno de interesses
              comuns e de uma atuação institucional permanente.
            </p>
            <p>
              Entre as frentes de trabalho estão a negociação da Convenção
              Coletiva de Trabalho (CCT) e dos Acordos Coletivos (ACT), o
              acompanhamento das pautas regulatórias que afetam o segmento e o
              apoio técnico e jurídico aos associados no dia a dia da operação.
            </p>
          </div>

          {/* TODO: confirmar histórico/missão para a página /sobre/quem-somos. */}
          <Link
            href="/sobre/quem-somos"
            className="group mt-7 inline-flex items-center gap-1.5 text-small font-medium text-navy-700 transition-colors hover:text-navy-900"
          >
            Quem somos
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Números — placeholders até virem os dados reais */}
        <div className="lg:col-span-5">
          <dl className="divide-y divide-blue-200 border-t border-blue-200">
            {numeros.map((n) => (
              <div
                key={n.rotulo}
                className="flex items-baseline justify-between gap-6 py-5"
              >
                <dd className="font-display text-display-l font-semibold leading-none text-navy-900">
                  {n.valor}
                </dd>
                <dt className="max-w-[12rem] text-right text-small text-navy-900/85">
                  {n.rotulo}
                </dt>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-small text-navy-900/85">
            {/* visível só enquanto os dados não chegam */}
            Dados a confirmar com a diretoria.
          </p>
        </div>
      </div>
    </Section>
  );
}
