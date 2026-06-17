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
