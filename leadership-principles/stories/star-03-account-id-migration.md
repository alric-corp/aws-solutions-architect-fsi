# STAR-03 — Migração para idConta sem quebrar consumidores

**No loop:** Customer Obsession ★ como principal, com os consumidores da API como clientes, e Ownership ★ como alternativa. Na tabela original o principal era Ownership; no mapa do loop, STAR-05 ficou com Ownership para que as histórias não se repitam.

[Foco do loop](../loop-focus.md) · [Customer Obsession](../01-customer-obsession.md) · [Ownership](../02-ownership.md)

> Versão anonimizada: empresa e sistemas internos aparecem pela função. Os números são os do relato original.

## STAR

**Situação.** No banco, eu atuava em uma API da jornada de investimentos responsável por identificar qual carteira recomendada estava associada a cada cliente. Historicamente, essa identificação usava agência, conta e DAC. Como parte de uma iniciativa de modernização, esse modelo estava sendo substituído pelo `idConta`, fornecido pelo serviço de identificação de conta: um identificador padronizado que reduz a necessidade de trafegar diretamente com dados bancários sensíveis. O desafio era fazer a mudança sem interromper os diversos consumidores da API que ainda dependiam do contrato legado.

**Tarefa.** Como responsável pela visão de backend da solução, desenhar uma migração que permitisse adotar o `idConta` sem interromper os consumidores atuais.

**Ação.** Desenhei um fluxo compatível com os dois formatos. Primeiro, ajustei o modelo de persistência para que as novas alocações de carteiras fossem salvas com o `idConta` como identificador do cliente. Depois, adaptei a API para suportar os dois formatos durante a migração: quando o consumidor ainda enviava agência, conta e DAC, a aplicação consultava o serviço de identificação de conta, convertia para `idConta` e buscava a carteira; quando o consumidor já enviava o `idConta`, eu fazia o bypass dessa consulta e usava o identificador diretamente. Mantive temporariamente os dois formatos no contrato para que os consumidores migrassem gradualmente.

**Resultado.** Modernizamos a identificação das carteiras sem interromper os consumidores existentes. Todas as novas carteiras passaram a usar o `idConta`, enquanto os consumidores que ainda enviavam agência, conta e DAC continuaram funcionando. Os consumidores já migrados eliminaram uma chamada ao serviço de identificação de conta nesse fluxo, reduzindo uma dependência externa e a latência associada. A aplicação ficou preparada para a descontinuação gradual do formato legado.

**Aprendizado.** Esse trabalho reforçou a importância de manter compatibilidade com o formato antigo durante uma modernização. Nem sempre a melhor estratégia é migrar tudo de uma vez; com vários consumidores, uma transição gradual reduz bastante o risco de quebra. Também reforçou que, se uma informação já está no payload, vale evitar chamadas desnecessárias a outras dependências.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Por que não migrar tudo de uma vez?

EN: *Why not migrate everything at once?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque tínhamos vários consumidores em ritmos diferentes de evolução. Uma migração big bang aumentaria muito o risco de quebra. Por isso mantivemos compatibilidade temporária, permitindo que cada consumidor migrasse no próprio ritmo.

**EN:** Because we had multiple consumers with different migration timelines. A big-bang migration would have increased the risk of breaking integrations, so we temporarily supported both formats and allowed consumers to migrate gradually.

</details>

### 2. Por que fazer bypass do serviço de identificação de conta?

EN: *Why bypass the account identification service?*

<details><summary>Ver resposta preparada</summary>

**PT:** Se o consumidor já enviava `idConta`, não fazia sentido chamar outra dependência só para obter uma informação que já estava disponível. Isso eliminava uma chamada de rede e reduzia dependência e latência.

**EN:** If the consumer already provided `idConta`, there was no reason to call another dependency to retrieve information we already had. That removed one network call and reduced both dependency and latency.

</details>

### 3. Como garantir que o idConta estava correto?

EN: *How did you make sure the idConta was correct?*

<details><summary>Ver resposta preparada</summary>

**PT:** Essa associação era garantida no momento de gravar a alocação. Nesse fluxo, utilizávamos o serviço de identificação de conta para obter o `idConta` correspondente e então persistíamos a relação entre cliente e carteira usando esse identificador.

**EN:** We ensured that during the allocation write flow. At that point, we used the account identification service to obtain the corresponding `idConta` and persisted the relationship between the customer and the portfolio using that identifier.

</details>

### 4. E se o serviço de identificação de conta falhasse?

EN: *What if the account identification service failed?*

<details><summary>Ver resposta preparada</summary>

**PT:** No fluxo assíncrono de gravação, faz sentido usar retry com exponential backoff para falhas temporárias e, após esgotar as tentativas, direcionar a mensagem para uma DLQ para investigação ou reprocessamento.

**EN:** In the asynchronous write flow, temporary failures could be handled with retries using exponential backoff. After the retries were exhausted, the message could be sent to a dead-letter queue for investigation or reprocessing.

</details>

Separe o que foi implementado do que é proposta antes de usar esta resposta (veja A3).

### 5. O que é exponential backoff?

EN: *What is exponential backoff?*

<details><summary>Ver resposta preparada</summary>

**PT:** É aumentar progressivamente o tempo entre as tentativas. Em vez de repetir imediatamente e pressionar ainda mais uma dependência com problema, você espera cada vez mais entre os retries.

**EN:** It means progressively increasing the delay between retries. Instead of retrying immediately and putting more pressure on a failing dependency, you wait longer between attempts.

</details>

### 6. Como evitar duplicidade com retry?

EN: *How do you avoid duplicates when retrying?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu procuraria garantir idempotência no processamento, usando uma chave única da operação ou verificando se aquela associação já foi persistida antes de gravar novamente.

**EN:** I would make the processing idempotent, using a unique operation key or checking whether that association had already been persisted before writing it again.

</details>

### 7. Como evitar que o legado fique para sempre?

EN: *How do you keep the legacy path from living forever?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu acompanharia quais consumidores ainda usam o contrato antigo, definiria uma data de descontinuação, comunicaria os times com antecedência e monitoraria a queda de uso até remover o suporte legado.

**EN:** I would track which consumers were still using the legacy contract, define a deprecation date, communicate it in advance and monitor usage until the old path could be safely removed.

</details>

### 8. Quais métricas você acompanharia?

EN: *Which metrics would you track?*

<details><summary>Ver resposta preparada</summary>

**PT:** Percentual de chamadas com `idConta` versus agência/conta/DAC, quantidade de chamadas ao serviço de identificação de conta, erros de conversão, retries, mensagens em DLQ e latência dos dois caminhos.

**EN:** I would track the percentage of requests using `idConta` versus the legacy format, the number of calls to the account identification service, conversion errors, retries, DLQ messages and latency for both paths.

</details>

### 9. Qual o trade-off de manter dois contratos?

EN: *What's the trade-off of keeping two contracts?*

<details><summary>Ver resposta preparada</summary>

**PT:** Reduzimos o risco da migração, mas aumentamos temporariamente a complexidade da API, porque precisamos suportar e testar dois caminhos. Por isso esse suporte precisa ter prazo para ser removido.

**EN:** We reduced migration risk, but temporarily increased API complexity because we had to support and test two paths. That's why legacy support needs a clear deprecation plan.

</details>

### 10. Como você lidaria com um consumidor que não migrou até a data limite?

EN: *How would you handle a consumer that hadn't migrated by the deadline?*

<details><summary>Ver resposta preparada</summary>

**PT:** Primeiro eu verificaria a criticidade e o motivo do atraso. Tentaria trabalhar com o time em um plano de migração, mas evitaria manter o legado indefinidamente. Se necessário, negociaria uma extensão controlada com nova data e acompanhamento claro.

**EN:** I would first understand the consumer's criticality and why the migration was delayed. I would work with the team on a migration plan, but I would avoid keeping the legacy path indefinitely. If necessary, I would agree on a controlled extension with a new deadline and clear tracking.

</details>

Esta resposta é hipotética. Se algum consumidor de fato atrasou, conte o que aconteceu: pode virar o “não” a um cliente que falta em Customer Obsession.

### 11. Isso é tokenização ou anonimização?

EN: *Is this tokenization or anonymization?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu trataria o `idConta` como um identificador interno padronizado que reduz a necessidade de trafegar diretamente com agência, conta e DAC. Eu não classificaria como tokenização ou anonimização sem conhecer exatamente como esse identificador é gerado e governado.

**EN:** I would describe `idConta` as a standardized internal identifier that reduces the need to expose branch, account and DAC directly. I wouldn't classify it as tokenization or anonymization without knowing exactly how that identifier is generated and governed.

</details>

### 12. O que você faria diferente hoje?

EN: *What would you do differently today?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu manteria a estratégia de migração gradual, mas colocaria métricas desde o início para acompanhar a adoção do `idConta`, a queda do uso do contrato legado e a redução de chamadas ao serviço de identificação de conta. Também definiria desde o começo uma estratégia clara de depreciação e data-alvo para remoção do formato antigo.

**EN:** I would keep the gradual migration strategy, but I would add metrics from the beginning to track `idConta` adoption, legacy usage and the reduction in calls to the account identification service. I would also define a clear deprecation strategy and target date for removing the old format.

</details>

## Aprofundamento: perguntas novas

São os pontos que um entrevistador vai apertar. Quando não souber um fato, diga que não sabe e como confirmaria.

### A1. E as carteiras já gravadas com agência, conta e DAC?

EN: *What about the portfolios already stored with branch, account and DAC?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Só as novas alocações passaram a usar `idConta`. Quando um consumidor manda `idConta` para um cliente antigo, como a busca encontra a carteira? Diga se houve backfill dos registros antigos, dupla chave ou conversão na leitura, e como você validou o resultado.

</details>

### A2. Quantos consumidores havia e quantos migraram?

EN: *How many consumers were there, and how many have migrated?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Customer Obsession e Ownership pedem número. Se a adoção não é medida hoje, diga isso e aponte a resposta 8 como o que você implantaria.

</details>

### A3. O retry com backoff e a DLQ foram implementados ou é o que você faria?

EN: *Were the retries with backoff and the DLQ implemented, or is that what you would do?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

A resposta 4 usa “faz sentido”, e o entrevistador vai separar o que existiu do que é proposta. Diga qual era o caso e mantenha a proposta identificada como proposta.

</details>

### A4. Quem pediu a mudança e quem decidiu manter os dois contratos?

EN: *Who asked for the change, and who decided to keep both contracts?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

A modernização veio do banco; a forma da migração parece ter sido decisão sua. Deixe claro o que foi iniciativa sua além do pedido. É isso que sustenta a história como Ownership.

</details>

### A5. Do ponto de vista da LGPD, o idConta deixa de ser dado pessoal?

EN: *From a data-protection standpoint, does idConta stop being personal data?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Não. Um identificador que o banco consegue associar ao cliente continua sendo dado pessoal, pseudonimizado. A mudança reduz exposição de dados bancários, mas não elimina a obrigação de proteção. Combina com a cautela da resposta 11.

</details>

### A6. Como você testou os dois caminhos?

EN: *How did you test both paths?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Testes de contrato para os dois formatos e uma comparação: para o mesmo cliente, os dois caminhos devolvem a mesma carteira? Diga o que foi feito de fato.

</details>
