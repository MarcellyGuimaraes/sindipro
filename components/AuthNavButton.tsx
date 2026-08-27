"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, KeyRound, LogOut, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/initials";
import type { AppRole } from "@/lib/auth/role";

/** Dados mínimos do usuário logado para o menu de perfil da navbar. */
export type NavUser = {
  name: string;
  email: string;
  company: string | null;
};

const pillCls =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 font-inter text-sm font-medium transition";

/**
 * Botão "Entrar" (deslogado) ou menu de perfil (logado) da navbar pública.
 *
 * Deslogado: link para /entrar. Logado (associado OU diretoria): avatar de
 * iniciais + primeiro nome + dropdown com "Mudar senha" (/area/conta) e "Sair".
 * NÃO há sino de notificações nem foto de perfil (CLAUDE.md §15: o menu é
 * enxuto). "Mudar senha" leva à conta; o painel nunca é linkado aqui (§14).
 */
export function AuthNavButton({
  role,
  user,
  full = false,
}: {
  role: AppRole | null;
  user?: NavUser | null;
  full?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (!role) {
    return (
      <Link
        href="/entrar"
        className={`${pillCls} bg-black/5 text-black hover:bg-black/10 ${full ? "w-full" : ""}`}
      >
        Entrar
      </Link>
    );
  }

  const name = user?.name ?? "Conta";
  const firstName = name.split(" ")[0] || name;

  // No mobile o menu vira uma lista empilhada (não há espaço/hover para um
  // dropdown flutuante).
  if (full) {
    return (
      <div className="w-full font-inter">
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-black">{name}</p>
            {user?.email && (
              <p className="truncate text-xs text-black/50">{user.email}</p>
            )}
          </div>
        </div>
        {user?.company && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-black/50">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">{user.company}</span>
          </p>
        )}
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href="/area/conta"
            className={`${pillCls} w-full bg-black/5 text-black hover:bg-black/10`}
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Mudar senha
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className={`${pillCls} w-full bg-brand text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {loading ? "Saindo…" : "Sair"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProfileDropdown
      name={name}
      firstName={firstName}
      email={user?.email ?? ""}
      company={user?.company ?? null}
      loading={loading}
      onLogout={handleLogout}
    />
  );
}

function ProfileDropdown({
  name,
  firstName,
  email,
  company,
  loading,
  onLogout,
}: {
  name: string;
  firstName: string;
  email: string;
  company: string | null;
  loading: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          close();
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="menu-perfil"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-black/5 pl-1.5 pr-3 font-inter text-sm font-medium text-black transition hover:bg-black/10"
      >
        <Avatar name={name} size="sm" />
        <span className="max-w-[8rem] truncate">{firstName}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div
        id="menu-perfil"
        hidden={!open}
        className="absolute right-0 top-full min-w-[17rem] pt-2"
      >
        <div className="overflow-hidden rounded-[20px] bg-white p-2 font-inter shadow-card">
          <div className="px-3 pb-3 pt-2">
            <p className="truncate text-sm font-semibold text-black">{name}</p>
            {email && (
              <p className="mt-1.5 flex items-center gap-2 text-xs text-black/55">
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{email}</span>
              </p>
            )}
            {company && (
              <p className="mt-1 flex items-center gap-2 text-xs text-black/55">
                <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{company}</span>
              </p>
            )}
          </div>

          <div className="border-t border-black/5 pt-1">
            <Link
              href="/area/conta"
              className="flex items-center gap-2.5 rounded-full px-3 py-2 text-sm text-black transition hover:bg-black/5"
            >
              <KeyRound className="h-4 w-4 text-black/55" aria-hidden="true" />
              Mudar senha
            </Link>
            <button
              type="button"
              onClick={onLogout}
              disabled={loading}
              className="flex w-full items-center gap-2.5 rounded-full px-3 py-2 text-left text-sm font-medium text-brand transition hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {loading ? "Saindo…" : "Sair"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-brand font-semibold text-white ${cls}`}
    >
      {initials(name)}
    </span>
  );
}
