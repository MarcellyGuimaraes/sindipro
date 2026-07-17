import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitResult = { allowed: boolean; retryAfterSeconds?: number };

export type RateLimitOptions = {
  /** Quantas tentativas permite dentro da janela antes de bloquear. */
  maxAttempts: number;
  /** Duração da janela de contagem (reinicia se a última tentativa for mais antiga que isso). */
  windowMinutes: number;
  /** Por quanto tempo fica bloqueado depois de estourar o limite. */
  lockMinutes: number;
};

/**
 * Contador de janela fixa em Postgres (tabela login_rate_limits — migration
 * 0008), só acessível via service role. Cada chamada registra uma
 * tentativa; ao passar de `maxAttempts` dentro de `windowMinutes`, bloqueia
 * por `lockMinutes`.
 *
 * Falha aberta (allowed: true) se a tabela/consulta der erro — por exemplo,
 * antes da migration 0008 rodar. Preferível a derrubar o login inteiro por
 * causa de um problema de infra; o pior caso vira "sem rate limit ainda",
 * não "ninguém consegue entrar".
 */
export async function checkRateLimit(
  key: string,
  { maxAttempts, windowMinutes, lockMinutes }: RateLimitOptions
): Promise<RateLimitResult> {
  try {
    const admin = createAdminClient();
    const now = new Date();

    const { data: row, error: selectError } = await admin
      .from("login_rate_limits")
      .select("attempts, first_attempt_at, locked_until")
      .eq("key", key)
      .maybeSingle();

    if (selectError) throw selectError;

    if (row?.locked_until && new Date(row.locked_until) > now) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((new Date(row.locked_until).getTime() - now.getTime()) / 1000),
      };
    }

    const windowStart = row?.first_attempt_at ? new Date(row.first_attempt_at) : now;
    const withinWindow = Boolean(row) && now.getTime() - windowStart.getTime() < windowMinutes * 60_000;

    const nextAttempts = withinWindow ? row!.attempts + 1 : 1;
    const nextFirstAttempt = withinWindow ? windowStart.toISOString() : now.toISOString();
    const lockedUntil =
      nextAttempts > maxAttempts ? new Date(now.getTime() + lockMinutes * 60_000).toISOString() : null;

    const { error: upsertError } = await admin.from("login_rate_limits").upsert({
      key,
      attempts: nextAttempts,
      first_attempt_at: nextFirstAttempt,
      locked_until: lockedUntil,
    });
    if (upsertError) throw upsertError;

    if (lockedUntil) {
      return { allowed: false, retryAfterSeconds: lockMinutes * 60 };
    }
    return { allowed: true };
  } catch (err) {
    console.error("checkRateLimit falhou, liberando por padrão (fail open):", err);
    return { allowed: true };
  }
}

/** Zera o contador — chamar em caso de sucesso, pra não punir quem acertou. */
export async function clearRateLimit(key: string): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("login_rate_limits").delete().eq("key", key);
  } catch (err) {
    console.error("clearRateLimit falhou (não crítico):", err);
  }
}
