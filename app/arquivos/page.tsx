import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";
import { FileCard, type FileCardProps } from "@/components/FileCard";

export const metadata: Metadata = {
  title: "Arquivos",
  description:
    "Convenções Coletivas (CCT) e Acordos Coletivos (ACT) do setor de provedores de internet de Sergipe, disponíveis para download.",
};

/**
 * Arquivos públicos para download (CLAUDE.md §9): CCT e ACT.
 * Agrupados por tipo, mais recente primeiro — estrutura usual de página de CCT.
 *
 * TODO: substituir pelos arquivos reais (nome, vigência e PDF correto). No
 * futuro (§6) a gestão virá do painel da diretoria; aqui são exemplos.
 *
 * NOTA: ajustar esta estrutura ao print de referência de CCT assim que enviado.
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
    <main>
      {/* Cabeçalho */}
      <Section tone="bg">
        <SectionHeading
          eyebrow="Arquivos"
          title="Convenções e acordos para download"
          as="h1"
        />
        <p className="mt-6 max-w-2xl text-body text-navy-900/85">
          Acesse as Convenções Coletivas de Trabalho (CCT) e os Acordos
          Coletivos (ACT) que regem a categoria. Os documentos estão em PDF.
        </p>
        <p className="mt-4 max-w-2xl text-small text-navy-900/80">
          {/* visível enquanto os arquivos não chegam */}
          Arquivos em preparação — exemplos para layout. (TODO)
        </p>
      </Section>

      {/* Grupos de arquivos */}
      <Section tone="bg" className="pt-0">
        <div className="space-y-14">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <SectionHeading eyebrow={g.eyebrow} title={g.titulo} size="h2" />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {g.arquivos.map((a) => (
                  <FileCard key={a.name} {...a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
