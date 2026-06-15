import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";
import { DirectorCard, type DirectorCardProps } from "@/components/DirectorCard";

export const metadata: Metadata = {
  title: "Quadro de diretoria",
  description:
    "Diretoria executiva do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

// TODO: nomes e fotos reais de cada membro. Os cargos seguem a estrutura
// estatutária típica e também devem ser confirmados com a diretoria.
const PLACEHOLDER = "/placeholder-person.svg";
const mk = (role: string): DirectorCardProps => ({
  name: "Nome a confirmar", // TODO
  role,
  image: PLACEHOLDER,
  imageAlt: `Foto a confirmar - ${role}`, // TODO
});

const diretoriaExecutiva: DirectorCardProps[] = [
  mk("Presidente"),
  mk("Vice-presidente"),
  mk("1º Secretário"),
  mk("2º Secretário"),
  mk("1º Tesoureiro"),
  mk("2º Tesoureiro"),
];

export default function DiretoriaPage() {
  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 py-16 md:py-24">
        <PageHeader
          eyebrow="Sobre o sindicato"
          title={
            <>
              Quadro de
              <br /> diretoria.
            </>
          }
          lead="A diretoria conduz a representação institucional do Sindipro SE e a negociação coletiva do setor. Conheça quem responde pela entidade."
        />
        <p className="mt-4 text-center font-inter text-xs text-black/40">
          {/* visível só enquanto os dados não chegam */}
          Composição, nomes e fotos a confirmar com a diretoria. (TODO)
        </p>

        {/* Diretoria executiva */}
        <div className="mt-14">
          <p className="text-center font-inter text-sm font-medium text-black/60">
            Mandato vigente
          </p>
          <h2 className="mt-2 text-center font-inter text-3xl font-bold tracking-tight text-brand md:text-4xl">
            Diretoria executiva
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {diretoriaExecutiva.map((d, i) => (
              <li key={`${d.role}-${i}`}>
                <DirectorCard {...d} />
              </li>
            ))}
          </ul>
        </div>

        {/* Continue conhecendo */}
        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <PillLink href="/sobre/quem-somos" tone="brand">
            Quem somos
          </PillLink>
          <PillLink href="/sobre/imprensa" tone="white">
            Assessoria de imprensa
          </PillLink>
        </div>
      </div>
    </main>
  );
}
