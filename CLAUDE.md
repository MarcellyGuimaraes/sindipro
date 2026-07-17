# CLAUDE.md — Site institucional Sindipro SE

> Este arquivo é o contrato de design e implementação do projeto. Leia-o por
> completo antes de escrever qualquer componente. Toda cor, fonte, espaçamento e
> texto vem **daqui** — não invente defaults. Quando uma decisão não estiver
> coberta, pergunte antes de assumir.

---

## 1. O que é o projeto

Site institucional do **Sindipro SE — Sindicato dos Provedores de Internet e
Serviço de Comunicação Multimídia do Estado de Sergipe**.

- **Público:** provedores de internet de Sergipe (associados e potenciais
  associados), além da imprensa e do público em geral que busca informação
  sobre o setor.
- **Tom institucional:** sindicato patronal — sério, estabelecido, confiável,
  representativo. **Não** é uma startup, **não** é um produto SaaS. Nada de
  linguagem de growth ("potencialize", "leve ao próximo nível"), nada de pricing,
  nada de "trial grátis".
- **Trabalho da página inicial:** transmitir representatividade e confiança em
  3 segundos, e dar caminho rápido para notícias, arquivos (CCT/ACT) e contato.
- **Idioma:** todo o conteúdo em **pt-BR**. `<html lang="pt-BR">`.

---

## 2. Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (com os tokens da seção 4 mapeados no `tailwind.config`)
- **Framer Motion** — uso **contido** (ver seção 7)
- **next/font** para carregar as fontes (sem `@import` solto; otimize)
- **next/image** para todas as imagens (lazy por padrão)

Bibliotecas de componente (ex.: 21st.dev) são permitidas **apenas como andaime**:
copie a estrutura, mas **re-skinize 100% nos nossos tokens** — remova
border-radius exagerado, sombras decorativas, gradientes e cores default antes de
integrar. Nada de componente "como veio".

> **Funcionalidades futuras** (login do associado, área logada com PDFs, painel
> da diretoria para postar notícias/arquivos e gerenciar acessos) exigem backend,
> banco, autenticação e storage de arquivos. **Não construa isso agora.** Apenas
> deixe a arquitetura de pastas e os pontos de extensão preparados (rotas e
> placeholders comentados). Ver seção 6.

---

## 3. Princípios de design — fugir do "cara de IA"

Esta seção complementa a skill pública `frontend-design` (use-a). Regras
inegociáveis:

1. **Cores só vêm dos tokens da seção 4.** Nunca um hex aleatório, nunca cor
   default do Tailwind (sem `bg-blue-500`, `bg-indigo-600` etc.).
2. **Sem gradiente** em hero, em fundo ou em botão. Superfícies chapadas.
3. **Sem "blobs" / mesh / formas coloridas flutuando** no fundo.
4. **Sem emoji** em títulos, botões ou bullets. Ícones: biblioteca de ícone de
   linha consistente (ex.: Lucide), monocromáticos, no tom do texto.
5. **Proibido o grid simétrico de 3 cards "ícone + título + dois parágrafos
   cinza".** É o padrão mais denunciável de todos.
6. **Nada centralizado por padrão.** Hero e seções alinhados à esquerda, com
   hierarquia e assimetria intencionais. Centralizar só quando houver motivo.
7. **Contenção em raio e sombra.** Cantos discretos (4–8px), sombra só quando
   funcional (foco, elevação real de um card). Nada de visual "bolha".
8. **Tipografia com personalidade** (seção 5). Nada de Inter no default sem
   intenção.
9. **Copy concreta** (seção 9). Texto vago é tão template quanto layout template.
10. **Evite também os outros defaults de IA:** fundo creme com serifa grande +
    acento terracota; fundo quase-preto com um acento neon; e o "jornalão" com
    fios capilares, raio zero e colunas densas. Não somos nenhum desses.

**Elemento-assinatura (a única ousadia):** o **traço dourado em forma de pena/asa**
do logotipo. Use-o como motivo recorrente e memorável — divisor entre seções,
sublinhado/realce de títulos-chave, e acento de canto. É o que faz o site parecer
desenhado *para a Sindipro*. Tudo ao redor dele fica quieto e disciplinado.

---

## 4. Design tokens (cor)

Paleta oficial fechada. Cada cor tem **um papel** — não use as 10 em todo lugar.
O azul-marinho domina; o dourado é tempero (só detalhe, nunca área grande).

```css
:root {
  /* base / fundo */
  --bg:            #f4f4f4;  /* fundo geral (off-white) */
  --surface:       #ffffff;  /* cards, superfícies elevadas */

  /* azuis institucionais — cor dominante */
  --navy-900:      #1c4464;  /* títulos, footer, seções escuras */
  --navy-700:      #0e518c;  /* primária: links, botão principal, marca */
  --blue-400:      #74a4c4;  /* elementos secundários, ícones, bordas fortes */
  --blue-350:      #7d9cb9;  /* secundário */
  --blue-300:      #97b8d1;  /* secundário claro */
  --blue-200:      #b5ccdd;  /* bordas suaves, divisores */
  --blue-100:      #c3dcec;  /* fundo claro de seção, tints */

  /* dourado — SÓ acento */
  --gold-600:      #ab8221;  /* a pena, sublinhados, destaque pequeno */
  --gold-200:      #dcc99e;  /* hover sutil, fundo de badge dourado */
}
```

**Regras de cor:**
- Texto padrão: `--navy-900` sobre fundos claros; `--bg`/`#ffffff` sobre fundos
  escuros (`--navy-900`).
- Botão primário: fundo `--navy-700`, texto branco; hover escurece p/ `--navy-900`.
- Botão secundário: contorno `--navy-700`, texto `--navy-700`, fundo transparente.
- O dourado **nunca** preenche um bloco grande. Só fios, sublinhados, ícones de
  destaque e o motivo da pena.
- Contraste sempre AA (texto sobre fundo). Cheque os azuis claros.

Mapeie tudo isso no `tailwind.config.js` (`theme.extend.colors`) com os mesmos
nomes (`navy-700`, `gold-600` etc.) para usar como classes Tailwind.

---

## 5. Tipografia

Pareamento deliberado (carregar via `next/font/google`):

- **Display / títulos:** `Fraunces` — serifa com caráter, transmite instituição
  estabelecida. Use com peso 500–600, em escala generosa. É parte da identidade,
  não veículo neutro.
- **Corpo / UI:** `IBM Plex Sans` — sans profissional, levemente técnica (combina
  com o setor de telecom/internet). Pesos 400 e 500.
- **Eyebrow / rótulos:** `IBM Plex Sans` em maiúsculas, tracking aumentado,
  tamanho pequeno — para etiquetas tipo "Notícias", "Sobre". (Não use mono em
  eyebrow — fica com cara de techy-AI.)

Escala de tipo (não use tamanhos aleatórios):

```
Display XL : 3.5rem / 1.05  (hero headline desktop)
Display L  : 2.5rem / 1.1   (títulos de seção)
H2         : 1.75rem / 1.2
H3         : 1.25rem / 1.3
Corpo      : 1.0625rem / 1.7
Pequeno    : 0.9375rem / 1.6
Eyebrow    : 0.8125rem / 1, maiúsculas, letter-spacing 0.08em
```

Apenas dois pesos no corpo (400 e 500). Sentence case sempre — nada de Title Case
nem CAIXA ALTA fora do eyebrow.

---

## 6. Arquitetura de informação (navbar e rotas)

Sitemap derivado **do documento de requisitos**. Marcado o que é **agora** vs
**futuro**.

```
/                         Início                         [agora]
/sobre                    Sobre nós  (dropdown no hover)  [agora]
  /sobre/quem-somos       Quem somos                      [agora]
  /sobre/diretoria        Quadro de diretoria (nomes+fotos)[agora]
  /sobre/imprensa         Assessoria de imprensa          [agora]
/noticias                 Notícias / blog                 [agora]
/noticias/[slug]          Notícia individual              [agora]
/arquivos                 Arquivos p/ download (CCT/ACT)   [agora]
[Botão] Entrar            Login do associado              [FUTURO]
  /area/...               Área logada (PDFs por pasta:
                          arquivos, atas, editais,
                          comunicados — abrir na tela)     [FUTURO]
/painel/...               Painel da diretoria (postar
                          notícias e arquivos; criar e
                          gerenciar acesso do associado)   [FUTURO]
```

Navbar:
- Itens: **Início · Sobre nós ▾ · Notícias · Arquivos** + botão **Entrar**
  (visível, mas desabilitado/“em breve” por enquanto — não implemente o fluxo).
- "Sobre nós" abre **dropdown no hover** (e no foco/teclado, e no toque em mobile)
  com: Quem somos, Quadro de diretoria, Assessoria de imprensa.
- Navbar sticky discreta; logo Sindipro à esquerda.

**Footer (idêntico em todas as páginas):** e-mail, telefone, **WhatsApp** e
**Instagram** (@sindiprose). Fundo `--navy-900`. Crie como componente único
reutilizado em todo o site.

---

## 7. Movimento (Framer Motion, contido)

Animação serve o conteúdo — não enfeita. Excesso = "cara de IA".

- **Um** momento orquestrado no carregamento do hero (entrada do título +
  desenho/reveal do traço dourado da pena). Só um.
- Reveals sutis ao rolar (`whileInView`, fade + leve subida ~12px), **uma vez**
  (`viewport={{ once: true }}`), duração ~0.4–0.6s, easing suave.
- Micro-interação só em elementos interativos (hover de botão/card/link).
- **Sem** parallax pesado, sem elementos que ficam se mexendo sozinhos, sem
  stagger exagerado em listas longas.
- **Respeite `prefers-reduced-motion`**: desligue/reduza tudo.

---

## 8. Componentes base (especifique e trave antes das páginas)

Construa e revise estes **primeiro**, depois monte as páginas com eles:

- **Botão** (primário, secundário) — estados hover/focus/disabled, raio 6px.
- **Section wrapper** — largura máxima (~1120px), padding vertical consistente
  (use a escala de espaçamento), grid base de 8px.
- **Eyebrow + título de seção** — com o sublinhado dourado (motivo da pena).
- **Card de notícia** — imagem (next/image), data (eyebrow), título (Fraunces),
  resumo curto, link. Borda 1px `--blue-200`, raio discreto, sem sombra boba.
- **Card de diretor** — foto, nome, cargo. Layout sóbrio.
- **Card de arquivo** — nome do documento, tipo (CCT/ACT), ícone de PDF, botão
  "Baixar".
- **Footer** — único, reutilizado.

Espaçamento: grade base 8px → 4, 8, 12, 16, 24, 32, 48, 64, 96.
Raio: 6–8px nos elementos; 0 onde fizer mais sentido institucional. Nunca pílula
em tudo.

---

## 9. Conteúdo por página (do documento de requisitos)

Use **conteúdo real** sempre que existir. Onde faltar, escreva copy concreta e
institucional (sem frase de efeito vazia) e **marque com `TODO:`** para revisão.

### / (Início)
1. **Hero** — eyebrow ("Sindicato patronal · Sergipe"), headline concreta sobre
   representar os provedores de internet de Sergipe, subtítulo curto sobre a
   atuação (defesa do setor, CCT/ACT, representatividade), CTA primário
   ("Associe-se" ou "Fale com o sindicato") + CTA secundário ("Últimas notícias").
   Alinhado à esquerda. Motivo da pena como assinatura.
2. **Últimas notícias** — layout editorial assimétrico (1 destaque maior + 2–3
   menores), **não** 3 cards idênticos. Puxa de `/noticias`.
3. **Sobre (objetivo do sindicato)** — bloco de texto institucional + talvez 2–3
   números reais (ex.: nº de associados) se houver. Sem inventar dados:
   `TODO:` onde faltar.
4. **Parceiros** — faixa de logos de parceiros (em escala de cinza no repouso,
   cor no hover, opcional). `TODO:` lista de parceiros.
5. **Localização** — endereço + mapa (embed) + como chegar.
6. **Footer**.

### /sobre/quem-somos
- História, missão e objetivo do sindicato. + Footer.

### /sobre/diretoria
- **Quadro de diretoria com nome, cargo e foto** de cada diretor (grade de cards
  de diretor). `TODO:` nomes/fotos/cargos. + Footer.

### /sobre/imprensa
- Assessoria de imprensa: contato para imprensa, releases, kit de imprensa.
  `TODO:` conteúdo. + Footer.

### /noticias
- Listagem de notícias/blog (paginada). + Footer.
- `/noticias/[slug]`: post individual.

### /arquivos
- Lista de **arquivos para download** (CCT/ACT) com card de arquivo + botão
  baixar. `TODO:` arquivos. + Footer.

### Futuro (NÃO construir agora — apenas deixar rota/placeholder)
- **Entrar / área do associado:** visualizar arquivos por pasta em PDF (arquivos,
  atas, editais, comunicados) e abrir na tela.
- **Painel da diretoria:** postar notícias, postar arquivos para download, criar
  e gerenciar acesso do associado (login/senha), postar arquivos da área logada.

---

## 10. Qualidade (piso obrigatório)

- **Responsivo mobile-first**, testado de 360px a desktop.
- **Acessibilidade:** foco visível no teclado, dropdown navegável por teclado,
  `alt` em imagens, contraste AA, `prefers-reduced-motion` respeitado, HTML
  semântico (`<nav>`, `<main>`, `<footer>`, headings em ordem).
- **Performance:** `next/image` com lazy, fontes via `next/font`, sem libs
  pesadas desnecessárias. Mire Lighthouse 90+.
- **SEO básico:** title/description por página, Open Graph, `lang="pt-BR"`,
  favicon com a marca.

---

## 11. Como trabalhar (workflow)

1. **Primeiro, planeje** (não code): com base neste arquivo e na skill
   `frontend-design`, proponha um plano de design curto — paleta nomeada, par
   tipográfico, conceito de layout (com wireframe ASCII) e o elemento-assinatura.
   Critique o plano contra os princípios da seção 3 ("isso pareceria template?")
   e ajuste **antes** de codar. Me mostre o plano.
2. **Setup do projeto + tokens + fontes + componentes base.** Trave o "look"
   deles antes das páginas.
3. **Seção por seção / página por página.** Construa, **me mostre**, eu reviso,
   ajustamos, só então segue. **Nunca** gere o site inteiro de uma vez.
4. **Conteúdo real** do documento; `TODO:` onde faltar — nada de lorem ipsum.
5. Ao fim de cada seção, autocrítica: "onde isso ainda parece IA?" e corrija
   (espaçamento, contraste, movimento, simetria).

---

## 12. Proibições explícitas (checklist rápido)

- ❌ Gradientes, mesh, blobs
- ❌ Emoji em UI
- ❌ Grid simétrico de 3 cards "ícone+título+texto"
- ❌ Tudo centralizado
- ❌ Cores fora dos tokens / cores default do Tailwind
- ❌ Fonte Inter sem intenção
- ❌ Cantos muito arredondados / sombra em tudo / glassmorphism
- ❌ Copy genérica de growth/SaaS, pricing, "trial"
- ❌ Animação em excesso
- ❌ Componente de biblioteca colado "como veio"
- ❌ Dourado em área grande

---

## 13. Referências (alimente o Claude Code com prints)

- Instagram da marca: https://www.instagram.com/sindiprose/
- Post de referência visual: https://www.instagram.com/p/DV01HyqjnsQ/
- Exemplo de página de CCT (estrutura de conteúdo de convenção): 
  https://sinstal.org.br/convencao-coletiva-de-trabalho/

> O Claude Code não acessa essas páginas direto. Tire **prints** das referências
> e cole na conversa ao construir as seções correspondentes (identidade visual da
> marca → hero/cores; CCT do sinstal → estrutura da página /arquivos).

## 14. Painel da diretoria (admin) + dados

### Stack de dados
- Supabase como serviço único: Postgres (dados) + Auth (login) + Storage (arquivos).
- O MESMO projeto Supabase serve o site e o painel. Painel escreve; site lê só o
  que estiver publicado.
- Acesso ao Supabase via @supabase/ssr (App Router). NUNCA usar o pacote
  depreciado @supabase/auth-helpers. Seguir sempre o guia oficial atual de
  Server-Side Auth do Supabase para Next.js. Usar as chaves publishable/secret
  novas (sb_publishable_... / sb_secret_...).
- Em produção (serverless) NÃO salvar upload no filesystem do Next — arquivos vão
  para o Supabase Storage. Nunca expor a chave secret/service no client.

### Rotas do painel
- Base em /painel-diretoria (caminho não-óbvio). NÃO linkar no site institucional.
- Todas as rotas sob /painel-diretoria são protegidas por login. Acesso sem
  sessão redireciona para /painel-diretoria/login.
- O painel inteiro é noindex (robots) — não deve aparecer em buscadores.

### Segurança (inegociável)
- "Não linkar" não é proteção. O portão é o login + Row Level Security (RLS) no
  banco. Ativar RLS em todas as tabelas.
- RLS: público pode apenas SELECT de notícias/arquivos PUBLICADOS. Só usuários
  autenticados (diretoria) podem INSERT/UPDATE/DELETE.
- Sem cadastro público. As contas da diretoria são criadas manualmente no painel
  do Supabase por enquanto.
- Validar tipo e tamanho de arquivo no upload (ex.: PDF/imagem, limite de MB).

### Modelo de dados (agora)
- Tabela `news`: id, slug, title, excerpt, content (markdown ou rich text),
  cover_image_url, status ('draft' | 'published'), published_at, author_id,
  created_at, updated_at.
- Tabela `files`: id, title, type ('CCT' | 'ACT' | 'outro'), description,
  storage_path, file_url, size_bytes, uploaded_by, created_at.
- Buckets de Storage: `news-images` (leitura pública), `downloads` (leitura
  pública, para CCT/ACT).

### Modelo de dados (futuro — só deixar preparado, não construir)
- Contas de associado (Supabase Auth com role 'member').
- Bucket privado `member-files` com pastas (arquivos, atas, editais, comunicados),
  acessível só por associado logado via URLs assinadas / RLS.

### Design do painel
- Mesma identidade do site: tokens de cor, Fraunces (títulos) + IBM Plex Sans (UI),
  o acento dourado. As proibições da seção 12 continuam valendo.
- Porém o painel é UTILITÁRIO: layout de dashboard (navegação lateral + área de
  conteúdo), tabelas e formulários claros. Não é página de marketing — priorize
  legibilidade e densidade de informação sobre "impacto visual". Animação mínima.
- shadcn/ui é permitido aqui, desde que re-skinizado nos nossos tokens.

### Conexão com o site público
- /noticias, /noticias/[slug], /arquivos e a seção "Últimas notícias" da home
  passam a ler do Supabase (substituir os dados TODO mockados), mostrando apenas
  status 'published'.

  ### Modelo de dados — diretoria (NOVO)
- Tabela `board_members`: id, name, role (texto), board_group, photo_url,
  display_order (int), created_at, updated_at.
  - board_group: 'executiva' | 'conselho_titular' | 'conselho_suplente'
  - display_order ordena os membros dentro de cada grupo.
- Bucket de Storage `board-photos` (leitura pública) para as fotos.
- RLS: público lê tudo de board_members; só diretoria autenticada escreve.

### Estrutura da diretoria (12 membros) — vinda do cliente
Diretoria Executiva (board_group = 'executiva'):
  1. Presidente
  2. Vice-presidente
  3. Secretário-geral
  4. Suplente de secretário
  5. Tesoureiro
  6. Suplente de tesoureiro
Conselho Fiscal — Titulares (board_group = 'conselho_titular'): 3 membros
  - role: "Conselheiro fiscal titular"
Conselho Fiscal — Suplentes (board_group = 'conselho_suplente'): 3 membros
  - role: "Conselheiro fiscal suplente"
Total: 12.

### Página pública /sobre/diretoria
- Passa a ler de board_members (substituir os dados TODO).
- Exibe em três seções: "Diretoria Executiva", "Conselho Fiscal — Titulares",
  "Conselho Fiscal — Suplentes", cada uma respeitando display_order.
- Card de diretor: foto, nome, cargo. Sóbrio, institucional, na identidade do
  site (não é o card proibido de "ícone + título + texto").

## 15. Área do associado (fase 2)

### Papéis (autorização) — REGRA CRÍTICA
- Dois papéis: 'diretoria' e 'associado'.
- O papel fica em `app_metadata` do usuário (editável APENAS com a chave secreta,
  no servidor) — NUNCA em `user_metadata`, que o próprio usuário consegue alterar
  via updateUser() e permitiria auto-promoção a diretoria.
- Toda checagem de papel acontece no SERVIDOR e na RLS (via
  auth.jwt() -> 'app_metadata' ->> 'role'). Esconder na UI não é autorização.
- Padrão restritivo: usuário sem papel definido não acessa nada.

### Tabela `profiles` (dados do associado)
- id (= auth.users.id), full_name, company (provedor), email, status
  ('ativo' | 'inativo'), created_at, updated_at.
- Serve para listar/gerenciar associados no painel. O papel NÃO fica aqui — fica
  no app_metadata.
- Associado inativo perde o acesso mesmo com a conta existindo.
- RLS: associado lê só o próprio perfil; diretoria lê e escreve todos.

### Storage — bucket PRIVADO `member-files`
- Bucket PRIVADO (diferente de `downloads`, que é público). Sem leitura anônima.
- Pastas (prefixos): `arquivos`, `atas`, `editais`, `comunicados`.
- Acesso SOMENTE via URL assinada de curta duração (ex.: 60s), gerada no SERVIDOR
  após validar sessão + papel + status ativo. Nunca gerar URL assinada no client.
- Policies do bucket: nenhuma leitura pública; escrita só para 'diretoria'.

### Tabela `member_files`
- id, title, folder ('arquivos' | 'atas' | 'editais' | 'comunicados'),
  description, storage_path, size_bytes, mime_type, uploaded_by, created_at.
- RLS: SELECT só para autenticado com papel 'associado' OU 'diretoria' (e perfil
  ativo). INSERT/UPDATE/DELETE só 'diretoria'.

### Rotas
- /entrar — login do associado (agora LINKADO na navbar: ativar o botão "Entrar",
  que estava desabilitado).
- /area — área logada do associado (índice das pastas).
- /area/[pasta] — lista os PDFs da pasta.
- /area/[pasta]/[id] — abre o PDF NA TELA (visualização inline, não download
  forçado).
- /area/conta — alterar a própria senha.
- /painel-diretoria/associados — diretoria cria e gerencia contas de associado.
- /painel-diretoria/arquivos-associado — diretoria posta arquivos da área logada.

### Regras de acesso
- /area/* exige sessão + papel 'associado' (ou 'diretoria') + perfil ativo.
- /painel-diretoria/* exige sessão + papel 'diretoria'. Um associado que acessar
  o painel deve ser BLOQUEADO (não só ver a UI escondida).
- Sem cadastro público. Só a diretoria cria contas de associado.
- Área do associado é noindex.

### Design
- A área do associado é do SITE (pública em aparência, institucional): usa navbar,
  footer, tokens, Fraunces + IBM Plex Sans, acento dourado — conforme seções 3 a 8.
- Não é o dashboard utilitário do painel. É uma área de consulta, limpa e legível.

### Dados pessoais (LGPD)
- Coletar o mínimo (nome, e-mail, provedor). Nada de dado sensível desnecessário.
- Nunca logar dados pessoais nem URLs assinadas em logs.