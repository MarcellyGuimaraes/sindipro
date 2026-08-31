"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clearRateLimit } from "@/lib/auth/rate-limit";
import { clientIp } from "@/lib/auth/client-ip";
import { withMinDuration } from "@/lib/auth/timing";
import type { AppRole } from "@/lib/auth/role";

/**
 * Login compartilhado por /entrar (associado/diretoria) e
 * /painel-diretoria/login — antes cada formulário chamava
 * supabase.auth.signInWithPassword() direto do client; movido para cá por
 * dois motivos (relatório de segurança):
 * 1) "Alta" — sem essa mudança não existe nenhum lugar no nosso código pra
 *    aplicar rate limit; o client não é um lugar confiável pra isso.
 * 2) "Média" — dá pra normalizar o tempo de resposta aqui (withMinDuration),
 *    o que era impossível de fazer com a chamada direta do client.
 *
 * Limite por e-mail (mais apertado, é o alvo direto de força bruta) E por
 * IP (mais largo, pega quem testa muitos e-mails do mesmo lugar).
 */

const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP = 20;
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;
const MIN_DURATION_MS = 300;

export type LoginResult =
  | { ok: true; role: AppRole | null }
  | { ok: false; error: string };

export async function loginWithPassword(input: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  return withMinDuration(MIN_DURATION_MS, async () => {
    const email = input.email.trim().toLowerCase();
    const ip = clientIp();
    const emailKey = `login:email:${email}`;
    const ipKey = `login:ip:${ip}`;

    const [emailCheck, ipCheck] = await Promise.all([
      checkRateLimit(emailKey, {
        maxAttempts: MAX_ATTEMPTS_PER_EMAIL,
        windowMinutes: WINDOW_MINUTES,
        lockMinutes: LOCK_MINUTES,
      }),
      checkRateLimit(ipKey, {
        maxAttempts: MAX_ATTEMPTS_PER_IP,
        windowMinutes: WINDOW_MINUTES,
        lockMinutes: LOCK_MINUTES,
      }),
    ]);

    if (!emailCheck.allowed || !ipCheck.allowed) {
      const retryAfterSeconds = Math.max(
        emailCheck.retryAfterSeconds ?? 0,
        ipCheck.retryAfterSeconds ?? 0
      );
      const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
      return {
        ok: false,
        error: `Muitas tentativas. Aguarde ${minutes} ${minutes === 1 ? "minuto" : "minutos"} e tente de novo.`,
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });

    if (error || !data.user) {
      return {
        ok: false,
        error: error?.message.toLowerCase().includes("banned")
          ? "Sua conta está inativa. Fale com a diretoria do sindicato para reativar o acesso."
          : "E-mail ou senha inválidos.",
      };
    }

    // Login certo: zera os dois contadores, não pune quem acertou.
    await Promise.all([clearRateLimit(emailKey), clearRateLimit(ipKey)]);

    const role = data.user.app_metadata?.role;
    return { ok: true, role: role === "diretoria" || role === "associado" ? role : null };
  });
}
