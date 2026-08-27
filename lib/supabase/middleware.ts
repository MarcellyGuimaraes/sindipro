import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { roleFromUser } from "@/lib/auth/role";

/**
 * Renova a sessão do Supabase a cada request, protege /painel-diretoria e
 * /area e cuida da troca de conta nas telas de login /entrar e
 * /painel-diretoria/login (ver matcher no middleware.ts). O resto do site
 * público não passa por aqui.
 *
 * Padrão do guia oficial (Server-Side Auth / Next.js): cria o client preso aos
 * cookies da request/response e chama getUser() para revalidar o token.
 * NÃO inserir código entre createServerClient e getUser.
 */
/**
 * Contêiner da resposta em construção.
 *
 * POR QUE UM OBJETO, E NÃO UMA VARIÁVEL SOLTA
 * `setAll` (abaixo) precisa TROCAR a resposta quando o Supabase grava ou
 * limpa cookies — inclusive durante um signOut() feito dentro de um guard.
 * Com uma variável solta passada por parâmetro, o guard ficava segurando a
 * resposta ANTIGA: o signOut limpava os cookies numa resposta nova que era
 * descartada, e o redirect saía com os cookies antigos ainda válidos. O
 * resultado era um laço de redirecionamento na tela de login.
 * Com o contêiner, quem lê `ref.current` depois do signOut vê a resposta
 * certa.
 */
type ResponseRef = { current: NextResponse };

export async function updateSession(request: NextRequest) {
  const ref: ResponseRef = { current: NextResponse.next({ request }) };

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
          ref.current = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            ref.current.cookies.set(name, value, options)
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

  if (pathname === "/entrar") {
    return guardEntrar(request, ref, supabase, user);
  }
  if (pathname.startsWith("/area")) {
    return guardArea(request, ref, supabase, user);
  }
  return guardPainel(request, ref, supabase, user);
}

/**
 * Redireciona preservando os cookies renovados/limpos por esta request.
 * Lê `ref.current` no momento da chamada — depois de um eventual signOut —
 * para levar os cookies de fato atuais, e não uma resposta obsoleta.
 */
function redirectTo(
  request: NextRequest,
  ref: ResponseRef,
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
  ref.current.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

async function guardPainel(
  request: NextRequest,
  ref: ResponseRef,
  supabase: SupabaseClient,
  user: User | null
) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/painel-diretoria/login";

  if (isLogin) {
    // Troca de conta: uma sessão que NÃO é de diretoria (associado ou sem
    // papel) na tela de login do painel é encerrada em silêncio, mostrando
    // o formulário — em vez de rebater a pessoa para fora. Diretoria logada
    // aqui é levada ao painel pela própria LoginPage. Escopo 'local': só
    // esta sessão/navegador, não desloga a pessoa em outros dispositivos.
    if (user && roleFromUser(user) !== "diretoria") {
      await supabase.auth.signOut({ scope: "local" });
      // SEM redirect: seguimos direto para a página de login, na MESMA
      // request, já com os cookies limpos por signOut(). Redirecionar para
      // a própria URL era o que criava o laço quando a limpeza de cookie
      // não pegava — e mesmo funcionando é um ida-e-volta desnecessário.
      return ref.current;
    }
    return ref.current;
  }

  // Portão de acesso: sem sessão em /painel-diretoria → manda para o login.
  if (!user) {
    return redirectTo(request, ref, "/painel-diretoria/login");
  }

  // Papel: só 'diretoria' entra no painel, mesmo com sessão válida.
  // O associado vai para a tela de LOGIN do painel (e não para "/"), que é
  // onde ele consegue trocar de conta — o guard acima encerra a sessão de
  // associado ao chegar lá. Mandar para "/" deixava a pessoa sem caminho.
  if (roleFromUser(user) !== "diretoria") {
    return redirectTo(request, ref, "/painel-diretoria/login");
  }

  return ref.current;
}

/**
 * Guarda da tela de login do associado (/entrar).
 *
 * Troca de conta: uma sessão que NÃO é de associado (diretoria ou sem papel)
 * é encerrada em silêncio para mostrar o formulário — é o que permite entrar
 * com a outra conta sem ficar preso na sessão anterior. Associado já logado é
 * levado à sua área pela própria EntrarPage. Escopo 'local': não afeta outros
 * dispositivos.
 */
async function guardEntrar(
  request: NextRequest,
  ref: ResponseRef,
  supabase: SupabaseClient,
  user: User | null
) {
  if (user && roleFromUser(user) !== "associado") {
    await supabase.auth.signOut({ scope: "local" });
    // Mesma correção do painel: segue para o formulário nesta request, com
    // os cookies já limpos, em vez de redirecionar para a própria URL.
    return ref.current;
  }
  return ref.current;
}

/**
 * Guarda de /area: sessão + papel ('associado' ou 'diretoria', CLAUDE.md
 * §15) + perfil ativo (só se aplica a associado — diretoria não tem linha
 * em profiles). Associado inativo é deslogado aqui mesmo, não só bloqueado
 * na UI.
 */
async function guardArea(
  request: NextRequest,
  ref: ResponseRef,
  supabase: SupabaseClient,
  user: User | null
) {
  const { pathname } = request.nextUrl;

  if (!user) {
    return redirectTo(request, ref, "/entrar", { next: pathname });
  }

  const role = roleFromUser(user);
  if (role !== "associado" && role !== "diretoria") {
    return redirectTo(request, ref, "/");
  }

  if (role === "associado") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "ativo") {
      await supabase.auth.signOut();
      // Aqui o redirect é para OUTRA rota, então ele é necessário — e agora
      // leva os cookies limpos, lidos de ref.current depois do signOut.
      return redirectTo(request, ref, "/entrar", { erro: "inativo" });
    }
  }

  return ref.current;
}
