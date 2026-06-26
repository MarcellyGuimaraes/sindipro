/** @type {import('next').NextConfig} */

// Content-Security-Policy do site. 'unsafe-inline' em script/style é exigido
// pelo runtime do Next sem nonce; o XSS do conteúdo já é barrado na origem
// (sanitização em lib/markdown.ts), então o CSP aqui é defesa em profundidade.
// connect-src libera as chamadas ao Supabase (REST/Auth/Storage/Realtime).
//
// 'unsafe-eval' SÓ em desenvolvimento: o Fast Refresh/HMR do Next usa eval()
// no bundle de dev. Sem ele, o CSP bloqueia TODO o JS do cliente em dev — nada
// hidrata e a página fica sem interatividade. Em produção o Next não usa eval,
// então mantemos o CSP estrito (sem unsafe-eval).
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'", // anti-clickjacking (cobre o painel)
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  images: {
    // SVGs (placeholders) são servidos com `unoptimized`, sem passar pelo
    // otimizador — por isso `dangerouslyAllowSVG` foi removido (segurança).
    // Capas reais ficam no Supabase Storage (bucket público news-images).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
