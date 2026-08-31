-- =====================================================================
-- Sindipro SE — Comunicados vira FEED (CLAUDE.md §16)
-- Migration 0010: tabelas comunicados / comunicado_likes /
-- comunicado_comments, bucket PRIVADO comunicado-images, RLS, e a remoção
-- de 'comunicados' do enum de pastas de member_files.
-- Rode UMA vez no SQL Editor do Supabase. Idempotente (pode reexecutar).
--
-- Depende de: 0006 (profiles, is_director/is_associado) e
--             0007 (is_active_associado, member_files).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Helper: quem pode LER a área restrita.
--    Diretoria (sempre) ou associado com perfil ativo. É o mesmo critério
--    do SELECT de member_files (0007), extraído para não repetir a
--    expressão em seis policies diferentes.
--
--    Associado INATIVO cai fora aqui: is_active_associado() confere
--    profiles.status. Papel indefinido também — padrão restritivo (§15).
-- ---------------------------------------------------------------------
create or replace function public.can_read_member_area()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.is_director() or public.is_active_associado();
$$;

-- ---------------------------------------------------------------------
-- 2) Tabela COMUNICADOS (os posts do feed)
--    title é OPCIONAL (§16): um comunicado pode ser só um texto curto.
--    body tem limite de tamanho no BANCO — a validação do formulário é
--    conveniência; esta é a que ninguém pula.
-- ---------------------------------------------------------------------
create table if not exists public.comunicados (
  id           uuid primary key default gen_random_uuid(),
  title        text
                 check (title is null or char_length(title) <= 200),
  body         text not null
                 check (char_length(body) between 1 and 10000),
  image_path   text,                            -- caminho no bucket privado
  author_id    uuid references auth.users (id) on delete set null,
  status       text not null default 'rascunho'
                 check (status in ('rascunho', 'publicado')),
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- O feed lê sempre "publicados, mais recente primeiro".
create index if not exists comunicados_status_published_at_idx
  on public.comunicados (status, published_at desc);

drop trigger if exists comunicados_set_updated_at on public.comunicados;
create trigger comunicados_set_updated_at
  before update on public.comunicados
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3) Tabela COMUNICADO_LIKES
--    UNIQUE (comunicado_id, user_id): uma curtida por pessoa, garantida
--    pelo banco. Sem isso, dois cliques simultâneos criariam duas linhas.
--    on delete cascade nos dois lados: apagar o post ou a conta leva as
--    curtidas junto (não deixa órfã e atende exclusão de dados/LGPD).
-- ---------------------------------------------------------------------
create table if not exists public.comunicado_likes (
  id            uuid primary key default gen_random_uuid(),
  comunicado_id uuid not null references public.comunicados (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  constraint comunicado_likes_unique unique (comunicado_id, user_id)
);

create index if not exists comunicado_likes_comunicado_idx
  on public.comunicado_likes (comunicado_id);

-- ---------------------------------------------------------------------
-- 4) Tabela COMUNICADO_COMMENTS
--    body é TEXTO PURO (§16) — quem renderiza nunca interpreta HTML nem
--    markdown. O limite de tamanho fica no banco, como no post.
-- ---------------------------------------------------------------------
create table if not exists public.comunicado_comments (
  id            uuid primary key default gen_random_uuid(),
  comunicado_id uuid not null references public.comunicados (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  body          text not null
                  check (char_length(btrim(body)) between 1 and 1500),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists comunicado_comments_comunicado_created_at_idx
  on public.comunicado_comments (comunicado_id, created_at);

drop trigger if exists comunicado_comments_set_updated_at on public.comunicado_comments;
create trigger comunicado_comments_set_updated_at
  before update on public.comunicado_comments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5) RLS — COMUNICADOS
--    Leitura: diretoria vê tudo (inclusive rascunho); associado ativo vê
--    só o que está publicado. Escrita: só diretoria (é ela que publica,
--    despublica e apaga — a moderação do §16).
--    Nada para anon: o feed é da área restrita.
-- ---------------------------------------------------------------------
alter table public.comunicados enable row level security;

drop policy if exists comunicados_select on public.comunicados;
create policy comunicados_select
  on public.comunicados for select
  to authenticated
  using (
    public.is_director()
    or (public.is_active_associado() and status = 'publicado')
  );

drop policy if exists comunicados_insert_director on public.comunicados;
create policy comunicados_insert_director
  on public.comunicados for insert
  to authenticated
  with check (public.is_director());

drop policy if exists comunicados_update_director on public.comunicados;
create policy comunicados_update_director
  on public.comunicados for update
  to authenticated
  using (public.is_director())
  with check (public.is_director());

drop policy if exists comunicados_delete_director on public.comunicados;
create policy comunicados_delete_director
  on public.comunicados for delete
  to authenticated
  using (public.is_director());

-- ---------------------------------------------------------------------
-- 6) RLS — COMUNICADO_LIKES
--
--    REGRA CRÍTICA (§16): ninguém curte em nome de outro. O INSERT exige
--    user_id = auth.uid(), então mandar o id de outra pessoa no payload
--    não adianta — a policy recusa. E só dá para curtir post que a pessoa
--    enxerga: o EXISTS abaixo roda sob a RLS de `comunicados`, ou seja,
--    um associado não alcança rascunho nem por id adivinhado.
--
--    DELETE: a própria pessoa (descurtir) ou a diretoria (moderação).
--    Não existe UPDATE: curtida não se edita, se cria e se apaga.
-- ---------------------------------------------------------------------
alter table public.comunicado_likes enable row level security;

drop policy if exists comunicado_likes_select on public.comunicado_likes;
create policy comunicado_likes_select
  on public.comunicado_likes for select
  to authenticated
  using (public.can_read_member_area());

drop policy if exists comunicado_likes_insert_own on public.comunicado_likes;
create policy comunicado_likes_insert_own
  on public.comunicado_likes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_read_member_area()
    and exists (
      select 1 from public.comunicados c
      where c.id = comunicado_id and c.status = 'publicado'
    )
  );

drop policy if exists comunicado_likes_delete_own_or_director on public.comunicado_likes;
create policy comunicado_likes_delete_own_or_director
  on public.comunicado_likes for delete
  to authenticated
  using (user_id = auth.uid() or public.is_director());

-- ---------------------------------------------------------------------
-- 7) RLS — COMUNICADO_COMMENTS
--
--    Mesma regra de nome próprio no INSERT. O mural é COMPARTILHADO: todo
--    associado ativo lê os comentários de todo mundo (§16 manda deixar
--    isso claro na interface — a policy é permissiva de propósito).
--
--    UPDATE: só o autor, e o WITH CHECK repete user_id = auth.uid() para
--    que ninguém edite um comentário e o transfira para outra pessoa.
--    DELETE: autor ou diretoria (moderação).
-- ---------------------------------------------------------------------
alter table public.comunicado_comments enable row level security;

drop policy if exists comunicado_comments_select on public.comunicado_comments;
create policy comunicado_comments_select
  on public.comunicado_comments for select
  to authenticated
  using (public.can_read_member_area());

drop policy if exists comunicado_comments_insert_own on public.comunicado_comments;
create policy comunicado_comments_insert_own
  on public.comunicado_comments for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_read_member_area()
    and exists (
      select 1 from public.comunicados c
      where c.id = comunicado_id and c.status = 'publicado'
    )
  );

drop policy if exists comunicado_comments_update_own on public.comunicado_comments;
create policy comunicado_comments_update_own
  on public.comunicado_comments for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists comunicado_comments_delete_own_or_director on public.comunicado_comments;
create policy comunicado_comments_delete_own_or_director
  on public.comunicado_comments for delete
  to authenticated
  using (user_id = auth.uid() or public.is_director());

-- ---------------------------------------------------------------------
-- 8) Storage bucket comunicado-images — PRIVADO
--    Escolhido privado (e não "público com caminho por UUID", a
--    simplificação que o §16 permitia): o feed é conteúdo da área
--    restrita, e um bucket público deixaria a imagem acessível a quem
--    tivesse a URL mesmo depois do associado ser inativado. Mesmo padrão
--    do member-files: leitura só por URL assinada gerada no servidor.
--    Imagem até 5 MB, só JPEG/PNG/WebP — reforçado no bucket, não só no
--    formulário.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comunicado-images', 'comunicado-images', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- ---------------------------------------------------------------------
-- 9) Storage policies — comunicado-images
--    SEM policy de select, de propósito: nenhuma leitura via RLS, nem
--    para a diretoria. Toda leitura passa por URL assinada de 60s criada
--    no servidor com a chave secreta, depois de validar sessão/papel —
--    igual ao member-files (0007). Escrita: só diretoria.
-- ---------------------------------------------------------------------
drop policy if exists comunicado_images_insert on storage.objects;
create policy comunicado_images_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'comunicado-images' and public.is_director());

drop policy if exists comunicado_images_delete on storage.objects;
create policy comunicado_images_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'comunicado-images' and public.is_director());

-- ---------------------------------------------------------------------
-- 10) MEMBER_FILES — 'comunicados' sai do enum de pastas
--     Agora só: arquivos, atas, editais (§16).
--
--     TRAVA DE SEGURANÇA: se ainda houver PDF cadastrado na pasta antiga,
--     esta migration ABORTA com uma mensagem em vez de apagar ou mover
--     dado sozinha. Veja no fim do arquivo as duas saídas (migrar ou
--     descartar) e rode a que você escolher ANTES de reexecutar.
-- ---------------------------------------------------------------------
do $$
declare
  restantes int;
begin
  select count(*) into restantes
  from public.member_files where folder = 'comunicados';

  if restantes > 0 then
    raise exception
      'Ainda existem % arquivo(s) em member_files com folder = ''comunicados''. '
      'Escolha migrar ou descartar (ver instruções no fim da migration 0010) '
      'e rode este arquivo de novo.', restantes;
  end if;
end $$;

alter table public.member_files
  drop constraint if exists member_files_folder_check;

alter table public.member_files
  add constraint member_files_folder_check
  check (folder in ('arquivos', 'atas', 'editais'));

-- =====================================================================
-- SE A TRAVA DO PASSO 10 DISPARAR — escolha UMA das saídas.
--
-- Primeiro, veja o que existe:
--
--   select id, title, storage_path, created_at
--   from public.member_files where folder = 'comunicados'
--   order by created_at;
--
-- ---------------------------------------------------------------------
-- SAÍDA A — MIGRAR para outra pasta (recomendada; não perde nada).
--   O PDF continua sendo um documento; só muda de gaveta. 'arquivos' é o
--   destino natural. O storage_path começa com "comunicados/", mas isso é
--   só o nome do objeto no bucket — não precisa mexer nele, nada lê a
--   pasta a partir do caminho.
--
--   update public.member_files
--   set folder = 'arquivos'
--   where folder = 'comunicados';
--
-- ---------------------------------------------------------------------
-- SAÍDA B — DESCARTAR (só se o conteúdo virou post do novo feed).
--   Apaga a linha de metadados. ATENÇÃO: isto NÃO apaga o PDF do bucket
--   member-files — o objeto ficaria órfão, ocupando espaço e sem tela que
--   o alcance. Antes de rodar, anote os storage_path da consulta acima e
--   apague os objetos em Storage > member-files no painel do Supabase.
--
--   delete from public.member_files where folder = 'comunicados';
--
-- Depois de A ou B, rode a migration 0010 de novo (é idempotente).
-- =====================================================================
