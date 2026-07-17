import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { roleFromUser } from "@/lib/auth/role";

/**
 * Renova a sessão do Supabase a cada request e protege /painel-diretoria e
 * /area (ver matcher no middleware.ts). O resto do site público não passa
 * por aqui.
 *
 * Padrão do guia oficial (Server-Side Auth / Next.js): cria o client preso aos
 * cookies da request/response e chama getUser() para revalidar o token.
 * NÃO inserir código entre createServerClient e getUser.
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

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/area")) {
    return guardArea(request, supabaseResponse, supabase, user);
  }
  return guardPainel(request, supabaseResponse, user);
}

/** Redireciona preservando os cookies renovados/limpos por esta request. */
function redirectTo(
  request: NextRequest,
  base: NextResponse,
  pathname: string,
  params?: Record<string, string>
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const response = NextResponse.redirect(url);
  base.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

function guardPainel(
  request: NextRequest,
  supabaseResponse: NextResponse,
  user: User | null
) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/painel-diretoria/login";

  // Portão de acesso: sem sessão em /painel-diretoria → manda para o login.
  if (!user && !isLogin) {
    return redirectTo(request, supabaseResponse, "/painel-diretoria/login");
  }

  // Papel: só 'diretoria' entra no painel, mesmo com sessão válida.
  // (Não checamos isso na própria /login: um associado autenticado que
  // caia lá é resolvido pela LoginPage, que já redireciona quem tem user
  // para /painel-diretoria — e aí sim é barrado aqui e mandado para o site.)
  if (user && !isLogin && roleFromUser(user) !== "diretoria") {
    return redirectTo(request, supabaseResponse, "/");
  }

  return supabaseResponse;
}

/**
 * Guarda de /area: sessão + papel ('associado' ou 'diretoria', CLAUDE.md
 * §15) + perfil ativo (só se aplica a associado — diretoria não tem linha
 * em profiles). Associado inativo é deslogado aqui mesmo, não só bloqueado
 * na UI.
 */
async function guardArea(
  request: NextRequest,
  supabaseResponse: NextResponse,
  supabase: SupabaseClient,
  user: User | null
) {
  const { pathname } = request.nextUrl;

  if (!user) {
    return redirectTo(request, supabaseResponse, "/entrar", { next: pathname });
  }

  const role = roleFromUser(user);
  if (role !== "associado" && role !== "diretoria") {
    return redirectTo(request, supabaseResponse, "/");
  }

  if (role === "associado") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "ativo") {
      await supabase.auth.signOut();
      return redirectTo(request, supabaseResponse, "/entrar", { erro: "inativo" });
    }
  }

  return supabaseResponse;
}
