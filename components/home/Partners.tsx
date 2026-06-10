import Image from "next/image";
import { Eyebrow } from "@/components/Eyebrow";
import { Section } from "@/components/Section";

/**
 * Seção "Parceiros" da Home (CLAUDE.md §9): faixa de logos, discreta.
 * Em repouso os logos ficam em cinza/esmaecidos; ganham cor no hover.
 *
 * TODO: lista real de parceiros (nome + arquivo de logo). Enquanto não houver
 * logo, renderizamos um placeholder de wordmark — nada de logo inventado.
 */

type Partner = {
  nome: string;
  /** Caminho do logo real quando existir (ex.: /parceiros/anatel.svg). */
  logo?: string;
};

// TODO: substituir pelos parceiros reais e seus logos.
const parceiros: Partner[] = [
  { nome: "Parceiro 1" },
  { nome: "Parceiro 2" },
  { nome: "Parceiro 3" },
  { nome: "Parceiro 4" },
  { nome: "Parceiro 5" },
];

export function Partners() {
  return (
    <Section tone="bg" id="parceiros">
      <Eyebrow>Parceiros e apoiadores</Eyebrow>

      <ul className="mt-8 flex flex-wrap items-center gap-x-12 gap-y-8 sm:gap-x-16">
        {parceiros.map((p) => (
          <li key={p.nome}>
            {p.logo ? (
              <Image
                src={p.logo}
                alt={p.nome}
                width={140}
                height={48}
                className="h-10 w-auto object-contain opacity-70 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
                unoptimized={p.logo.endsWith(".svg")}
              />
            ) : (
              // Placeholder de wordmark — substituível pelo logo real (que,
              // sendo <Image>, fica isento de contraste e usa grayscale→cor).
              // Tom de repouso já passa AA; hover reforça com a primária.
              <span
                className="select-none font-display text-h3 font-medium text-navy-900/80 transition-colors duration-200 hover:text-navy-700"
                title="TODO: logo do parceiro"
              >
                {p.nome}
              </span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-small text-navy-900/80">
        {/* visível só enquanto a lista real não chega */}
        Lista de parceiros a confirmar.
      </p>
    </Section>
  );
}
