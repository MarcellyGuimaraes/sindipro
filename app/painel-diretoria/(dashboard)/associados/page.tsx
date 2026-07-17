import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AssociadoRowActions } from "@/components/painel/AssociadoRowActions";
import { PanelHeading } from "@/components/painel/PanelHeading";
import type { ProfileRow } from "@/lib/types";

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
    .select("id, full_name, company, email, status, created_at")
    .order("created_at", { ascending: false });

  const associados = (data ?? []) as Pick<
    ProfileRow,
    "id" | "full_name" | "company" | "email" | "status" | "created_at"
  >[];

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
                  {a.company} · {a.email}
                </span>
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
