"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Exclui um parceiro: remove o logo do Storage (partner-logos), quando houver,
 * e a linha da tabela partners. Confirma antes.
 */
export function DeletePartnerButton({
  id,
  name,
  storagePath,
}: {
  id: string;
  name: string;
  /** Caminho do logo no bucket (derivado da URL), se houver. */
  storagePath?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setLoading(true);
    const supabase = createClient();

    if (storagePath) {
      await supabase.storage.from("partner-logos").remove([storagePath]);
    }

    const { error } = await supabase.from("partners").delete().eq("id", id);
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
