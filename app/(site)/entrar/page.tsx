import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/auth/role";
import { safeAreaRedirect } from "@/lib/auth/safe-redirect";
import { PageHeader } from "@/components/PageHeader";
import { EntrarForm } from "@/components/EntrarForm";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso restrito aos associados do Sindipro SE.",
  robots: { index: false, follow: false },
};

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Login do associado — mesmo design do site (navbar/footer via layout do
 * grupo "(site)", tokens, PageHeader). Sem cadastro público.
 */
export default async function EntrarPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const next = safeAreaRedirect(firstParam(searchParams.next));
  const erro = firstParam(searchParams.erro);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role = roleFromUser(user);
    redirect(
      next ?? (role === "diretoria" ? "/painel-diretoria" : role === "associado" ? "/area" : "/")
    );
  }

  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-md px-2 pb-16 pt-8 md:pb-24 md:pt-12">
        <PageHeader
          eyebrow="Sindipro SE"
          title="Entrar"
          lead="Acesso restrito aos associados. Sem cadastro público — se você ainda não tem uma conta, fale com a diretoria do sindicato."
        />

        <div className="mt-10 rounded-[28px] bg-white p-8 font-inter md:p-10">
          {erro === "inativo" && (
            <p
              role="alert"
              className="mb-6 rounded-xl bg-brand/5 px-4 py-3 text-sm font-medium text-black ring-1 ring-brand/20"
            >
              Sua conta está inativa. Fale com a diretoria do sindicato para reativar o acesso.
            </p>
          )}

          {erro === "inatividade" && (
            <p
              role="alert"
              className="mb-6 rounded-xl bg-brand/5 px-4 py-3 text-sm font-medium text-black ring-1 ring-brand/20"
            >
              Sua sessão expirou por inatividade. Faça login novamente.
            </p>
          )}

          <EntrarForm next={next} />
        </div>
      </div>
    </main>
  );
}
