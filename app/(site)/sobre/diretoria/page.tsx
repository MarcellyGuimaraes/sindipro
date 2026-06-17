import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";
import { DirectorCard } from "@/components/DirectorCard";
import { getBoardSections, type BoardMemberPublic } from "@/lib/board-members";

export const metadata: Metadata = {
  title: "Quadro de diretoria",
  description:
    "Diretoria executiva e conselho fiscal do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

const PLACEHOLDER = "/placeholder-person.svg";

function cardProps(m: BoardMemberPublic) {
  return {
    name: m.name,
    role: m.role,
    image: m.photoUrl ?? PLACEHOLDER,
    imageAlt: m.photoUrl ? `Foto de ${m.name}` : "",
  };
}

export default async function DiretoriaPage() {
  const sections = await getBoardSections();
  const hasMembers = sections.some((s) => s.members.length > 0);

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

        {!hasMembers ? (
          <p className="mt-12 text-center font-inter text-sm text-black/50">
            O quadro de diretoria será publicado em breve.
          </p>
        ) : (
          <div className="mt-14 space-y-16">
            {sections.map((section, idx) => {
              if (section.members.length === 0) return null;

              // Destaque do Presidente: na Executiva, o primeiro membro
              // (menor display_order) ganha um card maior no topo.
              const isExecutiva = section.group === "executiva";
              const [first, ...rest] = section.members;
              const destaque = isExecutiva ? first : null;
              const grade = isExecutiva ? rest : section.members;

              return (
                <section key={section.group}>
                  <h2 className="text-center font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
                    {section.label}
                  </h2>

                  {destaque && (
                    <div className="mx-auto mt-8 max-w-xs">
                      <DirectorCard {...cardProps(destaque)} />
                    </div>
                  )}

                  {grade.length > 0 && (
                    <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                      {grade.map((m) => (
                        <li key={m.id}>
                          <DirectorCard {...cardProps(m)} />
                        </li>
                      ))}
                    </ul>
                  )}

                  {idx < sections.length - 1 && (
                    <div className="mx-auto mt-16 h-px w-24 bg-black/10" />
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Continue conhecendo */}
        <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
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
