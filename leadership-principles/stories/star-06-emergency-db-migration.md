# STAR-06 — Migração emergencial de banco de dados

**No loop:** alternativa para Deliver Results ★ e Bias for Action ★. Na tabela original o principal era Bias for Action; no mapa do loop, STAR-01 ficou com Bias for Action para que as histórias não se repitam.

[Foco do loop](../loop-focus.md) · [Bias for Action](../09-bias-for-action.md) · [Deliver Results](../14-deliver-results.md)

> **Antes de usar.** Se este for o mesmo projeto da apresentação, os detalhes precisam bater. O material da apresentação descreve uma nova base com DMS e a troca final feita por colegas; esta história descreve snapshot e a troca feita por você. Confirme o que aconteceu e evite recontar o projeto em uma entrevista comportamental. Veja A8.

> Versão anonimizada: empresa e sistemas internos aparecem pela função. Os números são os do relato original.

## STAR

**Situação.** Fui alocada temporariamente em uma squad que enfrentava um problema crítico em produção havia mais de 12 semanas. O time não conseguia publicar novos produtos para os clientes porque o banco de dados relacional tinha atingido o limite de memória. A correção parecia simples, aumentar o tipo da instância, mas a infraestrutura estava muito depreciada e a esteira de Terraform já não conseguia aplicar essa alteração.

**Tarefa.** Como o acesso emergencial (break-glass) não foi aprovado para esse cenário, eu precisava encontrar outra solução rapidamente, de forma segura, para recuperar a capacidade da aplicação e voltar a permitir a publicação de produtos.

**Ação.** Como seria preciso criar uma nova base, avaliei as opções de migração. Considerei o AWS DMS, mas como eu conseguia trabalhar com um ponto consistente da base e não precisava manter origem e destino sincronizados, optei por uma estratégia mais simples, com snapshot. Criei uma nova instância de banco já com a infraestrutura atualizada, restaurei os dados a partir do snapshot e validei o conteúdo da nova base. Depois, em uma janela de baixa utilização, alterei a aplicação para apontar para o novo endpoint. A indisponibilidade foi de poucos segundos, sem impacto perceptível para os clientes. Mantivemos o banco antigo disponível por um curto período como rollback e, após validar a estabilidade da nova base, removemos o recurso antigo.

**Resultado.** Resolvemos um problema que bloqueava o time havia mais de 12 semanas e voltamos a permitir a publicação de novos produtos. A migração teve apenas uma pequena janela técnica de indisponibilidade, sem impacto perceptível para os usuários, com estratégia de rollback durante a transição. E a solução foi mais simples e segura, sem a complexidade de uma migração com DMS e sincronização contínua, que não era necessária ali.

**Aprendizado.** Em situações críticas, nem sempre o melhor caminho é insistir na solução ideal se ela está bloqueada por outras dependências. Também aprendi a avaliar o nível de complexidade realmente necessário para uma migração: considerei uma solução mais robusta com DMS, mas o snapshot atendia ao requisito com menos complexidade e risco operacional.

## Perguntas que você já preparou

Responda em voz alta antes de abrir.

### 1. Qual era o problema em produção?

EN: *What was the production issue?*

<details><summary>Ver resposta preparada</summary>

**PT:** O banco de dados relacional tinha atingido o limite de memória, e isso estava impedindo o time de publicar novos produtos para os clientes havia mais de 12 semanas.

**EN:** The relational database had reached its memory limit, and that had been preventing the team from publishing new products to customers for more than 12 weeks.

</details>

### 2. Por que vocês não simplesmente aumentaram o tamanho da instância?

EN: *Why didn't you simply increase the instance size?*

<details><summary>Ver resposta preparada</summary>

**PT:** Essa seria a correção mais simples, mas a infraestrutura estava muito depreciada e a esteira de Terraform já não conseguia aplicar essa alteração com segurança.

**EN:** That would have been the simplest fix, but the infrastructure was heavily outdated and the Terraform pipeline could no longer apply that change safely.

</details>

### 3. Qual foi sua responsabilidade nesse caso?

EN: *What was your responsibility in this case?*

<details><summary>Ver resposta preparada</summary>

**PT:** Minha responsabilidade foi encontrar uma alternativa segura para recuperar a aplicação sem depender da correção imediata de toda a esteira de infraestrutura.

**EN:** My responsibility was to find a safe alternative to restore the application without depending on an immediate fix for the entire infrastructure pipeline.

</details>

### 4. Qual solução você escolheu?

EN: *Which solution did you choose?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu criei uma nova instância de banco com infraestrutura atualizada, restaurei os dados a partir de um snapshot e depois alterei a aplicação para apontar para o novo endpoint.

**EN:** I created a new database instance with updated infrastructure, restored the data from a snapshot, and then changed the application to point to the new endpoint.

</details>

### 5. Por que você considerou DMS?

EN: *Why did you consider AWS DMS?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque DMS seria uma opção caso eu precisasse manter origem e destino sincronizados durante a migração ou reduzir ao máximo a indisponibilidade em um banco com mudanças contínuas.

**EN:** Because DMS would have been useful if I needed to keep the source and target synchronized during the migration or minimize downtime for a database with continuous changes.

</details>

### 6. Por que você não usou DMS?

EN: *Why didn't you use AWS DMS?*

<details><summary>Ver resposta preparada</summary>

**PT:** Nesse cenário, eu conseguia trabalhar com um ponto consistente da base e não precisava manter origem e destino sincronizados. Então o snapshot atendia ao requisito com menos complexidade e mais agilidade.

**EN:** In this scenario, I could work with a consistent point-in-time copy of the database and I didn't need to keep source and target synchronized. So the snapshot met the requirement with less complexity and more agility.

</details>

### 7. Quando você escolheria DMS em vez de snapshot?

EN: *When would you choose DMS instead of a snapshot?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu escolheria DMS quando houvesse muitas alterações durante a migração, necessidade de replicação contínua, downtime muito restrito ou migração entre ambientes ou engines que exigissem esse tipo de sincronização.

**EN:** I would choose DMS when there were continuous changes during the migration, a need for ongoing replication, very limited downtime, or migrations between environments or engines that required synchronization.

</details>

### 8. Qual foi o principal trade-off entre DMS e snapshot?

EN: *What was the main trade-off between DMS and a snapshot?*

<details><summary>Ver resposta preparada</summary>

**PT:** DMS daria mais flexibilidade e sincronização, mas aumentaria a complexidade da migração. O snapshot era mais simples, mas exigia uma pequena janela de indisponibilidade.

**EN:** DMS would provide more flexibility and synchronization, but it would increase migration complexity. The snapshot was simpler, but it required a small downtime window.

</details>

### 9. Houve indisponibilidade?

EN: *Was there any downtime?*

<details><summary>Ver resposta preparada</summary>

**PT:** Sim, houve uma janela muito curta, de poucos segundos, durante a troca para o novo banco.

**EN:** Yes, there was a very short downtime window of only a few seconds during the cutover to the new database.

</details>

### 10. Como você reduziu o impacto dessa indisponibilidade?

EN: *How did you minimize the impact of the downtime?*

<details><summary>Ver resposta preparada</summary>

**PT:** Realizamos a mudança de madrugada, em um período de baixa utilização, e deixamos todas as etapas preparadas antes do cutover.

**EN:** We performed the change overnight during a low-traffic period and prepared all the migration steps before the cutover.

</details>

### 11. Como a aplicação passou a usar o novo banco?

EN: *How did the application start using the new database?*

<details><summary>Ver resposta preparada</summary>

**PT:** Depois de restaurar e validar a nova base, atualizamos a configuração da aplicação para apontar para o novo endpoint do banco e então subimos a aplicação com essa configuração.

**EN:** After restoring and validating the new database, we updated the application configuration to point to the new database endpoint and deployed the application with that configuration.

</details>

### 12. Como você planejou o rollback?

EN: *How did you plan for rollback?*

<details><summary>Ver resposta preparada</summary>

**PT:** Mantivemos o banco antigo disponível durante a transição. Se houvesse algum problema no novo ambiente, poderíamos reverter a aplicação para o endpoint anterior.

**EN:** We kept the old database available during the transition. If there had been an issue with the new environment, we could have pointed the application back to the previous endpoint.

</details>

### 13. Por quanto tempo o banco antigo ficou disponível?

EN: *How long did you keep the old database available?*

<details><summary>Ver resposta preparada</summary>

**PT:** Ele ficou disponível por um período curto, apenas até termos confiança de que a nova base estava estável. Depois disso, removemos o recurso antigo.

**EN:** We kept it available for a short period, just until we were confident that the new database was stable. After that, we removed the old resource.

</details>

### 14. Como você validou que os dados estavam corretos no novo banco?

EN: *How did you validate the data in the new database?*

<details><summary>Ver resposta preparada</summary>

**PT:** Depois do restore, validei os dados diretamente na nova instância e comparei se as informações esperadas estavam presentes antes de alterar a aplicação.

**EN:** After the restore, I validated the data directly in the new instance and checked that the expected information was present before switching the application.

</details>

Esta resposta ainda não diz o método. Veja A7.

### 15. Como você soube que a migração tinha funcionado?

EN: *How did you know the migration was successful?*

<details><summary>Ver resposta preparada</summary>

**PT:** Validamos a integridade dos dados, subimos a aplicação apontando para a nova base e confirmamos que o fluxo voltou a permitir a publicação de novos produtos.

**EN:** We validated the data integrity, deployed the application pointing to the new database, and confirmed that the flow was able to publish new products again.

</details>

### 16. Que métricas você acompanharia durante uma migração dessas?

EN: *Which metrics would you monitor during this kind of migration?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu acompanharia conexões, uso de CPU e memória, latência do banco, erros da aplicação, quantidade de requisições e comportamento do fluxo de negócio depois do cutover.

**EN:** I would monitor connections, CPU and memory usage, database latency, application errors, request volume, and the business flow behavior after the cutover.

</details>

### 17. E se os dados mudassem durante a criação do snapshot?

EN: *What if the data changed while the snapshot was being created?*

<details><summary>Ver resposta preparada</summary>

**PT:** Se houvesse uma taxa alta de mudanças e eu não pudesse aceitar diferença entre origem e destino, o snapshot sozinho talvez não fosse suficiente. Nesse caso, eu consideraria uma estratégia com replicação, como DMS, para manter as bases sincronizadas até o cutover.

**EN:** If there were a high rate of changes and I couldn't accept differences between source and target, a snapshot alone might not be enough. In that case, I would consider a replication strategy such as DMS to keep the databases synchronized until cutover.

</details>

### 18. Como você determinou que alguns segundos de downtime eram aceitáveis?

EN: *How did you determine that a few seconds of downtime were acceptable?*

<details><summary>Ver resposta preparada</summary>

**PT:** Pelo perfil da aplicação e pelo fato de a mudança ser feita em um período de baixa utilização. Como não havia uma exigência de zero downtime para esse cenário, a pequena janela era um trade-off aceitável em troca de uma migração mais simples.

**EN:** Based on the application profile and the fact that we performed the change during a low-traffic period. Since zero downtime wasn't a requirement for this scenario, the short outage was an acceptable trade-off for a simpler migration.

</details>

### 19. E se o banco fosse muito grande? Você ainda usaria snapshot?

EN: *What if the database were very large? Would you still use a snapshot?*

<details><summary>Ver resposta preparada</summary>

**PT:** Dependeria do tempo de restore, da janela disponível e do RTO esperado. Em uma base muito grande, eu avaliaria se o tempo de restore continuaria aceitável. Caso contrário, poderia considerar replicação contínua ou outra estratégia.

**EN:** It would depend on the restore time, the available migration window, and the expected RTO. For a very large database, I would evaluate whether the restore time was still acceptable. Otherwise, I might consider continuous replication or another strategy.

</details>

### 20. Como você pensou em RTO e RPO?

EN: *How did you think about RTO and RPO?*

<details><summary>Ver resposta preparada</summary>

**PT:** O RTO precisava ser muito baixo porque o objetivo era recuperar rapidamente o fluxo de publicação. Já o RPO era compatível com a estratégia de snapshot porque os dados não estavam mudando de forma contínua naquele momento.

**EN:** The RTO needed to be very low because the goal was to restore the publishing flow quickly. The RPO was compatible with the snapshot strategy because the data wasn't changing continuously at that point.

</details>

Revise esta resposta com A4 antes de usar.

### 21. O que você faria se a migração falhasse depois do cutover?

EN: *What would you do if the migration failed after cutover?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu reverteria a aplicação para o endpoint antigo, porque mantivemos o banco anterior disponível justamente para esse cenário. Depois investigaria a causa antes de tentar novamente.

**EN:** I would point the application back to the old endpoint because we kept the previous database available specifically for that scenario. Then I would investigate the root cause before attempting the migration again.

</details>

### 22. Por que não corrigir primeiro toda a esteira de Terraform?

EN: *Why didn't you fix the entire Terraform pipeline first?*

<details><summary>Ver resposta preparada</summary>

**PT:** Porque havia um problema de negócio crítico bloqueado havia mais de 12 semanas. Corrigir toda a esteira poderia levar muito mais tempo. Então eu separei os problemas: primeiro recuperei o serviço com uma solução segura e depois a dívida de infraestrutura poderia ser tratada de forma adequada.

**EN:** Because there was a critical business issue that had been blocked for more than 12 weeks. Fixing the entire pipeline could take much longer. So I separated the problems: first I restored the service safely, and then the infrastructure debt could be addressed properly.

</details>

### 23. Isso não foi apenas contornar o problema em vez de resolver a causa raiz?

EN: *Wasn't this just a workaround instead of fixing the root cause?*

<details><summary>Ver resposta preparada</summary>

**PT:** A causa operacional imediata era o banco sem capacidade suficiente, e isso foi resolvido com a nova instância. A dívida da esteira era um problema separado e mais estrutural. Eu não queria manter o negócio bloqueado enquanto toda essa dívida era corrigida.

**EN:** The immediate operational root cause was that the database no longer had enough capacity, and that was resolved with the new instance. The outdated pipeline was a separate, more structural issue. I didn't want to keep the business blocked while that entire technical debt was being fixed.

</details>

### 24. Como você garantiria que esse problema não acontecesse novamente?

EN: *How would you prevent this problem from happening again?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu acompanharia crescimento de memória e capacidade do banco com alertas antes de chegar ao limite, revisaria periodicamente o sizing da instância e manteria a esteira de infraestrutura atualizada para que mudanças de capacidade pudessem ser feitas pelo fluxo normal.

**EN:** I would monitor database memory and capacity growth with alerts before reaching the limit, periodically review instance sizing, and keep the infrastructure pipeline updated so capacity changes could be made through the normal process.

</details>

### 25. Multi-AZ ou réplica de leitura teriam resolvido?

EN: *Would Multi-AZ or a read replica have solved this issue?*

<details><summary>Ver resposta preparada</summary>

**PT:** Não necessariamente. Multi-AZ é principalmente para alta disponibilidade e failover, e uma read replica ajuda a distribuir leituras. O problema aqui era capacidade de memória da instância principal, então eu precisava corrigir o sizing do banco.

**EN:** Not necessarily. Multi-AZ is mainly for high availability and failover, and a read replica helps distribute read traffic. The issue here was the memory capacity of the primary instance, so I needed to address the database sizing.

</details>

### 26. O que você faria diferente hoje?

EN: *What would you do differently today?*

<details><summary>Ver resposta preparada</summary>

**PT:** Eu atuaria antes do incidente. Criaria alertas de capacidade para o banco, principalmente memória, e revisaria periodicamente o sizing. Também manteria os módulos de infraestrutura atualizados para evitar que uma alteração simples ficasse bloqueada pela própria esteira.

**EN:** Today, I would act before the incident happened. I would create capacity alerts for the database, especially memory, and periodically review the sizing. I would also keep the infrastructure modules updated so a simple change wouldn't be blocked by the deployment pipeline.

</details>

### 27. O que você aprendeu?

EN: *What did you learn from this experience?*

<details><summary>Ver resposta preparada</summary>

**PT:** Aprendi que, em um cenário crítico, é importante separar o que precisa ser resolvido imediatamente do que é uma dívida estrutural. Também reforçou para mim que a melhor solução não é necessariamente a mais sofisticada, mas a que atende aos requisitos com segurança, menor complexidade e velocidade adequada.

**EN:** I learned that in a critical situation, it's important to separate what must be solved immediately from what is a structural technical debt. It also reinforced that the best solution isn't necessarily the most sophisticated one, but the one that meets the requirements safely, with the right level of complexity and speed.

</details>

## Aprofundamento: perguntas novas

São os pontos que um entrevistador vai apertar. Quando não souber um fato, diga que não sabe e como confirmaria.

### A1. Se a esteira não conseguia alterar a instância, como você criou a nova?

EN: *If the pipeline couldn't change the instance, how did you create the new one?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

A resposta precisa explicar por que criar era possível e alterar não, por exemplo um módulo novo e atualizado para o recurso novo. Sem isso, a história parece contraditória.

</details>

### A2. Restaurar um snapshot já cria uma instância nova. Você escolheu a classe maior no restore?

EN: *Restoring a snapshot already creates a new instance. Did you pick the larger class during the restore?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Se o banco era RDS, o restore de snapshot gera uma nova instância e permite escolher a classe. Descrever o mecanismo exato mostra domínio; diga o que de fato foi feito.

</details>

### A3. Entre o snapshot e a troca, alguma escrita foi para o banco antigo?

EN: *Between the snapshot and the cutover, did any write go to the old database?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

E durante o deploy? Em um rolling deploy, tasks antigas e novas convivem por um tempo, cada uma com um endpoint. Explique por que não houve divergência: escritas paradas, janela controlada ou outro motivo verdadeiro.

</details>

### A4. O problema durou 12 semanas. Por que você diz que o RTO precisava ser baixo?

EN: *The problem lasted 12 weeks. Why do you say the RTO had to be low?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

RTO e RPO são termos de recuperação de desastre. Aqui é mais preciso falar da janela de troca aceitável e de perda de dados zero, garantida porque não havia escrita contínua. Use o termo apenas se ele descrever exatamente o requisito.

</details>

### A5. Quanto tempo você levou desde que chegou à squad até a troca?

EN: *How long did it take from joining the squad to the cutover?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Bias for Action precisa da velocidade em números. Doze semanas de bloqueio antes de você e quantos dias depois?

</details>

### A6. Por que o break-glass não foi aprovado, e quem decidiu?

EN: *Why wasn't break-glass approved, and who decided?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Se você discordou dessa decisão, argumentou e seguiu o caminho aprovado, há material de Disagree and Commit. Só use se aconteceu.

</details>

### A7. Como você validou os dados?

EN: *How exactly did you validate the data?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

“Validei o conteúdo” é vago. Diga o método: contagem de registros por tabela, checksums, amostras de consultas, comparação de um fluxo de negócio.

</details>

### A8. Quem fez cada passo: snapshot, restore, troca e rollback?

EN: *Who did each step: snapshot, restore, cutover and rollback?*

<details><summary>Ver resposta: o que precisa aparecer</summary>

Esta resposta precisa ser a mesma em todas as entrevistas e na apresentação. Se a troca final foi feita por colegas, diga isso.

</details>
