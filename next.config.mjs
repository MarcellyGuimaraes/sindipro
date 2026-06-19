/** @type {import('next').NextConfig} */

// Content-Security-Policy do site. 'unsafe-inline' em script/style é exigido
// pelo runtime do Next sem nonce; o XSS do conteúdo já é barrado na origem
// (sanitização em lib/markdown.ts), então o CSP aqui é defesa em profundidade.
// connect-src libera as chamadas ao Supabase (REST/Auth/Storage/Realtime).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'", // anti-clickjacking (cobre o painel)
  "script-src 'self' 'unsafe-inline'",
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
  // isomorphic-dompurify carrega o jsdom via require dinâmico. O file-tracing do
  // build serverless (Vercel) não segue esses requires, então a função da página
  // da notícia quebra em runtime com 500 — embora funcione em dev e no
  // `next start` local. Marcar como "external" faz o Next NÃO empacotar o pacote
  // e exigi-lo do node_modules em runtime, que aí é rastreado por inteiro.
  experimental: {
    serverComponentsExternalPackages: ["isomorphic-dompurify"],
  },
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
