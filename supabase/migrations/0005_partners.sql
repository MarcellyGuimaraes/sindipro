-- =====================================================================
-- Sindipro SE — Parceiros (carrossel da home, gerido pelo painel)
-- Migration 0005: tabela partners, Storage partner-logos e RLS.
-- Rode UMA vez no SQL Editor do Supabase. Idempotente (pode reexecutar).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Tabela PARTNERS
-- ---------------------------------------------------------------------
create table if not exists public.partners (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                      -- nome do parceiro
  logo_url      text,                               -- logo (bucket partner-logos)
  link_url      text,                               -- site do parceiro (opcional)
  display_order int not null default 0,             -- ordem no carrossel
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Ordena pelo display_order (consulta pública e do painel).
create index if not exists partners_order_idx
  on public.partners (display_order);

-- updated_at automático (reusa a função das migrations anteriores;
-- recriada aqui por segurança caso 0005 rode isolada).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists partners_set_updated_at on public.partners;
create trigger partners_set_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2) RLS — PARTNERS
-- Público lê tudo; só a diretoria autenticada escreve.
-- ---------------------------------------------------------------------
alter table public.partners enable row level security;

drop policy if exists partners_select_public on public.partners;
create policy partners_select_public
  on public.partners for select
  to anon, authenticated
  using (true);

drop policy if exists partners_insert_authenticated on public.partners;
create policy partners_insert_authenticated
  on public.partners for insert
  to authenticated
  with check (true);

drop policy if exists partners_update_authenticated on public.partners;
create policy partners_update_authenticated
  on public.partners for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists partners_delete_authenticated on public.partners;
create policy partners_delete_authenticated
  on public.partners for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 3) Storage bucket partner-logos (leitura pública)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('partner-logos', 'partner-logos', true)
on conflict (id) do update set public = true;

-- ---------------------------------------------------------------------
-- 4) Storage policies (storage.objects) para partner-logos
-- Leitura pública; escrita só autenticado.
-- ---------------------------------------------------------------------
drop policy if exists partner_logos_public_read on storage.objects;
create policy partner_logos_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'partner-logos');

drop policy if exists partner_logos_authenticated_insert on storage.objects;
create policy partner_logos_authenticated_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'partner-logos');

drop policy if exists partner_logos_authenticated_update on storage.objects;
create policy partner_logos_authenticated_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'partner-logos')
  with check (bucket_id = 'partner-logos');

drop policy if exists partner_logos_authenticated_delete on storage.objects;
create policy partner_logos_authenticated_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'partner-logos');

-- =====================================================================
-- Fim da migration 0005.
-- =====================================================================
