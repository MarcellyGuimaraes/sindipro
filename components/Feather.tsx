/**
 * Elemento-assinatura: o traço dourado em forma de pena/asa do logotipo.
 * Reaproveitado como divisor, sublinhado e acento de canto (CLAUDE.md §3).
 * Monocromático no `--gold-600` por padrão; só traço, nunca área grande.
 */

type FeatherUnderlineProps = {
  className?: string;
  width?: number;
};

/**
 * Sublinhado curto sob títulos-chave (abertura de seção/página).
 * Termina numa leve curva de pena à direita.
 */
export function FeatherUnderline({ className, width = 88 }: FeatherUnderlineProps) {
  return (
    <svg
      className={className}
      width={width}
      height={12}
      viewBox="0 0 88 12"
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M1 7C20 7 40 7 60 6.5C70 6.2 78 5.4 84 3C86 2.2 87 1.6 87 1.6"
        stroke="var(--gold-600)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Divisor entre seções: fio fino que termina numa curva de pena.
 */
export function FeatherDivider({ className }: { className?: string }) {
  return (
    <div className={className} role="presentation" aria-hidden="true">
      <svg
        width="100%"
        height="14"
        viewBox="0 0 1120 14"
        preserveAspectRatio="none"
        fill="none"
      >
        <line
          x1="0"
          y1="7"
          x2="1040"
          y2="7"
          stroke="var(--gold-600)"
          strokeWidth="1"
        />
        <path
          d="M1040 7C1064 7 1082 5 1098 1.5C1104 0.3 1110 1 1112 4C1114 7 1110 11 1100 12C1082 13.6 1060 12 1040 7Z"
          fill="var(--gold-600)"
        />
      </svg>
    </div>
  );
}

/**
 * Acento de canto / marca-d'água (footer, página "em breve").
 * A asa estilizada, traço só.
 */
export function FeatherMark({
  className,
  size = 120,
  stroke = "var(--gold-600)",
}: {
  className?: string;
  size?: number;
  stroke?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M104 16C72 24 44 44 30 72C24 84 22 96 24 104C40 96 58 88 74 74C90 60 100 40 104 16Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M88 36C70 46 54 60 44 78"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M78 30C62 42 48 56 38 74"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
