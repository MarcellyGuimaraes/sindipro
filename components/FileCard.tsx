import { FileText, Download } from "lucide-react";
import { ButtonLink } from "./Button";

/**
 * Card de arquivo (CLAUDE.md §8): nome do documento, tipo (CCT/ACT),
 * ícone de PDF, botão "Baixar". Sóbrio, borda 1px blue-200.
 */

export type FileCardProps = {
  name: string;
  /** Tipo do documento — vira badge dourado pequeno (único uso de área dourada permitido). */
  type: "CCT" | "ACT" | string;
  /** Metadado curto: ano/vigência/tamanho. */
  meta?: string;
  href: string;
};

export function FileCard({ name, type, meta, href }: FileCardProps) {
  return (
    <article className="flex items-start gap-4 rounded-card border border-blue-200 bg-surface p-5">
      <span
        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded border border-blue-200 text-navy-700"
        aria-hidden="true"
      >
        <FileText className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-sm bg-gold-200/60 px-2 py-0.5 text-eyebrow font-medium uppercase tracking-[0.08em] text-gold-600">
            {type}
          </span>
          {meta && <span className="text-small text-navy-900/80">{meta}</span>}
        </div>
        <h3 className="mt-1.5 font-display text-h3 font-medium text-navy-900">
          {name}
        </h3>
      </div>

      <ButtonLink
        href={href}
        variant="secondary"
        size="md"
        className="shrink-0"
        aria-label={`Baixar ${name}`}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Baixar
      </ButtonLink>
    </article>
  );
}
