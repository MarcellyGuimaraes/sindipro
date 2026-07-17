import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";

/**
 * 404 do site público (grupo "(site)") — cobre qualquer rota inexistente,
 * inclusive /area/[pasta] com um valor fora da lista permitida
 * (app/(site)/area/[pasta]/page.tsx chama notFound()). Mantém navbar/footer
 * (herdados do layout do grupo) em vez do 404 genérico em inglês do Next.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-2xl px-2 py-24 text-center">
        <PageHeader
          eyebrow="Página não encontrada"
          title="Não encontramos essa página."
          lead="O endereço pode ter mudado ou não existe mais. Volte para o início ou fale com a gente."
        />
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <PillLink href="/" tone="brand">
            Voltar para o início
          </PillLink>
          <Link
            href="/area"
            className="text-sm font-medium text-black/60 transition hover:text-brand"
          >
            Ir para a área do associado
          </Link>
        </div>
      </div>
    </main>
  );
}
