# STAR-07 — Saldo de Open Finance em um agente de IA

**No loop:** Learn and Be Curious ★ como principal e Customer Obsession ★ como alternativa. Também evidencia Dive Deep ★, pelo erro de soma de moedas encontrado nos testes. Na tabela original, esta história ainda não tinha princípio associado.

[Foco do loop](../loop-focus.md) · [Learn and Be Curious](../05-learn-and-be-curious.md) · [Customer Obsession](../01-customer-obsession.md)

> Versão anonimizada: empresa, sistemas internos e o produto em desenvolvimento aparecem pela função. Os números são os do relato original.

## STAR

**Situação.** Há cerca de um mês e meio, entrei em uma squad que trabalha em uma nova versão de um agente conversacional de IA para investimentos. Até então, o agente decidia olhando principalmente para as informações que o cliente tinha dentro do banco, o que limitava bastante a visão dele. Começou então uma evolução para usar também dados de Open Finance, permitindo aos poucos que o agente considere informações externas, como saldo em outros bancos, investimentos e fatura de cartão, quando isso fizer sentido para a recomendação. O primeiro passo que eu assumi foi integrar o saldo externo.

**Tarefa.** Implementar a integração e garantir não só que o agente conseguisse consultar o saldo, mas que soubesse quando usar essa informação, quando não usar e como interpretar o retorno corretamente.

**Ação.** Primeiro, precisei entender rapidamente a arquitetura do agente e como Skills, MCP, tool calling e guardrails se conectavam no fluxo. Depois, identifiquei os owners da API de Open Finance, alinhei o contrato da integração e implementei a consulta de saldo na nova versão do agente. Em seguida, testei diferentes cenários: quando o agente deveria consultar o saldo externo, quando não deveria, saldo zero, ausência de dados, falha da integração e casos em que o cliente já informava o valor. Um dos comportamentos que encontrei foi com moedas diferentes: o cliente podia ter saldo em reais e em dólar, e o agente inicialmente somava os valores como se fossem da mesma moeda. Como a conversão não fazia parte do escopo, implementei um guardrail para que o agente considerasse e somasse apenas saldos em reais. Com base nos testes, refinei também outras instruções e guardrails para evitar chamadas desnecessárias, interpretações erradas e respostas com informações que não vieram da API.

**Resultado.** O agente passou a usar o saldo de Open Finance no contexto de investimentos e a decidir melhor quando consultar essa informação. A feature foi validada em mais de 50 cenários automatizados, além de testes manuais, e a nova versão ficou disponível em homologação para a liderança testar pela visão de negócio antes da produção. Como projeção, em 1.000 interações, se só 20% precisassem do saldo externo, o guardrail evitaria cerca de 800 chamadas desnecessárias, reduzindo tokens, latência e custo e mantendo o agente focado no objetivo da jornada.

**Aprendizado.** Esse trabalho mudou minha forma de pensar desenvolvimento. Em um backend tradicional, eu testava principalmente se uma entrada gerava a saída esperada. Com agentes, aprendi que também preciso testar comportamento: se o agente escolheu a ferramenta correta, se deveria ter chamado aquela integração, se interpretou o retorno corretamente e se soube não responder quando não tinha informação suficiente.

A frase para guardar: *I learned that testing an AI agent is not only about checking if the API works. I also need to validate whether the agent makes the right decision about when to use that API.*

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Qual era o problema de negócio?

EN: *What business problem were you trying to solve?*

<details><summary>Ver resposta preparada</summary>

**PT:** O agente tinha uma visão limitada principalmente aos dados que o cliente possuía dentro do banco. Com Open Finance, queríamos permitir que ele considerasse também informações externas quando fossem relevantes para uma conversa de investimentos. Meu primeiro passo foi integrar o saldo externo.

**EN:** The agent had a limited view, mainly based on the customer's information inside the bank. With Open Finance, we wanted it to consider external financial information when relevant to an investment conversation. My first step was integrating external account balances.

</details>

### 2. Qual foi exatamente sua responsabilidade?

EN: *What exactly was your responsibility?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu fiquei responsável pela integração de saldo nessa nova versão do agente: entender a arquitetura, encontrar os owners da API, implementar a Skill e o MCP, integrar com a API e depois trabalhar no comportamento do agente através de testes, instruções e guardrails.

**EN:** I was responsible for integrating account balances into the new agent version: understanding the architecture, identifying the API owners, implementing the Skill and MCP integration, and then refining the agent behavior through tests, instructions and guardrails.

</details>

### 3. Por que isso era diferente do backend tradicional?

EN: *How was this different from traditional backend development?*

<details><summary>Ver resposta preparada</summary>

**PT:** No backend tradicional, normalmente eu tenho uma relação mais determinística entre entrada e saída. Aqui eu também precisava validar comportamento: se o agente deveria chamar a tool, se escolheu a informação correta e se interpretou o resultado sem criar informações novas.

**EN:** In traditional backend systems, the relationship between input and output is usually more deterministic. Here, I also had to validate behavior: whether the agent should call the tool, whether it selected the right information, and whether it interpreted the result without creating unsupported information.

</details>

### 4. Como o agente decide quando consultar Open Finance?

EN: *How does the agent decide when to query Open Finance?*

<details><summary>Ver resposta preparada</summary>

**PT:** Nós definimos instruções para que a consulta aconteça quando o saldo externo realmente for relevante para a intenção do cliente, principalmente dentro de uma conversa de investimentos. A ideia não é chamar Open Finance em qualquer pergunta relacionada a dinheiro.

**EN:** We defined instructions so the query happens when external balances are actually relevant to the customer's intent, especially in an investment context. The goal isn't to call Open Finance for every money-related question.

</details>

### 5. Por que não consultar o saldo sempre?

EN: *Why not query the balance every time?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque isso adicionaria chamadas de rede, processamento, latência e custo sem necessariamente agregar valor à resposta. Além disso, não queremos transformar o agente em um simples canal de consulta de saldo.

**EN:** Because that would add network calls, processing, latency and cost without necessarily adding value to the response. We also don't want the agent to become just a balance-query channel.

</details>

O motivo principal é o comportamento correto do agente; custo e latência são benefícios secundários.

### 6. Qual foi um problema real que você encontrou nos testes?

EN: *Can you give me an example of an issue you found during testing?*

<details><summary>Ver resposta preparada</summary>

**PT:** Um exemplo foi quando o cliente tinha saldo em reais e também em dólar. Inicialmente, o agente somava os dois valores como se fossem da mesma moeda. Como conversão cambial não fazia parte do escopo, implementei um guardrail para que ele considerasse na soma apenas os saldos em reais.

**EN:** One example was when a customer had balances in both Brazilian reais and US dollars. Initially, the agent added the values as if they were in the same currency. Since currency conversion wasn't part of the scope, I added a guardrail so it would only aggregate balances in reais.

</details>

### 7. Isso é alucinação?

EN: *Would you consider that a hallucination?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu classificaria esse caso mais como uma interpretação incorreta do dado do que como uma alucinação pura. Os valores existiam, mas o agente aplicou uma regra errada ao combinar moedas diferentes.

**EN:** I would describe that more as incorrect interpretation than a pure hallucination. The values existed, but the agent applied the wrong logic when combining different currencies.

</details>

### 8. Como você reduziu alucinações ou respostas incorretas?

EN: *How did you reduce hallucinations or incorrect responses?*

<details><summary>Ver resposta preparada</summary>

**PT:** Fui refinando as instruções e os guardrails com base nos cenários de teste. Uma regra importante era que o agente deveria utilizar somente os dados retornados pela integração e não inferir valores quando a informação não estivesse disponível.

**EN:** I refined the instructions and guardrails based on the test scenarios. One important rule was that the agent should only use data returned by the integration and should not infer values when that information wasn't available.

</details>

### 9. E se a API retornar saldo zero?

EN: *What if the API returns a zero balance?*

<details><summary>Ver resposta preparada</summary>

**PT:** Zero é um valor válido e não pode ser tratado como ausência de informação. Esse é justamente um dos tipos de cenário que precisamos diferenciar nos testes.

**EN:** Zero is a valid value and shouldn't be treated as missing information. That's exactly the kind of scenario we need to distinguish during testing.

</details>

### 10. E se Open Finance estiver indisponível?

EN: *What happens if the Open Finance API is unavailable?*

<details><summary>Ver resposta preparada</summary>

**PT:** O agente não deveria inventar um saldo nem assumir um valor. Ele precisa tratar a indisponibilidade e continuar apenas com as informações confiáveis que estiverem disponíveis para aquela conversa.

**EN:** The agent shouldn't invent a balance or assume a value. It needs to handle the unavailability and continue using only the reliable information available in the conversation.

</details>

### 11. Por que usar Skill e MCP?

EN: *Why did you use a Skill and MCP?*

<details><summary>Ver resposta preparada</summary>

**PT:** A Skill concentra o comportamento e as instruções daquela capacidade do agente, enquanto o MCP permite disponibilizar ferramentas e integrações que o agente pode utilizar. Isso ajuda a separar o raciocínio do agente da implementação da integração externa.

**EN:** The Skill contains the behavior and instructions for that agent capability, while MCP exposes tools and integrations the agent can use. This helps separate the agent's reasoning from the external integration implementation.

</details>

### 12. Por que integrar diretamente na API e não pela camada intermediária?

EN: *Why did you integrate directly with the API instead of using the intermediate layer?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque estamos trabalhando em uma nova versão ainda em POC e a camada intermediária definitiva dessa integração ainda não estava disponível. Então a chamada direta permitiu validar a feature. A arquitetura futura é abstrair essa integração por essa camada.

**EN:** Because we're working on a new version that is still in the proof-of-concept stage, and the final intermediate layer for this integration wasn't available yet. Calling the API directly allowed us to validate the feature. The future architecture is to abstract that integration through that layer.

</details>

Deixe claro que a chamada direta é temporária, não a arquitetura final.

### 13. Como você testou uma solução não determinística?

EN: *How did you test a non-deterministic system?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu trabalhei com diferentes cenários de comportamento, não apenas com o happy path. Validamos mais de 50 cenários automatizados, além de testes manuais, verificando quando a tool deveria ser chamada, quando não deveria, erros, ausência de dados e diferentes formatos de saldo.

**EN:** I tested different behavioral scenarios, not only the happy path. We validated more than 50 automated scenarios, in addition to manual tests, checking when the tool should be called, when it shouldn't, errors, missing data and different balance formats.

</details>

### 14. Como você mede se o agente está escolhendo a tool corretamente?

EN: *How do you measure whether the agent is choosing the right tool?*

<details><summary>Ver resposta preparada</summary>

**PT:** Hoje, na POC, isso está sendo validado principalmente através dos cenários de teste. Em produção, eu gostaria de acompanhar métricas como chamadas corretas, chamadas desnecessárias, falhas da tool e situações em que ela deveria ter sido chamada e não foi.

**EN:** Today, in the POC, we're mainly validating this through test scenarios. In production, I would track metrics such as correct tool calls, unnecessary calls, tool failures, and cases where the tool should have been called but wasn't.

</details>

### 15. Como você chegou à projeção de 800 chamadas evitadas?

EN: *How did you calculate the projection of 800 avoided calls?*

<details><summary>Ver resposta preparada</summary>

**PT:** É apenas uma projeção para demonstrar o impacto potencial. Em um cenário de 1.000 interações, se somente 20% realmente precisassem consultar o saldo externo, seriam necessárias apenas 200 chamadas. Então poderíamos evitar aproximadamente 800 chamadas desnecessárias. Como ainda estamos em homologação, eu não trato isso como uma métrica real de produção.

**EN:** It's only a projection to illustrate the potential impact. In a scenario with 1,000 interactions, if only 20% actually required external balance data, only 200 calls would be necessary. So we could avoid around 800 unnecessary calls. Since we're still in a testing environment, I don't treat that as a real production metric.

</details>

### 16. De onde vieram os 20%?

EN: *Where did the 20% assumption come from?*

<details><summary>Ver resposta preparada</summary>

**PT:** Os 20% são uma hipótese de cenário, não uma medição do tráfego real. Eu utilizo apenas para ilustrar como o guardrail pode afetar o número de chamadas. Depois da entrada em produção, eu substituiria essa hipótese por dados reais.

**EN:** The 20% is a scenario assumption, not a measurement of real traffic. I use it only to illustrate how the guardrail could affect the number of calls. After production rollout, I would replace that assumption with real data.

</details>

### 17. Você não poderia decidir fora do modelo quando chamar Open Finance?

EN: *Couldn't you make the Open Finance decision deterministically outside the LLM?*

<details><summary>Ver resposta preparada</summary>

**PT:** Dependendo da regra, sim. Nem toda decisão precisa ficar no modelo. Para regras totalmente determinísticas, eu avaliaria colocá-las fora do LLM. Mas aqui também existe interpretação da intenção do usuário. O importante é encontrar o equilíbrio entre regras determinísticas e capacidade do agente de entender contexto.

**EN:** Depending on the rule, yes. Not every decision needs to be made by the model. For fully deterministic rules, I would consider enforcing them outside the LLM. But in this case, there is also user-intent interpretation. The key is finding the right balance between deterministic rules and the agent's ability to understand context.

</details>

### 18. Por que não fazer conversão de dólar para real?

EN: *Why didn't you convert dollars to reais?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque isso ampliaria o escopo e introduziria uma nova dependência, como fonte de cotação, momento da cotação e regras de conversão. Como isso não era necessário para entregar a feature inicial com segurança, preferimos não inferir essa conversão.

**EN:** Because that would expand the scope and introduce new dependencies, such as exchange-rate sources, pricing timestamps and conversion rules. Since that wasn't necessary to safely deliver the initial feature, we chose not to infer the conversion.

</details>

### 19. Como você garante segurança e privacidade com dados de Open Finance?

EN: *How do you ensure security and privacy when handling Open Finance data?*

<details><summary>Ver resposta preparada</summary>

**PT:** A camada de Open Finance e os mecanismos de autorização são responsabilidade da solução que fornece essa API. No meu escopo, eu consumo apenas os dados disponibilizados pela integração e tomo cuidado para que o agente utilize essas informações somente quando forem relevantes para a jornada. Eu não afirmaria detalhes de autenticação ou consentimento que não estejam sob minha responsabilidade.

**EN:** The Open Finance layer and its authorization mechanisms are owned by the solution providing the API. In my scope, I consume only the data exposed through that integration and make sure the agent uses it only when relevant to the journey. I wouldn't claim authentication or consent details that aren't under my responsibility.

</details>

### 20. O que você faria diferente hoje?

EN: *What would you do differently today?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu definiria os cenários de avaliação ainda antes de implementar a integração. Separaria desde o início casos em que o agente deve chamar a tool, não deve chamar ou precisa pedir mais contexto. Isso permitiria desenvolver os guardrails já orientados pelos testes.

**EN:** I would define the evaluation scenarios before implementing the integration. From the beginning, I would separate cases where the agent should call the tool, shouldn't call it, or should ask for more context. That would allow me to develop the guardrails based on the tests from the start.

</details>

### 21. O que você aprendeu?

EN: *What did you learn?*

<details><summary>Ver resposta preparada</summary>

**PT:** Aprendi que desenvolver para agentes não é apenas integrar APIs. Eu também preciso pensar em comportamento, contexto, escolha de tools, guardrails e qualidade da resposta. Uma integração pode estar tecnicamente funcionando e ainda assim o agente pode tomar uma decisão errada sobre quando ou como utilizá-la.

**EN:** I learned that building for AI agents isn't only about integrating APIs. I also need to think about behavior, context, tool selection, guardrails and response quality. An integration can be technically working while the agent still makes the wrong decision about when or how to use it.

</details>

## Aprofundamento: perguntas novas

São os pontos que um entrevistador vai apertar. Quando não souber um fato, diga que não sabe e como confirmaria.

### A1. O guardrail de moeda era uma instrução ao modelo ou uma regra no código?

EN: *Was the currency guardrail an instruction to the model or a rule in code?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Separe o que é instrução no prompt, o que é guardrail da plataforma e o que é validação determinística. Se a regra está só na instrução, o modelo ainda pode errar; nesse caso, não chame de garantia.

</details>

### A2. Por que deixar o modelo somar saldos?

EN: *Why let the model add up balances at all?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Cálculo feito no código da ferramenta, que devolveria o total em reais já calculado, é mais confiável do que aritmética feita pelo modelo. Se a arquitetura não permitia, explique o motivo; se permitia, diga por que não foi feito ou como seria a evolução.

</details>

### A3. Como os 50 cenários são avaliados?

EN: *How are the 50 scenarios graded?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Asserções sobre qual ferramenta foi chamada, comparação de texto, outro modelo como avaliador? Diga qual é o critério de aprovação de cada cenário.

</details>

### A4. Quantos cenários falhavam no início e quantos falham agora?

EN: *How many scenarios failed at first, and how many fail now?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

É a métrica de evolução que você tem antes da produção. Se não foi registrada, diga isso; não estime um número.

</details>

### A5. Como a identidade do cliente chega à ferramenta?

EN: *How does the customer's identity reach the tool?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

A identidade deve vir do contexto autenticado da sessão, nunca do texto da conversa; um cliente que digita outro documento no chat não pode receber o saldo de outra pessoa. Se isso é responsabilidade da plataforma, diga o que você verificou.

</details>

### A6. O que aconteceu na homologação com a liderança?

EN: *What happened when leadership tested it in staging?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Se ainda não houve resultado, diga isso. Hoje, o resultado entregue é o comportamento validado em testes, não adoção nem métrica de produção.

</details>
