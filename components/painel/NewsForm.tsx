"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import { renderMarkdown } from "@/lib/markdown.client";
import type { NewsRow } from "@/lib/types";

/**
 * Formulário de criar/editar notícia — visual Lovable (card branco, inputs
 * arredondados, abas e status em pílula, botão brand).
 * - título gera o slug (editável); conteúdo em markdown com pré-visualização;
 * - upload de capa para o bucket news-images; rascunho/publicado define published_at.
 * Escreve na tabela `news` via browser client (sessão authenticated, RLS).
 */

const MAX_IMAGE_MB = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function NewsForm({ initial }: { initial?: NewsRow }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.cover_image_url ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    initial?.status ?? "draft"
  );

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, cover: "Use uma imagem JPG, PNG ou WebP." }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, cover: `A imagem deve ter até ${MAX_IMAGE_MB} MB.` }));
      return;
    }

    setErrors((p) => ({ ...p, cover: "" }));
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${slug || slugify(title) || "noticia"}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("news-images")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (error) {
      setErrors((p) => ({ ...p, cover: "Não foi possível enviar a imagem. Tente novamente." }));
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("news-images").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
    setUploading(false);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Informe o título.";
    if (!slug.trim()) next.slug = "O slug não pode ficar vazio.";
    if (!content.trim()) next.content = "Escreva o conteúdo da notícia.";
    if (status === "published" && !excerpt.trim())
      next.excerpt = "O resumo é obrigatório para publicar.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const supabase = createClient();
    const nowIso = new Date().toISOString();
    const published_at =
      status === "published" ? initial?.published_at ?? nowIso : null;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content,
      cover_image_url: coverUrl || null,
      status,
      published_at,
    };

    const query = isEdit
      ? supabase.from("news").update(payload).eq("id", initial!.id)
      : supabase.from("news").insert(payload);

    const { error } = await query;

    if (error) {
      setSaving(false);
      if (error.code === "23505") {
        setErrors((p) => ({ ...p, slug: "Já existe uma notícia com esse slug." }));
        return;
      }
      setErrors((p) => ({ ...p, form: "Não foi possível salvar. Tente novamente." }));
      return;
    }

    router.push("/painel-diretoria/noticias");
    router.refresh();
  }

  // Só sanitiza/renderiza quando a aba de preview está ativa (interação no
  // browser, após a hidratação) — evita rodar o DOMPurify no SSR.
  const previewHtml =
    tab === "preview" ? renderMarkdown(content || "_Nada para pré-visualizar._") : "";

  return (
    <form onSubmit={onSubmit} className="max-w-3xl" noValidate>
      <div className="space-y-6 rounded-2xl bg-white p-6 md:p-8">
        {/* Título */}
        <Field label="Título" error={errors.title} htmlFor="title">
          <input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={inputCls}
            placeholder="Ex.: Sindipro fecha nova CCT"
          />
        </Field>

        {/* Slug */}
        <Field
          label="Slug (endereço da notícia)"
          error={errors.slug}
          htmlFor="slug"
          hint="Gerado a partir do título; você pode ajustar."
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-black/45">/noticias/</span>
            <input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className={inputCls}
            />
          </div>
        </Field>

        {/* Resumo */}
        <Field
          label="Resumo"
          error={errors.excerpt}
          htmlFor="excerpt"
          hint="Aparece nos cards e na busca. Obrigatório para publicar."
        >
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className={inputCls}
            placeholder="Uma ou duas frases resumindo a notícia."
          />
        </Field>

        {/* Conteúdo (markdown + preview) */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-black">Conteúdo</span>
            <div className="flex gap-1 rounded-full bg-black/5 p-1">
              <TabBtn active={tab === "write"} onClick={() => setTab("write")}>
                Escrever
              </TabBtn>
              <TabBtn active={tab === "preview"} onClick={() => setTab("preview")}>
                Pré-visualizar
              </TabBtn>
            </div>
          </div>

          {tab === "write" ? (
            <>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className={inputCls}
                placeholder={"Use markdown:\n\n## Subtítulo\n\nParágrafo com **negrito** e *itálico*.\n\n- item de lista\n- outro item"}
              />
              <p className="mt-1 text-sm text-black/50">
                Formatação simples: <code>## subtítulo</code>,{" "}
                <code>**negrito**</code>, <code>- listas</code>,{" "}
                <code>[link](https://...)</code>.
              </p>
            </>
          ) : (
            <div
              className="min-h-[18rem] rounded-xl border border-black/10 bg-white p-4 text-base leading-relaxed text-black/80 [&_a]:text-brand [&_a]:underline [&_h1]:mt-4 [&_h1]:font-inter [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-brand [&_h2]:mt-4 [&_h2]:font-inter [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-brand [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-3 [&_strong]:font-semibold [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
          {errors.content && <ErrorText>{errors.content}</ErrorText>}
        </div>

        {/* Capa */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black">
            Imagem de capa
          </span>
          {coverUrl ? (
            <div className="relative inline-block">
              <Image
                src={coverUrl}
                alt="Pré-visualização da capa"
                width={320}
                height={180}
                className="h-40 w-auto rounded-xl border border-black/10 object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setCoverUrl("")}
                aria-label="Remover capa"
                className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-black shadow-sm ring-1 ring-black/10 hover:bg-black/5"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/10 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
              <Upload className="h-4 w-4" aria-hidden="true" />
              {uploading ? "Enviando…" : "Enviar imagem"}
              <input
                type="file"
                accept={IMAGE_TYPES.join(",")}
                onChange={onPickImage}
                className="sr-only"
                disabled={uploading}
              />
            </label>
          )}
          <p className="mt-1 text-sm text-black/50">
            JPG, PNG ou WebP, até {MAX_IMAGE_MB} MB.
          </p>
          {errors.cover && <ErrorText>{errors.cover}</ErrorText>}
        </div>

        {/* Status */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black">Status</span>
          <div className="flex gap-2">
            <StatusBtn active={status === "draft"} onClick={() => setStatus("draft")}>
              Rascunho
            </StatusBtn>
            <StatusBtn
              active={status === "published"}
              onClick={() => setStatus("published")}
            >
              Publicado
            </StatusBtn>
          </div>
          <p className="mt-1.5 text-sm text-black/50">
            {status === "published"
              ? "Visível no site público. Ao salvar, registra a data de publicação."
              : "Só você vê. Não aparece no site público."}
          </p>
        </div>

        {errors.form && <ErrorText>{errors.form}</ErrorText>}

        <div className="flex items-center gap-3 border-t border-black/10 pt-6">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar notícia"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/painel-diretoria/noticias")}
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

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition ${
        active ? "bg-brand text-white" : "text-black/60 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-black/10 bg-white text-black hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}
