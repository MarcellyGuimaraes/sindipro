"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPassword } from "@/lib/auth/login-action";
import { requestPasswordReset } from "@/app/(site)/entrar/actions";

const inputCls =
  "h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-base text-black outline-none transition placeholder:text-black/40 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30";

const GENERIC_RECOVERY_MESSAGE =
  "Se esse e-mail tiver uma conta com a gente, enviamos um link para redefinir a senha. Confira também a caixa de spam.";

/**
 * Login do associado (Client Component). `next` já vem validado do server
 * (app/(site)/entrar/page.tsx, via safeAreaRedirect) — só usamos aqui.
 *
 * Login e recuperação de senha rodam em Server Actions (lib/auth/login-action.ts,
 * app/(site)/entrar/actions.ts), não mais direto do client — é lá que vive o
 * rate limit contra força bruta/spam e a normalização de tempo de resposta
 * (ver docs/seguranca-login-rate-limit.md).
 *
 * Mensagens de erro genéricas: nunca revelam se o e-mail existe. A única
 * exceção é a conta banida (associado inativo) — como isso só aparece com a
 * senha CORRETA, não é um vetor de enumeração, e ajuda quem legitimamente
 * perdeu o acesso a entender o motivo.
 *
 * "Esqueci minha senha" troca pro modo de recuperação por e-mail — a
 * mensagem de resultado é SEMPRE a mesma, exista ou não conta com esse
 * e-mail (ou até se o rate limit bloquear o envio), pra não virar um jeito
 * de descobrir quem é associado.
 */
export function EntrarForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginWithPassword({ email, password });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const destino =
      next ??
      (result.role === "diretoria" ? "/painel-diretoria" : result.role === "associado" ? "/area" : "/");

    router.replace(destino);
    router.refresh();
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryError(null);

    if (!/^\S+@\S+\.\S+$/.test(recoveryEmail.trim())) {
      setRecoveryError("Informe um e-mail válido.");
      return;
    }

    setRecoveryLoading(true);
    await requestPasswordReset({
      email: recoveryEmail.trim(),
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });
    // Sempre a mesma mensagem, dê certo ou não — ver comentário no topo.
    setRecoveryLoading(false);
    setRecoverySent(true);
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={handleForgotSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="recoveryEmail"
            className="mb-1.5 block text-sm font-medium text-black"
          >
            E-mail
          </label>
          <input
            id="recoveryEmail"
            type="email"
            autoComplete="email"
            required
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        {recoveryError && (
          <p
            role="alert"
            className="rounded-xl bg-brand/5 px-3 py-2 text-sm font-medium text-black ring-1 ring-brand/20"
          >
            {recoveryError}
          </p>
        )}

        {recoverySent && (
          <p
            role="status"
            className="rounded-xl bg-brand/5 px-3 py-2 text-sm font-medium text-black ring-1 ring-brand/20"
          >
            {GENERIC_RECOVERY_MESSAGE}
          </p>
        )}

        <button
          type="submit"
          disabled={recoveryLoading}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          {recoveryLoading ? "Enviando…" : "Enviar link de recuperação"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("login");
            setRecoverySent(false);
            setRecoveryError(null);
          }}
          className="w-full text-center text-sm font-medium text-black/60 transition hover:text-brand"
        >
          Voltar para o login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-black">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-black">
            Senha
          </label>
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="text-sm font-medium text-brand hover:underline"
          >
            Esqueci minha senha
          </button>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-brand/5 px-3 py-2 text-sm font-medium text-black ring-1 ring-brand/20"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
