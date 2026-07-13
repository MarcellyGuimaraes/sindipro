import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLatestNews, isRecentNews } from "@/lib/news";

/**
 * "Últimas notícias" — eyebrow + headline central em azul brand e 3 cards de
 * imagem com gradiente de leitura e CTA em pílula. Lê as 3 notícias publicadas
 * mais recentes do Supabase (Server Component).
 */

export async function LatestNews() {
  const noticias = await getLatestNews(3);

  return (
    <section id="noticias" className="mx-auto max-w-6xl px-2 pb-20 md:pb-28">
      {/* <p className="text-center font-inter text-sm font-medium text-black/60">
        Últimas notícias
      </p> */}
      <h2 className="mx-auto mt-3 max-w-3xl text-center font-inter text-4xl font-bold leading-[1.05] tracking-tight text-brand md:text-6xl">
        Notícias que impactam os
        <br /> provedores de Sergipe.
      </h2>

      {noticias.length === 0 ? (
        <p className="mt-12 text-center font-inter text-sm text-black/50">
          Em breve, as primeiras notícias do sindicato.
        </p>
      ) : (
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {noticias.map((item, i) => (
            <article
              key={item.slug}
              className="group relative flex h-[340px] flex-col justify-end overflow-hidden rounded-[28px] bg-neutral-900 p-6 font-inter text-white sm:h-[440px]"
            >
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
                unoptimized={item.image.endsWith(".svg")}
              />
              {/* Filtro de leitura */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
              <div className="absolute inset-0 bg-black/15" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur">
                    {item.date}
                  </span>
                  {i === 0 && isRecentNews(item.dateISO) && (
                    <span className="inline-block rounded-full bg-gold-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      Novo
                    </span>
                  )}
                </div>
                {/* font/cor explícitos: o base layer de h1–h4 (visual antigo) vence a herança */}
                <h3 className="mt-4 font-inter text-xl font-bold leading-snug text-white">
                  {item.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/80">
                  {item.summary}
                </p>
                <Link
                  href={`/noticias/${item.slug}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white py-1 pl-4 pr-1 text-xs font-semibold text-black transition hover:bg-white/90 focus-visible:outline-bg"
                >
                  Ler notícia
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-white">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/noticias"
          className="font-inter text-sm font-medium text-black/60 underline-offset-4 transition hover:text-brand hover:underline"
        >
          Ver todas as notícias
        </Link>
      </div>
    </section>
  );
}
