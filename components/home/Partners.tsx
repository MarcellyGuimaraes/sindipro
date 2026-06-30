import Image from "next/image";
import { getPartners, type PartnerPublic } from "@/lib/partners";

/**
 * "Parceiros" — faixa discreta sobre o cream (sem fundo colorido). Os logos
 * passam num carrossel automático (marquee, ver .animate-marquee no globals.css)
 * que pausa no hover.
 *
 * Conteúdo vem do Supabase (tabela `partners`, gerida pelo painel). A seção some
 * quando não há parceiros cadastrados.
 *
 * Acessibilidade: a 2ª metade da faixa é decorativa (aria-hidden) e o movimento
 * é desligado por prefers-reduced-motion (globals.css). Logos com fundo branco
 * usam mix-blend-multiply para casar com o cream.
 */

function LogoItem({
  partner,
  decorativo,
}: {
  partner: PartnerPublic;
  decorativo?: boolean;
}) {
  const conteudo = partner.logoUrl ? (
    <Image
      src={partner.logoUrl}
      alt={partner.name}
      width={180}
      height={64}
      className="h-12 w-auto object-contain mix-blend-multiply sm:h-14"
      unoptimized
    />
  ) : (
    // Sem logo enviado ainda → wordmark com o nome.
    <span className="select-none font-inter text-xl font-bold tracking-tight text-black/30">
      {partner.name}
    </span>
  );

  return (
    <li
      className="mr-12 flex shrink-0 items-center sm:mr-16"
      aria-hidden={decorativo}
    >
      {partner.linkUrl ? (
        <a
          href={partner.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={partner.name}
          tabIndex={decorativo ? -1 : undefined}
          className="focus-visible:outline-brand"
        >
          {conteudo}
        </a>
      ) : (
        conteudo
      )}
    </li>
  );
}

export async function Partners() {
  const parceiros = await getPartners();
  if (parceiros.length === 0) return null;

  // A faixa precisa ser larga o bastante para preencher a tela; repete a lista
  // curta até ter um mínimo de itens, depois duplica tudo para o loop (-50%).
  const MIN_ITENS = 8;
  const repeticoes = Math.max(1, Math.ceil(MIN_ITENS / parceiros.length));
  const faixa = Array.from({ length: repeticoes }).flatMap(() => parceiros);

  return (
    <section id="parceiros" className="mx-auto max-w-6xl px-2 py-10 md:py-14">
      {/* Carrossel: faixa com duas cópias para loop contínuo (-50%). */}
      <div className="group relative overflow-hidden">
        {/* Esmaecimento nas bordas, no tom do fundo */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-cream to-transparent md:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-cream to-transparent md:w-24" />

        <ul className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]">
          {faixa.map((p, i) => (
            <LogoItem key={`${p.id}-${i}`} partner={p} />
          ))}
          {/* Cópia decorativa para o loop sem emenda */}
          {faixa.map((p, i) => (
            <LogoItem key={`dup-${p.id}-${i}`} partner={p} decorativo />
          ))}
        </ul>
      </div>
    </section>
  );
}
