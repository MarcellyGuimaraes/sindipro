-- =====================================================================
-- Sindipro SE — Endurecimento de segurança (auditoria)
-- Migration 0003: separa DIRETOR de simples "autenticado" nas escritas,
-- fixa search_path das funções e exige resumo ao publicar.
-- Rode UMA vez no SQL Editor do Supabase. Idempotente.
--
-- ⚠️ APÓS RODAR: cadastre seu(s) usuário(s) de diretoria na tabela
--    public.directors (veja o passo no fim), senão ninguém conseguirá
--    escrever pelo painel.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabela de diretores + função is_director()
-- ---------------------------------------------------------------------
create table if not exists public.directors (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Sem políticas públicas: só o service role (dashboard) gerencia esta tabela.
alter table public.directors enable row level security;

-- security definer + search_path fixo: lê directors ignorando RLS, sem risco
-- de search_path mutável (alerta do linter do Supabase).
create or replace function public.is_director()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.directors d where d.user_id = auth.uid()
  );
$$;

-- Fixa o search_path da função de trigger (alerta do linter).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2) NEWS — escrita só para diretor; leitura de rascunho só para diretor
-- ---------------------------------------------------------------------
drop policy if exists news_select_all_authenticated on public.news;
create policy news_select_all_authenticated
  on public.news for select
  to authenticated
  using (public.is_director());

drop policy if exists news_insert_authenticated on public.news;
create policy news_insert_authenticated
  on public.news for insert
  to authenticated
  with check (public.is_director());

drop policy if exists news_update_authenticated on public.news;
create policy news_update_authenticated
  on public.news for update
  to authenticated
  using (public.is_director())
  with check (public.is_director());

drop policy if exists news_delete_authenticated on public.news;
create policy news_delete_authenticated
  on public.news for delete
  to authenticated
  using (public.is_director());

-- ---------------------------------------------------------------------
-- 3) FILES — escrita só para diretor
-- ---------------------------------------------------------------------
drop policy if exists files_insert_authenticated on public.files;
create policy files_insert_authenticated
  on public.files for insert
  to authenticated
  with check (public.is_director());

drop policy if exists files_update_authenticated on public.files;
create policy files_update_authenticated
  on public.files for update
  to authenticated
  using (public.is_director())
  with check (public.is_director());

drop policy if exists files_delete_authenticated on public.files;
create policy files_delete_authenticated
  on public.files for delete
  to authenticated
  using (public.is_director());

-- ---------------------------------------------------------------------
-- 4) BOARD_MEMBERS — escrita só para diretor
-- ---------------------------------------------------------------------
drop policy if exists board_members_insert_authenticated on public.board_members;
create policy board_members_insert_authenticated
  on public.board_members for insert
  to authenticated
  with check (public.is_director());

drop policy if exists board_members_update_authenticated on public.board_members;
create policy board_members_update_authenticated
  on public.board_members for update
  to authenticated
  using (public.is_director())
  with check (public.is_director());

drop policy if exists board_members_delete_authenticated on public.board_members;
create policy board_members_delete_authenticated
  on public.board_members for delete
  to authenticated
  using (public.is_director());

-- ---------------------------------------------------------------------
-- 5) STORAGE — upload/edição/remoção só para diretor (leitura segue pública)
-- ---------------------------------------------------------------------
drop policy if exists storage_authenticated_insert on storage.objects;
create policy storage_authenticated_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('news-images','downloads') and public.is_director());

drop policy if exists storage_authenticated_update on storage.objects;
create policy storage_authenticated_update
  on storage.objects for update
  to authenticated
  using (bucket_id in ('news-images','downloads') and public.is_director())
  with check (bucket_id in ('news-images','downloads') and public.is_director());

drop policy if exists storage_authenticated_delete on storage.objects;
create policy storage_authenticated_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('news-images','downloads') and public.is_director());

drop policy if exists board_photos_authenticated_insert on storage.objects;
create policy board_photos_authenticated_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'board-photos' and public.is_director());

drop policy if exists board_photos_authenticated_update on storage.objects;
create policy board_photos_authenticated_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'board-photos' and public.is_director())
  with check (bucket_id = 'board-photos' and public.is_director());

drop policy if exists board_photos_authenticated_delete on storage.objects;
create policy board_photos_authenticated_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'board-photos' and public.is_director());

-- ---------------------------------------------------------------------
-- 6) Resumo obrigatório ao publicar (valida no banco, não só no client).
--    NOT VALID: vale para novas linhas/edições, sem reprovar dados antigos.
-- ---------------------------------------------------------------------
alter table public.news drop constraint if exists news_excerpt_required_when_published;
alter table public.news add constraint news_excerpt_required_when_published
  check (status <> 'published' or (excerpt is not null and length(btrim(excerpt)) > 0))
  not valid;

-- =====================================================================
-- PASSO OBRIGATÓRIO APÓS RODAR — cadastre a diretoria:
--   1) Authentication → Users: copie o User UID do(s) diretor(es).
--   2) Rode (trocando o UUID):
--        insert into public.directors (user_id) values ('SEU-USER-UID');
--   Sem isso, o painel não conseguirá criar/editar/excluir nada.
-- =====================================================================
