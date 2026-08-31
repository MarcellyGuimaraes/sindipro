import "server-only";
import { headers } from "next/headers";

/**
 * IP de quem fez a request, a partir dos headers de proxy (Vercel e a
 * maioria dos hosts preenchem x-forwarded-for). Sem proxy na frente (dev
 * local), cai em "unknown" — todo tráfego local compartilha um único balde
 * de rate limit, o que é aceitável em desenvolvimento.
 */
export function clientIp(): string {
  const h = headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
