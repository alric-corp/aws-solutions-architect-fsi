# Fontes da trilha de troubleshooting

**Consulta documental realizada em 01/11/2026.** As páginas abaixo foram abertas e seus trechos pertinentes conferidos em fontes primárias. Não houve acesso a contas AWS nem execução de infraestrutura, protocolos ou migração. O [índice da trilha](../interview/simulations/04-troubleshooting/README.md) separa as aberturas da candidata dos materiais do instrutor.

Os seis incidentes, a progressão de evidências, as respostas exemplificadas e a rubrica são complementação autoral e fictícia. Fontes confirmam mecanismos dentro do escopo indicado; não comprovam valores sintéticos, resultados de testes narrados, vivências pessoais ou critérios de carreira. Os fundamentos existentes continuam sendo a base de revisão.

## Observabilidade e operação

| Fonte primária | O que foi conferido | Uso |
|---|---|---|
| [AWS Well-Architected — Operate](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/operate.html) | Resultados da jornada, referência, autoridade e comunicação | Guia e caso 1 |
| [Well-Architected — Responding to events](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/responding-to-events.html) | Responsáveis, escalonamento e análise posterior | Guia |
| [RDS — CloudWatch metrics](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html) | Significado e unidades de memória, swap, conexões e I/O | Casos 1 e 6 |
| [RDS — Enhanced Monitoring OS metrics](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Monitoring-Available-OS-Metrics.html) | Coleta gerenciada, memória e entrada/saída de swap | Caso 6 |
| [PostgreSQL 16 — Resource Consumption](https://www.postgresql.org/docs/16/runtime-config-resource.html#GUC-WORK-MEM) | Memória por operador, concorrência e limites de work_mem | Caso 6 |
| [PostgreSQL 16 — Error Codes](https://www.postgresql.org/docs/16/errcodes-appendix.html) | SQLSTATE 53200 corresponde a out_of_memory | Caso 6 |

## Transações, repetições e efeitos distribuídos

| Fonte primária | O que foi conferido | Uso |
|---|---|---|
| [Builders’ Library — Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Identificador de intenção, atomicidade e resultado equivalente | Caso 2 |
| [Versão PDF oficial do artigo](https://d1.awsstatic.com/builderslibrary/pdfs/making-retries-safe-with-idempotent-apis-malcolm-featonby.pdf) | Mesmo artigo, alternativa de leitura também consultada | Caso 2 |
| [Builders’ Library — Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) | Espera, recursos, efeitos incertos e amplificação por retries | Casos 1, 2 e 5 |
| [PostgreSQL 16 — COMMIT](https://www.postgresql.org/docs/16/sql-commit.html) | Confirmação da transação local | Caso 2 |
| [PostgreSQL 16 — INSERT](https://www.postgresql.org/docs/16/sql-insert.html) | Conflito de unicidade e ON CONFLICT sob concorrência | Caso 2 |
| [AWS Prescriptive Guidance — Transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) | Estado e intenção de publicação; possibilidade de duplicatas | Caso 2 |

## Rede privada e ferramentas

| Fonte primária | O que foi conferido | Uso |
|---|---|---|
| [VPC — Subnet route tables](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html) | Associação de tabela, rota local e escolha por prefixo | Caso 3 |
| [VPC — NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) | Caminho de saída por NAT público no desenho IPv4 escolhido | Caso 3A |
| [VPC — Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) | Controle com estado e retorno de conexão permitida | Caso 3 |
| [VPC — Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) | Controle sem estado, sentidos e precedência | Caso 3B |
| [VPC — Flow Logs](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html) | Observação de metadados de fluxo | Caso 3 |
| [VPC — Reachability Analyzer](https://docs.aws.amazon.com/vpc/latest/reachability/what-is-reachability-analyzer.html) | Análise de configuração e escopo de conectividade | Caso 3 |

## TLS, identidade e autorização

| Fonte primária | O que foi conferido | Uso |
|---|---|---|
| [ACM — Overview](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html) | Gestão de certificados e integração | Caso 4A |
| [ALB — Listener certificates](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/https-listener-certificates.html) | Associação ao listener, nome e seleção por SNI | Caso 4A |
| [IETF RFC 9525 — Service Identity in TLS](https://www.rfc-editor.org/rfc/rfc9525.html) | Verificação de identidade do serviço pelo cliente | Caso 4A |
| [ECS — Task IAM role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html) | Identidade do código distinta da execution role | Caso 4B |
| [IAM — Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) | Contexto, Allow, Deny e tipos de política | Caso 4B, com premissas delimitadas |
| [S3 — Troubleshoot 403](https://docs.aws.amazon.com/AmazonS3/latest/userguide/troubleshoot-403-errors.html) | Negação implícita/explícita e contexto do diagnóstico | Caso 4B |
| [S3 — VPC endpoint bucket policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies-vpc-endpoint.html) | Restrição por aws:SourceVpce | Caso 4B |
| [S3 — CloudTrail events](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cloudtrail-logging-s3-info.html) | Eventos de objeto precisam de coleta configurada | Caso 4B |

## RDS, migração e transferência de escrita

| Fonte primária | O que foi conferido | Uso |
|---|---|---|
| [RDS — Multi-AZ DB instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html) | Standby síncrono entre AZs e indisponibilidade para leitura | Casos 2 e 5 |
| [RDS — Failover](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.Failover.html) | DNS, conexões e cache da JVM; duração depende do contexto | Caso 5 |
| [RDS — Read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html) | Replicação assíncrona e propósito diferente do standby | Caso 5 |
| [DMS — Ongoing replication / CDC](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Task.CDC.html) | Full load + CDC, CDC-only e origem das alterações | Caso 6 |
| [DMS — PostgreSQL source](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.PostgreSQL.html) | Configuração de CDC e alternativa nativa em migração homogênea | Caso 6 |
| [DMS — PostgreSQL target](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Target.PostgreSQL.html) | Cópia por tabela, FKs e sequências | Caso 6 |
| [DMS — Best practices](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_BestPractices.html) | Planejamento, schema e objetos não criados automaticamente | Caso 6 |
| [DMS — Data validation](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html) | Escopo, chaves, pendências e custo de validação | Caso 6 |
| [Prescriptive Guidance — Cutover stage](https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-migration-cutover/cutover-stage.html) | Congelamento, sincronização e retorno após alteração de dados | Caso 6 |

## Limites e pendências

Não há fonte documental pendente para os mecanismos citados nesta trilha. A página Builders’ Library de timeouts redirecionou para o AWS Builder Center e foi consultada no destino oficial. URLs de documentação podem mudar; confira novamente antes de uso operacional.

Ficam **fora da validação executada**: comportamento de um runtime/driver real, compatibilidade de versões menores e configuração DMS de um ambiente, permissões reais, capacidade, duração de migração e resultados de carga/failover. São pré-condições para um eventual laboratório autorizado, não resultados obtidos neste trabalho. Consultas de fontes são distintas de testar a arquitetura em AWS.
