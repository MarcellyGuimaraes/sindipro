-- =====================================================================
-- Sindipro SE — Quadro de diretoria (CLAUDE.md §14, parte NOVA)
-- Migration 0002: tabela board_members, Storage board-photos e RLS.
-- Rode UMA vez no SQL Editor do Supabase. Idempotente (pode reexecutar).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Tabela BOARD_MEMBERS
-- ---------------------------------------------------------------------
create table if not exists public.board_members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text not null,                      -- cargo (texto livre)
  board_group   text not null
                  check (board_group in ('executiva', 'conselho_titular', 'conselho_suplente')),
  photo_url     text,
  display_order int not null default 0,             -- ordena dentro do grupo
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Ordena por grupo e display_order (consulta pública e do painel).
create index if not exists board_members_group_order_idx
  on public.board_members (board_group, display_order);

-- updated_at automático (reusa a função criada na migration 0001;
-- recriada aqui por segurança caso 0002 rode isolada).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists board_members_set_updated_at on public.board_members;
create trigger board_members_set_updated_at
  before update on public.board_members
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2) RLS — BOARD_MEMBERS
-- Público lê tudo; só a diretoria autenticada escreve.
-- ---------------------------------------------------------------------
alter table public.board_members enable row level security;

drop policy if exists board_members_select_public on public.board_members;
create policy board_members_select_public
  on public.board_members for select
  to anon, authenticated
  using (true);

drop policy if exists board_members_insert_authenticated on public.board_members;
create policy board_members_insert_authenticated
  on public.board_members for insert
  to authenticated
  with check (true);

drop policy if exists board_members_update_authenticated on public.board_members;
create policy board_members_update_authenticated
  on public.board_members for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists board_members_delete_authenticated on public.board_members;
create policy board_members_delete_authenticated
  on public.board_members for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 3) Storage bucket board-photos (leitura pública)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('board-photos', 'board-photos', true)
on conflict (id) do update set public = true;

-- ---------------------------------------------------------------------
-- 4) Storage policies (storage.objects) para board-photos
-- Leitura pública; escrita só autenticado.
-- ---------------------------------------------------------------------
drop policy if exists board_photos_public_read on storage.objects;
create policy board_photos_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'board-photos');

drop policy if exists board_photos_authenticated_insert on storage.objects;
create policy board_photos_authenticated_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'board-photos');

drop policy if exists board_photos_authenticated_update on storage.objects;
create policy board_photos_authenticated_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'board-photos')
  with check (bucket_id = 'board-photos');

drop policy if exists board_photos_authenticated_delete on storage.objects;
create policy board_photos_authenticated_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'board-photos');

-- =====================================================================
-- Fim da migration 0002.
-- =====================================================================
