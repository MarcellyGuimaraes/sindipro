import Link from "next/link";
import { Plus, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AssociadoProviderCell } from "@/components/painel/AssociadoProviderCell";
import { AssociadoRowActions } from "@/components/painel/AssociadoRowActions";
import { OrphanAssociadoRow } from "@/components/painel/OrphanAssociadoRow";
import { PanelHeading } from "@/components/painel/PanelHeading";
import { listOrphanedAssociados } from "@/lib/associados-orphans";
import { listProviderOptions } from "@/lib/providers";
import type { ProfileRow } from "@/lib/types";

/**
 * Linha de `profiles` com o provedor embutido pelo join da FK
 * profiles.provider_id -> providers.id (CLAUDE.md §16).
 */
type AssociadoListRow = Pick<
  ProfileRow,
  "id" | "full_name" | "company" | "provider_id" | "email" | "status" | "created_at"
> & {
  providers: { id: string; name: string } | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Lista de associados com acesso à área logada, ordenada pelo mais recente. */
export default async function AssociadosAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, company, provider_id, email, status, created_at, providers(id, name)"
    )
    .order("created_at", { ascending: false });

  const associados = (data ?? []) as unknown as AssociadoListRow[];

  const [orphans, providers] = await Promise.all([
    listOrphanedAssociados().catch(() => []),
    listProviderOptions(),
  ]);

  const semProvedor = associados.filter((a) => !a.provider_id).length;

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelHeading
          title="Associados"
          subtitle={`${associados.length} ${associados.length === 1 ? "acesso criado" : "acessos criados"} para a área logada.`}
        />
        <Link
          href="/painel-diretoria/associados/novo"
          className="group inline-flex items-center gap-2.5 rounded-full bg-brand py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
        >
          Novo associado
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {semProvedor > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {semProvedor} {semProvedor === 1 ? "associado sem provedor" : "associados sem provedor"}
            </p>
            <p className="mt-1 text-sm text-amber-800">
              A migração para o cadastro de provedores não conseguiu casar
              {semProvedor === 1 ? " este" : " estes"} pelo texto antigo. Use
              &ldquo;Vincular&rdquo; na linha do associado para escolher o
              provedor certo — o texto antigo aparece ali como pista.
            </p>
          </div>
        </div>
      )}

      {orphans.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {orphans.length} {orphans.length === 1 ? "conta" : "contas"} sem perfil
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Essas contas foram criadas no login (Auth) mas ficaram sem linha em{" "}
                <code>profiles</code> — provavelmente por uma falha no meio da criação. Elas não
                aparecem na lista abaixo e não têm acesso à área do associado até o perfil ser
                criado.
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {orphans.map((o) => (
              <OrphanAssociadoRow
                key={o.id}
                id={o.id}
                email={o.email}
                providers={providers}
              />
            ))}
          </ul>
        </div>
      )}

      {error ? (
        <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-black ring-1 ring-brand/20">
          Não foi possível carregar os associados. Verifique se a tabela{" "}
          <code>profiles</code> foi criada (migration 0006).
        </p>
      ) : associados.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center">
          <p className="text-base text-black/70">Nenhum associado cadastrado ainda.</p>
          <Link
            href="/painel-diretoria/associados/novo"
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Criar o primeiro acesso →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 overflow-hidden rounded-2xl bg-white">
          {associados.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-3 border-b border-black/5 px-4 py-4 last:border-0 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="min-w-0 sm:flex-1 sm:pt-1">
                <span className="block truncate font-medium text-black">
                  {a.full_name}
                </span>
                <span className="block truncate text-sm text-black/60">
                  {a.email}
                </span>
                <AssociadoProviderCell
                  userId={a.id}
                  providerId={a.provider_id}
                  providerName={a.providers?.name ?? null}
                  legacyCompany={a.company}
                  providers={providers}
                />
              </div>

              <AssociadoRowActions
                id={a.id}
                status={a.status}
                createdAtLabel={formatDate(a.created_at)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
