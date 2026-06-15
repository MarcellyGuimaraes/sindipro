/**
 * Fonte de notícias — MOCK temporário (CLAUDE.md §9).
 *
 * TODO: substituir por dados reais. No futuro (§6) virá do painel da diretoria
 * / CMS; aqui ficam apenas exemplos para montar e revisar o layout.
 * Nenhum fato real deve ser presumido a partir destes textos.
 */

export type Noticia = {
  slug: string;
  /** Data de exibição em pt-BR (ex.: "10 jun 2026"). */
  date: string;
  /** Mesma data em ISO, para <time dateTime>. */
  dateISO: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  /** Corpo do post em parágrafos. */
  content: string[];
};

const IMG = "/placeholder-news.svg";

// TODO: conteúdo real de cada notícia (texto, imagem e data corretos).
export const noticias: Noticia[] = [
  {
    slug: "nova-cct-2026",
    date: "10 jun 2026",
    dateISO: "2026-06-10",
    title: "Sindipro fecha nova CCT para os provedores de Sergipe",
    summary:
      "A convenção coletiva de 2026 traz reajuste salarial, novas faixas de função e cláusulas de capacitação técnica para o setor de internet do estado.",
    image: IMG,
    imageAlt: "TODO: imagem real - assinatura da CCT",
    content: [
      "O Sindipro SE concluiu a negociação da Convenção Coletiva de Trabalho (CCT) para o período vigente, em entendimento com a representação dos trabalhadores do setor.",
      "Entre os pontos acordados estão o reajuste salarial, a revisão das faixas de função e novas cláusulas voltadas à capacitação técnica das equipes dos provedores associados.",
      "TODO: completar com os números do reajuste, vigência e demais cláusulas após a publicação oficial do documento.",
    ],
  },
  {
    slug: "audiencia-fibra-interior",
    date: "28 mai 2026",
    dateISO: "2026-05-28",
    title: "Audiência discute expansão de fibra no interior sergipano",
    summary:
      "Representantes do sindicato participaram de audiência pública sobre infraestrutura de rede nos municípios do interior.",
    image: IMG,
    imageAlt: "TODO: imagem real - audiência pública",
    content: [
      "Representantes do Sindipro SE participaram de audiência pública dedicada à expansão da infraestrutura de fibra óptica nos municípios do interior de Sergipe.",
      "Na ocasião, o sindicato apresentou a perspectiva dos provedores locais sobre os desafios de cobertura e os investimentos necessários.",
      "TODO: detalhar encaminhamentos e participantes a partir da pauta oficial da audiência.",
    ],
  },
  {
    slug: "curso-boas-praticas-regulatorias",
    date: "14 mai 2026",
    dateISO: "2026-05-14",
    title: "Curso de boas práticas regulatórias abre inscrições",
    summary:
      "Capacitação gratuita orienta os provedores associados sobre as obrigações junto à Anatel e aos órgãos de defesa do consumidor.",
    image: IMG,
    imageAlt: "TODO: imagem real - capacitação de associados",
    content: [
      "O sindicato abriu inscrições para o curso de boas práticas regulatórias, voltado às empresas associadas.",
      "O conteúdo aborda as principais obrigações junto à Anatel e aos órgãos de defesa do consumidor, com foco na rotina dos provedores de pequeno e médio porte.",
      "TODO: incluir datas, carga horária e link de inscrição quando definidos.",
    ],
  },
  {
    slug: "assembleia-geral-2026",
    date: "30 abr 2026",
    dateISO: "2026-04-30",
    title: "Assembleia geral define pautas do setor para o ano",
    summary:
      "Associados se reuniram para deliberar sobre prioridades de atuação e o calendário de negociações.",
    image: IMG,
    imageAlt: "TODO: imagem real - assembleia geral",
    content: [
      "Os associados do Sindipro SE participaram da assembleia geral que definiu as prioridades de atuação do sindicato para o ano.",
      "TODO: registrar as deliberações aprovadas e o calendário definido.",
    ],
  },
  {
    slug: "encontro-provedores-aracaju",
    date: "12 abr 2026",
    dateISO: "2026-04-12",
    title: "Encontro reúne provedores em Aracaju",
    summary:
      "Evento promoveu a troca de experiências entre empresas e debateu tendências do mercado de banda larga.",
    image: IMG,
    imageAlt: "TODO: imagem real - encontro de provedores",
    content: [
      "Provedores de todo o estado se reuniram em Aracaju para troca de experiências e debate sobre as tendências do mercado de banda larga.",
      "TODO: complementar com programação, palestrantes e número de participantes.",
    ],
  },
  {
    slug: "posicionamento-marco-regulatorio",
    date: "25 mar 2026",
    dateISO: "2026-03-25",
    title: "Sindicato divulga posicionamento sobre marco regulatório",
    summary:
      "Nota técnica reúne as contribuições do setor às mudanças regulatórias em discussão.",
    image: IMG,
    imageAlt: "TODO: imagem real - nota técnica",
    content: [
      "O Sindipro SE divulgou posicionamento com as contribuições dos provedores de Sergipe às mudanças regulatórias em discussão.",
      "TODO: anexar a nota técnica completa e referências às consultas públicas correspondentes.",
    ],
  },
  {
    slug: "balanco-negociacao-coletiva",
    date: "08 mar 2026",
    dateISO: "2026-03-08",
    title: "Balanço da negociação coletiva é apresentado aos associados",
    summary:
      "Diretoria detalhou os avanços obtidos e os próximos passos das tratativas trabalhistas.",
    image: IMG,
    imageAlt: "TODO: imagem real - reunião de balanço",
    content: [
      "A diretoria apresentou aos associados o balanço da negociação coletiva, detalhando avanços e próximos passos.",
      "TODO: incluir os indicadores apresentados na reunião.",
    ],
  },
  {
    slug: "parceria-capacitacao-tecnica",
    date: "20 fev 2026",
    dateISO: "2026-02-20",
    title: "Nova parceria amplia capacitação técnica das equipes",
    summary:
      "Acordo viabiliza treinamentos voltados à operação e à manutenção de redes dos associados.",
    image: IMG,
    imageAlt: "TODO: imagem real - treinamento técnico",
    content: [
      "Uma nova parceria firmada pelo sindicato amplia a oferta de capacitação técnica para as equipes das empresas associadas.",
      "TODO: identificar a instituição parceira e o escopo dos treinamentos.",
    ],
  },
  {
    slug: "nota-seguranca-redes",
    date: "02 fev 2026",
    dateISO: "2026-02-02",
    title: "Sindipro orienta associados sobre segurança de redes",
    summary:
      "Comunicado reúne recomendações de boas práticas de segurança para a operação dos provedores.",
    image: IMG,
    imageAlt: "TODO: imagem real - segurança de redes",
    content: [
      "O sindicato publicou comunicado com recomendações de boas práticas de segurança para a operação dos provedores associados.",
      "TODO: detalhar as recomendações e as referências utilizadas.",
    ],
  },
];

export const PAGE_SIZE = 6;

export function getAllNoticias(): Noticia[] {
  // Já em ordem decrescente de data no mock; manter explícito para o futuro.
  return [...noticias].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}

export function getNoticia(slug: string): Noticia | undefined {
  return noticias.find((n) => n.slug === slug);
}

export function getPagina(page: number) {
  const all = getAllNoticias();
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * PAGE_SIZE;
  return {
    items: all.slice(start, start + PAGE_SIZE),
    current,
    totalPages,
    total: all.length,
  };
}
