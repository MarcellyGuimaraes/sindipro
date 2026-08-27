import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ComunicadoForm } from "@/components/painel/ComunicadoForm";

export default function NovoComunicadoPage() {
  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <Link
        href="/painel-diretoria/comunicados"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para os comunicados
      </Link>
      <h1 className="mt-4 font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
        Novo comunicado
      </h1>
      <div className="mt-6">
        <ComunicadoForm />
      </div>
    </div>
  );
}
