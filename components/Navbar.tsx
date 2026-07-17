"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { AuthNavButton } from "@/components/AuthNavButton";
import type { AppRole } from "@/lib/auth/role";

/**
 * Navbar global — visual Lovable "Pixel Perfect Page" em todo o site.
 *
 * Fixa (sticky) sobre o fundo cream em todas as páginas, inclusive a home —
 * fica antes da Hero no fluxo normal, nunca flutuando por cima dela.
 *
 * Dropdown "Sobre nós" (hover, foco e toque), botão "Entrar"/"Minha área" +
 * "Sair" conforme a sessão (authRole vem do layout do site), menu mobile
 * acessível.
 */

const sobreLinks = [
  { href: "/sobre/missao-visao-valores", label: "Sobre nós" },
  { href: "/sobre/diretoria", label: "Quadro de diretoria" },
  { href: "/sobre/imprensa", label: "Assessoria de imprensa" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ authRole }: { authRole: AppRole | null }) {
  const pathname = usePathname();
  const [sobreOpen, setSobreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSobreOpen, setMobileSobreOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fecha tudo ao trocar de rota.
  useEffect(() => {
    setSobreOpen(false);
    setMobileOpen(false);
    setMobileSobreOpen(false);
  }, [pathname]);

  // Trava o scroll do body quando o menu mobile está aberto.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function closeSobreAndFocusTrigger() {
    setSobreOpen(false);
    triggerRef.current?.focus();
  }

  const sobreIsActive = pathname.startsWith("/sobre");

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md">
      <nav
        aria-label="Principal"
        className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-3 md:px-8"
      >
        <Link href="/" className="shrink-0">
          <Image
            src="/img/sindipro-logo.png"
            alt="Sindipro SE"
            width={955}
            height={309}
            priority
            className="h-9 w-auto md:h-10"
          />
        </Link>

        {/* Navegação desktop */}
        <ul className="hidden items-center gap-1 rounded-full bg-black/5 px-1.5 py-1.5 font-inter text-sm text-black lg:flex">
          <li>
            <TopLink href="/" active={isActive(pathname, "/")}>
              Início
            </TopLink>
          </li>

          {/* Dropdown "Sobre nós" — hover + foco + toque */}
          <li
            className="relative"
            onMouseEnter={() => setSobreOpen(true)}
            onMouseLeave={() => setSobreOpen(false)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setSobreOpen(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" && sobreOpen) {
                e.preventDefault();
                closeSobreAndFocusTrigger();
              }
            }}
          >
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="true"
              aria-expanded={sobreOpen}
              aria-controls="menu-sobre"
              onClick={() => setSobreOpen((v) => !v)}
              className={topLinkClasses(sobreIsActive)}
            >
              Sobre nós
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  sobreOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            <div
              id="menu-sobre"
              hidden={!sobreOpen}
              className="absolute left-0 top-full min-w-[15rem] pt-2"
            >
              <ul className="overflow-hidden rounded-[20px] bg-white p-2 shadow-card">
                {sobreLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive(pathname, l.href) ? "page" : undefined}
                      className="block rounded-full px-3 py-2 text-sm text-black transition-colors hover:bg-black/5 aria-[current=page]:text-brand"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          <li>
            <TopLink
              href="/noticias"
              active={isActive(pathname, "/noticias")}
            >
              Notícias
            </TopLink>
          </li>
          <li>
            <TopLink
              href="/arquivos"
              active={isActive(pathname, "/arquivos")}
            >
              Arquivos
            </TopLink>
          </li>
          <li>
            <TopLink
              href="/parceiros"
              active={isActive(pathname, "/parceiros")}
            >
              Parceiros
            </TopLink>
          </li>
        </ul>

        {/* Ações à direita (desktop) */}
        <div className="hidden lg:block">
          <AuthNavButton role={authRole} />
        </div>

        {/* Botão hambúrguer (mobile) */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="menu-mobile"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div
          id="menu-mobile"
          className="mx-4 rounded-[20px] bg-white font-inter shadow-card lg:hidden"
        >
          <ul className="px-6 py-4">
            <li>
              <MobileLink href="/" active={isActive(pathname, "/")}>
                Início
              </MobileLink>
            </li>

            {/* "Sobre nós" como disclosure no mobile (toque) */}
            <li>
              <button
                type="button"
                aria-expanded={mobileSobreOpen}
                aria-controls="submenu-sobre-mobile"
                onClick={() => setMobileSobreOpen((v) => !v)}
                className={`flex w-full items-center justify-between py-3 text-base font-medium ${
                  sobreIsActive ? "text-brand" : "text-black"
                }`}
              >
                Sobre nós
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-200 ${
                    mobileSobreOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {mobileSobreOpen && (
                <ul
                  id="submenu-sobre-mobile"
                  className="mb-2 ml-1 border-l border-black/10 pl-4"
                >
                  {sobreLinks.map((l) => (
                    <li key={l.href}>
                      <MobileLink href={l.href} active={isActive(pathname, l.href)} sub>
                        {l.label}
                      </MobileLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <MobileLink href="/noticias" active={isActive(pathname, "/noticias")}>
                Notícias
              </MobileLink>
            </li>
            <li>
              <MobileLink href="/arquivos" active={isActive(pathname, "/arquivos")}>
                Arquivos
              </MobileLink>
            </li>
            <li>
              <MobileLink href="/parceiros" active={isActive(pathname, "/parceiros")}>
                Parceiros
              </MobileLink>
            </li>

            <li className="mt-4 border-t border-black/10 pt-4">
              <AuthNavButton role={authRole} full />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* ---------- subcomponentes ---------- */

function topLinkClasses(active: boolean) {
  const base = "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm transition";
  return [
    base,
    active ? "bg-white text-black shadow-sm" : "text-black/70 hover:bg-black/5",
  ].join(" ");
}

function TopLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={topLinkClasses(active)}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  active,
  sub = false,
  children,
}: {
  href: string;
  active: boolean;
  sub?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`block py-3 font-medium ${sub ? "text-sm" : "text-base"} ${
        active ? "text-brand" : "text-black"
      }`}
    >
      {children}
    </Link>
  );
}
