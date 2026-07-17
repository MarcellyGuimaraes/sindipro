"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssociado } from "@/app/painel-diretoria/(dashboard)/associados/actions";

/**
 * Formulário de criação de acesso do associado — visual Lovable, no mesmo
 * padrão do NewsForm. A escrita real (Admin API + tabela profiles) acontece
 * na Server Action `createAssociado`, nunca no client (precisa da chave
 * secreta).
 */
export function AssociadoCreateForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const result = await createAssociado({ fullName, company, email, password });

    if (!result.ok) {
      setErrors(result.fieldErrors ?? { form: result.error });
      setSaving(false);
      return;
    }

    router.push("/painel-diretoria/associados");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl" noValidate>
      <div className="space-y-5 rounded-2xl bg-white p-6 md:p-8">
        <Field label="Nome completo" error={errors.fullName} htmlFor="fullName">
          <input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls}
            placeholder="Ex.: Maria Souza"
          />
        </Field>

        <Field label="Provedor" error={errors.company} htmlFor="company">
          <input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputCls}
            placeholder="Nome do provedor associado"
          />
        </Field>

        <Field label="E-mail" error={errors.email} htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="associado@provedor.com.br"
          />
        </Field>

        <Field
          label="Senha inicial"
          error={errors.password}
          htmlFor="password"
          hint="Mínimo 10 caracteres, com maiúscula, minúscula e número."
        >
          <input
            id="password"
            type="text"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </Field>

        {errors.form && <ErrorText>{errors.form}</ErrorText>}

        <div className="flex items-center gap-3 border-t border-black/10 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Criando…" : "Criar acesso"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/painel-diretoria/associados")}
            className="text-sm font-medium text-black/60 transition hover:text-black"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

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
