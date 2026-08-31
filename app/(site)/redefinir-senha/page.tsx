import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { RedefinirSenhaForm } from "@/components/RedefinirSenhaForm";

export const metadata: Metadata = {
  title: "Redefinir senha",
  robots: { index: false, follow: false },
};

/**
 * O RedefinirSenhaForm decide, no client, se o link é válido — cobre tanto
 * o link "?code=" (PKCE, trocado pela sessão no servidor em
 * app/auth/callback/route.ts) quanto o link "#access_token=..." (fluxo
 * implícito, cuja fragment nunca chega ao servidor).
 */
export default function RedefinirSenhaPage() {
  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-md px-2 pb-16 pt-8 md:pb-24 md:pt-12">
        <PageHeader eyebrow="SindiproSE" title="Redefinir senha" />

        <div className="mt-10 rounded-[28px] bg-white p-8 font-inter md:p-10">
          <RedefinirSenhaForm />
        </div>
      </div>
    </main>
  );
}
