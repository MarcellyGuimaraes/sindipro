"use client";

import { useEffect, useState } from "react";

const RELOAD_FLAG = "sindipro:chunk-error-reload-at";
const RELOAD_COOLDOWN_MS = 10_000;

function isChunkLoadError(error: Error): boolean {
  return error.name === "ChunkLoadError" || /Loading chunk [\w./-]+ failed/i.test(error.message);
}

/**
 * Boundary de erro do App Router (Next.js) — pego pelo React quando um
 * componente de servidor/layout falha ao renderizar. Diferente do
 * ChunkErrorReload (components/ChunkErrorReload.tsx, que escuta erros
 * "crus" do navegador via window.onerror/unhandledrejection): falha de
 * chunk durante NAVEGAÇÃO entre rotas do App Router é capturada pelo React
 * como erro de render, nunca chega nos listeners globais — só um
 * error.tsx/global-error.tsx enxerga isso. Sem nenhum dos dois arquivos no
 * projeto (era o caso até agora), a falha caía no overlay padrão do Next,
 * sem nenhum reload automático.
 *
 * global-error.tsx é o boundary mais externo (substitui até o layout raiz)
 * — como não há nenhum error.tsx mais específico em nenhuma rota, é ele
 * quem pega qualquer erro não tratado no app inteiro, incluindo os dois
 * casos relatados (app/(site)/area/page e
 * app/painel-diretoria/(dashboard)/layout).
 *
 * ChunkLoadError: recarrega sozinho (com cooldown de 10s pra não entrar em
 * loop se o problema for outra coisa). Qualquer outro erro: tela amigável
 * com botão de tentar de novo, em vez do overlay cru do Next.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const chunkError = isChunkLoadError(error);
  // Só true enquanto ESTAMOS de fato recarregando — se o cooldown bloquear
  // (erro persistente, não só staleness), cai no aviso normal em vez de
  // ficar preso em "Atualizando…" pra sempre.
  const [reloading, setReloading] = useState(chunkError);

  useEffect(() => {
    if (!chunkError) return;
    const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) {
      setReloading(false);
      return;
    }
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
    window.location.reload();
  }, [chunkError]);

  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            fontFamily: "system-ui, sans-serif",
            color: "#1c4464",
            background: "#f4f4f4",
            textAlign: "center",
            padding: "1.5rem",
          }}
        >
          {reloading ? (
            <p>Atualizando…</p>
          ) : (
            <>
              <p style={{ fontWeight: 600 }}>Algo deu errado.</p>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  borderRadius: "9999px",
                  background: "#0e518c",
                  color: "#fff",
                  border: "none",
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Tentar de novo
              </button>
            </>
          )}
        </div>
      </body>
    </html>
  );
}
