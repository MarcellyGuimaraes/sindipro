"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProvider } from "@/app/painel-diretoria/(dashboard)/provedores/actions";

/**
 * Exclui um provedor. Confirma antes e avisa quantos associados perderão o
 * vínculo — a FK é `on delete set null`, então eles continuam existindo,
 * apenas ficam sem provedor até serem relinkados.
 */
export function DeleteProviderButton({
  id,
  name,
  linkedCount,
}: {
  id: string;
  name: string;
  linkedCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const warning =
      linkedCount > 0
        ? `\n\n${linkedCount} ${
            linkedCount === 1 ? "associado ficará" : "associados ficarão"
          } sem provedor e ${
            linkedCount === 1 ? "precisará" : "precisarão"
          } ser relinkado${linkedCount === 1 ? "" : "s"}.`
        : "";

    if (!window.confirm(`Excluir "${name}"?${warning}`)) return;

    setLoading(true);
    const result = await deleteProvider({ id });
    setLoading(false);

    if (!result.ok) {
      window.alert(result.error);
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
