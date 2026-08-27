"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDirectorSession } from "@/lib/auth/role";
import {
  createComunicadoSchema,
  updateComunicadoSchema,
  comunicadoIdSchema,
  comentarioIdSchema,
  comunicadoStatusSchema,
} from "@/lib/validation/comunicado";
import { firstFieldErrors, type ActionResult } from "@/lib/validation/action-result";
import { z } from "zod";

/**
 * Server Actions do feed de comunicados no painel (CLAUDE.md §16).
 *
 * REGRA: cada ação revalida "papel == diretoria" no PRIMEIRO comando. Uma
 * Server Action é um endpoint próprio — chamável direto, sem passar pela
 * página — então o bloqueio do layout do painel não a protege. A RLS da
 * migration 0010 é a segunda tranca; nenhuma das duas é dispensável.
 */

const ACCESS_DENIED: ActionResult = {
  ok: false,
  error: "Acesso restrito à diretoria.",
};

const BUCKET = "comunicado-images";

/** Marca a data de publicação na transição rascunho -> publicado. */
function resolvePublishedAt(
  status: "rascunho" | "publicado",
  current: string | null
): string | null {
  if (status !== "publicado") return null;
  return current ?? new Date().toISOString();
}

/**
 * Apaga um objeto do bucket privado. Usa o client de SESSÃO (não o admin):
 * a policy de delete do Storage exige is_director(), então a própria RLS
 * confere o papel de novo — não há motivo para a chave secreta aqui.
 *
 * Falha de storage não derruba a operação principal: o pior caso é um
 * objeto órfão no bucket, não um comunicado num estado inconsistente.
 */
async function removeImage(path: string | null): Promise<void> {
  if (!path) return;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    // Sem dado pessoal e sem URL assinada no log (§15) — só o caminho.
    console.error(`[comunicados] imagem órfã no bucket: ${path}`);
  }
}

export async function createComunicado(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = createComunicadoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }
  const { title, body, imagePath, status } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("comunicados").insert({
    title,
    body,
    image_path: imagePath,
    status,
    published_at: resolvePublishedAt(status, null),
    author_id: user?.id ?? null,
  });

  if (error) {
    return { ok: false, error: "Não foi possível salvar o comunicado. Tente novamente." };
  }

  revalidatePath("/painel-diretoria/comunicados");
  revalidatePath("/area/comunicados");
  return { ok: true };
}

export async function updateComunicado(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = updateComunicadoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos.",
      fieldErrors: firstFieldErrors(parsed.error.issues),
    };
  }
  const { id, title, body, imagePath, status } = parsed.data;

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("comunicados")
    .select("image_path, published_at")
    .eq("id", id)
    .maybeSingle();

  if (readError || !current) {
    return { ok: false, error: "Comunicado não encontrado." };
  }

  const { error } = await supabase
    .from("comunicados")
    .update({
      title,
      body,
      image_path: imagePath,
      status,
      published_at: resolvePublishedAt(status, current.published_at),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Não foi possível salvar o comunicado. Tente novamente." };
  }

  // Trocou (ou removeu) a imagem: a antiga não serve mais a ninguém.
  if (current.image_path && current.image_path !== imagePath) {
    await removeImage(current.image_path);
  }

  revalidatePath("/painel-diretoria/comunicados");
  revalidatePath("/area/comunicados");
  return { ok: true };
}

/**
 * Publicar / despublicar — a moderação rápida do §16, sem passar pelo
 * formulário inteiro. Despublicar tira o post do feed do associado na hora
 * (a RLS de SELECT só entrega 'publicado' para associado).
 */
export async function setComunicadoStatus(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = z
    .object({ id: z.string().uuid(), status: comunicadoStatusSchema })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Comunicado inválido." };
  }
  const { id, status } = parsed.data;

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("comunicados")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("comunicados")
    .update({
      status,
      published_at: resolvePublishedAt(status, current?.published_at ?? null),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Não foi possível atualizar o status. Tente novamente." };
  }

  revalidatePath("/painel-diretoria/comunicados");
  revalidatePath("/area/comunicados");
  return { ok: true };
}

export async function deleteComunicado(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = comunicadoIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Comunicado inválido." };

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("comunicados")
    .select("image_path")
    .eq("id", parsed.data.comunicadoId)
    .maybeSingle();

  // As curtidas e os comentários somem junto por ON DELETE CASCADE
  // (migration 0010) — não é preciso apagá-los antes.
  const { error } = await supabase
    .from("comunicados")
    .delete()
    .eq("id", parsed.data.comunicadoId);

  if (error) {
    return { ok: false, error: "Não foi possível excluir o comunicado. Tente novamente." };
  }

  await removeImage(current?.image_path ?? null);

  revalidatePath("/painel-diretoria/comunicados");
  revalidatePath("/area/comunicados");
  return { ok: true };
}

/**
 * Moderação: a diretoria apaga QUALQUER comentário (§16). A policy de
 * delete de comunicado_comments aceita "autor OU diretoria" — aqui o
 * caminho é sempre o segundo, já confirmado no topo desta função.
 */
export async function deleteComentario(input: unknown): Promise<ActionResult> {
  if (!(await isDirectorSession())) return ACCESS_DENIED;

  const parsed = comentarioIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Comentário inválido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("comunicado_comments")
    .delete()
    .eq("id", parsed.data.comentarioId);

  if (error) {
    return { ok: false, error: "Não foi possível apagar o comentário. Tente novamente." };
  }

  revalidatePath("/painel-diretoria/comunicados");
  revalidatePath("/area/comunicados");
  return { ok: true };
}
