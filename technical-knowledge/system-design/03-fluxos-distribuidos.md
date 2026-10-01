# SD03 — Fluxos Distribuídos

**Origem:** seções que estavam em F07.

<a id="transactional-outbox"></a>
## Outbox e inbox

A outbox registra o evento junto da mudança local na mesma transação. Um publicador posterior faz a entrega; uma falha depois da entrega e antes da confirmação pode produzir repetição. O consumidor deve tratar seu efeito de forma idempotente. [Fonte T16](../../referencias/README.md#t16)

Uma inbox ou registro de processamento não deve ser gravado muito antes do efeito e depois impedir sua realização para sempre. Defina estados e transações locais; para efeito externo, defina a referência idempotente e a consulta de resultado.

<a id="orquestracao"></a>
## Orquestração e coreografia

Na orquestração, há um coordenador explícito da sequência e da recuperação. Na coreografia, os participantes reagem a fatos e distribuem a coordenação. São alternativas com consequências de visibilidade, acoplamento e evolução; não uma oposição entre “moderno” e “antigo”.

Uma saga coordena transações locais e possíveis compensações de negócio. Não é rollback global nem fornece automaticamente o isolamento de uma transação única. [Fonte T17](../../referencias/README.md#t17)

<a id="saga"></a>
### Saga na prática

Uma saga é uma sequência de transações locais, cada uma em um serviço, em que cada passo tem uma compensação de negócio caso um passo seguinte falhe. Exemplo: reservar limite → debitar → creditar; se o crédito falhar, estorna o débito e libera o limite. A compensação é uma nova operação, visível, não um rollback.

- **Orquestrada:** um coordenador conhece a sequência e chama cada passo. Na AWS, o AWS Step Functions.
- **Coreografada:** cada serviço reage ao evento do anterior. Na AWS, EventBridge ou SNS e SQS.

A orquestração deixa o fluxo visível e fácil de monitorar, mas concentra a lógica; a coreografia reduz o acoplamento a um coordenador, mas espalha o fluxo, que fica difícil de acompanhar quando cresce.

**Cuidado:** outros processos podem ver estados intermediários (débito feito, crédito pendente). Cada passo e cada compensação precisam ser idempotentes, e algumas ações não têm compensação: um Pix enviado não se desfaz, pede devolução. O [Case 03](../../cases/03-banking-event-driven.md) desenvolve uma saga de transferência completa.

<a id="cqrs"></a>
## CQRS

Command Query Responsibility Segregation. Como um restaurante com filas separadas para pedir e para retirar: escrita (comandos) e leitura (consultas) usam modelos separados, que escalam e se otimizam de forma independente. Vale quando os dois lados têm volumes ou requisitos muito diferentes, como um e-commerce com muitas consultas ao catálogo e poucos pedidos. Na AWS, um desenho comum grava no Aurora ou no DynamoDB e atualiza modelos de leitura (OpenSearch, ElastiCache ou tabelas próprias) via DynamoDB Streams ou EventBridge. Réplica de leitura não é CQRS: ela repete o mesmo modelo.

**Cuidado:** o modelo de leitura fica atrasado em relação à escrita. O saldo exibido pode vir de uma projeção, mas a decisão de débito precisa consultar a fonte autoritativa. É complexidade extra que precisa se justificar.

<a id="event-sourcing"></a>
## Event Sourcing

Como manter um diário em vez de reescrever a biografia: em vez de atualizar o registro, guardamos os eventos de cada mudança e reconstruímos o estado a partir deles. Isso dá histórico completo, auditoria, depuração e replay para análise; o histórico de commits do Git é a analogia comum. Em finanças, o razão contábil já funciona assim: o saldo deriva dos lançamentos, e um erro se corrige com estorno, não apagando o lançamento. Na AWS, um caminho comum é uma tabela append-only no DynamoDB, com número de versão e escrita condicional.

**Cuidado:** eventos precisam de versionamento de schema, estados longos pedem snapshots, e o replay não pode repetir efeitos externos, como reenviar um Pix. Publicar eventos não é fazer event sourcing ([Case 03, seção 10.7](../../cases/03-banking-event-driven.md#s10)).

<a id="leader-election"></a>
## Leader Election

Como uma turma que elege um representante: só um nó responde por uma tarefa ou recurso e, se ele falhar, os outros elegem um novo. Isso evita conflitos e mantém as decisões consistentes. ZooKeeper e etcd usam eleição de líder no próprio consenso e oferecem primitivas para que aplicações elejam um líder. Na AWS, é comum usar um lease no DynamoDB com escrita condicional, ou deixar a eleição com serviços gerenciados que já fazem isso, como o failover do writer no Aurora.

**Cuidado:** depois de uma partição de rede ou de uma pausa longa, dois nós podem se achar líderes (split brain). Use lease com expiração e fencing token, para que a escrita do líder antigo seja recusada. É o mesmo problema do escritor antigo no [Case 05](../../cases/05-modernizacao-core-banking.md#s09).

## Para treinar

1. Quando CQRS não vale a complexidade?
2. Como impedir que dois nós atuem como líder depois de uma partição de rede?
