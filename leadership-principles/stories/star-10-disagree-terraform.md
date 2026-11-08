# STAR-10 — Discordância sobre StackSpot e módulos Terraform

<div data-story-locales data-story-title-pt="STAR-10 — Discordância sobre StackSpot e módulos Terraform" data-story-title-en="STAR-10 — Disagreeing about StackSpot and Terraform modules">

<section data-story-locale="pt-BR" lang="pt-BR">

> Relato autoral de Vitória, fornecido pelo proprietário. Tradução de estudo; execução e métricas não auditadas nesta página.

**Preparação:** Have Backbone; Disagree and Commit é a associação principal sugerida. Ownership e Dive Deep ajudam a explorar julgamento e evidências; não são atribuições oficiais de entrevistadores. A decisão adotada foi alinhada à proposta da Vitória. Isso, sozinho, não demonstra como ela apoiou uma decisão contrária à sua preferência.

[Have Backbone; Disagree and Commit](../13-have-backbone-disagree-and-commit.md) · [Ownership](../02-ownership.md) · [Dive Deep](../12-dive-deep.md) · [Foco do loop](../loop-focus.md)

## STAR

**Situação.** Atuando como engenheira de software sênior no **Itaú**, participei de uma reunião com lideranças e Tech Leads sobre a migração dos plugins **StackSpot** para os módulos oficiais de **Terraform** do banco, mantidos pelo **HN8**.

Na minha área, um especialista havia criado plugins customizados para facilitar o trabalho dos desenvolvedores. Porém, alterações para uma aplicação estavam provocando falhas de deploy em outras, inclusive em produção. Não havia uma equipe dedicada à manutenção, somente o especialista, e o banco já havia determinado a descontinuação dessa utilização do StackSpot. Mesmo assim, o especialista defendia manter os plugins antigos.

**Tarefa.** Eu discordava dessa recomendação e precisava defender uma alternativa mais segura, mesmo diante de um especialista mais experiente, sem prejudicar a produtividade dos desenvolvedores.

**Ação.** Durante a reunião, reconheci a facilidade que os plugins ofereciam, mas apresentei três riscos: **falhas em produção, ausência de suporte especializado e descumprimento do direcionamento corporativo**.

Quando o especialista argumentou que os plugins eram open source e qualquer desenvolvedor poderia mantê-los, questionei que acesso ao código não significava conhecimento ou disponibilidade para realizar manutenções com segurança.

Também apresentei uma evidência prática: já havia estudado a documentação e provisionado um **ECS com o módulo oficial do HN8**, sem dificuldades naquele cenário. Por isso, defendi uma migração gradual para os módulos oficiais, preservando a facilidade de provisionamento com padronização e suporte especializado.

**Resultado.** Minha recomendação de migração gradual foi adotada. **Na minha sigla, de aproximadamente 200 repositórios, apenas um ou dois ainda utilizam os plugins antigos**, o que representa uma migração próxima de **99%**. Esse recorte é da minha área, não do banco inteiro.

Desde então, deixei de observar na minha área os problemas anteriores de deploy relacionados às customizações. A manutenção passou a contar com uma equipe especializada. Não tenho uma métrica consolidada que permita afirmar uma redução percentual de incidentes.

**Aprendizado.** Discordar de alguém mais experiente exige coragem, respeito e evidências. Uma solução precisa ser avaliada pela estabilidade e capacidade de manutenção, além da facilidade de implementação.

> **Fatos a confirmar.** Recuperar o mecanismo técnico das falhas, a reação real de **Kleber**, a duração da migração e as ações individuais da Vitória na execução ou no acompanhamento após a reunião. O teste de um ECS demonstra viabilidade daquele cenário; não comprova a adequação de todos os módulos. Não presumir falta de versionamento, uma reação emocional ou execução pessoal de todo o resultado coletivo.

## Discordância e comunicação

Responda antes de abrir. As perguntas são de estudo, não questões oficiais da AWS.

### 1. Por que você decidiu discordar de um especialista mais experiente?

<details><summary>Ver resposta preparada</summary>

Porque eu já tinha evidências de problemas reais em produção e entendia que continuar utilizando os plugins representava riscos para outras aplicações. Não era uma discordância pessoal, mas uma preocupação com estabilidade, manutenção e governança.

</details>

### 2. Como o especialista reagiu quando você discordou dele?

<details><summary>Ver resposta: o que precisa aparecer</summary>

**A confirmar:** recuperar a reação real de Kleber e como Vitória respondeu, especialmente se houve resistência. Não atribuir irritação, concordância ou qualquer outra emoção sem o relato. Uma resposta completa deve explicar a interação concreta, e não apenas dizer que foi respeitosa.

</details>

### 3. Por que você preferiu discordar durante a reunião, em vez de conversar individualmente?

<details><summary>Ver resposta preparada</summary>

Como a recomendação estava sendo discutida naquela reunião e afetava a decisão de várias equipes, considerei importante apresentar os riscos naquele momento. Minha intenção não era expor o especialista, mas garantir que as lideranças tivessem informações suficientes para decidir.

</details>

### 4. E se a liderança tivesse decidido continuar utilizando os plugins antigos?

<details><summary>Ver resposta preparada</summary>

Eu deixaria os riscos documentados e respeitaria a decisão, desde que ela não contrariasse controles obrigatórios de segurança ou governança. Se houvesse conflito com o direcionamento corporativo, buscaria esclarecê-lo e apoiaria uma solução formalmente aprovada.

> Esta é uma resposta hipotética. O relato informa que a recomendação de migração foi adotada; não afirmar que esse desfecho alternativo aconteceu.

</details>

## Decisões técnicas e arquitetura

### 5. O que exatamente causava as falhas nos deploys?

<details><summary>Ver resposta: o que precisa aparecer</summary>

**A confirmar:** explicar o mecanismo técnico real: como a alteração de um plugin afetava outras aplicações, quais dependências eram compartilhadas e como o erro aparecia nas pipelines. Não inventar falta de versionamento, um tipo de acoplamento ou uma configuração que não foi confirmada.

</details>

### 6. Como você sabia que o módulo oficial era melhor se havia testado apenas um ECS?

<details><summary>Ver resposta preparada</summary>

Eu não tinha evidências para afirmar que todos os módulos estavam prontos. Meu teste comprovava a viabilidade daquele cenário específico. Por isso, defendi uma migração gradual, validando as necessidades de cada aplicação antes da substituição.

</details>

### 7. Como você evitaria que a migração causasse novos incidentes?

<details><summary>Ver resposta preparada</summary>

Eu começaria pelo levantamento das dependências, avaliaria diferenças de configuração e validaria os módulos em ambientes não produtivos. Também revisaria o Terraform plan, teria uma estratégia de recuperação e faria as mudanças de forma controlada, seguindo os processos do banco.

> Estratégia proposta para uma nova execução. Não afirmar que todas essas etapas foram executadas nesse caso sem confirmar o histórico. Uma estratégia de recuperação precisa considerar os recursos e o estado efetivamente alterados.

</details>

### 8. Por que ser open source não era suficiente?

<details><summary>Ver resposta preparada</summary>

Porque acesso ao código não garante manutenção. Os desenvolvedores precisariam conhecer a implementação, suas dependências e os impactos das alterações. O problema não era o código ser aberto, mas não existir uma equipe responsável pela evolução e pelo suporte dos plugins.

</details>

## Resultados e métricas

### 9. Como você chegou aos 99% de migração?

<details><summary>Ver resposta preparada</summary>

Na minha sigla, havia aproximadamente 200 repositórios. Apenas um ou dois ainda utilizam os plugins antigos. Portanto, a adoção dos módulos oficiais está próxima de 99%. Esse número se refere à minha sigla, não ao banco inteiro.

> Os números são aproximados e descrevem adoção no recorte informado, não uma medida de redução de incidentes.

</details>

### 10. Quanto tempo levou para migrar os repositórios?

<details><summary>Ver resposta: o que precisa aparecer</summary>

**A confirmar:** recuperar a duração real e quais marcos definem o início e o fim do período. Não estimar um prazo plausível sem fundamento. Se a migração ainda tem um ou dois repositórios pendentes, explicar o período já observado e o que ainda não terminou.

</details>

### 11. Como você comprovou que os incidentes diminuíram?

<details><summary>Ver resposta preparada</summary>

Depois da migração, deixei de observar na minha área os problemas de deploy relacionados às customizações anteriores. Não tenho uma métrica consolidada de redução de incidentes, então não afirmaria uma redução percentual.

> Distinguir observação operacional, período acompanhado e medição consolidada. Não transformar ausência de relatos em garantia de que qualquer incidente deixou de existir.

</details>

### 12. Qual foi sua contribuição pessoal para atingir os 99%?

<details><summary>Ver resposta: o que precisa aparecer</summary>

**A confirmar:** separar a contribuição na discussão técnica e o teste de ECS das ações de execução da migração. Recuperar fatos sobre validações conduzidas, orientação a desenvolvedores ou acompanhamento, caso tenham acontecido. O resultado é coletivo; não atribuir à Vitória a execução dos aproximadamente 200 repositórios sem evidência.

</details>

## Aprendizado e compromisso

### 13. O que você faria diferente?

<details><summary>Ver resposta preparada</summary>

Eu buscaria levar um comparativo mais estruturado entre as duas abordagens, incluindo exemplos de falhas, esforço de manutenção e critérios de adoção dos módulos oficiais. Isso ajudaria a direcionar a discussão ainda mais para evidências.

</details>

### 14. Você acha que poderia ter prejudicado seu relacionamento com o especialista?

<details><summary>Ver resposta preparada</summary>

Esse era um cuidado importante. Por isso, reconheci que ele havia desenvolvido os plugins para resolver um problema legítimo. Minha discordância era sobre a continuidade da solução diante dos problemas operacionais, e não sobre a competência ou a intenção dele.

> Não concluir como o relacionamento evoluiu sem recuperar o que aconteceu depois.

</details>

### 15. Como você demonstrou Disagree and Commit depois da decisão?

<details><summary>Ver resposta: o que precisa aparecer</summary>

**A confirmar:** recuperar uma ação concreta na execução ou no acompanhamento após a reunião. O acordo foi alinhado à proposta da Vitória; isso pode demonstrar discordância sustentada por evidências e influência, mas não comprova por si só que ela apoiou uma decisão contrária à sua preferência. Não inventar tarefas, compromissos ou resultados posteriores para preencher essa faceta.

</details>

</section>

<section data-story-locale="en-US" lang="en-US">

> Story authored by Vitória, supplied by the owner. Study translation; execution and metrics have not been audited on this page.

**Preparation:** Have Backbone; Disagree and Commit is the suggested primary association. Ownership and Dive Deep help explore judgment and evidence; these are not official interviewer assignments. The adopted decision aligned with Vitória’s proposal. That alone does not demonstrate how she supported a decision that went against her preference.

[Have Backbone; Disagree and Commit](../13-have-backbone-disagree-and-commit.md) · [Ownership](../02-ownership.md) · [Dive Deep](../12-dive-deep.md) · [Loop focus](../loop-focus.md)

## STAR

**Situation.** As a senior software engineer at **Itaú**, I joined a meeting with leaders and Tech Leads about migrating **StackSpot** plugins to the bank’s official **Terraform** modules, maintained by **HN8**.

In my area, a specialist had created custom plugins to make developers’ work easier. However, changes for one application were causing deployment failures in others, including production applications. There was no dedicated maintenance team, only the specialist, and the bank had already directed teams to discontinue this use of StackSpot. Even so, the specialist advocated keeping the old plugins.

**Task.** I disagreed with that recommendation and needed to advocate a safer alternative, even when addressing a more experienced specialist, while protecting developer productivity.

**Action.** During the meeting, I acknowledged the convenience of the plugins but presented three risks: **production failures, no dedicated specialist support, and conflict with the corporate direction**.

When the specialist argued that the plugins were open source and any developer could maintain them, I challenged the assumption that access to the code meant having the knowledge or availability to maintain it safely.

I also presented practical evidence: I had already studied the documentation and provisioned **ECS using the official HN8 module**, without difficulty in that scenario. I advocated a gradual migration to the official modules, retaining ease of provisioning while adding standardization and dedicated support.

**Result.** My recommendation for a gradual migration was adopted. **In my organizational unit, out of approximately 200 repositories, only one or two still use the old plugins**, representing a migration rate of roughly **99%**. That scope is my area, not the entire bank.

Since then, I have stopped observing the previous customization-related deployment problems in my area. A dedicated team now supports maintenance. I do not have a consolidated metric that would justify a percentage reduction in incidents.

**Learning.** Disagreeing with someone more experienced requires courage, respect, and evidence. A solution needs to be assessed for stability and maintainability as well as ease of implementation.

> **Facts to confirm.** Recover the technical failure mechanism, **Kleber’s** actual reaction, the migration duration, and Vitória’s individual execution or follow-up actions after the meeting. Testing one ECS scenario demonstrates its feasibility; it does not establish the suitability of every module. Do not assume missing versioning, an emotional reaction, or personal execution of the entire collective result.

## Disagreement and communication

Answer before opening. These are study questions, not official AWS interview questions.

### 1. Why did you disagree with a more experienced specialist?

<details><summary>View prepared answer</summary>

Because I already had evidence of real production problems, and I believed that continuing to use the plugins created risks for other applications. It was not a personal disagreement; it was a concern about stability, maintenance, and governance.

</details>

### 2. How did the specialist react when you disagreed?

<details><summary>View answer: what to include</summary>

**To confirm:** recover Kleber’s actual reaction and how Vitória responded, especially if there was resistance. Do not attribute irritation, agreement, or any other emotion without an account of it. A complete answer should describe the concrete interaction rather than simply saying it was respectful.

</details>

### 3. Why did you disagree during the meeting rather than speak privately?

<details><summary>View prepared answer</summary>

The recommendation was being discussed in that meeting and affected several teams, so I thought it was important to present the risks at that point. My intention was not to embarrass the specialist, but to give the leaders enough information to make a decision.

</details>

### 4. What if leadership had decided to keep the old plugins?

<details><summary>View prepared answer</summary>

I would document the risks and respect the decision, provided it did not conflict with mandatory security or governance controls. If it conflicted with corporate direction, I would seek clarification and support a formally approved resolution.

> This is a hypothetical answer. The account says the migration recommendation was adopted; do not claim this alternative outcome happened.

</details>

## Technical and architectural decisions

### 5. What exactly caused the deployment failures?

<details><summary>View answer: what to include</summary>

**To confirm:** explain the actual technical mechanism: how a plugin change affected other applications, which dependencies were shared, and how the error appeared in the pipelines. Do not invent missing versioning, a particular coupling mechanism, or an unconfirmed configuration.

</details>

### 6. How did you know the official module was better after testing only one ECS scenario?

<details><summary>View prepared answer</summary>

I did not have evidence to claim that all modules were ready. My test demonstrated feasibility for that specific scenario. That is why I advocated a gradual migration, validating each application’s needs before replacing the existing approach.

</details>

### 7. How would you prevent the migration from causing new incidents?

<details><summary>View prepared answer</summary>

I would start by mapping dependencies, assess configuration differences, and validate the modules in non-production environments. I would also review the Terraform plan, prepare a recovery strategy, and make controlled changes following the bank’s processes.

> This is a proposed strategy for a future execution. Do not claim every step occurred in this case without confirming the history. A recovery strategy needs to account for the resources and state that were actually changed.

</details>

### 8. Why was being open source not enough?

<details><summary>View prepared answer</summary>

Access to code does not guarantee maintenance. Developers would need to understand the implementation, its dependencies, and the impact of changes. The problem was not that the code was open source; it was that there was no team responsible for evolving and supporting the plugins.

</details>

## Results and metrics

### 9. How did you calculate the 99% migration rate?

<details><summary>View prepared answer</summary>

My organizational unit had approximately 200 repositories. Only one or two still use the old plugins, so adoption of the official modules is close to 99%. This number refers to my unit, not the entire bank.

> These are approximate numbers describing adoption within the stated scope, not a measure of incident reduction.

</details>

### 10. How long did the repository migration take?

<details><summary>View answer: what to include</summary>

**To confirm:** recover the actual duration and the milestones that define its beginning and end. Do not invent a plausible timeframe. If one or two repositories remain, explain the period observed so far and what has not yet finished.

</details>

### 11. How did you establish that incidents decreased?

<details><summary>View prepared answer</summary>

After the migration, I stopped observing deployment problems related to the previous customizations in my area. I do not have a consolidated incident-reduction metric, so I would not claim a percentage reduction.

> Distinguish operational observation, the observation period, and consolidated measurement. Do not turn an absence of reports into a guarantee that no incident occurred.

</details>

### 12. What was your personal contribution to reaching 99%?

<details><summary>View answer: what to include</summary>

**To confirm:** separate the technical discussion and ECS test from migration execution. Recover concrete validations, developer guidance, or follow-up actions, if they occurred. The result is collective; do not attribute execution across roughly 200 repositories to Vitória without evidence.

</details>

## Learning and commitment

### 13. What would you do differently?

<details><summary>View prepared answer</summary>

I would bring a more structured comparison of the two approaches, including examples of failures, maintenance effort, and adoption criteria for the official modules. That would help focus the discussion even more on evidence.

</details>

### 14. Could your disagreement have harmed your relationship with the specialist?

<details><summary>View prepared answer</summary>

That was an important consideration. I acknowledged that he had developed the plugins to solve a legitimate problem. My disagreement concerned continuing the solution in light of operational problems, not his competence or intentions.

> Do not claim how the relationship evolved without recovering what happened afterward.

</details>

### 15. How did you demonstrate Disagree and Commit after the decision?

<details><summary>View answer: what to include</summary>

**To confirm:** recover a concrete execution or follow-up action after the meeting. The decision aligned with Vitória’s proposal; this can demonstrate evidence-based disagreement and influence, but does not by itself prove support for a decision against her preference. Do not invent later tasks, commitments, or results to fill this facet.

</details>

</section>

</div>
