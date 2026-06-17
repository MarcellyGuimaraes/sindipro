import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getNewsBySlug, formatNewsDate } from "@/lib/news";
import { renderMarkdown } from "@/lib/markdown";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const noticia = await getNewsBySlug(params.slug);
  if (!noticia) return { title: "Notícia não encontrada" };
  const description = noticia.excerpt ?? undefined;
  return {
    title: noticia.title,
    description,
    openGraph: {
      type: "article",
      title: noticia.title,
      description,
      images: noticia.cover_image_url ? [noticia.cover_image_url] : undefined,
    },
  };
}

export default async function NoticiaPage({ params }: { params: Params }) {
  const noticia = await getNewsBySlug(params.slug);
  if (!noticia) notFound();

  const { date, dateISO } = formatNewsDate(noticia.published_at);
  const image = noticia.cover_image_url ?? "/placeholder-news.svg";
  const contentHtml = noticia.content ? renderMarkdown(noticia.content) : "";

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
          {date && (
            <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
              <time dateTime={dateISO}>{date}</time>
            </span>
          )}

          <h1 className="mt-4 font-inter text-3xl font-bold leading-[1.05] tracking-tight text-brand md:text-5xl">
            {noticia.title}
          </h1>

          {noticia.excerpt && (
            <p className="mt-5 text-base leading-relaxed text-black/60 md:text-lg">
              {noticia.excerpt}
            </p>
          )}

          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[28px] bg-neutral-900">
            <Image
              src={image}
              alt={noticia.cover_image_url ? noticia.title : ""}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
              unoptimized={image.endsWith(".svg")}
            />
          </div>

          {contentHtml && (
            <div
              className="mt-8 space-y-4 text-base leading-relaxed text-black/75 [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-8 [&_h2]:font-inter [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand [&_h3]:mt-6 [&_h3]:font-inter [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-brand [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:font-semibold [&_strong]:text-black"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}
        </article>
      </div>
    </main>
  );
}
