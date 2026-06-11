import Image from "next/image";

/**
 * "Parceiros" — visual Lovable: faixa discreta sobre o cream, rótulo central
 * pequeno em black/60 (mesma linguagem dos eyebrows do mock) e logos em
 * cinza no repouso → cor no hover.
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
    <section id="parceiros" className="mx-auto max-w-6xl px-2 pb-20 md:pb-28">
      <p className="text-center font-inter text-sm font-medium text-black/60">
        Parceiros e apoiadores
      </p>

      <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16">
        {parceiros.map((p) => (
          <li key={p.nome}>
            {p.logo ? (
              <Image
                src={p.logo}
                alt={p.nome}
                width={140}
                height={48}
                className="h-10 w-auto object-contain opacity-60 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
                unoptimized={p.logo.endsWith(".svg")}
              />
            ) : (
              // Placeholder de wordmark — substituível pelo logo real.
              <span
                className="select-none font-inter text-xl font-bold tracking-tight text-black/40 transition-colors duration-200 hover:text-brand"
                title="TODO: logo do parceiro"
              >
                {p.nome}
              </span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center font-inter text-xs text-black/40">
        {/* visível só enquanto a lista real não chega */}
        Lista de parceiros a confirmar.
      </p>
    </section>
  );
}
