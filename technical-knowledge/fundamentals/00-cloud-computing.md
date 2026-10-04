# 00 — Computação em nuvem e por que AWS

**ID:** F00. **Base:** definição do NIST ([T31](../../references/README.md#t31)) e documentação pública da AWS sobre responsabilidade compartilhada, Auto Scaling e infraestrutura global. **Revisão técnica:** 04/10/2026; explicações, exemplos e critérios autorais apoiados nas fontes ao final.

**Objetivo:** explicar o que é nuvem com precisão técnica e linguagem executiva, separar os conceitos que costumam ser confundidos e conversar sobre “por que AWS” a partir do problema do cliente, não do catálogo.

## Roteiro de leitura

**Essencial:** definição → cinco características → nuvem × virtualização → escalabilidade × elasticidade → exemplo com Auto Scaling → responsabilidade compartilhada. Com isso você já sustenta a primeira conversa técnica.

**Aprofundamento:** modelos de serviço e de implantação, benefícios e limites, FSI e “por que AWS”. Termine pelas perguntas, sem abrir as respostas, e pelo exercício.

**Fronteiras:** F00 cria o vocabulário. Conectividade híbrida está em [F01](01-networking-dns-connectivity.md); identidade e proteção de dados, em [F03](03-security-identity.md); compute, ECS e Auto Scaling em profundidade, em [F04](04-compute-containers.md); desempenho e custo, em [F09](09-performance-costs.md); resiliência, RTO/RPO e migração, em [F12](12-resilience-migration.md); modernização do core com convivência híbrida, no [Case 05](../../cases/05-core-banking-modernization.md).

**Como ler as afirmações:** comportamento de produto vem com fonte; números dos exemplos são hipóteses didáticas, não medições. Nenhum recurso AWS foi provisionado para este módulo.

## Objetivos de aprendizagem

Ao terminar, você deve conseguir explicar, sem consulta:

- o que caracteriza cloud computing e por que “servidor de outra empresa” é insuficiente;
- por que virtualizar não basta para ter nuvem;
- a diferença entre scalability e elasticity, e entre vertical e horizontal scaling;
- os papéis de Launch Template, Auto Scaling group, scaling policy e health check num exemplo concreto;
- a responsabilidade compartilhada em serviços com níveis diferentes de abstração;
- os modelos de serviço e de implantação do NIST;
- benefícios da nuvem e o que cada um não garante;
- a diferença entre arquitetura híbrida (hybrid IT) e hybrid cloud no sentido do NIST, e quando cada uma aparece num banco;
- “por que AWS” para um problema de negócio, sem discurso comercial.

<a id="definicao"></a>
## O que é cloud computing

O NIST define cloud computing como um **modelo** para dar acesso pela rede, de forma conveniente e sob demanda, a um pool compartilhado de recursos computacionais configuráveis — redes, servidores, armazenamento, aplicações e serviços — que podem ser **provisionados e liberados rapidamente**, com mínimo esforço de gestão ou interação com o provedor. O modelo tem cinco características essenciais, três modelos de serviço e quatro modelos de implantação. [T31](../../references/README.md#t31)

Repare na palavra **modelo**: nuvem descreve como os recursos são fornecidos e consumidos, não onde fica o hardware. “O servidor de outra empresa” descreve hospedagem terceirizada, que pode não ter autoatendimento, medição nem elasticidade.

**VM no datacenter ≠ automaticamente cloud computing.** Virtualização é uma tecnologia habilitadora comum; o modelo de nuvem exige as características abaixo.

**Pergunta para treinar:** “Se eu virtualizar 500 servidores com VMware no meu datacenter, virei cloud?” Depende do modelo de operação, não do hypervisor. Se os times pedem VMs por ticket e esperam dias, a capacidade é fixa e ninguém mede consumo por consumidor, você tem virtualização. Se provisionam e liberam por API, a capacidade se ajusta e o uso é medido, você se aproxima de uma private cloud.

<a id="caracteristicas"></a>
## Cinco características essenciais

| Característica | Modelo mental | Exemplo | Não significa |
|---|---|---|---|
| On-demand self-service | O consumidor provisiona sozinho, sem interação humana com o provedor | Criar uma instância EC2 por console, CLI ou API | Ausência de governança: aprovações e guardrails podem existir como política automatizada |
| Broad network access | Recursos acessíveis pela rede, por mecanismos padrão, a partir de clientes variados | Consumir uma API por HTTPS de um app ou de um servidor | Exposição pública: o acesso pode ser privado, por VPC ou conexão dedicada |
| Resource pooling | Recursos do provedor atendem vários consumidores (multi-tenant), atribuídos e reatribuídos conforme a demanda; o consumidor geralmente não controla a localização exata, mas **pode** conseguir especificá-la em nível mais alto, como país ou datacenter, conforme a oferta do provedor | Escolher a Region; não escolher o servidor físico | Ausência de isolamento: compartilhar infraestrutura não é compartilhar dados |
| Rapid elasticity | Capacidade provisionada e liberada rapidamente, **em alguns casos automaticamente**, acompanhando a demanda | Aumentar instâncias num pico e liberá-las depois | “Auto Scaling automático” como definição; nem capacidade infinita sem quotas |
| Measured service | O uso é medido em alguma abstração adequada ao serviço e pode ser monitorado, controlado e reportado | Horas de instância, GB armazenados, requisições | Custo baixo: medir mostra o consumo, não o reduz |

[T31](../../references/README.md#t31)

**Atenção à elasticidade.** O NIST fala em provisionar e liberar rapidamente, “em alguns casos automaticamente”. Automação é uma implementação comum, não a definição inteira. O essencial é a capacidade acompanhar a necessidade nos dois sentidos — crescer e também ser liberada.

<a id="virtualizacao"></a>
## Nuvem ≠ virtualização

- **Virtualização** abstrai recursos computacionais: várias máquinas virtuais sobre um hardware físico.
- **Nuvem** é um modelo operacional e de consumo com autoatendimento, pool, medição e elasticidade. Pode usar virtualização por baixo, mas não se resume a ela.

| | Cenário A | Cenário B |
|---|---|---|
| Como se obtém um servidor | VMware + ticket manual | Requisição por API |
| Capacidade | Fixa, comprada para o pico | Ajustável para cima e para baixo |
| Medição | Nenhuma por consumidor | Consumo medido por recurso |
| Conclusão | Virtualização, ainda sem as características do modelo | Características de nuvem presentes |

O cenário A não está condenado: o mesmo ambiente pode evoluir para private cloud ao ganhar autoatendimento, medição e elasticidade. O ponto é que virtualizar, sozinho, não basta.

<a id="modelos-servico"></a>
## Modelos de serviço

O NIST define três modelos pela fronteira entre o que o consumidor controla e o que fica com o provedor:

| Modelo | O consumidor controla | O provedor controla | Exemplo conceitual |
|---|---|---|---|
| IaaS | Sistema operacional, armazenamento, aplicações e, de forma limitada, alguns componentes de rede | Infraestrutura subjacente | Amazon EC2: você escolhe a AMI e administra o sistema operacional convidado |
| PaaS | Aplicações implantadas e configurações do ambiente de hospedagem | Rede, servidores, sistema operacional e armazenamento subjacentes | Plataforma onde você implanta código sem gerir servidores |
| SaaS | Configurações limitadas da aplicação | Toda a pilha, incluindo a aplicação | E-mail corporativo na web |

[T31](../../references/README.md#t31)

**Cuidado com a classificação rígida.** Dizer “RDS = PaaS” como verdade universal esconde o que importa. Serviços gerenciados da AWS transferem **parcelas diferentes** da operação: no Amazon RDS, a AWS opera a infraestrutura e executa a manutenção do sistema operacional e do engine, mas você ainda decide janela, upgrades opcionais, acesso de rede, usuários do banco e criptografia. Para decidir uma arquitetura, pergunte “o que eu ainda opero e protejo?” em vez de “em qual caixa este serviço cabe?”.

<a id="modelos-implantacao"></a>
## Modelos de implantação

| Modelo | Definição curta (NIST) | Exemplo |
|---|---|---|
| Private cloud | Infraestrutura para uso exclusivo de uma organização; pode estar dentro ou fora das suas instalações e ser operada por ela ou por terceiros | Plataforma interna com autoatendimento e medição |
| Community cloud | Uso exclusivo de uma comunidade de organizações com preocupações comuns, como requisitos de segurança ou conformidade | Infraestrutura compartilhada por instituições de um mesmo setor |
| Public cloud | Infraestrutura aberta ao uso do público em geral, nas instalações do provedor | Regiões da AWS |
| Hybrid cloud | Composição de duas ou mais **infraestruturas de nuvem** distintas (private, community ou public) que continuam entidades separadas, ligadas por tecnologia que permite portabilidade de dados e aplicações | Private cloud corporativa integrada a uma public cloud |

[T31](../../references/README.md#t31)

**Hybrid IT × hybrid cloud.** Em FSI é frequente o core continuar on-premises enquanto novas capacidades vão para a AWS:

```text
Core / mainframe on-premises
            ↕
   conectividade híbrida      (rotas, nomes, segurança — F01)
            ↕
  novos serviços na AWS       (canais, APIs, analytics)
```

Isso é uma **arquitetura híbrida (hybrid IT)**: infraestrutura tradicional integrada à nuvem. Só é **hybrid cloud no sentido do NIST** se o lado on-premises também for uma infraestrutura de nuvem — por exemplo, uma private cloud com autoatendimento, pool, elasticidade e medição. Por isso a primeira pergunta é: **o ambiente on-premises satisfaz um modelo de nuvem?** Se não, fale em arquitetura híbrida; se sim, pode ser hybrid cloud, conforme a integração.

Em qualquer dos dois casos, híbrido não é “tenho um servidor local e uma conta AWS”. Precisa existir um **modelo de integração e uso** entre os ambientes: quem é a autoridade de cada dado, como as chamadas atravessam a fronteira, o que acontece quando a conexão falha. O [Case 05](../../cases/05-core-banking-modernization.md#s01) aplica isso a um core em mainframe; a rede está em [F01](01-networking-dns-connectivity.md) e no [Case 05, seção 13](../../cases/05-core-banking-modernization.md#s13).

<a id="escala"></a>
## Scalability × elasticity

| Conceito | Pergunta que responde | Exemplo AWS |
|---|---|---|
| Scalability | O sistema consegue aumentar ou reduzir capacidade para atender uma carga ou requisito? | O serviço suporta 4x o tráfego normal adicionando capacidade |
| Vertical scaling | Aumentamos ou reduzimos os recursos **de uma unidade**? | `t3.micro` → `t3.small` |
| Horizontal scaling | Aumentamos ou reduzimos a **quantidade** de unidades? | 2 instâncias EC2 → 8 instâncias EC2 |
| Elasticity | A capacidade é provisionada **e liberada** acompanhando a demanda, rapidamente e, quando apropriado, de forma automática? | 2 → 8 durante o pico → 2 depois |

- **2 → 8**, sozinho, demonstra uma mudança de escala horizontal.
- **2 → 8 → 2 acompanhando a demanda** é um bom exemplo de elasticidade usando scaling horizontal.

Elasticity não é sinônimo de horizontal scaling: um banco de dados que ajusta a capacidade por unidade de consumo pode ser elástico sem que você conte instâncias. E não é sinônimo de Auto Scaling group: o ASG é uma forma de implementá-la.

<a id="exemplo-asg"></a>
## Exemplo concreto: Internet Banking com EC2 Auto Scaling

```text
Caminho da requisição:

   Clientes
      ↓
   Application Load Balancer   (distribui tráfego)
      ↓
   Instâncias EC2

Gestão de capacidade, fora do caminho da requisição:

            Auto Scaling group
          Min 2 · Desired 2 · Max 10
                  gerencia
                     │
        ┌────────────┴────────────┐
        │                         │
      EC2 A                     EC2 B
        ▲                         ▲
        └─────── tráfego do ALB ──┘
```

O **ASG administra capacidade**: quantas instâncias existem e quais substituir. O **ALB distribui tráfego** entre elas. O ASG não é uma etapa da requisição.

**Cenário hipotético.** Num dia normal, 2 instâncias bastam. No dia de pagamento, a carga cresce: o grupo vai a 5, depois a 8. Passado o pico, volta a 4 e, depois, a 2.

| Componente | Pergunta que responde | Exemplos |
|---|---|---|
| Launch Template | **Como** uma nova instância deve nascer? | AMI, instance type, Security Groups, key pair, IAM role, user data; versionado |
| Auto Scaling group | **Quantas** instâncias manter, dentro de quais limites? | Min = 2, Desired = 2, Max = 10; subnets em várias AZs |
| Scaling policy | Precisamos de **mais ou menos** capacidade? | Manter a CPU média perto de 50% ou as requisições por instância perto de um alvo |
| Health check | **Esta** instância deve continuar sendo considerada saudável? | EC2 status checks (padrão); health check do load balancer, se ligado no grupo |

- **Min** e **Max** são limites: políticas de scaling não levam o Desired abaixo do mínimo nem acima do máximo.
- **Desired** é o número que o grupo tenta manter. Se uma instância termina ou é considerada unhealthy, o grupo lança outra para voltar ao Desired.

[Limites do ASG][f00-asg-limits], [Launch Templates][f00-lt], [health checks][f00-health-overview]

**Não misture as duas perguntas:**

```text
Scaling policy → “a carga pede mais ou menos capacidade?”   → muda o Desired
Health check   → “esta instância deve continuar no grupo?”  → substitui a instância
```

CPU alta pode alimentar a decisão de scaling. Uma instância unhealthy dispara substituição, não scale-out. O health check do load balancer só é considerado pelo ASG quando você o liga no grupo; por padrão, o grupo usa os status checks do EC2. [Health checks][f00-health-overview]

<a id="vertical-asg"></a>
### Vertical scaling dentro de um ASG

```text
Launch Template v1 → t3.micro
Launch Template v2 → t3.small
```

Criar a v2 e apontar o grupo para ela **não muda as instâncias que já estão rodando**: só as novas nascem com a configuração atualizada. Para levar a frota existente à v2, é preciso uma operação de atualização, como o **Instance Refresh**, que substitui as instâncias gradualmente. Estratégias de troca e deploy estão em [F04](04-compute-containers.md) e [SD05](../system-design/05-scale-capacity-deployment.md#deployment). [update-auto-scaling-group][f00-update-asg], [Instance Refresh][f00-instance-refresh]

<a id="politicas"></a>
### Target tracking × limiar simples

“CPU > 70% → adiciona uma instância” é uma regra de limiar. Funciona, mas exige definir quanto adicionar e quando remover. O **target tracking** inverte a lógica: você escolhe uma métrica e um alvo — por exemplo, CPU média ≈ 50% — e o serviço calcula quanto adicionar ou remover para manter a métrica perto do alvo, como um termostato. [Target tracking][f00-tt]

CPU não é sempre a métrica certa. A AWS pede uma métrica que descreva quão ocupada está cada instância e varie proporcionalmente à quantidade de instâncias; latência e o total de requisições do load balancer não servem para target tracking, enquanto requisições **por target** servem. Um serviço que espera I/O pode estar saturado com CPU baixa. O aprofundamento está em [F04](04-compute-containers.md#auto-scaling).

### Elasticidade não é só EC2

O ASG é ótimo para **visualizar** elasticidade, mas não é a definição dela. Outros serviços oferecem elasticidade de outras formas: ECS ajusta o número de tasks, Lambda ajusta execuções simultâneas, DynamoDB oferece modos de capacidade que acompanham o uso e EKS ajusta pods e nós. Cada um tem mecanismos e limites próprios; não generalize o comportamento de um para os outros.

<a id="dependencias"></a>
### A aplicação inteira ficou elástica?

Depois do 2 → 8 → 2, pergunte: **a aplicação inteira ficou elástica?** Não necessariamente. Mais instâncias **podem** significar mais conexões, mais pressão no banco, mais chamadas a terceiros, mais consumo de quotas e mais concorrência sobre os mesmos dados. A relação não é automática: 4x requisições na borda não são necessariamente 4x TPS no core. Depende do perfil da workload, de cache, pools de conexão, agrupamento de chamadas, throttling, rate limits, retries e de quantas operações chegam de fato à dependência. Um cache reduz a carga a jusante, mas, se ficar frio ou indisponível, a dependência pode receber o tráfego inteiro. [Caching na Builders' Library][f00-bl-caching]

```text
Compute escala
      ↓
dependência não escala   (banco, core, terceiro, quota)
      ↓
novo gargalo
```

O compute ficou elástico; a jornada só fica elástica se cada dependência acompanhar ou for protegida. Investigação em [F04](04-compute-containers.md#auto-scaling); consistência e banco em [F06](06-databases-transactions-consistency.md); concorrência e custo em [F09](09-performance-costs.md#concorrencia).

<a id="responsabilidade"></a>
## Responsabilidade compartilhada

A AWS responde pela segurança **da** nuvem: a infraestrutura de hardware, software, rede e instalações que executa os serviços. O cliente responde pela segurança **na** nuvem: dados, aplicações, identidades e configurações. Esse é o slogan; o trabalho de SA começa depois dele, porque **a divisão muda conforme o serviço**. [Shared Responsibility Model][f00-srm]

Para três serviços com abstrações diferentes, de forma simplificada:

| Camada | Amazon EC2 | Amazon RDS | AWS Lambda |
|---|---|---|---|
| Datacenter, hardware, rede física | AWS | AWS | AWS |
| Virtualização e host | AWS | AWS | AWS |
| Sistema operacional | **Cliente**, incluindo patches | Compartilhada: a AWS executa as atualizações; o cliente agenda a janela e aplica as opcionais | Runtime gerenciado: AWS, no ambiente de execução. Container image: o cliente responde pelos componentes empacotados na imagem, incluindo a base |
| Runtime ou engine | **Cliente** instala e atualiza | Compartilhada: engine gerenciado; versões e upgrades com escolhas do cliente | Compartilhada, conforme o modo: **Auto**, a AWS publica e aplica as atualizações; **Function update**, aplicadas quando o cliente atualiza a função; **Manual**, o cliente decide quando migrar. Container image: o cliente reconstrói a partir da base atualizada, publica a imagem e atualiza a função para usá-la |
| Código e dependências | Cliente | Cliente: schema, consultas, aplicação que acessa | Cliente |
| Rede e exposição | Cliente: Security Groups, subnets | Cliente: Security Groups, acesso público ou não | Cliente: configuração de VPC quando usada; quem pode invocar |
| Identidade e permissões | Cliente: IAM e acesso ao sistema operacional | Cliente: IAM e usuários do banco | Cliente: IAM da função e de quem a chama |
| Dados | Cliente: classificação, criptografia, retenção, backup | Cliente: classificação, criptografia, retenção; backups automáticos configurados pelo cliente | Cliente: classificação, criptografia, segredos |

[Shared Responsibility Model][f00-srm], [segurança no RDS][f00-rds-security], [manutenção do RDS][f00-rds-maintenance], [runtime do Lambda][f00-lambda-runtime], [responsabilidade no runtime do Lambda][f00-lambda-shared]

Três leituras da tabela:

1. **Não é binário.** A própria AWS descreve controles compartilhados: ela corrige a infraestrutura, o cliente corrige o sistema operacional convidado e as aplicações; ambos treinam suas equipes. Algumas linhas dependem da configuração escolhida.
2. **Quanto mais gerenciado, menor a parcela operacional do cliente** — não a responsabilidade sobre o que importa ao negócio.
3. **Identidade, configuração segura, classificação e acesso aos dados e o código do cliente continuam com o cliente** em todos os casos. A AWS fornece os mecanismos; usá-los corretamente é decisão de quem constrói.

Aprofundamento de identidade e proteção de dados em [F03](03-security-identity.md).

<a id="beneficios"></a>
## Benefícios e o que eles não garantem

| Benefício | Mecanismo | Valor potencial | O que não garante sozinho |
|---|---|---|---|
| Custo variável | Pagamento pelo uso medido, sem compra antecipada de capacidade | Trocar investimento antecipado por despesa proporcional ao consumo | Custo menor: recurso ocioso continua custando, e arquitetura ruim custa caro |
| Elasticidade | Provisionar e liberar capacidade conforme a demanda | Atender picos sem dimensionar tudo para o pior dia | Escala da aplicação: estado, banco, terceiros e quotas podem limitar |
| Velocidade e agilidade | Recursos por API, ambientes descartáveis | Experimentos baratos e ambientes em minutos | Produto em produção em minutos: processo, testes e aprovações continuam valendo |
| Alcance global | Regions e Availability Zones em vários países | Latência menor e opções de isolamento de falhas | Resiliência: a workload precisa ser desenhada para usar várias AZs ou Regions |
| Capacidades de segurança gerenciadas | Criptografia, gestão de chaves, logs de auditoria, certificações do provedor | Controles maduros sem construí-los do zero | Dados protegidos: configuração, acesso e classificação são do cliente |
| Serviços gerenciados | O provedor opera parte da pilha | Menos trabalho operacional indiferenciado | Ausência de operação: monitorar, configurar, testar e responder a incidentes continuam |

Uma Availability Zone é um ou mais datacenters discretos, com energia, rede e conectividade redundantes, dentro de uma Region; as AZs de uma Region são separadas para evitar falhas correlacionadas. Isso dá à arquitetura **domínios de falha** para usar — não torna uma workload resiliente por existir. [Availability Zones][f00-azs]

<a id="nao-garante"></a>
## O que a nuvem não garante

- **Cloud ≠ menor custo automaticamente.** Custo depende de dimensionamento, uso, arquitetura e governança; lift-and-shift superdimensionado pode custar mais.
- **Cloud ≠ high availability automaticamente.** Uma instância numa AZ continua sendo um ponto único de falha.
- **Cloud ≠ segurança automática.** Um bucket mal configurado é responsabilidade do cliente.
- **Cloud ≠ aplicação escalável.** Estado local, banco único e dependências síncronas continuam limitando.
- **Cloud ≠ disaster recovery.** DR exige uma estratégia compatível com RTO/RPO — com backups e/ou replicação, conforme a estratégia —, dados recuperáveis, procedimento e teste ([F12](12-resilience-migration.md), [T23](../../references/README.md#t23)).
- **Cloud ≠ cloud-native.** Estar na nuvem não significa aproveitar o que ela oferece.
- **Cloud ≠ ausência de operação.** Alguém continua monitorando, corrigindo, atualizando e respondendo a incidentes.

<a id="cloud-native"></a>
## Cloud-native

Cloud-native não é sinônimo de microservices, containers ou serverless. O termo costuma descrever sistemas que **aproveitam as características e práticas da nuvem**: infraestrutura automatizada e reproduzível, elasticidade, observabilidade, recuperação desenhada para falhas, serviços gerenciados e desacoplamento quando ele faz sentido.

Um **lift-and-shift** de uma VM para EC2 está na nuvem, mas não é automaticamente cloud-native. Pode ser um primeiro passo legítimo — sair de um datacenter com prazo, por exemplo —, desde que ninguém confunda a mudança de endereço com a mudança de modelo. Decomposição e padrões de serviço estão em [SD01](../system-design/01-service-architecture.md).

<a id="fsi"></a>
## Nuvem em FSI

Para bancos e instituições de pagamento, os argumentos costumam vir de necessidades reais:

| Necessidade | Exemplo |
|---|---|
| Picos previsíveis e imprevisíveis | Início de mês, dia de salário, Black Friday, Pix em datas comemorativas |
| Velocidade de produto | Onboarding digital, novos canais, campanhas |
| Dados e analytics | Detecção de fraude, modelos de risco, data lake |
| Continuidade | Operar com perda de uma AZ; recuperar de falha regional |
| Segurança e auditoria | Controles verificáveis, trilhas de auditoria, gestão de chaves |
| Governança | Contas, permissões e guardrails para muitos times |
| Localização de dados | Onde os dados podem residir e ser processados, quando houver requisito |
| Legado | Core e mainframe que continuam on-premises durante anos |

A conversa muda quando entram exigências regulatórias de contratação de nuvem, residência de dados e continuidade de negócio. Por isso, **primeiro discovery, depois arquitetura**. Perguntas que uma SA faria:

- Qual jornada estamos modernizando, e por quê?
- Qual SLO a jornada precisa cumprir?
- Quais RTO e RPO? ([F12](12-resilience-migration.md))
- Há dependência do mainframe ou do core? Ele pode mudar agora?
- Existem requisitos de residência ou localização dos dados?
- Quais dados entram, com qual classificação?
- Qual o crescimento esperado e qual o perfil de pico?
- Qual o custo atual, com que composição?
- Qual a capacidade operacional do time para operar o que será construído?

<a id="por-que-aws"></a>
## Por que AWS?

Respostas como “porque é líder”, “porque tem mais serviços” ou “porque é mais segura” não respondem ao cliente: falam da AWS, não do problema dele. Uma resposta consultiva segue quatro passos:

1. **Entender o problema:** qual resultado de negócio, qual jornada, quais restrições.
2. **Conectar requisitos a capacidades:** pico de 4x pede elasticidade; continuidade pede várias AZs e um plano de recuperação; auditoria pede trilhas e controles verificáveis.
3. **Explicar trade-offs:** o que muda na operação, o que exige novas competências, o que continua no legado, onde está o custo.
4. **Validar o resultado:** prova de conceito, métricas de sucesso combinadas antes, teste de carga e de falha.

A ideia central: a AWS pode fornecer infraestrutura global, elasticidade, automação, serviços gerenciados e mecanismos de segurança e governança, mas **o valor depende de como essas capacidades atendem os requisitos da workload**.

**Estrutura de resposta para um executivo (cerca de 45–60 segundos) — um roteiro, não um texto para decorar:**

> *Problema:* “Pelo que entendi, o desafio é atender o pico do início do mês sem manter o ano inteiro uma capacidade dimensionada para esse dia, e lançar produtos mais rápido.”
> *Capacidade:* “Na nuvem, a capacidade pode crescer no pico e ser liberada depois, e os ambientes são criados por automação. A AWS oferece isso com várias zonas de disponibilidade por região e serviços que reduzem a operação de infraestrutura.”
> *Trade-off:* “Isso não reduz custo nem aumenta disponibilidade sozinho: depende de arquitetura, governança e de o core acompanhar a carga. Parte do legado continua onde está por um tempo.”
> *Validação:* “Proponho começar por uma jornada, com metas de desempenho e custo combinadas, e medir antes de ampliar.”

<a id="armadilhas"></a>
## Armadilhas comuns

| Atalho perigoso | Formulação melhor |
|---|---|
| “Nuvem é o datacenter de outra empresa” | Nuvem é um modelo de fornecimento e consumo com cinco características |
| “Virtualizei, então tenho nuvem” | Virtualização habilita; sem autoatendimento, medição e elasticidade, não é o modelo |
| “Elasticity é Auto Scaling” | Elasticidade é provisionar e liberar acompanhando a demanda; Auto Scaling é uma implementação |
| “Scalability e elasticity são a mesma coisa” | Scalability é conseguir mudar a capacidade; elasticity é mudá-la acompanhando a demanda, nos dois sentidos |
| “Vertical scaling é aumentar a quantidade” | Vertical muda o tamanho da unidade; horizontal muda a quantidade |
| “Health check dispara o scale-out” | Health decide se a instância fica; a scaling policy decide a capacidade |
| “Mais EC2, aplicação elástica” | Compute elástico; dependências podem virar o novo gargalo |
| “AWS é sempre mais barata” | Pode reduzir custo, conforme uso, arquitetura e governança |
| “Duas AZs disponíveis, aplicação HA” | AZs são domínios de falha disponíveis; HA depende de usá-los e de testar |
| “RDS = PaaS, ponto” | Serviços gerenciados transferem parcelas diferentes de operação; pergunte o que você ainda opera |
| “Estou na nuvem, logo sou cloud-native” | Cloud-native é aproveitar as práticas da nuvem, não o endereço |

<a id="perguntas"></a>
## Perguntas de entrevista

Responda em voz alta antes de abrir. Uma boa resposta mostra modelo mental, discovery, decisão, trade-off e validação.

### 1. O que caracteriza cloud computing?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

É um modelo de fornecimento e consumo de recursos computacionais pela rede, com cinco características: autoatendimento sob demanda, acesso amplo pela rede, pool de recursos, elasticidade rápida e serviço medido. A definição fala de **como** se consome, não de onde fica o hardware. Dou um exemplo de cada uma e digo o que ela não significa — por exemplo, medição não é custo baixo.

### Follow-up

“Um provedor de hospedagem que entrega servidores dedicados por contrato anual é nuvem?” Depende. Hardware dedicado e compromisso comercial anual não provam, sozinhos, a ausência das características. Investigo: há autoatendimento? Há pool de recursos? Dá para provisionar e liberar capacidade rapidamente? O uso é medido? O acesso é pela rede por mecanismos padrão? Qual é o modelo operacional? Lembre que serviço medido não exige cobrança pay-per-use direta: o NIST diz que a medição é *tipicamente* usada para cobrar pelo uso, não obrigatoriamente.

### O que observar

- Fala em modelo, não em “servidor de outra empresa”.
- Investiga as características antes de concluir, em vez de julgar pelo contrato.
- Cita as cinco características com exemplo, sem decorar a lista.

</details>

### 2. Virtualização e cloud são a mesma coisa?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

Não. Virtualização abstrai hardware em máquinas virtuais; nuvem é um modelo operacional com autoatendimento, pool, medição e elasticidade. Virtualização costuma estar por baixo, mas 500 VMs pedidas por ticket, com capacidade fixa e sem medição, são virtualização. O mesmo ambiente pode virar private cloud se ganhar as características do modelo.

### Follow-up

“O que você mudaria primeiro para esse ambiente se aproximar de nuvem?” Começaria pelas características ausentes, uma a uma. Autoatendimento por API facilita provisionar e operar; guardrails ajudam a governança; medição é outra característica do modelo. Elasticidade é uma característica distinta: avalio se a capacidade pode ser provisionada e liberada rapidamente, acompanhando a demanda, sem tratar API ou medição como pré-condição dela.

### O que observar

- Não condena o ambiente on-premises por definição.
- Responde pelas características, não pela tecnologia.

</details>

### 3. Temos Min=2, Desired=2, Max=10. A política aumenta o grupo de 2 para 8 durante um pico e depois volta para 2. O que é scalability e o que é elasticity nesse cenário?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

O sistema ser capaz de ir de 2 para 8 instâncias mostra scalability, por scaling horizontal. Ajustar a capacidade conforme a demanda e liberá-la depois — 2 → 8 → 2 — é elasticity, implementada com scaling horizontal. O Max = 10 delimita até onde a elasticidade pode ir; o Min = 2 garante a base.

### Follow-up

“Se alguém aumentar manualmente de 2 para 8 e nunca reduzir?” O sistema escalou, mas não se comportou de forma elástica: a capacidade não acompanha a demanda nem é liberada. Automação não é a única condição — um ajuste manual rápido, nos dois sentidos, ainda seria elástico —, mas sem liberar capacidade fica só o custo.

### O que observar

- Separa a mudança de escala do comportamento de acompanhar a demanda.
- Não define elasticidade como “ter Auto Scaling”.

</details>

### 4. Explique vertical e horizontal scaling com exemplos AWS. Quando cada um faz sentido?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

Vertical muda o tamanho da unidade: `t3.micro` → `t3.small`. É simples e não exige que a aplicação rode em várias cópias, mas tem teto e mantém uma unidade única. Horizontal muda a quantidade: 2 → 8 instâncias atrás de um load balancer. Fica mais simples quando a aplicação não depende de estado local — ausência de estado facilita escalar e substituir instâncias —, mas isso não é requisito universal: com estado local, é preciso uma estratégia para ele. Também exige dependências que acompanhem, e permite distribuir por AZs. Para um banco de dados relacional com uma instância de escrita, vertical costuma ser o primeiro passo; para uma camada web sem estado, horizontal.

### Follow-up

“A aplicação guarda sessão em memória. Dá para escalar horizontalmente?” Dá, desde que eu responda **onde está o estado e como ele sobrevive à substituição e à redistribuição**. Sem afinidade configurada, requisições do mesmo usuário podem chegar a instâncias diferentes e encontrar estados diferentes. Com sticky sessions, o usuário fica preso a uma instância e perde a sessão se ela sair. Opções: externalizar o estado, replicá-lo, usar sticky sessions quando a perda for tolerável, particionar a afinidade ou usar armazenamento compartilhado, conforme o caso. [Statelessness no Well-Architected][f00-wa-stateless], [sticky sessions][f00-alb-sticky]

### O que observar

- Associa horizontal a requisitos da aplicação, não só à infraestrutura.
- Pergunta onde está o estado em vez de exigir stateless absoluto.
- Reconhece limites do vertical.

</details>

### 5. Qual o papel de Launch Template, Auto Scaling group, scaling policy e health check?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

Launch Template define **como** uma instância nasce: AMI, tipo, Security Groups. O ASG define **quantas** manter, entre Min e Max, tentando sempre o Desired. A scaling policy decide **se** precisamos de mais ou menos capacidade, ajustando o Desired. O health check decide se **esta** instância continua no grupo; se não, ela é substituída.

### Follow-up

“Uma instância ficou unhealthy. Isso significa que a aplicação está com muito tráfego e precisa de scale-out?” Não. São perguntas diferentes: unhealthy leva à substituição daquela instância; carga alta pode alimentar a scaling policy. Uma instância pode falhar por disco, processo travado ou configuração, com tráfego baixo.

### O que observar

- Mantém as quatro responsabilidades separadas.
- Não usa health check como gatilho de escala.

</details>

### 6. Criei uma nova versão do Launch Template trocando `t3.micro` por `t3.small`. As instâncias existentes mudaram?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

Não. Associar uma nova versão ao grupo afeta só as instâncias que nascerem depois; as existentes continuam com a configuração com que foram lançadas. Para levar a frota à nova versão, uso uma operação de atualização como o Instance Refresh, que substitui as instâncias gradualmente mantendo um percentual saudável.

### Follow-up

“E se o grupo escalar durante a troca?” Instâncias novas nascem com a configuração em vigor; durante um Instance Refresh com configuração desejada, nascem com a nova. Isso cria um período com duas versões convivendo, que a aplicação precisa tolerar.

### O que observar

- Separa registrar a configuração de aplicá-la à frota.
- Reconhece convivência de versões durante a troca.

</details>

### 7. A nuvem sempre reduz custo?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

Não. Ela troca investimento antecipado por pagamento pelo uso e permite liberar capacidade ociosa. Custo cai quando a arquitetura aproveita isso: dimensionamento correto, elasticidade, desligar o que não se usa, escolher o modelo de compra adequado. Uma migração lift-and-shift que replica servidores superdimensionados 24x7 pode custar mais. Comparo pelo custo total e por unidade de valor, não pela fatura isolada ([F09](09-performance-costs.md)).

### Follow-up

“O CFO quer um número de economia antes de começar.” Apresento uma estimativa com premissas explícitas — carga, preços, região, data — e proponho medir uma jornada piloto antes de extrapolar.

### O que observar

- Não promete economia.
- Fala em premissas e medição.

</details>

### 8. Como a responsabilidade compartilhada muda entre EC2 e um serviço gerenciado como RDS ou Lambda?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

A AWS sempre cuida da segurança da nuvem: instalações, hardware, virtualização. No EC2, o cliente cuida do sistema operacional convidado e seus patches, do que instala e da configuração de rede. No RDS, a AWS executa a manutenção do sistema operacional e do engine, mas o cliente decide janela e upgrades opcionais, acesso de rede, usuários e criptografia. No Lambda com runtime gerenciado, a AWS publica as atualizações do runtime e as aplica no modo Auto; no modo Function update, elas entram quando o cliente atualiza a função; no Manual, o cliente decide quando migrar. Com container image, a AWS publica bases atualizadas, mas o cliente reconstrói a imagem, publica e atualiza a função. Em todos, identidade, configuração, dados e código continuam com o cliente.

### Follow-up

“Se o RDS é gerenciado, um banco exposto à internet é culpa da AWS?” Não. Acesso público e Security Groups são configuração do cliente.

### O que observar

- Não para no slogan “da nuvem / na nuvem”.
- Reconhece responsabilidades compartilhadas e dependentes de configuração.

</details>

### 9. Temos duas instâncias EC2 numa região. Isso é high availability?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

Não necessariamente. Primeiro: estão em AZs diferentes? Duas instâncias na mesma AZ caem juntas com ela. Depois: uma sozinha aguenta a carga? O load balancer e as dependências — banco, cache, NAT — também estão distribuídos? A Region oferece AZs como domínios de falha; HA é usar esses domínios no desenho e provar com teste. RTO e RPO definem o quanto é suficiente ([F12](12-resilience-migration.md)).

### Follow-up

“E se estiverem em duas AZs, mas o banco tiver uma única instância?” O banco continua sendo ponto único de falha; a jornada não é HA.

### O que observar

- Pergunta por AZ, capacidade e dependências.
- Não confunde AZs disponíveis com aplicação resiliente.

</details>

### 10. Fizemos lift-and-shift das VMs para EC2. Somos cloud-native?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

Estamos na nuvem, mas não necessariamente cloud-native. Cloud-native é aproveitar práticas como automação, elasticidade, observabilidade, recuperação desenhada e serviços gerenciados. Lift-and-shift pode ser um primeiro passo legítimo — sair de um datacenter com prazo —, e depois evoluir por jornada, onde houver retorno.

### Follow-up

“Então precisamos reescrever tudo em microservices?” Não. Decomposição se justifica por domínio, times e escala; muitas vezes o ganho vem antes de automação, observabilidade e serviços gerenciados.

### O que observar

- Não define cloud-native como “containers e microservices”.
- Trata lift-and-shift como etapa, não como erro.

</details>

### 11. Quando uma arquitetura híbrida faz sentido para um banco? Isso é hybrid cloud?

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

Quando parte da operação continua on-premises — tipicamente o core ou o mainframe — e novas capacidades vão para a nuvem, integradas a ele. Antes de rotular, pergunto se o ambiente on-premises é infraestrutura tradicional ou uma private cloud: mainframe tradicional + AWS é arquitetura híbrida (hybrid IT); hybrid cloud, no sentido do NIST, exige duas infraestruturas de nuvem integradas. Em ambos os casos, não basta coexistir: é preciso um modelo de integração, com autoridade de dados definida, conectividade adequada e comportamento conhecido quando a ligação falha. Antes de desenhar, pergunto: quais dados cruzam a fronteira, com que latência e volume, quem é a autoridade, o que acontece se o link cair ([Case 05](../../cases/05-core-banking-modernization.md)).

### Follow-up

“A conectividade com o datacenter caiu. Os serviços na AWS continuam?” Depende do desenho: consultas com cópia local podem seguir; operações que precisam do core devem falhar de forma controlada, sem criar efeito duplicado.

### O que observar

- Distingue hybrid IT de hybrid cloud do NIST antes de classificar.
- Define o híbrido pela integração, não pela coexistência.
- Pergunta por autoridade de dados e falha da conexão.

</details>

### 12. Explique nuvem e por que AWS para um executivo, em um minuto.

<details>
<summary><strong>Ver resposta comentada</strong></summary>

### Resposta esperada

Siga a estrutura problema → capacidade → trade-off → validação. Comece pelo problema do executivo, não pela AWS. Conecte uma ou duas capacidades ao problema — elasticidade para o pico, várias AZs para continuidade, serviços gerenciados para velocidade. Diga o que não vem de graça: custo e disponibilidade dependem de arquitetura e governança, e parte do legado fica. Feche com um passo verificável: uma jornada piloto com metas combinadas.

### Follow-up

“Por que AWS e não outro provedor?” Volto aos requisitos: quais capacidades, regiões, serviços e competências do time atendem esta workload, e como vamos medir. Não respondo com ranking.

### O que observar

- Começa pelo problema e termina em validação.
- Não promete economia nem disponibilidade automáticas.
- Não usa “líder de mercado” como argumento.

</details>

<a id="exercicio"></a>
## Exercício final

**Simulação de mesa, sem provisionamento.** Internet Banking de um banco fictício.

**Hoje:** 2 instâncias EC2, carga previsível e um processo manual para aumentar capacidade.

**Novo requisito:** pico de 4x no início do mês; depois, o tráfego volta ao normal.

Proponha, em uma página:

1. Vertical ou horizontal? Por quê?
2. Como a elasticidade acontece: o que cresce, o que é liberado e quando?
3. O que vai no Launch Template.
4. Min, Desired e Max, com a justificativa de cada número. Por exemplo: se 2 instâncias atendem a carga normal e a capacidade por instância se mantém, 4x sugere cerca de 8 no pico — uma hipótese a validar em teste.
5. Qual scaling policy e qual métrica, e por que ela representa a pressão sobre a capacidade.
6. Qual health check, e por que ele não é a scaling policy.
7. Quais dependências podem virar gargalo quando o compute escalar. Estime quanto da carga de 4x chega de fato ao core, declare as premissas (cache, pools, retries, proporção de operações que vão ao core) e diga como mediria e validaria essa estimativa.
8. Qual evidência prova que funcionou: teste de carga, métrica da jornada, capacidade liberada depois do pico.

**Mudança de requisito:** “O core bancário on-premises não pode migrar agora.”

- Isso impede a adoção de nuvem?
- O ambiente on-premises é infraestrutura tradicional ou private cloud? Portanto, é arquitetura híbrida (hybrid IT) ou hybrid cloud no sentido do NIST?
- Qual integração precisa existir entre os ambientes?
- O que precisa ser descoberto antes de desenhar a integração: volume e latência das chamadas ao core, autoridade dos dados, comportamento na falha da conectividade e limites do core diante da carga que realmente chega a ele.

Não é preciso detalhar rede ou arquitetura completa; [F01](01-networking-dns-connectivity.md) e o [Case 05](../../cases/05-core-banking-modernization.md) aprofundam.

**Critérios observáveis:**

- diferencia scalability de elasticity;
- separa vertical de horizontal;
- não usa health check como scaling policy;
- não assume que o compute é o único gargalo, nem que 4x na borda é 4x no core: estima a carga propagada com premissas e propõe medi-la;
- reconhece a liberação da capacidade depois do pico;
- reconhece a arquitetura híbrida quando o legado permanece, sem chamá-la automaticamente de hybrid cloud;
- pergunta por requisitos antes de escolher serviços;
- não promete economia nem HA automáticas.

<a id="checklist"></a>
## Checklist de domínio

Sem consulta, você consegue explicar:

- [ ] nuvem × virtualização;
- [ ] as cinco características do NIST, com exemplo e o que não significam;
- [ ] IaaS, PaaS e SaaS, e por que serviços gerenciados não cabem em caixas rígidas;
- [ ] public, private, community e hybrid, e hybrid cloud × hybrid IT;
- [ ] scalability × elasticity;
- [ ] vertical × horizontal;
- [ ] Launch Template;
- [ ] Min, Desired e Max num ASG;
- [ ] scaling policy;
- [ ] health check e por que não é gatilho de escala;
- [ ] responsabilidade compartilhada em EC2, RDS e Lambda;
- [ ] por que a nuvem não garante HA nem custo menor;
- [ ] arquitetura híbrida em FSI;
- [ ] por que AWS, sem marketing.

<a id="fontes"></a>
## Fontes primárias desta revisão

Consultadas em **04/10/2026**. Documentação AWS muda; revalide antes de um laboratório ou de uma recomendação a cliente.

| Afirmação | Fonte |
|---|---|
| Definição, cinco características (incluindo “in some cases automatically” e a medição *tipicamente* usada para cobrança), localização em nível mais alto, modelos de serviço e de implantação (hybrid cloud como composição de infraestruturas de nuvem) | NIST SP 800-145 ([T31](../../references/README.md#t31)) |
| Segurança da nuvem × na nuvem; variação por serviço; controles herdados, compartilhados e específicos do cliente | [Shared Responsibility Model][f00-srm] |
| Responsabilidades no RDS; manutenção do sistema operacional e do engine, atualizações opcionais e obrigatórias | [Segurança no RDS][f00-rds-security], [manutenção do RDS][f00-rds-maintenance] |
| Atualização de runtimes do Lambda por modo (Auto, Function update, Manual); container images reconstruídas, publicadas e implantadas pelo cliente | [Runtime do Lambda][f00-lambda-runtime], [responsabilidade no runtime do Lambda][f00-lambda-shared], [container images][f00-lambda-images] |
| Min, Desired e Max | [Limites do ASG][f00-asg-limits] |
| Conteúdo e versões do Launch Template | [Launch Templates][f00-lt] |
| Instâncias existentes mantêm a configuração original; Instance Refresh para substituí-las | [update-auto-scaling-group][f00-update-asg], [Instance Refresh][f00-instance-refresh] |
| EC2 status checks como padrão; health check do load balancer precisa ser ligado; substituição de instâncias unhealthy | [Health checks][f00-health-overview] |
| Target tracking, métricas predefinidas e métricas inadequadas | [Target tracking][f00-tt] |
| Definição de Availability Zone | [Availability Zones][f00-azs] |
| Statelessness facilita escala horizontal e substituição; sticky sessions e seus limites | [Well-Architected REL05-BP06][f00-wa-stateless], [sticky sessions][f00-alb-sticky] |
| Cache reduz e desacopla a carga a jusante; cache frio ou indisponível devolve a carga | [Caching na Builders' Library][f00-bl-caching] |
| Estratégias de DR (backup/restore a multi-site) | [T23](../../references/README.md#t23) |

O texto do NIST foi lido no PDF oficial; as definições acima são paráfrases em português. Os exemplos, números e critérios são sínteses autorais e não representam medições nem uma implantação real.

[f00-srm]: https://aws.amazon.com/compliance/shared-responsibility-model/
[f00-rds-security]: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html
[f00-rds-maintenance]: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html
[f00-lambda-runtime]: https://docs.aws.amazon.com/lambda/latest/dg/runtimes-update.html
[f00-asg-limits]: https://docs.aws.amazon.com/autoscaling/ec2/userguide/asg-capacity-limits.html
[f00-lt]: https://docs.aws.amazon.com/autoscaling/ec2/userguide/launch-templates.html
[f00-update-asg]: https://docs.aws.amazon.com/cli/latest/reference/autoscaling/update-auto-scaling-group.html
[f00-instance-refresh]: https://docs.aws.amazon.com/autoscaling/ec2/userguide/instance-refresh-overview.html
[f00-health-overview]: https://docs.aws.amazon.com/autoscaling/ec2/userguide/health-checks-overview.html
[f00-tt]: https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html
[f00-azs]: https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/availability-zones.html
[f00-lambda-shared]: https://docs.aws.amazon.com/lambda/latest/dg/runtime-management-shared.html
[f00-lambda-images]: https://docs.aws.amazon.com/lambda/latest/dg/images-create.html
[f00-wa-stateless]: https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_stateless.html
[f00-alb-sticky]: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html#sticky-sessions
[f00-bl-caching]: https://aws.amazon.com/builders-library/caching-challenges-and-strategies/
