# System Design

Padrões e trade-offs para combinar os [fundamentos](../fundamentals/README.md) em sistemas distribuídos e em escala.

| ID | Módulo | Objetivo |
|---|---|---|
| SD01 | [Arquitetura de Serviços](01-arquitetura-de-servicos.md) | Dividir o sistema em serviços e organizar a entrada e a comunicação entre eles |
| SD02 | [Dados em Escala](02-dados-em-escala.md) | Escalar leitura e escrita de dados com cache, replicação e particionamento |
| SD03 | [Fluxos Distribuídos](03-fluxos-distribuidos.md) | Coordenar operações entre serviços sem transação global |
| SD04 | [Resiliência e Isolamento](04-resiliencia-e-isolamento.md) | Conter falhas e limitar o raio de impacto |
| SD05 | [Escala, Capacidade e Deploy](05-escala-capacidade-deploy.md) | Dimensionar, testar limites e liberar mudanças com segurança |

## Padrões de sistemas distribuídos

Sete padrões frequentes em perguntas de design, mais um de migração. Em entrevista, não basta nomear o padrão: diga que problema ele resolve, que custo traz e quando não usar.

| Padrão | Onde está |
|---|---|
| Ambassador | [SD01](01-arquitetura-de-servicos.md#ambassador) |
| Circuit Breaker | [SD04](04-resiliencia-e-isolamento.md#circuit-breaker) |
| CQRS | [SD03](03-fluxos-distribuidos.md#cqrs) |
| Event Sourcing | [SD03](03-fluxos-distribuidos.md#event-sourcing) |
| Leader Election | [SD03](03-fluxos-distribuidos.md#leader-election) |
| Pub/Sub | [F07](../fundamentals/07-eventos-sistemas-distribuidos.md#pubsub) |
| Sharding | [SD02](02-dados-em-escala.md#sharding) |
| Strangler Fig | [SD01](01-arquitetura-de-servicos.md#strangler) |

<a id="trilha"></a>
## Trilha de system design

Os temas de system design e onde cada um é estudado nos módulos.

| # | Tema | Onde estudar |
|---|---|---|
| 1 | Protocolos de rede: TCP/IP, HTTP e DNS | [Protocolos na prática](../fundamentals/01-redes-dns-conectividade.md#protocolos) · [HTTP e REST](../fundamentals/02-http-rest-openapi.md) |
| 2 | Storage, RAID e I/O | [Níveis de RAID](../fundamentals/05-armazenamento.md#raid) · [Padrões de I/O](../fundamentals/05-armazenamento.md#io) |
| 3 | CAP, ACID, BASE e PACELC | [ACID e CAP](../fundamentals/06-bancos-consistencia.md#acid-cap) · [BASE e PACELC](../fundamentals/06-bancos-consistencia.md#base-pacelc) |
| 4 | Modelos de dados e indexação | [Modelos de dados](../fundamentals/06-bancos-consistencia.md#modelos) · [Indexação](../fundamentals/06-bancos-consistencia.md#indexacao) |
| 5 | Estratégias de cache | [Estratégias de cache](02-dados-em-escala.md#cache) |
| 6 | Monólitos, microsserviços e domínios | [Monólito, microsserviços e domínios](01-arquitetura-de-servicos.md#microsservicos) |
| 7 | Load balancers e proxies reversos | [Proxies reversos e balanceamento](../fundamentals/04-computacao-containers.md#balanceamento) |
| 8 | API gateways | [API gateway](01-arquitetura-de-servicos.md#api-gateway) |
| 9 | Backend for Frontend (BFF) | [BFF](01-arquitetura-de-servicos.md#bff) |
| 10 | Service mesh | [Service mesh](01-arquitetura-de-servicos.md#service-mesh) · [Ambassador](01-arquitetura-de-servicos.md#ambassador) |
| 11 | Concorrência e paralelismo | [Concorrência e paralelismo](../fundamentals/09-performance-custos.md#concorrencia) |
| 12 | Comunicação síncrona: HTTP, REST, RPC e gRPC | [REST, RPC e gRPC](../fundamentals/02-http-rest-openapi.md#sincrona) |
| 13 | Comunicação assíncrona: filas, eventos e streaming | [Fila, pub/sub e streaming](../fundamentals/07-eventos-sistemas-distribuidos.md#assincrona) |
| 14 | Performance, capacidade e escalabilidade | [Antes de otimizar](../fundamentals/09-performance-custos.md#performance) · [Escalabilidade](05-escala-capacidade-deploy.md#scale-cube) |
| 15 | Scale cube | [Scale cube](05-escala-capacidade-deploy.md#scale-cube) |
| 16 | Sharding e particionamento | [Particionamento](02-dados-em-escala.md#particionamento) · [Sharding](02-dados-em-escala.md#sharding) |
| 17 | Replicação de dados | [Replicação](02-dados-em-escala.md#replicacao) |
| 18 | CQRS | [CQRS](03-fluxos-distribuidos.md#cqrs) |
| 19 | Saga | [Saga na prática](03-fluxos-distribuidos.md#saga) · [Case 03](../../cases/03-banking-event-driven.md) |
| 20 | Event sourcing | [Event Sourcing](03-fluxos-distribuidos.md#event-sourcing) |
| 21 | Resiliência: timeouts, retries, idempotência, circuit breaker e fallback | [Padrões de resiliência](04-resiliencia-e-isolamento.md#resiliencia) |
| 22 | Deployment: blue/green, canary e feature toggles | [Estratégias de deployment](05-escala-capacidade-deploy.md#deployment) |
| 23 | Capacity planning | [Capacity planning](05-escala-capacidade-deploy.md#capacity) |
| 24 | Testes de carga e estresse | [Testes de carga e estresse](05-escala-capacidade-deploy.md#testes-carga) |
| 25 | Bulkhead | [Bulkhead](04-resiliencia-e-isolamento.md#bulkhead) |
| 26 | Cell-based architecture | [Arquitetura baseada em células](04-resiliencia-e-isolamento.md#celulas) |
| 27 | SPOF e disaster recovery | [SPOF e estratégias de DR](../fundamentals/12-resiliencia-migracao.md#spof-dr) |
| 28 | Observabilidade e monitoramento por célula | [Sinais de ouro, SLI e SLO](../fundamentals/08-observabilidade-troubleshooting.md#slo) |
| 29 | Orquestração e coreografia | [Orquestração e coreografia](03-fluxos-distribuidos.md#orquestracao) |

Para praticar, use as [perguntas de design](../../interview/simulations/03-system-design/design-questions.md).
