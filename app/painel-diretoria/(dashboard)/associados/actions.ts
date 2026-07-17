"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDirectorSession } from "@/lib/auth/role";
import {
  createAssociadoSchema,
  updatePasswordSchema,
  setStatusSchema,
  deleteAssociadoSchema,
} from "@/lib/validation/associado";
import { firstFieldErrors, type ActionResult } from "@/lib/validation/action-result";

/**
 * Server Actions da gestão de associados (CLAUDE.md §15).
 *
 * REGRA: toda ação aqui mexe em auth.users via Admin API (chave secreta) —
 * por isso só pode rodar no servidor. E toda ação revalida "papel ==
 * diretoria" no início, mesmo que o layout do painel já bloqueie a rota:
 * uma Server Action é um endpoint próprio, chamável independente da página
 * ter sido renderizada, então a checagem de layout sozinha não a protege.
 */

const ACCESS_DENIED: ActionResult = {
  ok: false,
  error: "Acesso restrito à diretoria.",
};

export async function createAssociado(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = createAssociadoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }
  const { fullName, company, email, password } = parsed.data;

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "associado" },
  });

  if (createError || !created.user) {
    const msg = createError?.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return {
        ok: false,
        error: "Verifique os campos.",
        fieldErrors: { email: "Já existe uma conta com esse e-mail." },
      };
    }
    return { ok: false, error: "Não foi possível criar o acesso. Tente novamente." };
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    full_name: fullName,
    company,
    email,
    status: "ativo",
  });

  if (profileError) {
    // Sem perfil, a conta de auth fica órfã — desfaz para não deixar lixo.
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: "Não foi possível salvar o perfil. Tente novamente." };
  }

  revalidatePath("/painel-diretoria/associados");
  return { ok: true };
}

export async function updateAssociadoPassword(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(parsed.data.userId, {
    password: parsed.data.password,
  });

  if (error) return { ok: false, error: "Não foi possível trocar a senha. Tente novamente." };

  revalidatePath("/painel-diretoria/associados");
  return { ok: true };
}

export async function setAssociadoStatus(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = setStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }
  const { userId, status } = parsed.data;

  // Inativo perde acesso de fato: bane a conta no Auth (não só uma flag
  // para uma tela futura checar). Ativar remove o ban.
  const admin = createAdminClient();
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: status === "inativo" ? "876000h" : "none",
  });
  if (banError) return { ok: false, error: "Não foi possível atualizar o acesso. Tente novamente." };

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);

  if (profileError) return { ok: false, error: "Não foi possível atualizar o status. Tente novamente." };

  revalidatePath("/painel-diretoria/associados");
  return { ok: true };
}

export async function deleteAssociado(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = deleteAssociadoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }

  const admin = createAdminClient();
  // profiles.id referencia auth.users(id) on delete cascade — a linha do
  // perfil some junto, sem precisar de um segundo delete.
  const { error } = await admin.auth.admin.deleteUser(parsed.data.userId);
  if (error) return { ok: false, error: "Não foi possível excluir. Tente novamente." };

  revalidatePath("/painel-diretoria/associados");
  return { ok: true };
}
