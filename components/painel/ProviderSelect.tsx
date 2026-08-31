"use client";

import type { ProviderOption } from "@/lib/providers";

/**
 * SELECT de provedor (CLAUDE.md §16) — substitui o antigo campo de texto
 * livre nos formulários de associado. As opções vêm de `providers`,
 * carregadas no servidor e passadas por prop.
 *
 * Provedor inativo aparece marcado e só é selecionável se JÁ for o vínculo
 * atual (`value`): assim um associado de provedor inativado continua
 * exibindo o vínculo certo, sem que a lista convide a criar vínculos novos
 * com um provedor fora de atividade.
 */
export function ProviderSelect({
  id,
  value,
  onChange,
  providers,
  allowEmpty = true,
  emptyLabel = "Selecione o provedor",
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  providers: ProviderOption[];
  /** Permite a opção vazia (nenhum provedor). */
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {providers.map((p) => (
        <option
          key={p.id}
          value={p.id}
          disabled={p.status === "inativo" && p.id !== value}
        >
          {p.name}
          {p.city ? ` — ${p.city}` : ""}
          {p.status === "inativo" ? " (inativo)" : ""}
        </option>
      ))}
    </select>
  );
}

/** Aviso padrão para quando ainda não há nenhum provedor cadastrado. */
export function NoProvidersNotice() {
  return (
    <p className="mt-1 text-sm text-black/60">
      Nenhum provedor cadastrado ainda. Cadastre em{" "}
      <a
        href="/painel-diretoria/provedores/novo"
        className="font-semibold text-brand hover:underline"
      >
        Provedores
      </a>{" "}
      antes de criar o acesso.
    </p>
  );
}
