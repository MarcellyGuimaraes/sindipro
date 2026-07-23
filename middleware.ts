import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware do Next. Roda APENAS nas rotas do painel da diretoria
 * (ver matcher) — renova a sessão e bloqueia acesso sem login.
 * O site institucional público não passa por aqui.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Escopo restrito ao painel: nada do site público dispara este middleware.
  matcher: ["/admin/:path*"],
};
