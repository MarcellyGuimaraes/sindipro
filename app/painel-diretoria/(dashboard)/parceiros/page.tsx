import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeletePartnerButton } from "@/components/painel/DeletePartnerButton";
import { PanelHeading } from "@/components/painel/PanelHeading";
import type { PartnerRow } from "@/lib/types";

/** Deriva o caminho no bucket a partir da URL pública (para excluir do Storage). */
function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = "/partner-logos/";
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

/** Lista de parceiros do carrossel, ordenada por display_order. */
export default async function ParceirosAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, logo_url, link_url, display_order")
    .order("display_order", { ascending: true });

  const parceiros = (data ?? []) as Pick<
    PartnerRow,
    "id" | "name" | "logo_url" | "link_url" | "display_order"
  >[];

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelHeading
          title="Parceiros"
          subtitle={`${parceiros.length} ${parceiros.length === 1 ? "parceiro" : "parceiros"} no carrossel da home.`}
        />
        <Link
          href="/painel-diretoria/parceiros/novo"
          className="group inline-flex items-center gap-2.5 rounded-full bg-brand py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
        >
          Novo parceiro
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {error ? (
        <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-black ring-1 ring-brand/20">
          Não foi possível carregar os parceiros. Verifique se a tabela{" "}
          <code>partners</code> foi criada (migration 0005).
        </p>
      ) : parceiros.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center">
          <p className="text-base text-black/70">Nenhum parceiro cadastrado ainda.</p>
          <Link
            href="/painel-diretoria/parceiros/novo"
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Adicionar o primeiro →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 overflow-hidden rounded-2xl bg-white">
          {parceiros.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-0"
            >
              <span className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/[0.03] px-2 text-xs font-semibold text-black/40">
                {p.logo_url ? (
                  <Image
                    src={p.logo_url}
                    alt={p.name}
                    width={80}
                    height={48}
                    className="h-10 w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  "sem logo"
                )}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate font-medium text-black">
                  {p.name}
                </span>
                {p.link_url && (
                  <span className="block truncate text-sm text-black/60">
                    {p.link_url}
                  </span>
                )}
              </div>
              <span className="hidden shrink-0 text-sm text-black/45 sm:block">
                #{p.display_order}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/painel-diretoria/parceiros/${p.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/5"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Editar
                </Link>
                <DeletePartnerButton
                  id={p.id}
                  name={p.name}
                  storagePath={storagePathFromUrl(p.logo_url)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
