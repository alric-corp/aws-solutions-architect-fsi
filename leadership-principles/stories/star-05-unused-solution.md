# STAR-05 — Solução sem uso desligada

<div data-story-locales data-story-title-pt="STAR-05 — Solução sem uso desligada" data-story-title-en="STAR-05 — Decommissioning an unused solution">

<section data-story-locale="pt-BR" lang="pt-BR">

**No loop:** Ownership e Frugality, com Deliver Results na economia relatada. Uma história de discordância só se sustenta se houve resistência real; não acrescente conflito para encaixar um princípio.

[Foco do loop](../loop-focus.md) · [Ownership](../02-ownership.md) · [Have Backbone; Disagree and Commit](../13-have-backbone-disagree-and-commit.md)

> Relato autoral de Vitória, fornecido pelo proprietário. Tradução de estudo; execução e métricas não auditadas nesta página.

## STAR

**Situação.** Quando entrei em uma nova squad no **Itaú**, comecei a conhecer as soluções do time. Uma delas estava construída e em produção, mas me disseram que ainda não era consumida. Como era uma arquitetura relativamente grande e tinha havido várias trocas de pessoas e tech leads entre os times, investiguei melhor. Descobri que estava em produção havia cerca de **dois anos sem receber requisições**: não havia atividade relevante nos logs ou métricas, mas os recursos continuavam provisionados na AWS e gerando custo.

**Tarefa.** Eu precisava entender se ainda havia valor para o negócio e, caso não houvesse, garantir uma descontinuação segura e eliminar o custo dos recursos sem utilização.

**Ação.** Investiguei o uso com **CloudWatch, Splunk, logs e métricas** e confirmei ausência de tráfego. Depois validei com negócio, o time técnico da minha squad e o consumidor original. Todos confirmaram que a integração nunca havia ocorrido e que não havia intenção de uso futuro. Levantei os recursos e custos envolvidos, propus a descontinuação e desliguei os componentes em produção de forma controlada e em ordem lógica, validando o ambiente durante a remoção.

**Resultado.** Removemos uma arquitetura que estava havia cerca de **dois anos sem uso** e eliminamos aproximadamente **R$ 6 mil por mês** em custos AWS. Depois da remoção, validei a redução no **AWS Cost Explorer**, comparando antes e depois. Também removemos uma aplicação sem consumidor que ampliava a superfície operacional da squad sem gerar valor.

**Aprendizado.** Uma solução não deve continuar existindo só porque já foi construída. É necessário verificar valor para o negócio e custo de manutenção. A decisão de desligar exige evidências técnicas e alinhamento com as partes envolvidas. Identificar recursos ociosos pode ser automatizado; a decisão de remover ainda depende de contexto, criticidade, dependências e continuidade.

**A preencher:** [PREENCHER — citar os principais recursos removidos e o custo de cada um, com a fonte da comparação].

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Como você descobriu que não estava sendo utilizada?

<details><summary>Ver resposta preparada</summary>

Eu comecei olhando os sinais de uso da aplicação. Analisei CloudWatch, Splunk, logs e métricas e não encontrei tráfego ou atividade relevante. Depois validei esse histórico com os times envolvidos e confirmei que a integração nunca havia sido utilizada em produção.

</details>

### 2. Como você sabia que era seguro desligar?

<details><summary>Ver resposta preparada</summary>

Eu não tomei a decisão apenas olhando as métricas. Primeiro validei tecnicamente que não havia tráfego. Depois conversei com o time de negócio, o time técnico responsável e o time que originalmente consumiria a solução. Todos confirmaram que ela não era utilizada e que não havia intenção de utilizá-la no futuro.

</details>

### 3. Por que ninguém tinha desligado antes?

<details><summary>Ver resposta preparada</summary>

Pelo que eu consegui entender, houve várias trocas de pessoas e tech leads entre os times envolvidos. A solução ficou pronta, mas a integração nunca aconteceu. Com o tempo, ela acabou ficando sem um owner claro olhando para o ciclo de vida dela.

</details>

### 4. Como você mediu a economia?

<details><summary>Ver resposta preparada</summary>

Depois da remoção, utilizei o AWS Cost Explorer para comparar os custos antes e depois da descontinuação. A redução observada foi de aproximadamente R$ 6 mil por mês.

</details>

### 5. Por que não deixar ligado para o futuro?

<details><summary>Ver resposta preparada</summary>

Porque existia um custo recorrente para uma solução sem consumidor e sem previsão de uso. Manter recursos ligados apenas por possibilidade futura não fazia sentido naquele cenário. Se a necessidade voltasse, a solução poderia ser reavaliada e reprovisionada de acordo com os novos requisitos.

</details>

### 6. Como garantir que não existiam dependências ocultas?

<details><summary>Ver resposta preparada</summary>

Eu combinei duas validações: evidência técnica e confirmação dos stakeholders. Analisei logs, métricas e tráfego e também validei com os times que poderiam ter alguma dependência da solução. Só depois dessas duas validações propus o desligamento.

</details>

### 7. Você desligou tudo de uma vez?

<details><summary>Ver resposta preparada</summary>

Não. Como eram vários componentes, fiz a remoção de forma controlada e em uma ordem lógica, validando o ambiente durante o processo para reduzir o risco.

</details>

### 8. Por que a remoção não foi feita via Terraform?

<details><summary>Ver resposta preparada</summary>

Os repositórios estavam antigos e com módulos e dependências de infraestrutura desatualizados. Naquele momento, fazer uma alteração simples pelo Terraform exigiria primeiro corrigir toda essa cadeia. Como a aplicação já estava aprovada para descontinuação, seguimos o processo operacional permitido e fizemos a remoção de forma controlada diretamente no ambiente.

</details>

Enfatize sempre processo aprovado, remoção controlada e validação, para não parecer que a produção foi apagada pelo console.

### 9. Qual foi sua contribuição individual?

<details><summary>Ver resposta preparada</summary>

Eu identifiquei que a solução poderia estar sem uso, investiguei os dados técnicos, conversei com os stakeholders, levantei os custos, propus a descontinuação e executei a remoção dos recursos de forma controlada.

</details>

### 10. O que você faria diferente hoje?

<details><summary>Ver resposta preparada</summary>

Hoje eu tentaria criar mecanismos para identificar esse tipo de situação mais cedo, como dashboards ou alertas para aplicações que permanecem longos períodos sem tráfego, combinados com uma revisão periódica de custos e ownership. Também tentaria manter o ciclo de vida da infraestrutura mais saudável, garantindo que módulos e dependências continuassem atualizados mesmo em soluções com pouco uso, porque isso facilitaria uma futura alteração ou descontinuação.

</details>

### 11. Zero requisições significa zero valor para o negócio?

<details><summary>Ver resposta preparada</summary>

Não necessariamente. Por isso eu não tomaria uma decisão de desligamento apenas com base em tráfego. Uma solução pode ter uso sazonal, contingencial ou estratégico. Nesse caso específico, além da ausência de tráfego por cerca de dois anos, eu também validei com negócio e com o consumidor original que não existia intenção de utilização.

</details>

### 12. Você automatizaria o desligamento depois de X meses sem requisição?

<details><summary>Ver resposta preparada</summary>

Eu automatizaria a identificação, mas não necessariamente o desligamento. Uma automação poderia sinalizar recursos sem uso e iniciar uma revisão. A decisão de remover dependeria de contexto de negócio, criticidade, dependências e requisitos de continuidade.

</details>

### 13. Como evitaria que isso acontecesse novamente?

<details><summary>Ver resposta preparada</summary>

Eu criaria uma revisão periódica de aplicações e custos, com ownership claro, métricas de utilização e critérios para identificar componentes ociosos. Assim, uma solução que deixa de ser usada não fica anos consumindo recursos sem ser revisada.

</details>

## Aprofundamento: perguntas novas

Perguntas autorais para aprofundar. Quando não souber um fato, diga que não sabe e como o confirmaria.

### A1. Quais recursos foram removidos e quanto custava cada um?

<details><summary>Ver resposta: o que precisa aparecer</summary>

O texto ainda tem esse espaço em aberto. Preencha com os principais recursos e o custo de cada um, a partir do Cost Explorer. Sem isso, os R$ 6 mil por mês ficam sem composição.

</details>

### A2. Alguém resistiu ao desligamento? Quem aprovou?

<details><summary>Ver resposta: o que precisa aparecer</summary>

A resposta 5 sugere que alguém pode ter perguntado “por que não deixar ligado?”. Se houve discordância real, esta pode virar a história de Have Backbone que falta: o argumento, quem discordava, como foi decidido. Se ninguém resistiu, diga quem aprovou e siga com Ownership.

</details>

### A3. Sem Terraform, o que aconteceu com o código e o state depois da remoção?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Remover recursos fora do Terraform deixa o state e o repositório descrevendo algo que não existe mais. Diga se o código foi arquivado, se o state foi limpo, ou o que ficou pendente.

</details>

### A4. Havia dados armazenados? O que foi feito com eles antes da remoção?

<details><summary>Ver resposta: o que precisa aparecer</summary>

No setor financeiro, remover um banco ou bucket com dados exige uma decisão de retenção: backup, prazo legal, ou confirmação de que não havia dado relevante. Diga o que foi decidido e por quem.

</details>

### A5. Quanto tempo levou da descoberta ao desligamento?

<details><summary>Ver resposta: o que precisa aparecer</summary>

O tempo mostra se a iniciativa foi conduzida até o fim. Um número aproximado basta, desde que seja verdadeiro.

</details>

</section>

<section data-story-locale="en-US" lang="en-US">

**Loop preparation:** Ownership and Frugality, with Deliver Results in the reported savings. A disagreement story requires actual resistance; do not add conflict to fit a principle.

[Loop focus](../loop-focus.md) · [Ownership](../02-ownership.md) · [Have Backbone; Disagree and Commit](../13-have-backbone-disagree-and-commit.md)

> Original account by Vitória, supplied by the owner. Study translation; execution and metrics have not been audited on this page.

## STAR

**Situation.** When I joined a new squad at **Itaú**, I began learning about its solutions. One was already built and running in production, but I was told it was not being consumed. Because the architecture was relatively large and there had been several personnel and tech-lead changes across the teams, I investigated further. It had been in production for around **two years without requests**: there was no relevant activity in logs or metrics, but AWS resources remained provisioned and generating cost.

**Task.** I needed to establish whether it still had business value and, if it did not, safely decommission it and eliminate unused-resource costs.

**Action.** I investigated usage through **CloudWatch, Splunk, logs and metrics** and confirmed no traffic. I then checked with the business team, my squad’s technical team and the original intended consumer. They confirmed the integration had never happened and there was no plan to use it. I identified the resources and costs, proposed decommissioning, and shut down production components in a controlled, logical order while validating the environment throughout removal.

**Result.** We removed an architecture that had been unused for around **two years** and eliminated approximately **R$ 6,000 per month** in AWS costs. After removal, I validated the reduction in **AWS Cost Explorer** by comparing before and after. We also removed an application with no consumer that increased the squad’s operational surface without delivering business value.

**Learning.** A solution should not remain simply because it has already been built. We need to verify its business value and maintenance cost. Decommissioning requires technical evidence and alignment with stakeholders. Detecting idle resources can be automated; deciding to remove them still depends on business context, criticality, dependencies and continuity.

**To complete:** [PREENCHER — list the main resources removed and their individual costs, with the comparison source].

## Prepared questions

Answer aloud before opening.

### 1. How did you discover it wasn't being used?

<details><summary>View prepared answer</summary>

I started by checking the application's usage signals. I analyzed CloudWatch, Splunk, logs and metrics and found no traffic or relevant activity. Then I validated that history with the teams involved and confirmed that the integration had never actually been used in production.

</details>

### 2. How did you know it was safe to decommission it?

<details><summary>View prepared answer</summary>

I didn't make the decision based only on metrics. First, I technically confirmed there was no traffic. Then I spoke with the business team, the technical team responsible for the application and the team that was originally supposed to consume it. They all confirmed that it wasn't being used and there was no plan to use it in the future.

</details>

### 3. Why hadn't anyone decommissioned it before?

<details><summary>View prepared answer</summary>

From what I understood, there had been several changes in people and tech leads across the teams involved. The solution was completed, but the integration never happened. Over time, it remained running without clear ownership of its lifecycle.

</details>

### 4. How did you measure the savings?

<details><summary>View prepared answer</summary>

After the decommissioning, I used AWS Cost Explorer to compare the costs before and after the removal. The observed reduction was approximately R$ 6,000 per month.

</details>

### 5. Why not keep it running in case someone needs it later?

<details><summary>View prepared answer</summary>

Because there was a recurring cost for a solution with no consumers and no planned usage. Keeping resources running only for a possible future need didn't make sense in that scenario. If the need returned, the solution could be reassessed and provisioned again based on the new requirements.

</details>

### 6. How did you ensure there were no hidden dependencies?

<details><summary>View prepared answer</summary>

I combined two types of validation: technical evidence and stakeholder confirmation. I checked logs, metrics and traffic, and I also validated with the teams that could potentially depend on the solution. Only after both checks did I propose the decommissioning.

</details>

### 7. Did you shut everything down at once?

<details><summary>View prepared answer</summary>

No. Since there were multiple components, I decommissioned them in a controlled and logical order, validating the environment throughout the process to reduce risk.

</details>

### 8. Why wasn't the removal done through Terraform?

<details><summary>View prepared answer</summary>

The repositories were old and had outdated infrastructure modules and dependencies. At that point, making a simple Terraform change would first require fixing that entire chain. Since the application had already been approved for decommissioning, we followed the allowed operational process and removed the resources in a controlled way directly from the environment.

</details>

Emphasize the approved process, controlled removal and validation rather than suggesting that production was simply deleted through a console.

### 9. What was your individual contribution?

<details><summary>View prepared answer</summary>

I identified that the solution might be unused, investigated the technical data, aligned with the stakeholders, analyzed the costs, proposed the decommissioning and executed the controlled removal of the resources.

</details>

### 10. What would you do differently today?

<details><summary>View prepared answer</summary>

Today, I would try to detect this type of situation earlier. For example, I would use dashboards or alerts for applications that remain without traffic for long periods, combined with periodic cost and ownership reviews. I would also keep the infrastructure lifecycle healthier by ensuring that modules and dependencies remain updated, even for low-usage applications, because that would make future changes or decommissioning much easier.

</details>

### 11. Does zero requests mean zero business value?

<details><summary>View prepared answer</summary>

Not necessarily. That's why I wouldn't decommission a solution based only on traffic. An application can have seasonal, contingency or strategic value. In this case, in addition to having no traffic for around two years, I validated with the business and the original consumer that there was no intention to use it.

</details>

### 12. Would you automate decommissioning if there were no requests for X months?

<details><summary>View prepared answer</summary>

I would automate the detection, but not necessarily the decommissioning. An automation could flag unused resources and start a review process. The removal decision would still depend on business context, criticality, dependencies and continuity requirements.

</details>

### 13. How would you prevent this from happening again?

<details><summary>View prepared answer</summary>

I would create a periodic application and cost review process with clear ownership, usage metrics and criteria to identify idle components. That way, a solution that stops being used doesn't remain running for years without review.

</details>

## Additional follow-up questions

Authorial follow-ups for deeper discussion. If a fact is unknown, say so and explain how you would verify it.

### A1. Which resources were removed, and how much did each cost?

<details><summary>View answer: what to include</summary>

The resource breakdown is still missing. Fill in the principal resources and their individual costs using Cost Explorer evidence. Without that, the approximately R$ 6,000 per month has no explained composition.

</details>

### A2. Did anyone push back on the decommissioning? Who approved it?

<details><summary>View answer: what to include</summary>

Answer 5 suggests that someone could have asked why not keep it running. If there was a real disagreement, explain the opposing argument and decision. If nobody resisted, identify the approval and focus on Ownership instead of inventing conflict.

</details>

### A3. Without Terraform, what happened to the code and the state after the removal?

<details><summary>View answer: what to include</summary>

Removing resources outside Terraform can leave code and state describing infrastructure that no longer exists. Explain whether the code was archived, state reconciled or work left pending.

</details>

### A4. Was there stored data? What happened to it before the removal?

<details><summary>View answer: what to include</summary>

For stored data, explain the retention decision made before deletion: whether backup was required, which retention requirements applied, or whether no relevant data existed. Identify who decided; do not invent a legal retention period.

</details>

### A5. How long did it take from discovery to decommissioning?

<details><summary>View answer: what to include</summary>

An approximate but truthful duration helps explain how the initiative was carried through. Recover the interval from discovery to decommissioning rather than estimating without a basis.

</details>

</section>

</div>
