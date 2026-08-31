/**
 * Iniciais para avatares (área do associado). Usa a primeira e a última
 * palavra do nome — "Natalia Ferreira" -> "NF", "Diretoria Sindipro-SE" ->
 * "DS". Ignora partículas curtas ("de", "da") quando há alternativa.
 */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);

  if (parts.length === 0) return "?";

  const meaningful = parts.filter((p) => p.length > 2);
  const use = meaningful.length >= 2 ? meaningful : parts;

  const first = use[0]?.[0] ?? "";
  const last = use.length > 1 ? (use[use.length - 1]?.[0] ?? "") : "";

  return (first + last).toUpperCase() || "?";
}
