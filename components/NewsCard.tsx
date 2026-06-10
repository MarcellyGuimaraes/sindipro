import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "./Eyebrow";

/**
 * Card de notícia (CLAUDE.md §8): imagem (next/image), data (eyebrow),
 * título (Fraunces), resumo curto, link. Borda 1px blue-200, raio discreto,
 * sem sombra boba. Variante "feature" para o destaque editorial assimétrico.
 */

export type NewsCardProps = {
  href: string;
  title: string;
  date: string; // já formatada em pt-BR
  summary: string;
  image: string;
  imageAlt: string;
  /** Destaque maior (1 por listagem); os demais ficam compactos. */
  feature?: boolean;
};

export function NewsCard({
  href,
  title,
  date,
  summary,
  image,
  imageAlt,
  feature = false,
}: NewsCardProps) {
  return (
    <article
      className={
        "group flex flex-col overflow-hidden rounded-card border border-blue-200 bg-surface " +
        "transition-colors duration-200 hover:border-blue-400"
      }
    >
      <Link href={href} className="flex h-full flex-col focus-visible:outline-none">
        <div
          className={`relative w-full overflow-hidden ${
            feature ? "aspect-[16/9]" : "aspect-[3/2]"
          }`}
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes={feature ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 40vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            unoptimized={image.endsWith(".svg")}
          />
        </div>

        <div className={`flex flex-1 flex-col ${feature ? "p-6 sm:p-8" : "p-5"}`}>
          <Eyebrow as="span" className="mb-2">
            {date}
          </Eyebrow>
          <h3
            className={`font-display font-medium text-navy-900 ${
              feature ? "text-h2" : "text-h3"
            }`}
          >
            {title}
          </h3>
          <p
            className={`mt-2 text-small text-navy-900/80 ${
              feature ? "" : "line-clamp-3"
            }`}
          >
            {summary}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-navy-700">
            Ler notícia
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
