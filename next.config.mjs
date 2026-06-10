/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // O placeholder do styleguide é SVG; em produção as imagens reais
    // (next/image) virão de arquivos raster ou de remotePatterns aprovados.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
