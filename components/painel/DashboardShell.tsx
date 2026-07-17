"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper,
  FolderClosed,
  FolderLock,
  Users,
  Handshake,
  UserCog,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

/**
 * Shell do painel — visual Lovable (igual ao site público): barra lateral azul
 * brand com itens em pílula, cabeçalho sobre o fundo cream, área de conteúdo.
 * Utilitário: legível e denso, animação mínima.
 *
 * Responsivo: no desktop (lg+) a lateral fica fixa; no mobile ela vira um
 * drawer aberto por um botão hambúrguer no cabeçalho.
 */

const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/painel-diretoria/noticias", label: "Notícias", icon: Newspaper },
  { href: "/painel-diretoria/arquivos", label: "Arquivos", icon: FolderClosed },
  { href: "/painel-diretoria/diretoria", label: "Diretoria", icon: Users },
  { href: "/painel-diretoria/parceiros", label: "Parceiros", icon: Handshake },
  { href: "/painel-diretoria/associados", label: "Associados", icon: UserCog },
  {
    href: "/painel-diretoria/arquivos-associado",
    label: "Arquivos do associado",
    icon: FolderLock,
  },
];

export function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Fecha o drawer ao trocar de rota.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Trava o scroll do body enquanto o drawer estiver aberto.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="grid min-h-screen lg:grid-cols-[16rem_1fr]">
      {/* Navegação lateral (desktop) */}
      <aside className="hidden flex-col bg-brand text-white lg:flex">
        <SideNavContent isActive={isActive} />
      </aside>

      {/* Drawer da navegação (mobile) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col bg-brand text-white shadow-xl">
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SideNavContent isActive={isActive} />
          </aside>
        </div>
      )}

      {/* Coluna de conteúdo */}
      <div className="flex min-h-screen flex-col bg-cream">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-cream/90 px-4 py-4 backdrop-blur md:px-8">
          {/* Mobile: hambúrguer + rótulo do painel */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand shadow-sm transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="font-inter text-sm font-bold tracking-tight text-brand">
              Painel
            </span>
          </div>
          <div className="hidden lg:block" />

          <div className="flex min-w-0 items-center gap-3">
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

/**
 * Conteúdo da barra lateral (marca + itens de navegação), reusado no desktop e
 * no drawer mobile.
 */
function SideNavContent({
  isActive,
}: {
  isActive: (href: string) => boolean;
}) {
  return (
    <>
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
    </>
  );
}
