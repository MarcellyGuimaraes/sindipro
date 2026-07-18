"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMissingProfile } from "@/app/painel-diretoria/(dashboard)/associados/actions";

/**
 * Linha do aviso "contas sem perfil" (CLAUDE.md §15): mostra a conta órfã do
 * Auth e um formulário inline para criar o perfil faltante em `profiles`,
 * sem precisar recriar a conta (o e-mail/senha já existem).
 */
export function OrphanAssociadoRow({
  id,
  email,
}: {
  id: string;
  email: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await createMissingProfile({
      userId: id,
      fullName,
      company,
      email: email ?? "",
    });

    setSaving(false);
    if (!result.ok) {
      setError(
        result.fieldErrors?.fullName ??
          result.fieldErrors?.company ??
          result.fieldErrors?.email ??
          result.error
      );
      return;
    }
    router.refresh();
  }

  return (
    <li className="rounded-xl bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-black">
          {email ?? "(sem e-mail)"}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="shrink-0 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900 transition hover:bg-amber-200"
        >
          {open ? "Cancelar" : "Criar perfil"}
        </button>
      </div>

      {open && (
        <form
          onSubmit={onSubmit}
          className="mt-3 flex flex-wrap items-end gap-2 border-t border-black/5 pt-3"
        >
          <div className="min-w-[12rem] flex-1">
            <label htmlFor={`name-${id}`} className="mb-1 block text-xs font-medium text-black/60">
              Nome completo
            </label>
            <input
              id={`name-${id}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
            />
          </div>
          <div className="min-w-[12rem] flex-1">
            <label htmlFor={`company-${id}`} className="mb-1 block text-xs font-medium text-black/60">
              Provedor
            </label>
            <input
              id={`company-${id}`}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar perfil"}
          </button>
          {error && (
            <p role="alert" className="w-full text-sm font-medium text-black">
              {error}
            </p>
          )}
        </form>
      )}
    </li>
  );
}
