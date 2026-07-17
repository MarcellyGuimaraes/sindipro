import { z } from "zod";

/**
 * Regras de validação da gestão de associados (CLAUDE.md §15).
 * "Senha forte mínima": 10+ caracteres, ao menos 1 minúscula, 1 maiúscula
 * e 1 número.
 */

export const passwordSchema = z
  .string()
  .min(10, "A senha deve ter pelo menos 10 caracteres.")
  .regex(/[a-z]/, "A senha deve ter ao menos uma letra minúscula.")
  .regex(/[A-Z]/, "A senha deve ter ao menos uma letra maiúscula.")
  .regex(/[0-9]/, "A senha deve ter ao menos um número.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Informe um e-mail válido.");

export const createAssociadoSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo."),
  company: z.string().trim().min(2, "Informe o provedor."),
  email: emailSchema,
  password: passwordSchema,
});
export type CreateAssociadoInput = z.infer<typeof createAssociadoSchema>;

export const updatePasswordSchema = z.object({
  userId: z.string().uuid(),
  password: passwordSchema,
});
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export const setStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["ativo", "inativo"]),
});
export type SetStatusInput = z.infer<typeof setStatusSchema>;

export const deleteAssociadoSchema = z.object({
  userId: z.string().uuid(),
});
export type DeleteAssociadoInput = z.infer<typeof deleteAssociadoSchema>;
