"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, FolderClosed, Users, Handshake } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

/**
 * Shell do painel — visual Lovable (igual ao site público): barra lateral azul
 * brand com itens em pílula, cabeçalho sobre o fundo cream, área de conteúdo.
 * Utilitário: legível e denso, animação mínima.
 */

const nav = [
  { href: "/painel-diretoria/noticias", label: "Notícias", icon: Newspaper },
  { href: "/painel-diretoria/arquivos", label: "Arquivos", icon: FolderClosed },
  { href: "/painel-diretoria/diretoria", label: "Diretoria", icon: Users },
  { href: "/painel-diretoria/parceiros", label: "Parceiros", icon: Handshake },
];

export function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="grid min-h-screen lg:grid-cols-[16rem_1fr]">
      {/* Navegação lateral (desktop) */}
      <aside className="hidden flex-col bg-brand text-white lg:flex">
        <div className="px-6 py-6">
          <Link
            href="/painel-diretoria"
            className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span className="font-inter text-lg font-bold tracking-tight text-white">
              Sindipro SE
            </span>
            <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-white/60">
              Painel da diretoria
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3" aria-label="Painel da diretoria">
          <ul className="space-y-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isActive(href)
                      ? "bg-white text-brand"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Coluna de conteúdo */}
      <div className="flex min-h-screen flex-col bg-cream">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-cream/90 px-4 py-4 backdrop-blur md:px-8">
          {/* Navegação no mobile (a lateral fica oculta) */}
          <nav className="flex items-center gap-1 lg:hidden" aria-label="Painel">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive(href)
                    ? "bg-brand text-white"
                    : "bg-white text-black/70 hover:text-brand"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[16rem] truncate text-sm text-black/60 sm:inline">
              {userEmail}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 px-4 pb-12 md:px-8">{children}</main>
      </div>
    </div>
  );
}
