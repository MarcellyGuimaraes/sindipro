import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthorizedMemberFile } from "@/lib/member-files-access";

export const dynamic = "force-dynamic";

/**
 * Serve o PDF de um documento da área do associado, inline (não força
 * download). GET /area/[pasta]/[id]/pdf
 *
 * Fluxo, sempre nesta ordem:
 * 1) getAuthorizedMemberFile revalida sessão + papel + perfil ativo + que o
 *    arquivo pertence à pasta pedida (mesma checagem usada pela página).
 * 2) Só DEPOIS disso, com a chave secreta, gera uma URL assinada de 60s
 *    para o storage_path — nunca antes de validar, e o client nunca vê o
 *    storage_path nem essa URL: buscamos aqui no servidor e devolvemos os
 *    bytes com Content-Disposition: inline. A resposta desta rota é a única
 *    coisa que chega ao navegador.
 */
export async function GET(
  _request: Request,
  { params }: { params: { pasta: string; id: string } }
) {
  const file = await getAuthorizedMemberFile(params.pasta, params.id);
  if (!file) {
    return new NextResponse("Documento não encontrado.", { status: 404 });
  }

  const admin = createAdminClient();
  const { data: signed, error: signError } = await admin.storage
    .from("member-files")
    .createSignedUrl(file.storage_path, 60);

  if (signError || !signed) {
    return new NextResponse("Não foi possível carregar o arquivo.", { status: 502 });
  }

  const upstream = await fetch(signed.signedUrl);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Não foi possível carregar o arquivo.", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(file.title),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * "inline" (não "attachment"): abre no visualizador do navegador em vez de
 * forçar download. filename* (RFC 6266) cobre o título em pt-BR com acento;
 * filename simples é o fallback ASCII para navegadores antigos.
 */
function contentDisposition(title: string): string {
  const clean = title.replace(/["\r\n]/g, "").trim() || "documento";
  const ascii =
    clean
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\x20-\x7E]/g, "_") || "documento";
  return `inline; filename="${ascii}.pdf"; filename*=UTF-8''${encodeURIComponent(clean)}.pdf`;
}
