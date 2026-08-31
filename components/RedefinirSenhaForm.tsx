"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { setNewPasswordAfterRecovery } from "@/app/(site)/redefinir-senha/actions";

const inputCls =
  "h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-base text-black outline-none transition placeholder:text-black/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30";

type Status = "checking" | "ready" | "invalid" | "done";

/**
 * O link de recuperação do Supabase pode chegar de duas formas:
 * 1) "?code=..." (PKCE) — trocado pela sessão no SERVIDOR, em
 *    app/auth/callback/route.ts, antes desta página carregar.
 * 2) "#access_token=...&type=recovery" (fluxo implícito) — a fragment
 *    (depois do #) NUNCA chega ao servidor, só o browser a vê.
 *
 * @supabase/ssr força flowType "pkce" no client do navegador (não dá pra
 * mudar), e a detecção automática (detectSessionInUrl) só entende "?code=" —
 * NÃO processa "#access_token=" sozinha, mesmo com detectSessionInUrl
 * ligado. Por isso o caso (2) é tratado manualmente aqui: lê a hash e chama
 * setSession() explicitamente. Sem isso, um link nesse formato nunca vira
 * sessão, mesmo sendo um link válido.
 */
export function RedefinirSenhaForm() {
  const [status, setStatus] = useState<Status>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    function markReady() {
      if (settled) return;
      settled = true;
      setStatus("ready");
    }

    async function trySessionFromHash() {
      const hash = window.location.hash;
      if (!hash.includes("access_token")) return;
      const params = new URLSearchParams(hash.slice(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (!access_token || !refresh_token) return;

      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (!error && data.session) {
        // Tira os tokens da URL/histórico assim que viram sessão.
        window.history.replaceState(null, "", window.location.pathname);
        markReady();
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });

    trySessionFromHash();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) markReady();
    });

    const timeout = setTimeout(() => {
      if (!settled) setStatus("invalid");
    }, 2500);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const result = await setNewPasswordAfterRecovery({ newPassword, confirmPassword });

    if (!result.ok) {
      setErrors(result.fieldErrors ?? { form: result.error });
      setSaving(false);
      return;
    }

    setSaving(false);
    setStatus("done");
  }

  if (status === "checking") {
    return <p className="text-center text-sm text-black/50">Verificando o link…</p>;
  }

  if (status === "invalid") {
    return (
      <div className="text-center">
        <p className="text-sm text-black/60">
          Esse link é inválido ou já expirou. Peça um novo em &quot;Esqueci minha
          senha&quot;, na tela de login.
        </p>
        <Link
          href="/entrar"
          className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="text-center">
        <p className="text-sm font-medium text-black">Senha redefinida com sucesso.</p>
        <Link
          href="/area"
          className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
        >
          Ir para a área do associado →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-black">
          Nova senha
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputCls}
        />
        {errors.newPassword ? (
          <ErrorText>{errors.newPassword}</ErrorText>
        ) : (
          <p className="mt-1 text-sm text-black/50">
            Mínimo 10 caracteres, com maiúscula, minúscula e número.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-sm font-medium text-black"
        >
          Confirmar nova senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputCls}
        />
        {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
      </div>

      {errors.form && <ErrorText>{errors.form}</ErrorText>}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Salvando…" : "Redefinir senha"}
      </button>
    </form>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1 border-l-2 border-brand pl-2 text-sm font-medium text-black">
      {children}
    </p>
  );
}
