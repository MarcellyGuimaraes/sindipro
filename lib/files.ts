import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import type { FileRow } from "@/lib/types";
import type { FileCardProps } from "@/components/FileCard";

/**
 * Acesso de leitura aos arquivos para download (site público /arquivos).
 *
 * Lê da tabela `files` do Supabase via Server Component. O bucket `downloads`
 * é público; o botão "Baixar" aponta para `file_url`.
 */

export type GrupoArquivos = {
  eyebrow: string;
  titulo: string;
  arquivos: FileCardProps[];
};

/** Ordem e rótulos de cada grupo na página. */
const GRUPOS: { type: FileRow["type"]; eyebrow: string; titulo: string }[] = [
  { type: "CCT", eyebrow: "Negociação coletiva", titulo: "Convenções Coletivas (CCT)" },
  { type: "ACT", eyebrow: "Acordos do setor", titulo: "Acordos Coletivos (ACT)" },
  { type: "outro", eyebrow: "Documentos", titulo: "Outros arquivos" },
];

/** "1234567" bytes → "1,2 MB". */
function formatSize(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1).replace(".", ",")} MB`;
  const kb = bytes / 1024;
  return `${Math.max(1, Math.round(kb))} KB`;
}

function toMeta(row: FileRow): string {
  const size = formatSize(row.size_bytes);
  // description (ex.: vigência) + "PDF" + tamanho, quando houver.
  return [row.description, "PDF", size].filter(Boolean).join(" · ");
}

/**
 * URL de download forçado: o parâmetro `?download` do Supabase Storage faz o
 * arquivo baixar (Content-Disposition: attachment) com um nome legível, em vez
 * de abrir o PDF inline numa aba.
 */
function downloadHref(fileUrl: string, title: string): string {
  const name = `${slugify(title) || "documento"}.pdf`;
  const sep = fileUrl.includes("?") ? "&" : "?";
  return `${fileUrl}${sep}download=${encodeURIComponent(name)}`;
}

/** Arquivos publicados, agrupados por tipo (mais recente primeiro). */
export async function getArquivosAgrupados(): Promise<GrupoArquivos[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("files")
    .select("id, title, type, description, file_url, storage_path, size_bytes, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  const rows = data as FileRow[];

  return GRUPOS.map(({ type, eyebrow, titulo }) => ({
    eyebrow,
    titulo,
    arquivos: rows
      .filter((r) => r.type === type && r.file_url)
      .map<FileCardProps>((r) => ({
        name: r.title,
        type: r.type,
        meta: toMeta(r),
        href: downloadHref(r.file_url!, r.title),
      })),
  })).filter((g) => g.arquivos.length > 0);
}
