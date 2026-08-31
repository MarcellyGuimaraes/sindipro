/**
 * Lógica pura do InactivityGuard (components/auth/InactivityGuard.tsx),
 * separada do componente para poder ser testada sem DOM/React.
 */
export type InactivityAction = "none" | "warn" | "logout";

export type InactivityState = {
  action: InactivityAction;
  /** Segundos restantes até o logout — só definido quando action === "warn". */
  secondsLeft: number | null;
};

/**
 * Decide o que fazer dado quanto tempo (ms) o usuário está inativo.
 * Pura e determinística: mesma entrada, mesma saída — fácil de testar os
 * limiares sem precisar simular timers de verdade.
 */
export function nextInactivityState(
  idleForMs: number,
  timeoutMs: number,
  warningMs: number
): InactivityState {
  if (idleForMs >= timeoutMs) {
    return { action: "logout", secondsLeft: null };
  }
  if (idleForMs >= timeoutMs - warningMs) {
    return { action: "warn", secondsLeft: Math.ceil((timeoutMs - idleForMs) / 1000) };
  }
  return { action: "none", secondsLeft: null };
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
