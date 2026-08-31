import { z } from "zod";

/**
 * Regras de validação dos provedores (CLAUDE.md §16).
 * Usadas nas Server Actions — a validação que vale é a do SERVIDOR; o
 * formulário só reaproveita as mensagens.
 */

/** Deixa só os dígitos (o formulário aceita CNPJ formatado). */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Dígitos verificadores do CNPJ (algoritmo oficial). */
export function isValidCnpj(digits: string): boolean {
  if (digits.length !== 14) return false;
  // Rejeita sequências repetidas (00000000000000, 11111111111111, …), que
  // passam no cálculo mas não são CNPJ válido.
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const checkDigit = (length: number): number => {
    let weight = length - 7;
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * weight;
      weight = weight - 1 < 2 ? 9 : weight - 1;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return (
    checkDigit(12) === Number(digits[12]) && checkDigit(13) === Number(digits[13])
  );
}

/** CNPJ opcional: vazio vira null; preenchido tem que ser válido. */
const cnpjSchema = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : onlyDigits(v)))
  .refine((v) => v === null || isValidCnpj(v), "Informe um CNPJ válido.");

/** Campo de texto opcional: vazio vira null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .transform((v) => (v === "" ? null : v));

export const providerStatusSchema = z.enum(["ativo", "inativo"]);

const providerFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do provedor.")
    .max(120, "Use no máximo 120 caracteres."),
  cnpj: cnpjSchema,
  city: optionalText(80),
  status: providerStatusSchema,
});

export const createProviderSchema = providerFieldsSchema;
export type CreateProviderInput = z.infer<typeof createProviderSchema>;

export const updateProviderSchema = providerFieldsSchema.extend({
  id: z.string().uuid(),
});
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;

export const deleteProviderSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Vínculo associado -> provedor. Nulo é permitido (CLAUDE.md §16): é o
 * estado das linhas que a migração não casou e que a diretoria ainda vai
 * ajustar pelo painel.
 */
export const providerIdSchema = z
  .union([z.string().uuid("Selecione um provedor."), z.literal(""), z.null()])
  .transform((v) => (v === "" || v === null ? null : v));

/** Formata um CNPJ de 14 dígitos para exibição: 00.000.000/0000-00 */
export function formatCnpj(digits: string | null): string | null {
  if (!digits || digits.length !== 14) return digits;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}
