"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { clientIp } from "@/lib/auth/client-ip";
import { withMinDuration } from "@/lib/auth/timing";

/**
 * "Esqueci minha senha" — antes chamava resetPasswordForEmail direto do
 * client (EntrarForm.tsx). Movido pra cá pra ter rate limit próprio
 * (relatório de segurança, item "Média"): sem isso, a única proteção
 * contra spam era a cota de e-mail do próprio projeto Supabase — global,
 * não por conta/IP, e esgotável por qualquer um mandando o mesmo e-mail
 * repetidas vezes (derruba a recuperação de senha pra todo mundo).
 *
 * SEMPRE retorna ok:true com a mesma resposta, dê certo ou não — inclusive
 * quando bloqueado pelo rate limit. Diferenciar "bloqueado" de "e-mail não
 * existe" também seria um jeito de descobrir quem tem conta.
 */

const MAX_ATTEMPTS_PER_EMAIL = 3;
const MAX_ATTEMPTS_PER_IP = 12;
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;
const MIN_DURATION_MS = 300;

export async function requestPasswordReset(input: {
  email: string;
  redirectTo: string;
}): Promise<{ ok: true }> {
  return withMinDuration(MIN_DURATION_MS, async () => {
    const email = input.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return { ok: true };
    }

    const ip = clientIp();
    const [emailCheck, ipCheck] = await Promise.all([
      checkRateLimit(`reset:email:${email}`, {
        maxAttempts: MAX_ATTEMPTS_PER_EMAIL,
        windowMinutes: WINDOW_MINUTES,
        lockMinutes: LOCK_MINUTES,
      }),
      checkRateLimit(`reset:ip:${ip}`, {
        maxAttempts: MAX_ATTEMPTS_PER_IP,
        windowMinutes: WINDOW_MINUTES,
        lockMinutes: LOCK_MINUTES,
      }),
    ]);

    if (emailCheck.allowed && ipCheck.allowed) {
      const supabase = await createClient();
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: input.redirectTo });
    }

    return { ok: true };
  });
}
