"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Exclui um arquivo da área do associado: remove o objeto do Storage
 * (bucket privado member-files) e a linha da tabela `member_files`.
 * Confirma antes de apagar.
 */
export function DeleteMemberFileButton({
  id,
  title,
  storagePath,
}: {
  id: string;
  title: string;
  storagePath: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setLoading(true);
    const supabase = createClient();

    const rm = await supabase.storage.from("member-files").remove([storagePath]);
    if (rm.error) {
      window.alert("Não foi possível remover o arquivo do Storage: " + rm.error.message);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("member_files").delete().eq("id", id);
    if (error) {
      window.alert("Não foi possível excluir o registro: " + error.message);
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
