# Fase 2 — Área do associado: fundação de autorização

> Status: só a fundação de autorização foi construída (SQL + helpers de
> servidor + proteção de rota). Nenhuma tela nova foi criada ainda
> (login do associado, `/area/*`, `member_files`, gestão de associados no
> painel). Ver "Próximos passos" no fim.

Referência: CLAUDE.md §15.

---

## O que foi feito

1. **Migration SQL** — `supabase/migrations/0006_member_auth_foundation.sql`
   - Tabela `profiles` (dados do associado) com RLS.
   - Papel do usuário passa a viver em `app_metadata` (`'diretoria' |
     'associado'`), lido via `auth.jwt() -> 'app_metadata' ->> 'role'`.
   - `public.is_director()` foi **redefinida** para usar esse novo critério
     (antes lia a tabela `public.directors`, criada na migration 0003).
     Mesma assinatura, então todas as policies que já chamam
     `is_director()` (news, files, board_members, storage) passam a valer
     pelo novo critério automaticamente — não precisei tocar nelas.
   - Nova função `public.is_associado()`.
   - A tabela `public.directors` **não foi apagada**, só deixou de ser lida.
     Pode ser removida depois que você validar o fluxo novo (`drop table
     public.directors;`), não é urgente.

2. **Papel no servidor** — `lib/auth/role.ts`
   - `AppRole = "diretoria" | "associado"`.
   - `roleFromUser(user)` — função pura, lê `user.app_metadata.role`.
   - `getSessionRole()` / `isDirectorSession()` — chamam
     `supabase.auth.getUser()` (revalida o token no Auth server; não
     decodifica JWT local).

3. **Tipo** — `lib/types.ts`: adicionado `ProfileRow` (linha da tabela
   `profiles`).

4. **Proteção de `/painel-diretoria` atualizada para exigir papel**
   - `lib/supabase/middleware.ts`: além de exigir sessão, agora exige
     `roleFromUser(user) === "diretoria"`. Quem tem sessão mas não é
     diretoria é redirecionado para `/` (não para `/login`, para não
     entrar em loop com o redirect que a própria página de login já faz
     para usuário autenticado).
   - `app/painel-diretoria/(dashboard)/layout.tsx`: mesma checagem de papel
     como defesa em profundidade (além do middleware).

### Por que o papel nunca fica em `user_metadata`

`user_metadata` é editável pelo próprio usuário via
`supabase.auth.updateUser()` no client — qualquer associado logado
poderia se autopromover a diretoria. `app_metadata` só é gravável pelo
servidor (chave secreta / SQL direto), nunca pelo client.

---

## Como aplicar — ORDEM IMPORTA (evita se trancar fora do painel)

O ponto crítico: `is_director()` deixa de olhar a tabela `directors` e
passa a olhar o `app_metadata` dentro do **token JWT já emitido** da sua
sessão. Se você rodar a migration sem preparar sua própria conta, perde
acesso de escrita no painel (INSERT/UPDATE de notícias, arquivos etc.)
até corrigir.

**Siga esta ordem:**

### 1. Antes de rodar a migration, defina seu papel de diretoria

No **SQL Editor do Supabase**, rode (trocando o e-mail):

```sql
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'diretoria')
where email = 'seu-email@dominio.com';
```

Repita para cada conta de diretoria que já existe hoje.

> Isso funciona mesmo antes da migration 0006 rodar — é só um UPDATE na
> tabela `auth.users`, que já existe.

### 2. Rode a migration

Cole o conteúdo de `supabase/migrations/0006_member_auth_foundation.sql`
no SQL Editor do Supabase e execute. É idempotente (pode rodar de novo
sem quebrar nada).

### 3. Faça logout e login de novo na sua conta

Isso é obrigatório, não opcional. Motivo:

- A proteção de **rota** (`getUser()` no middleware/layout) já reflete o
  `app_metadata` atualizado na hora — consulta o Auth server, não o token
  local.
- Mas as **policies de RLS** (`auth.jwt() -> 'app_metadata' ->> 'role'`)
  leem o que está *dentro do token já emitido*. Sem logout/login para
  reemitir o token, você continua vendo o painel, mas qualquer
  INSERT/UPDATE (criar notícia, subir arquivo, editar diretoria) vai
  falhar silenciosamente pela RLS até o token ser renovado.

### 4. Teste

- Acesse `/painel-diretoria` — deve entrar normalmente.
- Crie/edite algo (ex.: uma notícia em rascunho) para confirmar que a
  escrita via RLS também está liberada.

---

## Arquivos alterados/criados nesta entrega

```
supabase/migrations/0006_member_auth_foundation.sql   (novo)
lib/auth/role.ts                                        (novo)
lib/types.ts                                             (+ProfileRow)
lib/supabase/middleware.ts                               (+checagem de papel)
app/painel-diretoria/(dashboard)/layout.tsx               (+checagem de papel)
```

---

## Próximos passos (não construídos ainda — CLAUDE.md §15)

- Bucket privado `member-files` + tabela `member_files` + RLS.
- Rotas `/entrar`, `/area`, `/area/[pasta]`, `/area/[pasta]/[id]`,
  `/area/conta`.
- `/painel-diretoria/associados` (diretoria cria/gerencia contas de
  associado — é aqui que o `app_metadata.role = 'associado'` passa a ser
  setado por código, via Admin API com a chave secreta, em vez de SQL
  manual).
- `/painel-diretoria/arquivos-associado` (upload de arquivos da área
  logada, com URL assinada de curta duração gerada no servidor).
- Ativar o botão "Entrar" da navbar (hoje desabilitado).
