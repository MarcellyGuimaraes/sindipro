import { createClient } from "@/lib/supabase/server";
import type { ProviderRow } from "@/lib/types";

/**
 * Leitura de provedores (CLAUDE.md §16). Server Component / Server Action.
 * RLS libera SELECT para autenticado — não há leitura anônima.
 */

/** Opção do SELECT de provedor no formulário de associado. */
export type ProviderOption = {
  id: string;
  name: string;
  city: string | null;
  status: "ativo" | "inativo";
};

/**
 * Provedores para o SELECT do formulário de associado.
 *
 * Traz também os inativos: um associado já vinculado a um provedor que foi
 * inativado precisa continuar aparecendo corretamente no formulário (senão o
 * select abriria vazio e um "salvar" desavisado apagaria o vínculo). A tela
 * marca os inativos.
 */
export async function listProviderOptions(): Promise<ProviderOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("providers")
    .select("id, name, city, status")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data as ProviderOption[];
}

/** Todos os provedores, para a listagem do painel. */
export async function listProviders(): Promise<{
  providers: ProviderRow[];
  error: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("name", { ascending: true });

  if (error) return { providers: [], error: true };
  return { providers: (data ?? []) as ProviderRow[], error: false };
}
