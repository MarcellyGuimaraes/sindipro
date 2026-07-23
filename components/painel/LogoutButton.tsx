"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Botão de sair — visual Lovable (pílula branca). Encerra a sessão e volta ao
 * login.
 */
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black shadow-sm transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {loading ? "Saindo…" : "Sair"}
    </button>
  );
}
