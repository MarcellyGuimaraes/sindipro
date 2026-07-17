"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MEMBER_FILE_FOLDERS } from "@/lib/member-files";
import type { MemberFileFolder } from "@/lib/types";

/**
 * Upload de arquivo da área do associado — visual Lovable, no mesmo padrão
 * do FileUploadForm (bucket `downloads`), mas para o bucket PRIVADO
 * `member-files`.
 *
 * Diferenças de segurança em relação ao FileUploadForm:
 * - storage_path usa crypto.randomUUID(), nunca o nome original do arquivo
 *   ou o título digitado — não dá pra adivinhar o caminho de outro arquivo.
 * - sem getPublicUrl(): o bucket é privado, não existe URL pública para
 *   guardar. Ler o arquivo depois é trabalho futuro (URL assinada gerada no
 *   servidor, §15) — este formulário só sobe e cataloga.
 * - "só diretoria sobe" é validado no SERVIDOR pela RLS de storage.objects e
 *   de member_files (is_director()), não só pela UI — ver migration 0007.
 *   Mesmo que alguém chame a Storage API direto, sem passar por este
 *   formulário, a policy barra quem não é diretoria.
 */

const MAX_PDF_MB = 20;
const PDF_TYPE = "application/pdf";

export function MemberFileUploadForm() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [folder, setFolder] = useState<MemberFileFolder>("arquivos");
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
    const path = `${folder}/${crypto.randomUUID()}.pdf`;

    const up = await supabase.storage
      .from("member-files")
      .upload(path, file, { contentType: PDF_TYPE, upsert: false });

    if (up.error) {
      console.error("Upload do arquivo do associado falhou:", up.error);
      setErrors((p) => ({ ...p, form: "Não foi possível enviar o arquivo. Tente novamente." }));
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("member_files").insert({
      title: title.trim(),
      folder,
      description: description.trim() || null,
      storage_path: path,
      size_bytes: file.size,
      mime_type: file.type,
    });

    if (error) {
      await supabase.storage.from("member-files").remove([path]);
      console.error("Salvar arquivo do associado falhou:", error);
      setErrors((p) => ({ ...p, form: "Não foi possível salvar o arquivo. Tente novamente." }));
      setSaving(false);
      return;
    }

    router.push("/painel-diretoria/arquivos-associado");
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
            placeholder="Ex.: Ata da assembleia geral — março/2026"
          />
        </Field>

        {/* Pasta */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black">Pasta</span>
          <div className="flex flex-wrap gap-2">
            {MEMBER_FILE_FOLDERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFolder(value)}
                aria-pressed={folder === value}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  folder === value
                    ? "border-brand bg-brand text-white"
                    : "border-black/10 bg-white text-black hover:bg-black/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <Field
          label="Descrição"
          htmlFor="description"
          hint="Opcional. Ex.: a que se refere, período."
        >
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputCls}
            placeholder="Ata da reunião ordinária de março."
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
            onClick={() => router.push("/painel-diretoria/arquivos-associado")}
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
