/**
 * Tempo relativo em pt-BR para o feed da área do associado ("há 2 horas",
 * "ontem", "há 3 dias"). Para itens antigos (> ~1 semana) cai para a data
 * cheia, que é mais útil do que "há 42 dias".
 */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso);
  const ms = then.getTime();
  if (Number.isNaN(ms)) return "";

  const diffSec = Math.round((Date.now() - ms) / 1000);

  if (diffSec < 45) return "agora";
  if (diffSec < 90) return "há 1 minuto";

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} minutos`;

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `há ${diffHour} ${diffHour === 1 ? "hora" : "horas"}`;

  const diffDay = Math.round(diffHour / 24);
  if (diffDay === 1) return "ontem";
  if (diffDay < 7) return `há ${diffDay} dias`;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(then);
}
