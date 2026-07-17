import Link from "next/link";
import { Plus, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteMemberFileButton } from "@/components/painel/DeleteMemberFileButton";
import { PanelHeading } from "@/components/painel/PanelHeading";
import { MEMBER_FILE_FOLDERS, memberFileFolderLabel } from "@/lib/member-files";
import type { MemberFileFolder, MemberFileRow } from "@/lib/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function isFolder(v: unknown): v is MemberFileFolder {
  return MEMBER_FILE_FOLDERS.some((f) => f.value === v);
}

/**
 * Lista de arquivos da área do associado (bucket privado member-files),
 * com filtro por pasta. Não há link "abrir": o bucket é privado e a leitura
 * (URL assinada, gerada no servidor) é trabalho futuro — aqui só se gerencia
 * o catálogo (subir/excluir).
 */
export default async function ArquivosAssociadoAdminPage({
  searchParams,
}: {
  searchParams: { pasta?: string };
}) {
  const pastaAtiva = isFolder(searchParams.pasta) ? searchParams.pasta : null;

  const supabase = await createClient();
  let query = supabase
    .from("member_files")
    .select("id, title, folder, storage_path, size_bytes, created_at")
    .order("created_at", { ascending: false });
  if (pastaAtiva) query = query.eq("folder", pastaAtiva);

  const { data, error } = await query;

  const arquivos = (data ?? []) as Pick<
    MemberFileRow,
    "id" | "title" | "folder" | "storage_path" | "size_bytes" | "created_at"
  >[];

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelHeading
          title="Arquivos do associado"
          subtitle="Catálogo do bucket privado member-files — visível só na área logada."
        />
        <Link
          href="/painel-diretoria/arquivos-associado/novo"
          className="group inline-flex items-center gap-2.5 rounded-full bg-brand py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
        >
          Enviar arquivo
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-sm text-black/45">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        Bucket privado — sem leitura pública.
      </div>

      {/* Filtro por pasta */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FiltroPill href="/painel-diretoria/arquivos-associado" active={!pastaAtiva}>
          Todas
        </FiltroPill>
        {MEMBER_FILE_FOLDERS.map(({ value, label }) => (
          <FiltroPill
            key={value}
            href={`/painel-diretoria/arquivos-associado?pasta=${value}`}
            active={pastaAtiva === value}
          >
            {label}
          </FiltroPill>
        ))}
      </div>

      {error ? (
        <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-black ring-1 ring-brand/20">
          Não foi possível carregar os arquivos. Verifique se a tabela{" "}
          <code>member_files</code> foi criada (migration 0007).
        </p>
      ) : arquivos.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center">
          <p className="text-base text-black/70">
            {pastaAtiva
              ? `Nenhum arquivo em "${memberFileFolderLabel(pastaAtiva)}" ainda.`
              : "Nenhum arquivo ainda."}
          </p>
          <Link
            href="/painel-diretoria/arquivos-associado/novo"
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Enviar o primeiro →
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-black/10 text-[11px] uppercase tracking-[0.08em] text-black/45">
                <th className="px-5 py-3.5 font-semibold">Título</th>
                <th className="px-5 py-3.5 font-semibold">Pasta</th>
                <th className="px-5 py-3.5 font-semibold">Data</th>
                <th className="px-5 py-3.5 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {arquivos.map((f) => (
                <tr key={f.id} className="border-b border-black/5 align-middle last:border-0">
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-black">{f.title}</span>
                    {typeof f.size_bytes === "number" && (
                      <span className="block text-sm text-black/45">
                        {(f.size_bytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                      {memberFileFolderLabel(f.folder)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-black/60">
                    {formatDate(f.created_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <DeleteMemberFileButton
                        id={f.id}
                        title={f.title}
                        storagePath={f.storage_path}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FiltroPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-black/10 bg-white text-black hover:bg-black/5"
      }`}
    >
      {children}
    </Link>
  );
}
