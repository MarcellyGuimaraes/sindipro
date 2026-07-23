import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteFileButton } from "@/components/painel/DeleteFileButton";
import { PanelHeading } from "@/components/painel/PanelHeading";
import type { FileRow } from "@/lib/types";

/** Lista de arquivos enviados (CCT/ACT/outro) — visual Lovable. */
export default async function ArquivosAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("files")
    .select("id, title, type, file_url, storage_path, size_bytes, created_at")
    .order("created_at", { ascending: false });

  const files = (data ?? []) as Pick<
    FileRow,
    "id" | "title" | "type" | "file_url" | "storage_path" | "size_bytes" | "created_at"
  >[];

  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelHeading
          title="Arquivos"
          subtitle={`${files.length} ${files.length === 1 ? "arquivo" : "arquivos"}.`}
        />
        <Link
          href="/admin/arquivos/novo"
          className="group inline-flex items-center gap-2.5 rounded-full bg-brand py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
        >
          Enviar arquivo
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {error ? (
        <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-black ring-1 ring-brand/20">
          Não foi possível carregar os arquivos. Verifique se a tabela{" "}
          <code>files</code> foi criada (migration §14).
        </p>
      ) : files.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center">
          <p className="text-base text-black/70">Nenhum arquivo ainda.</p>
          <Link
            href="/admin/arquivos/novo"
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
                <th className="px-5 py-3.5 font-semibold">Tipo</th>
                <th className="px-5 py-3.5 font-semibold">Data</th>
                <th className="px-5 py-3.5 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-black/5 align-middle last:border-0"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-black">{f.title}</span>
                    {typeof f.size_bytes === "number" && (
                      <span className="block text-sm text-black/45">
                        {(f.size_bytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <TypeBadge type={f.type} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-black/60">
                    {formatDate(f.created_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {f.file_url && (
                        <a
                          href={f.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/5"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          Abrir
                        </a>
                      )}
                      <DeleteFileButton
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

function TypeBadge({ type }: { type: "CCT" | "ACT" | "outro" }) {
  const label = type === "outro" ? "Outro" : type;
  return (
    <span className="inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}
