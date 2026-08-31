"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDirectorSession } from "@/lib/auth/role";
import {
  createProviderSchema,
  updateProviderSchema,
  deleteProviderSchema,
} from "@/lib/validation/provider";
import { firstFieldErrors, type ActionResult } from "@/lib/validation/action-result";

/**
 * Server Actions do CRUD de provedores (CLAUDE.md §16).
 *
 * REGRA (mesma da gestão de associados): toda ação revalida "papel ==
 * diretoria" no início. Uma Server Action é um endpoint próprio, chamável
 * independente da página ter sido renderizada — o bloqueio do layout do
 * painel sozinho NÃO a protege. A RLS da tabela é a segunda tranca.
 */

const ACCESS_DENIED: ActionResult = {
  ok: false,
  error: "Acesso restrito à diretoria.",
};

/** Traduz erro de índice único do Postgres em erro de campo. */
function uniqueViolation(message: string): ActionResult | null {
  if (message.includes("providers_name_unique_idx")) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: { name: "Já existe um provedor com esse nome." },
    };
  }
  if (message.includes("providers_cnpj_unique_idx")) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: { cnpj: "Já existe um provedor com esse CNPJ." },
    };
  }
  return null;
}

export async function createProvider(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = createProviderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("providers").insert(parsed.data);

  if (error) {
    return (
      uniqueViolation(error.message) ?? {
        ok: false,
        error: "Não foi possível salvar o provedor. Tente novamente.",
      }
    );
  }

  revalidatePath("/painel-diretoria/provedores");
  revalidatePath("/painel-diretoria/associados");
  return { ok: true };
}

export async function updateProvider(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = updateProviderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }
  const { id, ...fields } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("providers").update(fields).eq("id", id);

  if (error) {
    return (
      uniqueViolation(error.message) ?? {
        ok: false,
        error: "Não foi possível salvar o provedor. Tente novamente.",
      }
    );
  }

  revalidatePath("/painel-diretoria/provedores");
  revalidatePath("/painel-diretoria/associados");
  return { ok: true };
}

/**
 * Exclui o provedor. A FK profiles.provider_id é `on delete set null`: os
 * associados vinculados NÃO são apagados — só perdem o vínculo e voltam a
 * aparecer como "sem provedor" na listagem, para relinkar.
 */
export async function deleteProvider(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = deleteProviderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Provedor inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("providers").delete().eq("id", parsed.data.id);

  if (error) {
    return { ok: false, error: "Não foi possível excluir o provedor. Tente novamente." };
  }

  revalidatePath("/painel-diretoria/provedores");
  revalidatePath("/painel-diretoria/associados");
  return { ok: true };
}
