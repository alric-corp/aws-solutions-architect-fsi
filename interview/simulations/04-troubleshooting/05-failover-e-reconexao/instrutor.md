# Simulado 5 — Material do instrutor

Entregue somente [candidato.md](candidato.md). Todos os eventos, endereços, configurações e horários abaixo são **dados sintéticos para treinamento**, no dia fictício D em UTC. Não realizar failover ou reinício real. Aplique o [guia](../guia-do-instrutor.md).

## 1. Competências avaliadas

Delimitar domínio de falha e tipo de implantação; conectar failover, endpoint, DNS do runtime, conexões e pool; avaliar retries e resultado ambíguo; validar recuperação funcional. Na [rubrica](../rubrica.md), observar responsabilidade operacional além da recuperação do recurso.

## 2. Estado real e premissas do cenário

RDS PostgreSQL 16 em **Multi-AZ DB instance com um standby síncrono**, em duas AZs da mesma Região. Não é Aurora nem Multi-AZ DB cluster com readers. Não há read replica usada pela aplicação e não há réplica em outra Região. O standby dessa implantação não atende leituras.

O host primário sofre falha; o RDS promove o standby e atualiza o DNS do endpoint da instância. Quatro tasks Java acessam pelo nome; duas de revisão antiga configuraram cache DNS positivo da JVM em 3600 s e ainda usam o IP anterior. As outras duas têm cache configurado em 30 s, descartam conexões quebradas e reconectam. Os valores são configuração deste cenário, não defaults universais de Java ou RDS.

O pool perde conexões existentes durante a falha. Nas tasks antigas, descartar uma conexão quebrada não basta: a próxima abertura usa o IP retido pela JVM. Não há IP fixado no arquivo de configuração. Rede e permissões para o novo endereço estão corretas. Hipóteses alternativas iniciais: failover incompleto, configuração de endpoint, caminho de rede, credenciais, pool com conexões inválidas ou saturação por retries.

O endpoint de criação de pedidos tem chave de intenção, unicidade e resultado durável. Endpoints legados de atualização ainda não têm esse contrato. Não presumir que a proteção de uma operação se aplica a todas.

## 3. Linha do tempo

| Horário sintético | Evento |
|---|---|
| 16:50–17:00 | Quatro tasks atendem normalmente |
| 17:00:00 | Host primário indisponível; conexões existentes falham |
| 17:01:20 | Evento de conclusão do failover; DNS atualizado |
| 17:01:40 | Tasks com cache curto voltam a operar |
| 17:04 | Duas tasks antigas continuam com erro; recorte da investigação |

A duração de 80 s é apenas dado deste exercício. Não usá-la como promessa de failover. Tempos reais dependem de implantação, carga e recuperação do banco, e a recuperação da aplicação tem etapas adicionais.

## 4. Evidências sintéticas progressivas

**E1 — Escopo e implantação.** Eventos indicam host primário não saudável e failover concluído para outra AZ. Outros serviços observados na AZ original continuam atendendo; não há evidência fornecida de indisponibilidade da AZ inteira ou da Região. Inventário identifica a implantação descrita na seção 2. Banco novo aceita leitura e escrita por clientes de controle autorizados.

**E2 — Endpoint e resolução por contexto, às 17:04.** Nome configurado: `db.pedidos.interno.example`, apelido que acompanha o endpoint DNS da instância RDS. Nenhuma configuração contém IP fixo. IP anterior `10.40.11.70`; atual `10.40.22.90`. Resolvedor consultado em coleta autorizada retorna o atual. Instrumentação dentro das JVMs antigas mostra o endereço anterior; nas outras mostra o atual. Executar `dig` em outro processo não consulta o cache interno da JVM e não encerraria essa hipótese.

**E3 — Conexões e revisão.** Nas duas tasks antigas: todas as conexões antigas estão inválidas, e novas tentativas vão ao IP anterior. Nas saudáveis: pool já abriu conexões ao atual. Recorte normalizado, não mensagem universal de um driver:

```text
17:04:00 task=antiga-1 pool_connection=discarded cause=connection_lost
17:04:01 task=antiga-1 new_connection_address=10.40.11.70 result=connect_timeout
17:04:01 task=atual-1 new_connection_address=10.40.22.90 result=connected
```

Inventário do runtime confirma `networkaddress.cache.ttl=3600` nas revisões antigas e `30` nas atuais. O TTL foi configurado antes da primeira conexão. SGs, NACLs e rotas permitem o endereço novo. Não há pico sustentado de conexões ou CPU no banco após o failover, mas aumentar retries pode criá-lo.

**E4 — Operações interrompidas.** `op-71`, criação com chave estável: cliente perdeu a resposta ao commit; leitura autorizada do resultado durável no novo escritor encontra pedido e itens confirmados. `op-72`, atualização legada: cliente perdeu a conexão sem saber se a alteração confirmou; o material disponível não identifica com segurança seu resultado. É correto manter essa pendência em reconciliação e discutir coleta adicional. Não inventar que toda operação em andamento foi revertida.

**E5 — Recuperação condicional.** Após validar a configuração de cache, substituir gradualmente as tasks antigas por revisão corrigida e renovar o pool com drenagem: todas as tasks abrem novas conexões pelo nome ao IP atual; leituras e mutações canário passam; em dez minutos, falhas técnicas caem para o normal anterior de menos de 1%, sem pico de conexões. Testar retorno de resultado para a chave de `op-71`, sem criar outro pedido. `op-72` permanece pendente até reconciliação; infraestrutura verde não é evidência de resolução desse caso.

## 5. Solicitação → evidência → conclusão e limite

| Solicitação da candidata | Evidência fornecida | O que permite concluir | O que não permite concluir |
|---|---|---|---|
| O que falhou, qual implantação e qual domínio? | E1 | Houve failover de DB instance para standby em outra AZ | Houve falha regional ou todo tipo de réplica se comporta igual |
| Qual endpoint a aplicação usa e qual IP cada processo enxerga? | E2 | Existe diferença entre resolvedor e cache do runtime | DNS correto fora da JVM exclui cache obsoleto |
| O pool descarta conexões? Para onde as novas vão? O que difere entre revisões? | E3 | Novas tentativas ainda usam IP antigo nas tasks afetadas | Apenas reduzir lifetime do pool corrigirá o DNS |
| E as requisições em andamento e retries? | E4 | Uma operação tem resultado recuperável; outra continua incerta | Repetir toda mutação é seguro após failover |
| Como validar a aplicação e as pendências? | E5, condicional | Novas conexões e jornadas testadas recuperaram | Todo pedido anterior foi conciliado |

## 6. Raciocínio esperado e alternativas válidas

Separar “o RDS promoveu um escritor” de “todos os clientes estão conectados ao escritor atual”. Comparar tasks saudáveis e afetadas, o endpoint usado, a resolução percebida pelo runtime e o destino de novas conexões. A evidência deve distinguir pool inválido de cache de nome obsoleto.

Aceitar renovação suportada do cache e do pool, se a candidata explicar como funciona nesse runtime e como testa, ou substituição gradual por revisão corrigida. Reiniciar tasks antigas pode limpar o cache uma vez, mas mantém o defeito para o próximo failover. Ajuste de configuração tem de ocorrer no momento correto do ciclo da JVM; não presumir que alterar um arquivo muda caches já carregados. Não exigir parâmetro exato de uma biblioteca.

Aceitar que ela investigue um proxy de conexão como evolução futura, com garantias e limites verificados. Ele não é obrigatório nem elimina o contrato de retry ou a possibilidade de transação ambígua.

## 7. Perguntas de aprofundamento

- “Que evidência sustenta instância, AZ ou Região como escopo?”
- “Seu teste de DNS foi dentro do mesmo processo que abre a conexão?”
- “Se limpar só o pool, para onde vai a próxima conexão?”
- “O failover move uma conexão TCP existente ou exige outra?”
- “Quais operações pode repetir e quais exigem consultar ou reconciliar o resultado?”
- “Uma read replica em outra Região faria o mesmo papel desse standby?”

## 8. Respostas incompletas e como aprofundá-las

| Resposta | Pergunta para aprofundar |
|---|---|
| “Multi-AZ já resolveu.” | O que explica clientes saudáveis e outros com IP antigo? |
| “Limpo o pool.” | Como comprova que a resolução para a próxima conexão mudou? |
| “Coloco o IP novo direto.” | O que acontecerá na próxima manutenção ou failover? |
| “Faço retry até voltar.” | Qual orçamento de tempo, limite de carga e proteção de mutações? |
| “Promovo a réplica.” | Que réplica existe neste desenho e quem já foi promovido? |

## 9. Mitigações, riscos e validação

Responsável de aplicação revisa cache e pool; dados confirma escritor e estado de operações; plataforma acompanha reposição gradual. Verificar capacidade das tasks saudáveis, drenar requisições e não reiniciar tudo junto. Limitar novas entradas se necessário. Parar se as tasks novas ainda usarem endereço antigo, o banco saturar ou surgir efeito duplicado.

Definir timeouts de conexão e operação, limite total de tentativas, backoff e jitter. Cancelamento local não comprova cancelamento remoto. Retry de leitura pode ser razoável dentro do contrato de consistência; mutação com resultado incerto exige proteção ou reconciliação. Não encadear retries ilimitados em vários níveis.

E5 valida tráfego novo; uma lista separada acompanha operações interrompidas. Prevenção: teste autorizado de failover em ambiente de treino futuro, com escrita em andamento e clientes de diferentes revisões, verificação de cache, pool e retomada segura. Este material não executa esse teste.

## 10. Exemplo de resposta inicial organizada

“Vou confirmar qual implantação concluiu o failover e quais clientes ainda falham. Compararei o endpoint e o endereço usado por cada runtime, além das conexões existentes e novas do pool. A recuperação de novas requisições será tratada junto com a lista de operações interrompidas; não vou assumir que todas falharam nem repetir escritas sem conhecer seu contrato.”

## 11. Explicação técnica aprofundada

No Multi-AZ DB instance com um standby, a cópia síncrona em outra AZ atende alta disponibilidade; o standby não serve tráfego de leitura. Isso difere de uma read replica PostgreSQL, replicada de forma assíncrona para leituras e possível promoção com decisões próprias. Multi-AZ DB cluster e Aurora têm outras topologias; não transferir os detalhes deste caso para eles. [Multi-AZ com um standby](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html) e [read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html), consulta em 01/11/2026.

O failover atualiza o registro DNS do endpoint; clientes precisam estabelecer conexões novas. Caches do resolvedor, do runtime e da biblioteca podem ter políticas distintas. O pool também precisa reconhecer conexões rompidas. Os tempos de recuperação dependem dessas camadas, não apenas do evento do RDS. A documentação orienta configurar o cache da JVM para acompanhar mudanças; conferir o runtime efetivo, sem assumir default único. [RDS — failover e cache DNS da JVM](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.Failover.html), consulta em 01/11/2026.

HA entre AZs não é, por si só, estratégia de recuperação entre Regiões. DR requer definir perda admissível, tempo de recuperação, autoridade de escrita e testes de dependências. Uma read replica assíncrona promovida pode ter atraso; sua existência não garante que todos os commits mais recentes estejam disponíveis. O caso não autoriza mover tráfego regional sem projeto.

Conexão rompida durante uma transação não migra automaticamente o trabalho para outra conexão. Se o resultado do commit não foi recebido, o cliente pode não saber o que foi confirmado. Recuperar por intenção durável ou reconciliar evita repetir efeitos sem fundamento. [Builders’ Library — retries](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/), consulta em 01/11/2026. O detalhamento está no [caso 2](../02-pedido-durante-falha-do-banco/instrutor.md).

## 12. Exemplo de comunicação para negócio

“O banco já está atendendo pela instância promovida. Duas instâncias da aplicação ainda tentam o endereço anterior por configuração de cache; vamos substituí-las gradualmente e validar consultas e atualizações. Uma criação de pedido foi confirmada pelo registro durável; outra atualização segue em reconciliação. A próxima atualização será em dez minutos com a saúde da jornada e o estado dessas pendências.”

## 13. Debrief e links de revisão

Peça duas linhas do tempo: recuperação do banco e da aplicação. Pergunte como mudariam se o problema fosse só pool inválido, sem DNS obsoleto. Revise [F12 — resiliência](../../../../technical-knowledge/01-fundamentals/12-resilience-migration.md), [F01 — DNS](../../../../technical-knowledge/01-fundamentals/01-networking-dns-connectivity.md), [F06 — transações](../../../../technical-knowledge/01-fundamentals/06-databases-transactions-consistency.md) e [caso 2](../02-pedido-durante-falha-do-banco/instrutor.md).

## 14. Fontes técnicas

Consultadas em **01/11/2026**: [RDS failover e DNS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.Failover.html), [Multi-AZ DB instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html), [read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html) e [Builders’ Library — retries](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/). As configurações, a falha de host e os tempos são sintéticos; nenhuma duração é compromisso operacional da AWS. [Catálogo](../../../../references/troubleshooting-fontes.md).
