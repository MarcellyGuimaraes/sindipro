import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PartnerForm } from "@/components/painel/PartnerForm";
import type { PartnerRow } from "@/lib/types";

export default async function EditarParceiroPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();
  const parceiro = data as PartnerRow;

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <Link
        href="/admin/parceiros"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para os parceiros
      </Link>
      <h1 className="mt-4 font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
        Editar parceiro
      </h1>
      <div className="mt-6">
        <PartnerForm initial={parceiro} />
      </div>
    </div>
  );
}
