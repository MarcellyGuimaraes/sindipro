import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AssociadoCreateForm } from "@/components/painel/AssociadoCreateForm";
import { listProviderOptions } from "@/lib/providers";

export default async function NovoAssociadoPage() {
  const providers = await listProviderOptions();

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <Link
        href="/painel-diretoria/associados"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para associados
      </Link>
      <h1 className="mt-4 font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
        Novo associado
      </h1>
      <div className="mt-6">
        <AssociadoCreateForm providers={providers} />
      </div>
    </div>
  );
}
