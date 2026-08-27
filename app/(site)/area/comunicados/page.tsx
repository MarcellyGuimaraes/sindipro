import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ComunicadoCard } from "@/components/area/ComunicadoCard";
import { getComunicadosFeed } from "@/lib/comunicados-feed";

export const metadata: Metadata = {
  title: "Comunicados",
};

/**
 * Feed de comunicados da área do associado (CLAUDE.md §16).
 *
 * O layout de /area já barra quem não tem sessão + papel + perfil ativo;
 * getComunicadosFeed revalida o acesso mesmo assim (defesa em profundidade)
 * e devolve viewerId nulo se algo mudou entre uma checagem e outra.
 */
export default async function ComunicadosFeedPage() {
  const { items, viewerId, failed } = await getComunicadosFeed();

  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-3xl px-2 pb-16 pt-8 md:pb-24 md:pt-12">
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
          title="Comunicados"
          lead="Avisos e publicações da diretoria. Você pode curtir e comentar."
          className="mt-4"
        />

        {/* §16 manda deixar explícito que o mural é compartilhado. */}
        <p className="mt-6 flex items-start gap-2.5 rounded-2xl bg-brand/[0.06] p-4 font-inter text-sm text-black/70">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <span>
            Este mural é compartilhado: seu nome e seus comentários ficam
            visíveis para todos os associados com acesso à área restrita. A
            diretoria pode remover comentários.
          </span>
        </p>

        {!viewerId ? (
          <div className="mt-8 rounded-[28px] bg-white p-10 text-center font-inter">
            <p className="text-base text-black/60">
              Sua sessão expirou. Entre novamente para ver os comunicados.
            </p>
            <Link
              href="/entrar?next=/area/comunicados"
              className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Ir para o login →
            </Link>
          </div>
        ) : failed ? (
          <div className="mt-8 rounded-[28px] bg-white p-10 text-center font-inter">
            <p className="text-base text-black/70">
              Não foi possível carregar os comunicados agora.
            </p>
            <p className="mt-2 text-sm text-black/50">
              Tente recarregar a página. Se continuar, avise a diretoria.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-[28px] bg-white p-10 text-center font-inter">
            <p className="text-base text-black/60">
              Nenhum comunicado publicado ainda.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {items.map((item) => (
              <ComunicadoCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
