import { Loader2 } from "lucide-react";

/**
 * Estado de carregamento das rotas públicas. Como as páginas (notícias,
 * arquivos, parceiros, diretoria) são Server Components que buscam dados no
 * Supabase antes de renderizar, este fallback é exibido imediatamente na
 * navegação — a Navbar e o Footer permanecem, só a área de conteúdo mostra o
 * indicador. Evita a sensação de "tela travada" enquanto o servidor responde.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-cream px-4">
      <div className="flex items-center gap-3 text-brand" role="status" aria-live="polite">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span className="font-inter text-sm font-medium">Carregando…</span>
      </div>
    </div>
  );
}
