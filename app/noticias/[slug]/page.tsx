import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/Section";
import { Eyebrow } from "@/components/Eyebrow";
import { FeatherUnderline } from "@/components/Feather";
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
    <main>
      <Section tone="bg">
        <Link
          href="/noticias"
          className="group inline-flex items-center gap-1.5 text-small font-medium text-navy-700 transition-colors hover:text-navy-900"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Todas as notícias
        </Link>

        <article className="mt-8 max-w-3xl">
          <Eyebrow as="p">
            <time dateTime={noticia.dateISO}>{noticia.date}</time>
          </Eyebrow>

          <h1 className="mt-3 font-display text-display-l font-semibold leading-[1.1] text-navy-900">
            {noticia.title}
          </h1>
          <FeatherUnderline className="mt-4" />

          <p className="mt-6 text-h3 font-normal text-navy-900/80">
            {noticia.summary}
          </p>

          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-card border border-blue-200 bg-navy-900">
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

          <div className="mt-8 space-y-4 text-body text-navy-900/85">
            {noticia.content.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>
      </Section>
    </main>
  );
}
