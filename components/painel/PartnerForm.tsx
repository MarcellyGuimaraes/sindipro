"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import type { PartnerRow } from "@/lib/types";

/**
 * Formulário de criar/editar parceiro — visual Lovable.
 * nome, logo (bucket partner-logos), site (opcional) e ordem de exibição.
 * Escreve em `partners` via browser client (RLS).
 */

const MAX_IMAGE_MB = 2;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export function PartnerForm({ initial }: { initial?: PartnerRow }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");
  const [linkUrl, setLinkUrl] = useState(initial?.link_url ?? "");
  const [order, setOrder] = useState<string>(
    initial ? String(initial.display_order) : "0"
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, logo: "Use uma imagem JPG, PNG, WebP ou SVG." }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, logo: `O logo deve ter até ${MAX_IMAGE_MB} MB.` }));
      return;
    }

    setErrors((p) => ({ ...p, logo: "" }));
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${slugify(name) || "parceiro"}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("partner-logos")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (error) {
      setErrors((p) => ({ ...p, logo: "Não foi possível enviar o logo. Tente novamente." }));
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("partner-logos").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setUploading(false);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Informe o nome do parceiro.";
    if (order.trim() === "" || Number.isNaN(Number(order)))
      next.order = "Informe um número para a ordem.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: name.trim(),
      logo_url: logoUrl || null,
      link_url: linkUrl.trim() || null,
      display_order: Number(order),
    };

    const query = isEdit
      ? supabase.from("partners").update(payload).eq("id", initial!.id)
      : supabase.from("partners").insert(payload);

    const { error } = await query;

    if (error) {
      setErrors((p) => ({ ...p, form: "Não foi possível salvar. Tente novamente." }));
      setSaving(false);
      return;
    }

    router.push("/painel-diretoria/parceiros");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl" noValidate>
      <div className="space-y-6 rounded-2xl bg-white p-6 md:p-8">
        {/* Logo */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black">Logo</span>
          {logoUrl ? (
            <div className="relative inline-block">
              <Image
                src={logoUrl}
                alt="Pré-visualização do logo"
                width={220}
                height={96}
                className="h-24 w-auto rounded-xl border border-black/10 bg-white object-contain p-3"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                aria-label="Remover logo"
                className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-black shadow-sm ring-1 ring-black/10 hover:bg-black/5"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/10 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
              <Upload className="h-4 w-4" aria-hidden="true" />
              {uploading ? "Enviando…" : "Enviar logo"}
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
            PNG/SVG com fundo transparente fica melhor. Até {MAX_IMAGE_MB} MB.
          </p>
          {errors.logo && <ErrorText>{errors.logo}</ErrorText>}
        </div>

        {/* Nome */}
        <Field label="Nome" error={errors.name} htmlFor="name">
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Ex.: D'Alencar Advocacia"
          />
        </Field>

        {/* Site (opcional) */}
        <Field
          label="Site (opcional)"
          error={errors.link}
          htmlFor="link"
          hint="Se preenchido, o logo vira link para o site do parceiro."
        >
          <input
            id="link"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className={inputCls}
            placeholder="https://…"
          />
        </Field>

        {/* Ordem */}
        <Field
          label="Ordem de exibição"
          error={errors.order}
          htmlFor="order"
          hint="Menor número aparece primeiro no carrossel."
        >
          <input
            id="order"
            type="number"
            inputMode="numeric"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className={`${inputCls} max-w-[8rem]`}
          />
        </Field>

        {errors.form && <ErrorText>{errors.form}</ErrorText>}

        <div className="flex items-center gap-3 border-t border-black/10 pt-6">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Adicionar parceiro"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/painel-diretoria/parceiros")}
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
