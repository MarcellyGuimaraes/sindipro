import { createBrowserClient } from "@supabase/ssr";

/**
 * Client do Supabase para uso no BROWSER (Client Components do painel).
 * Usa a chave publishable (sb_publishable_...), que pode ir ao client.
 *
 * Guia oficial: Supabase > Auth > Server-Side > Next.js (App Router).
 * NUNCA usar @supabase/auth-helpers (depreciado) — CLAUDE.md §14.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
