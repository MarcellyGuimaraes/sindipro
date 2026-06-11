import type { Config } from "tailwindcss";

/**
 * Tokens do CLAUDE.md (seções 4, 5 e 8) mapeados 1:1.
 * Mesmos nomes do contrato: navy-700, gold-600 etc.
 * Não adicione cores fora desta lista.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // base / fundo
        bg: "#f4f4f4",
        surface: "#ffffff",
        // azuis institucionais — cor dominante
        navy: {
          900: "#1c4464",
          700: "#0e518c",
        },
        blue: {
          400: "#74a4c4",
          350: "#7d9cb9",
          300: "#97b8d1",
          200: "#b5ccdd",
          100: "#c3dcec",
        },
        // dourado — SÓ acento
        gold: {
          600: "#ab8221",
          200: "#dcc99e",
        },
        // Novo visual (referência Lovable "Pixel Perfect Page") — home/footer.
        // TODO: consolidar no CLAUDE.md quando o redesign for aprovado.
        brand: "#004b8e",
        cream: "#f0f1e8", // oklch(0.95 0.012 110) convertido
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Novo visual — Inter para as seções redesenhadas.
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      // Escala de tipo da seção 5 — sem tamanhos aleatórios.
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display-l": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        h2: ["1.75rem", { lineHeight: "1.2" }],
        h3: ["1.25rem", { lineHeight: "1.3" }],
        body: ["1.0625rem", { lineHeight: "1.7" }],
        small: ["0.9375rem", { lineHeight: "1.6" }],
        eyebrow: ["0.8125rem", { lineHeight: "1", letterSpacing: "0.08em" }],
      },
      // Grade base 8px (seção 8): 4,8,12,16,24,32,48,64,96.
      spacing: {
        section: "6rem", // 96px — respiro vertical entre seções
        "section-sm": "4rem", // 64px
      },
      maxWidth: {
        container: "1120px",
      },
      borderRadius: {
        // contenção: 6–8px; nada de pílula em tudo
        DEFAULT: "6px",
        card: "8px",
      },
      boxShadow: {
        // sombra só quando funcional (elevação real de card)
        card: "0 1px 2px rgba(28, 68, 100, 0.06), 0 8px 24px -16px rgba(28, 68, 100, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
