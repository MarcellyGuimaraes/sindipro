# Relatório de segurança — login (rate limit / força bruta / enumeração)

> Revisão pontual do código de servidor/cliente que trata login, troca de
> senha e recuperação por e-mail. Escopo: rate limit, proteção contra força
> bruta e enumeração de usuário.
> Data do diagnóstico: 2026-07-17.

> **Atualização 2026-07-17 — correções aplicadas.** Itens Alta/Média/Baixa
> (exceto o último, "registro") foram corrigidos — ver
> [Correções aplicadas](#correções-aplicadas-2026-07-17) no fim deste
> arquivo. A tabela abaixo é o diagnóstico original, mantido como registro.

---

## Resumo

O maior buraco é a **ausência total de rate limiting no login**: hoje é só o
que o Supabase aplica por padrão, e na prática isso não bloqueou 25
tentativas seguidas de senha errada no teste abaixo. Isso é agravado pelo
fato de o login rodar inteiramente no client (`signInWithPassword` chamado
direto do navegador), sem nenhuma camada nossa no meio pra interceptar.

Recomenda-se priorizar o item 1 (mover login pra Server Action + rate limit)
antes dos demais, já que ele também é pré-requisito prático pra corrigir o
item 2 (timing) e o item 4.

---

## Tabela

| Severidade | Onde | Problema | Como testei | Correção proposta |
|---|---|---|---|---|
| **Alta** | `components/EntrarForm.tsx:47`, `components/painel/LoginForm.tsx:29` | Nenhum rate limit / lockout contra força bruta de senha. O login chama `supabase.auth.signInWithPassword` **direto do client** — não existe Server Action, Route Handler nem middleware no meio (o `middleware.ts` só protege `/area/*` e `/painel-diretoria/*`, nunca as próprias telas de login), então não há lugar nenhum no nosso código onde um limite pudesse estar aplicado. | Script direto contra o Supabase Auth: 25 tentativas seguidas de senha errada na **mesma conta**. Todas processadas normalmente (400 "Invalid login credentials"), nenhuma virou 429, nenhum atraso crescente — ~140-150ms por tentativa do início ao fim. | Mover o login para uma Server Action (dá um lugar único pra throttling) + aplicar rate limit por conta+IP (ex.: Upstash Ratelimit, ou tabela própria de tentativas com backoff progressivo/bloqueio temporário). Complementar com CAPTCHA (hCaptcha/Turnstile) nos formulários — o GoTrue do Supabase suporta nativamente via configuração no painel. |
| **Média** | Comportamento do endpoint `auth/v1/token` do Supabase (fora do nosso código), consumido em `EntrarForm.tsx:47` e `LoginForm.tsx:29` | Enumeração de e-mail por **tempo de resposta**, apesar da mensagem de erro já ser genérica. E-mail existente demora mensuravelmente mais que e-mail inexistente (o GoTrue provavelmente só faz a comparação bcrypt quando o usuário existe). | Cronometrei 6 rodadas alternadas: e-mail existente ~117ms de média, e-mail inexistente ~60ms — diferença de ~56ms, consistente nas 6 rodadas. | Normalizar o tempo de resposta do login (ex.: garantir uma duração mínima constante ~150–200ms na Server Action, preenchendo a diferença com `await sleep(...)` quando a resposta do Supabase vier mais rápido) pra apagar esse side-channel. |
| **Média** | `components/EntrarForm.tsx:79` (`resetPasswordForEmail`) | O "esqueci minha senha" depende inteiramente da cota de envio de e-mail do projeto Supabase (padrão bem baixa, pensada só pra teste) como única proteção contra spam — não é um throttle deliberado por conta/IP no nosso código. Um atacante pode chamar `resetPasswordForEmail` repetidamente (pra qualquer e-mail, já que a mensagem é genérica) e esgotar a cota do projeto inteiro, **bloqueando a recuperação de senha de todo mundo** (negação de serviço auto-infligida). | 8 chamadas seguidas pro mesmo e-mail: todas retornaram `429 email rate limit exceeded` já na primeira — confirma que existe *algum* limite, mas é a cota de e-mail global do projeto (provavelmente já perto do teto pelos testes anteriores), não um limite por endereço/IP que o nosso app controle. | Implementar throttling próprio (por e-mail + IP) na camada de aplicação, independente da cota do Supabase. Em produção, configurar um provedor SMTP próprio e revisar os limites em Auth → Rate Limits no painel do Supabase (o serviço de e-mail padrão não é indicado pra produção). |
| **Baixa** | `app/(site)/area/conta/actions.ts:42-45` | A verificação de "senha atual" na troca de senha (`updateOwnPassword`) chama `signInWithPassword` sem nenhum limite de tentativas. Exige uma sessão já autenticada primeiro (cookie sequestrado, por exemplo), o que reduz bastante o impacto, mas dentro desse cenário dá pra tentar adivinhar a senha atual sem bloqueio. | Leitura de código — mesma ausência de throttling do item 1, aqui numa Server Action que já roda no servidor (mais fácil de corrigir, já que não precisa migrar de lugar). | Aplicar o mesmo mecanismo de rate limit do item 1 nesta Server Action. |
| **Baixa (registro)** | `app/painel-diretoria/(dashboard)/associados/actions.ts` (`createAssociado`) | Ao criar um associado, a mensagem "Já existe uma conta com esse e-mail" confirma explicitamente se um e-mail já está cadastrado. Só é alcançável por quem já está autenticado como diretoria (`isDirectorSession()` + RLS barram o resto), então o impacto real é baixo — registrando por completude, não necessariamente recomendando mudar (o admin normalmente precisa desse feedback). | Leitura de código (`app/painel-diretoria/(dashboard)/associados/actions.ts`, ~linhas 66-73). | Nenhuma ação recomendada por padrão — só vale revisitar se o modelo de ameaça incluir diretoria mal-intencionada. |

---

## Metodologia dos testes

Todos os testes de força bruta/timing/spam foram feitos com scripts Node
chamando `@supabase/supabase-js` diretamente contra o projeto Supabase real
(chave publishable, sem passar pelo servidor Next.js — o que é fiel ao
comportamento de produção, já que o login roda no client mesmo). Contas de
teste criadas para o exercício foram excluídas ao final; nenhum dado de
produção foi tocado.

---

## Correções aplicadas (2026-07-17)

| Severidade | O que mudou | Por quê |
|---|---|---|
| Alta | Login (`/entrar` e `/painel-diretoria/login`) migrou de chamada direta do client para `lib/auth/login-action.ts` (Server Action compartilhada), com rate limit de 5 tentativas/15min por e-mail e 20/15min por IP (tabela `login_rate_limits`, migration 0008), bloqueando por 15min ao estourar. | Sem isso não existia nenhum lugar no código pra aplicar um limite — o client nunca é confiável pra isso. |
| Média | A mesma Server Action de login agora garante uma duração mínima de 300ms de resposta (`lib/auth/timing.ts`), independente de acertar/errar a senha ou de estar bloqueada. | Apaga o side-channel de tempo que deixava descobrir se um e-mail tinha conta (diferença medida antes: ~56ms; depois: ~5ms). |
| Média | "Esqueci minha senha" migrou para `app/(site)/entrar/actions.ts`, com rate limit próprio de 3 tentativas/15min por e-mail e 12/15min por IP, **antes** de chamar `resetPasswordForEmail`. | Não depende mais só da cota de e-mail (global, do projeto inteiro) do Supabase pra conter spam — um atacante não consegue mais esgotar essa cota chamando o endpoint repetidamente. |
| Baixa | Verificação de "senha atual" em `/area/conta` (`updateOwnPassword`) ganhou o mesmo rate limit (5 tentativas/15min, por usuário). | Fecha a brecha de adivinhação de senha por quem já tivesse uma sessão comprometida. |
| Baixa (registro) | **Não alterado**, por decisão do próprio relatório: `createAssociado` continua avisando "e-mail já cadastrado" pra diretoria. | Só alcançável por quem já é diretoria autenticada; o admin precisa desse feedback pra não duplicar cadastro. |
| — (fora do relatório original) | Componente `ChunkErrorReload` (montado no `app/layout.tsx`) recarrega a página automaticamente ao detectar `ChunkLoadError`, com proteção contra loop (cooldown de 10s via `sessionStorage`). | Erro relatado ao abrir/trocar telas de associados — acontece quando o navegador busca um chunk JS que não existe mais no build atual (normal depois de vários hot-reloads em dev, ou depois de um deploy novo em produção com uma aba antiga aberta). |

### Pendente — depende de configuração fora do código

1. **Rodar a migration 0008** no SQL Editor do Supabase (`supabase/migrations/0008_login_rate_limit.sql`) — cria a tabela `login_rate_limits`. *(Já confirmado feito nesta sessão.)*
2. **Provedor de e-mail próprio (SMTP) em produção.** O serviço de e-mail padrão do Supabase tem cota muito baixa (é o que causou o `429 email rate limit exceeded` visto no teste original) — não é indicado pra produção. No painel do Supabase: **Authentication → Emails → SMTP Settings** → configure um provedor (ex.: Resend, SendGrid, Postmark). Sem isso, mesmo com o rate limit nosso, a recuperação de senha pode falhar silenciosamente pra usuários legítimos se a cota do Supabase for atingida por volume normal de uso.
3. **(Opcional, reforço adicional) CAPTCHA no login.** Não implementado — exige criar uma conta em um provedor (hCaptcha ou Cloudflare Turnstile) pra obter as chaves. Se quiser essa camada a mais: crie a conta, me passe as chaves (site key + secret key), e eu configuro em **Authentication → Attack Protection** no painel do Supabase + integro no formulário. O rate limit já implementado cobre o essencial; isso seria defesa adicional contra bots automatizados especificamente.
4. **Confirmar a variável `SUPABASE_SECRET_KEY` na Vercel.** O rate limit usa a service role (`lib/supabase/admin.ts`) pra gravar/ler `login_rate_limits`. Se essa env var já está configurada lá (provavelmente sim, já que o painel de associados também depende dela), não precisa fazer nada — só confirme em **Vercel → Project Settings → Environment Variables** que ela existe nos ambientes de Production e Preview.
