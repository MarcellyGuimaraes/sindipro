"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "@/lib/validation/conta";
import { firstFieldErrors, type ActionResult } from "@/lib/validation/action-result";
import { checkRateLimit, clearRateLimit } from "@/lib/auth/rate-limit";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;

/**
 * O próprio associado (ou diretoria) troca a própria senha — self-service,
 * sem Admin API: updateUser() só atua sobre o usuário da sessão atual, então
 * não há como isso alcançar outra conta. Exige a senha atual (o Supabase
 * não pede isso por padrão em updateUser(), mas sem essa checagem alguém que
 * pegasse a sessão já aberta de outra pessoa — computador destravado, por
 * exemplo — poderia trocar a senha dela sem saber a atual).
 *
 * Rate limit na verificação da senha atual (relatório de segurança, item
 * "Baixa"): sem isso, quem já tivesse uma sessão roubada podia tentar
 * adivinhar a senha atual sem nenhum bloqueio.
 */
export async function updateOwnPassword(input: unknown): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }
  const { currentPassword, newPassword } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, error: "Sessão expirada. Entre novamente." };
  }

  const rateLimitKey = `conta:verify:${user.id}`;
  const rateCheck = await checkRateLimit(rateLimitKey, {
    maxAttempts: MAX_ATTEMPTS,
    windowMinutes: WINDOW_MINUTES,
    lockMinutes: LOCK_MINUTES,
  });
  if (!rateCheck.allowed) {
    const minutes = Math.max(1, Math.ceil((rateCheck.retryAfterSeconds ?? 0) / 60));
    return {
      ok: false,
      error: `Muitas tentativas. Aguarde ${minutes} ${minutes === 1 ? "minuto" : "minutos"} e tente de novo.`,
    };
  }

  // Confirma a senha atual num client à parte, sem cookies — não deve
  // mexer na sessão real desta request, só validar a credencial.
  const verifier = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: { currentPassword: "Senha atual incorreta." },
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return { ok: false, error: "Não foi possível trocar a senha. Tente novamente." };
  }

  await clearRateLimit(rateLimitKey);

  // Invalida as sessões em outros dispositivos/navegadores — mantém só esta.
  await supabase.auth.signOut({ scope: "others" });

  return { ok: true };
}
