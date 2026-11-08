# STAR-02 — Cache para duas dependências lentas

<div data-story-locales data-story-title-pt="STAR-02 — Cache para duas dependências lentas" data-story-title-en="STAR-02 — Caching two slow dependencies">

<section data-story-locale="pt-BR" lang="pt-BR">

**No loop:** Deliver Results como principal e Dive Deep como alternativa de preparação. A história também pode evidenciar Customer Obsession e Ownership, conforme a pergunta e os fatos. Esse mapeamento não é uma atribuição oficial da AWS.

[Foco do loop](../loop-focus.md) · [Deliver Results](../14-deliver-results.md) · [Dive Deep](../12-dive-deep.md)

> Relato autoral de Vitória, fornecido pelo proprietário. Tradução de estudo; execução e métricas não auditadas nesta página.

## STAR

**Situação.** No Itaú, eu sempre atuei em aplicações da jornada de investimentos, com metas de melhoria de performance e latência. Nas análises, identifiquei duas dependências que contribuíam significativamente para o tempo de resposta: o **CARMO**, que retorna carteiras-modelo recomendadas, e o **EQ3**, utilizado para recuperar informações de identificação da conta. As duas retornavam informações que mudavam pouco, mas eram consultadas repetidamente.

**Tarefa.** Meu objetivo era reduzir a latência dessas chamadas e melhorar o tempo de resposta da jornada, sem transformar o cache em uma dependência que comprometesse a disponibilidade da aplicação.

**Ação.** Analisei testes de performance, dashboards no **Datadog** e traces para localizar os principais pontos de latência. Implementei cache com **Valkey**, usando **cache-aside** e mantendo a API de origem como fallback para cache miss ou indisponibilidade do cache. Configurei **TTL de 7 horas**. Para carteiras-modelo, uma nova publicação na base de origem, o **DynamoDB**, gerava um evento no **SNS**, que acionava uma **Lambda** para invalidar a entrada correspondente no cache.

**Resultado.** No **CARMO**, a latência média caiu de aproximadamente **2,41 segundos para 189 milissegundos**. No **EQ3**, caiu de aproximadamente **1,27 segundo para 119 milissegundos**. Isso representou cerca de **90% de redução na latência das duas integrações**, com menos chamadas repetitivas às origens, sem tornar o cache obrigatório. Esses números se referem às integrações, não comprovam a mesma redução na jornada inteira.

**Aprendizado.** Cache não é simplesmente armazenar uma resposta para torná-la rápida. A estratégia depende de como o dado é lido, atualizado e de quanto tempo pode ficar desatualizado. Além do cache-aside, precisei pensar em consistência, expiração, invalidação e falhas. Também aprendi a usar métricas para localizar primeiro a latência e só então escolher a otimização.

## Termos para o aprofundamento

| Padrão | Como funciona | Quando usar |
|---|---|---|
| Cache-aside | A aplicação consulta o cache; no miss, busca na origem e grava no cache. Foi o padrão relatado. | Quando a origem continua sendo a fonte de verdade e o fallback foi planejado. |
| Read-through | O mecanismo de cache busca na origem quando ocorre miss. | Para centralizar a lógica de leitura no mecanismo de cache. |
| Write-through | A escrita atualiza cache e origem de forma coordenada. | Quando a estratégia exige atualização do cache na escrita, considerando custo e falhas. |
| Write-behind / write-back | A escrita chega primeiro ao cache e é persistida na origem depois. | Quando o desenho aceita persistência assíncrona e trata os riscos de inconsistência ou perda. |
| Refresh-ahead | Itens são atualizados antes de expirar. | Para dados muito acessados, com atualização antecipada que faça sentido para a carga. |

Hit é encontrar a chave no cache; miss é não encontrá-la e consultar a origem; falha é um problema de acesso ao cache. Eviction é remover entradas para liberar memória. As opções acima são referências de estudo, não mecanismos adicionais que tenham sido implementados neste relato.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Por que cache?

<details><summary>Ver resposta preparada</summary>

Os dados eram consultados com muita frequência, mas mudavam com uma frequência muito menor. Além disso, através dos testes de performance, dashboards no Datadog e tracing, identifiquei que essas chamadas contribuíam significativamente para a latência. Por isso o cache fazia sentido: reduzia chamadas repetidas e melhorava o tempo de resposta para o cliente.

</details>

### 2. Por que cache-aside?

<details><summary>Ver resposta preparada</summary>

Porque eu queria que as APIs de origem continuassem sendo a source of truth. O cache deveria melhorar a performance, mas não se tornar uma dependência obrigatória. Em caso de cache miss, a aplicação buscava o dado na origem e depois atualizava o cache.

</details>

### 3. E se o Valkey ficasse indisponível?

<details><summary>Ver resposta preparada</summary>

A aplicação continuava consultando a API de origem. O cache era uma otimização de performance, então eu não queria que uma indisponibilidade dele interrompesse a jornada do cliente.

</details>

### 4. Qual a diferença entre cache miss e falha do cache?

<details><summary>Ver resposta preparada</summary>

Cache miss significa que o cache está funcionando, mas não possui aquela chave. Já cache failure significa que ocorreu uma falha ao acessar ou gravar no cache. Nos dois casos, a aplicação conseguia recorrer à fonte original.

</details>

### 5. Por que TTL e também invalidação orientada a eventos?

<details><summary>Ver resposta preparada</summary>

O TTL garantia que uma entrada não permanecesse indefinidamente no cache. Já a invalidação orientada a eventos permitia remover o dado assim que soubéssemos que a origem havia mudado, sem precisar esperar as 7 horas expirarem.

</details>

### 6. Como funcionava SNS com Lambda?

<details><summary>Ver resposta preparada</summary>

Quando uma nova carteira recomendada era salva na base de origem, no DynamoDB, um evento era publicado no SNS. Esse evento acionava uma Lambda responsável por invalidar a entrada correspondente no Valkey. Assim, a próxima consulta buscava o dado atualizado na origem.

</details>

### 7. Por que SNS?

<details><summary>Ver resposta preparada</summary>

Porque eu queria desacoplar a publicação da nova carteira da lógica de invalidação do cache. O sistema que publicava a carteira não precisava conhecer os detalhes de como o cache seria invalidado.

</details>

### 8. Por que Lambda?

<details><summary>Ver resposta preparada</summary>

Porque era uma tarefa curta, pontual e orientada a evento. A Lambda só precisava executar quando uma nova carteira fosse publicada.

</details>

### 9. Como você mediu o resultado?

<details><summary>Ver resposta preparada</summary>

Fizemos testes antes e depois da implementação e avaliamos a latência média das requisições. No CARMO, a latência caiu de aproximadamente 2,41 segundos para 189 milissegundos. No EQ3, de aproximadamente 1,27 segundo para 119 milissegundos, uma redução de cerca de 90%.

</details>

### 10. Por que não otimizar diretamente a API de origem?

<details><summary>Ver resposta preparada</summary>

Nem todas as APIs pertenciam ao meu time, principalmente o EQ3. Além disso, o padrão de acesso era muito favorável a cache: muitas leituras e poucas alterações. Então conseguimos melhorar nossa latência e reduzir chamadas downstream sem depender de mudanças em outro sistema.

</details>

### 11. Quais foram os trade-offs?

<details><summary>Ver resposta preparada</summary>

O principal ganho foi performance e redução de chamadas downstream. Em contrapartida, adicionamos complexidade relacionada a consistência, expiração, invalidação, observabilidade e tratamento de falhas.

</details>

### 12. Quando você não usaria cache?

<details><summary>Ver resposta preparada</summary>

Eu evitaria cache quando o dado muda constantemente, quando existe exigência muito forte de consistência imediata ou quando a chamada original já é suficientemente rápida e o cache não traz benefício relevante.

</details>

### 13. O que você monitoraria?

<details><summary>Ver resposta preparada</summary>

Hoje eu acompanharia hit rate, miss rate, latência do cache, erros, uso de memória e evictions. Também mediria se o cache realmente está reduzindo chamadas aos sistemas downstream e melhorando a latência ponta a ponta da jornada.

</details>

### 14. Média, p95 ou p99?

<details><summary>Ver resposta preparada</summary>

Na implementação original eu utilizei principalmente a média para comparar antes e depois. Hoje eu também acompanharia p95 e p99, porque eles mostram melhor a experiência das requisições mais lentas e evitam que a média esconda outliers.

</details>

### 15. O que você faria diferente hoje?

<details><summary>Ver resposta preparada</summary>

Hoje eu manteria a mesma estratégia geral, mas acompanharia também métricas como cache hit ratio, p95 e p99, impacto real nas chamadas downstream e possíveis cenários de cache stampede. Também avaliaria se o TTL continuava adequado com base no comportamento real dos dados.

</details>

### 16. O que você aprendeu?

<details><summary>Ver resposta preparada</summary>

Esse trabalho reforçou para mim que cache não é simplesmente armazenar uma resposta para deixá-la mais rápida. Existem diferentes estratégias de cache, e a escolha depende de como o dado é lido e atualizado. Também é preciso pensar em consistência, expiração, invalidação e comportamento em caso de falha.

</details>

### 17. Como você definiu a memória do Valkey?

**Responda só o que aconteceu.** Use a resposta abaixo apenas se ela descreve o que você fez. Se não houve teste de capacidade, diga que começou com uma configuração conservadora, sem estudo formal, e mostre como faria hoje (pergunta 18). Um estudo inventado não resiste ao follow-up, que pede os números dele.

<details><summary>Ver resposta preparada</summary>

Na primeira implementação, eu defini uma capacidade inicial conservadora que suportaria o cenário sem risco de subdimensionamento. Eu não considerei aquele valor como definitivo: a ideia era colocar a solução em funcionamento e depois fazer o right-sizing com testes de performance, observando consumo de memória, taxa de acertos e de misses e se estavam ocorrendo evictions. A validação mais detalhada da capacidade ficou com a squad.

</details>

### 18. Como você faria o sizing hoje?

<details><summary>Ver resposta preparada</summary>

Eu começaria estimando o volume de dados que realmente pode ficar simultaneamente no cache, considerando o tamanho médio das entradas e a quantidade esperada de chaves. Depois adicionaria margem para overhead e crescimento. Mas eu não fecharia o sizing apenas por estimativa: validaria com teste de carga e observaria memória utilizada, evictions, hit ratio e latência antes de definir a capacidade final.

</details>

Memória sempre perto do limite com muitas evictions pode indicar cache pequeno demais, ou TTL e política de retenção que precisam ser revistos.

## Aprofundamento: perguntas novas

Perguntas autorais para aprofundar. Quando não souber um fato, diga que não sabe e como o confirmaria.

### A1. Quem publicava o evento no SNS? E se a gravação no DynamoDB desse certo e a publicação falhasse?

<details><summary>Ver resposta: o que precisa aparecer</summary>

É o problema de dupla escrita estudado no P0: sem tratamento, a carteira nova fica na base, mas o cache continua servindo a antiga por até 7 horas. Diga como era de fato, por exemplo se o evento saía de um stream da tabela ou da própria aplicação depois da gravação, e qual risco foi aceito para carteiras recomendadas.

</details>

### A2. E se a Lambda de invalidação falhasse?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Uma invocação assíncrona tem novas tentativas e pode ter destino de falha. Esgotadas as tentativas, a entrada antiga vive até o TTL. Diga se havia fila de falhas ou alerta; se não havia, reconheça o limite.

</details>

### A3. Qual era o timeout da chamada ao Valkey?

<details><summary>Ver resposta: o que precisa aparecer</summary>

O fallback só protege se o cache falhar rápido. Um Valkey lento, e não fora do ar, faz cada requisição esperar antes de ir à origem, e a jornada fica mais lenta do que sem cache. Responda com o valor configurado, se souber, ou diga como verificaria.

</details>

### A4. Se o Valkey cair, todo o tráfego volta para as dependências lentas de uma vez. Elas aguentam?

<details><summary>Ver resposta: o que precisa aparecer</summary>

O fallback desloca a carga para origens que já eram lentas e que, no caso do EQ3, não pertenciam ao seu time. Mencione a proteção que existia, como limite de concorrência ou circuit breaker, ou o risco, se não existia.

</details>

### A5. Qual era a taxa de acerto do cache? A média de 189 ms inclui os misses?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Diga de onde vêm os números: teste de performance ou produção, quantas requisições, qual período. Se o hit rate não foi medido, diga isso; a resposta 14 já reconhece que a comparação usou a média.

</details>

### A6. A redução de cerca de 90% foi das dependências ou da jornada inteira?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Os números medem as duas integrações. Não chame de ganho ponta a ponta sem uma medida da jornada. Use também os mesmos valores e a mesma definição em todas as entrevistas: na primeira, os números foram citados arredondados.

</details>

### A7. Uma leitura que começou antes da invalidação pode regravar a carteira antiga no cache?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Sim, é uma corrida conhecida do cache-aside: a leitura busca o valor antigo, a invalidação acontece, e a leitura grava o valor antigo depois dela. Mitigações comuns são versionar a chave ou repetir a invalidação com atraso. Diga se esse risco era aceitável para carteiras recomendadas e por quê.

</details>

</section>

<section data-story-locale="en-US" lang="en-US">

**Loop preparation:** Deliver Results as the primary mapping and Dive Deep as an alternative. The story may also demonstrate Customer Obsession and Ownership, depending on the question and the facts. This is not an official AWS assignment.

[Loop focus](../loop-focus.md) · [Deliver Results](../14-deliver-results.md) · [Dive Deep](../12-dive-deep.md)

> Original account by Vitória, supplied by the owner. Study translation; execution and metrics have not been audited on this page.

## STAR

**Situation.** At Itaú, I worked on investment-journey applications with performance and latency improvement goals. Performance analysis identified two dependencies that significantly contributed to response time: **CARMO**, which returns recommended model portfolios, and **EQ3**, which retrieves account-identification information. Both returned data that changed relatively infrequently but was requested repeatedly.

**Task.** My goal was to reduce latency for these calls and improve journey response time without making the cache a mandatory dependency that could compromise availability.

**Action.** I analyzed performance tests, **Datadog** dashboards and traces to locate the main latency contributors. I implemented **Valkey** with **cache-aside**, keeping the source API as the fallback for cache misses or cache unavailability. I configured a **seven-hour TTL**. For model portfolios, a new publication in the source **DynamoDB** produced an **SNS** event, triggering a **Lambda** that invalidated the corresponding cache entry.

**Result.** Average latency in **CARMO** fell from approximately **2.41 seconds to 189 milliseconds**. In **EQ3**, it fell from approximately **1.27 seconds to 119 milliseconds**. This was roughly a **90% reduction in latency for the two integrations**, with fewer repeated calls to their sources and without making the cache mandatory. These numbers measure the integrations; they do not demonstrate the same reduction for the entire journey.

**Learning.** Caching is not simply storing a response to make it faster. Strategy depends on how data is read and updated and how long it may remain stale. Beyond cache-aside, I had to consider consistency, expiration, invalidation and failures. I also learned to use metrics to locate latency first and only then select an optimization.

## Terms for deeper discussion

| Pattern | How it works | When to consider it |
|---|---|---|
| Cache-aside | The application checks the cache, reads the source on a miss and populates the cache. This is the reported pattern. | When the source remains the source of truth and fallback has been planned. |
| Read-through | The cache mechanism retrieves data from the source on a miss. | To centralize read logic in the caching mechanism. |
| Write-through | Writes update cache and source in a coordinated way. | When the strategy requires cache updates on writes, considering cost and failures. |
| Write-behind / write-back | Writes reach the cache first and are persisted to the source later. | When asynchronous persistence is acceptable and inconsistency or loss risks are addressed. |
| Refresh-ahead | Entries are refreshed before expiration. | For frequently accessed data where advance refresh suits the workload. |

A hit finds a key in the cache; a miss does not and requires a source read; a failure is a problem accessing the cache. Eviction removes entries to free memory. These patterns are study references, not additional mechanisms claimed as implemented in this account.

## Prepared questions

Answer aloud before opening.

### 1. Why caching?

<details><summary>View prepared answer</summary>

The data was read frequently but changed much less frequently. Through performance tests, Datadog dashboards and tracing, I also identified that these downstream calls were contributing significantly to our latency. So caching was a good fit because it reduced repeated calls while improving customer response time.

</details>

### 2. Why cache-aside?

<details><summary>View prepared answer</summary>

I wanted the source APIs to remain the source of truth. The cache was intended to improve performance without becoming a mandatory dependency. On a cache miss, the application retrieved the data from the source and then populated the cache.

</details>

### 3. What if Valkey became unavailable?

<details><summary>View prepared answer</summary>

The application could continue calling the source API. The cache was a performance optimization, so I didn't want a cache failure to make the customer journey unavailable.

</details>

### 4. What's the difference between a cache miss and a cache failure?

<details><summary>View prepared answer</summary>

A cache miss means the cache is working but doesn't contain that key. A cache failure means there was an error accessing or writing to the cache. In both cases, the application could fall back to the source system.

</details>

### 5. Why both a TTL and event-driven invalidation?

<details><summary>View prepared answer</summary>

The TTL ensured that entries wouldn't remain cached indefinitely. Event-driven invalidation allowed us to remove the cached data as soon as we knew the source had changed, without waiting for the seven-hour TTL to expire.

</details>

### 6. How did SNS and Lambda work together?

<details><summary>View prepared answer</summary>

When a new recommended portfolio was saved in the source DynamoDB, an event was published to SNS. That event triggered a Lambda responsible for invalidating the corresponding entry in Valkey. The next request would then retrieve the updated data from the source.

</details>

### 7. Why SNS?

<details><summary>View prepared answer</summary>

Because I wanted to decouple the portfolio publication from the cache invalidation logic. The system publishing the portfolio didn't need to know the details of how the cache would be invalidated.

</details>

### 8. Why Lambda?

<details><summary>View prepared answer</summary>

Because it was a short, event-driven task. The Lambda only needed to run when a new portfolio was published.

</details>

### 9. How did you measure the result?

<details><summary>View prepared answer</summary>

We compared performance before and after the implementation using average request latency. The CARMO went from around 2.41 seconds to 189 milliseconds, and the EQ3 went from around 1.27 seconds to 119 milliseconds, which was roughly a 90% reduction in latency.

</details>

### 10. Why not optimize the source API directly?

<details><summary>View prepared answer</summary>

Not all source APIs belonged to my team, especially the EQ3. Also, the access pattern was well suited for caching: many reads and relatively few changes. This allowed us to improve latency and reduce downstream calls without depending on changes in another system.

</details>

### 11. What were the trade-offs?

<details><summary>View prepared answer</summary>

The main benefits were better performance and fewer downstream calls. The trade-off was additional complexity around consistency, expiration, invalidation, observability and failure handling.

</details>

### 12. When would you not use a cache?

<details><summary>View prepared answer</summary>

I would avoid caching when the data changes very frequently, when strict immediate consistency is required, or when retrieving the original data is already fast enough that caching wouldn't provide meaningful value.

</details>

### 13. What would you monitor?

<details><summary>View prepared answer</summary>

Besides the health of Valkey itself, I would monitor hit rate, miss rate, cache latency, errors, memory usage and evictions. I would also measure whether the cache is actually reducing downstream calls and improving end-to-end journey latency.

</details>

### 14. Average, p95 or p99?

<details><summary>View prepared answer</summary>

In the original implementation, I mainly used average latency to compare before and after. Today I would also monitor p95 and p99 because they give better visibility into slower requests and prevent the average from hiding outliers.

</details>

### 15. What would you do differently today?

<details><summary>View prepared answer</summary>

Today I would keep the same overall strategy, but I would also monitor cache hit ratio, p95 and p99 latency, the actual reduction in downstream calls and possible cache stampede scenarios. I would also continuously evaluate whether the TTL was still appropriate based on the actual data behavior.

</details>

### 16. What did you learn?

<details><summary>View prepared answer</summary>

This project reinforced that caching isn't simply storing a response to make it faster. There are different caching strategies, and the right choice depends on how the data is read and updated. You also need to consider consistency, expiration, invalidation and failure behavior.

</details>

### 17. How did you size the cache?

**Describe only what happened.** Use the answer below only if it matches your work. If there was no capacity test, explain that the initial configuration was conservative and not a formal sizing study, then distinguish how you would size it today (question 18). Do not invent a study or its measurements.

<details><summary>View prepared answer</summary>

For the initial implementation, I chose a conservative capacity that I knew would support the workload without risking underprovisioning. I didn't consider that value final. The plan was to right-size the cache based on performance tests, looking at memory usage, number of keys, hit rate, miss rate and evictions. The squad then performed the detailed capacity validation.

</details>

### 18. How would you size it today?

<details><summary>View prepared answer</summary>

I would start by estimating the amount of data that can be cached at the same time, considering the average entry size and expected number of keys. I would also leave headroom for overhead and growth. But I wouldn't finalize the sizing based only on estimates. I would validate it through load testing and monitor memory usage, evictions, hit ratio and latency.

</details>

Memory consistently near its limit with frequent evictions may indicate undersizing or TTL and retention settings that need review.

## Additional follow-up questions

Authorial follow-ups for deeper discussion. If a fact is unknown, say so and explain how you would verify it.

### A1. Who published the event to SNS? What if the DynamoDB write succeeded and the publish failed?

<details><summary>View answer: what to include</summary>

This is the dual-write problem discussed in the introductory material: without appropriate handling, the new portfolio can be stored while the cache continues serving the old one for up to seven hours. Explain what actually published the event—for example, a table stream or application code after the write—and what staleness risk was accepted for recommendations.

</details>

### A2. What if the invalidation Lambda failed?

<details><summary>View answer: what to include</summary>

An asynchronous invocation may be retried and can have a failure destination. Once retries are exhausted, the old entry may survive until its TTL. State whether there was a failure queue or alarm; if there was not, acknowledge that limitation.

</details>

### A3. What was the timeout on the call to Valkey?

<details><summary>View answer: what to include</summary>

Fallback protects the journey only if cache access fails promptly. A slow but reachable Valkey can make each request wait before calling the source, leaving the journey slower than without caching. Give the configured timeout if known, or explain how you would check it.

</details>

### A4. If Valkey goes down, all traffic hits the slow dependencies at once. Can they handle it?

<details><summary>View answer: what to include</summary>

Fallback moves load back to already-slow sources, including EQ3, which was not owned by your team. Explain any protection that existed, such as concurrency limits or a circuit breaker, or identify the accepted risk if none existed.

</details>

### A5. What was the cache hit rate? Does the 189 ms average include misses?

<details><summary>View answer: what to include</summary>

Identify where the numbers came from: performance testing or production, request count and observation period. If hit rate was not measured, say so. Answer 14 already identifies the original comparison as an average.

</details>

### A6. Was the ~90% reduction for the dependencies or for the whole journey?

<details><summary>View answer: what to include</summary>

These figures measure the two integrations. Do not claim an end-to-end improvement without measuring the journey. Keep values and definitions consistent across interviews, while distinguishing earlier rounded figures.

</details>

### A7. Can a read that started before the invalidation write the old portfolio back into the cache?

<details><summary>View answer: what to include</summary>

This can happen in cache-aside: a read fetches the old value, invalidation happens, and the read writes that old value back afterwards. Possible mitigations include versioned keys or another delayed invalidation. Distinguish options discussed today from mechanisms actually used, and explain the accepted risk for recommended portfolios.

</details>

</section>

</div>
