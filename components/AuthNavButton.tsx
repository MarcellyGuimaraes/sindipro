"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/auth/role";

const pillCls =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 font-inter text-sm font-medium transition";

/**
 * Botão "Entrar" / "Minha área" + "Sair" da navbar pública.
 *
 * Deslogado: link para /entrar. Logado (associado OU diretoria): "Minha
 * área" sempre aponta para /area — nunca para /painel-diretoria aqui, porque
 * CLAUDE.md §14 proíbe linkar o painel no site institucional; diretoria
 * também tem acesso a /area (CLAUDE.md §15), então o link continua válido.
 */
export function AuthNavButton({ role, full = false }: { role: AppRole | null; full?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!role) {
    return (
      <Link
        href="/entrar"
        className={`${pillCls} bg-black/5 text-black hover:bg-black/10 ${full ? "w-full" : ""}`}
      >
        Entrar
      </Link>
    );
  }

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className={`flex items-center gap-2 ${full ? "w-full flex-col" : ""}`}>
      <Link
        href="/area"
        className={`${pillCls} bg-black/5 text-black hover:bg-black/10 ${full ? "w-full" : ""}`}
      >
        Minha área
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={`${pillCls} bg-brand text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60 ${
          full ? "w-full" : ""
        }`}
      >
        {loading ? "Saindo…" : "Sair"}
      </button>
    </div>
  );
}
