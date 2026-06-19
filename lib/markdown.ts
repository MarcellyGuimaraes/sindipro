import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Converte markdown em HTML SANITIZADO, pronto para dangerouslySetInnerHTML.
 *
 * SERVIDOR (Server Components / build serverless): usa `sanitize-html`, um
 * sanitizador em JS puro. NÃO usamos mais isomorphic-dompurify aqui porque ele
 * arrasta o jsdom, cuja cadeia de dependências quebra na Vercel com
 * ERR_REQUIRE_ESM (html-encoding-sniffer → @exodus/bytes). O preview do painel
 * (browser) sanitiza com DOMPurify nativo em lib/markdown.client.ts.
 *
 * `marked` não sanitiza sozinho — deixaria passar <script>/<img onerror>/etc.,
 * por isso o resultado passa por sanitize-html (allowlist de tags/atributos).
 */

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "a", "ul", "ol", "li", "blockquote",
  "strong", "em", "b", "i", "del", "code", "pre",
  "br", "hr", "span", "img",
  "table", "thead", "tbody", "tr", "th", "td",
];

export function renderMarkdown(md: string | null | undefined): string {
  const raw = marked.parse(md ?? "", { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    // Sem javascript:/data: em links; imagens só http(s).
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    // Links externos abrem com segurança.
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
