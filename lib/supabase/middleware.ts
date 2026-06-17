import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Renova a sessão do Supabase a cada request e protege o painel da diretoria.
 *
 * Padrão do guia oficial (Server-Side Auth / Next.js): cria o client preso aos
 * cookies da request/response e chama getUser() para revalidar o token.
 * NÃO inserir código entre createServerClient e getUser.
 *
 * Escopo: só roda nas rotas /painel-diretoria (ver matcher no middleware.ts);
 * o site institucional público não é afetado.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: não rodar lógica entre createServerClient e getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Portão de acesso: sem sessão em /painel-diretoria → manda para o login.
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/painel-diretoria/login";
  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel-diretoria/login";
    return NextResponse.redirect(url);
  }

  // Sempre retornar o supabaseResponse para preservar os cookies renovados.
  return supabaseResponse;
}
