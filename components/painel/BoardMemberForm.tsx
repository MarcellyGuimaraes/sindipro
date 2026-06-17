"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import {
  BOARD_GROUPS,
  EXECUTIVA_ROLES,
  defaultRole,
} from "@/lib/board";
import type { BoardGroup, BoardMemberRow } from "@/lib/types";

/**
 * Formulário de criar/editar membro do quadro de diretoria — visual Lovable.
 * nome, cargo (com sugestões por grupo), grupo (select), foto (board-photos),
 * ordem de exibição. Escreve em board_members via browser client (RLS).
 */

const MAX_IMAGE_MB = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function BoardMemberForm({ initial }: { initial?: BoardMemberRow }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [group, setGroup] = useState<BoardGroup>(
    initial?.board_group ?? "executiva"
  );
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? "");
  const [order, setOrder] = useState<string>(
    initial ? String(initial.display_order) : "0"
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onGroupChange(next: BoardGroup) {
    setGroup(next);
    // Ao trocar para um conselho, sugere o cargo padrão se o campo estiver
    // vazio ou ainda era o padrão do outro conselho.
    const def = defaultRole(next);
    if (def && (!role.trim() || role.startsWith("Conselheiro fiscal"))) {
      setRole(def);
    }
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, photo: "Use uma imagem JPG, PNG ou WebP." }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, photo: `A imagem deve ter até ${MAX_IMAGE_MB} MB.` }));
      return;
    }

    setErrors((p) => ({ ...p, photo: "" }));
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${slugify(name) || "membro"}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("board-photos")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (error) {
      setErrors((p) => ({ ...p, photo: "Não foi possível enviar a foto. Tente novamente." }));
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("board-photos").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
    setUploading(false);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Informe o nome.";
    if (!role.trim()) next.role = "Informe o cargo.";
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
      role: role.trim(),
      board_group: group,
      photo_url: photoUrl || null,
      display_order: Number(order),
    };

    const query = isEdit
      ? supabase.from("board_members").update(payload).eq("id", initial!.id)
      : supabase.from("board_members").insert(payload);

    const { error } = await query;

    if (error) {
      setErrors((p) => ({ ...p, form: "Não foi possível salvar. Tente novamente." }));
      setSaving(false);
      return;
    }

    router.push("/painel-diretoria/diretoria");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl" noValidate>
      <div className="space-y-6 rounded-2xl bg-white p-6 md:p-8">
        {/* Foto */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-black">Foto</span>
          {photoUrl ? (
            <div className="relative inline-block">
              <Image
                src={photoUrl}
                alt="Pré-visualização da foto"
                width={160}
                height={200}
                className="h-40 w-32 rounded-xl border border-black/10 object-cover object-top"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setPhotoUrl("")}
                aria-label="Remover foto"
                className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-black shadow-sm ring-1 ring-black/10 hover:bg-black/5"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/10 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
              <Upload className="h-4 w-4" aria-hidden="true" />
              {uploading ? "Enviando…" : "Enviar foto"}
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
          {errors.photo && <ErrorText>{errors.photo}</ErrorText>}
        </div>

        {/* Nome */}
        <Field label="Nome" error={errors.name} htmlFor="name">
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Ex.: Maria Souza"
          />
        </Field>

        {/* Grupo */}
        <Field label="Grupo" htmlFor="group">
          <select
            id="group"
            value={group}
            onChange={(e) => onGroupChange(e.target.value as BoardGroup)}
            className={inputCls}
          >
            {BOARD_GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Cargo */}
        <Field
          label="Cargo"
          error={errors.role}
          htmlFor="role"
          hint={
            group === "executiva"
              ? "Sugestões: Presidente, Vice-presidente, Secretário-geral…"
              : "Padrão preenchido conforme o grupo; você pode ajustar."
          }
        >
          <input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputCls}
            list={group === "executiva" ? "executiva-roles" : undefined}
            placeholder={
              group === "executiva" ? "Ex.: Presidente" : "Conselheiro fiscal…"
            }
          />
          {group === "executiva" && (
            <datalist id="executiva-roles">
              {EXECUTIVA_ROLES.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          )}
        </Field>

        {/* Ordem */}
        <Field
          label="Ordem de exibição"
          error={errors.order}
          htmlFor="order"
          hint="Menor número aparece primeiro dentro do grupo."
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
            {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Adicionar membro"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/painel-diretoria/diretoria")}
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
