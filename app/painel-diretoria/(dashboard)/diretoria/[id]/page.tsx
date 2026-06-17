import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BoardMemberForm } from "@/components/painel/BoardMemberForm";
import type { BoardMemberRow } from "@/lib/types";

export default async function EditarMembroPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_members")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();
  const membro = data as BoardMemberRow;

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <Link
        href="/painel-diretoria/diretoria"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para a diretoria
      </Link>
      <h1 className="mt-4 font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
        Editar membro
      </h1>
      <div className="mt-6">
        <BoardMemberForm initial={membro} />
      </div>
    </div>
  );
}
