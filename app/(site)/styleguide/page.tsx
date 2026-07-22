import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/Button";
import { Section } from "@/components/Section";
import { Eyebrow } from "@/components/Eyebrow";
import { SectionHeading } from "@/components/SectionHeading";
import { NewsCard } from "@/components/NewsCard";
import { FileCard } from "@/components/FileCard";
import { FeatherDivider, FeatherMark } from "@/components/Feather";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const tokens = [
  { name: "bg", hex: "#f4f4f4", role: "Fundo geral", text: "navy" },
  { name: "surface", hex: "#ffffff", role: "Cards / superfícies", text: "navy" },
  { name: "navy-900", hex: "#1c4464", role: "Títulos, footer, faixas", text: "light" },
  { name: "navy-700", hex: "#0e518c", role: "Primária: links, botão", text: "light" },
  { name: "blue-400", hex: "#74a4c4", role: "Ícones, bordas fortes", text: "navy" },
  { name: "blue-350", hex: "#7d9cb9", role: "Secundário", text: "navy" },
  { name: "blue-300", hex: "#97b8d1", role: "Secundário claro", text: "navy" },
  { name: "blue-200", hex: "#b5ccdd", role: "Bordas / divisores", text: "navy" },
  { name: "blue-100", hex: "#c3dcec", role: "Tint de fundo", text: "navy" },
  { name: "gold-600", hex: "#ab8221", role: "A pena, fios, acento", text: "light" },
  { name: "gold-200", hex: "#dcc99e", role: "Hover / badge dourado", text: "navy" },
];

const typeScale = [
  { label: "Display XL", cls: "text-display-xl font-display font-semibold", note: "3.5rem / 1.05 · Fraunces 600 · hero" },
  { label: "Display L", cls: "text-display-l font-display font-semibold", note: "2.5rem / 1.1 · Fraunces 600 · seção" },
  { label: "H2", cls: "text-h2 font-display font-medium", note: "1.75rem / 1.2 · Fraunces 500" },
  { label: "H3", cls: "text-h3 font-display font-medium", note: "1.25rem / 1.3 · Fraunces 500" },
  { label: "Corpo", cls: "text-body font-sans", note: "1.0625rem / 1.7 · IBM Plex Sans 400" },
  { label: "Pequeno", cls: "text-small font-sans", note: "0.9375rem / 1.6 · IBM Plex Sans 400" },
];

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-16 first:mt-0">
      <Eyebrow className="mb-6">{title}</Eyebrow>
      {children}
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main>
      {/* Cabeçalho do styleguide */}
      <Section tone="navy" className="relative overflow-hidden">
        <FeatherMark
          className="pointer-events-none absolute -right-4 top-4 opacity-[0.14]"
          size={200}
        />
        <div className="relative">
          <Eyebrow tone="light" className="mb-3">
            SindiproSE · Componentes base
          </Eyebrow>
          <h1 className="font-display text-display-l font-semibold text-bg sm:text-display-xl">
            Styleguide
          </h1>
          <p className="mt-4 max-w-xl text-body text-blue-200">
            Tokens, tipografia e os componentes da seção 8 do contrato de design.
            Página temporária — nenhuma página real foi construída ainda.
          </p>
        </div>
      </Section>

      <Section>
        {/* CORES */}
        <Block title="Tokens de cor">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tokens.map((t) => (
              <div
                key={t.name}
                className="overflow-hidden rounded-card border border-blue-200 bg-surface"
              >
                <div
                  className="flex h-24 items-end p-3"
                  style={{ backgroundColor: t.hex }}
                >
                  <span
                    className={`text-eyebrow font-medium uppercase ${
                      t.text === "light" ? "text-bg" : "text-navy-900"
                    }`}
                  >
                    {t.name}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-sans text-small text-navy-900">{t.hex}</p>
                  <p className="text-small text-navy-900/60">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Block>

        {/* TIPOGRAFIA */}
        <Block title="Escala tipográfica">
          <div className="space-y-6">
            {typeScale.map((t) => (
              <div
                key={t.label}
                className="flex flex-col gap-1 border-b border-blue-200 pb-6 last:border-0"
              >
                <span className="text-eyebrow font-medium uppercase tracking-[0.08em] text-blue-400">
                  {t.label} — {t.note}
                </span>
                <span className={`${t.cls} text-navy-900`}>
                  Representar os provedores de Sergipe
                </span>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <span className="text-eyebrow font-medium uppercase tracking-[0.08em] text-blue-400">
                Eyebrow — 0.8125rem · maiúsculas · +0.08em
              </span>
              <Eyebrow>Notícias · Sobre · Arquivos</Eyebrow>
            </div>
          </div>
        </Block>
      </Section>

      <FeatherDivider className="mx-auto max-w-container px-6 sm:px-8" />

      <Section>
        {/* BOTÕES */}
        <Block title="Botão">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg">
                Fale com o sindicato
              </Button>
              <Button variant="secondary" size="lg">
                Últimas notícias
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary">Primário (md)</Button>
              <Button variant="secondary">Secundário (md)</Button>
              <Button variant="primary" disabled>
                Primário desabilitado
              </Button>
              <Button variant="secondary" disabled>
                Secundário desabilitado
              </Button>
            </div>
            <p className="text-small text-navy-900/60">
              Hover, foco (Tab) e disabled inclusos. Raio 6px, sentence case.
            </p>
          </div>
        </Block>

        {/* EYEBROW + TÍTULO COM SUBLINHADO */}
        <Block title="Eyebrow + título de seção (motivo da pena)">
          <div className="space-y-10">
            <SectionHeading
              eyebrow="Notícias"
              title="Últimas do setor de provedores"
            />
            <SectionHeading
              eyebrow="Sobre o sindicato"
              title="Representatividade que defende o setor"
              size="h2"
            />
          </div>
        </Block>
      </Section>

      <FeatherDivider className="mx-auto max-w-container px-6 sm:px-8" />

      <Section>
        {/* CARD DE NOTÍCIA */}
        <Block title="Card de notícia (destaque + compactos)">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <NewsCard
                feature
                href="#"
                date="10 jun 2026"
                title="Sindipro fecha nova CCT para os provedores de Sergipe"
                summary="A convenção coletiva de 2026 traz reajuste salarial, novas faixas de função e cláusulas de capacitação técnica para o setor de internet do estado."
                image="/placeholder-news.svg"
                imageAlt="Reunião de diretoria do SindiproSE"
              />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-5">
              <NewsCard
                href="#"
                date="28 mai 2026"
                title="Audiência discute infraestrutura de fibra no interior"
                summary="Representantes do sindicato participaram de audiência pública sobre expansão de rede."
                image="/placeholder-news.svg"
                imageAlt="Audiência pública sobre fibra óptica"
              />
              <NewsCard
                href="#"
                date="14 mai 2026"
                title="Curso de boas práticas regulatórias para associados"
                summary="Inscrições abertas para a capacitação gratuita voltada aos provedores associados."
                image="/placeholder-news.svg"
                imageAlt="Sala de treinamento"
              />
            </div>
          </div>
        </Block>

        {/* CARD DE ARQUIVO */}
        <Block title="Card de arquivo (CCT / ACT)">
          <div className="grid gap-4 md:grid-cols-2">
            <FileCard
              type="CCT"
              name="Convenção Coletiva de Trabalho 2026"
              meta="Vigência 2026/2027 · PDF"
              href="#"
            />
            <FileCard
              type="ACT"
              name="Acordo Coletivo de Trabalho 2025"
              meta="Vigência 2025/2026 · PDF"
              href="#"
            />
          </div>
        </Block>
      </Section>

      {/* O Footer é fornecido pelo layout raiz (aparece em todas as páginas). */}
    </main>
  );
}
