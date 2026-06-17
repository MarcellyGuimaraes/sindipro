-- =====================================================================
-- Sindipro SE — Painel da diretoria
-- Migration 0001: tabelas news e files, Storage e RLS (CLAUDE.md §14)
-- Rode UMA vez no SQL Editor do Supabase. Idempotente (pode reexecutar).
-- =====================================================================

-- gen_random_uuid() — normalmente já existe em projetos Supabase.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Tabela NEWS
-- ---------------------------------------------------------------------
create table if not exists public.news (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  excerpt         text,
  content         text,                       -- markdown / rich text
  cover_image_url text,
  status          text not null default 'draft'
                    check (status in ('draft', 'published')),
  published_at    timestamptz,
  author_id       uuid default auth.uid()
                    references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists news_status_published_at_idx
  on public.news (status, published_at desc);

-- ---------------------------------------------------------------------
-- 2) Tabela FILES (CCT / ACT / outro)
-- ---------------------------------------------------------------------
create table if not exists public.files (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  type         text not null default 'outro'
                 check (type in ('CCT', 'ACT', 'outro')),
  description  text,
  storage_path text not null,                 -- caminho dentro do bucket "downloads"
  file_url     text,                          -- URL pública do arquivo
  size_bytes   bigint,
  uploaded_by  uuid default auth.uid()
                 references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists files_type_created_at_idx
  on public.files (type, created_at desc);

-- ---------------------------------------------------------------------
-- 3) updated_at automático na news
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists news_set_updated_at on public.news;
create trigger news_set_updated_at
  before update on public.news
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4) RLS — NEWS
-- ---------------------------------------------------------------------
alter table public.news enable row level security;

-- Público (anon) e logados: leem apenas notícias PUBLICADAS.
drop policy if exists news_select_published on public.news;
create policy news_select_published
  on public.news for select
  to anon, authenticated
  using (status = 'published');

-- Diretoria (logada): lê TUDO, inclusive rascunhos (para gerenciar no painel).
-- Policies permissivas se somam (OR): logado = publicadas OR todas = todas.
drop policy if exists news_select_all_authenticated on public.news;
create policy news_select_all_authenticated
  on public.news for select
  to authenticated
  using (true);

-- Só logado insere/atualiza/deleta.
drop policy if exists news_insert_authenticated on public.news;
create policy news_insert_authenticated
  on public.news for insert
  to authenticated
  with check (true);

drop policy if exists news_update_authenticated on public.news;
create policy news_update_authenticated
  on public.news for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists news_delete_authenticated on public.news;
create policy news_delete_authenticated
  on public.news for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 5) RLS — FILES
-- O §14 não prevê coluna de status em files: todo arquivo cadastrado é
-- público para download (são CCT/ACT). Leitura liberada; escrita só logado.
-- (Se quiser rascunho de arquivo no futuro, adicione is_published boolean
--  e troque o using(true) abaixo por using(is_published) para anon.)
-- ---------------------------------------------------------------------
alter table public.files enable row level security;

drop policy if exists files_select_public on public.files;
create policy files_select_public
  on public.files for select
  to anon, authenticated
  using (true);

drop policy if exists files_insert_authenticated on public.files;
create policy files_insert_authenticated
  on public.files for insert
  to authenticated
  with check (true);

drop policy if exists files_update_authenticated on public.files;
create policy files_update_authenticated
  on public.files for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists files_delete_authenticated on public.files;
create policy files_delete_authenticated
  on public.files for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 6) Storage buckets (leitura pública)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('downloads', 'downloads', true)
on conflict (id) do update set public = true;

-- ---------------------------------------------------------------------
-- 7) Storage policies (storage.objects)
-- Leitura pública desses dois buckets; escrita (upload/edição/remoção)
-- apenas para usuários autenticados.
-- ---------------------------------------------------------------------
drop policy if exists storage_public_read on storage.objects;
create policy storage_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('news-images', 'downloads'));

drop policy if exists storage_authenticated_insert on storage.objects;
create policy storage_authenticated_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('news-images', 'downloads'));

drop policy if exists storage_authenticated_update on storage.objects;
create policy storage_authenticated_update
  on storage.objects for update
  to authenticated
  using (bucket_id in ('news-images', 'downloads'))
  with check (bucket_id in ('news-images', 'downloads'));

drop policy if exists storage_authenticated_delete on storage.objects;
create policy storage_authenticated_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('news-images', 'downloads'));

-- =====================================================================
-- Fim da migration 0001.
-- =====================================================================
