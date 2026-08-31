import { z } from "zod";

/**
 * Regras de validação do feed de comunicados (CLAUDE.md §16).
 *
 * Os limites são os MESMOS das constraints CHECK da migration 0010 — se
 * mudar um, mude o outro. O banco é quem garante; isto aqui é para o erro
 * chegar como mensagem de campo em vez de estouro de constraint.
 */

export const COMUNICADO_TITLE_MAX = 200;
export const COMUNICADO_BODY_MAX = 10_000;
export const COMENTARIO_BODY_MAX = 1_500;

export const comunicadoStatusSchema = z.enum(["rascunho", "publicado"]);

/** Título é opcional (§16): vazio vira null. */
const titleSchema = z
  .string()
  .trim()
  .max(COMUNICADO_TITLE_MAX, `Use no máximo ${COMUNICADO_TITLE_MAX} caracteres.`)
  .transform((v) => (v === "" ? null : v));

const bodySchema = z
  .string()
  .trim()
  .min(1, "Escreva o texto do comunicado.")
  .max(COMUNICADO_BODY_MAX, `Use no máximo ${COMUNICADO_BODY_MAX} caracteres.`);

/**
 * Caminho da imagem no bucket privado. Formato fixo `<uuid>.<ext>` gerado
 * pelo servidor — nunca o nome original do arquivo, e sem "/" nem ".." para
 * que um caminho forjado não alcance outro objeto do bucket.
 */
const imagePathSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/i,
    "Caminho de imagem inválido."
  )
  .nullable()
  .optional()
  .transform((v) => v ?? null);

export const createComunicadoSchema = z.object({
  title: titleSchema,
  body: bodySchema,
  imagePath: imagePathSchema,
  status: comunicadoStatusSchema,
});
export type CreateComunicadoInput = z.infer<typeof createComunicadoSchema>;

export const updateComunicadoSchema = createComunicadoSchema.extend({
  id: z.string().uuid(),
});
export type UpdateComunicadoInput = z.infer<typeof updateComunicadoSchema>;

export const comunicadoIdSchema = z.object({
  comunicadoId: z.string().uuid(),
});

/**
 * Comentário. `body` é TEXTO PURO — não há markdown nem HTML aqui, e a
 * tela renderiza como texto. É isso, somado ao escape do React, que fecha
 * o XSS por comentário (§16).
 */
export const createComentarioSchema = z.object({
  comunicadoId: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(1, "Escreva um comentário.")
    .max(COMENTARIO_BODY_MAX, `Use no máximo ${COMENTARIO_BODY_MAX} caracteres.`),
});
export type CreateComentarioInput = z.infer<typeof createComentarioSchema>;

export const comentarioIdSchema = z.object({
  comentarioId: z.string().uuid(),
});
