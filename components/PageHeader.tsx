/**
 * Cabeçalho de página/seção do visual Lovable: eyebrow pequena em black/60 e
 * título Inter bold tracking-tight em azul brand, centralizados (como a seção
 * "Últimas notícias" do mock).
 */

type PageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  as?: "h1" | "h2";
  /** Alinhamento — o mock usa centralizado nas seções e à esquerda nos blocos. */
  align?: "center" | "left";
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  lead,
  as: Tag = "h1",
  align = "center",
  className,
}: PageHeaderProps) {
  const centered = align === "center";
  return (
    <div className={`font-inter ${centered ? "text-center" : ""} ${className ?? ""}`}>
      {eyebrow && <p className="text-sm font-medium text-black/60">{eyebrow}</p>}
      <Tag
        className={`mt-3 font-inter text-4xl font-bold leading-[1.05] tracking-tight text-brand md:text-6xl ${
          centered ? "mx-auto max-w-3xl" : "max-w-3xl"
        }`}
      >
        {title}
      </Tag>
      {lead && (
        <p
          className={`mt-6 max-w-2xl text-sm leading-relaxed text-black/60 md:text-base ${
            centered ? "mx-auto" : ""
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
