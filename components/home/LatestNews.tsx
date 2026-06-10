import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";
import { NewsCard, type NewsCardProps } from "@/components/NewsCard";

/**
 * Seção "Últimas notícias" da Home (CLAUDE.md §9).
 * Layout EDITORIAL ASSIMÉTRICO: 1 destaque maior + 2 menores empilhados.
 * Nunca 3 cards idênticos. Puxará de /noticias quando houver backend.
 *
 * TODO: substituir os dados mockados abaixo pelas notícias reais
 * (provavelmente vindas do CMS/painel da diretoria — §6, funcionalidade futura).
 */

// TODO: dados reais — datas, títulos, resumos e imagens das notícias.
const noticias: NewsCardProps[] = [
  {
    href: "/noticias/nova-cct-2026",
    date: "10 jun 2026",
    title: "Sindipro fecha nova CCT para os provedores de Sergipe",
    summary:
      "A convenção coletiva de 2026 traz reajuste salarial, novas faixas de função e cláusulas de capacitação técnica para o setor de internet do estado.",
    image: "/placeholder-news.svg",
    imageAlt: "TODO: imagem real — reunião de negociação da CCT", // TODO
    feature: true,
  },
  {
    href: "/noticias/audiencia-fibra-interior",
    date: "28 mai 2026",
    title: "Audiência discute expansão de fibra no interior sergipano",
    summary:
      "Representantes do sindicato participaram de audiência pública sobre infraestrutura de rede nos municípios do interior.",
    image: "/placeholder-news.svg",
    imageAlt: "TODO: imagem real — audiência pública", // TODO
  },
  {
    href: "/noticias/curso-boas-praticas-regulatorias",
    date: "14 mai 2026",
    title: "Curso de boas práticas regulatórias abre inscrições",
    summary:
      "Capacitação gratuita orienta os provedores associados sobre as obrigações junto à Anatel e aos órgãos de defesa do consumidor.",
    image: "/placeholder-news.svg",
    imageAlt: "TODO: imagem real — capacitação de associados", // TODO
  },
];

export function LatestNews() {
  const [destaque, ...menores] = noticias;

  return (
    <Section tone="bg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow="Notícias" title="Últimas do setor" />
        <Link
          href="/noticias"
          className="group inline-flex items-center gap-1.5 text-small font-medium text-navy-700 transition-colors hover:text-navy-900"
        >
          Ver todas as notícias
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <NewsCard {...destaque} feature />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-5">
          {menores.map((n) => (
            <NewsCard key={n.href} {...n} feature={false} />
          ))}
        </div>
      </div>
    </Section>
  );
}
