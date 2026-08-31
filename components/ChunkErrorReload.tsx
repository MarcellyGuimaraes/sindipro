"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "sindipro:chunk-error-reload-at";
const RELOAD_COOLDOWN_MS = 10_000;

function isChunkLoadError(reason: unknown): boolean {
  if (!reason) return false;
  const name = reason instanceof Error ? reason.name : "";
  const message = reason instanceof Error ? reason.message : String(reason);
  return name === "ChunkLoadError" || /Loading chunk [\w./-]+ failed/i.test(message);
}

/**
 * "ChunkLoadError: Loading chunk ... failed" acontece quando o navegador
 * pede um arquivo JS que não existe mais no build atual — o Next nomeia os
 * chunks por hash do conteúdo, então isso surge depois de um deploy novo
 * (aba aberta desde antes) ou, em dev, depois de várias recompilações a
 * quente na mesma sessão do `next dev`. Em vez de deixar a navegação
 * travada numa tela em branco, recarrega a página sozinho assim que
 * detecta o erro — um F5 resolve, porque busca o build atual.
 *
 * Cooldown via sessionStorage evita loop: se o erro persistir logo depois
 * de um reload (problema de verdade, não só staleness), para de tentar e
 * deixa o overlay de erro normal aparecer.
 */
export function ChunkErrorReload() {
  useEffect(() => {
    function tryReload() {
      const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0);
      if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
      sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
      window.location.reload();
    }

    function handleRejection(event: PromiseRejectionEvent) {
      if (isChunkLoadError(event.reason)) tryReload();
    }

    function handleError(event: ErrorEvent) {
      if (isChunkLoadError(event.error)) tryReload();
    }

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
