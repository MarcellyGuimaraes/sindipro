import type { Metadata } from "next";
import Link from "next/link";
import { FolderClosed, KeyRound, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/auth/role";
import { PageHeader } from "@/components/PageHeader";
import { MEMBER_FILE_FOLDERS } from "@/lib/member-files";
import { getMemberFileCounts } from "@/lib/member-files-data";

export const metadata: Metadata = {
  title: "Área do associado",
};

export default async function AreaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = roleFromUser(user);

  let firstName = "";
  if (role === "associado" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    firstName = profile?.full_name?.split(" ")[0] ?? "";
  }

  const counts = await getMemberFileCounts();

  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-4xl px-2 pb-16 pt-8 md:pb-24 md:pt-12">
        <PageHeader
          align="left"
          eyebrow="Área do associado"
          title={firstName ? `Olá, ${firstName}.` : "Área do associado"}
          lead="Comunicados da diretoria e os documentos do sindicato, organizados por pasta."
        />

        {/* Comunicados vem primeiro: é o conteúdo que muda com frequência
            (feed), enquanto as pastas de PDF são consulta. Fica em destaque,
            fora da grade das pastas — CLAUDE.md §16. */}
        <Link
          href="/area/comunicados"
          className="group mt-10 flex items-center gap-4 rounded-[20px] bg-white p-6 font-inter transition hover:bg-black/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white">
            <Megaphone className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold text-brand">Comunicados</span>
            <span className="mt-0.5 block text-sm text-black/50">
              Avisos da diretoria. Curta e comente.
            </span>
          </span>
        </Link>

        <h2 className="mt-10 font-inter text-sm font-semibold uppercase tracking-[0.08em] text-black/45">
          Documentos
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {MEMBER_FILE_FOLDERS.map(({ value, label }) => {
            const count = counts[value];
            return (
              <Link
                key={value}
                href={`/area/${value}`}
                className="group flex items-center gap-4 rounded-[20px] bg-white p-6 font-inter transition hover:bg-black/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-white">
                  <FolderClosed className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-brand">{label}</span>
                  <span className="mt-0.5 block text-sm text-black/50">
                    {count === 0
                      ? "Nenhum documento"
                      : count === 1
                        ? "1 documento"
                        : `${count} documentos`}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/area/conta"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-brand"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Minha conta — trocar senha
        </Link>
      </div>
    </main>
  );
}
