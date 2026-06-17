"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Botão de excluir notícia (lista do painel). Confirma antes de apagar.
 */
export function DeleteNewsButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Excluir a notícia "${title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) {
      window.alert("Não foi possível excluir: " + error.message);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-black/55 transition hover:bg-black/5 hover:text-black disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
      Excluir
    </button>
  );
}
