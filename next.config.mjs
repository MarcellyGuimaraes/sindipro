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

// Google Analytics 4 (carregado só na landing /conecte-se-2026, mas liberado no
// CSP do site inteiro: dois headers CSP na mesma resposta se aplicam pela
// interseção, então não dá para relaxar a regra só naquela rota).
// - script: o gtag.js vem do googletagmanager.com;
// - connect: os hits vão para *.google-analytics.com (region1, region2...) e,
//   em parte das configurações, para *.analytics.google.com;
// - img: fallback em pixel quando o beacon/fetch não está disponível.
const gaScript = "https://www.googletagmanager.com";
const gaConnect =
  "https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com";
const gaImg = "https://*.google-analytics.com https://www.googletagmanager.com";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'", // anti-clickjacking (cobre o painel)
  // Sem esta linha o frame-src herda o default-src 'self' e o mapa embutido
  // da página do Conecte-se 2026 é bloqueado. Liberado só o Google Maps.
  "frame-src 'self' https://www.google.com https://maps.google.com",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${gaScript}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.supabase.co ${gaImg}`,
  "font-src 'self'",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${gaConnect}`,
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
