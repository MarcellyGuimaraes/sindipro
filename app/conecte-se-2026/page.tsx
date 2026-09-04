import type { Metadata } from "next";
import Image from "next/image";
import {
  Beer,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  MessagesSquare,
  Mic,
} from "lucide-react";
import { fontConecteSans, fontConecteDisplay } from "@/lib/fonts";
import { Countdown } from "./Countdown";
import { TopMarquee } from "./TopMarquee";
import styles from "./conecte.module.css";

/**
 * 2º SindiproSE Conecte-se 2026 — réplica do protótipo publicado em
 * sindiprose-future-connect.lovable.app. Estrutura, textos e estilo copiados
 * 1:1 da página no ar.
 *
 * Fica FORA do grupo (site) de propósito: o protótipo é uma landing page
 * escura, sem a navbar e sem o footer do site institucional.
 * Os tokens do protótipo vivem em conecte.module.css, escopados a esta rota.
 */

export const metadata: Metadata = {
  title: "2º SINDIPROSE CONECTE-SE 2026 | 24 de Setembro, Aracaju",
  description:
    "O Provedor de Internet Pós-Reforma Tributária: desafios tributários, trabalhistas e de gestão a partir de 2027. 24/09/2026, Quality Hotel.",
  openGraph: {
    title: "2º SINDIPROSE CONECTE-SE 2026",
    description:
      "Encontro do setor de ISPs sobre o futuro tributário. 24 de setembro, 08h30 às 19h, com happy hour e música ao vivo.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const SYMPLA =
  "https://www.sympla.com.br/evento/sindiprose-conecte-se-2026/3533600";

// Nome do hotel + endereço na busca: só o nome corria o risco de cair em outra
// unidade da rede, e só o endereço não fixa o ponto exato dentro da avenida.
const MAP_QUERY = encodeURIComponent(
  "Quality Hotel Aracaju, Av. Delmiro Gouveia, 100 - Coroa do Meio, Aracaju - SE, 49035-500"
);

const MAP_EMBED = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;

const MAP_ROUTE = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

type Item = {
  kind: "Curso" | "Palestra" | "Painel" | "Happy Hour";
  time: string;
  title: string;
  speaker?: string;
  /** Observação em destaque (dourado), abaixo do palestrante. */
  note?: string;
};

const blocks: Array<{ label: string; items: Item[] }> = [
  {
    label: "Curso de OTDR",
    items: [
      {
        kind: "Curso",
        time: "09h às 17h",
        title: "Curso de OTDR",
        speaker: "Giliade Paulino - Telecom Normas",
        note: "Inclui certificado de participação.",
      },
    ],
  },
  {
    label: "Bloco 1",
    items: [
      { kind: "Palestra", time: "09:00h", title: "RH Conectado", speaker: "Samara Teles" },
      { kind: "Painel", time: "10h às 10:30h", title: "Desafios para o RH e DP com as novas regras" },
    ],
  },
  {
    label: "Bloco 2",
    items: [
      {
        kind: "Palestra",
        time: "10:30h",
        title:
          "Planejamento Tributário pós Reforma Tributária (Simples Nacional Híbrido, Lucro Presumido, Lucro Real)",
        speaker: "Carlos Ignez",
      },
      {
        kind: "Painel",
        time: "11:45h às 12:30h",
        title: "Como fica a tributação do meu provedor a partir de 2027? (Quais SVAs valerão a pena)",
      },
    ],
  },
  {
    label: "Bloco 3",
    items: [
      {
        kind: "Palestra",
        time: "14:00h",
        title:
          "Reforma Tributária: O Split Payment e seus Impactos no Fluxo de Caixa, Compliance e Tecnologia",
        speaker: "Dra Fabiana Moreira",
      },
      { kind: "Painel", time: "15:30h", title: "Fluxo de Caixa pós reforma tributária" },
    ],
  },
  {
    label: "Bloco 4",
    items: [
      {
        kind: "Palestra",
        time: "16:00h",
        title: "O dono técnico virou CEO — Gestão do Provedor na Prática",
        speaker: "Pedro Neto",
      },
    ],
  },
  {
    label: "Bloco 5",
    items: [
      {
        kind: "Happy Hour",
        time: "17h às 19h",
        title:
          "Momento de network, com chopp, petiscos, refrigerante e música ao vivo (voz e violão)",
      },
    ],
  },
];

const kindIcon = {
  Curso: GraduationCap,
  Palestra: Mic,
  Painel: MessagesSquare,
  "Happy Hour": Beer,
};

const stats = [
  { icon: CalendarDays, label: "Data", value: "24 de Setembro" },
  { icon: MapPin, label: "Local", value: "Quality Hotel Aracaju" },
  { icon: Clock, label: "Duração", value: "08h30 às 19h" },
];

const venueFacts = [
  {
    label: "Endereço",
    value: "Av. Delmiro Gouveia, 100 - Coroa do Meio, Aracaju - SE, 49035-500",
  },
  { label: "Abertura", value: "08h30" },
  { label: "Encerramento", value: "19h" },
  { label: "Estacionamento", value: "Gratuito no local" },
];

type SponsorTier = "diamante" | "ouro" | "prata" | "bronze" | "extra";

type Sponsor = {
  name: string;
  src: string;
  tier: SponsorTier;
};

/**
 * Ordem e cotas fechadas pela diretoria (02/09/2026). Gleebem e RG Soluções
 * ainda não enviaram arte — não entram até chegar o arquivo.
 *
 * A cota define só a ORDEM na grade: todos os cards têm o mesmo tamanho.
 * Cards menores para as cotas menores deixavam aquelas logos ilegíveis.
 */
const sponsors: Sponsor[] = [
  { name: "Del Finance", src: "/img/conecte-se-2026/patrocinadores/del-finance.png", tier: "diamante" },
  { name: "Point", src: "/img/conecte-se-2026/patrocinadores/point.png", tier: "diamante" },
  { name: "Exatas Contabilidade", src: "/img/conecte-se-2026/patrocinadores/exatas.png", tier: "diamante" },
  { name: "Revisa Consultoria Tributária", src: "/img/conecte-se-2026/patrocinadores/revisa-tributaria.png", tier: "diamante" },
  { name: "Revisa Consultoria Jurídica", src: "/img/conecte-se-2026/patrocinadores/revisa-juridica.png", tier: "diamante" },
  { name: "AX Code Tecnologia", src: "/img/conecte-se-2026/patrocinadores/ax-code.png", tier: "diamante" },
  { name: "Smart Datacenter", src: "/img/conecte-se-2026/patrocinadores/smart-datacenter.png", tier: "ouro" },
  { name: "Cariap", src: "/img/conecte-se-2026/patrocinadores/cariap.png", tier: "prata" },
  { name: "Lummus Energy", src: "/img/conecte-se-2026/patrocinadores/lummus-energy.png", tier: "prata" },
  { name: "Caju Service", src: "/img/conecte-se-2026/patrocinadores/caju-service.png", tier: "prata" },
  { name: "Eletronet", src: "/img/conecte-se-2026/patrocinadores/eletronet.png", tier: "bronze" },
  { name: "Ítalo Encoseg SST", src: "/img/conecte-se-2026/patrocinadores/encoseg.png", tier: "extra" },
  { name: "José Igor Engenharia de Telecomunicações", src: "/img/conecte-se-2026/patrocinadores/jose-igor.png", tier: "extra" },
];

/**
 * Card estático da grade de patrocinadores. A cota só define a ordem
 * na lista `sponsors` — não aparece na tela.
 */
function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <li>
      <div className={styles.sponsorCard}>
        <div className={styles.sponsorLogoBox}>
          <Image
            src={sponsor.src}
            alt={sponsor.name}
            width={480}
            height={240}
            className={styles.sponsorLogo}
          />
        </div>
      </div>
    </li>
  );
}

export default function ConecteSe2026Page() {
  return (
    <div
      className={`${styles.page} ${fontConecteSans.variable} ${fontConecteDisplay.variable}`}
    >
      <TopMarquee href={SYMPLA} />

      {/* BANNER — sangra na largura toda, sem moldura. */}
      <section className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/conecte-se-2026/banner.png"
          alt="2º SINDIPROSE CONECTE-SE 2026 — O Provedor de Internet Pós-Reforma Tributária, 24 de setembro, Quality Hotel"
          className="block w-full"
        />
      </section>

      {/* BARRA — título, contagem regressiva e inscrição. */}
      <section className={`${styles.bgPrimary} w-full`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-6 text-center sm:px-6 lg:flex-row lg:justify-between lg:gap-10 lg:text-left">
          <h1
            className={`${styles.textPrimaryFg} max-w-md text-2xl uppercase leading-tight sm:text-3xl`}
          >
            CONECTE-SE 2026
            <span
              className={`${styles.textPrimaryFg90} mt-2 block text-base font-normal normal-case leading-snug sm:text-lg`}
            >
              O Provedor de Internet Pós-Reforma Tributária
            </span>
            <span
              className={`${styles.textPrimaryFg80} mt-1 block text-sm font-normal normal-case leading-snug`}
            >
              Os novos desafios tributários, trabalhistas e de gestão a partir de 2027.
            </span>
          </h1>

          <Countdown />

          <div className="flex flex-col items-center gap-2">
            <a
              href={SYMPLA}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.bgBackground} ${styles.textPrimary} ${styles.display} ${styles.hoverScale} inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-extrabold uppercase tracking-wide`}
            >
              Inscreva-se agora
            </a>
            <span
              className={`${styles.textPrimaryFg80} text-[0.7rem] font-semibold uppercase tracking-[0.15em]`}
            >
              Últimas vagas
            </span>
          </div>
        </div>
      </section>

      <main className="w-full">
        {/* PROGRAMAÇÃO */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <section className="mt-16">
            <div className="max-w-2xl">
              <p
                className={`${styles.goldGradient} text-xs font-semibold uppercase tracking-[0.35em]`}
              >
                Programação
              </p>
              <h2 className="mt-3 text-2xl font-extrabold uppercase sm:text-4xl">
                Um dia inteiro de conteúdo estratégico
              </h2>
            </div>

            <div className="mt-10 space-y-6">
              {blocks.map((block) => (
                <div key={block.label} className="grid gap-4 md:grid-cols-[130px_1fr]">
                  <div className="md:pt-1.5">
                    <span
                      className={`${styles.bgSecondary} inline-flex items-center rounded-full px-3.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em]`}
                    >
                      {block.label}
                    </span>
                  </div>

                  <ol
                    className={`${styles.borderBorder} relative space-y-3 border-l pl-5 md:pl-7`}
                  >
                    {block.items.map((item) => {
                      const Icon = kindIcon[item.kind];
                      return (
                        <li key={item.time + item.title} className="relative">
                          <span
                            className={`${styles.bgPrimary} absolute -left-[1.7rem] top-3.5 flex h-5 w-5 items-center justify-center rounded-full md:-left-[2.2rem]`}
                            aria-hidden="true"
                          >
                            <Icon className={`${styles.textPrimaryFg} h-3 w-3`} />
                          </span>
                          <div
                            className={`${styles.surfaceCard} ${styles.roundedLg} px-4 py-3.5`}
                          >
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span
                                className={`${styles.bgPrimary15} ${styles.textPrimary} ${styles.roundedMd} px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest`}
                              >
                                {item.kind}
                              </span>
                              <span
                                className={`${styles.display} ${styles.goldGradient} text-base font-bold`}
                              >
                                {item.time}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-semibold leading-snug sm:text-[0.95rem]">
                              {item.title}
                            </p>
                            {item.speaker && (
                              <p className={`${styles.textMuted} mt-1 text-xs`}>
                                Palestrante:{" "}
                                <span
                                  className={`${styles.textForeground} font-semibold`}
                                >
                                  {item.speaker}
                                </span>
                              </p>
                            )}
                            {item.note && (
                              <p
                                className={`${styles.goldGradient} mt-1.5 text-xs font-semibold`}
                              >
                                {item.note}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CHAMADA — inscrição */}
        <section className={`${styles.bgPrimary} mt-24 w-full`}>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-3xl">
              {/* O protótipo aplica whitespace-nowrap em todos os tamanhos, e
                  no celular o título estoura a largura da tela e cria rolagem
                  horizontal. Aqui a linha única só vale de lg para cima, onde
                  o texto cabe de fato. */}
              <h2
                className={`${styles.textPrimaryFg} text-2xl font-extrabold uppercase leading-tight sm:text-3xl md:text-4xl lg:whitespace-nowrap`}
              >
                Faça parte do principal encontro do setor de ISPs
              </h2>
              <p className={`${styles.textPrimaryFg85} mt-5 text-base sm:text-lg`}>
                Posicione sua marca diante dos principais tomadores de decisão do setor e
                contribua para um evento de alto nível técnico e estratégico sobre o
                futuro tributário.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className={`${styles.bgPrimaryFg10} ${styles.rounded2xl} p-6`}
                >
                  <Icon className={`${styles.textPrimaryFg} h-7 w-7`} aria-hidden="true" />
                  <p
                    className={`${styles.textPrimaryFg75} mt-4 text-[0.7rem] font-bold uppercase tracking-[0.25em]`}
                  >
                    {label}
                  </p>
                  <p
                    className={`${styles.display} ${styles.textPrimaryFg} mt-1 text-2xl font-bold`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <a
                href={SYMPLA}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.registrationButton} ${styles.hoverScale} inline-flex items-center justify-center rounded-full px-9 py-4 text-sm font-bold uppercase tracking-[0.15em]`}
              >
                Quero garantir minha vaga
              </a>
            </div>
          </div>
        </section>

        {/* LOCAL */}
        <section className={`${styles.surfaceLight} w-full`}>
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-2xl">
              <p
                className={`${styles.goldGradient} text-xs font-semibold uppercase tracking-[0.35em]`}
              >
                Local
              </p>
              <h2 className="mt-3 text-3xl font-extrabold uppercase sm:text-5xl">
                Quality Hotel Aracaju
              </h2>
              <p className={`${styles.textMuted} mt-4 text-sm sm:text-base`}>
                Av. Delmiro Gouveia, 100, Coroa do Meio — estacionamento próprio e fácil
                acesso. O evento começa às 08h30 e segue até às 19h.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div
                className={`${styles.surfaceLightCard} ${styles.rounded2xl} overflow-hidden`}
              >
                <iframe
                  title="Mapa — Quality Hotel Aracaju"
                  src={MAP_EMBED}
                  className="block h-[340px] w-full sm:h-[420px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div
                className={`${styles.surfaceLightCard} ${styles.rounded2xl} flex flex-col justify-center gap-5 p-6 sm:p-8`}
              >
                {venueFacts.map(({ label, value }) => (
                  <div key={label}>
                    <p
                      className={`${styles.textMuted} text-[0.7rem] font-bold uppercase tracking-[0.25em]`}
                    >
                      {label}
                    </p>
                    <p className={`${styles.display} mt-1 text-lg font-bold`}>{value}</p>
                  </div>
                ))}

                <a
                  href={MAP_ROUTE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.bgPrimary} ${styles.textPrimaryFg} ${styles.hoverBgPrimary90} inline-flex w-fit items-center justify-center rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] transition-colors`}
                >
                  Traçar rota
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PATROCINADORES — faixa clara depois do local, cards iguais por cota. */}
        <section className={`${styles.surfaceLight} w-full`}>
          <div
            className={`${styles.borderBorder} mx-auto w-full max-w-6xl border-t px-4 py-12 sm:px-6 sm:py-14`}
          >
            <div className="max-w-2xl">
              <p
                className={`${styles.goldGradient} text-xs font-semibold uppercase tracking-[0.35em]`}
              >
                Patrocinadores
              </p>
              <h2 className="mt-3 text-2xl font-extrabold uppercase sm:text-4xl">
                Quem torna o encontro possível
              </h2>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sponsors.map((sponsor) => (
                <SponsorCard key={sponsor.src} sponsor={sponsor} />
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className={`${styles.bgNavyDeep} ${styles.borderBorder} w-full border-t`}>
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <Image
                src="/img/sindipro-logo.png"
                alt="SindiproSE"
                width={955}
                height={309}
                className={`${styles.logoWhite} h-10 w-auto`}
              />
              <p className={`${styles.textMuted} mt-4 max-w-xs text-sm`}>
                Sindicato dos Provedores de Internet do Estado de Sergipe. CONECTE-SE 2026
                — o principal encontro do setor de ISPs.
              </p>
            </div>

            <div>
              <p
                className={`${styles.goldGradient} text-xs font-bold uppercase tracking-[0.25em]`}
              >
                Evento
              </p>
              <ul className={`${styles.textMuted} mt-4 space-y-2 text-sm`}>
                <li>24 de Setembro de 2026</li>
                <li>08h30 às 19h</li>
                <li>Quality Hotel Aracaju</li>
              </ul>
            </div>

            <div>
              <p
                className={`${styles.goldGradient} text-xs font-bold uppercase tracking-[0.25em]`}
              >
                Garanta sua vaga
              </p>
              <a
                href={SYMPLA}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.bgPrimary} ${styles.textPrimaryFg} ${styles.hoverScale} mt-4 inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.15em]`}
              >
                Inscreva-se
              </a>
            </div>
          </div>

          <div
            className={`${styles.textMuted} ${styles.borderBorder} mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs uppercase tracking-[0.2em] sm:flex-row`}
          >
            <span>© 2026 Sindipro-SE · Todos os direitos reservados</span>
            <span>Av. Delmiro Gouveia, 100 - Coroa do Meio, Aracaju - SE, 49035-500</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
