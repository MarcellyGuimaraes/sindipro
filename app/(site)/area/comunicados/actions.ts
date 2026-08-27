"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMemberAccess } from "@/lib/comunicados-access";
import {
  createComentarioSchema,
  comunicadoIdSchema,
  comentarioIdSchema,
} from "@/lib/validation/comunicado";
import { firstFieldErrors, type ActionResult } from "@/lib/validation/action-result";

/**
 * Server Actions do feed, lado do ASSOCIADO (CLAUDE.md §16).
 *
 * REGRA CRÍTICA: nenhuma destas funções aceita `user_id` do client. O id de
 * quem age vem SEMPRE de getMemberAccess() — sessão validada no servidor.
 * Assim não existe payload capaz de curtir ou comentar em nome de outro,
 * mesmo que alguém chame a action direto; a RLS (user_id = auth.uid()) é a
 * segunda tranca.
 *
 * getMemberAccess() já confere sessão + papel + perfil ativo: associado
 * inativado perde o direito de escrever aqui na mesma hora.
 */

const NO_ACCESS: ActionResult = {
  ok: false,
  error: "Sua sessão expirou ou seu acesso foi desativado. Entre novamente.",
};

const FEED_PATH = "/area/comunicados";

/** Curte ou descurte — o botão é um alternador só. */
export async function toggleLike(input: unknown): Promise<ActionResult> {
  const access = await getMemberAccess();
  if (!access) return NO_ACCESS;

  const parsed = comunicadoIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Comunicado inválido." };
  const { comunicadoId } = parsed.data;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("comunicado_likes")
    .select("id")
    .eq("comunicado_id", comunicadoId)
    .eq("user_id", access.userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("comunicado_likes")
      .delete()
      .eq("id", existing.id);
    if (error) return { ok: false, error: "Não foi possível descurtir. Tente novamente." };
  } else {
    const { error } = await supabase
      .from("comunicado_likes")
      .insert({ comunicado_id: comunicadoId, user_id: access.userId });
    // 23505 = corrida entre dois cliques; o UNIQUE fez o trabalho dele e o
    // estado final (curtido) é o desejado — não é erro para a pessoa.
    if (error && error.code !== "23505") {
      return { ok: false, error: "Não foi possível curtir. Tente novamente." };
    }
  }

  revalidatePath(FEED_PATH);
  return { ok: true };
}

/** Publica um comentário no mural compartilhado. */
export async function addComentario(input: unknown): Promise<ActionResult> {
  const access = await getMemberAccess();
  if (!access) return NO_ACCESS;

  const parsed = createComentarioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }
  const { comunicadoId, body } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("comunicado_comments").insert({
    comunicado_id: comunicadoId,
    user_id: access.userId,
    body,
  });

  if (error) {
    return { ok: false, error: "Não foi possível publicar o comentário. Tente novamente." };
  }

  revalidatePath(FEED_PATH);
  return { ok: true };
}

/**
 * Apaga o PRÓPRIO comentário. O `.eq("user_id", ...)` é redundante com a
 * RLS de propósito: se um dia a policy for afrouxada por engano, esta
 * consulta continua alcançando só o que é de quem pediu.
 */
export async function deleteOwnComentario(input: unknown): Promise<ActionResult> {
  const access = await getMemberAccess();
  if (!access) return NO_ACCESS;

  const parsed = comentarioIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Comentário inválido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("comunicado_comments")
    .delete()
    .eq("id", parsed.data.comentarioId)
    .eq("user_id", access.userId);

  if (error) {
    return { ok: false, error: "Não foi possível apagar o comentário. Tente novamente." };
  }

  revalidatePath(FEED_PATH);
  return { ok: true };
}
