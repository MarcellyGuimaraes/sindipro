import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";
import { Eyebrow } from "@/components/Eyebrow";
import { DirectorCard, type DirectorCardProps } from "@/components/DirectorCard";

export const metadata: Metadata = {
  title: "Quadro de diretoria",
  description:
    "Diretoria executiva e conselho fiscal do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

// TODO: nomes e fotos reais de cada membro. Os cargos seguem a estrutura
// estatutária típica e também devem ser confirmados com a diretoria.
const PLACEHOLDER = "/placeholder-person.svg";
const mk = (role: string): DirectorCardProps => ({
  name: "Nome a confirmar", // TODO
  role,
  image: PLACEHOLDER,
  imageAlt: `Foto a confirmar — ${role}`, // TODO
});

const diretoriaExecutiva: DirectorCardProps[] = [
  mk("Presidente"),
  mk("Vice-presidente"),
  mk("1º Secretário"),
  mk("2º Secretário"),
  mk("1º Tesoureiro"),
  mk("2º Tesoureiro"),
];

const conselhoFiscal: DirectorCardProps[] = [
  mk("Conselheiro(a) fiscal"),
  mk("Conselheiro(a) fiscal"),
  mk("Conselheiro(a) fiscal"),
];

export default function DiretoriaPage() {
  return (
    <main>
      {/* Cabeçalho */}
      <Section tone="bg">
        <SectionHeading
          eyebrow="Sobre o sindicato"
          title="Quadro de diretoria"
          as="h1"
        />
        <p className="mt-6 max-w-2xl text-body text-navy-900/85">
          A diretoria conduz a representação institucional do Sindipro SE e a
          negociação coletiva do setor. Conheça quem responde pela entidade.
        </p>
        <p className="mt-4 max-w-2xl text-small text-navy-900/80">
          {/* visível só enquanto os dados não chegam */}
          Composição, nomes e fotos a confirmar com a diretoria.
        </p>
      </Section>

      {/* Diretoria executiva */}
      <Section tone="bg" className="pt-0">
        <SectionHeading eyebrow="Mandato vigente" title="Diretoria executiva" size="h2" />
        <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {diretoriaExecutiva.map((d, i) => (
            <li key={`${d.role}-${i}`}>
              <DirectorCard {...d} />
            </li>
          ))}
        </ul>
      </Section>

      {/* Conselho fiscal */}
      <Section tone="tint">
        <SectionHeading eyebrow="Fiscalização" title="Conselho fiscal" size="h2" />
        <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {conselhoFiscal.map((d, i) => (
            <li key={`${d.role}-${i}`}>
              <DirectorCard {...d} />
            </li>
          ))}
        </ul>
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
