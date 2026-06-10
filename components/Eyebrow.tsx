/**
 * Eyebrow / rótulo (CLAUDE.md §5): IBM Plex Sans, caixa alta, tracking 0.08em,
 * tamanho pequeno. Nunca mono. Tom claro sobre fundo escuro, navy sobre claro.
 */

type EyebrowProps = {
  children: React.ReactNode;
  /** "light" para usar sobre fundo navy. */
  tone?: "default" | "light";
  className?: string;
  as?: "p" | "span" | "div";
};

export function Eyebrow({
  children,
  tone = "default",
  className,
  as: Tag = "p",
}: EyebrowProps) {
  const color = tone === "light" ? "text-blue-300" : "text-navy-700";
  return (
    <Tag
      className={`font-sans font-medium uppercase text-eyebrow ${color} ${
        className ?? ""
      }`}
    >
      {children}
    </Tag>
  );
}
