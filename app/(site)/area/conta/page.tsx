import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AreaContaForm } from "@/components/AreaContaForm";

export const metadata: Metadata = {
  title: "Minha conta",
};

export default function AreaContaPage() {
  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-4xl px-2 pb-16 pt-8 md:pb-24 md:pt-12">
        <Link
          href="/area"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para a área do associado
        </Link>

        <PageHeader
          align="left"
          eyebrow="Área do associado"
          title="Minha conta"
          lead="Troque sua senha de acesso."
          className="mt-4"
        />

        <div className="mt-10 rounded-[28px] bg-white p-8 font-inter md:p-10">
          <AreaContaForm />
        </div>
      </div>
    </main>
  );
}
