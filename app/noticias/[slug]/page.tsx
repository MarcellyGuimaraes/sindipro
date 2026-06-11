import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getNoticia, getAllNoticias } from "@/lib/noticias";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllNoticias().map((n) => ({ slug: n.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const noticia = getNoticia(params.slug);
  if (!noticia) return { title: "Notícia não encontrada" };
  return {
    title: noticia.title,
    description: noticia.summary,
    openGraph: {
      type: "article",
      title: noticia.title,
      description: noticia.summary,
    },
  };
}

export default function NoticiaPage({ params }: { params: Params }) {
  const noticia = getNoticia(params.slug);
  if (!noticia) notFound();

  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-3xl px-2 py-16 font-inter md:py-24">
        <Link
          href="/noticias"
          className="group inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-4 text-sm font-medium text-black shadow-sm transition hover:bg-white/80"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-white transition group-hover:-translate-x-0.5">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          Todas as notícias
        </Link>

        <article className="mt-10">
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
            <time dateTime={noticia.dateISO}>{noticia.date}</time>
          </span>

          <h1 className="mt-4 font-inter text-3xl font-bold leading-[1.05] tracking-tight text-brand md:text-5xl">
            {noticia.title}
          </h1>

          <p className="mt-5 text-base leading-relaxed text-black/60 md:text-lg">
            {noticia.summary}
          </p>

          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[28px] bg-neutral-900">
            <Image
              src={noticia.image}
              alt={noticia.imageAlt}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
              unoptimized={noticia.image.endsWith(".svg")}
            />
          </div>

          <div className="mt-8 space-y-4 text-base leading-relaxed text-black/75">
            {noticia.content.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
