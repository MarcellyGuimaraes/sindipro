import { createClient } from "@/lib/supabase/server";
import type { NewsRow } from "@/lib/types";

/**
 * Acesso de leitura às notícias publicadas (site público).
 *
 * Lê do Supabase via Server Components. O RLS já restringe o público a
 * status = 'published'; mantemos o filtro explícito por clareza.
 */

export const NEWS_PAGE_SIZE = 6;

const PLACEHOLDER = "/placeholder-news.svg";

/** Formato de card usado pela home e pela listagem. */
export type NoticiaCard = {
  slug: string;
  /** Data de exibição em pt-BR (ex.: "10 jun 2026"). */
  date: string;
  /** ISO completo para <time dateTime>. */
  dateISO: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
};

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2026-06-10T..." → "10 jun 2026" (fuso de Sergipe). */
export function formatNewsDate(iso: string | null): { date: string; dateISO: string } {
  if (!iso) return { date: "", dateISO: "" };
  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = get("day");
  const month = MESES[Number(get("month")) - 1] ?? "";
  const year = get("year");
  return { date: `${day} ${month} ${year}`.trim(), dateISO: iso };
}

type CardSource = Pick<
  NewsRow,
  "slug" | "title" | "excerpt" | "cover_image_url" | "published_at"
>;

function toCard(row: CardSource): NoticiaCard {
  const { date, dateISO } = formatNewsDate(row.published_at);
  return {
    slug: row.slug,
    date,
    dateISO,
    title: row.title,
    summary: row.excerpt ?? "",
    image: row.cover_image_url ?? PLACEHOLDER,
    imageAlt: row.cover_image_url ? row.title : "",
  };
}

const CARD_FIELDS = "slug, title, excerpt, cover_image_url, published_at";

/** As N notícias publicadas mais recentes (home). */
export async function getLatestNews(limit = 3): Promise<NoticiaCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as CardSource[]).map(toCard);
}

/** Página de notícias publicadas (listagem /noticias). */
export async function getNewsPage(page: number) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("news")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const from = (current - 1) * NEWS_PAGE_SIZE;
  const to = from + NEWS_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("news")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  return {
    items: error || !data ? [] : (data as CardSource[]).map(toCard),
    current,
    totalPages,
    total,
  };
}

/** Notícia publicada por slug (página /noticias/[slug]). */
export async function getNewsBySlug(slug: string): Promise<NewsRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return data as NewsRow;
}
