"use client";

import { useEffect, useRef, useState } from "react";
import { FeatherMark } from "@/components/Feather";

/**
 * "Missão · Visão · Valores" — card institucional compacto.
 *
 * Card pequeno em fluxo normal (não fixa a tela, não cria região de rolagem).
 * A passagem entre os itens acontece de duas formas:
 *  - CLIQUE nos rótulos;
 *  - ROLAGEM com a roda do mouse SOBRE o card — enquanto houver próximo item, o
 *    scroll é capturado e só troca o destaque (a página não rola); ao chegar no
 *    primeiro/último, o scroll é liberado e a página rola normalmente.
 * Assim a "rolagem" fica só dentro do card, sem espaço sobrando por fora.
 *
 * Identidade do site: superfície navy chapada (#1c4464), Inter, acento dourado
 * (gold-600) no item ativo + a pena (FeatherMark) como assinatura.
 */

type Item = {
  id: string;
  label: string;
  body: React.ReactNode;
};

const ITEMS: Item[] = [
  {
    id: "missao",
    label: "Missão",
    body: (
      <p className="text-lg leading-relaxed text-white/85 md:text-2xl md:leading-snug">
        Representar os Provedores de Internet de Sergipe perante a sociedade civil,
        órgãos públicos e agências reguladoras, ajudando no desenvolvimento dos
        associados e do estado de Sergipe.
      </p>
    ),
  },
  {
    id: "visao",
    label: "Visão",
    body: (
      <p className="text-lg leading-relaxed text-white/85 md:text-2xl md:leading-snug">
        Ser a principal referência no fortalecimento e desenvolvimento do mercado
        de telecomunicações em Sergipe, promovendo a universalização da internet
        de alta qualidade em todo o estado.
      </p>
    ),
  },
  {
    id: "valores",
    label: "Valores",
    body: (
      <ul className="space-y-3.5 text-white/85">
        {[
          ["Ética e Transparência", "Agir com integridade perante os associados, a sociedade e os órgãos reguladores."],
          ["União e Colaboração", "Fortalecer o setor através da parceria entre os provedores associados e fornecedores."],
          ["Inovação", "Apoiar o constante desenvolvimento tecnológico e a modernização da infraestrutura da nossa região."],
          ["Inclusão Digital", "Garantir que a conectividade de verdade chegue a todas as pessoas e municípios sergipanos."],
        ].map(([titulo, desc]) => (
          <li key={titulo} className="flex gap-3">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600"
              aria-hidden="true"
            />
            <span className="text-base leading-relaxed md:text-lg">
              <span className="font-semibold text-white">{titulo}.</span> {desc}
            </span>
          </li>
        ))}
      </ul>
    ),
  },
];

export function MissaoVisaoValores() {
  const cardRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  // `active` = item destacado; `shown` = item no painel (defasado p/ o crossfade).
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [visible, setVisible] = useState(true);
  activeRef.current = active;

  // Crossfade: ao trocar o destaque, esmaece, troca o conteúdo e reaparece.
  useEffect(() => {
    if (active === shown) return;
    setVisible(false);
    const t = setTimeout(() => {
      setShown(active);
      setVisible(true);
    }, 180);
    return () => clearTimeout(t);
  }, [active, shown]);

  // Rolagem só dentro do card: a roda do mouse sobre o card troca o item; nos
  // extremos, libera o scroll da página (não prende o usuário).
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    let locked = false;
    const onWheel = (e: WheelEvent) => {
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = activeRef.current + dir;
      if (next < 0 || next >= ITEMS.length) return; // extremo: deixa a página rolar
      e.preventDefault();
      if (locked) return;
      locked = true;
      setActive(next);
      window.setTimeout(() => {
        locked = false;
      }, 450);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const progress = (active + 1) / ITEMS.length;

  return (
    <div
      ref={cardRef}
      aria-label="Missão, visão e valores"
      className="relative mt-5 overflow-hidden rounded-[28px] bg-navy-900 font-inter"
    >
      {/* Pena dourada — assinatura, canto inferior direito */}
      <FeatherMark
        size={220}
        className="pointer-events-none absolute -bottom-8 -right-6 opacity-[0.07]"
      />

      <div className="relative px-6 py-10 md:px-14 md:py-12">
        <p className="mb-8 text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-white/45 md:mb-10">
          Identidade institucional
        </p>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[260px_minmax(0,1fr)] md:gap-12">
          {/* Lista de rótulos (clicáveis) + trilho de progresso */}
          <nav className="flex items-stretch gap-5" aria-label="Selecionar missão, visão ou valores">
            <div className="relative hidden w-px shrink-0 self-stretch bg-white/15 md:block">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 origin-top bg-gold-600 transition-[height] duration-300 ease-out"
                style={{ height: `${progress * 100}%` }}
              />
            </div>

            <ul className="flex flex-1 flex-col gap-4 md:gap-5">
              {ITEMS.map((it, i) => {
                const isActive = i === active;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={isActive ? "true" : undefined}
                      className="group flex items-center gap-3 text-left focus-visible:outline-none"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-300 ${
                          isActive
                            ? "scale-100 bg-gold-600"
                            : "scale-75 bg-white/20 group-hover:bg-white/40"
                        }`}
                      />
                      <span
                        className={`font-bold uppercase leading-none tracking-tight transition-all duration-300 ${
                          isActive
                            ? "text-4xl text-white md:text-5xl"
                            : "text-2xl text-white/30 group-hover:text-white/55 md:text-3xl"
                        }`}
                      >
                        {it.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Conteúdo do item ativo.
              Os três conteúdos ficam empilhados na MESMA célula de grid
              (col-start-1/row-start-1), então o card assume sempre a altura do
              maior item — a altura não muda ao alternar Missão/Visão/Valores. */}
          <div className="relative grid min-w-0">
            {ITEMS.map((it, i) => (
              <article
                key={it.id}
                aria-hidden={i !== shown}
                className={`col-start-1 row-start-1 rounded-2xl bg-white/[0.06] p-7 ring-1 ring-white/15 backdrop-blur-sm transition-opacity duration-300 md:p-10 ${
                  i === shown && visible
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                {it.body}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
