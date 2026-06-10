import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, ArrowRight } from "lucide-react";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";
import { Eyebrow } from "@/components/Eyebrow";
import { FileCard, type FileCardProps } from "@/components/FileCard";

export const metadata: Metadata = {
  title: "Assessoria de imprensa",
  description:
    "Contato para imprensa, releases e kit de imprensa do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

// TODO: dados reais do contato de imprensa (nome do assessor/agência,
// e-mail, telefone e horário de atendimento).
const imprensa = {
  nome: "Assessoria de imprensa", // TODO: nome do assessor ou da agência
  email: "imprensa@sindiprose.org.br", // TODO: confirmar
  telefone: "(79) 0000-0000", // TODO: confirmar
  telefoneHref: "+5579000000000", // TODO: confirmar
};

// TODO: arquivos reais do kit de imprensa (logotipos, apresentação, dados).
const kit: FileCardProps[] = [
  {
    name: "Logotipos do Sindipro SE",
    type: "Kit",
    meta: "ZIP — em preparação", // TODO
    href: "#", // TODO
  },
  {
    name: "Apresentação institucional",
    type: "Kit",
    meta: "PDF — em preparação", // TODO
    href: "#", // TODO
  },
];

export default function ImprensaPage() {
  return (
    <main>
      {/* Cabeçalho */}
      <Section tone="bg">
        <SectionHeading
          eyebrow="Sobre o sindicato"
          title="Assessoria de imprensa"
          as="h1"
        />
        <p className="mt-6 max-w-2xl text-body text-navy-900/85">
          Canal para jornalistas e veículos de comunicação que buscam
          informações, entrevistas e posicionamentos do Sindipro SE sobre o
          setor de provedores de internet em Sergipe.
        </p>
      </Section>

      {/* Contato para imprensa */}
      <Section tone="bg" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Falar com a imprensa"
              title="Contato"
              size="h2"
            />
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="rounded-card border border-blue-200 bg-surface p-6">
              <p className="font-display text-h3 font-medium text-navy-900">
                {imprensa.nome}
              </p>
              <p className="mt-1 text-small text-navy-900/80">
                {/* visível só enquanto os dados não chegam */}
                Contato a confirmar com a diretoria.
              </p>

              <div className="mt-5 flex flex-col gap-3 text-body">
                <a
                  href={`mailto:${imprensa.email}`}
                  className="inline-flex items-center gap-2.5 text-navy-700 transition-colors hover:text-navy-900"
                >
                  <Mail className="h-4 w-4 text-blue-400" aria-hidden="true" />
                  {imprensa.email}
                </a>
                <a
                  href={`tel:${imprensa.telefoneHref}`}
                  className="inline-flex items-center gap-2.5 text-navy-700 transition-colors hover:text-navy-900"
                >
                  <Phone className="h-4 w-4 text-blue-400" aria-hidden="true" />
                  {imprensa.telefone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Releases */}
      <Section tone="tint">
        <SectionHeading eyebrow="Para publicação" title="Releases" size="h2" />
        {/*
          TODO: lista de releases (notas oficiais à imprensa). Estrutura prevista:
          data (eyebrow) + título + link para o texto/PDF. Virá do painel da
          diretoria (§6, funcionalidade futura). Enquanto não houver release
          publicado, mantemos o estado vazio honesto abaixo.
        */}
        <div className="mt-8 max-w-2xl rounded-card border border-blue-200 bg-surface p-8">
          <p className="text-body text-navy-900/80">
            Ainda não há releases publicados. As notas oficiais à imprensa
            aparecerão aqui assim que forem divulgadas. (TODO)
          </p>
        </div>
      </Section>

      {/* Kit de imprensa */}
      <Section tone="bg">
        <SectionHeading
          eyebrow="Material para download"
          title="Kit de imprensa"
          size="h2"
        />
        <p className="mt-6 max-w-2xl text-body text-navy-900/85">
          Logotipos em alta resolução, apresentação institucional e dados de
          referência para uso da imprensa.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {kit.map((item) => (
            <FileCard key={item.name} {...item} />
          ))}
        </div>
        <p className="mt-4 text-small text-navy-900/80">
          Arquivos em preparação. (TODO)
        </p>
      </Section>

      {/* Continue navegando */}
      <Section tone="bg" className="border-t border-blue-200">
        <Eyebrow>Continue conhecendo</Eyebrow>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-8">
          <Link
            href="/sobre/quem-somos"
            className="group inline-flex items-center gap-1.5 text-body font-medium text-navy-700 transition-colors hover:text-navy-900"
          >
            Quem somos
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
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
        </div>
      </Section>
    </main>
  );
}
