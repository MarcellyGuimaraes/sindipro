/**
 * Valida o parâmetro `next` (para onde voltar depois do login em /entrar).
 * Só aceita caminhos internos dentro de /area — qualquer outra coisa (URL
 * absoluta "https://evil.com", protocolo-relativa "//evil.com", ou uma rota
 * fora de /area) é descartada. Sem isso, `next` — controlado por quem monta
 * o link de /entrar — vira um open redirect.
 */
export function safeAreaRedirect(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/area")) return null;
  try {
    const resolved = new URL(next, "http://localhost");
    if (resolved.origin !== "http://localhost") return null;
    return resolved.pathname + resolved.search;
  } catch {
    return null;
  }
}
