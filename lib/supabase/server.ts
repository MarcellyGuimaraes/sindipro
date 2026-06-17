import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client do Supabase para uso no SERVIDOR (Server Components, Route Handlers,
 * Server Actions do painel). Lê/escreve a sessão nos cookies da request.
 *
 * Guia oficial: Supabase > Auth > Server-Side > Next.js (App Router).
 * `createClient` é async para ser compatível com o `cookies()` assíncrono das
 * versões mais novas do Next (no 14.2 o await é inócuo).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chamado a partir de um Server Component (não pode setar cookie).
            // Ignorável: o middleware de sessão cuida da renovação dos cookies.
          }
        },
      },
    }
  );
}
