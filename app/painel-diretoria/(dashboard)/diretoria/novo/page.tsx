import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BoardMemberForm } from "@/components/painel/BoardMemberForm";

export default function NovoMembroPage() {
  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <Link
        href="/admin/diretoria"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para a diretoria
      </Link>
      <h1 className="mt-4 font-inter text-2xl font-bold tracking-tight text-brand md:text-3xl">
        Novo membro
      </h1>
      <div className="mt-6">
        <BoardMemberForm />
      </div>
    </div>
  );
}
