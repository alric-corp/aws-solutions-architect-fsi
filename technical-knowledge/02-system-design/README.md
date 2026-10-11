# System Design

Padrões e trade-offs para combinar os [fundamentos](../01-fundamentals/README.md) em sistemas distribuídos e em escala.

| ID | Módulo | Objetivo |
|---|---|---|
| SD01 | [Arquitetura de Serviços](01-service-architecture.md) | Dividir o sistema em serviços e organizar a entrada e a comunicação entre eles |
| SD02 | [Dados em Escala](02-data-at-scale.md) | Escalar leitura e escrita de dados com cache, replicação e particionamento |
| SD03 | [Fluxos Distribuídos](03-distributed-workflows.md) | Coordenar operações entre serviços sem transação global |
| SD04 | [Resiliência e Isolamento](04-resilience-isolation.md) | Conter falhas e limitar o raio de impacto |
| SD05 | [Escala, Capacidade e Deploy](05-scale-capacity-deployment.md) | Dimensionar, testar limites e liberar mudanças com segurança |

## Padrões de sistemas distribuídos

Sete padrões frequentes em perguntas de design, mais um de migração. Em entrevista, não basta nomear o padrão: diga que problema ele resolve, que custo traz e quando não usar.

| Padrão | Onde está |
|---|---|
| Ambassador | [SD01](01-service-architecture.md#ambassador) |
| Circuit Breaker | [SD04](04-resilience-isolation.md#circuit-breaker) |
| CQRS | [SD03](03-distributed-workflows.md#cqrs) |
| Event Sourcing | [SD03](03-distributed-workflows.md#event-sourcing) |
| Leader Election | [SD03](03-distributed-workflows.md#leader-election) |
| Pub/Sub | [F07](../01-fundamentals/07-events-messaging-distributed-systems.md#pubsub) |
| Sharding | [SD02](02-data-at-scale.md#sharding) |
| Strangler Fig | [SD01](01-service-architecture.md#strangler) |

<a id="trilha"></a>
## Trilha de system design

Os temas de system design e onde cada um é estudado nos módulos.

| # | Tema | Onde estudar |
|---|---|---|
| 1 | Protocolos de rede: TCP/IP, HTTP e DNS | [Protocolos na prática](../01-fundamentals/01-networking-dns-connectivity.md#protocolos) · [HTTP e REST](../01-fundamentals/02-http-rest-openapi.md) |
| 2 | Storage, RAID e I/O | [Níveis de RAID](../01-fundamentals/05-storage.md#raid) · [Padrões de I/O](../01-fundamentals/05-storage.md#io) |
| 3 | CAP, ACID, BASE e PACELC | [ACID e CAP](../01-fundamentals/06-databases-transactions-consistency.md#acid-cap) · [BASE e PACELC](../01-fundamentals/06-databases-transactions-consistency.md#base-pacelc) |
| 4 | Modelos de dados e indexação | [Modelos de dados](../01-fundamentals/06-databases-transactions-consistency.md#modelos) · [Indexação](../01-fundamentals/06-databases-transactions-consistency.md#indexacao) |
| 5 | Estratégias de cache | [Estratégias de cache](02-data-at-scale.md#cache) |
| 6 | Monólitos, microsserviços e domínios | [Monólito, microsserviços e domínios](01-service-architecture.md#microsservicos) |
| 7 | Load balancers e proxies reversos | [Proxies reversos e balanceamento](../01-fundamentals/04-compute-containers.md#balanceamento) |
| 8 | API gateways | [API gateway](01-service-architecture.md#api-gateway) |
| 9 | Backend for Frontend (BFF) | [BFF](01-service-architecture.md#bff) |
| 10 | Service mesh | [Service mesh](01-service-architecture.md#service-mesh) · [Ambassador](01-service-architecture.md#ambassador) |
| 11 | Concorrência e paralelismo | [Concorrência e paralelismo](../01-fundamentals/09-performance-costs.md#concorrencia) |
| 12 | Comunicação síncrona: HTTP, REST, RPC e gRPC | [REST, RPC e gRPC](../01-fundamentals/02-http-rest-openapi.md#sincrona) |
| 13 | Comunicação assíncrona: filas, eventos e streaming | [Fila, pub/sub e streaming](../01-fundamentals/07-events-messaging-distributed-systems.md#assincrona) |
| 14 | Performance, capacidade e escalabilidade | [Antes de otimizar](../01-fundamentals/09-performance-costs.md#performance) · [Escalabilidade](05-scale-capacity-deployment.md#scale-cube) |
| 15 | Scale cube | [Scale cube](05-scale-capacity-deployment.md#scale-cube) |
| 16 | Sharding e particionamento | [Particionamento](02-data-at-scale.md#particionamento) · [Sharding](02-data-at-scale.md#sharding) |
| 17 | Replicação de dados | [Replicação](02-data-at-scale.md#replicacao) |
| 18 | CQRS | [CQRS](03-distributed-workflows.md#cqrs) |
| 19 | Saga | [Saga na prática](03-distributed-workflows.md#saga) · [Case 03](../../cases/03-event-driven-banking.md) |
| 20 | Event sourcing | [Event Sourcing](03-distributed-workflows.md#event-sourcing) |
| 21 | Resiliência: timeouts, retries, idempotência, circuit breaker e fallback | [Padrões de resiliência](04-resilience-isolation.md#resiliencia) |
| 22 | Deployment: blue/green, canary e feature toggles | [Estratégias de deployment](05-scale-capacity-deployment.md#deployment) |
| 23 | Capacity planning | [Capacity planning](05-scale-capacity-deployment.md#capacity) |
| 24 | Testes de carga e estresse | [Testes de carga e estresse](05-scale-capacity-deployment.md#testes-carga) |
| 25 | Bulkhead | [Bulkhead](04-resilience-isolation.md#bulkhead) |
| 26 | Cell-based architecture | [Arquitetura baseada em células](04-resilience-isolation.md#celulas) |
| 27 | SPOF e disaster recovery | [SPOF e estratégias de DR](../01-fundamentals/12-resilience-migration.md#spof-dr) |
| 28 | Observabilidade e monitoramento por célula | [Sinais de ouro, SLI e SLO](../01-fundamentals/08-observability-troubleshooting.md#slo) |
| 29 | Orquestração e coreografia | [Orquestração e coreografia](03-distributed-workflows.md#orquestracao) |

Para praticar, use as [perguntas de design](../../interview/simulations/03-system-design/design-questions.md).
