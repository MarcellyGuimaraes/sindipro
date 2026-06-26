"use client";

import { useEffect, useRef, useState } from "react";
import { FeatherMark } from "@/components/Feather";

/**
 * "Missão · Visão · Valores" — tela institucional do print do cliente.
 *
 * Seção "pinada" (sticky): enquanto a página rola, o painel fica fixo e o
 * DESTAQUE muda Missão → Visão → Valores, trocando o conteúdo à direita. A
 * navegação à esquerda também é clicável (vai até o item).
 *
 * O item ativo é dirigido por DOIS mecanismos redundantes (o que disparar
 * primeiro vence; ambos calculam o mesmo índice):
 *  1) evento de `scroll` (posição da seção → terço atual) — também alimenta o
 *     trilho de progresso;
 *  2) IntersectionObserver com uma faixa real no centro da viewport (sentinelas
 *     de uma viewport cada) — cobre o caso de o scroll não disparar.
 * Sem requestAnimationFrame: o estado de repouso é sempre visível, então o
 * conteúdo nunca some se o navegador limitar animações (também cobre
 * prefers-reduced-motion).
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
      <p className="max-w-xl text-lg leading-relaxed text-white/80 md:text-2xl md:leading-snug">
        Representar as empresas provedoras de internet de Sergipe como um setor organizado 
        perante a sociedade civil, órgãos públicos e reguladores, ajudando no desenvolvimento 
        dos associados e levando conectividade para os municípios do estado.
      </p>
    ),
  },
  {
    id: "visao",
    label: "Visão",
    body: (
      <p className="max-w-xl text-lg leading-relaxed text-white/80 md:text-2xl md:leading-snug">
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
      <ul className="max-w-xl space-y-3.5 text-white/80">
        {[
          ["União e Colaboração", "Fortalecer o setor através da parceria entre os provedores associados."],
          ["Inovação", "Apoiar o constante desenvolvimento tecnológico e a modernização da infraestrutura da nossa região."],
          ["Inclusão Digital", "Garantir que a conectividade de verdade chegue a todas as pessoas e municípios sergipanos."],
          ["Ética e Transparência", "Agir com integridade perante os associados, a sociedade e os órgãos reguladores."],
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
  const wrapperRef = useRef<HTMLElement>(null);
  const sentinels = useRef<(HTMLDivElement | null)[]>([]);
  // `active` = item destacado pela rolagem; `shown` = item renderizado no painel
  // (defasado uma fração de segundo para o fade de troca).
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  // Driver 1 — evento de scroll: progresso (0→1) e item por terços.
  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const range = el.offsetHeight - window.innerHeight;
      if (range <= 0) {
        setProgress(0);
        setActive(0);
        return;
      }
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range));
      setProgress(p);
      setActive(Math.min(ITEMS.length - 1, Math.floor(p * ITEMS.length)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Driver 2 — IntersectionObserver (faixa real no centro): redundante ao scroll.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.idx));
          }
        }
      },
      // Faixa de ~2% de altura no centro (não zero): evita o caso degenerado em
      // que o root de altura zero nunca reporta interseção.
      { rootMargin: "-49% 0px -49% 0px", threshold: 0 }
    );
    sentinels.current.forEach((s) => s && obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Crossfade: ao mudar o destaque, esmaece, troca o conteúdo e reaparece.
  useEffect(() => {
    if (active === shown) return;
    setVisible(false);
    const t = setTimeout(() => {
      setShown(active);
      setVisible(true);
    }, 180);
    return () => clearTimeout(t);
  }, [active, shown]);

  function goTo(index: number) {
    const el = wrapperRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(0, el.offsetHeight - window.innerHeight);
    const target = top + ((index + 0.5) / ITEMS.length) * range;
    window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
  }

  const current = ITEMS[shown];

  return (
    // A altura extra (uma viewport por item) é o "trilho" da rolagem; o cartão
    // interno fica fixo (sticky) e troca o conteúdo conforme se avança.
    <section
      ref={wrapperRef}
      aria-label="Missão, visão e valores"
      className="relative mt-5"
      style={{ height: `${ITEMS.length * 100}vh` }}
    >
      {/* Sentinelas invisíveis (uma viewport por item) para o IntersectionObserver. */}
      {ITEMS.map((it, i) => (
        <div
          key={it.id}
          ref={(el) => {
            sentinels.current[i] = el;
          }}
          data-idx={i}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-screen"
          style={{ top: `${i * 100}vh` }}
        />
      ))}

      <div className="sticky top-0 flex h-screen items-center overflow-hidden rounded-[28px] bg-navy-900 font-inter">
        {/* Pena dourada — assinatura, canto inferior direito */}
        <FeatherMark
          size={260}
          className="pointer-events-none absolute -bottom-10 -right-8 opacity-[0.07]"
        />

        <div className="relative w-full px-6 py-12 md:px-14 md:py-16">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[300px_minmax(0,1fr)] md:gap-16">
            {/* Navegação vertical (trilho de progresso + rótulos) */}
            <nav className="flex items-stretch gap-5">
              {/* Trilho de progresso — só desktop */}
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
                    <li key={it.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => goTo(i)}
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
                              ? "text-4xl text-white md:text-6xl"
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

            {/* Conteúdo — painel translúcido que troca conforme o destaque */}
            <div className="relative min-w-0 min-h-[16rem] md:min-h-[20rem]">
              <article
                className={`rounded-2xl bg-white/[0.06] p-7 ring-1 ring-white/15 backdrop-blur-sm transition-opacity duration-300 md:p-12 ${
                  visible ? "opacity-100" : "opacity-0"
                }`}
              >
                {current.body}
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
