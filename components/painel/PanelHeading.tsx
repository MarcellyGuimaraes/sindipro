/**
 * Cabeçalho de seção do painel — visual Lovable: título Inter bold em azul
 * brand, tracking apertado, com subtítulo discreto. Sem ornamentos: utilitário.
 */
export function PanelHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h1 className="font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm text-black/60">{subtitle}</p>}
    </div>
  );
}
