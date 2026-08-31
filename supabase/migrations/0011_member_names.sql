-- =====================================================================
-- Sindipro SE — Nomes dos autores no mural compartilhado (CLAUDE.md §16)
-- Migration 0011: função member_names().
-- Rode UMA vez no SQL Editor do Supabase. Idempotente (pode reexecutar).
--
-- Depende de: 0006 (profiles) e 0010 (can_read_member_area).
--
-- POR QUE ISTO EXISTE
-- O feed de comunicados é um mural compartilhado: o associado precisa ver
-- QUEM escreveu cada comentário. Mas a RLS de `profiles` (migration 0006)
-- deixa o associado ler apenas o PRÓPRIO perfil — o que é correto e não
-- deve ser afrouxado: `profiles` guarda e-mail, status e o vínculo com o
-- provedor, e nada disso é da conta dos outros associados.
--
-- Três saídas foram consideradas:
--   a) abrir SELECT de `profiles` para todo autenticado — expõe e-mail e
--      status junto com o nome. Descartada.
--   b) grant de coluna (só id/full_name) — não serve: associado e diretoria
--      são o MESMO papel do Postgres ('authenticated'), então o grant não
--      consegue diferenciar os dois.
--   c) esta função: devolve EXCLUSIVAMENTE id e nome, só para quem já tem
--      direito de ler a área restrita. É a escolhida.
--
-- security definer é o que permite ler `profiles` por baixo da RLS — por
-- isso a função é deliberadamente mínima: recebe uma lista de ids, devolve
-- duas colunas, e a PRIMEIRA coisa que faz é conferir can_read_member_area().
-- =====================================================================

create or replace function public.member_names(ids uuid[])
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name
  from public.profiles p
  where public.can_read_member_area()
    and p.id = any(ids);
$$;

-- Anônimo não chama isto de jeito nenhum.
revoke all on function public.member_names(uuid[]) from public, anon;
grant execute on function public.member_names(uuid[]) to authenticated;

-- =====================================================================
-- Fim da migration 0011.
-- =====================================================================
