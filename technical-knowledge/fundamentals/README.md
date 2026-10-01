# Fundamentos para sustentar os cases

As notas já cobrem redes, armazenamento, dados, segurança, APIs e sistemas distribuídos. Esta trilha organiza a revisão e acrescenta exercícios. **São guias de estudo concisos**, não uma afirmação de que todos os tópicos serão cobrados, nem a substituição da documentação dos serviços.

| Módulo | Conteúdo | Aplicação nos cases |
|---|---|---|
| [Computação em nuvem e por que AWS](00-computacao-em-nuvem.md) | Definição de nuvem (NIST), modelos de serviço, responsabilidade compartilhada e benefícios | — |
| [Redes, DNS e conectividade híbrida](01-redes-dns-conectividade.md) | CIDR, TCP/UDP, DNS, versões do HTTP, rotas, latência, VPN, Direct Connect e MPLS | 02, 05, 09, 10 |
| [HTTP, REST, OpenAPI e borda](02-http-rest-openapi.md) | Contratos, métodos, stateless, erros, REST/RPC/gRPC, cache e CDN | 01, 02, 06 |
| [Segurança e identidade](03-seguranca-identidade.md) | Autenticação, autorização, TLS, IAM, segredos e proteção de dados | 02, 04, 06, 08 |
| [Computação e containers](04-computacao-containers.md) | EC2, Lambda, ECS, EKS, Fargate, balanceamento e ciclo de implantação | 01, 05, 07, 10 |
| [Armazenamento](05-armazenamento.md) | DAS, SAN, NAS, níveis de RAID, padrões de I/O, objetos, blocos e arquivos | 04, 05, 08 |
| [Bancos, transações e consistência](06-bancos-consistencia.md) | ACID, BASE, CAP, PACELC, isolamento, modelos de dados e indexação | 01, 03, 09, 10 |
| [Eventos e sistemas distribuídos](07-eventos-sistemas-distribuidos.md) | Fila, pub/sub, streaming, entrega e idempotência | 01, 03, 04, 07 |
| [Observabilidade e troubleshooting](08-observabilidade-troubleshooting.md) | Hipóteses, métricas, logs, traces, sinais de ouro, SLI/SLO e investigação de recursos | 01, 07, 09 |
| [Desempenho, capacidade e custos](09-performance-custos.md) | Latência, throughput, saturação, concorrência e custo unitário | 05, 07, 08, 09 |
| [Dados, analytics e IA](10-dados-analytics-ia.md) | Ciclo de vida, HDFS, lake, governança, ML e RAG | 06, 07, 08 |
| [Git, CI/CD e infraestrutura como código](11-git-cicd-iac.md) | Histórico, workflow, artefatos, identidade e rollback | 01, 05, 09 |
| [Resiliência, migração e Well-Architected](12-resiliencia-migracao.md) | HA, SPOF, DR, RTO/RPO, dependências, failover e migração | 05, 09, 10 |

Para os padrões que combinam esses fundamentos, veja [System Design](../system-design/README.md).

## Profundidade esperada no treino

Consiga definir sem jargão, dar um exemplo, explicar uma alternativa, reconhecer uma falha e indicar a medida necessária para validar a hipótese. Para serviços não operados, identifique o que é estudo e o que é experiência prática.

## Três níveis de resposta

**Fundamento:** por que uma repetição de mensagem pode ocorrer? **AWS:** como isso se manifesta em uma fila SQS? **Negócio:** o que impediria uma cobrança duplicada no nosso fluxo?

A ligação entre os níveis importa mais do que decorar um mapa “palavra da pergunta → nome do serviço”.

## Perguntas de entrevista

Os módulos 00, 01, 03, 04, 05, 06 e 12 têm uma seção com perguntas de entrevista sobre o tema. As de design arquitetural estão nas [perguntas de design](../../interview/simulations/03-system-design/design-questions.md). O mapa completo fica em [O que esperar da entrevista](../../interview/interview-process.md).

## Como acrescentar módulos

Use [o template técnico](../../templates/modulo-tecnico.md). Mantenha origem e revisão explícitas. Uma simplificação didática deve vir com seus limites. Não preencha uma lacuna de fonte como se tivesse sido dita no curso.

As correções de REST, ACID/BASE/CAP e outros pontos estão em [Revisões das anotações](../../referencias/revisoes-das-anotacoes.md).
