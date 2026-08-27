import { redirect } from "next/navigation";

/**
 * O feed de comunicados passou a viver na home da área do associado (/area),
 * na coluna principal (CLAUDE.md §16). Esta rota antiga redireciona para lá,
 * mantendo qualquer link já compartilhado funcionando.
 *
 * A rota de imagem /area/comunicados/[id]/imagem CONTINUA existindo — o card
 * do feed depende dela para servir a imagem do bucket privado.
 */
export default function ComunicadosFeedPage() {
  redirect("/area");
}
