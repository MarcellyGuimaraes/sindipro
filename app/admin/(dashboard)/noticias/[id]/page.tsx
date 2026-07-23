import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewsForm } from "@/components/painel/NewsForm";
import { NewsLogs } from "@/components/painel/NewsLogs";
import type { NewsRow } from "@/lib/types";

export default async function EditarNoticiaPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();
  const noticia = data as NewsRow;

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <Link
        href="/admin/noticias"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para notícias
      </Link>
      <h1 className="mt-4 font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
        Editar notícia
      </h1>
      <div className="mt-6">
        <NewsForm initial={noticia} />
      </div>
      <NewsLogs newsId={noticia.id} />
    </div>
  );
}
