import { Fraunces, IBM_Plex_Sans, Inter } from "next/font/google";

/**
 * Display / títulos — Fraunces (seção 5). Pesos 500–600.
 */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-display",
});

/**
 * Corpo / UI e eyebrow — IBM Plex Sans (seção 5). Apenas pesos 400 e 500.
 */
export const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-sans",
});

/**
 * Novo visual (referência Lovable) — Inter bold/tight para as seções
 * redesenhadas (home + footer). Fonte variável.
 */
export const fontInter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
