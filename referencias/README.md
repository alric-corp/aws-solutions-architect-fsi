# Referências e proveniência

> Revisão editorial: 28/09/2026; fontes S07 e T31–T36 acrescentadas e verificadas em 01/10/2026. Links de documentação podem mudar; confirme novamente antes da entrevista ou de um laboratório.

Este repositório mantém três camadas explícitas: **anotações privadas de estudo**, que não fazem parte do repositório; **fontes públicas**, listadas abaixo; e **conteúdo autoral**, que são as sínteses, os exercícios e os critérios dos módulos. Os exercícios, critérios de autoavaliação e tempos sugeridos não são uma rubrica oficial da Amazon.

Não redistribuímos transcrições nem material de terceiros. As anotações originais permanecem em armazenamento privado; aqui ficam apenas seus identificadores e temas, para rastrear a proveniência das sínteses. As correções relevantes estão em [Revisões das anotações](revisoes-das-anotacoes.md).

## Anotações privadas (fora do repositório)

<a id="n01"></a>
### N01 — Anotações de preparação para a entrevista

Seções utilizadas: objetivos; funções na nuvem; preparação de currículo; entrevista de Solutions Architect; Leadership Principles; STAR; comunicação; perguntas técnicas; simulações e checklist. Exemplos de terceiros não são experiências da candidata. As orientações de processo não foram promovidas a regras atuais.

<a id="n02"></a>
### N02 — Anotações sobre Leadership Principles e STAR

Seções utilizadas: os 16 princípios, perguntas de aprofundamento e contraste entre respostas genéricas e ações específicas. Marcações como `#1 Interview` são organização das notas, não atribuições confirmadas do loop atual. Traduções problemáticas foram registradas na revisão editorial.

<a id="n03"></a>
### N03 — Anotações de palestras e dicas de entrevista

Seções utilizadas: atuação com clientes, perguntas, prática em voz alta, decisões e recomendações de preparação. Relatos de número de entrevistas, idioma, prazo de resposta, uso de notas e tempo de fala pertencem aos relatos, não a uma regra universal. A inversão de one-way/two-way door foi explicitamente corrigida no registro editorial.

<a id="n04"></a>
### N04 — Anotações sobre ACID, BASE, CAP e sistemas distribuídos

Seções utilizadas: transações, consistência, granularidade, bases compartilhadas, comunicação síncrona/assíncrona e saga. Afirmações sobre SQL/NoSQL e isolamento foram revisadas com fontes primárias. As anotações terminam no título “Orquestração x coreografia”; a explicação complementar desta trilha é conteúdo acrescentado, não extraído de um trecho inexistente.

<a id="n05"></a>
### N05 — Anotações avulsas
Níveis de carreira, função de SA, mock técnico, perguntas a gestores e REST.

## Fontes oficiais e técnicas

As indicações abaixo delimitam o que cada fonte sustenta; um link não valida automaticamente todos os exemplos do repositório.


<a id="s01"></a>
### S01 — Vaga de Arquiteta de Soluções — FSI, Job ID 10457255

[Consultar a fonte](https://www.amazon.jobs/en/jobs/10457255/arquiteta-de-solucoes-vaga-para-mulheres-brazil-solutions-architect-fsi). Escopo consultivo, comunicação, aprendizagem e requisitos publicados; não confirma o nível L5 nem as condições da oferta.

<a id="s02"></a>
### S02 — Amazon Leadership Principles

[Consultar a fonte](https://www.amazon.jobs/content/en/our-workplace/leadership-principles). Nomes e conjunto dos 16 princípios. As fichas são sínteses autorais das anotações, não reprodução integral desta página.

<a id="s03"></a>
### S03 — Amazon — How We Hire

[Consultar a fonte](https://www.amazon.jobs/content/en/how-we-hire). Processo varia conforme a função. Não tratar detalhes de SDE como regras universais de SA.

<a id="s04"></a>
### S04 — Amazon — Interview Loop

[Consultar a fonte](https://amazon.jobs/content/en/how-we-hire/interview-loop). Preparação geral para entrevistas, perguntas comportamentais e STAR.

<a id="s05"></a>
### S05 — Amazon — Remote Interview

[Consultar a fonte](https://amazon.jobs/content/en/how-we-hire/remote-interview). Preparação logística e confirmação das orientações do processo.

<a id="s06"></a>
### S06 — AWS — Day 1 culture

[Consultar a fonte](https://aws.amazon.com/executive-insights/content/how-amazon-defines-and-operationalizes-a-day-1-culture/). Working backwards, decisões reversíveis/irreversíveis e princípios sem uma hierarquia universal.

<a id="s07"></a>
### S07 — Andy Jassy explica os Leadership Principles (vídeo)

[Consultar a fonte](https://www.youtube.com/watch?v=My-2-MyxamQ). “The Leadership Principles Explained by Amazon CEO Andy Jassy | Full Length Video”, publicado em 21/05/2024 pelo canal oficial Inside Amazon: vídeo completo (56:49) em que o CEO da Amazon comenta os 16 princípios. Os minutos citados nas seções “Como Andy Jassy explica” referem-se a este vídeo; as seções são sínteses autorais, não transcrição.

<a id="t01"></a>
### T01 — Fielding — REST architectural style

[Consultar a fonte](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm). Fonte primária para restrições REST e stateless.

<a id="t02"></a>
### T02 — HTTP Semantics — RFC 9110

[Consultar a fonte](https://httpwg.org/specs/rfc9110.html). Métodos, segurança/idempotência semântica e códigos HTTP.

<a id="t03"></a>
### T03 — OpenAPI Specification 3.1.1

[Consultar a fonte](https://spec.openapis.org/oas/v3.1.1.html). Versão fixada como referência de contrato; não é afirmação de versão mais recente.

<a id="t04"></a>
### T04 — DynamoDB — Transactions

[Consultar a fonte](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html). Contraexemplo concreto à associação exclusiva de ACID com SQL.

<a id="t05"></a>
### T05 — Eric Brewer — CAP Twelve Years Later

[Consultar a fonte](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/). Texto do autor do teorema, publicado na InfoQ; esclarece limites da fórmula escolha dois.

<a id="t06"></a>
### T06 — PostgreSQL — MVCC introduction

[Consultar a fonte](https://www.postgresql.org/docs/current/mvcc-intro.html). Concorrência por múltiplas versões, sem a regra de serializar toda transação.

<a id="t07"></a>
### T07 — PostgreSQL — Transaction isolation

[Consultar a fonte](https://www.postgresql.org/docs/current/transaction-iso.html). Níveis de isolamento e anomalias dependem do contrato.

<a id="t08"></a>
### T08 — Amazon VPC — How it works

[Consultar a fonte](https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html). Sub-redes, rotas e conectividade.

<a id="t09"></a>
### T09 — Direct Connect — Encryption in transit

[Consultar a fonte](https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html). Direct Connect não cifra o tráfego por padrão; distinguir IPsec e MACsec.

<a id="t10"></a>
### T10 — Amazon ECS clusters

[Consultar a fonte](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html). Cluster como agrupamento lógico de tarefas e serviços.

<a id="t11"></a>
### T11 — AWS storage services overview

[Consultar a fonte](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/storage-services.html). Objetos, blocos e arquivos; revalidar opções de produto antes de implementação.

<a id="t12"></a>
### T12 — IAM security best practices

[Consultar a fonte](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html). Identidades, credenciais temporárias e menor privilégio.

<a id="t13"></a>
### T13 — Git — gitignore

[Consultar a fonte](https://git-scm.com/docs/gitignore). Ignorar não remove arquivos já rastreados nem apaga histórico.

<a id="t14"></a>
### T14 — AWS Well-Architected Framework

[Consultar a fonte](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html). Revisão de decisões, riscos e trade-offs; não selo automático de conformidade.

<a id="t15"></a>
### T15 — CloudWatch agent

[Consultar a fonte](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html). Telemetria adicional de sistema operacional e logs depende de coleta/configuração.

<a id="t16"></a>
### T16 — Transactional outbox

[Consultar a fonte](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html). Estado e evento na mesma transação; publicador e consumidores ainda precisam tratar duplicatas.

<a id="t17"></a>
### T17 — Saga orchestration

[Consultar a fonte](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html). Compensações de negócio e ausência de isolamento ACID global automático.

<a id="t18"></a>
### T18 — Lake Formation — Underlying data access

[Consultar a fonte](https://docs.aws.amazon.com/lake-formation/latest/dg/access-control-underlying-data.html). Governar consultas integradas não elimina permissões diretas inadequadas no S3.

<a id="t19"></a>
### T19 — Git — About version control

[Consultar a fonte](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control). Versionamento, modelos distribuídos e rastreio de mudanças.

<a id="t20"></a>
### T20 — SQS standard queues

[Consultar a fonte](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html). Entrega pelo menos uma vez e possibilidade de ordem diferente.

<a id="t21"></a>
### T21 — SQS visibility timeout

[Consultar a fonte](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html). Visibilidade não é garantia de efeito financeiro único.

<a id="t22"></a>
### T22 — Apache Hadoop — HDFS design

[Consultar a fonte](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html). NameNode, DataNodes e desenho de armazenamento distribuído; a referência não transforma S3 em HDFS.

<a id="t23"></a>
### T23 — AWS — Disaster recovery options

[Consultar a fonte](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html). Backup/restore, pilot light, warm standby e múltiplos sites; escolher por requisitos.

<a id="t24"></a>
### T24 — GitHub Actions — OIDC in AWS

[Consultar a fonte](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws). Federação de identidade e restrição da trust policy do papel AWS.

<a id="t25"></a>
### T25 — IBM — SAN vs NAS

[Consultar a fonte](https://www.ibm.com/think/topics/san-vs-nas). Distinção entre interfaces de blocos e arquivos; não adotamos generalizações absolutas de desempenho entre categorias.

<a id="t26"></a>
### T26 — curl — manual oficial

[Consultar a fonte](https://curl.se/docs/manpage.html). Tempos write-out, timeout e opções de diagnóstico; verificar versão local antes de usar.

<a id="t27"></a>
### T27 — Brendan Gregg — USE Method

[Consultar a fonte](https://www.brendangregg.com/usemethod.html). Método do próprio autor: utilização, saturação e erros por recurso.

<a id="t28"></a>
### T28 — CloudFront — cache key

[Consultar a fonte](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html). Política que determina a chave de cache.

<a id="t29"></a>
### T29 — Application Load Balancer

[Consultar a fonte](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html). Papel de balanceamento e roteamento de aplicação.

<a id="t30"></a>
### T30 — Network Load Balancer

[Consultar a fonte](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html). Papel de balanceamento no caminho de transporte/conexão.

<a id="t31"></a>
### T31 — NIST SP 800-145 — The NIST Definition of Cloud Computing

[Consultar a fonte](https://doi.org/10.6028/NIST.SP.800-145). Cinco características essenciais e modelos de serviço usados no F00.

<a id="t32"></a>
### T32 — Amazon Builders' Library

[Consultar a fonte](https://builder.aws.com/learn/topics/builders-library). Página oficial da biblioteca, hoje no AWS Builder Center. Artigos sobre como a Amazon constrói e opera sistemas; leitura complementar de system design, incluindo fallback, estabilidade estática e shuffle sharding.

<a id="t33"></a>
### T33 — AWS Well-Architected — Reducing the Scope of Impact with Cell-Based Architecture

[Consultar a fonte](https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/reducing-scope-of-impact-with-cell-based-architecture.html). Arquitetura baseada em células e redução do raio de impacto (SD04).

<a id="t34"></a>
### T34 — AWS App Mesh — User Guide

[Consultar a fonte](https://docs.aws.amazon.com/app-mesh/latest/userguide/what-is-app-mesh.html). A AWS encerrou o suporte ao App Mesh em 30/09/2026, conforme o aviso de fim de suporte da documentação oficial consultada em 01/10/2026. Pelo aviso, o console e os recursos do App Mesh deixam de ficar acessíveis após essa data, e a página remete a um guia de migração para o Amazon ECS Service Connect. Por isso o material cita o App Mesh apenas como serviço descontinuado.

<a id="t35"></a>
### T35 — Istio — Architecture

[Consultar a fonte](https://istio.io/latest/docs/ops/deployment/architecture/). Documentação oficial do Istio, tecnologia de service mesh ativa considerada no material. A página descreve o data plane, com proxies Envoy implantados como sidecars ao lado dos serviços, e o control plane, que gerencia e configura esses proxies; base da seção de service mesh.

<a id="t36"></a>
### T36 — Netflix Hystrix — README

[Consultar a fonte](https://github.com/Netflix/Hystrix). Repositório oficial da Netflix. O próprio projeto declara que a Hystrix não está mais em desenvolvimento ativo e está em modo de manutenção (maintenance mode), e indica, para projetos novos, projetos abertos e ativos como a Resilience4j. Base da seção de circuit breaker.
