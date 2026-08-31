import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProviderForm } from "@/components/painel/ProviderForm";
import type { ProviderRow } from "@/lib/types";

export default async function EditarProvedorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();
  const provedor = data as ProviderRow;

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <Link
        href="/painel-diretoria/provedores"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para os provedores
      </Link>
      <h1 className="mt-4 font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
        Editar provedor
      </h1>
      <div className="mt-6">
        <ProviderForm initial={provedor} />
      </div>
    </div>
  );
}
