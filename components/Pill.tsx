import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Botão-pílula do visual Lovable: texto + círculo com ícone.
 * Tons: white (sobre imagem/cream), black ("Saiba mais") e brand.
 */

type Tone = "white" | "black" | "brand";

const tones: Record<Tone, { pill: string; circle: string }> = {
  white: {
    pill: "bg-white text-black hover:bg-white/90",
    circle: "bg-brand text-white",
  },
  black: {
    pill: "bg-black text-white hover:bg-black/85",
    circle: "bg-white text-black",
  },
  brand: {
    pill: "bg-brand text-white hover:bg-brand/90",
    circle: "bg-white text-brand",
  },
};

type PillLinkProps = {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
  icon?: React.ComponentType<{ className?: string }>;
  /** Pílula menor (cards). */
  small?: boolean;
  className?: string;
  external?: boolean;
  /** Baixa o recurso em vez de navegar (links de arquivo). */
  download?: boolean;
};

export function PillLink({
  href,
  children,
  tone = "white",
  icon: Icon = ArrowRight,
  small = false,
  className,
  external = false,
  download = false,
}: PillLinkProps) {
  const t = tones[tone];
  const cls = [
    "group inline-flex items-center font-inter font-medium shadow-sm transition rounded-full",
    small ? "gap-2 py-1 pl-4 pr-1 text-xs font-semibold" : "gap-3 py-1.5 pl-5 pr-1.5 text-sm",
    t.pill,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span>{children}</span>
      <span
        className={`grid place-items-center rounded-full transition group-hover:translate-x-0.5 ${
          small ? "h-7 w-7" : "h-8 w-8"
        } ${t.circle}`}
      >
        <Icon className={small ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true" />
      </span>
    </>
  );

  if (external || download || !href.startsWith("/")) {
    return (
      <a
        href={href}
        className={cls}
        {...(download ? { download: "" } : {})}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
