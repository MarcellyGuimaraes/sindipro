-- =====================================================================
-- Sindipro SE — Armazenamento restrito da área do associado (CLAUDE.md §15)
-- Migration 0007: tabela member_files, bucket PRIVADO member-files, RLS.
-- Rode UMA vez no SQL Editor do Supabase. Idempotente (pode reexecutar).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Helper: associado com perfil ativo (para as policies de SELECT).
--    Mesma lógica de is_director()/is_associado() (migration 0006): lê o
--    papel do JWT; aqui soma a checagem de profiles.status.
-- ---------------------------------------------------------------------
create or replace function public.is_active_associado()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.is_associado() and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'ativo'
  );
$$;

-- ---------------------------------------------------------------------
-- 2) Tabela MEMBER_FILES (metadados; o PDF em si vive no Storage)
-- ---------------------------------------------------------------------
create table if not exists public.member_files (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  folder       text not null
                 check (folder in ('arquivos', 'atas', 'editais', 'comunicados')),
  description  text,
  storage_path text not null,                 -- <folder>/<uuid>.pdf — nunca o nome original
  size_bytes   bigint,
  mime_type    text,
  uploaded_by  uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists member_files_folder_created_at_idx
  on public.member_files (folder, created_at desc);

-- ---------------------------------------------------------------------
-- 3) RLS — MEMBER_FILES
--    Leitura: diretoria (tudo) OU associado com perfil ativo.
--    Escrita (insert/update/delete): só diretoria.
-- ---------------------------------------------------------------------
alter table public.member_files enable row level security;

drop policy if exists member_files_select on public.member_files;
create policy member_files_select
  on public.member_files for select
  to authenticated
  using (public.is_director() or public.is_active_associado());

drop policy if exists member_files_insert_director on public.member_files;
create policy member_files_insert_director
  on public.member_files for insert
  to authenticated
  with check (public.is_director());

drop policy if exists member_files_update_director on public.member_files;
create policy member_files_update_director
  on public.member_files for update
  to authenticated
  using (public.is_director())
  with check (public.is_director());

drop policy if exists member_files_delete_director on public.member_files;
create policy member_files_delete_director
  on public.member_files for delete
  to authenticated
  using (public.is_director());

-- ---------------------------------------------------------------------
-- 4) Storage bucket member-files — PRIVADO (public: false), diferente do
--    bucket "downloads". Só PDF, até 20 MB — reforçado no nível do bucket,
--    não só no client (Storage API recusa o upload mesmo se alguém pular a
--    validação do formulário).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('member-files', 'member-files', false, 20971520, array['application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = array['application/pdf'];

-- ---------------------------------------------------------------------
-- 5) Storage policies — SEM select (nenhuma leitura via RLS, nem para
--    diretoria, nem para associado). O acesso de leitura é sempre por URL
--    assinada gerada no servidor com a chave secreta (bypassa RLS) —
--    trabalho futuro (§15), ainda não construído. Só insert/delete p/
--    diretoria.
-- ---------------------------------------------------------------------
drop policy if exists member_files_storage_insert on storage.objects;
create policy member_files_storage_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'member-files' and public.is_director());

drop policy if exists member_files_storage_delete on storage.objects;
create policy member_files_storage_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'member-files' and public.is_director());

-- =====================================================================
-- Fim da migration 0007.
-- =====================================================================
