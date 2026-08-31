import { z } from "zod";
import { passwordSchema } from "@/lib/validation/associado";

/** /area/conta — o próprio associado troca a senha. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "A nova senha deve ser diferente da atual.",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * /redefinir-senha — depois de um link de recuperação por e-mail. Sem senha
 * atual: o próprio link já provou posse do e-mail da conta.
 */
export const setNewPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
export type SetNewPasswordInput = z.infer<typeof setNewPasswordSchema>;
