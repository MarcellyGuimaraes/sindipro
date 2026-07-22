"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  INACTIVITY_TIMEOUT_MINUTES,
  INACTIVITY_WARNING_SECONDS,
} from "@/lib/auth/session-timeout";
import { nextInactivityState, formatCountdown } from "@/lib/auth/inactivity-state";

const TIMEOUT_MS = INACTIVITY_TIMEOUT_MINUTES * 60_000;
const WARNING_MS = INACTIVITY_WARNING_SECONDS * 1_000;
const TICK_MS = 1_000;
const STORAGE_WRITE_THROTTLE_MS = 3_000;

// Chave compartilhada entre abas: atividade em uma aba adia o logout nas
// outras (senão uma aba parada em segundo plano desloga o usuário mesmo
// enquanto ele usa a área logada em outra aba).
const STORAGE_KEY = "sindipro:auth:last-activity";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

/**
 * Desloga automaticamente por inatividade nas áreas autenticadas do site
 * (CLAUDE.md §15). Sem UI própria até faltar pouco tempo — nesse ponto mostra
 * um aviso com contagem regressiva e a opção de continuar conectado.
 *
 * Renderizado uma vez por área (layout de /area e shell do painel), cada uma
 * com seu próprio `loginPath` de destino ao expirar.
 */
export function InactivityGuard({ loginPath }: { loginPath: string }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastActivityRef = useRef(Date.now());
  const lastStorageWriteRef = useRef(0);
  const loggingOutRef = useRef(false);

  useEffect(() => {
    function registerActivity(fromStorage = false) {
      const now = Date.now();
      lastActivityRef.current = now;
      setSecondsLeft((prev) => (prev === null ? prev : null));

      if (!fromStorage && now - lastStorageWriteRef.current > STORAGE_WRITE_THROTTLE_MS) {
        lastStorageWriteRef.current = now;
        try {
          localStorage.setItem(STORAGE_KEY, String(now));
        } catch {
          // Storage indisponível (modo privado etc.) — só perde o sync entre
          // abas, o timer local continua funcionando normalmente.
        }
      }
    }

    function onActivity() {
      registerActivity();
    }

    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      const ts = Number(event.newValue);
      if (Number.isFinite(ts) && ts > lastActivityRef.current) {
        lastActivityRef.current = ts;
        setSecondsLeft((prev) => (prev === null ? prev : null));
      }
    }

    async function doLogout() {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = `${loginPath}?erro=inatividade`;
    }

    const tick = setInterval(() => {
      if (loggingOutRef.current) return;
      const idleFor = Date.now() - lastActivityRef.current;
      const state = nextInactivityState(idleFor, TIMEOUT_MS, WARNING_MS);

      if (state.action === "logout") {
        void doLogout();
        return;
      }

      if (state.action === "warn") {
        setSecondsLeft(state.secondsLeft);
      } else {
        setSecondsLeft((prev) => (prev === null ? prev : null));
      }
    }, TICK_MS);

    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, onActivity, { passive: true });
    }
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(tick);
      for (const type of ACTIVITY_EVENTS) {
        window.removeEventListener(type, onActivity);
      }
      window.removeEventListener("storage", onStorage);
    };
  }, [loginPath]);

  if (secondsLeft === null) return null;

  return (
    <InactivityWarning
      secondsLeft={secondsLeft}
      onStayLoggedIn={() => {
        lastActivityRef.current = Date.now();
        setSecondsLeft(null);
      }}
      onLogoutNow={async () => {
        loggingOutRef.current = true;
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = loginPath;
      }}
    />
  );
}

function InactivityWarning({
  secondsLeft,
  onStayLoggedIn,
  onLogoutNow,
}: {
  secondsLeft: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}) {
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    stayButtonRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="inactivity-title"
        aria-describedby="inactivity-desc"
        className="w-full max-w-sm rounded-[20px] bg-white p-6 font-inter shadow-card sm:p-8"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/50">
          SindiproSE
        </p>
        <h2 id="inactivity-title" className="mt-2 text-lg font-bold text-brand">
          Sua sessão vai expirar
        </h2>
        <p id="inactivity-desc" className="mt-2 text-sm text-black/60">
          Por inatividade, você será desconectado em{" "}
          <strong className="font-semibold text-black">{formatCountdown(secondsLeft * 1000)}</strong>.
          Continue conectado para manter o acesso.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            ref={stayButtonRef}
            type="button"
            onClick={onStayLoggedIn}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Continuar conectado
          </button>
          <button
            type="button"
            onClick={onLogoutNow}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-black/5 px-4 text-sm font-medium text-black transition hover:bg-black/10"
          >
            Sair agora
          </button>
        </div>
      </div>
    </div>
  );
}
