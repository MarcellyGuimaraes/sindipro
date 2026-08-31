"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createComunicado,
  updateComunicado,
} from "@/app/painel-diretoria/(dashboard)/comunicados/actions";
import {
  COMUNICADO_BODY_MAX,
  COMUNICADO_TITLE_MAX,
} from "@/lib/validation/comunicado";
import type { ComunicadoRow } from "@/lib/types";

/**
 * Formulário de criar/editar comunicado (CLAUDE.md §16).
 *
 * A imagem sobe direto para o bucket PRIVADO comunicado-images pelo client
 * autenticado — a policy de Storage exige is_director(), e o próprio bucket
 * recusa tipo/tamanho fora do permitido (migration 0010). O que o client
 * manda para a Server Action é só o CAMINHO, e o schema do servidor confere
 * o formato `<uuid>.<ext>` antes de gravar.
 *
 * Como o bucket é privado, a pré-visualização não pode usar a URL do
 * Storage: usamos um object URL local do arquivo recém-escolhido e, na
 * edição, a rota autenticada /area/comunicados/[id]/imagem.
 */

const MAX_IMAGE_MB = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function ComunicadoForm({ initial }: { initial?: ComunicadoRow }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [imagePath, setImagePath] = useState(initial?.image_path ?? "");
  const [status, setStatus] = useState<"rascunho" | "publicado">(
    initial?.status ?? "rascunho"
  );

  /** Pré-visualização local do arquivo recém-enviado (bucket é privado). */
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Object URL é memória retida pelo documento até ser revogado.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const savedImageSrc =
    isEdit && imagePath && imagePath === initial?.image_path
      ? `/area/comunicados/${initial!.id}/imagem`
      : null;
  const previewSrc = localPreview ?? savedImageSrc;

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, image: "Use uma imagem JPG, PNG ou WebP." }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: `A imagem deve ter até ${MAX_IMAGE_MB} MB.` }));
      return;
    }

    setErrors((p) => ({ ...p, image: "" }));
    setUploading(true);

    // Nome no bucket é sempre <uuid>.<ext> — nunca o nome original do
    // arquivo, que poderia carregar acento, espaço ou o nome de quem enviou.
    const path = `${crypto.randomUUID()}.${EXT_BY_TYPE[file.type]}`;
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("comunicado-images")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (error) {
      setErrors((p) => ({ ...p, image: "Não foi possível enviar a imagem. Tente novamente." }));
      setUploading(false);
      return;
    }

    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));
    setImagePath(path);
    setUploading(false);
  }

  function clearImage() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setImagePath("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      title,
      body,
      imagePath: imagePath || null,
      status,
    };

    const result = isEdit
      ? await updateComunicado({ ...payload, id: initial!.id })
      : await createComunicado(payload);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? { form: result.error });
      setSaving(false);
      return;
    }

    router.push("/painel-diretoria/comunicados");
    router.refresh();
  }

  const bodyLeft = COMUNICADO_BODY_MAX - body.trim().length;

  return (
    <form onSubmit={onSubmit} className="max-w-3xl" noValidate>
      <div className="space-y-6 rounded-2xl bg-white p-6 md:p-8">
        <Field
          label="Título (opcional)"
          error={errors.title}
          htmlFor="title"
          hint={`Pode ficar em branco — um comunicado curto dispensa título. Até ${COMUNICADO_TITLE_MAX} caracteres.`}
        >
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Ex.: Assembleia extraordinária em 12/09"
          />
        </Field>

        <Field label="Comunicado" error={errors.body} htmlFor="body">
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className={inputCls}
            placeholder="Escreva o comunicado para os associados."
          />
          <p className="mt-1 text-sm text-black/50">
            Texto simples, sem formatação. {bodyLeft < 500
              ? `${bodyLeft} caracteres restantes.`
              : `Até ${COMUNICADO_BODY_MAX} caracteres.`}
          </p>
        </Field>

        {/* Imagem */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black">
            Imagem (opcional)
          </span>
          {previewSrc ? (
            <div className="relative inline-block">
              {/* next/image não ajuda aqui: a origem é uma rota autenticada
                  ou um blob local, ambos fora do pipeline de otimização. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Pré-visualização da imagem do comunicado"
                className="h-40 w-auto rounded-xl border border-black/10 object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remover imagem"
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
            JPG, PNG ou WebP, até {MAX_IMAGE_MB} MB. Fica no armazenamento
            privado — só associado logado consegue ver.
          </p>
          {errors.image && <ErrorText>{errors.image}</ErrorText>}
        </div>

        {/* Status */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black">Status</span>
          <div className="flex gap-2">
            <StatusBtn
              active={status === "rascunho"}
              onClick={() => setStatus("rascunho")}
            >
              Rascunho
            </StatusBtn>
            <StatusBtn
              active={status === "publicado"}
              onClick={() => setStatus("publicado")}
            >
              Publicado
            </StatusBtn>
          </div>
          <p className="mt-1.5 text-sm text-black/50">
            {status === "publicado"
              ? "Visível no feed da área do associado. Curtidas e comentários ficam liberados."
              : "Só a diretoria vê. Não aparece para os associados."}
          </p>
        </div>

        {errors.form && <ErrorText>{errors.form}</ErrorText>}

        <div className="flex items-center gap-3 border-t border-black/10 pt-6">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar comunicado"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/painel-diretoria/comunicados")}
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
