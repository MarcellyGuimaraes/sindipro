"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProvider,
  updateProvider,
} from "@/app/painel-diretoria/(dashboard)/provedores/actions";
import { formatCnpj } from "@/lib/validation/provider";
import type { ProviderRow } from "@/lib/types";

/**
 * Formulário de criar/editar provedor (CLAUDE.md §16) — visual do painel,
 * mesmo padrão do PartnerForm/AssociadoCreateForm.
 *
 * A escrita passa por Server Action: a validação que vale (nome, CNPJ,
 * papel 'diretoria') é a do servidor. Aqui só exibimos o que ela devolve.
 */
export function ProviderForm({ initial }: { initial?: ProviderRow }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [cnpj, setCnpj] = useState(formatCnpj(initial?.cnpj ?? null) ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [status, setStatus] = useState<"ativo" | "inativo">(
    initial?.status ?? "ativo"
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = { name, cnpj, city, status };
    const result = isEdit
      ? await updateProvider({ ...payload, id: initial!.id })
      : await createProvider(payload);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? { form: result.error });
      setSaving(false);
      return;
    }

    router.push("/painel-diretoria/provedores");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl" noValidate>
      <div className="space-y-5 rounded-2xl bg-white p-6 md:p-8">
        <Field label="Nome do provedor" error={errors.name} htmlFor="name">
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Ex.: NetSergipe Telecom"
          />
        </Field>

        <Field
          label="CNPJ (opcional)"
          error={errors.cnpj}
          htmlFor="cnpj"
          hint="Pode digitar com ou sem pontuação."
        >
          <input
            id="cnpj"
            inputMode="numeric"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            className={inputCls}
            placeholder="00.000.000/0000-00"
          />
        </Field>

        <Field label="Cidade (opcional)" error={errors.city} htmlFor="city">
          <input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputCls}
            placeholder="Ex.: Aracaju"
          />
        </Field>

        <Field
          label="Status"
          error={errors.status}
          htmlFor="status"
          hint="Provedor inativo continua no cadastro, mas sai da lista de escolha de novos associados."
        >
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")}
            className={`${inputCls} max-w-[12rem]`}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </Field>

        {errors.form && <ErrorText>{errors.form}</ErrorText>}

        <div className="flex items-center gap-3 border-t border-black/10 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Adicionar provedor"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/painel-diretoria/provedores")}
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
