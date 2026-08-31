-- =====================================================================
-- Sindipro SE — Provedores (CLAUDE.md §16)
-- Migration 0009: tabela providers, coluna profiles.provider_id (FK nula
-- permitida), RLS e a MIGRAÇÃO dos valores atuais de profiles.company.
-- Rode UMA vez no SQL Editor do Supabase. Idempotente (pode reexecutar).
--
-- Depende de: 0006 (profiles, is_director()).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Tabela PROVIDERS
-- ---------------------------------------------------------------------
create table if not exists public.providers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  cnpj       text,                                -- só dígitos (14), opcional
  city       text,                                -- opcional
  status     text not null default 'ativo'
               check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nome único (case-insensitive): evita "Provedor X" e "provedor x"
-- duplicados, e dá um alvo estável para o ON CONFLICT da migração abaixo.
create unique index if not exists providers_name_unique_idx
  on public.providers (lower(btrim(name)));

-- CNPJ único quando informado (nulos não colidem entre si).
create unique index if not exists providers_cnpj_unique_idx
  on public.providers (cnpj)
  where cnpj is not null;

create index if not exists providers_name_idx
  on public.providers (name);

drop trigger if exists providers_set_updated_at on public.providers;
create trigger providers_set_updated_at
  before update on public.providers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2) RLS — PROVIDERS
--    Leitura: qualquer autenticado (o SELECT do formulário de associado e
--    a listagem do painel). Sem leitura anônima — provedor é dado interno.
--    Escrita: só 'diretoria' (app_metadata.role, via is_director()).
-- ---------------------------------------------------------------------
alter table public.providers enable row level security;

drop policy if exists providers_select_authenticated on public.providers;
create policy providers_select_authenticated
  on public.providers for select
  to authenticated
  using (true);

drop policy if exists providers_insert_director on public.providers;
create policy providers_insert_director
  on public.providers for insert
  to authenticated
  with check (public.is_director());

drop policy if exists providers_update_director on public.providers;
create policy providers_update_director
  on public.providers for update
  to authenticated
  using (public.is_director())
  with check (public.is_director());

drop policy if exists providers_delete_director on public.providers;
create policy providers_delete_director
  on public.providers for delete
  to authenticated
  using (public.is_director());

-- ---------------------------------------------------------------------
-- 3) PROFILES ganha provider_id (FK, nula permitida)
--    on delete set null: excluir um provedor NÃO apaga o associado — o
--    vínculo só some e a diretoria relinka pelo painel.
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists provider_id uuid
    references public.providers (id) on delete set null;

create index if not exists profiles_provider_id_idx
  on public.profiles (provider_id);

-- `company` (texto livre) deixa de ser obrigatório: a partir de agora o
-- vínculo é provider_id. A coluna é MANTIDA temporariamente (CLAUDE.md §16)
-- para guardar o texto original das linhas que não casarem na migração —
-- é o que permite relinkar manualmente pelo painel depois.
alter table public.profiles
  alter column company drop not null;

-- ---------------------------------------------------------------------
-- 4) MIGRAÇÃO DOS DADOS — company (texto livre) -> providers + provider_id
--
--    4.1 cria um provedor para cada `company` distinto e não-vazio
--        (comparação normalizada: sem espaços nas pontas, case-insensitive);
--    4.2 relinka cada profile ao provedor de mesmo nome normalizado.
--
--    O que NÃO casar (company nulo, vazio, ou já relinkado) fica com
--    provider_id NULL — para ser ajustado pelo painel, em
--    /painel-diretoria/associados.
--
--    Idempotente: reexecutar não duplica provedor nem sobrescreve vínculo
--    já feito à mão (o UPDATE só toca linhas com provider_id is null).
-- ---------------------------------------------------------------------

-- 4.1
insert into public.providers (name, status)
select distinct btrim(p.company), 'ativo'
from public.profiles p
where p.company is not null
  and btrim(p.company) <> ''
on conflict (lower(btrim(name))) do nothing;

-- 4.2
update public.profiles p
set provider_id = pr.id
from public.providers pr
where p.provider_id is null
  and p.company is not null
  and lower(btrim(p.company)) = lower(btrim(pr.name));

-- ---------------------------------------------------------------------
-- 5) CONFERÊNCIA (rode depois, para ver o que sobrou sem vínculo)
--
--   select id, full_name, email, company, provider_id
--   from public.profiles
--   where provider_id is null
--   order by created_at desc;
--
-- Cada linha aí é um associado para relinkar no painel. Se `company`
-- estiver preenchido, ele mostra o texto antigo como pista.
-- ---------------------------------------------------------------------

-- =====================================================================
-- Fim da migration 0009.
-- =====================================================================
