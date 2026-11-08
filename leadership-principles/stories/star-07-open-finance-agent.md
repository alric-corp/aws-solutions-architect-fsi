# STAR-07 — Saldo de Open Finance em um agente de IA

<div data-story-locales data-story-title-pt="STAR-07 — Saldo de Open Finance em um agente de IA" data-story-title-en="STAR-07 — Open Finance balances in an AI agent">

<section data-story-locale="pt-BR" lang="pt-BR">

> Relato autoral de Vitória, fornecido pelo proprietário. Tradução de estudo; execução e métricas não auditadas nesta página.

**Preparação:** Learn and Be Curious, Customer Obsession e Dive Deep são associações de estudo, não atribuições oficiais de entrevistadores.

[Foco do loop](../loop-focus.md) · [Learn and Be Curious](../05-learn-and-be-curious.md) · [Customer Obsession](../01-customer-obsession.md)

## STAR

**Situação.** Há cerca de um mês e meio, entrei em uma squad que trabalha com uma nova versão de um agente conversacional de IA para investimentos no **Itaú**. Até então, o agente tomava decisões olhando principalmente para as informações que o cliente tinha dentro do Itaú, o que limitava sua visão.

Como eu já havia trabalhado com **Open Finance** em outra situação, sugeri implementar essa feature. A ideia é permitir, aos poucos, que o agente considere informações externas, como saldo em outros bancos, investimentos e fatura de cartão, quando isso fizer sentido para a recomendação. O primeiro passo que assumi foi integrar o saldo externo.

**Tarefa.** Implementar a integração e garantir não apenas que o agente conseguisse consultar o saldo, mas principalmente que soubesse **quando utilizar essa informação, quando não utilizar e como interpretar o retorno corretamente**.

**Ação.** Primeiro, precisei entender rapidamente a arquitetura do agente e como **Skills, MCP, tool calling e guardrails** se conectavam no fluxo. Depois, identifiquei os owners da API de Open Finance, alinhei o contrato da integração e implementei a consulta de saldo nessa nova versão do agente.

Testei quando o agente deveria consultar o saldo externo e quando não deveria, além de saldo zero, ausência de dados, falha da integração e situações em que o cliente já informava o valor.

Um comportamento que encontrei envolvia moedas diferentes: o cliente podia ter saldo em reais e em dólar, e o agente inicialmente somava os valores como se fossem da mesma moeda. Como a conversão de dólar para real não fazia parte do escopo, implementei um guardrail para que considerasse e somasse apenas saldos em reais, evitando gerar um valor incorreto.

Com base nos testes, refinei outras instruções e guardrails para evitar chamadas desnecessárias, interpretações erradas e respostas com informações que não vieram da API. A integração direta com a API fazia parte da POC; os **BFAs** definitivos ainda não estavam disponíveis, e abstrair por eles era a arquitetura futura proposta.

**Resultado.** O agente passou a conseguir utilizar saldo de Open Finance no contexto de investimentos e a tomar decisões melhores sobre quando consultar essa informação. A feature foi validada em **mais de 50 cenários automatizados**, além de testes manuais. A nova versão ficou disponível em **homologação** para a liderança testar pela visão de negócio antes da entrada em produção.

Como projeção, em **1.000 interações**, se apenas **20%** precisassem consultar o saldo externo, seriam necessárias **200 consultas** e poderiam ser evitadas cerca de **800 chamadas desnecessárias**. Isso ilustra benefício potencial para latência, custo e uso de recursos; não é uma medição real de produção.

**Aprendizado.** Esse trabalho mudou minha forma de pensar desenvolvimento. Em um backend tradicional, eu testava principalmente se determinada entrada gerava a saída esperada. Com agentes, também preciso testar comportamento: se escolheu a ferramenta correta, se deveria chamar a integração, se interpretou o retorno corretamente e se soube não responder quando não havia informação suficiente.

Também aprendi sobre Skills, MCP, guardrails e a separação de responsabilidades entre o agente e as integrações externas.

A ideia para guardar: **testar um agente de IA não é apenas verificar se a API funciona; também é validar se ele toma a decisão adequada sobre quando utilizá-la.**

> **Limites da preparação.** Confirmar o que era instrução, guardrail da plataforma e validação determinística; não chamar uma instrução de garantia. Os 20% são hipótese ilustrativa. Os resultados declarados são de testes e homologação, não adoção, economia ou taxa de acerto medidas em produção. Uma chamada de API evitada não demonstra, sozinha, a mesma quantidade de chamadas ao modelo ou de tokens economizados.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Qual era o problema de negócio?

<details><summary>Ver resposta preparada</summary>

O agente tinha uma visão limitada principalmente aos dados que o cliente possuía dentro do Itaú. Com Open Finance, queríamos permitir que ele considerasse também informações externas quando fossem relevantes para uma conversa de investimentos. Meu primeiro passo foi integrar o saldo externo.

</details>

### 2. Qual foi exatamente sua responsabilidade?

<details><summary>Ver resposta preparada</summary>

Eu fiquei responsável pela integração de saldo nessa nova versão do agente: entender a arquitetura, encontrar os owners da API, implementar a Skill e o MCP, integrar com a API e depois trabalhar no comportamento do agente através de testes, instruções e guardrails.

</details>

### 3. Por que isso era diferente do backend tradicional?

<details><summary>Ver resposta preparada</summary>

No backend tradicional, normalmente eu tenho uma relação mais determinística entre entrada e saída. Aqui eu também precisava validar comportamento: se o agente deveria chamar a tool, se escolheu a informação correta e se interpretou o resultado sem criar informações novas.

</details>

### 4. Como o agente decide quando consultar Open Finance?

<details><summary>Ver resposta preparada</summary>

Nós definimos instruções para que a consulta aconteça quando o saldo externo realmente for relevante para a intenção do cliente, principalmente dentro de uma conversa de investimentos. A ideia não é chamar Open Finance em qualquer pergunta relacionada a dinheiro.

</details>

### 5. Por que não consultar o saldo sempre?

<details><summary>Ver resposta preparada</summary>

Porque isso adicionaria chamadas de rede, processamento, latência e custo sem necessariamente agregar valor à resposta. Além disso, não queremos transformar o agente em um simples canal de consulta de saldo.

</details>

O motivo principal é o comportamento correto do agente; custo e latência são benefícios secundários.

### 6. Qual foi um problema real que você encontrou nos testes?

<details><summary>Ver resposta preparada</summary>

Um exemplo foi quando o cliente tinha saldo em reais e também em dólar. Inicialmente, o agente somava os dois valores como se fossem da mesma moeda. Como conversão cambial não fazia parte do escopo, implementei um guardrail para que ele considerasse na soma apenas os saldos em reais.

</details>

### 7. Isso é alucinação?

<details><summary>Ver resposta preparada</summary>

Eu classificaria esse caso mais como uma interpretação incorreta do dado do que como uma alucinação pura. Os valores existiam, mas o agente aplicou uma regra errada ao combinar moedas diferentes.

</details>

### 8. Como você reduziu alucinações ou respostas incorretas?

<details><summary>Ver resposta preparada</summary>

Fui refinando as instruções e os guardrails com base nos cenários de teste. Uma regra importante era que o agente deveria utilizar somente os dados retornados pela integração e não inferir valores quando a informação não estivesse disponível.

</details>

### 9. E se a API retornar saldo zero?

<details><summary>Ver resposta preparada</summary>

Zero é um valor válido e não pode ser tratado como ausência de informação. Esse é justamente um dos tipos de cenário que precisamos diferenciar nos testes.

</details>

### 10. E se Open Finance estiver indisponível?

<details><summary>Ver resposta preparada</summary>

O agente não deveria inventar um saldo nem assumir um valor. Ele precisa tratar a indisponibilidade e continuar apenas com as informações confiáveis que estiverem disponíveis para aquela conversa.

</details>

### 11. Por que usar Skill e MCP?

<details><summary>Ver resposta preparada</summary>

A Skill concentra o comportamento e as instruções daquela capacidade do agente, enquanto o MCP permite disponibilizar ferramentas e integrações que o agente pode utilizar. Isso ajuda a separar o raciocínio do agente da implementação da integração externa.

</details>

### 12. Por que integrar diretamente na API e não pela camada intermediária?

<details><summary>Ver resposta preparada</summary>

Porque estamos trabalhando em uma nova versão ainda em POC e os BFAs definitivos dessa integração ainda não estavam disponíveis. Então a chamada direta permitiu validar a feature. A arquitetura futura é abstrair essa integração através dos BFAs.

</details>

Deixe claro que a chamada direta é temporária, não a arquitetura final.

### 13. Como você testou uma solução não determinística?

<details><summary>Ver resposta preparada</summary>

Eu trabalhei com diferentes cenários de comportamento, não apenas com o happy path. Validamos mais de 50 cenários automatizados, além de testes manuais, verificando quando a tool deveria ser chamada, quando não deveria, erros, ausência de dados e diferentes formatos de saldo.

</details>

### 14. Como você mede se o agente está escolhendo a tool corretamente?

<details><summary>Ver resposta preparada</summary>

Hoje, na POC, isso está sendo validado principalmente através dos cenários de teste. Em produção, eu gostaria de acompanhar métricas como chamadas corretas, chamadas desnecessárias, falhas da tool e situações em que ela deveria ter sido chamada e não foi.

</details>

### 15. Como você chegou à projeção de 800 chamadas evitadas?

<details><summary>Ver resposta preparada</summary>

É apenas uma projeção para demonstrar o impacto potencial. Em um cenário de 1.000 interações, se somente 20% realmente precisassem consultar o saldo externo, seriam necessárias apenas 200 chamadas. Então poderíamos evitar aproximadamente 800 chamadas desnecessárias. Como ainda estamos em homologação, eu não trato isso como uma métrica real de produção.

</details>

### 16. De onde vieram os 20%?

<details><summary>Ver resposta preparada</summary>

Os 20% são uma hipótese de cenário, não uma medição do tráfego real. Eu utilizo apenas para ilustrar como o guardrail pode afetar o número de chamadas. Depois da entrada em produção, eu substituiria essa hipótese por dados reais.

</details>

### 17. Você não poderia decidir fora do modelo quando chamar Open Finance?

<details><summary>Ver resposta preparada</summary>

Dependendo da regra, sim. Nem toda decisão precisa ficar no modelo. Para regras totalmente determinísticas, eu avaliaria colocá-las fora do LLM. Mas aqui também existe interpretação da intenção do usuário. O importante é encontrar o equilíbrio entre regras determinísticas e capacidade do agente de entender contexto.

</details>

### 18. Por que não fazer conversão de dólar para real?

<details><summary>Ver resposta preparada</summary>

Porque isso ampliaria o escopo e introduziria uma nova dependência, como fonte de cotação, momento da cotação e regras de conversão. Como isso não era necessário para entregar a feature inicial com segurança, preferimos não inferir essa conversão.

</details>

### 19. Como você garante segurança e privacidade com dados de Open Finance?

<details><summary>Ver resposta preparada</summary>

A camada de Open Finance e os mecanismos de autorização são responsabilidade da solução que fornece essa API. No meu escopo, eu consumo apenas os dados disponibilizados pela integração e tomo cuidado para que o agente utilize essas informações somente quando forem relevantes para a jornada. Eu não afirmaria detalhes de autenticação ou consentimento que não estejam sob minha responsabilidade.

</details>

### 20. O que você faria diferente hoje?

<details><summary>Ver resposta preparada</summary>

Eu definiria os cenários de avaliação ainda antes de implementar a integração. Separaria desde o início casos em que o agente deve chamar a tool, não deve chamar ou precisa pedir mais contexto. Isso permitiria desenvolver os guardrails já orientados pelos testes.

</details>

### 21. O que você aprendeu?

<details><summary>Ver resposta preparada</summary>

Aprendi que desenvolver para agentes não é apenas integrar APIs. Eu também preciso pensar em comportamento, contexto, escolha de tools, guardrails e qualidade da resposta. Uma integração pode estar tecnicamente funcionando e ainda assim o agente pode tomar uma decisão errada sobre quando ou como utilizá-la.

</details>

## Aprofundamento: perguntas novas

Perguntas autorais para aprofundar o relato, sem prever o que será perguntado na entrevista. Quando não souber um fato, diga que não sabe e como confirmaria.

### A1. O guardrail de moeda era uma instrução ao modelo ou uma regra no código?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Separe o que é instrução no prompt, o que é guardrail da plataforma e o que é validação determinística. Se a regra está só na instrução, o modelo ainda pode errar; nesse caso, não chame de garantia.

</details>

### A2. Por que deixar o modelo somar saldos?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Cálculo feito no código da ferramenta, que devolveria o total em reais já calculado, é mais confiável do que aritmética feita pelo modelo. Se a arquitetura não permitia, explique o motivo; se permitia, diga por que não foi feito ou como seria a evolução.

</details>

### A3. Como os 50 cenários são avaliados?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Asserções sobre qual ferramenta foi chamada, comparação de texto, outro modelo como avaliador? Diga qual é o critério de aprovação de cada cenário.

</details>

### A4. Quantos cenários falhavam no início e quantos falham agora?

<details><summary>Ver resposta: o que precisa aparecer</summary>

É a métrica de evolução que você tem antes da produção. Se não foi registrada, diga isso; não estime um número.

</details>

### A5. Como a identidade do cliente chega à ferramenta?

<details><summary>Ver resposta: o que precisa aparecer</summary>

A identidade deve vir do contexto autenticado da sessão, nunca do texto da conversa; um cliente que digita outro documento no chat não pode receber o saldo de outra pessoa. Se isso é responsabilidade da plataforma, diga o que você verificou.

</details>

### A6. O que aconteceu na homologação com a liderança?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Se ainda não houve resultado, diga isso. Hoje, o resultado entregue é o comportamento validado em testes, não adoção nem métrica de produção.

</details>

</section>

<section data-story-locale="en-US" lang="en-US">

> Story authored by Vitória, supplied by the owner. Study translation; execution and metrics have not been audited on this page.

**Preparation:** Learn and Be Curious, Customer Obsession and Dive Deep are study associations, not official interviewer assignments.

[Loop focus](../loop-focus.md) · [Learn and Be Curious](../05-learn-and-be-curious.md) · [Customer Obsession](../01-customer-obsession.md)

## STAR

**Situation.** About a month and a half earlier, I joined a squad working on a new version of a conversational AI agent for investments at **Itaú**. Until then, the agent mainly considered customer information held inside Itaú, which limited its view.

Because I had worked with **Open Finance** before, I suggested this feature. The idea was to gradually allow the agent to consider external information—such as balances at other banks, investments and card bills—when relevant to an investment recommendation. The first step I took on was integrating external balances.

**Task.** Implement the integration and ensure not only that the agent could retrieve balances, but that it understood **when to use the information, when not to use it and how to interpret the response correctly**.

**Action.** First, I quickly learned the agent's architecture and how **Skills, MCP, tool calling and guardrails** connected in the flow. I identified the Open Finance API owners, aligned the integration contract and implemented the balance query in the new agent version.

I tested when the agent should and should not query external balances, as well as zero balances, missing data, integration failures and situations where the customer had already supplied an amount.

One issue involved different currencies: a customer could have balances in Brazilian reais and US dollars, and the agent initially added them as if they used the same currency. Currency conversion was outside scope, so I added a guardrail to aggregate only balances in reais, avoiding an incorrect amount.

Based on these tests, I refined other instructions and guardrails to avoid unnecessary calls, incorrect interpretations and answers containing information not returned by the API. Direct API access was part of the proof of concept; the final **BFAs** were not yet available, and placing the integration behind them was the proposed future architecture.

**Result.** The agent could use Open Finance balances in an investment context and make better decisions about when to retrieve them. The feature was validated using **more than 50 automated scenarios**, as well as manual tests. The new version became available in **staging** so leadership could test it from a business perspective before production rollout.

As a projection, across **1,000 interactions**, if only **20%** required an external balance query, **200 queries** would be needed and around **800 unnecessary calls** could be avoided. This illustrates potential benefits for latency, cost and resource usage; it is not an observed production result.

**Learning.** This work changed how I think about development. In a traditional backend, I mainly tested whether an input produced the expected output. With agents, I also need to test behavior: whether the right tool was selected, whether the integration should have been called, whether its response was interpreted correctly and whether the agent refrained from answering without sufficient information.

I also learned about Skills, MCP, guardrails and the separation of responsibilities between an agent and external integrations.

The idea to remember: **testing an AI agent is not only about checking whether an API works; it is also about checking whether the agent makes the right decision about when to use it.**

> **Preparation limits.** Confirm which controls were instructions, platform guardrails or deterministic validation; do not call an instruction a guarantee. The 20% is an illustrative assumption. The stated outcomes concern tests and staging, not measured production adoption, savings or accuracy. Avoiding an API call does not, by itself, demonstrate an equivalent number of model calls or saved tokens.

## Questions already prepared

Answer aloud before opening the prepared response.

### 1. What business problem were you trying to solve?

<details><summary>View prepared answer</summary>

The agent had a limited view, mainly based on the customer's information inside Itaú. With Open Finance, we wanted it to consider external financial information when relevant to an investment conversation. My first step was integrating external account balances.

</details>

### 2. What exactly was your responsibility?

<details><summary>View prepared answer</summary>

I was responsible for integrating account balances into the new agent version: understanding the architecture, identifying the API owners, implementing the Skill and MCP integration, and then refining the agent behavior through tests, instructions and guardrails.

</details>

### 3. How was this different from traditional backend development?

<details><summary>View prepared answer</summary>

In traditional backend systems, the relationship between input and output is usually more deterministic. Here, I also had to validate behavior: whether the agent should call the tool, whether it selected the right information, and whether it interpreted the result without creating unsupported information.

</details>

### 4. How does the agent decide when to query Open Finance?

<details><summary>View prepared answer</summary>

We defined instructions so the query happens when external balances are actually relevant to the customer's intent, especially in an investment context. The goal isn't to call Open Finance for every money-related question.

</details>

### 5. Why not query the balance every time?

<details><summary>View prepared answer</summary>

Because that would add network calls, processing, latency and cost without necessarily adding value to the response. We also don't want the agent to become just a balance-query channel.

</details>

Correct agent behavior is the primary objective; cost and latency are secondary benefits.

### 6. Can you give me an example of an issue you found during testing?

<details><summary>View prepared answer</summary>

One example was when a customer had balances in both Brazilian reais and US dollars. Initially, the agent added the values as if they were in the same currency. Since currency conversion wasn't part of the scope, I added a guardrail so it would only aggregate balances in reais.

</details>

### 7. Would you consider that a hallucination?

<details><summary>View prepared answer</summary>

I would describe that more as incorrect interpretation than a pure hallucination. The values existed, but the agent applied the wrong logic when combining different currencies.

</details>

### 8. How did you reduce hallucinations or incorrect responses?

<details><summary>View prepared answer</summary>

I refined the instructions and guardrails based on the test scenarios. One important rule was that the agent should only use data returned by the integration and should not infer values when that information wasn't available.

</details>

### 9. What if the API returns a zero balance?

<details><summary>View prepared answer</summary>

Zero is a valid value and shouldn't be treated as missing information. That's exactly the kind of scenario we need to distinguish during testing.

</details>

### 10. What happens if the Open Finance API is unavailable?

<details><summary>View prepared answer</summary>

The agent shouldn't invent a balance or assume a value. It needs to handle the unavailability and continue using only the reliable information available in the conversation.

</details>

### 11. Why did you use a Skill and MCP?

<details><summary>View prepared answer</summary>

The Skill contains the behavior and instructions for that agent capability, while MCP exposes tools and integrations the agent can use. This helps separate the agent's reasoning from the external integration implementation.

</details>

### 12. Why did you integrate directly with the API instead of using the intermediate layer?

<details><summary>View prepared answer</summary>

Because we're working on a new version that is still in the proof-of-concept stage, and the final BFAs for this integration weren't available yet. Calling the API directly allowed us to validate the feature. The future architecture is to abstract that integration through the BFAs.

</details>

Make clear that calling the API directly is temporary, not the final architecture.

### 13. How did you test a non-deterministic system?

<details><summary>View prepared answer</summary>

I tested different behavioral scenarios, not only the happy path. We validated more than 50 automated scenarios, in addition to manual tests, checking when the tool should be called, when it shouldn't, errors, missing data and different balance formats.

</details>

### 14. How do you measure whether the agent is choosing the right tool?

<details><summary>View prepared answer</summary>

Today, in the POC, we're mainly validating this through test scenarios. In production, I would track metrics such as correct tool calls, unnecessary calls, tool failures, and cases where the tool should have been called but wasn't.

</details>

### 15. How did you calculate the projection of 800 avoided calls?

<details><summary>View prepared answer</summary>

It's only a projection to illustrate the potential impact. In a scenario with 1,000 interactions, if only 20% actually required external balance data, only 200 calls would be necessary. So we could avoid around 800 unnecessary calls. Since we're still in a testing environment, I don't treat that as a real production metric.

</details>

### 16. Where did the 20% assumption come from?

<details><summary>View prepared answer</summary>

The 20% is a scenario assumption, not a measurement of real traffic. I use it only to illustrate how the guardrail could affect the number of calls. After production rollout, I would replace that assumption with real data.

</details>

### 17. Couldn't you make the Open Finance decision deterministically outside the LLM?

<details><summary>View prepared answer</summary>

Depending on the rule, yes. Not every decision needs to be made by the model. For fully deterministic rules, I would consider enforcing them outside the LLM. But in this case, there is also user-intent interpretation. The key is finding the right balance between deterministic rules and the agent's ability to understand context.

</details>

### 18. Why didn't you convert dollars to reais?

<details><summary>View prepared answer</summary>

Because that would expand the scope and introduce new dependencies, such as exchange-rate sources, pricing timestamps and conversion rules. Since that wasn't necessary to safely deliver the initial feature, we chose not to infer the conversion.

</details>

### 19. How do you ensure security and privacy when handling Open Finance data?

<details><summary>View prepared answer</summary>

The Open Finance layer and its authorization mechanisms are owned by the solution providing the API. In my scope, I consume only the data exposed through that integration and make sure the agent uses it only when relevant to the journey. I wouldn't claim authentication or consent details that aren't under my responsibility.

</details>

### 20. What would you do differently today?

<details><summary>View prepared answer</summary>

I would define the evaluation scenarios before implementing the integration. From the beginning, I would separate cases where the agent should call the tool, shouldn't call it, or should ask for more context. That would allow me to develop the guardrails based on the tests from the start.

</details>

### 21. What did you learn?

<details><summary>View prepared answer</summary>

I learned that building for AI agents isn't only about integrating APIs. I also need to think about behavior, context, tool selection, guardrails and response quality. An integration can be technically working while the agent still makes the wrong decision about when or how to use it.

</details>

## Further practice: new questions

These are possible lines of inquiry, not predictions of interview questions. If a fact is unknown, say so and explain how you would confirm it.

### A1. Was the currency guardrail an instruction to the model or a rule in code?

<details><summary>View answer: what to include</summary>

Distinguish prompt instructions, a platform guardrail and deterministic validation. If the rule exists only in the prompt, the model can still make mistakes; do not describe it as a guarantee.

</details>

### A2. Why let the model add up balances at all?

<details><summary>View answer: what to include</summary>

Computing an authorized total in tool code can make the arithmetic explicit and testable. Explain whether that was possible in the actual architecture and what was implemented, rather than presenting a proposed improvement as completed work.

</details>

### A3. How are the 50 scenarios graded?

<details><summary>View answer: what to include</summary>

Did the tests assert which tool was called, compare output text or use another model as an evaluator? Explain the actual pass criteria for each scenario.

</details>

### A4. How many scenarios failed at first, and how many fail now?

<details><summary>View answer: what to include</summary>

This can describe progress before production. If the initial and current failure counts were not recorded, say so rather than estimating them.

</details>

### A5. How does the customer's identity reach the tool?

<details><summary>View answer: what to include</summary>

The tool needs a trusted, authorized customer context rather than an identifier supplied in conversation text. A user entering someone else's identifier must not gain access to that person's balance. If the platform owns this control, explain what you actually checked.

</details>

### A6. What happened when leadership tested it in staging?

<details><summary>View answer: what to include</summary>

If leadership's staging tests have not produced a result yet, state that limit. The demonstrated outcome is behavior validated in tests, not production adoption or measured production impact.

</details>

</section>

</div>
