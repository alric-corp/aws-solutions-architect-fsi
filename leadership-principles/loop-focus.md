# Foco do loop: princípios e histórias reais

Esta página reúne os nove Leadership Principles destacados na conversa de preparação, marcados com ★ em todo o site, e as histórias reais disponíveis para cada um. Comece pelas lacunas: elas pedem tempo de memória, não de leitura.

> As histórias estão anonimizadas: empresa, sistemas internos e produtos em desenvolvimento aparecem pela função. Os números são os do relato original. Na entrevista, use o nível de detalhe que você pode compartilhar; o próprio briefing da apresentação sugere nomes fictícios para informações confidenciais.

## Os nove focos e suas histórias

A coluna de ênfase resume a orientação recebida. A escolha da história é uma sugestão de treino: cada princípio tem uma história principal diferente, para que nenhuma se repita em várias entrevistas.

| Princípio | Ênfase indicada | História principal | Alternativa | Situação |
|---|---|---|---|---|
| [Dive Deep ★](12-dive-deep.md) | Análise por camadas, com métricas e causa raiz; associado à entrevista técnica | [STAR-04](stories/star-04-cmdb-ownership.md) | [STAR-02](stories/star-02-cache-latency.md) | Coberto |
| [Have Backbone; Disagree and Commit ★](13-have-backbone-disagree-and-commit.md) | Discordâncias, contrapontos e apoio a uma decisão diferente da preferida | — | Investigar STAR-05, STAR-06 e STAR-04 | **Sem história** |
| [Ownership ★](02-ownership.md) | Responsabilidades além do escopo inicial | [STAR-05](stories/star-05-unused-solution.md) | [STAR-03](stories/star-03-account-id-migration.md) | Coberto |
| [Customer Obsession ★](01-customer-obsession.md) | Atuação consultiva, feedback e interações difíceis, inclusive dizer não | [STAR-03](stories/star-03-account-id-migration.md) | [STAR-07](stories/star-07-open-finance-agent.md) | **Parcial:** falta uma interação difícil ou um “não” |
| [Deliver Results ★](14-deliver-results.md) | Resultados expressivos ou apesar de obstáculos | [STAR-02](stories/star-02-cache-latency.md) | [STAR-06](stories/star-06-emergency-db-migration.md) | Coberto |
| [Bias for Action ★](09-bias-for-action.md) | Prazo curto, dados incompletos e risco calculado | [STAR-01](stories/star-01-scaling-incident.md) | [STAR-06](stories/star-06-emergency-db-migration.md) | Coberto |
| [Learn and Be Curious ★](05-learn-and-be-curious.md) | O que aprender, com quais recursos e o que mudou | [STAR-07](stories/star-07-open-finance-agent.md) | [STAR-04](stories/star-04-cmdb-ownership.md) | Coberto |
| [Earn Trust ★](11-earn-trust.md) | Autocrítica, feedback difícil, confiança e influência | [STAR-08](stories/star-08-missed-deadline.md) | — | **Parcial:** falta influência entre equipes |
| [Think Big ★](08-think-big.md) | Adoção, replicação e legado além da entrega | — | STAR-04, apenas como proposta | **Fraco:** nenhuma expansão realizada |

### As lacunas, em ordem de prioridade

1. **Have Backbone; Disagree and Commit.** Nenhuma história tem uma discordância real. Pistas para lembrar: alguém resistiu ao desligamento da solução sem uso (STAR-05)? Houve divergência sobre o acesso emergencial negado ou sobre snapshot versus DMS (STAR-06)? Alguém queria manter o agente de IA no CMDB (STAR-04)? Só use se aconteceu.
2. **Influência entre equipes.** Na primeira entrevista, essa pergunta ficou no hipotético. STAR-03 e STAR-05 envolvem outras equipes, mas sem tensão descrita. Procure um episódio com duas partes querendo coisas diferentes e uma ação sua de alinhamento.
3. **Customer Obsession com um “não”.** O cliente pode ser interno: área de negócio, PO ou time consumidor de uma API.
4. **Think Big.** Se nenhuma ideia sua foi adotada além do time, diga isso e apresente a proposta como proposta.

### Antes de usar STAR-06

Se STAR-06 for o mesmo projeto da apresentação, os detalhes precisam bater. O material da apresentação descreve uma nova base com DMS e a troca final feita por colegas; a história descreve snapshot e a troca feita por você. Confirme o que aconteceu antes do loop. Nesse caso, evite também contar o mesmo projeto em uma entrevista comportamental, porque os entrevistadores já o terão visto.

## Rodadas no formato do loop

A recrutadora descreveu quatro entrevistas com dois princípios cada, além da entrevista técnica. Ela não informou qual entrevistador fica com qual par; os pares abaixo só organizam o treino. Quem conduz lê as perguntas sem anunciar o princípio e usa dois ou três aprofundamentos da página da história.

| Rodada | Princípios | Perguntas do banco | O que testar |
|---|---|---|---|
| 1 | Customer Obsession ★ + Earn Trust ★ | [LP01-Q09](01-customer-obsession.md#lp01-q09) · [LP11-Q02](11-earn-trust.md#lp11-q02) · reserva [LP11-Q08](11-earn-trust.md#lp11-q08) | Lacuna do “não”; STAR-03; STAR-08 |
| 2 | Have Backbone ★ + Ownership ★ | [LP13-Q07](13-have-backbone-disagree-and-commit.md#lp13-q07) · [LP02-Q01](02-ownership.md#lp02-q01) · reserva [LP02-Q08](02-ownership.md#lp02-q08) | Lacuna de discordância; STAR-05; influência entre equipes |
| 3 | Bias for Action ★ + Deliver Results ★ | [LP09-Q10](09-bias-for-action.md#lp09-q10) · [LP14-Q01](14-deliver-results.md#lp14-q01) · reserva [LP09-Q01](09-bias-for-action.md#lp09-q01) | STAR-01; STAR-02 |
| 4 | Learn and Be Curious ★ + Think Big ★ | [LP05-Q01](05-learn-and-be-curious.md#lp05-q01) · [LP08-Q01](08-think-big.md#lp08-q01) · reserva [LP05-Q11](05-learn-and-be-curious.md#lp05-q11) | STAR-07; lacuna de Think Big |
| Técnica | Dive Deep ★ | [LP12-Q03](12-dive-deep.md#lp12-q03) · [LP12-Q12](12-dive-deep.md#lp12-q12) | STAR-04; STAR-02 |

## As histórias

STAR-01 a STAR-07 seguem a numeração da tabela original de histórias; STAR-08 é a entrega fora do prazo.

| ID | História | Uso sugerido no loop |
|---|---|---|
| [STAR-01](stories/star-01-scaling-incident.md) | Incidente de escalabilidade em produção | Bias for Action ★; Dive Deep só com causa raiz confirmada |
| [STAR-02](stories/star-02-cache-latency.md) | Cache para duas dependências lentas | Deliver Results ★; alternativa para Dive Deep ★ |
| [STAR-03](stories/star-03-account-id-migration.md) | Migração para idConta sem quebrar consumidores | Customer Obsession ★; alternativa para Ownership ★ |
| [STAR-04](stories/star-04-cmdb-ownership.md) | Ownership de repositórios no CMDB | Dive Deep ★; alternativa para Learn and Be Curious ★ |
| [STAR-05](stories/star-05-unused-solution.md) | Solução sem uso desligada | Ownership ★; pista para Have Backbone ★ |
| [STAR-06](stories/star-06-emergency-db-migration.md) | Migração emergencial de banco de dados | Alternativa para Deliver Results ★ e Bias for Action ★; ver o aviso acima |
| [STAR-07](stories/star-07-open-finance-agent.md) | Saldo de Open Finance em um agente de IA | Learn and Be Curious ★; alternativa para Customer Obsession ★ |
| [STAR-08](stories/star-08-missed-deadline.md) | Entrega fora do prazo | Earn Trust ★ |

## Como treinar cada história

1. Conte a história em cerca de 90 segundos, sem olhar o texto.
2. Nas perguntas que você já preparou, responda em voz alta antes de abrir a resposta.
3. No aprofundamento, responda antes de abrir o que a resposta precisa conter. Quando não souber um fato, diga que não sabe e como confirmaria. Uma versão plausível inventada não resiste ao follow-up seguinte.
4. Use cada história em no máximo duas entrevistas. Os entrevistadores comparam anotações no debrief.
5. Treine também em inglês as respostas marcadas como EN, mantendo os mesmos números.
