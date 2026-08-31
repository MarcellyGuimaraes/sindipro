/**
 * Garante uma duração mínima pra `fn`, completando com espera quando ela
 * termina mais rápido. Usado no login/recuperação de senha pra apagar o
 * side-channel de tempo que permite descobrir se um e-mail existe (uma
 * conta existente demora mensuravelmente mais que uma inexistente, porque
 * só faz a comparação de senha quando o usuário existe — ver relatório de
 * segurança, item "Média": enumeração por tempo de resposta).
 */
export async function withMinDuration<T>(minMs: number, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const elapsed = Date.now() - start;
  if (elapsed < minMs) {
    await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
  }
  return result;
}
