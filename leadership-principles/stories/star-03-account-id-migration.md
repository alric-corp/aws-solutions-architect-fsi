# STAR-03 — Migração para idConta sem quebrar consumidores

<div data-story-locales data-story-title-pt="STAR-03 — Migração para idConta sem quebrar consumidores" data-story-title-en="STAR-03 — Migrating to idConta without breaking consumers">

<section data-story-locale="pt-BR" lang="pt-BR">

**No loop:** Customer Obsession como principal de preparação, tendo os consumidores da API como clientes, e Ownership como alternativa. A escolha depende da pergunta, sem mudar os fatos.

[Foco do loop](../loop-focus.md) · [Customer Obsession](../01-customer-obsession.md) · [Ownership](../02-ownership.md)

> Relato autoral de Vitória, fornecido pelo proprietário. Tradução de estudo; execução e métricas não auditadas nesta página.

## STAR

**Situação.** No Itaú, eu atuava em uma API da jornada de investimentos responsável por identificar a carteira recomendada de cada cliente. Historicamente, essa identificação usava **agência, conta e DAC**. Na modernização do banco, o modelo estava sendo substituído pelo **idConta do EQ3**, um identificador padronizado que reduz a necessidade de trafegar diretamente com esses dados bancários. O desafio era fazer a mudança sem interromper os consumidores que ainda dependiam do contrato legado.

**Tarefa.** Como responsável pela visão de backend, minha responsabilidade era desenhar uma migração para adotar o **idConta** sem interromper os consumidores atuais.

**Ação.** Desenhei um fluxo compatível com os dois formatos. Ajustei a persistência para salvar novas alocações de carteiras com **idConta**. Depois, adaptei a API: quando o consumidor enviava **agência, conta e DAC**, a aplicação consultava o **EQ3**, obtinha o idConta e buscava a carteira; quando já enviava **idConta**, fazia bypass dessa consulta e usava o identificador diretamente. Mantive temporariamente os dois formatos no contrato para permitir a migração gradual dos consumidores.

**Resultado.** Modernizamos a identificação das carteiras sem interromper os consumidores existentes. As novas carteiras passaram a usar **idConta**, enquanto os consumidores do formato anterior continuaram funcionando. Os já migrados eliminaram uma chamada ao **EQ3** nesse fluxo, reduzindo dependência externa e a latência adicional da consulta. A solução ficou preparada para a descontinuação gradual do formato antigo, conforme os demais consumidores migrarem.

**Aprendizado.** Aprendi a preservar compatibilidade durante uma modernização. Com vários consumidores, uma transição gradual pode reduzir o risco de quebra em comparação com migrar tudo de uma vez. Também reforcei a importância de evitar chamadas desnecessárias quando o identificador já está disponível no payload. Isso não substitui a verificação de vínculo e autorização que o fluxo exigir.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Por que não migrar tudo de uma vez?

<details><summary>Ver resposta preparada</summary>

Porque tínhamos vários consumidores em ritmos diferentes de evolução. Uma migração big bang aumentaria muito o risco de quebra. Por isso mantivemos compatibilidade temporária, permitindo que cada consumidor migrasse no próprio ritmo.

</details>

### 2. Por que fazer bypass do serviço de identificação de conta?

<details><summary>Ver resposta preparada</summary>

Se o consumidor já enviava `idConta`, não fazia sentido chamar outra dependência só para obter uma informação que já estava disponível. Isso eliminava uma chamada de rede e reduzia dependência e latência.

</details>

### 3. Como garantir que o idConta estava correto?

<details><summary>Ver resposta preparada</summary>

Essa associação era garantida no momento de gravar a alocação. Nesse fluxo, utilizávamos o EQ3 para obter o `idConta` correspondente e então persistíamos a relação entre cliente e carteira usando esse identificador.

</details>

### 4. E se o serviço de identificação de conta falhasse?

<details><summary>Ver resposta preparada</summary>

No fluxo assíncrono de gravação, faz sentido usar retry com exponential backoff para falhas temporárias e, após esgotar as tentativas, direcionar a mensagem para uma DLQ para investigação ou reprocessamento.

</details>

Separe o que foi implementado do que é proposta antes de usar esta resposta (veja A3).

### 5. O que é exponential backoff?

<details><summary>Ver resposta preparada</summary>

É aumentar progressivamente o tempo entre as tentativas. Em vez de repetir imediatamente e pressionar ainda mais uma dependência com problema, você espera cada vez mais entre os retries.

</details>

### 6. Como evitar duplicidade com retry?

<details><summary>Ver resposta preparada</summary>

Eu procuraria garantir idempotência no processamento, usando uma chave única da operação ou verificando se aquela associação já foi persistida antes de gravar novamente.

</details>

### 7. Como evitar que o legado fique para sempre?

<details><summary>Ver resposta preparada</summary>

Eu acompanharia quais consumidores ainda usam o contrato antigo, definiria uma data de descontinuação, comunicaria os times com antecedência e monitoraria a queda de uso até remover o suporte legado.

</details>

### 8. Quais métricas você acompanharia?

<details><summary>Ver resposta preparada</summary>

Percentual de chamadas com `idConta` versus agência/conta/DAC, quantidade de chamadas ao EQ3, erros de conversão, retries, mensagens em DLQ e latência dos dois caminhos.

</details>

### 9. Qual o trade-off de manter dois contratos?

<details><summary>Ver resposta preparada</summary>

Reduzimos o risco da migração, mas aumentamos temporariamente a complexidade da API, porque precisamos suportar e testar dois caminhos. Por isso esse suporte precisa ter prazo para ser removido.

</details>

### 10. Como você lidaria com um consumidor que não migrou até a data limite?

<details><summary>Ver resposta preparada</summary>

Primeiro eu verificaria a criticidade e o motivo do atraso. Tentaria trabalhar com o time em um plano de migração, mas evitaria manter o legado indefinidamente. Se necessário, negociaria uma extensão controlada com nova data e acompanhamento claro.

</details>

Esta resposta é hipotética. Se algum consumidor de fato atrasou, conte o que aconteceu: pode virar o “não” a um cliente que falta em Customer Obsession.

### 11. Isso é tokenização ou anonimização?

<details><summary>Ver resposta preparada</summary>

Eu trataria o `idConta` como um identificador interno padronizado que reduz a necessidade de trafegar diretamente com agência, conta e DAC. Eu não classificaria como tokenização ou anonimização sem conhecer exatamente como esse identificador é gerado e governado.

</details>

### 12. O que você faria diferente hoje?

<details><summary>Ver resposta preparada</summary>

Eu manteria a estratégia de migração gradual, mas colocaria métricas desde o início para acompanhar a adoção do `idConta`, a queda do uso do contrato legado e a redução de chamadas ao EQ3. Também definiria desde o começo uma estratégia clara de depreciação e data-alvo para remoção do formato antigo.

</details>

## Aprofundamento: perguntas novas

Perguntas autorais para aprofundar. Quando não souber um fato, diga que não sabe e como o confirmaria.

### A1. E as carteiras já gravadas com agência, conta e DAC?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Só as novas alocações passaram a usar `idConta`. Quando um consumidor manda `idConta` para um cliente antigo, como a busca encontra a carteira? Diga se houve backfill dos registros antigos, dupla chave ou conversão na leitura, e como você validou o resultado.

</details>

### A2. Quantos consumidores havia e quantos migraram?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Descreva a quantidade de consumidores e a adoção quando houver evidência. Se a adoção não é medida hoje, diga isso e identifique as métricas da resposta 8 como uma melhoria proposta, não como implementação concluída.

</details>

### A3. O retry com backoff e a DLQ foram implementados ou é o que você faria?

<details><summary>Ver resposta: o que precisa aparecer</summary>

A resposta 4 usa “faz sentido”, e o entrevistador vai separar o que existiu do que é proposta. Diga qual era o caso e mantenha a proposta identificada como proposta.

</details>

### A4. Quem pediu a mudança e quem decidiu manter os dois contratos?

<details><summary>Ver resposta: o que precisa aparecer</summary>

A modernização veio do banco; a forma da migração parece ter sido decisão sua. Deixe claro o que foi iniciativa sua além do pedido. É isso que sustenta a história como Ownership.

</details>

### A5. Do ponto de vista da LGPD, o idConta deixa de ser dado pessoal?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Não presuma que a introdução do idConta torna a informação anônima. Explique o que sabe sobre geração, vínculo com uma pessoa e governança, e o que ainda precisa confirmar. Reduzir a exposição direta de dados bancários não comprova, por si só, anonimização nem elimina os cuidados de proteção.

</details>

### A6. Como você testou os dois caminhos?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Testes de contrato para os dois formatos e uma comparação: para o mesmo cliente, os dois caminhos devolvem a mesma carteira? Diga o que foi feito de fato.

</details>

</section>

<section data-story-locale="en-US" lang="en-US">

**Loop preparation:** Customer Obsession as the primary mapping, with API consumers as customers, and Ownership as an alternative. Select the emphasis for the question without changing the facts.

[Loop focus](../loop-focus.md) · [Customer Obsession](../01-customer-obsession.md) · [Ownership](../02-ownership.md)

> Original account by Vitória, supplied by the owner. Study translation; execution and metrics have not been audited on this page.

## STAR

**Situation.** At Itaú, I worked on an investment-journey API that identified each customer’s recommended portfolio. Historically, identification used **branch, account and DAC**. As part of bank modernization, this was being replaced with **idConta from EQ3**, a standardized identifier that reduces the need to transmit those banking details directly. The challenge was to change the flow without interrupting consumers that still relied on the legacy contract.

**Task.** As the person responsible for the backend view, I needed to design a migration to **idConta** without breaking existing consumers.

**Action.** I designed a flow compatible with both formats. I updated persistence so that new portfolio allocations used **idConta**. I then adapted the API: when a consumer sent **branch, account and DAC**, the application queried **EQ3**, obtained idConta and retrieved the portfolio; when the consumer already supplied **idConta**, it bypassed that lookup and used the identifier directly. I temporarily kept both contract formats so consumers could migrate gradually.

**Result.** We modernized portfolio identification without interrupting existing consumers. New portfolios used **idConta**, while consumers sending the previous format kept working. Migrated consumers removed one **EQ3** call from this flow, reducing an external dependency and its additional lookup latency. The solution was ready for gradual retirement of the old format as the remaining consumers migrated.

**Learning.** I reinforced the importance of backward compatibility during modernization. With several consumers, gradual migration can reduce breaking-change risk compared with moving everyone at once. I also reinforced avoiding unnecessary calls when the identifier is already in the payload. That does not replace whatever relationship and authorization checks the flow requires.

## Prepared questions

Answer aloud before opening.

### 1. Why not migrate everything at once?

<details><summary>View prepared answer</summary>

Because we had multiple consumers with different migration timelines. A big-bang migration would have increased the risk of breaking integrations, so we temporarily supported both formats and allowed consumers to migrate gradually.

</details>

### 2. Why bypass the EQ3?

<details><summary>View prepared answer</summary>

If the consumer already provided `idConta`, there was no reason to call another dependency to retrieve information we already had. That removed one network call and reduced both dependency and latency.

</details>

### 3. How did you make sure the idConta was correct?

<details><summary>View prepared answer</summary>

We ensured that during the allocation write flow. At that point, we used the EQ3 to obtain the corresponding `idConta` and persisted the relationship between the customer and the portfolio using that identifier.

</details>

### 4. What if the EQ3 failed?

<details><summary>View prepared answer</summary>

In the asynchronous write flow, temporary failures could be handled with retries using exponential backoff. After the retries were exhausted, the message could be sent to a dead-letter queue for investigation or reprocessing.

</details>

Separate implemented behavior from a proposal before using this answer (see A3).

### 5. What is exponential backoff?

<details><summary>View prepared answer</summary>

It means progressively increasing the delay between retries. Instead of retrying immediately and putting more pressure on a failing dependency, you wait longer between attempts.

</details>

### 6. How do you avoid duplicates when retrying?

<details><summary>View prepared answer</summary>

I would make the processing idempotent, using a unique operation key or checking whether that association had already been persisted before writing it again.

</details>

### 7. How do you keep the legacy path from living forever?

<details><summary>View prepared answer</summary>

I would track which consumers were still using the legacy contract, define a deprecation date, communicate it in advance and monitor usage until the old path could be safely removed.

</details>

### 8. Which metrics would you track?

<details><summary>View prepared answer</summary>

I would track the percentage of requests using `idConta` versus the legacy format, the number of calls to the EQ3, conversion errors, retries, DLQ messages and latency for both paths.

</details>

### 9. What's the trade-off of keeping two contracts?

<details><summary>View prepared answer</summary>

We reduced migration risk, but temporarily increased API complexity because we had to support and test two paths. That's why legacy support needs a clear deprecation plan.

</details>

### 10. How would you handle a consumer that hadn't migrated by the deadline?

<details><summary>View prepared answer</summary>

I would first understand the consumer's criticality and why the migration was delayed. I would work with the team on a migration plan, but I would avoid keeping the legacy path indefinitely. If necessary, I would agree on a controlled extension with a new deadline and clear tracking.

</details>

This is a hypothetical response. If a consumer actually missed the deadline, describe that event instead; it may provide a real difficult-customer example.

### 11. Is this tokenization or anonymization?

<details><summary>View prepared answer</summary>

I would describe `idConta` as a standardized internal identifier that reduces the need to expose branch, account and DAC directly. I wouldn't classify it as tokenization or anonymization without knowing exactly how that identifier is generated and governed.

</details>

### 12. What would you do differently today?

<details><summary>View prepared answer</summary>

I would keep the gradual migration strategy, but I would add metrics from the beginning to track `idConta` adoption, legacy usage and the reduction in calls to the EQ3. I would also define a clear deprecation strategy and target date for removing the old format.

</details>

## Additional follow-up questions

Authorial follow-ups for deeper discussion. If a fact is unknown, say so and explain how you would verify it.

### A1. What about the portfolios already stored with branch, account and DAC?

<details><summary>View answer: what to include</summary>

Only new allocations are stated to use idConta. If a consumer sends idConta for an older customer, how does lookup find the portfolio? Explain whether older records were backfilled, used two keys or were converted during reads, and how the result was validated.

</details>

### A2. How many consumers were there, and how many have migrated?

<details><summary>View answer: what to include</summary>

Describe consumer count and adoption where evidence exists. If adoption is not measured today, say so and identify the metrics from answer 8 as a proposed improvement rather than a completed implementation.

</details>

### A3. Were the retries with backoff and the DLQ implemented, or is that what you would do?

<details><summary>View answer: what to include</summary>

Answer 4 says the strategy “would make sense.” Distinguish what was actually implemented from what you would propose, and retain that distinction when answering.

</details>

### A4. Who asked for the change, and who decided to keep both contracts?

<details><summary>View answer: what to include</summary>

The modernization request came from the bank; clarify what you personally decided or initiated in the migration design beyond that request. That contribution is what supports Ownership.

</details>

### A5. From a data-protection standpoint, does idConta stop being personal data?

<details><summary>View answer: what to include</summary>

Do not assume that introducing idConta makes information anonymous. Explain what is known about how it is generated, linked to a person and governed, and what still requires confirmation. Reducing direct exposure of banking details does not by itself establish anonymization or remove protection requirements.

</details>

### A6. How did you test both paths?

<details><summary>View answer: what to include</summary>

Explain the contract tests actually run for both formats and any comparison showing that both paths returned the same portfolio for the same customer. Do not present a test proposed today as one already executed.

</details>

</section>

</div>
