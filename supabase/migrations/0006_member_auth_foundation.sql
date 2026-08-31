-- =====================================================================
-- Sindipro SE — Fundação de autorização da área do associado (CLAUDE.md §15)
-- Migration 0006: tabela profiles, papéis via app_metadata, RLS.
-- Rode UMA vez no SQL Editor do Supabase. Idempotente (pode reexecutar).
--
-- ⚠️ ORDEM OBRIGATÓRIA PARA NÃO SE TRANCAR FORA DO PAINEL:
--   Esta migration troca a fonte da diretoria: antes era a tabela
--   `public.directors` (migration 0003), agora passa a ser
--   auth.jwt() -> 'app_metadata' ->> 'role' = 'diretoria'.
--   Qualquer conta que só estava em `directors` PERDE acesso de escrita
--   (RLS) assim que esta migration rodar, até você:
--     1) Rodar o UPDATE de app_metadata para essa conta (ver bloco no fim
--        deste arquivo) — pode ser feito ANTES ou logo depois desta migration.
--     2) Fazer logout e login de novo nessa conta (o token precisa ser
--        reemitido para carregar o novo app_metadata — ver explicação
--        que acompanha esta entrega).
--   Recomendado: rode o UPDATE de app_metadata para a sua própria conta
--   ANTES de rodar esta migration, ou imediatamente depois, antes de sair
--   da sessão do SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Papel do usuário: sempre em app_metadata, nunca em user_metadata.
--    current_app_role() lê o claim do JWT já validado pelo Supabase Auth
--    (PostgREST só recebe o request com um JWT assinado pelo GoTrue) —
--    não é preciso security definer nem tocar em nenhuma tabela.
-- ---------------------------------------------------------------------
create or replace function public.current_app_role()
returns text
language sql
stable
set search_path = public
as $$
  select auth.jwt() -> 'app_metadata' ->> 'role';
$$;

-- Redefine is_director() (criada na migration 0003 lendo a tabela
-- `directors`) para usar o novo padrão de papel via app_metadata.
-- Mesma assinatura (boolean, sem argumentos) — todas as policies que já
-- chamam public.is_director() (news, files, board_members, storage)
-- passam a valer automaticamente pelo novo critério, sem editá-las.
create or replace function public.is_director()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_app_role() = 'diretoria';
$$;

create or replace function public.is_associado()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_app_role() = 'associado';
$$;

-- A tabela public.directors (migration 0003) não é mais lida por
-- is_director() a partir daqui. Não a removemos nesta migration para não
-- apagar dado sem confirmação — depois de validar o novo fluxo, pode ser
-- dropada (`drop table public.directors;`).

-- ---------------------------------------------------------------------
-- 2) Tabela PROFILES (dados do associado)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null,
  company    text not null,                      -- provedor
  email      text not null,
  status     text not null default 'ativo'
               check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3) RLS — PROFILES
--    Associado lê só o próprio perfil. Diretoria lê e escreve todos.
--    Sem policy de insert/update para associado: só a diretoria cria e
--    edita contas (CLAUDE.md §15 — "sem cadastro público").
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own_or_director on public.profiles;
create policy profiles_select_own_or_director
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_director());

drop policy if exists profiles_insert_director on public.profiles;
create policy profiles_insert_director
  on public.profiles for insert
  to authenticated
  with check (public.is_director());

drop policy if exists profiles_update_director on public.profiles;
create policy profiles_update_director
  on public.profiles for update
  to authenticated
  using (public.is_director())
  with check (public.is_director());

drop policy if exists profiles_delete_director on public.profiles;
create policy profiles_delete_director
  on public.profiles for delete
  to authenticated
  using (public.is_director());

-- =====================================================================
-- PASSO MANUAL — definir o papel 'diretoria' numa conta existente.
-- Rode no SQL Editor do Supabase (mescla com o app_metadata existente,
-- não apaga campos como "provider"/"providers" que o Supabase já grava):
--
--   update auth.users
--   set raw_app_meta_data =
--     coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'diretoria')
--   where email = 'email-do-diretor@dominio.com';
--
-- Depois: faça logout e login de novo nessa conta (necessário para o
-- token JWT ser reemitido com o novo app_metadata — auth.jwt() nas RLS
-- lê o que está DENTRO do token, não a tabela ao vivo).
-- =====================================================================
