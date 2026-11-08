# STAR-01 — Incidente de escalabilidade em produção

<div data-story-locales data-story-title-pt="STAR-01 — Incidente de escalabilidade em produção" data-story-title-en="STAR-01 — Production scalability incident">

<section data-story-locale="pt-BR" lang="pt-BR">

**LP principal indicado no relato:** Dive Deep. **LPs secundários:** Bias for Action, Ownership, Customer Obsession e Deliver Results. É uma associação de preparação, não atribuição oficial. Para sustentar Dive Deep, recupere a causa e suas evidências; a mitigação por si só não encerra esse ponto (veja A1).

[Foco do loop](../loop-focus.md) · [Bias for Action](../09-bias-for-action.md) · [Dive Deep](../12-dive-deep.md)

> Relato autoral de Vitória, fornecido pelo proprietário. Tradução de estudo; execução e métricas não auditadas nesta página.

## STAR

**Situação.** No Itaú, quando eu era júnior, eu atuava em uma aplicação de produção chamada **Projeção**, que faz parte da jornada de investimentos e ajuda o cliente a projetar a evolução do dinheiro ao longo do tempo, para estimar quanto aquele valor pode render. Durante um pico de tráfego, o ambiente começou a apresentar falhas porque a capacidade disponível não acompanhava adequadamente o aumento da demanda. Isso impactou diretamente a experiência dos clientes e gerou alertas de incidente.

**Tarefa.** Minha responsabilidade era identificar a causa e restabelecer o serviço o mais rápido possível, acompanhando de perto o comportamento do ambiente durante a intervenção.

**Ação.** Comecei analisando a aplicação e as tasks com **CloudWatch e Splunk**: métricas, logs, erros e comportamento durante o pico. Identifiquei que a capacidade disponível não era suficiente para o volume de requisições e que o escalonamento não respondia adequadamente ao tráfego. Para estabilizar, aumentei a capacidade adicionando novas tasks e também ajustamos os recursos da aplicação, incluindo o aumento de memória de **1024 MB para 2048 MB**.

**Resultado.** Consegui restaurar o serviço em aproximadamente **40 minutos**, recuperando praticamente todo o tráfego. Validei a recuperação pela normalização das métricas no CloudWatch, pela redução dos erros no Splunk, pela interrupção dos alertas e por testes funcionais diretamente na jornada do aplicativo. A aplicação voltou a absorver o volume de requisições de forma estável durante aquele pico.

**Aprendizado.** A organização ainda estava amadurecendo a adoção de cloud e incorporando práticas de elasticidade. Aprendi que não basta ter Auto Scaling configurado: é necessário validar se métricas, thresholds e capacidade representam o comportamento real da aplicação. Depois desse caso, passei a dar mais importância a testes de performance antes de produção e à observabilidade. **Hoje eu também avaliaria** feature toggles para reduzir o impacto durante uma indisponibilidade; já implementei essa abordagem em outros fluxos utilizando o **Portal Manager**. Essa reflexão não significa que o mecanismo foi usado naquele incidente.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Se já tinha Auto Scaling, por que não escalou?

<details><summary>Ver resposta preparada</summary>

A aplicação já possuía Auto Scaling, inclusive considerando métricas como CPU e memória. O problema é que, naquele momento, a configuração de capacidade e scaling não estava respondendo adequadamente ao comportamento real da aplicação durante aquele pico. Por isso foi necessária uma intervenção manual para aumentar a capacidade e estabilizar o ambiente.

</details>

A resposta acerta em não inventar qual threshold estava errado, mas ainda descreve um sintoma. Veja A1 antes de usá-la em uma entrevista de Dive Deep.

### 2. CPU ou memória?

<details><summary>Ver resposta preparada</summary>

Depende do gargalo da aplicação. Se a carga aumenta principalmente o processamento, CPU pode ser uma boa métrica. Se a aplicação é limitada por memória, como pode acontecer em aplicações Java, memória pode representar melhor a pressão do ambiente. Eu também avaliaria métricas como quantidade de requisições por target ou métricas customizadas. O importante é escolher uma métrica que represente a demanda real da aplicação.

</details>

Revise o trecho sobre Java com A3 antes de usar esta resposta.

### 3. Por que aumentar memória e também adicionar tasks?

<details><summary>Ver resposta preparada</summary>

Eram duas ações diferentes. Aumentar a memória melhorava a capacidade individual de cada task, enquanto adicionar tasks aumentava horizontalmente a capacidade total da aplicação e permitia distribuir melhor o tráfego.

</details>

### 4. Como você sabia que tinha resolvido?

<details><summary>Ver resposta preparada</summary>

Eu não considerei o incidente resolvido apenas porque a alteração foi aplicada. Acompanhei as métricas no CloudWatch, observei a redução dos erros no Splunk, verifiquei que os alertas de incidente pararam de ser gerados e também testei diretamente a jornada no aplicativo.

</details>

### 5. O que faria diferente hoje?

<details><summary>Ver resposta preparada</summary>

Hoje eu teria uma postura mais preventiva. Validaria previamente a estratégia de Auto Scaling com testes de performance e carga, verificando se CPU, memória ou outra métrica realmente representa o gargalo da aplicação. Também avaliaria mecanismos de proteção da experiência do cliente, como feature flags ou kill switches para cenários críticos.

</details>

### 6. Você usaria Chaos Engineering?

<details><summary>Ver resposta preparada</summary>

Eu consideraria Chaos Engineering em um nível mais maduro de testes de resiliência, mas não foi algo que utilizei nesse incidente. O que passei a utilizar com mais frequência depois desse caso foram testes de performance e carga.

</details>

### 7. Como você desenharia essa arquitetura hoje?

<details><summary>Ver resposta preparada</summary>

Hoje eu começaria entendendo o padrão esperado de tráfego e os requisitos de performance. Depois configuraria o Auto Scaling do ECS com métricas que representem a carga, distribuiria o tráfego por um load balancer, definiria capacidades mínima e máxima apropriadas, criaria alarmes e dashboards no CloudWatch e executaria testes de carga antes de produção. Também consideraria feature toggle para jornadas críticas.

</details>

## Aprofundamento: perguntas novas

Perguntas autorais para aprofundar. Quando não souber um fato, diga que não sabe e como o confirmaria.

### A1. Qual foi a causa raiz de o Auto Scaling não ter respondido?

<details><summary>Ver resposta: o que precisa aparecer</summary>

“Não estava respondendo adequadamente” descreve o sintoma. O entrevistador quer o que os dados mostraram: o serviço já estava no número máximo de tasks configurado? A métrica da política não subia? As tasks eram encerradas e recriadas? Se a causa nunca foi confirmada, diga isso e diga quem ficou com a análise. Nesse caso, a história funciona melhor como Bias for Action, porque você mitigou antes de concluir o diagnóstico.

</details>

### A2. Você dobrou a memória. As tasks estavam sendo encerradas por falta de memória?

<details><summary>Ver resposta: o que precisa aparecer</summary>

No ECS, investigue o motivo de parada e as informações de saída do contêiner, como uma indicação de OutOfMemoryError ou o código 137, e correlacione com eventos e logs. Não conclua que houve falta de memória apenas pelo aumento da configuração; descreva somente o que foi observado.

</details>

### A3. Se a aplicação é Java e escala por memória, o que acontece quando a carga cai?

<details><summary>Ver resposta: o que precisa aparecer</summary>

A JVM costuma reservar heap e não devolvê-la rapidamente ao sistema. A utilização de memória fica alta mesmo sem carga, e o serviço pode nunca reduzir tasks. Por isso métricas ligadas à demanda, como requisições por target, latência ou CPU, costumam ser sinais melhores de escala, e a memória entra no dimensionamento da task. Isso ajusta a resposta 2.

</details>

### A4. Quantos clientes ou requisições foram afetados, e por quanto tempo?

<details><summary>Ver resposta: o que precisa aparecer</summary>

A história ganha clareza com evidências de impacto: taxa de erro, duração e jornadas afetadas, quando disponíveis. “Praticamente todo o tráfego” precisa de uma medida ou de uma estimativa declarada como estimativa; não invente precisão para preencher a resposta.

</details>

### A5. Você era júnior. Quem decidiu alterar produção e o que exatamente foi seu?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Separe suas ações das do time: quem conduziu o incidente, quem aprovou e quem executou cada mudança. “Aumentei… e ajustamos” na mesma frase provoca esta pergunta.

</details>

### A6. O que mudou depois do incidente?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Postmortem, ajuste da política de escala, teste de carga, alarme novo. O aprendizado fica forte com uma mudança que de fato aconteceu depois, no time ou no seu trabalho; “hoje eu faria” não substitui o que foi feito.

</details>

</section>

<section data-story-locale="en-US" lang="en-US">

**Primary LP identified in the account:** Dive Deep. **Secondary LPs:** Bias for Action, Ownership, Customer Obsession and Deliver Results. This is a preparation mapping, not an official assignment. To support Dive Deep, recover the cause and its evidence; mitigation alone does not settle that point (see A1).

[Loop focus](../loop-focus.md) · [Bias for Action](../09-bias-for-action.md) · [Dive Deep](../12-dive-deep.md)

> Original account by Vitória, supplied by the owner. Study translation; execution and metrics have not been audited on this page.

## STAR

**Situation.** At Itaú, when I was a junior engineer, I worked on a production application called **Projeção**. It is part of the investment journey and helps customers project how their money may grow over time. During a traffic spike, the environment started failing because the available capacity was not keeping up with demand. This directly affected the customer experience and triggered incident alerts.

**Task.** My responsibility was to identify the cause and restore the service as quickly as possible while closely monitoring the environment during the intervention.

**Action.** I started by examining the application and its tasks using **CloudWatch and Splunk**, checking metrics, logs, errors and behavior during the spike. I identified insufficient capacity for the request volume and scaling that was not responding appropriately. To stabilize the environment, I added tasks, and we also adjusted application resources, including increasing memory from **1024 MB to 2048 MB**.

**Result.** I restored the service in approximately **40 minutes**, recovering almost all application traffic. I validated recovery through normalized CloudWatch metrics, reduced Splunk errors, incident alerts stopping, and functional tests of the customer journey in the application. The application could handle that traffic spike stably again.

**Learning.** The organization was still maturing its cloud adoption and incorporating elasticity practices. I learned that configuring Auto Scaling is not enough: metrics, thresholds and capacity must be validated against actual application behavior. Afterwards, I paid more attention to preproduction performance testing and observability. **Today, I would also consider** feature toggles to reduce customer impact during an outage; I have implemented that approach in other flows using **Portal Manager**. That reflection does not mean the mechanism was used in this incident.

## Prepared questions

Answer aloud before opening.

### 1. If Auto Scaling was already in place, why didn't it scale?

<details><summary>View prepared answer</summary>

The application already had Auto Scaling based on metrics such as CPU and memory. However, at that time, the capacity and scaling configuration were not responding properly to the application's actual behavior during the traffic spike. So I had to manually increase the capacity to stabilize the environment.

</details>

The answer avoids inventing which threshold was wrong, but it still describes a symptom. Review A1 before using it as evidence of a completed Dive Deep investigation.

### 2. CPU or memory?

<details><summary>View prepared answer</summary>

It depends on the application's bottleneck. If the workload is compute-intensive, CPU can be a good metric. If the application is memory-bound, memory may be a better signal. I would also evaluate metrics such as requests per target or custom metrics. The important thing is to choose a metric that represents the application's actual demand.

</details>

Review the Java discussion in A3 before using this answer.

### 3. Why increase memory and also add tasks?

<details><summary>View prepared answer</summary>

They address different problems. Increasing memory gives each task more capacity, while adding more tasks increases the application's horizontal capacity and allows the traffic to be distributed across more instances.

</details>

### 4. How did you know it was resolved?

<details><summary>View prepared answer</summary>

I didn't consider the incident resolved just because the change had been deployed. I monitored the CloudWatch metrics, checked the reduction in errors in Splunk, confirmed that the incident alerts had stopped, and also tested the customer journey directly in the application.

</details>

### 5. What would you do differently today?

<details><summary>View prepared answer</summary>

Today I would take a more proactive approach. I would validate the Auto Scaling strategy through performance and load testing and make sure that CPU, memory, or another metric actually represents the application's bottleneck. I would also evaluate mechanisms such as feature flags to protect the customer experience during critical failures.

</details>

### 6. Would you use Chaos Engineering?

<details><summary>View prepared answer</summary>

I would consider Chaos Engineering as part of a more mature resilience strategy, but I didn't use it in this incident. What I started using more frequently after this experience was performance and load testing.

</details>

### 7. How would you design this architecture today?

<details><summary>View prepared answer</summary>

Today I would start by understanding the expected traffic pattern and defining performance requirements. Then I would configure ECS Auto Scaling using metrics that represent the workload, distribute traffic through a load balancer, define appropriate minimum and maximum capacity, create CloudWatch alarms and dashboards, and perform load testing before production. I would also consider a feature toggle for critical customer journeys.

</details>

## Additional follow-up questions

Authorial follow-ups for deeper discussion. If a fact is unknown, say so and explain how you would verify it.

### A1. What was the root cause of Auto Scaling not responding?

<details><summary>View answer: what to include</summary>

“Not responding properly” describes a symptom. Recover what the evidence showed: had the service reached its configured maximum task count? Was the policy metric increasing? Were tasks repeatedly stopping and restarting? If the root cause was never confirmed, say so and identify who owned that investigation. The mitigation may support Bias for Action without demonstrating a completed diagnosis.

</details>

### A2. You doubled the memory. Were tasks being stopped because they ran out of memory?

<details><summary>View answer: what to include</summary>

In ECS, a memory-related task stop can be investigated through its stop reason and container exit information, including an OutOfMemoryError indication or exit code 137. Explain only what you actually saw in events and logs rather than inferring this from the memory increase alone.

</details>

### A3. If it's a Java application scaling on memory, what happens when the load drops?

<details><summary>View answer: what to include</summary>

The JVM may retain allocated heap rather than promptly returning it to the operating system. Memory utilization can remain high after demand drops, making scale-in difficult. Demand-related metrics such as requests per target or CPU need workload-specific evaluation, while memory is also part of task sizing. Use this question to qualify answer 2, not to assert that the incident used a particular JVM behavior.

</details>

### A4. How many customers or requests were affected, and for how long?

<details><summary>View answer: what to include</summary>

Customer Obsession and Deliver Results benefit from concrete impact evidence: error rate, duration and affected journeys. “Almost all traffic” needs a measure or an estimate explicitly identified as an estimate.

</details>

### A5. You were a junior engineer. Who decided to change production, and what exactly did you do?

<details><summary>View answer: what to include</summary>

Separate your work from the team’s: who led the incident, who authorized changes and who executed each one. The wording “I added… and we adjusted” naturally prompts this clarification.

</details>

### A6. What changed after the incident?

<details><summary>View answer: what to include</summary>

A postmortem, scaling-policy change, load test or new alarm can demonstrate learning if it actually happened. “Today I would” does not replace an improvement that was implemented afterwards.

</details>

</section>

</div>
