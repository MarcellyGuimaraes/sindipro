/**
 * Section wrapper (CLAUDE.md §8): largura máxima ~1120px, padding vertical
 * consistente, grade base de 8px. Variantes de fundo seguem o ritmo
 * claro → tint → escuro definido no plano (nada de sombra para separar).
 */

type Tone = "bg" | "tint" | "navy";

const tones: Record<Tone, string> = {
  bg: "bg-bg text-navy-900",
  tint: "bg-blue-100 text-navy-900",
  navy: "bg-navy-900 text-bg",
};

type SectionProps = {
  children: React.ReactNode;
  tone?: Tone;
  as?: "section" | "footer" | "div" | "header";
  className?: string;
  /** Remove o respiro vertical padrão quando o filho controla o espaçamento. */
  flush?: boolean;
  id?: string;
};

export function Section({
  children,
  tone = "bg",
  as: Tag = "section",
  className,
  flush = false,
  id,
}: SectionProps) {
  return (
    <Tag id={id} className={`${tones[tone]} ${className ?? ""}`}>
      <div
        className={`mx-auto w-full max-w-container px-6 sm:px-8 ${
          flush ? "" : "py-section-sm sm:py-section"
        }`}
      >
        {children}
      </div>
    </Tag>
  );
}
