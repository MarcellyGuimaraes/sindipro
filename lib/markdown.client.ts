import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Versão CLIENTE do renderMarkdown — usada só no preview ao vivo do painel
 * (componente client). Roda no navegador, onde existe DOM de verdade, então
 * sanitiza com DOMPurify nativo (sem jsdom). A página pública da notícia é
 * server-rendered e usa o sanitizador de servidor em lib/markdown.ts.
 */
export function renderMarkdown(md: string | null | undefined): string {
  const raw = marked.parse(md ?? "", { async: false }) as string;
  // Em SSR (sem window) não há DOM para sanitizar; o preview só importa no
  // browser, então adiamos para depois da hidratação.
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}
