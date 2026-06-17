import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";
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
    meta: "ZIP - em preparação", // TODO
    href: "#", // TODO
  },
  {
    name: "Apresentação institucional",
    type: "Kit",
    meta: "PDF - em preparação", // TODO
    href: "#", // TODO
  },
];

export default function ImprensaPage() {
  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 py-16 md:py-24">
        <PageHeader
          eyebrow="Sobre o sindicato"
          title={
            <>
              Assessoria de
              <br /> imprensa.
            </>
          }
          lead="Canal para jornalistas e veículos de comunicação que buscam informações, entrevistas e posicionamentos do Sindipro SE sobre o setor de provedores de internet em Sergipe."
        />

        {/* Contato — card dividido brand/branco */}
        <div className="mt-14 grid overflow-hidden rounded-[28px] md:grid-cols-2">
          <div className="bg-brand p-8 font-inter text-white md:p-12">
            <p className="text-sm font-medium text-white/70">Falar com a imprensa</p>
            <h2 className="mt-3 font-inter text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
              Contato
            </h2>
          </div>
          <div className="bg-white p-8 font-inter md:p-12">
            <p className="text-lg font-bold text-black">{imprensa.nome}</p>
            <p className="mt-1 text-xs text-black/40">
              {/* visível só enquanto os dados não chegam */}
              Contato a confirmar com a diretoria. (TODO)
            </p>

            <div className="mt-6 flex flex-col gap-3 text-sm">
              <a
                href={`mailto:${imprensa.email}`}
                className="inline-flex items-center gap-3 font-medium text-black/70 transition hover:text-brand"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                {imprensa.email}
              </a>
              <a
                href={`tel:${imprensa.telefoneHref}`}
                className="inline-flex items-center gap-3 font-medium text-black/70 transition hover:text-brand"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                {imprensa.telefone}
              </a>
            </div>
          </div>
        </div>

        {/* Releases */}
        <div className="mt-5 rounded-[28px] bg-white p-8 font-inter md:p-12">
          <p className="text-sm font-medium text-black/60">Para publicação</p>
          <h2 className="mt-3 font-inter text-4xl font-bold leading-[1.05] tracking-tight text-brand md:text-5xl">
            Releases
          </h2>
          {/*
            TODO: lista de releases (notas oficiais à imprensa). Estrutura
            prevista: data (pílula) + título + link para o texto/PDF. Virá do
            painel da diretoria (funcionalidade futura). Enquanto não houver
            release publicado, mantemos o estado vazio honesto abaixo.
          */}
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-black/60 md:text-base">
            Ainda não há releases publicados. As notas oficiais à imprensa
            aparecerão aqui assim que forem divulgadas. (TODO)
          </p>
        </div>

        {/* Kit de imprensa */}
        <div className="mt-16">
          <p className="text-center font-inter text-sm font-medium text-black/60">
            Material para download
          </p>
          <h2 className="mt-2 text-center font-inter text-3xl font-bold tracking-tight text-brand md:text-4xl">
            Kit de imprensa
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center font-inter text-sm leading-relaxed text-black/60">
            Logotipos em alta resolução, apresentação institucional e dados de
            referência para uso da imprensa. Arquivos em preparação. (TODO)
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {kit.map((item) => (
              <FileCard key={item.name} {...item} />
            ))}
          </div>
        </div>

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
