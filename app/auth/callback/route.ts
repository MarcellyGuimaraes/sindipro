import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Callback dos links de e-mail do Supabase (recuperação de senha, etc.) que
 * usam o fluxo PKCE ("?code=..."). Troca o código pela sessão real AQUI, no
 * servidor — grava nos cookies — e só depois redireciona pra página que
 * completa o fluxo (por padrão, /redefinir-senha).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/redefinir-senha";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
