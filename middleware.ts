import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware do Next. Roda APENAS nas rotas protegidas (painel da diretoria
 * e área do associado — ver matcher) — renova a sessão e bloqueia acesso sem
 * login/papel. O resto do site institucional público não passa por aqui.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Escopo restrito às rotas autenticadas: o site público (home, notícias,
  // arquivos, /entrar etc.) não dispara este middleware.
  matcher: ["/painel-diretoria/:path*", "/area/:path*"],
};
