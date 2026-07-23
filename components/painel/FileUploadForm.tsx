"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";

/**
 * Formulário de upload de arquivo (CCT/ACT/outro) — visual Lovable.
 * Envia o PDF para o bucket `downloads`, gera a URL pública e grava os
 * metadados na tabela `files`. Escreve via browser client (RLS authenticated).
 */

const MAX_PDF_MB = 20;
const PDF_TYPE = "application/pdf";

export function FileUploadForm() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"CCT" | "ACT" | "outro">("CCT");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setErrors((p) => ({ ...p, file: "" }));
    if (f) {
      if (f.type !== PDF_TYPE) {
        setErrors((p) => ({ ...p, file: "Envie um arquivo PDF." }));
        setFile(null);
        return;
      }
      if (f.size > MAX_PDF_MB * 1024 * 1024) {
        setErrors((p) => ({ ...p, file: `O PDF deve ter até ${MAX_PDF_MB} MB.` }));
        setFile(null);
        return;
      }
      if (!title.trim()) setTitle(f.name.replace(/\.pdf$/i, ""));
    }
    setFile(f);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!file) next.file = "Selecione um arquivo PDF.";
    if (!title.trim()) next.title = "Informe o título do documento.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !file) return;

    setSaving(true);
    const supabase = createClient();
    const base = slugify(title) || "documento";
    const path = `${type.toLowerCase()}/${base}-${Date.now()}.pdf`;

    const up = await supabase.storage
      .from("downloads")
      .upload(path, file, { contentType: PDF_TYPE, upsert: false });

    if (up.error) {
      console.error("Upload do arquivo falhou:", up.error);
      setErrors((p) => ({ ...p, form: "Não foi possível enviar o arquivo. Tente novamente." }));
      setSaving(false);
      return;
    }

    const { data: pub } = supabase.storage.from("downloads").getPublicUrl(path);

    const { error } = await supabase.from("files").insert({
      title: title.trim(),
      type,
      description: description.trim() || null,
      storage_path: path,
      file_url: pub.publicUrl,
      size_bytes: file.size,
    });

    if (error) {
      await supabase.storage.from("downloads").remove([path]);
      console.error("Salvar arquivo falhou:", error);
      setErrors((p) => ({ ...p, form: "Não foi possível salvar o arquivo. Tente novamente." }));
      setSaving(false);
      return;
    }

    router.push("/admin/arquivos");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl" noValidate>
      <div className="space-y-6 rounded-2xl bg-white p-6 md:p-8">
        {/* Arquivo */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black">
            Arquivo (PDF)
          </span>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 transition hover:bg-black/5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
            {file ? (
              <FileText className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
            ) : (
              <Upload className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1 truncate text-base text-black">
              {file ? file.name : "Escolher arquivo…"}
            </span>
            {file && (
              <span className="shrink-0 text-sm text-black/50">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            )}
            <input
              type="file"
              accept="application/pdf"
              onChange={onPickFile}
              className="sr-only"
            />
          </label>
          <p className="mt-1 text-sm text-black/50">Apenas PDF, até {MAX_PDF_MB} MB.</p>
          {errors.file && <ErrorText>{errors.file}</ErrorText>}
        </div>

        {/* Título */}
        <Field label="Título do documento" error={errors.title} htmlFor="title">
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Ex.: Convenção Coletiva de Trabalho 2026/2027"
          />
        </Field>

        {/* Tipo */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black">Tipo</span>
          <div className="flex flex-wrap gap-2">
            {(["CCT", "ACT", "outro"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  type === t
                    ? "border-brand bg-brand text-white"
                    : "border-black/10 bg-white text-black hover:bg-black/5"
                }`}
              >
                {t === "outro" ? "Outro" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <Field
          label="Descrição"
          htmlFor="description"
          hint="Opcional. Ex.: vigência, observações."
        >
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputCls}
            placeholder="Vigência 2026/2027."
          />
        </Field>

        {errors.form && <ErrorText>{errors.form}</ErrorText>}

        <div className="flex items-center gap-3 border-t border-black/10 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Enviando…" : "Enviar arquivo"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/arquivos")}
            className="text-sm font-medium text-black/60 transition hover:text-black"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

/* ---------- UI ---------- */

const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-base text-black outline-none transition placeholder:text-black/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30";

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-black">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-sm text-black/50">{hint}</p>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-1 border-l-2 border-brand pl-2 text-sm font-medium text-black"
    >
      {children}
    </p>
  );
}
