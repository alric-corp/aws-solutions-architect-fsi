# STAR-01 — Incidente de escalabilidade em produção

**No loop:** Bias for Action ★ como principal. Também evidencia Ownership ★, Customer Obsession ★ e Deliver Results ★. Na tabela original o principal era Dive Deep ★; use assim apenas se a causa raiz estiver confirmada (veja A1).

[Foco do loop](../loop-focus.md) · [Bias for Action](../09-bias-for-action.md) · [Dive Deep](../12-dive-deep.md)

> Versão anonimizada: empresa e sistemas internos aparecem pela função. Os números são os do relato original.

## STAR

**Situação.** Quando eu era júnior no banco, atuava em uma aplicação de produção da jornada de investimentos que ajuda o cliente a projetar a evolução do dinheiro ao longo do tempo. Durante um pico de tráfego, o ambiente começou a falhar porque a capacidade disponível não acompanhou o aumento da demanda. Isso afetou diretamente a experiência dos clientes e gerou alertas de incidente.

**Tarefa.** Identificar a causa do problema e restabelecer o serviço o mais rápido possível, acompanhando de perto o comportamento do ambiente durante a intervenção.

**Ação.** Analisei o comportamento da aplicação e das tasks com CloudWatch e Splunk: métricas, logs, erros e o comportamento do ambiente durante o pico. Identifiquei que a capacidade disponível não era suficiente para o volume de requisições e que o escalonamento não respondia adequadamente ao aumento de tráfego. Para estabilizar, aumentei a capacidade adicionando tasks e também ajustamos os recursos da aplicação, incluindo a memória de 1024 MB para 2048 MB.

**Resultado.** Restaurei o serviço em aproximadamente 40 minutos, recuperando praticamente todo o tráfego da aplicação. A recuperação foi validada pela normalização das métricas no CloudWatch, pela queda dos erros no Splunk, pelo fim dos alertas de incidente e por testes funcionais na jornada do aplicativo. A aplicação voltou a absorver o volume de requisições de forma estável durante aquele pico.

**Aprendizado.** A organização ainda amadurecia a adoção de cloud, e muitas práticas de elasticidade estavam sendo incorporadas. O principal aprendizado foi que não basta ter Auto Scaling configurado: é preciso validar se métricas, thresholds e capacidade representam o comportamento real da aplicação. Depois disso, passei a dar muito mais importância a testes de performance antes de produção e à observabilidade. Hoje também avaliaria feature toggle para reduzir o impacto ao cliente durante uma indisponibilidade, abordagem que já implementei em outros fluxos com a ferramenta interna de feature toggle.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Se já tinha Auto Scaling, por que não escalou?

EN: *If Auto Scaling was already in place, why didn't it scale?*

<details><summary>Ver resposta preparada</summary>

**PT:** A aplicação já possuía Auto Scaling, inclusive considerando métricas como CPU e memória. O problema é que, naquele momento, a configuração de capacidade e scaling não estava respondendo adequadamente ao comportamento real da aplicação durante aquele pico. Por isso foi necessária uma intervenção manual para aumentar a capacidade e estabilizar o ambiente.

**EN:** The application already had Auto Scaling based on metrics such as CPU and memory. However, at that time, the capacity and scaling configuration were not responding properly to the application's actual behavior during the traffic spike. So I had to manually increase the capacity to stabilize the environment.

</details>

A resposta acerta em não inventar qual threshold estava errado, mas ainda descreve um sintoma. Veja A1 antes de usá-la em uma entrevista de Dive Deep.

### 2. CPU ou memória?

EN: *CPU or memory?*

<details><summary>Ver resposta preparada</summary>

**PT:** Depende do gargalo da aplicação. Se a carga aumenta principalmente o processamento, CPU pode ser uma boa métrica. Se a aplicação é limitada por memória, como pode acontecer em aplicações Java, memória pode representar melhor a pressão do ambiente. Eu também avaliaria métricas como quantidade de requisições por target ou métricas customizadas. O importante é escolher uma métrica que represente a demanda real da aplicação.

**EN:** It depends on the application's bottleneck. If the workload is compute-intensive, CPU can be a good metric. If the application is memory-bound, memory may be a better signal. I would also evaluate metrics such as requests per target or custom metrics. The important thing is to choose a metric that represents the application's actual demand.

</details>

Revise o trecho sobre Java com A3 antes de usar esta resposta.

### 3. Por que aumentar memória e também adicionar tasks?

EN: *Why increase memory and also add tasks?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eram duas ações diferentes. Aumentar a memória melhorava a capacidade individual de cada task, enquanto adicionar tasks aumentava horizontalmente a capacidade total da aplicação e permitia distribuir melhor o tráfego.

**EN:** They address different problems. Increasing memory gives each task more capacity, while adding more tasks increases the application's horizontal capacity and allows the traffic to be distributed across more instances.

</details>

### 4. Como você sabia que tinha resolvido?

EN: *How did you know it was resolved?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu não considerei o incidente resolvido apenas porque a alteração foi aplicada. Acompanhei as métricas no CloudWatch, observei a redução dos erros no Splunk, verifiquei que os alertas de incidente pararam de ser gerados e também testei diretamente a jornada no aplicativo.

**EN:** I didn't consider the incident resolved just because the change had been deployed. I monitored the CloudWatch metrics, checked the reduction in errors in Splunk, confirmed that the incident alerts had stopped, and also tested the customer journey directly in the application.

</details>

### 5. O que faria diferente hoje?

EN: *What would you do differently today?*

<details><summary>Ver resposta preparada</summary>

**PT:** Hoje eu teria uma postura mais preventiva. Validaria previamente a estratégia de Auto Scaling com testes de performance e carga, verificando se CPU, memória ou outra métrica realmente representa o gargalo da aplicação. Também avaliaria mecanismos de proteção da experiência do cliente, como feature flags ou kill switches para cenários críticos.

**EN:** Today I would take a more proactive approach. I would validate the Auto Scaling strategy through performance and load testing and make sure that CPU, memory, or another metric actually represents the application's bottleneck. I would also evaluate mechanisms such as feature flags to protect the customer experience during critical failures.

</details>

### 6. Você usaria Chaos Engineering?

EN: *Would you use Chaos Engineering?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu consideraria Chaos Engineering em um nível mais maduro de testes de resiliência, mas não foi algo que utilizei nesse incidente. O que passei a utilizar com mais frequência depois desse caso foram testes de performance e carga.

**EN:** I would consider Chaos Engineering as part of a more mature resilience strategy, but I didn't use it in this incident. What I started using more frequently after this experience was performance and load testing.

</details>

### 7. Como você desenharia essa arquitetura hoje?

EN: *How would you design this architecture today?*

<details><summary>Ver resposta preparada</summary>

**EN:** Today I would start by understanding the expected traffic pattern and defining performance requirements. Then I would configure ECS Auto Scaling using metrics that represent the workload, distribute traffic through a load balancer, define appropriate minimum and maximum capacity, create CloudWatch alarms and dashboards, and perform load testing before production. I would also consider a feature toggle for critical customer journeys.

</details>

## Aprofundamento: perguntas novas

São os pontos que um entrevistador vai apertar. Quando não souber um fato, diga que não sabe e como confirmaria.

### A1. Qual foi a causa raiz de o Auto Scaling não ter respondido?

EN: *What was the root cause of Auto Scaling not responding?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

“Não estava respondendo adequadamente” descreve o sintoma. O entrevistador quer o que os dados mostraram: o serviço já estava no número máximo de tasks configurado? A métrica da política não subia? As tasks eram encerradas e recriadas? Se a causa nunca foi confirmada, diga isso e diga quem ficou com a análise. Nesse caso, a história funciona melhor como Bias for Action, porque você mitigou antes de concluir o diagnóstico.

</details>

### A2. Você dobrou a memória. As tasks estavam sendo encerradas por falta de memória?

EN: *You doubled the memory. Were tasks being stopped because they ran out of memory?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

No ECS, uma task encerrada por memória aparece no motivo de parada (OutOfMemoryError, código de saída 137) e costuma reiniciar em sequência. Isso explicaria por que adicionar tasks sozinho não bastaria. Responda só com o que você viu nos eventos e nos logs.

</details>

### A3. Se a aplicação é Java e escala por memória, o que acontece quando a carga cai?

EN: *If it's a Java application scaling on memory, what happens when the load drops?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

A JVM costuma reservar heap e não devolvê-la rapidamente ao sistema. A utilização de memória fica alta mesmo sem carga, e o serviço pode nunca reduzir tasks. Por isso métricas ligadas à demanda, como requisições por target, latência ou CPU, costumam ser sinais melhores de escala, e a memória entra no dimensionamento da task. Isso ajusta a resposta 2.

</details>

### A4. Quantos clientes ou requisições foram afetados, e por quanto tempo?

EN: *How many customers or requests were affected, and for how long?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Customer Obsession e Deliver Results pedem impacto em números: taxa de erro, duração, jornadas afetadas. “Praticamente todo o tráfego” precisa virar uma medida, ou uma estimativa declarada como estimativa.

</details>

### A5. Você era júnior. Quem decidiu alterar produção e o que exatamente foi seu?

EN: *You were a junior engineer. Who decided to change production, and what exactly did you do?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Separe suas ações das do time: quem conduziu o incidente, quem aprovou e quem executou cada mudança. “Aumentei… e ajustamos” na mesma frase provoca esta pergunta.

</details>

### A6. O que mudou depois do incidente?

EN: *What changed after the incident?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Postmortem, ajuste da política de escala, teste de carga, alarme novo. O aprendizado fica forte com uma mudança que de fato aconteceu depois, no time ou no seu trabalho; “hoje eu faria” não substitui o que foi feito.

</details>
