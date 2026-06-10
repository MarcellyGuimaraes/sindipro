"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

/**
 * Navbar sticky (CLAUDE.md §6): logo à esquerda; Início · Sobre nós ▾ ·
 * Notícias · Arquivos; botão "Entrar" visível mas desabilitado ("em breve").
 *
 * "Sobre nós" abre por hover, por foco de teclado e por toque (mobile).
 * Acessível: aria-expanded/haspopup, Esc fecha e devolve o foco ao gatilho,
 * aria-current na rota ativa, foco visível herdado do globals.css.
 *
 * TODO: trocar o wordmark pelo logo oficial (SVG) do Sindipro SE.
 */

const sobreLinks = [
  { href: "/sobre/quem-somos", label: "Quem somos" },
  { href: "/sobre/diretoria", label: "Quadro de diretoria" },
  { href: "/sobre/imprensa", label: "Assessoria de imprensa" },
];

const mainLinks = [
  { href: "/", label: "Início" },
  { href: "/noticias", label: "Notícias" },
  { href: "/arquivos", label: "Arquivos" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
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
    <header className="sticky top-0 z-50 border-b border-blue-200 bg-surface">
      <nav
        aria-label="Principal"
        className="mx-auto flex h-16 w-full max-w-container items-center justify-between px-6 sm:px-8"
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-h3 font-semibold text-navy-900"
        >
          Sindipro<span className="text-navy-700"> SE</span>
        </Link>

        {/* Navegação desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
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
              <ul className="overflow-hidden rounded-card border border-blue-200 bg-surface p-2 shadow-card">
                {sobreLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive(pathname, l.href) ? "page" : undefined}
                      className="block rounded px-3 py-2 text-small text-navy-900 transition-colors hover:bg-blue-100 aria-[current=page]:text-navy-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          <li>
            <TopLink href="/noticias" active={isActive(pathname, "/noticias")}>
              Notícias
            </TopLink>
          </li>
          <li>
            <TopLink href="/arquivos" active={isActive(pathname, "/arquivos")}>
              Arquivos
            </TopLink>
          </li>
        </ul>

        {/* Ações à direita (desktop) */}
        <div className="hidden lg:block">
          <EntrarButton />
        </div>

        {/* Botão hambúrguer (mobile) */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded text-navy-900 lg:hidden"
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
          className="border-t border-blue-200 bg-surface lg:hidden"
        >
          <ul className="mx-auto w-full max-w-container px-6 py-4 sm:px-8">
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
                className={`flex w-full items-center justify-between py-3 text-body font-medium ${
                  sobreIsActive ? "text-navy-700" : "text-navy-900"
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
                  className="mb-2 ml-1 border-l border-blue-200 pl-4"
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

            <li className="mt-4 border-t border-blue-200 pt-4">
              <EntrarButton full />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* ---------- subcomponentes ---------- */

function topLinkClasses(active: boolean) {
  return [
    "inline-flex items-center gap-1 border-b-2 px-3 py-1.5 text-small font-medium",
    "transition-colors",
    active
      ? "border-gold-600 text-navy-700"
      : "border-transparent text-navy-900/80 hover:text-navy-700",
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
      className={`block py-3 font-medium ${sub ? "text-small" : "text-body"} ${
        active ? "text-navy-700" : "text-navy-900"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * Botão "Entrar" — visível mas desabilitado ("em breve"). Sem fluxo de login.
 * TODO (futuro, §6): habilitar e ligar à área do associado.
 */
function EntrarButton({ full = false }: { full?: boolean }) {
  return (
    <button
      type="button"
      disabled
      title="Login do associado — em breve"
      aria-label="Entrar — login do associado, em breve"
      className={`inline-flex h-10 items-center justify-center gap-2 rounded border border-blue-200 px-4 text-small font-medium text-navy-900/55 ${
        full ? "w-full" : ""
      }`}
    >
      Entrar
      <span
        aria-hidden="true"
        className="rounded-sm bg-blue-100 px-1.5 py-0.5 text-eyebrow font-medium uppercase tracking-[0.08em] text-navy-700"
      >
        Em breve
      </span>
    </button>
  );
}
