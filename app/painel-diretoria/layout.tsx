import type { Metadata } from "next";

/**
 * Layout do Painel da diretoria (CLAUDE.md §14) — visual Lovable (igual ao
 * site público): Inter, azul brand, fundo cream, cards arredondados, pílulas.
 * FORA do route group "(site)" — sem Navbar/Footer públicos.
 *
 * - noindex/nofollow em TODAS as rotas do painel.
 * - O portão de acesso real é o middleware (@supabase/ssr) + RLS no banco.
 */
export const metadata: Metadata = {
  title: "Painel da diretoria",
  robots: { index: false, follow: false },
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream font-inter text-black">{children}</div>
  );
}
