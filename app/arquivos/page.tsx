import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FileCard, type FileCardProps } from "@/components/FileCard";

export const metadata: Metadata = {
  title: "Arquivos",
  description:
    "Convenções Coletivas (CCT) e Acordos Coletivos (ACT) do setor de provedores de internet de Sergipe, disponíveis para download.",
};

/**
 * Arquivos públicos para download: CCT e ACT, agrupados por tipo,
 * mais recente primeiro.
 *
 * TODO: substituir pelos arquivos reais (nome, vigência e PDF correto).
 * No futuro a gestão virá do painel da diretoria; aqui são exemplos.
 */

type Grupo = {
  eyebrow: string;
  titulo: string;
  arquivos: FileCardProps[];
};

const grupos: Grupo[] = [
  {
    eyebrow: "Negociação coletiva",
    titulo: "Convenções Coletivas (CCT)",
    arquivos: [
      { name: "Convenção Coletiva de Trabalho 2026/2027", type: "CCT", meta: "Vigência 2026/2027 · PDF", href: "#" }, // TODO
      { name: "Convenção Coletiva de Trabalho 2025/2026", type: "CCT", meta: "Vigência 2025/2026 · PDF", href: "#" }, // TODO
      { name: "Convenção Coletiva de Trabalho 2024/2025", type: "CCT", meta: "Vigência 2024/2025 · PDF", href: "#" }, // TODO
    ],
  },
  {
    eyebrow: "Acordos do setor",
    titulo: "Acordos Coletivos (ACT)",
    arquivos: [
      { name: "Acordo Coletivo de Trabalho 2025/2026", type: "ACT", meta: "Vigência 2025/2026 · PDF", href: "#" }, // TODO
      { name: "Acordo Coletivo de Trabalho 2024/2025", type: "ACT", meta: "Vigência 2024/2025 · PDF", href: "#" }, // TODO
    ],
  },
];

export default function ArquivosPage() {
  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 py-16 md:py-24">
        <PageHeader
          eyebrow="Arquivos"
          title={
            <>
              Convenções e acordos
              <br /> para download.
            </>
          }
          lead="Acesse as Convenções Coletivas de Trabalho (CCT) e os Acordos Coletivos (ACT) que regem a categoria. Os documentos estão em PDF."
        />
        <p className="mt-4 text-center font-inter text-xs text-black/40">
          {/* visível enquanto os arquivos não chegam */}
          Arquivos em preparação — exemplos para layout. (TODO)
        </p>

        <div className="mt-14 space-y-16">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <p className="text-center font-inter text-sm font-medium text-black/60">
                {g.eyebrow}
              </p>
              <h2 className="mt-2 text-center font-inter text-3xl font-bold tracking-tight text-brand md:text-4xl">
                {g.titulo}
              </h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {g.arquivos.map((a) => (
                  <FileCard key={a.name} {...a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
