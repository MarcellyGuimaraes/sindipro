"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, TriangleAlert } from "lucide-react";
import { setAssociadoProvider } from "@/app/painel-diretoria/(dashboard)/associados/actions";
import { ProviderSelect } from "@/components/painel/ProviderSelect";
import type { ProviderOption } from "@/lib/providers";

/**
 * Provedor vinculado a um associado, com edição inline (CLAUDE.md §16).
 *
 * Quando não há vínculo, mostra o texto legado de `company` como pista —
 * é a linha que a migration 0009 não conseguiu casar e que a diretoria
 * precisa relinkar aqui.
 */
export function AssociadoProviderCell({
  userId,
  providerId,
  providerName,
  legacyCompany,
  providers,
}: {
  userId: string;
  providerId: string | null;
  providerName: string | null;
  legacyCompany: string | null;
  providers: ProviderOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(providerId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    setError(null);

    const result = await setAssociadoProvider({
      userId,
      providerId: value === "" ? null : value,
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.fieldErrors?.providerId ?? result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (open) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <label htmlFor={`provider-${userId}`} className="sr-only">
          Provedor do associado
        </label>
        <ProviderSelect
          id={`provider-${userId}`}
          value={value}
          onChange={setValue}
          providers={providers}
          emptyLabel="Sem provedor"
          className="min-w-[14rem] flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-black outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setValue(providerId ?? "");
            setError(null);
          }}
          className="text-sm font-medium text-black/55 transition hover:text-black"
        >
          Cancelar
        </button>
        {error && (
          <p role="alert" className="w-full text-sm font-medium text-black">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {providerName ? (
        <span className="inline-flex min-w-0 items-center gap-1.5 text-black/70">
          <Building2 className="h-4 w-4 shrink-0 text-black/40" aria-hidden="true" />
          <span className="truncate">{providerName}</span>
        </span>
      ) : (
        <span className="inline-flex min-w-0 items-center gap-1.5 text-amber-800">
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            Sem provedor
            {legacyCompany ? ` — cadastro antigo: “${legacyCompany}”` : ""}
          </span>
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 font-semibold text-brand transition hover:underline"
      >
        {providerName ? "Alterar" : "Vincular"}
      </button>
    </span>
  );
}
