import { FileText, Download } from "lucide-react";
import { PillLink } from "./Pill";

/**
 * Card de arquivo — visual Lovable: card branco rounded-[20px] sobre o cream,
 * badge do tipo em pílula brand suave, ícone de PDF e botão "Baixar" em pílula.
 */

export type FileCardProps = {
  name: string;
  /** Tipo do documento (CCT/ACT/Kit…). */
  type: string;
  /** Metadado curto: ano/vigência/tamanho. */
  meta?: string;
  href: string;
};

export function FileCard({ name, type, meta, href }: FileCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-[20px] bg-white p-6 font-inter sm:flex-row sm:items-center">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"
        aria-hidden="true"
      >
        <FileText className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
            {type}
          </span>
          {meta && <span className="text-xs text-black/50">{meta}</span>}
        </div>
        {/* font/cor explícitos: o legado pode estilizar h3 */}
        <h3 className="mt-1.5 font-inter text-lg font-bold leading-snug text-black">
          {name}
        </h3>
      </div>

      <PillLink href={href} tone="black" small icon={Download} className="shrink-0 self-start sm:self-center">
        Baixar
      </PillLink>
    </article>
  );
}
