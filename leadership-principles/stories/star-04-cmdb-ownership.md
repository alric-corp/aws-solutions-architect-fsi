# STAR-04 — Ownership de repositórios no CMDB

**No loop:** Dive Deep ★ como principal e Learn and Be Curious ★ como alternativa. Também serve de pista para Think Big ★, se a ideia de corrigir na origem tiver avançado, e para Have Backbone ★, se alguém tiver discordado da troca da IA por regras. Na tabela original o principal era Insist on the Highest Standards, que não está entre os focos.

[Foco do loop](../loop-focus.md) · [Dive Deep](../12-dive-deep.md) · [Learn and Be Curious](../05-learn-and-be-curious.md)

> Versão anonimizada: empresa e sistemas internos aparecem pela função. Os números são os do relato original.

## STAR

**Situação.** No banco, havia um problema de ownership de repositórios no CMDB, a base centralizada que guarda os componentes de TI e quem é responsável por eles. Quando um repositório é criado, ele fica associado à squad guarda-chuva da conta AWS até alguém abrir um chamado manual para o time correto. Com o tempo, isso gerou um passivo de aproximadamente 400 repositórios associados à mesma squad. Além de distorcer os indicadores de ownership, incidentes e alertas podiam ser direcionados ao grupo errado.

**Tarefa.** Identificar o ownership real desses repositórios e automatizar a correção com segurança, reduzindo o esforço manual sem correr o risco de transferir um ativo para a squad errada.

**Ação.** Minha primeira abordagem foi uma POC com um agente em uma plataforma interna de agentes de IA, que recebia a lista de repositórios, consultava o GitHub, analisava as tags de squad e abria os chamados no ServiceNow. A solução funcionou, mas nos testes identifiquei que muitos repositórios não tinham tags ou tinham informações inconsistentes. Então redesenhei a solução usando bases estruturadas, incluindo uma base corporativa com dados de colaboradores, que mostravam quem realmente trabalhava em cada repositório. Criei um script em Python que cruzava dados do CMDB, commits e informações dos colaboradores para identificar a squad responsável. Para evitar decisões com pouca evidência, usei uma janela de 10 meses, com pelo menos 3 commits e 60% de dominância da squad antes de recomendar a transferência. Implementei um dry run para validar cada decisão antes de abrir qualquer chamado. Nos casos inconclusivos, como empate entre squads ou ausência de dados, a aplicação não fazia a alteração automaticamente.

**Resultado.** Partimos de aproximadamente 400 repositórios associados à squad guarda-chuva e chegamos a um conjunto pendente próximo de 39 no acompanhamento. Também simplifiquei a arquitetura ao remover um uso de IA que já não era necessário, reduzindo consumo de tokens e chamadas externas e tornando o processo mais previsível.

**Aprendizado.** A solução mais sofisticada nem sempre é a melhor. A IA foi importante para validar rapidamente a ideia, mas, com dados estruturados e critérios objetivos, uma abordagem determinística ficou mais simples, mais barata e mais fácil de auditar. Também aprendi que automação segura não significa automatizar 100% dos casos: sem evidência suficiente, é melhor direcionar o caso para análise humana.

A frase para guardar: *My goal wasn't to automate 100% of the cases. It was to automate safely the cases we could prove with data.*

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Por que você retirou a IA?

EN: *Why did you remove AI?*

<details><summary>Ver resposta preparada</summary>

**PT:** A IA foi útil para validar rapidamente a ideia. Mas, durante a POC, percebi que o problema poderia ser resolvido com dados estruturados e regras objetivas. Nesse cenário, manter o agente adicionava consumo de tokens, chamadas ao GitHub e menos previsibilidade. Então simplifiquei a arquitetura e passei para uma solução determinística, mais barata e mais fácil de auditar.

**EN:** AI was useful to validate the idea quickly. But during the proof of concept, I realized that the problem could be solved using structured data and objective rules. Keeping the agent would add token consumption, GitHub calls and less predictability, so I simplified the architecture and moved to a deterministic solution that was cheaper and easier to audit.

</details>

### 2. Por que não automatizar 100%?

EN: *Why not automate 100%?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque meu objetivo não era automatizar a qualquer custo. Era automatizar com segurança aquilo que eu conseguia comprovar com dados. Quando havia empate, falta de informação ou pouca evidência, eu preferia direcionar o caso para análise humana.

**EN:** My goal wasn't to automate at any cost. It was to safely automate the cases we could prove with data. When there was a tie, missing information or insufficient evidence, I preferred to send the case for human review.

</details>

### 3. Por que 60% de commits e mínimo de três?

EN: *Why 60% of commits and a minimum of three?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu precisava criar uma barreira para evitar transferir um repositório porque alguém fez uma contribuição pontual. Por isso combinei um mínimo de commits com uma dominância da squad. Esses valores funcionaram como critérios iniciais da solução e foram validados através do dry run. Se a solução fosse expandida, eu continuaria revisando esses thresholds com base nos resultados reais.

**EN:** I needed a safeguard to avoid transferring a repository because someone made only an occasional contribution. That's why I combined a minimum number of commits with squad dominance. These values were initial decision criteria and were validated through the dry run. If we expanded the solution, I would continue reviewing the thresholds based on real results.

</details>

### 4. Commits realmente provam ownership?

EN: *Do commits really prove ownership?*

<details><summary>Ver resposta preparada</summary>

**PT:** Não isoladamente. Por isso eu não utilizava somente commits. Eu cruzava diferentes fontes: squad guarda-chuva, repositórios associados, autores dos commits, squad desses colaboradores e informações do próprio repositório. Os commits eram uma evidência importante, mas a decisão vinha da combinação dos dados.

**EN:** Not by themselves. That's why I didn't rely only on commits. I correlated multiple sources: the umbrella squad, associated repositories, commit authors, their squads and repository information. Commits were an important signal, but the decision came from combining the data.

</details>

### 5. Por que dry run?

EN: *Why a dry run?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque a automação poderia gerar uma mudança real de ownership no CMDB. Antes de executar qualquer ação, eu queria conseguir visualizar exatamente o que seria feito e por quê. O dry run também foi fundamental para ajustar as regras sem risco operacional.

**EN:** Because the automation could result in a real ownership change in CMDB. Before taking any action, I wanted to see exactly what would happen and why. The dry run was also important for tuning the rules without operational risk.

</details>

### 6. Como você tornava a decisão auditável?

EN: *How did you make the decision auditable?*

<details><summary>Ver resposta preparada</summary>

**PT:** Para cada decisão eu conseguia mostrar os dados que levaram à conclusão: quais pessoas fizeram commits, quantos commits existiam, qual squad tinha maior dominância e de qual base veio a informação do colaborador. Então a automação não entregava apenas a resposta; ela conseguia explicar a decisão.

**EN:** For each decision, I could show the evidence behind it: who committed, how many commits there were, which squad had the highest dominance and which source provided the employee information. So the automation didn't only provide an answer; it could explain the decision.

</details>

### 7. Qual foi o resultado?

EN: *What was the result?*

<details><summary>Ver resposta preparada</summary>

**PT:** Partimos de aproximadamente 400 repositórios associados à squad guarda-chuva e chegamos a um conjunto pendente próximo de 39 no acompanhamento, reduzindo significativamente o passivo. Em um dos dry runs, analisamos 120 repositórios automaticamente, separando casos para correção, casos já corretos, candidatos a arquivamento e exceções que exigiam análise humana.

**EN:** We started with around 400 repositories associated with the umbrella squad and reduced the tracked pending set to around 39. In one dry run, we automatically analyzed 120 repositories and classified them into correction cases, already-correct cases, archive candidates and exceptions requiring human review.

</details>

Evite dizer “90% resolvido definitivamente”: algumas alterações ainda dependiam do ciclo de atualização do CMDB.

### 8. Como você mediria a qualidade da automação?

EN: *How would you measure the automation's quality?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu acompanharia quantos casos foram classificados automaticamente, quantos precisaram de análise humana, quantas recomendações foram confirmadas como corretas e quantos chamados falharam. Também acompanharia falsos positivos, porque nesse cenário uma transferência errada é mais perigosa do que deixar um caso para análise manual.

**EN:** I would track how many cases were automatically classified, how many required human review, how many recommendations were confirmed as correct and how many ticket operations failed. I would also monitor false positives because, in this scenario, assigning a repository to the wrong squad is more dangerous than leaving a case for manual review.

</details>

### 9. Por que código da squad em vez do nome?

EN: *Why the squad code instead of the name?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque nomes podem variar entre sistemas por abreviação, acento ou pequenas diferenças de escrita. O código é um identificador mais estável e reduz erros de comparação.

**EN:** Because names can vary between systems due to abbreviations, accents or small naming differences. The squad code is a more stable identifier and reduces matching errors.

</details>

### 10. Por que Lambda com EventBridge no futuro?

EN: *Why Lambda with EventBridge in the future?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque depois que a lógica passou a ser determinística, ela poderia ser executada de forma periódica sem intervenção humana. A Lambda executaria o processamento e o EventBridge poderia dispará-la em uma frequência definida, por exemplo semanalmente.

**EN:** Once the logic became deterministic, it could run periodically without human intervention. Lambda could execute the processing, and EventBridge could trigger it on a schedule, for example once a week.

</details>

### 11. Por que usuário técnico?

EN: *Why a technical user?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque a automação não deveria depender da minha sessão ou da conta pessoal de qualquer funcionário. Um usuário técnico permite desacoplar a solução de uma pessoa específica e controlar as permissões necessárias para a integração.

**EN:** Because the automation shouldn't depend on my session or any employee's personal account. A technical integration identity decouples the solution from a specific person and allows us to control the permissions required for the integration.

</details>

Se aprofundarem, puxe o princípio de menor privilégio.

### 12. Como protegeria essa credencial?

EN: *How would you protect that credential?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu evitaria colocar qualquer credencial no código. Utilizaria um mecanismo seguro de armazenamento de secrets, com acesso restrito à identidade de execução da aplicação e princípio de menor privilégio.

**EN:** I wouldn't store credentials in the code. I would use a secure secrets-management mechanism, restrict access to the application's execution identity and apply least privilege.

</details>

### 13. E se o ServiceNow ficar indisponível?

EN: *What if ServiceNow becomes unavailable?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu separaria a decisão da execução. A análise poderia continuar sendo feita, mas a abertura do chamado precisaria ter retry controlado e rastreabilidade. Se a integração continuasse falhando, eu preservaria o item para reprocessamento em vez de perder a operação.

**EN:** I would separate the decision from the execution. The analysis could still run, while ticket creation would use controlled retries and proper tracking. If the integration kept failing, I would preserve the item for later reprocessing instead of losing the operation.

</details>

### 14. Como evitar chamado duplicado?

EN: *How do you avoid duplicate tickets?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu tornaria a operação idempotente, mantendo um identificador único para aquela correção e verificando se já existe um chamado aberto ou concluído antes de criar outro.

**EN:** I would make the operation idempotent by using a unique identifier for the correction and checking whether a ticket already exists before creating another one.

</details>

### 15. Por que não corrigir diretamente na origem?

EN: *Why not fix it at the source?*

<details><summary>Ver resposta preparada</summary>

**PT:** Esse é justamente o próximo estágio que eu considero ideal. A solução atual corrige um passivo existente, mas a evolução seria identificar a squad correta no momento da criação do repositório. Assim, além de limpar o passivo, evitaríamos criar um novo.

**EN:** That's actually the next stage I consider ideal. The current solution fixes the existing backlog, but the evolution would be to identify the correct squad when the repository is created. That way, instead of only cleaning up the backlog, we prevent new incorrect assignments from being created.

</details>

### 16. O que você faria diferente hoje?

EN: *What would you do differently today?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu manteria a ideia do dry run e das decisões conservadoras, mas desde o início estruturaria métricas de precisão da automação, principalmente falsos positivos e casos enviados para análise humana. Também trabalharia mais cedo na integração com usuário técnico para remover a dependência da autenticação humana.

**EN:** I would keep the dry-run approach and conservative decision rules, but from the beginning I would define metrics to measure automation accuracy, especially false positives and cases requiring human review. I would also address the technical integration identity earlier to remove the dependency on human authentication.

</details>

### 17. E se a squad que mantém o sistema quase não faz commits?

EN: *You're inferring ownership from commits. What if the team that owns the system barely commits to it?*

<details><summary>Ver resposta preparada</summary>

**PT:** Esse é um exemplo de caso em que eu não gostaria de confiar cegamente em uma única métrica. Se a evidência não atingisse os critérios definidos, eu não faria a transferência automática. Em uma evolução, eu também poderia adicionar outras fontes de ownership para aumentar a confiança da decisão.

**EN:** That's a good example of why I wouldn't rely blindly on a single signal. If the evidence didn't meet the defined criteria, I wouldn't automatically transfer ownership. In a future version, I could also include additional ownership signals to increase confidence.

</details>

### 18. Por que 10 meses e não 3, 6 ou 12?

EN: *Why ten months instead of three, six or twelve?*

<details><summary>Ver resposta preparada</summary>

**PT:** Foi uma janela escolhida para ter histórico suficiente sem considerar atividade muito antiga. Eu trataria esse valor como um parâmetro da solução e validaria se ele continua adequado com os dados reais.

**EN:** It was chosen to provide enough historical activity without relying too heavily on very old data. I would treat that window as a configurable parameter and validate whether it remains appropriate based on real results.

</details>

### 19. E se a base de colaboradores estiver errada?

EN: *What if the employee data source is wrong?*

<details><summary>Ver resposta preparada</summary>

**PT:** Nenhuma automação deveria assumir que uma fonte é perfeita. Por isso o dry run, critérios mínimos e tratamento de exceções são importantes. Eu também monitoraria divergências e manteria rastreabilidade da origem de cada informação utilizada na decisão.

**EN:** No automation should assume that a data source is perfect. That's why dry runs, minimum-confidence rules and exception handling are important. I would also monitor discrepancies and keep traceability of the source used for every decision.

</details>

### 20. Por que não manter o agente se a IA estava funcionando?

EN: *Why not keep the AI agent if it was working?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque tecnologia não deveria ser o objetivo. O objetivo era resolver o problema da forma mais simples, confiável e sustentável. Depois que encontrei dados estruturados suficientes, a IA deixou de trazer uma vantagem proporcional à complexidade e ao custo.

**EN:** Because technology wasn't the goal. The goal was to solve the problem in the simplest, most reliable and sustainable way. Once I found enough structured data, AI no longer provided enough additional value to justify its complexity and cost.

</details>

## Aprofundamento: perguntas novas

São os pontos que um entrevistador vai apertar. Quando não souber um fato, diga que não sabe e como confirmaria.

### A1. O que exatamente os 39 representam?

EN: *What exactly do the 39 represent?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Pendentes de análise humana, chamados abertos ainda não processados ou repositórios sem evidência suficiente? Passar de cerca de 400 para cerca de 39 não prova, sozinho, 361 transferências concluídas. Diga o que a contagem mede.

</details>

### A2. Quantos chamados foram abertos, aceitos e recusados? Houve alguma transferência errada?

EN: *How many tickets were opened, accepted and rejected? Was any repository transferred to the wrong squad?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

A melhor evidência de qualidade é a taxa de acerto confirmada, incluindo os falsos positivos. Se não houve medição, diga isso e aponte a resposta 8 como o que faria.

</details>

### A3. Quem validou o dry run?

EN: *Who validated the dry run?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Diga o papel de quem revisou, como tech lead ou dono do CMDB, e o que foi conferido. Um dry run que só você olhou é mais fraco do que um revisado pelas squads afetadas.

</details>

### A4. Você foi designada para isso ou assumiu por conta própria?

EN: *Were you assigned this, or did you take it on yourself?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

A resposta define se a história também serve para Ownership. Seja precisa sobre quem pediu e o que foi além do pedido.

</details>

### A5. A proposta de corrigir na origem foi levada a alguém?

EN: *Did you take the fix-at-the-source proposal to anyone?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Think Big exige separar o que foi implantado do que é visão. Diga com quem discutiu, em que estágio está e o que falta. Se ficou só na ideia, apresente como ideia.

</details>

### A6. Alguém discordou da troca do agente de IA por regras?

EN: *Did anyone disagree with replacing the AI agent with rules?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Se houve discordância real, esta pode ser a história de Have Backbone que falta: quais argumentos você trouxe, o que foi decidido e como você se comprometeu. Se não houve, não crie uma.

</details>
