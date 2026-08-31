/**
 * Config do logout automático por inatividade nas áreas autenticadas
 * (associado em /area, diretoria em /painel-diretoria). Usado pelo
 * InactivityGuard (components/auth/InactivityGuard.tsx).
 *
 * PARA AJUSTAR O TEMPO: mude só estas duas constantes.
 */

/** Minutos sem interação (mouse/teclado/toque/scroll) até o logout automático. */
export const INACTIVITY_TIMEOUT_MINUTES = 60;

/**
 * Quantos segundos antes do timeout o aviso "sua sessão vai expirar" aparece,
 * dando a chance de continuar conectado antes do logout de fato.
 */
export const INACTIVITY_WARNING_SECONDS = 60;
