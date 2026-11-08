# STAR-04 — Ownership de repositórios no CMDB

<div data-story-locales data-story-title-pt="STAR-04 — Ownership de repositórios no CMDB" data-story-title-en="STAR-04 — Repository ownership in CMDB">

<section data-story-locale="pt-BR" lang="pt-BR">

**No loop:** Dive Deep como principal e Learn and Be Curious como alternativa de preparação. Ownership aparece na iniciativa própria. Think Big exige separar uma evolução proposta de expansão efetivamente realizada.

[Foco do loop](../loop-focus.md) · [Dive Deep](../12-dive-deep.md) · [Learn and Be Curious](../05-learn-and-be-curious.md)

> Relato autoral de Vitória, fornecido pelo proprietário. Tradução de estudo; execução e métricas não auditadas nesta página.

> **Pendência:** conciliar resultado confirmado e acompanhamento. A versão STAR afirma 12% → 90% efetivamente refletidos no CMDB; a resposta 7 qualifica os números e evita afirmar 90% definitivamente concluído. As duas versões foram mantidas como fornecidas. Não apresentar 90% definitivo até confirmar população, período e ciclo de atualização.

## STAR

**Situação.** No Itaú, existia um problema de governança do ownership dos repositórios no **CMDB**, nossa base centralizada de componentes de TI e responsáveis. Um repositório novo ficava associado à squad guarda-chuva da conta AWS; a correção exigia um chamado manual. O passivo chegou a aproximadamente **400 repositórios associados à mesma squad**, embora pertencessem a equipes diferentes. Uma nova diretriz podia impedir mudanças de squads que atingissem certo percentual de incidentes. Assim, indicadores das squads guarda-chuva podiam receber incidentes de aplicações de outros times. A orientação foi que cada squad abrisse seus chamados de correção.

**Tarefa.** Enxerguei uma oportunidade de automatizar esse processo manual. Por iniciativa própria, propus investigar uma solução que identificasse os responsáveis e automatizasse a correção. Apresentei a proposta ao meu gerente, que havia orientado a correção manual e me deu espaço para explorar. Assumi a responsabilidade de desenvolver uma solução eficiente e segura, pois uma atribuição incorreta também prejudicaria outra squad.

**Ação.** Comecei com uma POC de agente de IA no **StackSpot**, recebendo repositórios, consultando o **GitHub**, identificando squads por tags e abrindo chamados no **ServiceNow**. Nos testes, encontrei tags ausentes ou inconsistentes. Investiguei outras fontes e encontrei bases estruturadas no **Mesh** que permitiam cruzar repositórios, commits e colaboradores. Redesenhei a solução como uma automação em **Python**, baseada em evidências. Usei uma janela de **10 meses**, mínimo de **3 commits** e dominância de pelo menos **60%** de uma squad para recomendar a transferência. Implementei **dry run** antes dos chamados e preservei casos inconclusivos para análise humana. Substituí o agente por regras determinísticas mais simples, previsíveis e auditáveis.

**Resultado.** Com a automação que desenvolvi, elevei o ownership correto de **12% para 90%, melhoria de 78 pontos percentuais**, com alterações refletidas no CMDB. Também relatei a redução de aproximadamente **400 repositórios** na squad guarda-chuva para cerca de **39 pendentes no acompanhamento**. Isso contribuiu para responsabilidades e indicadores mais confiáveis e reduziu complexidade e custos operacionais do uso de IA. **O status de confirmação desses números precisa ser conciliado com a resposta 7 abaixo**, que descreve acompanhamento e alterações ainda sujeitas ao ciclo de atualização.

**Aprendizado.** A solução mais sofisticada nem sempre é a melhor. A IA ajudou a validar rapidamente a ideia, mas dados estruturados e critérios objetivos tornaram a solução determinística mais simples, barata e auditável. Automação segura não significa automatizar 100%: sem evidência suficiente, prefiro análise humana a uma decisão errada. Meu objetivo não era automatizar todos os casos, mas automatizar com segurança aquilo que conseguíamos comprovar com dados.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Por que você retirou a IA?

<details><summary>Ver resposta preparada</summary>

A IA foi útil para validar rapidamente a ideia. Mas, durante a POC, percebi que o problema poderia ser resolvido com dados estruturados e regras objetivas. Nesse cenário, manter o agente adicionava consumo de tokens, chamadas ao GitHub e menos previsibilidade. Então simplifiquei a arquitetura e passei para uma solução determinística, mais barata e mais fácil de auditar.

</details>

### 2. Por que não automatizar 100%?

<details><summary>Ver resposta preparada</summary>

Porque meu objetivo não era automatizar a qualquer custo. Era automatizar com segurança aquilo que eu conseguia comprovar com dados. Quando havia empate, falta de informação ou pouca evidência, eu preferia direcionar o caso para análise humana.

</details>

### 3. Por que 60% de commits e mínimo de três?

<details><summary>Ver resposta preparada</summary>

Eu precisava criar uma barreira para evitar transferir um repositório porque alguém fez uma contribuição pontual. Por isso combinei um mínimo de commits com uma dominância da squad. Esses valores funcionaram como critérios iniciais da solução e foram validados através do dry run. Se a solução fosse expandida, eu continuaria revisando esses thresholds com base nos resultados reais.

</details>

### 4. Commits realmente provam ownership?

<details><summary>Ver resposta preparada</summary>

Não isoladamente. Por isso eu não utilizava somente commits. Eu cruzava diferentes fontes: squad guarda-chuva, repositórios associados, autores dos commits, squad desses colaboradores e informações do próprio repositório. Os commits eram uma evidência importante, mas a decisão vinha da combinação dos dados.

</details>

### 5. Por que dry run?

<details><summary>Ver resposta preparada</summary>

Porque a automação poderia gerar uma mudança real de ownership no CMDB. Antes de executar qualquer ação, eu queria conseguir visualizar exatamente o que seria feito e por quê. O dry run também foi fundamental para ajustar as regras sem risco operacional.

</details>

### 6. Como você tornava a decisão auditável?

<details><summary>Ver resposta preparada</summary>

Para cada decisão eu conseguia mostrar os dados que levaram à conclusão: quais pessoas fizeram commits, quantos commits existiam, qual squad tinha maior dominância e de qual base veio a informação do colaborador. Então a automação não entregava apenas a resposta; ela conseguia explicar a decisão.

</details>

### 7. Qual foi o resultado?

<details><summary>Ver resposta preparada</summary>

Partimos de aproximadamente 400 repositórios associados à squad guarda-chuva e chegamos a um conjunto pendente próximo de 39 no acompanhamento, reduzindo significativamente o passivo. Em um dos dry runs, analisamos 120 repositórios automaticamente, separando casos para correção, casos já corretos, candidatos a arquivamento e exceções que exigiam análise humana.

</details>

Evite dizer “90% resolvido definitivamente”: algumas alterações ainda dependiam do ciclo de atualização do CMDB.

### 8. Como você mediria a qualidade da automação?

<details><summary>Ver resposta preparada</summary>

Eu acompanharia quantos casos foram classificados automaticamente, quantos precisaram de análise humana, quantas recomendações foram confirmadas como corretas e quantos chamados falharam. Também acompanharia falsos positivos, porque nesse cenário uma transferência errada é mais perigosa do que deixar um caso para análise manual.

</details>

### 9. Por que código da squad em vez do nome?

<details><summary>Ver resposta preparada</summary>

Porque nomes podem variar entre sistemas por abreviação, acento ou pequenas diferenças de escrita. O código é um identificador mais estável e reduz erros de comparação.

</details>

### 10. Por que Lambda com EventBridge no futuro?

<details><summary>Ver resposta preparada</summary>

Porque depois que a lógica passou a ser determinística, ela poderia ser executada de forma periódica sem intervenção humana. A Lambda executaria o processamento e o EventBridge poderia dispará-la em uma frequência definida, por exemplo semanalmente.

</details>

### 11. Por que usuário técnico?

<details><summary>Ver resposta preparada</summary>

Porque a automação não deveria depender da minha sessão ou da conta pessoal de qualquer funcionário. Um usuário técnico permite desacoplar a solução de uma pessoa específica e controlar as permissões necessárias para a integração.

</details>

Se aprofundarem, puxe o princípio de menor privilégio.

### 12. Como protegeria essa credencial?

<details><summary>Ver resposta preparada</summary>

Eu evitaria colocar qualquer credencial no código. Utilizaria um mecanismo seguro de armazenamento de secrets, com acesso restrito à identidade de execução da aplicação e princípio de menor privilégio.

</details>

### 13. E se o ServiceNow ficar indisponível?

<details><summary>Ver resposta preparada</summary>

Eu separaria a decisão da execução. A análise poderia continuar sendo feita, mas a abertura do chamado precisaria ter retry controlado e rastreabilidade. Se a integração continuasse falhando, eu preservaria o item para reprocessamento em vez de perder a operação.

</details>

### 14. Como evitar chamado duplicado?

<details><summary>Ver resposta preparada</summary>

Eu tornaria a operação idempotente, mantendo um identificador único para aquela correção e verificando se já existe um chamado aberto ou concluído antes de criar outro.

</details>

### 15. Por que não corrigir diretamente na origem?

<details><summary>Ver resposta preparada</summary>

Esse é justamente o próximo estágio que eu considero ideal. A solução atual corrige um passivo existente, mas a evolução seria identificar a squad correta no momento da criação do repositório. Assim, além de limpar o passivo, evitaríamos criar um novo.

</details>

### 16. O que você faria diferente hoje?

<details><summary>Ver resposta preparada</summary>

Eu manteria a ideia do dry run e das decisões conservadoras, mas desde o início estruturaria métricas de precisão da automação, principalmente falsos positivos e casos enviados para análise humana. Também trabalharia mais cedo na integração com usuário técnico para remover a dependência da autenticação humana.

</details>

### 17. E se a squad que mantém o sistema quase não faz commits?

<details><summary>Ver resposta preparada</summary>

Esse é um exemplo de caso em que eu não gostaria de confiar cegamente em uma única métrica. Se a evidência não atingisse os critérios definidos, eu não faria a transferência automática. Em uma evolução, eu também poderia adicionar outras fontes de ownership para aumentar a confiança da decisão.

</details>

### 18. Por que 10 meses e não 3, 6 ou 12?

<details><summary>Ver resposta preparada</summary>

Foi uma janela escolhida para ter histórico suficiente sem considerar atividade muito antiga. Eu trataria esse valor como um parâmetro da solução e validaria se ele continua adequado com os dados reais.

</details>

### 19. E se a base de colaboradores estiver errada?

<details><summary>Ver resposta preparada</summary>

Nenhuma automação deveria assumir que uma fonte é perfeita. Por isso o dry run, critérios mínimos e tratamento de exceções são importantes. Eu também monitoraria divergências e manteria rastreabilidade da origem de cada informação utilizada na decisão.

</details>

### 20. Por que não manter o agente se a IA estava funcionando?

<details><summary>Ver resposta preparada</summary>

Porque tecnologia não deveria ser o objetivo. O objetivo era resolver o problema da forma mais simples, confiável e sustentável. Depois que encontrei dados estruturados suficientes, a IA deixou de trazer uma vantagem proporcional à complexidade e ao custo.

</details>

## Aprofundamento: perguntas novas

Perguntas autorais para aprofundar. Quando não souber um fato, diga que não sabe e como o confirmaria.

### A1. O que exatamente os 39 representam?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Pendentes de análise humana, chamados abertos ainda não processados ou repositórios sem evidência suficiente? Passar de cerca de 400 para cerca de 39 não prova, sozinho, 361 transferências concluídas. Diga o que a contagem mede.

</details>

### A2. Quantos chamados foram abertos, aceitos e recusados? Houve alguma transferência errada?

<details><summary>Ver resposta: o que precisa aparecer</summary>

A melhor evidência de qualidade é a taxa de acerto confirmada, incluindo os falsos positivos. Se não houve medição, diga isso e aponte a resposta 8 como o que faria.

</details>

### A3. Quem validou o dry run?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Diga o papel de quem revisou, como tech lead ou dono do CMDB, e o que foi conferido. Um dry run que só você olhou é mais fraco do que um revisado pelas squads afetadas.

</details>

### A4. Você foi designada para isso ou assumiu por conta própria?

<details><summary>Ver resposta: o que precisa aparecer</summary>

A resposta define se a história também serve para Ownership. Seja precisa sobre quem pediu e o que foi além do pedido.

</details>

### A5. A proposta de corrigir na origem foi levada a alguém?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Think Big exige separar o que foi implantado do que é visão. Diga com quem discutiu, em que estágio está e o que falta. Se ficou só na ideia, apresente como ideia.

</details>

### A6. Alguém discordou da troca do agente de IA por regras?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Se houve discordância real, esta pode ser a história de Have Backbone que falta: quais argumentos você trouxe, o que foi decidido e como você se comprometeu. Se não houve, não crie uma.

</details>

</section>

<section data-story-locale="en-US" lang="en-US">

**Loop preparation:** Dive Deep as the primary mapping and Learn and Be Curious as an alternative. The personal initiative also supports Ownership. Think Big requires separating a proposed improvement from expansion actually delivered.

[Loop focus](../loop-focus.md) · [Dive Deep](../12-dive-deep.md) · [Learn and Be Curious](../05-learn-and-be-curious.md)

> Original account by Vitória, supplied by the owner. Study translation; execution and metrics have not been audited on this page.

> **Pending clarification:** reconcile confirmed results and tracking. The STAR version claims 12% → 90% reflected in CMDB; answer 7 qualifies the figures and avoids claiming 90% definitively completed. Both supplied versions are retained. Do not present 90% as final until population, period and the update cycle are confirmed.

## STAR

**Situation.** At Itaú, there was a repository-ownership governance problem in **CMDB**, our centralized record of IT components and owners. A newly created repository was initially assigned to the AWS account’s umbrella squad, and correcting it required a manual ticket. Approximately **400 repositories were assigned to the same squad**, although they belonged to different teams. A new policy could block changes by squads reaching an incident-percentage threshold. Umbrella squads could therefore receive incident indicators from applications owned by other teams. Each squad was instructed to submit its own correction tickets.

**Task.** I saw an opportunity to automate the manual process. On my own initiative, I proposed investigating a solution to identify the responsible teams and automate corrections. I presented it to my manager, who had initially instructed manual corrections and gave me room to explore. I took responsibility for an efficient but safe solution, because a wrong assignment could affect another squad.

**Action.** I started with an AI-agent proof of concept in **StackSpot**: it received repositories, queried **GitHub**, identified squads from tags and opened **ServiceNow** tickets. Tests revealed missing or inconsistent tags. I investigated other sources and found structured **Mesh** datasets correlating repositories, commits and employees. I redesigned the solution as evidence-based **Python** automation. I used a **10-month** window, at least **three commits**, and **60% squad dominance** before recommending a transfer. I added a **dry run** before tickets and left inconclusive cases for human review. The agent was replaced with simpler, more predictable and auditable deterministic rules.

**Result.** With the automation I developed, I increased correct ownership from **12% to 90%, a 78-percentage-point improvement**, with changes reflected in CMDB. I also reported reducing approximately **400 repositories** assigned to the umbrella squad to about **39 pending in tracking**. This contributed to more reliable responsibility and operational indicators and reduced AI-related complexity and operating costs. **Confirmation of these figures must be reconciled with answer 7 below**, which describes tracking and changes still subject to the CMDB update cycle.

**Learning.** The most sophisticated solution is not always the best one. AI helped validate the idea quickly, but structured data and objective criteria made a deterministic solution simpler, cheaper and easier to audit. Safe automation does not mean automating 100%: without enough evidence, I prefer human review over an incorrect decision. My goal was not to automate every case, but to safely automate what we could demonstrate with data.

## Prepared questions

Answer aloud before opening.

### 1. Why did you remove AI?

<details><summary>View prepared answer</summary>

AI was useful to validate the idea quickly. But during the proof of concept, I realized that the problem could be solved using structured data and objective rules. Keeping the agent would add token consumption, GitHub calls and less predictability, so I simplified the architecture and moved to a deterministic solution that was cheaper and easier to audit.

</details>

### 2. Why not automate 100%?

<details><summary>View prepared answer</summary>

My goal wasn't to automate at any cost. It was to safely automate the cases we could prove with data. When there was a tie, missing information or insufficient evidence, I preferred to send the case for human review.

</details>

### 3. Why 60% of commits and a minimum of three?

<details><summary>View prepared answer</summary>

I needed a safeguard to avoid transferring a repository because someone made only an occasional contribution. That's why I combined a minimum number of commits with squad dominance. These values were initial decision criteria and were validated through the dry run. If we expanded the solution, I would continue reviewing the thresholds based on real results.

</details>

### 4. Do commits really prove ownership?

<details><summary>View prepared answer</summary>

Not by themselves. That's why I didn't rely only on commits. I correlated multiple sources: the umbrella squad, associated repositories, commit authors, their squads and repository information. Commits were an important signal, but the decision came from combining the data.

</details>

### 5. Why a dry run?

<details><summary>View prepared answer</summary>

Because the automation could result in a real ownership change in CMDB. Before taking any action, I wanted to see exactly what would happen and why. The dry run was also important for tuning the rules without operational risk.

</details>

### 6. How did you make the decision auditable?

<details><summary>View prepared answer</summary>

For each decision, I could show the evidence behind it: who committed, how many commits there were, which squad had the highest dominance and which source provided the employee information. So the automation didn't only provide an answer; it could explain the decision.

</details>

### 7. What was the result?

<details><summary>View prepared answer</summary>

We started with around 400 repositories associated with the umbrella squad and reduced the tracked pending set to around 39. In one dry run, we automatically analyzed 120 repositories and classified them into correction cases, already-correct cases, archive candidates and exceptions requiring human review.

</details>

Do not present “90% definitively resolved” as confirmed until the STAR claim is reconciled with changes that were still awaiting the CMDB update cycle.

### 8. How would you measure the automation's quality?

<details><summary>View prepared answer</summary>

I would track how many cases were automatically classified, how many required human review, how many recommendations were confirmed as correct and how many ticket operations failed. I would also monitor false positives because, in this scenario, assigning a repository to the wrong squad is more dangerous than leaving a case for manual review.

</details>

### 9. Why the squad code instead of the name?

<details><summary>View prepared answer</summary>

Because names can vary between systems due to abbreviations, accents or small naming differences. The squad code is a more stable identifier and reduces matching errors.

</details>

### 10. Why Lambda with EventBridge in the future?

<details><summary>View prepared answer</summary>

Once the logic became deterministic, it could run periodically without human intervention. Lambda could execute the processing, and EventBridge could trigger it on a schedule, for example once a week.

</details>

### 11. Why a technical user?

<details><summary>View prepared answer</summary>

Because the automation shouldn't depend on my session or any employee's personal account. A technical integration identity decouples the solution from a specific person and allows us to control the permissions required for the integration.

</details>

If asked to go deeper, explain least privilege.

### 12. How would you protect that credential?

<details><summary>View prepared answer</summary>

I wouldn't store credentials in the code. I would use a secure secrets-management mechanism, restrict access to the application's execution identity and apply least privilege.

</details>

### 13. What if ServiceNow becomes unavailable?

<details><summary>View prepared answer</summary>

I would separate the decision from the execution. The analysis could still run, while ticket creation would use controlled retries and proper tracking. If the integration kept failing, I would preserve the item for later reprocessing instead of losing the operation.

</details>

### 14. How do you avoid duplicate tickets?

<details><summary>View prepared answer</summary>

I would make the operation idempotent by using a unique identifier for the correction and checking whether a ticket already exists before creating another one.

</details>

### 15. Why not fix it at the source?

<details><summary>View prepared answer</summary>

That's actually the next stage I consider ideal. The current solution fixes the existing backlog, but the evolution would be to identify the correct squad when the repository is created. That way, instead of only cleaning up the backlog, we prevent new incorrect assignments from being created.

</details>

### 16. What would you do differently today?

<details><summary>View prepared answer</summary>

I would keep the dry-run approach and conservative decision rules, but from the beginning I would define metrics to measure automation accuracy, especially false positives and cases requiring human review. I would also address the technical integration identity earlier to remove the dependency on human authentication.

</details>

### 17. You're inferring ownership from commits. What if the team that owns the system barely commits to it?

<details><summary>View prepared answer</summary>

That's a good example of why I wouldn't rely blindly on a single signal. If the evidence didn't meet the defined criteria, I wouldn't automatically transfer ownership. In a future version, I could also include additional ownership signals to increase confidence.

</details>

### 18. Why ten months instead of three, six or twelve?

<details><summary>View prepared answer</summary>

It was chosen to provide enough historical activity without relying too heavily on very old data. I would treat that window as a configurable parameter and validate whether it remains appropriate based on real results.

</details>

### 19. What if the Mesh data is wrong?

<details><summary>View prepared answer</summary>

No automation should assume that a data source is perfect. That's why dry runs, minimum-confidence rules and exception handling are important. I would also monitor discrepancies and keep traceability of the source used for every decision.

</details>

### 20. Why not keep the AI agent if it was working?

<details><summary>View prepared answer</summary>

Because technology wasn't the goal. The goal was to solve the problem in the simplest, most reliable and sustainable way. Once I found enough structured data, AI no longer provided enough additional value to justify its complexity and cost.

</details>

## Additional follow-up questions

Authorial follow-ups for deeper discussion. If a fact is unknown, say so and explain how you would verify it.

### A1. What exactly do the 39 represent?

<details><summary>View answer: what to include</summary>

Were the 39 awaiting human review, tickets not yet processed, or repositories with insufficient evidence? Going from around 400 to around 39 does not by itself prove 361 completed transfers. Define what the count measures.

</details>

### A2. How many tickets were opened, accepted and rejected? Was any repository transferred to the wrong squad?

<details><summary>View answer: what to include</summary>

Confirmed recommendation accuracy, including false positives, is useful quality evidence. If it was not measured, acknowledge that and refer to answer 8 as the proposed approach.

</details>

### A3. Who validated the dry run?

<details><summary>View answer: what to include</summary>

Identify the reviewer’s role, such as a tech lead or CMDB owner, and what was checked. Explain the extent of review by affected squads rather than treating a dry run alone as proof of correctness.

</details>

### A4. Were you assigned this, or did you take it on yourself?

<details><summary>View answer: what to include</summary>

Be precise about the original instruction and what you took on beyond it. The supplied version describes a manual-correction instruction, your automation proposal and your manager giving room to explore.

</details>

### A5. Did you take the fix-at-the-source proposal to anyone?

<details><summary>View answer: what to include</summary>

Think Big requires separating implementation from vision. State who discussed the fix-at-creation proposal, its current stage and remaining work. If it remained an idea, present it as an idea.

</details>

### A6. Did anyone disagree with replacing the AI agent with rules?

<details><summary>View answer: what to include</summary>

If an actual disagreement occurred, describe the arguments, decision and subsequent commitment. If nobody disagreed, do not invent resistance to make this a Have Backbone story.

</details>

</section>

</div>
