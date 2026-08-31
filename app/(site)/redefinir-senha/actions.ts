"use server";

import { createClient } from "@/lib/supabase/server";
import { setNewPasswordSchema } from "@/lib/validation/conta";
import { firstFieldErrors, type ActionResult } from "@/lib/validation/action-result";

/**
 * Define a nova senha depois de um link de recuperação por e-mail. A sessão
 * já existe quando esta action roda — app/auth/callback/route.ts trocou o
 * "code" do link pela sessão (nos cookies) antes de chegar aqui. Não pede a
 * senha atual: o próprio link, entregue no e-mail da conta, já prova posse.
 */
export async function setNewPasswordAfterRecovery(input: unknown): Promise<ActionResult> {
  const parsed = setNewPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Link inválido ou expirado. Peça um novo em \"Esqueci minha senha\"." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) {
    return { ok: false, error: "Não foi possível trocar a senha. Tente novamente." };
  }

  // Essa mesma troca já derruba a sessão de recuperação de outros lugares
  // onde o link possa ter sido aberto.
  await supabase.auth.signOut({ scope: "others" });

  return { ok: true };
}
