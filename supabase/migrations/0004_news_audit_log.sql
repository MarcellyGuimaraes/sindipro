-- =====================================================================
-- Sindipro SE — Auditoria de notícias (autor + logs do post)
-- Migration 0004: registra QUEM criou/editou/publicou/excluiu cada notícia
-- e QUANDO, via trigger automático (não depende do client — não dá pra burlar).
-- Rode UMA vez no SQL Editor do Supabase. Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabela de logs do post
--    Sem FK para news: o log deve sobreviver à exclusão da notícia
--    (auditoria). Por isso guardamos slug/título desnormalizados.
-- ---------------------------------------------------------------------
create table if not exists public.post_logs (
  id          uuid primary key default gen_random_uuid(),
  news_id     uuid,
  news_slug   text,
  news_title  text,
  action      text not null
                check (action in
                  ('created', 'updated', 'published', 'unpublished', 'deleted')),
  actor_id    uuid,
  actor_email text,
  created_at  timestamptz not null default now()
);

create index if not exists post_logs_news_id_created_at_idx
  on public.post_logs (news_id, created_at desc);

-- ---------------------------------------------------------------------
-- 2) Função de auditoria — roda como SECURITY DEFINER para conseguir
--    inserir no log mesmo com RLS ligado, e para ler o e-mail em auth.users.
-- ---------------------------------------------------------------------
create or replace function public.log_news_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_email  text;
begin
  if (tg_op = 'INSERT') then
    v_action := case when new.status = 'published' then 'published' else 'created' end;
  elsif (tg_op = 'UPDATE') then
    v_action := case
      when old.status <> 'published' and new.status = 'published' then 'published'
      when old.status = 'published' and new.status <> 'published' then 'unpublished'
      else 'updated'
    end;
  else
    v_action := 'deleted';
  end if;

  select u.email into v_email from auth.users u where u.id = auth.uid();

  insert into public.post_logs
    (news_id, news_slug, news_title, action, actor_id, actor_email)
  values (
    coalesce(new.id, old.id),
    coalesce(new.slug, old.slug),
    coalesce(new.title, old.title),
    v_action,
    auth.uid(),
    v_email
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists news_audit_log on public.news;
create trigger news_audit_log
  after insert or update or delete on public.news
  for each row execute function public.log_news_change();

-- ---------------------------------------------------------------------
-- 3) RLS — só a diretoria autenticada LÊ os logs.
--    Ninguém escreve direto: só o trigger (SECURITY DEFINER) insere.
-- ---------------------------------------------------------------------
alter table public.post_logs enable row level security;

drop policy if exists post_logs_select_director on public.post_logs;
create policy post_logs_select_director
  on public.post_logs for select
  to authenticated
  using (public.is_director());

-- =====================================================================
-- Fim da migration 0004.
-- A partir daqui, todo create/update/publish/delete de notícia fica
-- registrado em public.post_logs (quem, qual ação e quando).
-- O autor da notícia continua em public.news.author_id (default auth.uid()).
-- =====================================================================
