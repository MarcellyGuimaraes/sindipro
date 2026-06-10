"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ButtonLink } from "@/components/Button";
import { Eyebrow } from "@/components/Eyebrow";

/**
 * Hero da Home (CLAUDE.md §9): eyebrow, headline institucional, subtítulo curto,
 * CTA primário + secundário. Alinhado à esquerda, faixa navy-900 chapada.
 *
 * Movimento (§7): UM único momento orquestrado no load — entrada do bloco de
 * texto (fade + leve subida) e o desenho do traço dourado da pena. Nada mais
 * se mexe. Respeita prefers-reduced-motion.
 *
 * Performance: framer-motion carregado via LazyMotion (subconjunto domAnimation),
 * e a headline (elemento de LCP) NÃO embarca com opacity:0 — anima só o
 * deslocamento, para pintar de imediato sem esperar a hidratação.
 *
 * TODO: definir destino real do CTA primário (página/fluxo de "Associe-se" ou
 * formulário de contato). Por ora aponta para a âncora de contato do footer.
 */

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.09,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };

  // Itens secundários: fade + subida.
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.5, ease: EASE },
    },
  };

  // Headline: mantém opacity 1 (LCP pinta já); anima apenas o deslocamento.
  const headlineItem: Variants = {
    hidden: { y: reduce ? 0 : 12 },
    show: {
      y: 0,
      transition: { duration: reduce ? 0 : 0.5, ease: EASE },
    },
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="relative overflow-hidden bg-navy-900 text-bg">
        {/* Traço dourado da pena — assinatura, desenhada uma vez no load. */}
        <FeatherSignature reduce={!!reduce} />

        <m.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mx-auto w-full max-w-container px-6 py-20 sm:px-8 sm:py-28 lg:py-32"
        >
          <div className="max-w-2xl lg:max-w-[60%]">
            <m.div variants={item}>
              <Eyebrow tone="light">Sindicato patronal · Sergipe</Eyebrow>
            </m.div>

            <m.h1
              variants={headlineItem}
              className="mt-5 font-display text-display-l font-semibold leading-[1.05] text-bg sm:text-display-xl"
            >
              Representamos os provedores de internet de Sergipe.
            </m.h1>

            {/* Sublinhado dourado da pena, sob a headline. */}
            <m.div variants={item} className="mt-5">
              <HeadlineUnderline reduce={!!reduce} />
            </m.div>

            <m.p variants={item} className="mt-6 max-w-xl text-body text-blue-200">
              Defesa do setor, negociação de CCT e ACT e representação dos
              provedores de internet e de comunicação multimídia junto ao poder
              público e à sociedade.
            </m.p>

            <m.div
              variants={item}
              className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              {/* TODO: destino real do CTA primário (associe-se / contato). */}
              <ButtonLink href="#contato" variant="primary" size="lg" onDark>
                Fale com o sindicato
              </ButtonLink>
              <ButtonLink href="/noticias" variant="secondary" size="lg" onDark>
                Últimas notícias
              </ButtonLink>
            </m.div>
          </div>
        </m.div>
      </section>
    </LazyMotion>
  );
}

/**
 * Sublinhado curto que desenha junto com a entrada do título.
 * Mesma linguagem da FeatherUnderline, mas animável (pathLength).
 */
function HeadlineUnderline({ reduce }: { reduce: boolean }) {
  return (
    <svg
      width="120"
      height="12"
      viewBox="0 0 120 12"
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <m.path
        d="M1 7C26 7 54 7 82 6.4C96 6 108 5.1 117 2.2"
        stroke="var(--gold-600)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: reduce ? 0 : 0.7,
          ease: EASE,
          delay: reduce ? 0 : 0.55,
        }}
      />
    </svg>
  );
}

/**
 * A asa/pena estilizada, grande, no canto inferior-direito — fora do texto.
 * Desenha-se uma única vez no load. Em telas pequenas fica discreta no topo.
 */
function FeatherSignature({ reduce }: { reduce: boolean }) {
  return (
    <div
      className="pointer-events-none absolute -right-10 bottom-0 hidden h-full w-[46%] items-end justify-end sm:flex"
      aria-hidden="true"
    >
      <svg
        className="h-auto w-full max-w-[520px] translate-y-6"
        viewBox="0 0 520 420"
        fill="none"
        role="presentation"
      >
        <m.path
          d="M470 40C360 78 270 152 214 256C190 300 176 342 180 372C250 344 320 300 378 236C436 172 466 110 470 40Z"
          stroke="var(--gold-600)"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.55 : 0 }}
          animate={{ pathLength: 1, opacity: 0.55 }}
          transition={{
            duration: reduce ? 0 : 1.4,
            ease: EASE,
            delay: reduce ? 0 : 0.2,
          }}
        />
        <m.path
          d="M420 96C330 150 256 220 210 300"
          stroke="var(--gold-600)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.4 : 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{
            duration: reduce ? 0 : 1.2,
            ease: EASE,
            delay: reduce ? 0 : 0.5,
          }}
        />
        <m.path
          d="M384 80C300 140 234 208 192 292"
          stroke="var(--gold-600)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.28 : 0 }}
          animate={{ pathLength: 1, opacity: 0.28 }}
          transition={{
            duration: reduce ? 0 : 1.2,
            ease: EASE,
            delay: reduce ? 0 : 0.7,
          }}
        />
      </svg>
    </div>
  );
}
