# SindiproSE

Site institucional do **SindiproSE** — Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.

Inclui o site público (notícias, arquivos CCT/ACT, diretoria, parceiros) e um painel da diretoria em `/painel-diretoria` para gerenciar esse conteúdo, ambos ligados ao mesmo projeto Supabase.

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
- Páginas institucionais (missão/visão/valores, diretoria, imprensa)
- Listagem e detalhe de notícias (`/noticias`, `/noticias/[slug]`)
- Downloads de convenções e acordos (`/arquivos` — CCT / ACT / outro)
- Página de parceiros (`/parceiros`)
- Navbar com dropdown “Sobre nós”, footer global e botão **Entrar** visível mas desabilitado (“em breve”)

### Painel da diretoria (`/painel-diretoria`)

Área utilitária, **não linkada** no site público, protegida por login Supabase + RLS.

| Área | Função |
| --- | --- |
| `/painel-diretoria/noticias` | Criar, editar, publicar/despublicar notícias (com capa e markdown) |
| `/painel-diretoria/arquivos` | Upload e gestão de PDFs (CCT/ACT) |
| `/painel-diretoria/diretoria` | Quadro de diretoria (executiva + conselho fiscal) |
| `/painel-diretoria/parceiros` | Logos e links de parceiros |

O painel é `noindex` e só aceita usuários autenticados que estejam na tabela `directors`.

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

> Não commite `.env` / `.env.local`. Eles já estão no `.gitignore`.

### 3. Banco, Storage e RLS

No **SQL Editor** do Supabase, rode as migrations em ordem (são idempotentes):

1. `supabase/migrations/0001_init_news_files_storage.sql` — `news`, `files`, buckets `news-images` e `downloads`, RLS
2. `supabase/migrations/0002_board_members.sql` — `board_members`, bucket `board-photos`
3. `supabase/migrations/0003_security_director_role.sql` — tabela `directors` + `is_director()` (escritas só para diretores)
4. `supabase/migrations/0004_news_audit_log.sql` — `post_logs` (auditoria de notícias)
5. `supabase/migrations/0005_partners.sql` — `partners`, bucket `partner-logos`

**Depois da migration 0003:** crie o usuário da diretoria no Auth do Supabase e insira o `user_id` em `public.directors`. Sem isso, o login funciona, mas o painel não consegue gravar dados.

### 4. Rodar

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Painel: [http://localhost:3000/painel-diretoria/login](http://localhost:3000/painel-diretoria/login)

```bash
npm run build   # build de produção
npm run start   # servir o build
npm run lint    # ESLint (Next)
```

---

## Estrutura do repositório

```
app/
  (site)/              # Site público (Navbar + Footer)
    page.tsx           # Home
    noticias/          # Listagem e [slug]
    arquivos/
    parceiros/
    sobre/             # missao-visao-valores, diretoria, imprensa, quem-somos
    styleguide/        # Referência visual interna
  painel-diretoria/
    login/             # Login da diretoria
    (dashboard)/       # Área autenticada (shell lateral)
  layout.tsx           # Root: fontes, metadata, lang=pt-BR
  globals.css
components/
  home/                # Seções da home
  painel/              # Formulários e UI do painel da diretoria
  *.tsx                # Navbar, Footer, cards, botões, etc.
lib/
  supabase/            # Clients SSR (server, client, middleware)
  news.ts | files.ts | board-members.ts | partners.ts
  markdown.ts          # Render + sanitização
  types.ts             # Tipos das tabelas
supabase/migrations/   # SQL versionado (rodar no painel Supabase)
public/img/            # Logo e imagens estáticas
middleware.ts          # Protege apenas /painel-diretoria/*
CLAUDE.md              # Contrato de design e produto
```

---

## Rotas principais

### Públicas

| Rota | Conteúdo |
| --- | --- |
| `/` | Home |
| `/sobre/missao-visao-valores` | Missão, visão e valores |
| `/sobre/quem-somos` | Quem somos |
| `/sobre/diretoria` | Quadro de diretoria (dados do Supabase) |
| `/sobre/imprensa` | Assessoria de imprensa |
| `/noticias` | Listagem de notícias publicadas |
| `/noticias/[slug]` | Notícia individual |
| `/arquivos` | Downloads CCT/ACT |
| `/parceiros` | Parceiros |

### Admin (protegidas)

| Rota | Conteúdo |
| --- | --- |
| `/painel-diretoria/login` | Login |
| `/painel-diretoria` | Início do painel |
| `/painel-diretoria/noticias` | CRUD de notícias |
| `/painel-diretoria/arquivos` | CRUD de arquivos |
| `/painel-diretoria/diretoria` | CRUD de membros |
| `/painel-diretoria/parceiros` | CRUD de parceiros |

---

## Modelo de dados (resumo)

| Tabela | Uso |
| --- | --- |
| `news` | Notícias (`draft` / `published`) |
| `files` | Arquivos CCT / ACT / outro |
| `board_members` | Diretoria (`executiva`, `conselho_titular`, `conselho_suplente`) |
| `partners` | Parceiros (logo + link) |
| `directors` | Allowlist de quem pode escrever no painel |
| `post_logs` | Auditoria de ações em notícias |

**Buckets:** `news-images`, `downloads`, `board-photos`, `partner-logos` (leitura pública; escrita autenticada / diretor conforme RLS).

**RLS (ideia geral):** o público só lê o que está publicado (ou listas públicas como diretoria/parceiros). Insert/update/delete ficam restritos a usuários em `directors`.

---

## Segurança

- Middleware Next só em `/painel-diretoria/*`: renova sessão e redireciona sem login
- Chave secret nunca no client
- Uploads vão para o Supabase Storage (não para o filesystem do Next em produção)
- Markdown sanitizado antes de renderizar
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

Previsto no contrato, mas ainda só como extensão/placeholder:

- Login e área do **associado** (PDFs por pasta: arquivos, atas, editais, comunicados)
- Fluxo completo de associação / newsletter
- Domínio de produção a confirmar no metadata (`app/layout.tsx`)

---

## Contato da marca

- Instagram: [@sindiprose](https://www.instagram.com/sindiprose/)

---

## Licença

Projeto privado (`"private": true` no `package.json`). Uso restrito ao cliente SindiproSE.
