/** Grupos do quadro de diretoria (CLAUDE.md §14). */
export type BoardGroup = "executiva" | "conselho_titular" | "conselho_suplente";

/** Linha da tabela `board_members` (CLAUDE.md §14). */
export type BoardMemberRow = {
  id: string;
  name: string;
  role: string;
  board_group: BoardGroup;
  photo_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

/** Linha da tabela `partners` — parceiros do carrossel da home. */
export type PartnerRow = {
  id: string;
  name: string;
  logo_url: string | null;
  link_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

/** Linha da tabela `files` (CLAUDE.md §14). */
export type FileRow = {
  id: string;
  title: string;
  type: "CCT" | "ACT" | "outro";
  description: string | null;
  storage_path: string;
  file_url: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
};

/** Ações auditadas em `post_logs` (migration 0004). */
export type PostLogAction =
  | "created"
  | "updated"
  | "published"
  | "unpublished"
  | "deleted";

/** Linha da tabela `post_logs` — log de quem mexeu na notícia e quando. */
export type PostLogRow = {
  id: string;
  news_id: string | null;
  news_slug: string | null;
  news_title: string | null;
  action: PostLogAction;
  actor_id: string | null;
  actor_email: string | null;
  created_at: string;
};

/**
 * Pastas de PDF da área logada (CLAUDE.md §16).
 *
 * 'comunicados' SAIU daqui: virou feed de posts (tabela `comunicados`),
 * não é mais pasta de arquivo. Ver migration 0010.
 */
export type MemberFileFolder = "arquivos" | "atas" | "editais";

/** Linha da tabela `member_files` — arquivos do bucket privado (CLAUDE.md §15). */
export type MemberFileRow = {
  id: string;
  title: string;
  folder: MemberFileFolder;
  description: string | null;
  storage_path: string;
  size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
};

/** Linha da tabela `providers` — provedores associados (CLAUDE.md §16). */
export type ProviderRow = {
  id: string;
  name: string;
  cnpj: string | null;
  city: string | null;
  status: "ativo" | "inativo";
  created_at: string;
  updated_at: string;
};

/**
 * Linha da tabela `profiles` — dados do associado (CLAUDE.md §15 e §16).
 *
 * `company` é o texto livre LEGADO: continua na tabela só para guardar o
 * valor anterior das linhas que a migration 0009 não conseguiu casar com um
 * provedor. O vínculo válido é `provider_id`.
 */
export type ProfileRow = {
  id: string;
  full_name: string;
  company: string | null;
  provider_id: string | null;
  email: string;
  status: "ativo" | "inativo";
  created_at: string;
  updated_at: string;
};

/** Linha da tabela `comunicados` — post do feed da área restrita (§16). */
export type ComunicadoRow = {
  id: string;
  title: string | null;
  body: string;
  image_path: string | null;
  author_id: string | null;
  status: "rascunho" | "publicado";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Linha da tabela `comunicado_likes` (§16). */
export type ComunicadoLikeRow = {
  id: string;
  comunicado_id: string;
  user_id: string;
  created_at: string;
};

/**
 * Linha da tabela `comunicado_comments` (§16).
 * `body` é TEXTO PURO — nunca renderizar como HTML nem markdown.
 */
export type ComunicadoCommentRow = {
  id: string;
  comunicado_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

/** Linha da tabela `news` (CLAUDE.md §14). */
export type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};
