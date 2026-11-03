# STAR-05 — Solução sem uso desligada

**No loop:** Ownership ★ como principal. Também evidencia Deliver Results ★, com a economia medida, e pode ser pista para Have Backbone ★ (veja A2). Na tabela original o principal era Frugality, que não está entre os focos.

[Foco do loop](../loop-focus.md) · [Ownership](../02-ownership.md) · [Have Backbone; Disagree and Commit](../13-have-backbone-disagree-and-commit.md)

> Versão anonimizada: empresa e sistemas internos aparecem pela função. Os números são os do relato original.

## STAR

**Situação.** Quando entrei em uma nova squad no banco, comecei a conhecer as soluções sob responsabilidade do time. Uma delas estava completamente construída e rodando em produção, mas na apresentação me disseram, com naturalidade, que ainda não era consumida. Como era uma arquitetura relativamente grande e tinha havido várias trocas de pessoas e tech leads entre os times envolvidos, resolvi investigar. Descobri que ela estava em produção havia cerca de dois anos sem receber requisições. Não havia atividade relevante em logs ou métricas, mas todos os recursos continuavam provisionados na AWS e gerando custo.

**Tarefa.** Entender se a solução ainda tinha valor para o negócio e, se não tivesse, garantir uma descontinuação segura, eliminando o custo dos recursos ociosos.

**Ação.** Primeiro, investiguei o uso real com CloudWatch, Splunk, logs e métricas e confirmei que não havia tráfego. Depois, validei a situação com todas as partes envolvidas: o time de negócio, o time técnico da minha squad e o time que originalmente consumiria a solução. Todos confirmaram que a integração nunca havia acontecido e que não havia intenção de usá-la. Com essa validação, levantei os recursos e custos envolvidos, propus a descontinuação e desliguei os componentes em produção de forma controlada, validando o ambiente durante a remoção.

**A preencher:** quais eram os principais recursos e quanto custava cada um.

**Resultado.** Removemos uma arquitetura que estava havia cerca de dois anos sem uso e eliminamos aproximadamente R$ 6 mil por mês em custos AWS. A economia não foi só estimada: depois da remoção, validei pelo AWS Cost Explorer, comparando os custos antes e depois. Também eliminamos uma aplicação sem consumidor que aumentava a superfície operacional da squad sem gerar valor.

**Aprendizado.** Uma solução não deve continuar existindo só porque já foi construída. É preciso validar se ela ainda gera valor e se o custo de mantê-la faz sentido. E uma decisão de desligamento precisa de evidência técnica e alinhamento com todas as partes envolvidas.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Como você descobriu que não estava sendo utilizada?

EN: *How did you discover it wasn't being used?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu comecei olhando os sinais de uso da aplicação. Analisei CloudWatch, Splunk, logs e métricas e não encontrei tráfego ou atividade relevante. Depois validei esse histórico com os times envolvidos e confirmei que a integração nunca havia sido utilizada em produção.

**EN:** I started by checking the application's usage signals. I analyzed CloudWatch, Splunk, logs and metrics and found no traffic or relevant activity. Then I validated that history with the teams involved and confirmed that the integration had never actually been used in production.

</details>

### 2. Como você sabia que era seguro desligar?

EN: *How did you know it was safe to decommission it?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu não tomei a decisão apenas olhando as métricas. Primeiro validei tecnicamente que não havia tráfego. Depois conversei com o time de negócio, o time técnico responsável e o time que originalmente consumiria a solução. Todos confirmaram que ela não era utilizada e que não havia intenção de utilizá-la no futuro.

**EN:** I didn't make the decision based only on metrics. First, I technically confirmed there was no traffic. Then I spoke with the business team, the technical team responsible for the application and the team that was originally supposed to consume it. They all confirmed that it wasn't being used and there was no plan to use it in the future.

</details>

### 3. Por que ninguém tinha desligado antes?

EN: *Why hadn't anyone decommissioned it before?*

<details><summary>Ver resposta preparada</summary>

**PT:** Pelo que eu consegui entender, houve várias trocas de pessoas e tech leads entre os times envolvidos. A solução ficou pronta, mas a integração nunca aconteceu. Com o tempo, ela acabou ficando sem um owner claro olhando para o ciclo de vida dela.

**EN:** From what I understood, there had been several changes in people and tech leads across the teams involved. The solution was completed, but the integration never happened. Over time, it remained running without clear ownership of its lifecycle.

</details>

### 4. Como você mediu a economia?

EN: *How did you measure the savings?*

<details><summary>Ver resposta preparada</summary>

**PT:** Depois da remoção, utilizei o AWS Cost Explorer para comparar os custos antes e depois da descontinuação. A redução observada foi de aproximadamente R$ 6 mil por mês.

**EN:** After the decommissioning, I used AWS Cost Explorer to compare the costs before and after the removal. The observed reduction was approximately R$ 6,000 per month.

</details>

### 5. Por que não deixar ligado para o futuro?

EN: *Why not keep it running in case someone needs it later?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque existia um custo recorrente para uma solução sem consumidor e sem previsão de uso. Manter recursos ligados apenas por possibilidade futura não fazia sentido naquele cenário. Se a necessidade voltasse, a solução poderia ser reavaliada e reprovisionada de acordo com os novos requisitos.

**EN:** Because there was a recurring cost for a solution with no consumers and no planned usage. Keeping resources running only for a possible future need didn't make sense in that scenario. If the need returned, the solution could be reassessed and provisioned again based on the new requirements.

</details>

### 6. Como garantir que não existiam dependências ocultas?

EN: *How did you ensure there were no hidden dependencies?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu combinei duas validações: evidência técnica e confirmação dos stakeholders. Analisei logs, métricas e tráfego e também validei com os times que poderiam ter alguma dependência da solução. Só depois dessas duas validações propus o desligamento.

**EN:** I combined two types of validation: technical evidence and stakeholder confirmation. I checked logs, metrics and traffic, and I also validated with the teams that could potentially depend on the solution. Only after both checks did I propose the decommissioning.

</details>

### 7. Você desligou tudo de uma vez?

EN: *Did you shut everything down at once?*

<details><summary>Ver resposta preparada</summary>

**PT:** Não. Como eram vários componentes, fiz a remoção de forma controlada e em uma ordem lógica, validando o ambiente durante o processo para reduzir o risco.

**EN:** No. Since there were multiple components, I decommissioned them in a controlled and logical order, validating the environment throughout the process to reduce risk.

</details>

### 8. Por que a remoção não foi feita via Terraform?

EN: *Why wasn't the removal done through Terraform?*

<details><summary>Ver resposta preparada</summary>

**PT:** Os repositórios estavam antigos e com módulos e dependências de infraestrutura desatualizados. Naquele momento, fazer uma alteração simples pelo Terraform exigiria primeiro corrigir toda essa cadeia. Como a aplicação já estava aprovada para descontinuação, seguimos o processo operacional permitido e fizemos a remoção de forma controlada diretamente no ambiente.

**EN:** The repositories were old and had outdated infrastructure modules and dependencies. At that point, making a simple Terraform change would first require fixing that entire chain. Since the application had already been approved for decommissioning, we followed the allowed operational process and removed the resources in a controlled way directly from the environment.

</details>

Enfatize sempre processo aprovado, remoção controlada e validação, para não parecer que a produção foi apagada pelo console.

### 9. Qual foi sua contribuição individual?

EN: *What was your individual contribution?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu identifiquei que a solução poderia estar sem uso, investiguei os dados técnicos, conversei com os stakeholders, levantei os custos, propus a descontinuação e executei a remoção dos recursos de forma controlada.

**EN:** I identified that the solution might be unused, investigated the technical data, aligned with the stakeholders, analyzed the costs, proposed the decommissioning and executed the controlled removal of the resources.

</details>

### 10. O que você faria diferente hoje?

EN: *What would you do differently today?*

<details><summary>Ver resposta preparada</summary>

**PT:** Hoje eu tentaria criar mecanismos para identificar esse tipo de situação mais cedo, como dashboards ou alertas para aplicações que permanecem longos períodos sem tráfego, combinados com uma revisão periódica de custos e ownership. Também tentaria manter o ciclo de vida da infraestrutura mais saudável, garantindo que módulos e dependências continuassem atualizados mesmo em soluções com pouco uso, porque isso facilitaria uma futura alteração ou descontinuação.

**EN:** Today, I would try to detect this type of situation earlier. For example, I would use dashboards or alerts for applications that remain without traffic for long periods, combined with periodic cost and ownership reviews. I would also keep the infrastructure lifecycle healthier by ensuring that modules and dependencies remain updated, even for low-usage applications, because that would make future changes or decommissioning much easier.

</details>

### 11. Zero requisições significa zero valor para o negócio?

EN: *Does zero requests mean zero business value?*

<details><summary>Ver resposta preparada</summary>

**PT:** Não necessariamente. Por isso eu não tomaria uma decisão de desligamento apenas com base em tráfego. Uma solução pode ter uso sazonal, contingencial ou estratégico. Nesse caso específico, além da ausência de tráfego por cerca de dois anos, eu também validei com negócio e com o consumidor original que não existia intenção de utilização.

**EN:** Not necessarily. That's why I wouldn't decommission a solution based only on traffic. An application can have seasonal, contingency or strategic value. In this case, in addition to having no traffic for around two years, I validated with the business and the original consumer that there was no intention to use it.

</details>

### 12. Você automatizaria o desligamento depois de X meses sem requisição?

EN: *Would you automate decommissioning if there were no requests for X months?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu automatizaria a identificação, mas não necessariamente o desligamento. Uma automação poderia sinalizar recursos sem uso e iniciar uma revisão. A decisão de remover dependeria de contexto de negócio, criticidade, dependências e requisitos de continuidade.

**EN:** I would automate the detection, but not necessarily the decommissioning. An automation could flag unused resources and start a review process. The removal decision would still depend on business context, criticality, dependencies and continuity requirements.

</details>

### 13. Como evitaria que isso acontecesse novamente?

EN: *How would you prevent this from happening again?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu criaria uma revisão periódica de aplicações e custos, com ownership claro, métricas de utilização e critérios para identificar componentes ociosos. Assim, uma solução que deixa de ser usada não fica anos consumindo recursos sem ser revisada.

**EN:** I would create a periodic application and cost review process with clear ownership, usage metrics and criteria to identify idle components. That way, a solution that stops being used doesn't remain running for years without review.

</details>

## Aprofundamento: perguntas novas

São os pontos que um entrevistador vai apertar. Quando não souber um fato, diga que não sabe e como confirmaria.

### A1. Quais recursos foram removidos e quanto custava cada um?

EN: *Which resources were removed, and how much did each cost?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

O texto ainda tem esse espaço em aberto. Preencha com os principais recursos e o custo de cada um, a partir do Cost Explorer. Sem isso, os R$ 6 mil por mês ficam sem composição.

</details>

### A2. Alguém resistiu ao desligamento? Quem aprovou?

EN: *Did anyone push back on the decommissioning? Who approved it?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

A resposta 5 sugere que alguém pode ter perguntado “por que não deixar ligado?”. Se houve discordância real, esta pode virar a história de Have Backbone que falta: o argumento, quem discordava, como foi decidido. Se ninguém resistiu, diga quem aprovou e siga com Ownership.

</details>

### A3. Sem Terraform, o que aconteceu com o código e o state depois da remoção?

EN: *Without Terraform, what happened to the code and the state after the removal?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Remover recursos fora do Terraform deixa o state e o repositório descrevendo algo que não existe mais. Diga se o código foi arquivado, se o state foi limpo, ou o que ficou pendente.

</details>

### A4. Havia dados armazenados? O que foi feito com eles antes da remoção?

EN: *Was there stored data? What happened to it before the removal?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

No setor financeiro, remover um banco ou bucket com dados exige uma decisão de retenção: backup, prazo legal, ou confirmação de que não havia dado relevante. Diga o que foi decidido e por quem.

</details>

### A5. Quanto tempo levou da descoberta ao desligamento?

EN: *How long did it take from discovery to decommissioning?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

O tempo mostra se a iniciativa foi conduzida até o fim. Um número aproximado basta, desde que seja verdadeiro.

</details>
