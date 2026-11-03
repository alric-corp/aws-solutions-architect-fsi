# STAR-02 — Cache para duas dependências lentas

**No loop:** Deliver Results ★ como principal e Dive Deep ★ como alternativa. Também evidencia Customer Obsession ★ e Ownership ★. Na tabela original o principal era Invent and Simplify, que não está entre os focos.

[Foco do loop](../loop-focus.md) · [Deliver Results](../14-deliver-results.md) · [Dive Deep](../12-dive-deep.md)

> Versão anonimizada: empresa e sistemas internos aparecem pela função. Os números são os do relato original.

## STAR

**Situação.** No banco, sempre atuei em aplicações da jornada de investimentos, com metas de melhoria de performance e latência. Em análises de performance, identifiquei duas dependências que pesavam no tempo de resposta da jornada: o serviço de carteiras-modelo, que retorna as carteiras recomendadas aos clientes, e o serviço de identificação de conta, que recupera dados de identificação da conta do cliente. As duas retornavam informações que mudavam pouco, mas eram consultadas repetidamente.

**Tarefa.** Reduzir a latência dessas chamadas e o tempo de resposta da jornada, sem criar uma dependência do cache que pudesse comprometer a disponibilidade da aplicação.

**Ação.** Analisei testes de performance, dashboards no Datadog e traces para localizar os principais pontos de latência. Implementei cache com Valkey usando cache-aside, mantendo a API de origem como fallback em caso de cache miss ou indisponibilidade do cache. Configurei TTL de 7 horas e, no fluxo de carteiras-modelo, uma invalidação orientada a eventos: quando uma nova carteira recomendada era salva na base de origem, no DynamoDB, um evento no SNS acionava uma Lambda que invalidava a entrada correspondente no cache.

**Resultado.** No serviço de carteiras-modelo, a latência média caiu de aproximadamente 2,41 s para 189 ms. No serviço de identificação de conta, de aproximadamente 1,27 s para 119 ms. Foi uma redução de cerca de 90% na latência das duas integrações, com menos chamadas repetidas aos sistemas de origem e sem tornar o cache obrigatório para a aplicação funcionar.

**Aprendizado.** Cache não é só guardar uma resposta para ficar mais rápido. A estratégia depende de como o dado é lido, atualizado e de quanto tempo ele pode ficar desatualizado; por isso também precisei pensar em consistência, expiração, invalidação e comportamento em falha. E aprendi a olhar performance orientada a métricas: primeiro localizar a latência, depois escolher a otimização.

## Termos para o aprofundamento

| Padrão | Como funciona | Quando usar |
|---|---|---|
| Cache-aside | A aplicação consulta o cache; no miss, busca na origem e grava no cache. Foi o seu caso. | A origem continua sendo a fonte de verdade e o cache não pode ser obrigatório. |
| Read-through | O próprio mecanismo de cache busca na origem quando há miss. | Centralizar a lógica de leitura fora da aplicação. |
| Write-through | Cada escrita vai ao cache e à origem de forma coordenada. | O cache precisa estar atualizado logo após cada alteração. |
| Write-behind | A escrita vai primeiro ao cache; a origem é atualizada depois. | Escrita muito rápida, com consistência eventual aceita. |
| Refresh-ahead | O cache atualiza itens antes de expirarem. | Dados muito acessados, em que o miss seria percebido pelo cliente. |

Hit é encontrar a chave no cache. Miss é não encontrar e ir à origem. Falha é o cache com problema de verdade. Eviction é o cache removendo itens para liberar memória.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Por que cache?

EN: *Why caching?*

<details><summary>Ver resposta preparada</summary>

**PT:** Os dados eram consultados com muita frequência, mas mudavam com uma frequência muito menor. Além disso, através dos testes de performance, dashboards no Datadog e tracing, identifiquei que essas chamadas contribuíam significativamente para a latência. Por isso o cache fazia sentido: reduzia chamadas repetidas e melhorava o tempo de resposta para o cliente.

**EN:** The data was read frequently but changed much less frequently. Through performance tests, Datadog dashboards and tracing, I also identified that these downstream calls were contributing significantly to our latency. So caching was a good fit because it reduced repeated calls while improving customer response time.

</details>

### 2. Por que cache-aside?

EN: *Why cache-aside?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque eu queria que as APIs de origem continuassem sendo a source of truth. O cache deveria melhorar a performance, mas não se tornar uma dependência obrigatória. Em caso de cache miss, a aplicação buscava o dado na origem e depois atualizava o cache.

**EN:** I wanted the source APIs to remain the source of truth. The cache was intended to improve performance without becoming a mandatory dependency. On a cache miss, the application retrieved the data from the source and then populated the cache.

</details>

### 3. E se o Valkey ficasse indisponível?

EN: *What if Valkey became unavailable?*

<details><summary>Ver resposta preparada</summary>

**PT:** A aplicação continuava consultando a API de origem. O cache era uma otimização de performance, então eu não queria que uma indisponibilidade dele interrompesse a jornada do cliente.

**EN:** The application could continue calling the source API. The cache was a performance optimization, so I didn't want a cache failure to make the customer journey unavailable.

</details>

### 4. Qual a diferença entre cache miss e falha do cache?

EN: *What's the difference between a cache miss and a cache failure?*

<details><summary>Ver resposta preparada</summary>

**PT:** Cache miss significa que o cache está funcionando, mas não possui aquela chave. Já cache failure significa que ocorreu uma falha ao acessar ou gravar no cache. Nos dois casos, a aplicação conseguia recorrer à fonte original.

**EN:** A cache miss means the cache is working but doesn't contain that key. A cache failure means there was an error accessing or writing to the cache. In both cases, the application could fall back to the source system.

</details>

### 5. Por que TTL e também invalidação orientada a eventos?

EN: *Why both a TTL and event-driven invalidation?*

<details><summary>Ver resposta preparada</summary>

**PT:** O TTL garantia que uma entrada não permanecesse indefinidamente no cache. Já a invalidação orientada a eventos permitia remover o dado assim que soubéssemos que a origem havia mudado, sem precisar esperar as 7 horas expirarem.

**EN:** The TTL ensured that entries wouldn't remain cached indefinitely. Event-driven invalidation allowed us to remove the cached data as soon as we knew the source had changed, without waiting for the seven-hour TTL to expire.

</details>

### 6. Como funcionava SNS com Lambda?

EN: *How did SNS and Lambda work together?*

<details><summary>Ver resposta preparada</summary>

**PT:** Quando uma nova carteira recomendada era salva na base de origem, no DynamoDB, um evento era publicado no SNS. Esse evento acionava uma Lambda responsável por invalidar a entrada correspondente no Valkey. Assim, a próxima consulta buscava o dado atualizado na origem.

**EN:** When a new recommended portfolio was saved in the source DynamoDB, an event was published to SNS. That event triggered a Lambda responsible for invalidating the corresponding entry in Valkey. The next request would then retrieve the updated data from the source.

</details>

### 7. Por que SNS?

EN: *Why SNS?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque eu queria desacoplar a publicação da nova carteira da lógica de invalidação do cache. O sistema que publicava a carteira não precisava conhecer os detalhes de como o cache seria invalidado.

**EN:** Because I wanted to decouple the portfolio publication from the cache invalidation logic. The system publishing the portfolio didn't need to know the details of how the cache would be invalidated.

</details>

### 8. Por que Lambda?

EN: *Why Lambda?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque era uma tarefa curta, pontual e orientada a evento. A Lambda só precisava executar quando uma nova carteira fosse publicada.

**EN:** Because it was a short, event-driven task. The Lambda only needed to run when a new portfolio was published.

</details>

### 9. Como você mediu o resultado?

EN: *How did you measure the result?*

<details><summary>Ver resposta preparada</summary>

**PT:** Fizemos testes antes e depois da implementação e avaliamos a latência média das requisições. No serviço de carteiras-modelo, a latência caiu de aproximadamente 2,41 segundos para 189 milissegundos. No serviço de identificação de conta, de aproximadamente 1,27 segundo para 119 milissegundos, uma redução de cerca de 90%.

**EN:** We compared performance before and after the implementation using average request latency. The model-portfolio service went from around 2.41 seconds to 189 milliseconds, and the account identification service went from around 1.27 seconds to 119 milliseconds, which was roughly a 90% reduction in latency.

</details>

### 10. Por que não otimizar diretamente a API de origem?

EN: *Why not optimize the source API directly?*

<details><summary>Ver resposta preparada</summary>

**PT:** Nem todas as APIs pertenciam ao meu time, principalmente o serviço de identificação de conta. Além disso, o padrão de acesso era muito favorável a cache: muitas leituras e poucas alterações. Então conseguimos melhorar nossa latência e reduzir chamadas downstream sem depender de mudanças em outro sistema.

**EN:** Not all source APIs belonged to my team, especially the account identification service. Also, the access pattern was well suited for caching: many reads and relatively few changes. This allowed us to improve latency and reduce downstream calls without depending on changes in another system.

</details>

### 11. Quais foram os trade-offs?

EN: *What were the trade-offs?*

<details><summary>Ver resposta preparada</summary>

**PT:** O principal ganho foi performance e redução de chamadas downstream. Em contrapartida, adicionamos complexidade relacionada a consistência, expiração, invalidação, observabilidade e tratamento de falhas.

**EN:** The main benefits were better performance and fewer downstream calls. The trade-off was additional complexity around consistency, expiration, invalidation, observability and failure handling.

</details>

### 12. Quando você não usaria cache?

EN: *When would you not use a cache?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu evitaria cache quando o dado muda constantemente, quando existe exigência muito forte de consistência imediata ou quando a chamada original já é suficientemente rápida e o cache não traz benefício relevante.

**EN:** I would avoid caching when the data changes very frequently, when strict immediate consistency is required, or when retrieving the original data is already fast enough that caching wouldn't provide meaningful value.

</details>

### 13. O que você monitoraria?

EN: *What would you monitor?*

<details><summary>Ver resposta preparada</summary>

**PT:** Hoje eu acompanharia hit rate, miss rate, latência do cache, erros, uso de memória e evictions. Também mediria se o cache realmente está reduzindo chamadas aos sistemas downstream e melhorando a latência ponta a ponta da jornada.

**EN:** Besides the health of Valkey itself, I would monitor hit rate, miss rate, cache latency, errors, memory usage and evictions. I would also measure whether the cache is actually reducing downstream calls and improving end-to-end journey latency.

</details>

### 14. Média, p95 ou p99?

EN: *Average, p95 or p99?*

<details><summary>Ver resposta preparada</summary>

**PT:** Na implementação original eu utilizei principalmente a média para comparar antes e depois. Hoje eu também acompanharia p95 e p99, porque eles mostram melhor a experiência das requisições mais lentas e evitam que a média esconda outliers.

**EN:** In the original implementation, I mainly used average latency to compare before and after. Today I would also monitor p95 and p99 because they give better visibility into slower requests and prevent the average from hiding outliers.

</details>

### 15. O que você faria diferente hoje?

EN: *What would you do differently today?*

<details><summary>Ver resposta preparada</summary>

**PT:** Hoje eu manteria a mesma estratégia geral, mas acompanharia também métricas como cache hit ratio, p95 e p99, impacto real nas chamadas downstream e possíveis cenários de cache stampede. Também avaliaria se o TTL continuava adequado com base no comportamento real dos dados.

**EN:** Today I would keep the same overall strategy, but I would also monitor cache hit ratio, p95 and p99 latency, the actual reduction in downstream calls and possible cache stampede scenarios. I would also continuously evaluate whether the TTL was still appropriate based on the actual data behavior.

</details>

### 16. O que você aprendeu?

EN: *What did you learn?*

<details><summary>Ver resposta preparada</summary>

**PT:** Esse trabalho reforçou para mim que cache não é simplesmente armazenar uma resposta para deixá-la mais rápida. Existem diferentes estratégias de cache, e a escolha depende de como o dado é lido e atualizado. Também é preciso pensar em consistência, expiração, invalidação e comportamento em caso de falha.

**EN:** This project reinforced that caching isn't simply storing a response to make it faster. There are different caching strategies, and the right choice depends on how the data is read and updated. You also need to consider consistency, expiration, invalidation and failure behavior.

</details>

### 17. Como você definiu a memória do Valkey?

EN: *How did you size the cache?*

**Responda só o que aconteceu.** Use a resposta abaixo apenas se ela descreve o que você fez. Se não houve teste de capacidade, diga que começou com uma configuração conservadora, sem estudo formal, e mostre como faria hoje (pergunta 18). Um estudo inventado não resiste ao follow-up, que pede os números dele.

<details><summary>Ver resposta preparada</summary>

**PT:** Na primeira implementação, eu defini uma capacidade inicial conservadora que suportaria o cenário sem risco de subdimensionamento. Eu não considerei aquele valor como definitivo: a ideia era colocar a solução em funcionamento e depois fazer o right-sizing com testes de performance, observando consumo de memória, taxa de acertos e de misses e se estavam ocorrendo evictions. A validação mais detalhada da capacidade ficou com a squad.

**EN:** For the initial implementation, I chose a conservative capacity that I knew would support the workload without risking underprovisioning. I didn't consider that value final. The plan was to right-size the cache based on performance tests, looking at memory usage, number of keys, hit rate, miss rate and evictions. The squad then performed the detailed capacity validation.

</details>

### 18. Como você faria o sizing hoje?

EN: *How would you size it today?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu começaria estimando o volume de dados que realmente pode ficar simultaneamente no cache, considerando o tamanho médio das entradas e a quantidade esperada de chaves. Depois adicionaria margem para overhead e crescimento. Mas eu não fecharia o sizing apenas por estimativa: validaria com teste de carga e observaria memória utilizada, evictions, hit ratio e latência antes de definir a capacidade final.

**EN:** I would start by estimating the amount of data that can be cached at the same time, considering the average entry size and expected number of keys. I would also leave headroom for overhead and growth. But I wouldn't finalize the sizing based only on estimates. I would validate it through load testing and monitor memory usage, evictions, hit ratio and latency.

</details>

Memória sempre perto do limite com muitas evictions pode indicar cache pequeno demais, ou TTL e política de retenção que precisam ser revistos.

## Aprofundamento: perguntas novas

São os pontos que um entrevistador vai apertar. Quando não souber um fato, diga que não sabe e como confirmaria.

### A1. Quem publicava o evento no SNS? E se a gravação no DynamoDB desse certo e a publicação falhasse?

EN: *Who published the event to SNS? What if the DynamoDB write succeeded and the publish failed?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

É o problema de dupla escrita estudado no P0: sem tratamento, a carteira nova fica na base, mas o cache continua servindo a antiga por até 7 horas. Diga como era de fato, por exemplo se o evento saía de um stream da tabela ou da própria aplicação depois da gravação, e qual risco foi aceito para carteiras recomendadas.

</details>

### A2. E se a Lambda de invalidação falhasse?

EN: *What if the invalidation Lambda failed?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Uma invocação assíncrona tem novas tentativas e pode ter destino de falha. Esgotadas as tentativas, a entrada antiga vive até o TTL. Diga se havia fila de falhas ou alerta; se não havia, reconheça o limite.

</details>

### A3. Qual era o timeout da chamada ao Valkey?

EN: *What was the timeout on the call to Valkey?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

O fallback só protege se o cache falhar rápido. Um Valkey lento, e não fora do ar, faz cada requisição esperar antes de ir à origem, e a jornada fica mais lenta do que sem cache. Responda com o valor configurado, se souber, ou diga como verificaria.

</details>

### A4. Se o Valkey cair, todo o tráfego volta para as dependências lentas de uma vez. Elas aguentam?

EN: *If Valkey goes down, all traffic hits the slow dependencies at once. Can they handle it?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

O fallback desloca a carga para origens que já eram lentas e que, no caso do serviço de identificação de conta, não pertenciam ao seu time. Mencione a proteção que existia, como limite de concorrência ou circuit breaker, ou o risco, se não existia.

</details>

### A5. Qual era a taxa de acerto do cache? A média de 189 ms inclui os misses?

EN: *What was the cache hit rate? Does the 189 ms average include misses?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Diga de onde vêm os números: teste de performance ou produção, quantas requisições, qual período. Se o hit rate não foi medido, diga isso; a resposta 14 já reconhece que a comparação usou a média.

</details>

### A6. A redução de cerca de 90% foi das dependências ou da jornada inteira?

EN: *Was the ~90% reduction for the dependencies or for the whole journey?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Os números medem as duas integrações. Não chame de ganho ponta a ponta sem uma medida da jornada. Use também os mesmos valores e a mesma definição em todas as entrevistas: na primeira, os números foram citados arredondados.

</details>

### A7. Uma leitura que começou antes da invalidação pode regravar a carteira antiga no cache?

EN: *Can a read that started before the invalidation write the old portfolio back into the cache?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Sim, é uma corrida conhecida do cache-aside: a leitura busca o valor antigo, a invalidação acontece, e a leitura grava o valor antigo depois dela. Mitigações comuns são versionar a chave ou repetir a invalidação com atraso. Diga se esse risco era aceitável para carteiras recomendadas e por quê.

</details>
