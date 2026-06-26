import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";
import { DirectorCard } from "@/components/DirectorCard";
import {
  getDiretoriaDestaque,
  GRUPO_ROLE,
  type BoardMemberPublic,
} from "@/lib/board-members";

export const metadata: Metadata = {
  title: "Quadro de diretoria",
  description:
    "Diretoria executiva e conselho fiscal do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

const PLACEHOLDER = "/placeholder-person.svg";

function img(m: BoardMemberPublic) {
  return {
    image: m.photoUrl ?? PLACEHOLDER,
    imageAlt: m.photoUrl ? `Foto de ${m.name}` : "",
  };
}

export default async function DiretoriaPage() {
  const { presidente, vice, grupo } = await getDiretoriaDestaque();
  const temConteudo = presidente || vice || grupo;

  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-5xl px-2 pb-16 md:pb-24">
        <PageHeader
          title={
            <>
              Quadro de diretoria
            </>
          }
          lead="A diretoria conduz a representação institucional do Sindipro SE e a negociação coletiva do setor. Conheça quem responde pela entidade."
        />

        {!temConteudo ? (
          <p className="mt-12 text-center font-inter text-sm text-black/50">
            O quadro de diretoria será publicado em breve.
          </p>
        ) : (
          <div className="mt-14 space-y-5">
            {/* Presidente + Vice-presidente, lado a lado */}
            {(presidente || vice) && (
              <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:gap-5">
                {presidente && (
                  <DirectorCard {...img(presidente)} name={presidente.name} role={presidente.role} />
                )}
                {vice && (
                  <DirectorCard {...img(vice)} name={vice.name} role={vice.role} />
                )}
              </div>
            )}

            {/* Foto do grupo, horizontal e em largura total */}
            {grupo && (
              <DirectorCard
                {...img(grupo)}
                name={GRUPO_ROLE}
                role=""
                wide
              />
            )}
          </div>
        )}

        {/* Continue conhecendo */}
        <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <PillLink href="/sobre/missao-visao-valores" tone="brand">
            Sobre nós
          </PillLink>
          <PillLink href="/sobre/imprensa" tone="white">
            Assessoria de imprensa
          </PillLink>
        </div>
      </div>
    </main>
  );
}
