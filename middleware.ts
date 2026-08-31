import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware do Next. Roda nas rotas protegidas (painel da diretoria e área
 * do associado) e nas duas telas de login (ver matcher) — renova a sessão,
 * bloqueia acesso sem login/papel e faz a troca de conta (desloga a sessão
 * incompatível e mostra o formulário). O resto do site público não passa aqui.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Rotas autenticadas + as telas de login (para a troca de conta). O resto
  // do site público (home, notícias, arquivos etc.) não dispara este middleware.
  matcher: ["/painel-diretoria/:path*", "/area/:path*", "/entrar"],
};
