import Image from "next/image";
import { PillLink } from "./Pill";

/**
 * Card de notícia — visual Lovable "Pixel Perfect Page": card de imagem
 * rounded-[28px] com gradiente de leitura, data em pílula translúcida,
 * título Inter bold branco e CTA "Ler notícia" em pílula.
 * Mesmo desenho dos cards da home (LatestNews).
 */

export type NewsCardProps = {
  href: string;
  title: string;
  date: string; // já formatada em pt-BR
  summary: string;
  image: string;
  imageAlt: string;
  /** Destaque (mais alto, título maior) na listagem. */
  feature?: boolean;
  /** Mesma altura do destaque, sem tipografia ampliada (ex.: card ao lado do destaque). */
  tall?: boolean;
  /** Notícia recém-publicada — mostra a tag "Novo" ao lado da data. */
  isNew?: boolean;
};

export function NewsCard({
  href,
  title,
  date,
  summary,
  image,
  imageAlt,
  feature = false,
  tall = false,
  isNew = false,
}: NewsCardProps) {
  const isTall = feature || tall;
  return (
    <article
      className={`group relative flex flex-col justify-end overflow-hidden rounded-[28px] bg-neutral-900 p-6 font-inter text-white ${
        isTall ? "h-[400px] sm:h-[520px] md:p-8" : "h-[340px] sm:h-[440px]"
      }`}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes={feature ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
        className="object-cover transition duration-500 group-hover:scale-105"
        unoptimized={image.endsWith(".svg")}
      />
      {/* Filtro de leitura */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-black/15" />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur">
            {date}
          </span>
          {isNew && (
            <span className="inline-block rounded-full bg-gold-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Novo
            </span>
          )}
        </div>
        {/* font/cor explícitos: o legado pode estilizar h3 */}
        <h3
          className={`mt-4 font-inter font-bold leading-snug text-white ${
            feature ? "text-2xl md:text-3xl" : "text-xl"
          }`}
        >
          {title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/80">
          {summary}
        </p>
        <PillLink href={href} small className="mt-5">
          Ler notícia
        </PillLink>
      </div>
    </article>
  );
}
