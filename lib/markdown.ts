import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Converte markdown em HTML SANITIZADO, pronto para dangerouslySetInnerHTML.
 *
 * `marked` não sanitiza — sozinho, deixaria passar <script>/<img onerror>/etc.
 * Por isso o resultado passa por DOMPurify (perfil HTML), que remove scripts,
 * handlers de evento e URLs perigosas (javascript:). Funciona no servidor e no
 * client (isomorphic). Usado na página pública da notícia e no preview do painel.
 */
export function renderMarkdown(md: string | null | undefined): string {
  const raw = marked.parse(md ?? "", { async: false }) as string;
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}
