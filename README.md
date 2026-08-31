# SindiproSE

Site institucional do **SindiproSE** — Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.

Inclui três frentes, todas no mesmo projeto Supabase:

- **Site público** — notícias, arquivos CCT/ACT, diretoria, parceiros.
- **Painel da diretoria** (`/painel-diretoria`) — gestão de conteúdo do site + da área restrita.
- **Área do associado** (`/area`) — área logada com feed de comunicados e documentos privados.

Contrato de design e regras de implementação: [`CLAUDE.md`](./CLAUDE.md).

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS + tokens do projeto |
| Animação | Framer Motion (uso contido) |
| Ícones | Lucide |
| Backend / Auth / Storage | Supabase (`@supabase/ssr`) |
| Conteúdo rico | Markdown (`marked`) + sanitização (`sanitize-html` / DOMPurify) |

---

## O que o projeto faz

### Site público

- Home com hero, últimas notícias, bloco institucional e CTA de associação
- Páginas institucionais (missão/visão/valores, diretoria, imprensa, quem somos)
- Listagem e detalhe de notícias (`/noticias`, `/noticias/[slug]`)
- Downloads de convenções e acordos (`/arquivos` — CCT / ACT / outro)
- Página de parceiros (`/parceiros`)
- Landing do evento **Conecte-se 2026** (`/conecte-se-2026`, tema próprio, fora da moldura do site)
- Navbar com dropdown "Sobre nós", footer global e botão **Entrar** (leva ao login do associado)

### Painel da diretoria (`/painel-diretoria`)

Área utilitária, **não linkada** no site público, protegida por login Supabase + papel `diretoria` + RLS.

| Rota | Função |
| --- | --- |
| `/painel-diretoria/noticias` | Criar, editar, publicar/despublicar notícias (capa + markdown) |
| `/painel-diretoria/arquivos` | Upload e gestão de PDFs públicos (CCT/ACT) |
| `/painel-diretoria/diretoria` | Quadro de diretoria (executiva + conselho fiscal) |
| `/painel-diretoria/parceiros` | Logos e links de parceiros |
| `/painel-diretoria/comunicados` | Feed da área restrita (criar/editar/publicar, moderar comentários) |
| `/painel-diretoria/provedores` | CRUD de provedores associados |
| `/painel-diretoria/associados` | Criar e gerenciar contas de associado (Supabase Auth) |
| `/painel-diretoria/arquivos-associado` | Upload de PDFs privados (pastas: arquivos, atas, editais) |

O painel é `noindex` e só aceita usuários com papel `diretoria` (em `app_metadata`).

### Área do associado (`/area`)

Área logada com a identidade do site (navbar/footer), protegida por login + papel `associado` (ou `diretoria`) + perfil **ativo**.

| Rota | Função |
| --- | --- |
| `/entrar` | Login do associado (com "esqueci minha senha") |
| `/area` | Feed de comunicados (curtir/comentar) + documentos por pasta |
| `/area/[pasta]` | Lista de PDFs da pasta (arquivos, atas, editais) |
| `/area/[pasta]/[id]` | Visualização do PDF na tela (URL assinada de curta duração) |
| `/area/conta` | Trocar a própria senha |

Comunicados são um **feed** (posts com curtida e comentário), não pasta de PDF. Comentário é renderizado como texto puro (nunca HTML). A área é `noindex`.

---

## Papéis e autorização

- Dois papéis: `diretoria` e `associado`, gravados em **`app_metadata`** do usuário (editável só no servidor com a chave secret — nunca em `user_metadata`).
- Toda checagem de papel acontece no **servidor** (middleware + layouts) e na **RLS** (`auth.jwt() -> app_metadata ->> 'role'`). Esconder na UI não é autorização.
- **Sem cadastro público**: as contas (diretoria e associado) são criadas manualmente — associados pelo painel, diretoria no Supabase.
- Associado **inativo** perde o acesso mesmo com a conta existindo.

---

## Pré-requisitos

- Node.js 18+ (recomendado 20+)
- Conta e projeto no [Supabase](https://supabase.com)
- npm

---

## Configuração local

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Copie o exemplo e preencha com as chaves do projeto Supabase (**Project Settings → API**):

```bash
cp .env.local.example .env.local
```

| Variável | Onde usar | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | URL do projeto (`https://….supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + server | Chave publishable (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | Somente servidor | Chave secret (`sb_secret_…`) — **nunca** no browser nem no Git |
| `NEXT_PUBLIC_GA_ID` | Client | ID do Google Analytics (opcional; sem valor, o script não é injetado) |

> Não commite `.env` / `.env.local`. Eles já estão no `.gitignore`.

### 3. Banco, Storage e RLS

No **SQL Editor** do Supabase, rode as migrations em ordem (são idempotentes):

1. `0001_init_news_files_storage.sql` — `news`, `files`, buckets `news-images` e `downloads`, RLS
2. `0002_board_members.sql` — `board_members`, bucket `board-photos`
3. `0003_security_director_role.sql` — tabela `directors` + `is_director()` (escritas só para diretores)
4. `0004_news_audit_log.sql` — `post_logs` (auditoria de notícias)
5. `0005_partners.sql` — `partners`, bucket `partner-logos`
6. `0006_member_auth_foundation.sql` — `profiles` + fundação de autorização por papel (associado)
7. `0007_member_files_storage.sql` — `member_files`, bucket privado `member-files`
8. `0008_login_rate_limit.sql` — `login_rate_limits` (rate limit de login)
9. `0009_providers.sql` — `providers` + `profiles.provider_id`
10. `0010_comunicados_feed.sql` — `comunicados`, `comunicado_likes`, `comunicado_comments`, bucket privado `comunicado-images`
11. `0011_member_names.sql` — função `member_names()` (nomes dos autores no feed, sem abrir a RLS de `profiles`)

**Contas:**
- **Diretoria:** crie o usuário no Auth do Supabase, defina `app_metadata.role = 'diretoria'` e (para escrever conteúdo) insira o `user_id` em `public.directors`.
- **Associado:** crie pelo painel em `/painel-diretoria/associados` (define papel e perfil ativo).

### 4. Rodar

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Painel: [http://localhost:3000/painel-diretoria/login](http://localhost:3000/painel-diretoria/login)
- Área do associado: [http://localhost:3000/entrar](http://localhost:3000/entrar)

```bash
npm run build   # build de produção
npm run start   # servir o build
npm run lint    # ESLint (Next)
```

---

## Estrutura do repositório

```
app/
  (site)/              # Site público + área do associado (Navbar + Footer)
    page.tsx           # Home
    noticias/          # Listagem e [slug]
    arquivos/
    parceiros/
    sobre/             # missao-visao-valores, diretoria, imprensa, quem-somos
    entrar/            # Login do associado
    redefinir-senha/   # Fluxo de recuperação de senha
    area/              # Área logada (feed, pastas de PDF, conta)
  painel-diretoria/
    login/             # Login da diretoria
    (dashboard)/       # Área autenticada (shell lateral)
  conecte-se-2026/     # Landing do evento (tema próprio)
  auth/callback/       # Callback de auth (recuperação de senha)
  layout.tsx           # Root: fontes, metadata, lang=pt-BR
  globals.css
components/
  home/                # Seções da home
  painel/              # Formulários e UI do painel da diretoria
  area/                # UI da área do associado (feed)
  auth/                # Guards de sessão (inatividade)
  *.tsx                # Navbar, Footer, cards, botões, etc.
lib/
  supabase/            # Clients SSR (server, client, middleware, admin)
  auth/                # Papel, rate limit, timeout de inatividade, redirects seguros
  validation/          # Schemas (zod) das server actions
  comunicados-*.ts     # Feed, acesso e admin dos comunicados
  member-files*.ts     # Arquivos privados do associado
  providers.ts | news.ts | files.ts | board-members.ts | partners.ts
  types.ts             # Tipos das tabelas
supabase/migrations/   # SQL versionado (rodar no painel Supabase)
public/img/            # Logo e imagens estáticas
middleware.ts          # Protege /painel-diretoria/*, /area/* e trata /entrar
CLAUDE.md              # Contrato de design e produto
```

---

## Modelo de dados (resumo)

| Tabela | Uso |
| --- | --- |
| `news` | Notícias (`draft` / `published`) |
| `files` | Arquivos públicos CCT / ACT / outro |
| `board_members` | Diretoria (`executiva`, `conselho_titular`, `conselho_suplente`) |
| `partners` | Parceiros (logo + link) |
| `directors` | Allowlist de quem pode escrever no painel |
| `post_logs` | Auditoria de ações em notícias |
| `profiles` | Dados do associado (nome, provedor, status ativo/inativo) |
| `providers` | Provedores associados |
| `member_files` | PDFs privados por pasta (arquivos, atas, editais) |
| `comunicados` | Posts do feed da área restrita (`rascunho` / `publicado`) |
| `comunicado_likes` | Curtidas (uma por pessoa) |
| `comunicado_comments` | Comentários (texto puro) |
| `login_rate_limits` | Controle de tentativas de login |

**Buckets:**
- Públicos: `news-images`, `downloads`, `board-photos`, `partner-logos`
- Privados: `member-files`, `comunicado-images` (acesso só via URL assinada gerada no servidor)

**RLS (ideia geral):** o público só lê o que está publicado (ou listas públicas como diretoria/parceiros). Conteúdo da área restrita só é lido por associado ativo ou diretoria. Insert/update/delete ficam restritos à diretoria; curtidas/comentários só em nome próprio (`user_id = auth.uid()`).

---

## Segurança

- Middleware Next em `/painel-diretoria/*`, `/area/*` e `/entrar`: renova sessão, bloqueia acesso sem login/papel/perfil ativo e cuida da troca de conta entre as duas áreas
- Papel em `app_metadata` (server-only); nunca confiar em UI ou `user_metadata`
- Chave secret nunca no client; URLs assinadas de curta duração geradas só no servidor
- Rate limit no login e logout automático por inatividade
- Uploads vão para o Supabase Storage (não para o filesystem do Next em produção)
- Markdown sanitizado antes de renderizar; comentários do feed sempre como texto puro
- Headers de segurança (CSP, HSTS, `X-Frame-Options`, etc.) em `next.config.mjs`

---

## Design

Identidade institucional em pt-BR: tom de sindicato patronal (sério, representativo — sem copy de SaaS/growth).

- Tipografia: Fraunces (títulos) + IBM Plex Sans (corpo); Inter em partes do redesign visual
- Cores: tokens navy / gold do `CLAUDE.md`, com `brand` e `cream` no visual atual da home/painel
- Elemento-assinatura: traço dourado (pena/asa) do logotipo
- Detalhes e proibições de UI: ver seções 3–12 do [`CLAUDE.md`](./CLAUDE.md)

---

## Futuro (não construído)

- Foto de perfil do associado (upload)
- Domínio de produção a confirmar no metadata (`app/layout.tsx`)

---

## Contato da marca

- Instagram: [@sindiprose](https://www.instagram.com/sindiprose/)

---

## Licença

Projeto privado (`"private": true` no `package.json`). Uso restrito ao cliente SindiproSE.
