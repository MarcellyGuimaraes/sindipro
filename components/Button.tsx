import Link from "next/link";
import { forwardRef } from "react";

/**
 * Botão base (CLAUDE.md §8).
 * - primário: fundo navy-700, texto branco; hover escurece p/ navy-900.
 * - secundário: contorno navy-700, texto navy-700, fundo transparente.
 * Raio 6px, estados hover/focus/disabled. Sentence case.
 *
 * `onDark`: paleta para uso sobre fundo navy (Hero/Footer) — evita conflito
 * de classes de cor e garante contraste AA + foco visível claro.
 */

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded font-sans font-medium " +
  "transition-colors duration-200 focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-small",
  lg: "h-12 px-6 text-body",
};

const variantsOnLight: Record<Variant, string> = {
  primary:
    "bg-navy-700 text-surface hover:bg-navy-900 disabled:hover:bg-navy-700 " +
    "focus-visible:outline-navy-700",
  secondary:
    "border border-navy-700 text-navy-700 bg-transparent " +
    "hover:bg-navy-700 hover:text-surface disabled:hover:bg-transparent disabled:hover:text-navy-700 " +
    "focus-visible:outline-navy-700",
};

const variantsOnDark: Record<Variant, string> = {
  primary:
    "bg-navy-700 text-surface hover:bg-blue-100 hover:text-navy-900 disabled:hover:bg-navy-700 " +
    "focus-visible:outline-bg",
  secondary:
    "border border-blue-400 text-bg bg-transparent " +
    "hover:bg-bg hover:text-navy-900 disabled:hover:bg-transparent disabled:hover:text-bg " +
    "focus-visible:outline-bg",
};

function classes(
  variant: Variant,
  size: Size,
  onDark: boolean,
  className?: string
) {
  const variants = onDark ? variantsOnDark : variantsOnLight;
  return [base, sizes[size], variants[variant], className]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  onDark?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", onDark = false, className, ...props }, ref) => (
    <button
      ref={ref}
      className={classes(variant, size, onDark, className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

/** Versão link (next/link) com o mesmo visual. */
type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  onDark?: boolean;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  onDark = false,
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={classes(variant, size, onDark, className)} {...props} />;
}
