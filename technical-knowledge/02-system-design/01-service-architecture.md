# SD01 — Arquitetura de Serviços

**Origem:** seções que estavam em F02, F04 e F07.

<a id="microsservicos"></a>
## Monólito, microsserviços e domínios

**Monólito** é uma unidade de implantação, não sinônimo de código ruim. Um monólito modular, com módulos de fronteiras claras, é simples de operar, testar e manter consistente com transações locais. **Microsserviços** dividem o sistema em serviços implantáveis de forma independente, cada um dono dos seus dados, o que permite times e escala independentes ao custo de rede, consistência eventual e operação distribuída.

As fronteiras devem seguir o domínio, não a camada técnica. No DDD, um bounded context é a parte do negócio onde um modelo e uma linguagem valem (pagamentos, limites, cadastro). Um serviço por tabela ou por camada (“serviço de banco”, “serviço de validação”) espalha uma regra por vários serviços.

| Sinal | O que indica |
|---|---|
| Times bloqueados uns pelos outros para implantar | Fronteiras de serviço podem ajudar |
| Partes com escala ou disponibilidade muito diferentes | Separar pode compensar |
| Toda mudança exige alterar e implantar vários serviços juntos | Monólito distribuído: acoplamento sem os benefícios |
| Serviços que compartilham o mesmo banco e as mesmas tabelas | Acoplamento pelos dados |

**Cuidado:** a estrutura dos sistemas tende a espelhar a comunicação entre os times (lei de Conway). Comece pelo domínio e pela organização; sair de um monólito costuma ser incremental, com [Strangler Fig](#strangler).

<a id="strangler"></a>
## Bônus: Strangler Fig

Inspirado na figueira-estranguladora, que cresce em volta de uma árvore até substituí-la: em vez de uma migração big bang arriscada, partes do legado são trocadas aos poucos por componentes novos, atrás de uma fachada que encaminha cada capacidade para a implementação certa. Na AWS, a fachada costuma ser o API Gateway ou um ALB.

**Cuidado:** a fachada muda o caminho do tráfego, mas não resolve sozinha a autoridade dos dados; enquanto o legado também escreve, há risco de divergência. O [Case 05](../../cases/05-core-banking-modernization.md) aprofunda strangler com fachada estável, anti-corruption layer e fencing.

<a id="api-gateway"></a>
## API gateway

Ponto único de entrada para as APIs: roteia para o backend certo e centraliza preocupações comuns, como autenticação, limite de taxa (throttling) e cotas, validação de requisição, transformação, cache, versionamento e métricas. Na AWS, o Amazon API Gateway oferece APIs REST (mais recursos, como planos de uso e chaves de API), HTTP (mais simples e baratas) e WebSocket.

A diferença para o load balancer: o balanceador distribui tráfego entre instâncias de um serviço; o gateway governa a API como produto, por cliente, rota e versão. Os dois costumam aparecer juntos, como no [Case 05](../../cases/05-core-banking-modernization.md): API Gateway → VPC Link → ALB interno.

**Cuidado:** o gateway valida identidade e aplica limites, mas não substitui a autorização de negócio no backend (“este token pode ver esta conta?”). Ele também tem limites de tempo e de tamanho de payload; processamento longo pede resposta assíncrona.

<a id="bff"></a>
## Backend for Frontend (BFF)

Um backend dedicado a cada experiência de cliente (web, app, parceiro), que agrega chamadas, adapta formatos e devolve exatamente o que aquela tela precisa. Costuma pertencer ao time do frontend correspondente. Evita uma API genérica que serve mal a todos, com o app fazendo dez chamadas ou recebendo campos de que não precisa. Na AWS, pode ser um serviço em Lambda ou ECS atrás do API Gateway, ou uma API GraphQL no AWS AppSync.

**Cuidado:** regra de negócio no BFF se duplica entre canais e diverge. O BFF compõe e adapta; quem decide limite, saldo ou elegibilidade são os serviços de domínio. No banco, o internet banking web, o app e uma API de parceiro, como a do [Case 02](../../cases/02-open-finance-apis.md), têm necessidades e controles de segurança diferentes, mas precisam chegar à mesma regra.

<a id="ambassador"></a>
## Ambassador

Como o assistente que cuida da agenda e da comunicação de um CEO: um proxy ao lado da aplicação faz a comunicação com outros serviços e assume retries, timeouts, logs, métricas e TLS. Em Kubernetes, service meshes como o Istio usam o Envoy nesse papel. Na AWS, o ECS Service Connect adiciona um proxy gerenciado a cada task; o App Mesh, citado em materiais antigos, foi descontinuado em 30/09/2026. Aplicado a todos os serviços, o padrão vira um [service mesh](#service-mesh).

**Cuidado:** o proxy é mais um salto na rede e mais um componente para operar. Retries no proxy e na aplicação ao mesmo tempo multiplicam as chamadas a uma dependência já sobrecarregada ([F09](../01-fundamentals/09-performance-costs.md)).

<a id="service-mesh"></a>
## Service mesh

Camada dedicada à comunicação entre serviços. Um proxy ao lado de cada serviço (o data plane, geralmente Envoy) intercepta as chamadas, e um control plane distribui as políticas: mTLS entre serviços, retries, timeouts, divisão de tráfego para canary, métricas e traces uniformes, sem mudar o código. É o [Ambassador](#ambassador) aplicado a todos os serviços.

Na AWS: ECS Service Connect no ECS; Istio no EKS; e o Amazon VPC Lattice, que oferece conectividade, autorização e observabilidade entre serviços sem sidecar. O App Mesh foi descontinuado em 30/09/2026.

**Cuidado:** a malha acrescenta latência, consumo de recursos em cada proxy e um sistema a mais para operar e atualizar. Vale quando muitos serviços e times precisam de políticas uniformes; com poucos serviços, bibliotecas e um load balancer resolvem. mTLS autentica serviços, mas não autoriza o usuário final.
