import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client do Supabase com a CHAVE SECRETA (service role) — bypassa RLS e dá
 * acesso à Admin API de Auth (createUser, updateUserById, deleteUser).
 *
 * "server-only" quebra o build se este módulo for importado por engano em
 * um Client Component. NUNCA importar isto fora de Server Actions/Route
 * Handlers; a chave nunca pode chegar ao bundle do client.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
