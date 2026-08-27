import type { Metadata } from "next";
import Link from "next/link";
import { FileText, FolderClosed, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/auth/role";
import { PageHeader } from "@/components/PageHeader";
import { ComunicadoCard } from "@/components/area/ComunicadoCard";
import { MEMBER_FILE_FOLDERS, memberFileFolderLabel } from "@/lib/member-files";
import {
  getMemberFileCounts,
  getRecentMemberFiles,
} from "@/lib/member-files-data";
import { getComunicadosFeed } from "@/lib/comunicados-feed";
import { formatRelative } from "@/lib/format-relative";

export const metadata: Metadata = {
  title: "Área do associado",
};

/**
 * Home da área do associado (CLAUDE.md §16): o feed de comunicados ocupa a
 * coluna principal e as pastas de documentos ficam na sidebar à direita. As
 * ações de conta migraram para o menu de perfil da navbar — por isso não há
 * mais card "Minha conta" aqui.
 *
 * O layout /area já barra quem não tem sessão + papel + perfil ativo;
 * getComunicadosFeed revalida o acesso e devolve viewerId nulo se algo mudou.
 */
export default async function AreaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = roleFromUser(user);

  let firstName = "";
  let viewerName = "";
  if (role === "associado" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    viewerName = profile?.full_name ?? "";
    firstName = viewerName.split(" ")[0] ?? "";
  }

  const [{ items, viewerId, failed }, counts, recent] = await Promise.all([
    getComunicadosFeed(),
    getMemberFileCounts(),
    getRecentMemberFiles(5),
  ]);

  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 pb-16 pt-8 md:pb-24 md:pt-12">
        <PageHeader
          align="left"
          eyebrow="Área do associado"
          title={firstName ? `Olá, ${firstName}.` : "Área do associado"}
          lead="Comunicados da diretoria no seu feed. Documentos do sindicato organizados à direita."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          {/* Coluna principal — feed */}
          <section aria-label="Comunicados da diretoria">
            {/* §16 manda deixar explícito que o mural é compartilhado — aqui
                como nota discreta, sem bloco de destaque. */}
            <p className="flex items-center gap-1.5 font-inter text-xs text-black/45">
              <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Mural compartilhado: seu nome e seus comentários ficam visíveis
              para todos os associados.
            </p>

            {!viewerId ? (
              <FeedNotice>
                Sua sessão expirou. Entre novamente para ver os comunicados.{" "}
                <Link
                  href="/entrar?next=/area"
                  className="font-semibold text-brand hover:underline"
                >
                  Ir para o login →
                </Link>
              </FeedNotice>
            ) : failed ? (
              <FeedNotice>
                Não foi possível carregar os comunicados agora. Tente recarregar
                a página. Se continuar, avise a diretoria.
              </FeedNotice>
            ) : items.length === 0 ? (
              <FeedNotice>Nenhum comunicado publicado ainda.</FeedNotice>
            ) : (
              <div className="mt-6 space-y-6">
                {items.map((item) => (
                  <ComunicadoCard key={item.id} item={item} viewerName={viewerName} />
                ))}
              </div>
            )}
          </section>

          {/* Sidebar — documentos */}
          <aside className="space-y-6 font-inter lg:sticky lg:top-24">
            <div className="rounded-[20px] bg-white p-5">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-black/45">
                Documentos
              </h2>
              <ul className="mt-3 space-y-1">
                {MEMBER_FILE_FOLDERS.map(({ value, label, description }) => {
                  const count = counts[value];
                  return (
                    <li key={value}>
                      <Link
                        href={`/area/${value}`}
                        className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-white">
                          <FolderClosed className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-brand">
                            {label}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-black/50">
                            {count === 0
                              ? "Nenhum documento"
                              : count === 1
                                ? "1 documento"
                                : `${count} documentos`}{" "}
                            · {description}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {recent.length > 0 && (
              <div className="rounded-[20px] bg-white p-5">
                <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-black/45">
                  Adicionados recentemente
                </h2>
                <ul className="mt-3 space-y-1">
                  {recent.map((file) => (
                    <li key={file.id}>
                      <Link
                        href={`/area/${file.folder}`}
                        className="group flex items-start gap-3 rounded-2xl p-2.5 transition hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        <FileText
                          className="mt-0.5 h-4 w-4 shrink-0 text-black/40"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-black transition group-hover:text-brand">
                            {file.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-black/45">
                            {memberFileFolderLabel(file.folder)} ·{" "}
                            {formatRelative(file.created_at)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function FeedNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-[28px] bg-white p-10 text-center font-inter text-base text-black/65">
      {children}
    </div>
  );
}
