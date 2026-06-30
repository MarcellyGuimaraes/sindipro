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
