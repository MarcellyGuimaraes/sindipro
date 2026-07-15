/**
 * Estado de carregamento das rotas públicas. Como as páginas (notícias,
 * arquivos, parceiros, diretoria) são Server Components que buscam dados no
 * Supabase antes de renderizar, este fallback é exibido imediatamente na
 * navegação — a Navbar e o Footer permanecem, só a área de conteúdo mostra o
 * esqueleto. Sem isso, em conexões lentas a página fica só com navbar e
 * footer até o fetch terminar, o que passa sensação de tela quebrada.
 *
 * Blocos genéricos (cabeçalho + grade), não uma cópia exata de cada página —
 * é só um placeholder para preencher o vazio até o conteúdo real entrar
 * (que aí sim usa o fade-in de .animate-fade-in).
 */
export default function Loading() {
  return (
    <main className="min-h-screen bg-cream px-4 pt-4 md:px-8 md:pt-6">
      <span className="sr-only" role="status" aria-live="polite">
        Carregando conteúdo…
      </span>

      <div className="mx-auto max-w-6xl animate-pulse px-2 pb-16 pt-2 md:pb-24 md:pt-4" aria-hidden="true">
        <div className="h-[38vh] min-h-[220px] w-full rounded-[28px] bg-black/5 md:h-[46vh] md:min-h-[320px]" />

        <div className="mt-10 h-3.5 w-32 rounded-full bg-black/10" />
        <div className="mt-4 h-8 w-full max-w-lg rounded-lg bg-black/10 md:h-11" />
        <div className="mt-3 h-3.5 w-full max-w-sm rounded-full bg-black/10" />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <div className="h-48 rounded-[28px] bg-black/5 md:col-span-2" />
          <div className="h-48 rounded-[28px] bg-black/5" />
          <div className="hidden h-48 rounded-[28px] bg-black/5 md:block" />
        </div>
      </div>
    </main>
  );
}
