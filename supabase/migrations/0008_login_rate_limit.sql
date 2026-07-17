-- =====================================================================
-- Sindipro SE — Rate limit de login/recuperação de senha (relatório de
-- segurança, item "Alta": força bruta sem bloqueio).
-- Migration 0008: tabela login_rate_limits. Sem policy nenhuma — só a
-- service role (server-only, nunca chega ao client) acessa esta tabela.
-- Rode UMA vez no SQL Editor do Supabase. Idempotente.
-- =====================================================================

create table if not exists public.login_rate_limits (
  key              text primary key,   -- ex.: "login:email:fulano@x.com", "login:ip:1.2.3.4"
  attempts         int not null default 0,
  first_attempt_at timestamptz not null default now(),
  locked_until     timestamptz,
  updated_at       timestamptz not null default now()
);

drop trigger if exists login_rate_limits_set_updated_at on public.login_rate_limits;
create trigger login_rate_limits_set_updated_at
  before update on public.login_rate_limits
  for each row execute function public.set_updated_at();

alter table public.login_rate_limits enable row level security;
-- Nenhuma policy: nem anon nem authenticated têm qualquer acesso. Só a
-- service role (bypassa RLS), usada exclusivamente em lib/auth/rate-limit.ts
-- (arquivo "server-only", nunca importável por um Client Component).

-- =====================================================================
-- Fim da migration 0008.
-- =====================================================================
