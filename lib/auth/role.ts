import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Papel de acesso (CLAUDE.md §15). Vive em app_metadata — NUNCA em
 * user_metadata, porque user_metadata é editável pelo próprio usuário via
 * supabase.auth.updateUser() no client, o que permitiria auto-promoção a
 * diretoria. app_metadata só é editável pelo servidor (service role).
 */
export type AppRole = "diretoria" | "associado";

function parseRole(value: unknown): AppRole | null {
  return value === "diretoria" || value === "associado" ? value : null;
}

/** Extrai o papel de um objeto User já obtido (ex.: de supabase.auth.getUser()). */
export function roleFromUser(user: User | null): AppRole | null {
  if (!user) return null;
  return parseRole(user.app_metadata?.role);
}

/**
 * Lê o papel da sessão atual no servidor. Usa getUser(), que revalida o
 * token junto ao Supabase Auth (não decodifica o JWT localmente) — é a
 * mesma checagem que já protege /painel-diretoria por sessão.
 */
export async function getSessionRole(): Promise<AppRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return roleFromUser(user);
}

export async function isDirectorSession(): Promise<boolean> {
  return (await getSessionRole()) === "diretoria";
}
