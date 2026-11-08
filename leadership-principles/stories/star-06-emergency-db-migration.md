# STAR-06 — Migração emergencial de banco de dados

<div data-story-locales data-story-title-pt="STAR-06 — Migração emergencial de banco de dados" data-story-title-en="STAR-06 — Emergency database migration">

<section data-story-locale="pt-BR" lang="pt-BR">

> Relato autoral de Vitória, fornecido pelo proprietário. Tradução de estudo; execução e métricas não auditadas nesta página.

**Preparação:** Deliver Results e Bias for Action são associações de estudo, não atribuições oficiais de entrevistadores.

[Foco do loop](../loop-focus.md) · [Bias for Action](../09-bias-for-action.md) · [Deliver Results](../14-deliver-results.md)

> **Pendência entre relatos.** Se esta for a mesma migração da apresentação, os detalhes ainda precisam ser conciliados: a apresentação descreve DMS e troca final por colegas; este relato descreve snapshot e troca pela própria Vitória. Não escolha a versão verdadeira sem confirmar o que aconteceu. Veja A8. As respostas preparadas abaixo são o relato recebido, não uma auditoria da execução.

## STAR

**Situação.** No Itaú, fui temporariamente alocada em uma squad que enfrentava um problema crítico em produção havia mais de **12 semanas**. O time não conseguia publicar novos produtos para os clientes porque o banco de dados relacional tinha atingido o limite de memória. A princípio, a correção parecia simples: aumentar o tipo da instância. Mas a infraestrutura estava muito depreciada e a esteira de Terraform já não conseguia aplicar essa alteração.

**Tarefa.** Como o uso de acesso emergencial, referido como Breaking Glass no relato, não foi aprovado para esse cenário, eu precisava encontrar outra solução rapidamente: procurar uma forma segura de recuperar a capacidade da aplicação e voltar a permitir a publicação de produtos na base.

**Ação.** Primeiro, como seria necessário criar uma nova base, avaliei as opções de migração. Considerei o **AWS DMS**, mas, como conseguia trabalhar com um ponto consistente da base e não precisava manter origem e destino sincronizados durante a migração, optei por uma estratégia mais simples usando **snapshot**.

Criei uma nova instância de banco já com a infraestrutura atualizada, restaurei os dados a partir do snapshot e validei o conteúdo da nova base. Depois, em uma janela de baixa utilização, alterei a aplicação para apontar para o novo endpoint do banco. A indisponibilidade foi de poucos segundos e não houve impacto perceptível para os clientes.

Mantivemos o banco antigo disponível por um período curto como rollback e, após validar a estabilidade da nova base, removemos o recurso antigo.

**Resultado.** Recuperamos um problema que estava bloqueando o time havia mais de **12 semanas** e voltamos a permitir a publicação de novos produtos para os clientes. A migração teve uma pequena janela técnica de indisponibilidade, sem impacto perceptível para os usuários, e mantivemos uma estratégia de rollback durante a transição.

Além disso, entreguei uma solução mais simples e segura, sem adicionar a complexidade de uma migração com DMS e sincronização contínua que, segundo este relato, não era necessária para aquele cenário.

**Aprendizado.** Em situações críticas, nem sempre o melhor caminho é insistir na solução ideal se ela está bloqueada por outras dependências. Aprendi também a avaliar o nível de complexidade realmente necessário: considerei DMS, mas o snapshot atendia ao requisito com menos complexidade e risco operacional.

> **Alcance a confirmar.** O relato não detalha todos os escritores, o método completo de validação, o tratamento de dados novos no rollback nem o tempo exato de observação da origem. Ausência de escrita contínua não equivale, sozinha, a prova de ausência de alterações. Não apresente comparação integral, perda zero ou reversão após novas escritas como verificadas sem recuperar essas evidências.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Qual era o problema em produção?

<details><summary>Ver resposta preparada</summary>

O banco de dados relacional tinha atingido o limite de memória, e isso estava impedindo o time de publicar novos produtos para os clientes havia mais de 12 semanas.

</details>

### 2. Por que vocês não simplesmente aumentaram o tamanho da instância?

<details><summary>Ver resposta preparada</summary>

Essa seria a correção mais simples, mas a infraestrutura estava muito depreciada e a esteira de Terraform já não conseguia aplicar essa alteração com segurança.

</details>

### 3. Qual foi sua responsabilidade nesse caso?

<details><summary>Ver resposta preparada</summary>

Minha responsabilidade foi encontrar uma alternativa segura para recuperar a aplicação sem depender da correção imediata de toda a esteira de infraestrutura.

</details>

### 4. Qual solução você escolheu?

<details><summary>Ver resposta preparada</summary>

Eu criei uma nova instância de banco com infraestrutura atualizada, restaurei os dados a partir de um snapshot e depois alterei a aplicação para apontar para o novo endpoint.

</details>

### 5. Por que você considerou DMS?

<details><summary>Ver resposta preparada</summary>

Porque DMS seria uma opção caso eu precisasse manter origem e destino sincronizados durante a migração ou reduzir ao máximo a indisponibilidade em um banco com mudanças contínuas.

</details>

### 6. Por que você não usou DMS?

<details><summary>Ver resposta preparada</summary>

Nesse cenário, eu conseguia trabalhar com um ponto consistente da base e não precisava manter origem e destino sincronizados. Então o snapshot atendia ao requisito com menos complexidade e mais agilidade.

</details>

### 7. Quando você escolheria DMS em vez de snapshot?

<details><summary>Ver resposta preparada</summary>

Eu escolheria DMS quando houvesse muitas alterações durante a migração, necessidade de replicação contínua, downtime muito restrito ou migração entre ambientes ou engines que exigissem esse tipo de sincronização.

</details>

### 8. Qual foi o principal trade-off entre DMS e snapshot?

<details><summary>Ver resposta preparada</summary>

DMS daria mais flexibilidade e sincronização, mas aumentaria a complexidade da migração. O snapshot era mais simples, mas exigia uma pequena janela de indisponibilidade.

</details>

### 9. Houve indisponibilidade?

<details><summary>Ver resposta preparada</summary>

Sim, houve uma janela muito curta, de poucos segundos, durante a troca para o novo banco.

</details>

### 10. Como você reduziu o impacto dessa indisponibilidade?

<details><summary>Ver resposta preparada</summary>

Realizamos a mudança de madrugada, em um período de baixa utilização, e deixamos todas as etapas preparadas antes do cutover.

</details>

### 11. Como a aplicação passou a usar o novo banco?

<details><summary>Ver resposta preparada</summary>

Depois de restaurar e validar a nova base, atualizamos a configuração da aplicação para apontar para o novo endpoint do banco e então subimos a aplicação com essa configuração.

</details>

### 12. Como você planejou o rollback?

<details><summary>Ver resposta preparada</summary>

Mantivemos o banco antigo disponível durante a transição. Se houvesse algum problema no novo ambiente, poderíamos reverter a aplicação para o endpoint anterior.

</details>

> **Limite a confirmar:** manter a origem e voltar ao endpoint anterior, por si só, não resolve as escritas feitas apenas no destino. Confirme como o procedimento trataria dados novos antes de apresentar esse retorno como suficiente.

### 13. Por quanto tempo o banco antigo ficou disponível?

<details><summary>Ver resposta preparada</summary>

Ele ficou disponível por um período curto, apenas até termos confiança de que a nova base estava estável. Depois disso, removemos o recurso antigo.

</details>

### 14. Como você validou que os dados estavam corretos no novo banco?

<details><summary>Ver resposta preparada</summary>

Depois do restore, validei os dados diretamente na nova instância e comparei se as informações esperadas estavam presentes antes de alterar a aplicação.

</details>

Esta resposta ainda não diz o método. Veja A7.

### 15. Como você soube que a migração tinha funcionado?

<details><summary>Ver resposta preparada</summary>

Validamos a integridade dos dados, subimos a aplicação apontando para a nova base e confirmamos que o fluxo voltou a permitir a publicação de novos produtos.

</details>

### 16. Que métricas você acompanharia durante uma migração dessas?

<details><summary>Ver resposta preparada</summary>

Eu acompanharia conexões, uso de CPU e memória, latência do banco, erros da aplicação, quantidade de requisições e comportamento do fluxo de negócio depois do cutover.

</details>

### 17. E se os dados mudassem durante a criação do snapshot?

<details><summary>Ver resposta preparada</summary>

Se houvesse uma taxa alta de mudanças e eu não pudesse aceitar diferença entre origem e destino, o snapshot sozinho talvez não fosse suficiente. Nesse caso, eu consideraria uma estratégia com replicação, como DMS, para manter as bases sincronizadas até o cutover.

</details>

### 18. Como você determinou que alguns segundos de downtime eram aceitáveis?

<details><summary>Ver resposta preparada</summary>

Pelo perfil da aplicação e pelo fato de a mudança ser feita em um período de baixa utilização. Como não havia uma exigência de zero downtime para esse cenário, a pequena janela era um trade-off aceitável em troca de uma migração mais simples.

</details>

### 19. E se o banco fosse muito grande? Você ainda usaria snapshot?

<details><summary>Ver resposta preparada</summary>

Dependeria do tempo de restore, da janela disponível e do RTO esperado. Em uma base muito grande, eu avaliaria se o tempo de restore continuaria aceitável. Caso contrário, poderia considerar replicação contínua ou outra estratégia.

</details>

### 20. Como você pensou em RTO e RPO?

<details><summary>Ver resposta preparada</summary>

O RTO precisava ser muito baixo porque o objetivo era recuperar rapidamente o fluxo de publicação. Já o RPO era compatível com a estratégia de snapshot porque os dados não estavam mudando de forma contínua naquele momento.

</details>

Revise esta resposta com A4 antes de usar.

### 21. O que você faria se a migração falhasse depois do cutover?

<details><summary>Ver resposta preparada</summary>

Eu reverteria a aplicação para o endpoint antigo, porque mantivemos o banco anterior disponível justamente para esse cenário. Depois investigaria a causa antes de tentar novamente.

</details>

> **Limite a confirmar:** manter a origem e voltar ao endpoint anterior, por si só, não resolve as escritas feitas apenas no destino. Confirme como o procedimento trataria dados novos antes de apresentar esse retorno como suficiente.

### 22. Por que não corrigir primeiro toda a esteira de Terraform?

<details><summary>Ver resposta preparada</summary>

Porque havia um problema de negócio crítico bloqueado havia mais de 12 semanas. Corrigir toda a esteira poderia levar muito mais tempo. Então eu separei os problemas: primeiro recuperei o serviço com uma solução segura e depois a dívida de infraestrutura poderia ser tratada de forma adequada.

</details>

### 23. Isso não foi apenas contornar o problema em vez de resolver a causa raiz?

<details><summary>Ver resposta preparada</summary>

A causa operacional imediata era o banco sem capacidade suficiente, e isso foi resolvido com a nova instância. A dívida da esteira era um problema separado e mais estrutural. Eu não queria manter o negócio bloqueado enquanto toda essa dívida era corrigida.

</details>

### 24. Como você garantiria que esse problema não acontecesse novamente?

<details><summary>Ver resposta preparada</summary>

Eu acompanharia crescimento de memória e capacidade do banco com alertas antes de chegar ao limite, revisaria periodicamente o sizing da instância e manteria a esteira de infraestrutura atualizada para que mudanças de capacidade pudessem ser feitas pelo fluxo normal.

</details>

### 25. Multi-AZ ou réplica de leitura teriam resolvido?

<details><summary>Ver resposta preparada</summary>

Não necessariamente. Multi-AZ é principalmente para alta disponibilidade e failover, e uma read replica ajuda a distribuir leituras. O problema aqui era capacidade de memória da instância principal, então eu precisava corrigir o sizing do banco.

</details>

### 26. O que você faria diferente hoje?

<details><summary>Ver resposta preparada</summary>

Eu atuaria antes do incidente. Criaria alertas de capacidade para o banco, principalmente memória, e revisaria periodicamente o sizing. Também manteria os módulos de infraestrutura atualizados para evitar que uma alteração simples ficasse bloqueada pela própria esteira.

</details>

### 27. O que você aprendeu?

<details><summary>Ver resposta preparada</summary>

Aprendi que, em um cenário crítico, é importante separar o que precisa ser resolvido imediatamente do que é uma dívida estrutural. Também reforçou para mim que a melhor solução não é necessariamente a mais sofisticada, mas a que atende aos requisitos com segurança, menor complexidade e velocidade adequada.

</details>

## Aprofundamento: perguntas novas

Perguntas autorais para aprofundar o relato, sem prever o que será perguntado na entrevista. Quando não souber um fato, diga que não sabe e como confirmaria.

### A1. Se a esteira não conseguia alterar a instância, como você criou a nova?

<details><summary>Ver resposta: o que precisa aparecer</summary>

A resposta precisa explicar por que criar era possível e alterar não, por exemplo um módulo novo e atualizado para o recurso novo. Sem isso, a história parece contraditória.

</details>

### A2. Restaurar um snapshot já cria uma instância nova. Você escolheu a classe maior no restore?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Se o banco era RDS, o restore de snapshot gera uma nova instância e permite escolher a classe. Descrever o mecanismo exato mostra domínio; diga o que de fato foi feito.

</details>

### A3. Entre o snapshot e a troca, alguma escrita foi para o banco antigo?

<details><summary>Ver resposta: o que precisa aparecer</summary>

E durante o deploy? Em um rolling deploy, tasks antigas e novas convivem por um tempo, cada uma com um endpoint. Explique por que não houve divergência: escritas paradas, janela controlada ou outro motivo verdadeiro.

</details>

### A4. O problema durou 12 semanas. Por que você diz que o RTO precisava ser baixo?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Separe o tempo em que a jornada ficou bloqueada da janela aceitável de troca. Ausência de escrita contínua não comprova perda zero: confirme todos os escritores, o ponto do snapshot, as alterações até a troca e os critérios de aceite. Use RTO e RPO apenas se descreverem o requisito real de recuperação; veja também A3.

</details>

### A5. Quanto tempo você levou desde que chegou à squad até a troca?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Bias for Action precisa da velocidade em números. Doze semanas de bloqueio antes de você e quantos dias depois?

</details>

### A6. Por que o break-glass não foi aprovado, e quem decidiu?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Se você discordou dessa decisão, argumentou e seguiu o caminho aprovado, há material de Disagree and Commit. Só use se aconteceu.

</details>

### A7. Como você validou os dados?

<details><summary>Ver resposta: o que precisa aparecer</summary>

“Validei o conteúdo” é amplo. Explique as verificações realmente executadas: quais tabelas, chaves ou valores, amostras, contagens ou fluxos de negócio. Contagens iguais não demonstram equivalência integral. Não afirme checksum ou comparação completa se não ocorreram.

</details>

### A8. Quem fez cada passo: snapshot, restore, troca e rollback?

<details><summary>Ver resposta: o que precisa aparecer</summary>

Esta resposta precisa ser consistente em todas as entrevistas e na apresentação. Identifique quem preparou, executou e verificou cada etapa. Se a troca final foi feita por colegas, diga isso. As diferenças snapshot/DMS e autoria continuam pendentes até confirmação.

</details>

</section>

<section data-story-locale="en-US" lang="en-US">

> Story authored by Vitória, supplied by the owner. Study translation; execution and metrics have not been audited on this page.

**Preparation:** Deliver Results and Bias for Action are study associations, not official interviewer assignments.

[Loop focus](../loop-focus.md) · [Bias for Action](../09-bias-for-action.md) · [Deliver Results](../14-deliver-results.md)

> **Difference between accounts to resolve.** If this is the same migration used in the presentation, the details still need to be reconciled: the presentation describes DMS and a final cutover performed by colleagues; this account describes a snapshot and a cutover performed by Vitória herself. Do not select a definitive version without confirming what happened. See A8. The prepared answers below are the supplied account, not an execution audit.

## STAR

**Situation.** At Itaú, I was temporarily assigned to a squad that had been facing a critical production problem for more than **12 weeks**. The team could not publish new products to customers because the relational database had reached its memory limit. Initially, the correction seemed simple: increase the instance class. However, the infrastructure was heavily outdated and the Terraform pipeline could no longer apply that change.

**Task.** Emergency access, referred to as Breaking Glass in the account, was not approved for this scenario. I needed to find another solution quickly and safely to restore the application's capacity and allow product publication again.

**Action.** Since a new database would be needed, I evaluated migration options. I considered **AWS DMS**, but because I could work from a consistent database point and did not need to keep the source and target synchronized during the migration, I chose a simpler **snapshot** strategy.

I created a new database instance with updated infrastructure, restored the snapshot data and validated the new database's content. During a low-traffic window, I then changed the application to use the new database endpoint. Downtime lasted a few seconds, with no perceptible customer impact.

We kept the old database available for a short rollback period and removed it after checking the stability of the new database.

**Result.** We resolved a problem that had blocked the team for more than **12 weeks** and enabled new product publication again. The migration involved only a short technical downtime window, no perceptible user impact, and a rollback strategy during the transition.

I also delivered a simpler and safer solution without adding DMS and continuous-synchronization complexity that, according to this account, was not required for that scenario.

**Learning.** In a critical situation, insisting on an ideal solution is not always the best option when other dependencies block it. I also learned to assess the complexity actually needed: I considered DMS, but a snapshot met the requirement with less complexity and operational risk.

> **Scope still to confirm.** The account does not detail all writers, the complete validation method, treatment of new target writes during rollback or the exact source-observation period. A lack of continuous writing does not, by itself, prove that no changes occurred. Do not present complete equivalence, zero loss or rollback after new writes as verified without recovering the supporting evidence.

## Questions already prepared

Answer aloud before opening the prepared response.

### 1. What was the production issue?

<details><summary>View prepared answer</summary>

The relational database had reached its memory limit, and that had been preventing the team from publishing new products to customers for more than 12 weeks.

</details>

### 2. Why didn't you simply increase the instance size?

<details><summary>View prepared answer</summary>

That would have been the simplest fix, but the infrastructure was heavily outdated and the Terraform pipeline could no longer apply that change safely.

</details>

### 3. What was your responsibility in this case?

<details><summary>View prepared answer</summary>

My responsibility was to find a safe alternative to restore the application without depending on an immediate fix for the entire infrastructure pipeline.

</details>

### 4. Which solution did you choose?

<details><summary>View prepared answer</summary>

I created a new database instance with updated infrastructure, restored the data from a snapshot, and then changed the application to point to the new endpoint.

</details>

### 5. Why did you consider AWS DMS?

<details><summary>View prepared answer</summary>

Because DMS would have been useful if I needed to keep the source and target synchronized during the migration or minimize downtime for a database with continuous changes.

</details>

### 6. Why didn't you use AWS DMS?

<details><summary>View prepared answer</summary>

In this scenario, I could work with a consistent point-in-time copy of the database and I didn't need to keep source and target synchronized. So the snapshot met the requirement with less complexity and more agility.

</details>

### 7. When would you choose DMS instead of a snapshot?

<details><summary>View prepared answer</summary>

I would choose DMS when there were continuous changes during the migration, a need for ongoing replication, very limited downtime, or migrations between environments or engines that required synchronization.

</details>

### 8. What was the main trade-off between DMS and a snapshot?

<details><summary>View prepared answer</summary>

DMS would provide more flexibility and synchronization, but it would increase migration complexity. The snapshot was simpler, but it required a small downtime window.

</details>

### 9. Was there any downtime?

<details><summary>View prepared answer</summary>

Yes, there was a very short downtime window of only a few seconds during the cutover to the new database.

</details>

### 10. How did you minimize the impact of the downtime?

<details><summary>View prepared answer</summary>

We performed the change overnight during a low-traffic period and prepared all the migration steps before the cutover.

</details>

### 11. How did the application start using the new database?

<details><summary>View prepared answer</summary>

After restoring and validating the new database, we updated the application configuration to point to the new database endpoint and deployed the application with that configuration.

</details>

### 12. How did you plan for rollback?

<details><summary>View prepared answer</summary>

We kept the old database available during the transition. If there had been an issue with the new environment, we could have pointed the application back to the previous endpoint.

</details>

> **Limit to confirm:** keeping the source and returning to its endpoint does not, by itself, handle writes made only on the target. Confirm how the procedure would treat new data before describing that return as sufficient.

### 13. How long did you keep the old database available?

<details><summary>View prepared answer</summary>

We kept it available for a short period, just until we were confident that the new database was stable. After that, we removed the old resource.

</details>

### 14. How did you validate the data in the new database?

<details><summary>View prepared answer</summary>

After the restore, I validated the data directly in the new instance and checked that the expected information was present before switching the application.

</details>

This prepared answer does not yet specify the method. See A7.

### 15. How did you know the migration was successful?

<details><summary>View prepared answer</summary>

We validated the data integrity, deployed the application pointing to the new database, and confirmed that the flow was able to publish new products again.

</details>

### 16. Which metrics would you monitor during this kind of migration?

<details><summary>View prepared answer</summary>

I would monitor connections, CPU and memory usage, database latency, application errors, request volume, and the business flow behavior after the cutover.

</details>

### 17. What if the data changed while the snapshot was being created?

<details><summary>View prepared answer</summary>

If there were a high rate of changes and I couldn't accept differences between source and target, a snapshot alone might not be enough. In that case, I would consider a replication strategy such as DMS to keep the databases synchronized until cutover.

</details>

### 18. How did you determine that a few seconds of downtime were acceptable?

<details><summary>View prepared answer</summary>

Based on the application profile and the fact that we performed the change during a low-traffic period. Since zero downtime wasn't a requirement for this scenario, the short outage was an acceptable trade-off for a simpler migration.

</details>

### 19. What if the database were very large? Would you still use a snapshot?

<details><summary>View prepared answer</summary>

It would depend on the restore time, the available migration window, and the expected RTO. For a very large database, I would evaluate whether the restore time was still acceptable. Otherwise, I might consider continuous replication or another strategy.

</details>

### 20. How did you think about RTO and RPO?

<details><summary>View prepared answer</summary>

The RTO needed to be very low because the goal was to restore the publishing flow quickly. The RPO was compatible with the snapshot strategy because the data wasn't changing continuously at that point.

</details>

Review this answer alongside A4 before using it.

### 21. What would you do if the migration failed after cutover?

<details><summary>View prepared answer</summary>

I would point the application back to the old endpoint because we kept the previous database available specifically for that scenario. Then I would investigate the root cause before attempting the migration again.

</details>

> **Limit to confirm:** keeping the source and returning to its endpoint does not, by itself, handle writes made only on the target. Confirm how the procedure would treat new data before describing that return as sufficient.

### 22. Why didn't you fix the entire Terraform pipeline first?

<details><summary>View prepared answer</summary>

Because there was a critical business issue that had been blocked for more than 12 weeks. Fixing the entire pipeline could take much longer. So I separated the problems: first I restored the service safely, and then the infrastructure debt could be addressed properly.

</details>

### 23. Wasn't this just a workaround instead of fixing the root cause?

<details><summary>View prepared answer</summary>

The immediate operational root cause was that the database no longer had enough capacity, and that was resolved with the new instance. The outdated pipeline was a separate, more structural issue. I didn't want to keep the business blocked while that entire technical debt was being fixed.

</details>

### 24. How would you prevent this problem from happening again?

<details><summary>View prepared answer</summary>

I would monitor database memory and capacity growth with alerts before reaching the limit, periodically review instance sizing, and keep the infrastructure pipeline updated so capacity changes could be made through the normal process.

</details>

### 25. Would Multi-AZ or a read replica have solved this issue?

<details><summary>View prepared answer</summary>

Not necessarily. Multi-AZ is mainly for high availability and failover, and a read replica helps distribute read traffic. The issue here was the memory capacity of the primary instance, so I needed to address the database sizing.

</details>

### 26. What would you do differently today?

<details><summary>View prepared answer</summary>

Today, I would act before the incident happened. I would create capacity alerts for the database, especially memory, and periodically review the sizing. I would also keep the infrastructure modules updated so a simple change wouldn't be blocked by the deployment pipeline.

</details>

### 27. What did you learn from this experience?

<details><summary>View prepared answer</summary>

I learned that in a critical situation, it's important to separate what must be solved immediately from what is a structural technical debt. It also reinforced that the best solution isn't necessarily the most sophisticated one, but the one that meets the requirements safely, with the right level of complexity and speed.

</details>

## Further practice: new questions

These are possible lines of inquiry, not predictions of interview questions. If a fact is unknown, say so and explain how you would confirm it.

### A1. If the pipeline couldn't change the instance, how did you create the new one?

<details><summary>View answer: what to include</summary>

The answer needs to explain why creating a resource was possible while changing the existing one was blocked, for example because the new resource used an updated module. State what actually happened; otherwise the account appears contradictory.

</details>

### A2. Restoring a snapshot already creates a new instance. Did you pick the larger class during the restore?

<details><summary>View answer: what to include</summary>

If the database was RDS, restoring a snapshot creates a new instance and allows a class to be selected. Explain the actual mechanism and what was done in this case.

</details>

### A3. Between the snapshot and the cutover, did any write go to the old database?

<details><summary>View answer: what to include</summary>

What about during deployment? During a rolling deployment, old and new tasks may coexist with different endpoints. Explain the actual treatment of writes and how divergence was prevented or reconciled; do not invent a write freeze.

</details>

### A4. The problem lasted 12 weeks. Why do you say the RTO had to be low?

<details><summary>View answer: what to include</summary>

Separate the time the business flow was blocked from the acceptable cutover window. Not having continuous writes does not establish zero data loss: confirm all writers, the snapshot reference, changes before cutover and the acceptance criteria. Use RTO and RPO only when they describe the actual recovery requirement; see also A3.

</details>

### A5. How long did it take from joining the squad to the cutover?

<details><summary>View answer: what to include</summary>

Bias for Action needs the time to act in context. The blockage lasted twelve weeks before your involvement; how long did your preparation and execution actually take? Recover the real duration rather than estimating one.

</details>

### A6. Why wasn't break-glass approved, and who decided?

<details><summary>View answer: what to include</summary>

If you disagreed, explained your concerns and then supported the approved path, this may support a Disagree and Commit discussion. Use that interpretation only if it happened.

</details>

### A7. How exactly did you validate the data?

<details><summary>View answer: what to include</summary>

“I validated the content” is too broad. Explain the checks actually executed: which tables, keys or values, samples, counts or business flows. Equal row counts alone do not establish complete equivalence. Do not claim a checksum or full comparison unless it occurred.

</details>

### A8. Who did each step: snapshot, restore, cutover and rollback?

<details><summary>View answer: what to include</summary>

The account must be consistent across interviews and the presentation. Identify who prepared, executed and checked each step. If colleagues made the final cutover, say so. The snapshot/DMS and authorship differences remain unresolved until confirmed.

</details>

</section>

</div>
