import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteBoardMemberButton } from "@/components/painel/DeleteBoardMemberButton";
import { PanelHeading } from "@/components/painel/PanelHeading";
import { BOARD_GROUPS } from "@/lib/board";
import type { BoardMemberRow } from "@/lib/types";

/** Deriva o caminho no bucket a partir da URL pública (para excluir do Storage). */
function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = "/board-photos/";
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

/** Lista do quadro de diretoria, agrupada por board_group. */
export default async function DiretoriaadminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_members")
    .select("id, name, role, board_group, photo_url, display_order")
    .order("display_order", { ascending: true });

  const members = (data ?? []) as Pick<
    BoardMemberRow,
    "id" | "name" | "role" | "board_group" | "photo_url" | "display_order"
  >[];

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelHeading
          title="Quadro de diretoria"
          subtitle={`${members.length} ${members.length === 1 ? "membro" : "membros"}.`}
        />
        <Link
          href="/admin/diretoria/novo"
          className="group inline-flex items-center gap-2.5 rounded-full bg-brand py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
        >
          Novo membro
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {error ? (
        <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-black ring-1 ring-brand/20">
          Não foi possível carregar a diretoria. Verifique se a tabela{" "}
          <code>board_members</code> foi criada (migration §14).
        </p>
      ) : members.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center">
          <p className="text-base text-black/70">Nenhum membro cadastrado ainda.</p>
          <Link
            href="/admin/diretoria/novo"
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Adicionar o primeiro →
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {BOARD_GROUPS.map((g) => {
            const grupo = members.filter((m) => m.board_group === g.value);
            if (grupo.length === 0) return null;
            return (
              <section key={g.value}>
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/45">
                  {g.label} · {grupo.length}
                </h2>
                <ul className="overflow-hidden rounded-2xl bg-white">
                  {grupo.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-0"
                    >
                      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-brand/10 text-sm font-semibold text-brand">
                        {m.photo_url ? (
                          <Image
                            src={m.photo_url}
                            alt={m.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover object-top"
                            unoptimized
                          />
                        ) : (
                          initials(m.name)
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-black">
                          {m.name}
                        </span>
                        <span className="block truncate text-sm text-black/60">
                          {m.role}
                        </span>
                      </div>
                      <span className="hidden shrink-0 text-sm text-black/45 sm:block">
                        #{m.display_order}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <Link
                          href={`/admin/diretoria/${m.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/5"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Editar
                        </Link>
                        <DeleteBoardMemberButton
                          id={m.id}
                          name={m.name}
                          storagePath={storagePathFromUrl(m.photo_url)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
