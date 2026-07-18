import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/painel/LoginForm";

export const metadata: Metadata = {
  title: "Entrar - Painel da diretoria",
  robots: { index: false, follow: false },
};

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Login do painel — visual Lovable. Se já houver sessão, vai para o painel.
 * Sem cadastro público: contas são criadas manualmente no Supabase.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/painel-diretoria");

  const erro = firstParam(searchParams.erro);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 font-inter">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/50">
            Sindipro SE
          </p>
          <h1 className="mt-2 font-inter text-2xl font-bold tracking-tight text-brand">
            Painel da diretoria
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Acesso restrito. Entre com seu e-mail e senha.
          </p>

          {erro === "inatividade" && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-brand/5 px-4 py-3 text-sm font-medium text-black ring-1 ring-brand/20"
            >
              Sua sessão expirou por inatividade. Faça login novamente.
            </p>
          )}

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-black/50">
          Não há cadastro público. As contas são criadas pela diretoria.
        </p>
      </div>
    </main>
  );
}
