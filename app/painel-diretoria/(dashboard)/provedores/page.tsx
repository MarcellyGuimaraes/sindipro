import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteProviderButton } from "@/components/painel/DeleteProviderButton";
import { PanelHeading } from "@/components/painel/PanelHeading";
import { listProviders } from "@/lib/providers";
import { formatCnpj } from "@/lib/validation/provider";

/** Quantos associados estão vinculados a cada provedor. */
async function countAssociadosByProvider(): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("provider_id")
    .not("provider_id", "is", null);

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { provider_id: string }[]) {
    counts.set(row.provider_id, (counts.get(row.provider_id) ?? 0) + 1);
  }
  return counts;
}

/** Lista de provedores associados (CLAUDE.md §16), em ordem alfabética. */
export default async function ProvedoresAdminPage() {
  const [{ providers, error }, counts] = await Promise.all([
    listProviders(),
    countAssociadosByProvider(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelHeading
          title="Provedores"
          subtitle={`${providers.length} ${providers.length === 1 ? "provedor cadastrado" : "provedores cadastrados"}. É desta lista que sai o provedor de cada associado.`}
        />
        <Link
          href="/painel-diretoria/provedores/novo"
          className="group inline-flex items-center gap-2.5 rounded-full bg-brand py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
        >
          Novo provedor
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {error ? (
        <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-black ring-1 ring-brand/20">
          Não foi possível carregar os provedores. Verifique se a tabela{" "}
          <code>providers</code> foi criada (migration 0009).
        </p>
      ) : providers.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center">
          <p className="text-base text-black/70">Nenhum provedor cadastrado ainda.</p>
          <Link
            href="/painel-diretoria/provedores/novo"
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Cadastrar o primeiro →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 overflow-hidden rounded-2xl bg-white">
          {providers.map((p) => {
            const linked = counts.get(p.id) ?? 0;
            return (
              <li
                key={p.id}
                className="flex flex-col gap-3 border-b border-black/5 px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 sm:flex-1">
                  <span className="block truncate font-medium text-black">{p.name}</span>
                  <span className="block truncate text-sm text-black/60">
                    {[
                      formatCnpj(p.cnpj),
                      p.city,
                      `${linked} ${linked === 1 ? "associado" : "associados"}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                    p.status === "ativo"
                      ? "bg-brand text-white"
                      : "bg-black/5 text-black/50"
                  }`}
                >
                  {p.status === "ativo" ? "Ativo" : "Inativo"}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/painel-diretoria/provedores/${p.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/5"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Editar
                  </Link>
                  <DeleteProviderButton id={p.id} name={p.name} linkedCount={linked} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
