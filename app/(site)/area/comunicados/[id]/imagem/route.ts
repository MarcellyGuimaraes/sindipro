import { NextResponse } from "next/server";
import {
  getAuthorizedComunicado,
  createComunicadoImageSignedUrl,
} from "@/lib/comunicados-access";

export const dynamic = "force-dynamic";

/** Só o que o bucket aceita (migration 0010). Nada de sniffing. */
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Serve a imagem de um comunicado do bucket PRIVADO comunicado-images.
 * GET /area/comunicados/[id]/imagem
 *
 * Mesmo desenho da rota de PDF da área do associado:
 * 1) revalida sessão + papel + perfil ativo + visibilidade do post;
 * 2) só depois gera a URL assinada de 60s com a chave secreta;
 * 3) busca os bytes AQUI e devolve — o navegador nunca vê o storage_path
 *    nem a URL assinada. A resposta desta rota é a única coisa que sai.
 *
 * `Cache-Control: private, no-store` para conteúdo de área restrita não
 * ficar em cache compartilhado (CDN/proxy) e sumir do disco ao sair.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const comunicado = await getAuthorizedComunicado(params.id);
  if (!comunicado?.image_path) {
    return new NextResponse("Imagem não encontrada.", { status: 404 });
  }

  const signedUrl = await createComunicadoImageSignedUrl(params.id);
  if (!signedUrl) {
    return new NextResponse("Não foi possível carregar a imagem.", { status: 502 });
  }

  const upstream = await fetch(signedUrl);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Não foi possível carregar a imagem.", { status: 502 });
  }

  const upstreamType = upstream.headers.get("content-type")?.split(";")[0]?.trim();
  const contentType =
    upstreamType && ALLOWED_TYPES.has(upstreamType) ? upstreamType : "application/octet-stream";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
