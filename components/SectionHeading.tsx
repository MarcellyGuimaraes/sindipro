import { Eyebrow } from "./Eyebrow";
import { FeatherUnderline } from "./Feather";

/**
 * Eyebrow + título de seção com o sublinhado dourado (motivo da pena).
 * Alinhado à esquerda por padrão (CLAUDE.md §3, nº6).
 * O sublinhado é a assinatura — só na abertura, não em todo H2.
 */

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  /** Tom claro quando estiver sobre fundo navy. */
  tone?: "default" | "light";
  /** Nível semântico do título. */
  as?: "h1" | "h2";
  /** Tamanho visual. */
  size?: "display-l" | "h2";
  /** Esconde o sublinhado dourado (quando não for abertura). */
  underline?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  tone = "default",
  as: Tag = "h2",
  size = "display-l",
  underline = true,
  className,
}: SectionHeadingProps) {
  const titleColor = tone === "light" ? "text-bg" : "text-navy-900";
  const titleSize = size === "display-l" ? "text-display-l" : "text-h2";

  return (
    <div className={`max-w-2xl ${className ?? ""}`}>
      {eyebrow && (
        <Eyebrow tone={tone} className="mb-3">
          {eyebrow}
        </Eyebrow>
      )}
      <Tag className={`font-display font-semibold ${titleSize} ${titleColor}`}>
        {title}
      </Tag>
      {underline && <FeatherUnderline className="mt-4" />}
    </div>
  );
}
