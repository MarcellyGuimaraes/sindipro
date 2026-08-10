"use client";

import { useEffect, useState } from "react";
import styles from "./conecte.module.css";

/**
 * Contagem regressiva da barra azul — cópia do componente do protótipo Lovable.
 * Mesmo alvo (24/09/2026 08:30 -03:00), mesmos rótulos e mesmas caixas.
 *
 * Começa zerada, como no HTML servido pelo protótipo, e só passa a contar no
 * efeito — assim o servidor e o cliente renderizam o mesmo na hidratação.
 */

const TARGET = new Date("2026-09-24T08:30:00-03:00").getTime();

const ZERO = { dias: 0, horas: 0, minutos: 0, segundos: 0 };

function diff() {
  const ms = Math.max(0, TARGET - Date.now());
  return {
    dias: Math.floor(ms / 86400000),
    horas: Math.floor((ms / 3600000) % 24),
    minutos: Math.floor((ms / 60000) % 60),
    segundos: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown() {
  const [time, setTime] = useState(ZERO);

  useEffect(() => {
    setTime(diff());
    const id = setInterval(() => setTime(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const units: Array<[string, number]> = [
    ["Dias", time.dias],
    ["Hrs", time.horas],
    ["Min", time.minutos],
    ["Seg", time.segundos],
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {units.map(([label, value]) => (
        <div
          key={label}
          className={`${styles.bgPrimaryFg10} ${styles.roundedXl} flex w-[3.6rem] flex-col items-center px-2 py-2.5 sm:w-[4.5rem] sm:py-3`}
        >
          <span
            className={`${styles.display} ${styles.textPrimaryFg} text-2xl font-extrabold leading-none sm:text-3xl`}
          >
            {String(value).padStart(2, "0")}
          </span>
          <span
            className={`${styles.textPrimaryFg70} mt-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em]`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
