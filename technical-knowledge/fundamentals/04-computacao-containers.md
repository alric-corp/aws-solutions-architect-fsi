# 04 — Computação, containers e implantação

**Base:** N01/N05 cobrem containers, HA, eficiência e CI/CD. **Complemento:** justificar a unidade de execução e sua operação diante de falhas.

## Escolher pelo workload

Pergunte duração, volume, variação, necessidade de sessão persistente, dependências de sistema, latência, capacidade mínima e repertório operacional do time. Só então compare EC2, Lambda e execução containerizada.

Container empacota processo e dependências. ECS ou Kubernetes organizam execução e ciclo de vida. Fargate oferece uma forma gerenciada de executar workloads compatíveis; não é o nome da aplicação nem de uma subnet.

No ECS, cluster agrupa logicamente serviços e tarefas. A representação de rede precisa mostrar onde as tasks executam e quais sub-redes e controles se aplicam; a caixa do cluster não cria nem possui as subnets. [Fonte T10](../../referencias/README.md#t10)

## Alternativas de estudo

| Alternativa | Pergunta que pode justificá-la | Custo/risco a investigar |
|---|---|---|
| Lambda | Trabalho por requisição/evento com contrato compatível? | Limites, conexões, concorrência e dependências |
| ECS/Fargate | Serviço containerizado sem necessidade de gerir hosts? | Capacidade, limites, rede e comportamento de parada |
| EC2 | Precisamos de controle do host ou perfil específico? | Patching, escala e manutenção da capacidade |
| EKS | A organização já precisa e opera capacidades Kubernetes? | Complexidade e responsabilidade operacional |

A tabela é uma pauta de avaliação. Não significa que Lambda seja sempre mais barato ou que EKS seja sempre excessivo.

## Load balancer não resolve a aplicação sozinho

ALB aplica roteamento de aplicação a protocolos suportados; NLB atende necessidades de transporte/conexão com outro contrato. A escolha exige saber protocolo e comportamento esperado, não apenas chamar um de “mais rápido”. [Fontes T29](../../referencias/README.md#t29), [T30](../../referencias/README.md#t30)

Saúde de porta e saúde de negócio são diferentes. Uma task pode responder ao health check enquanto o banco necessário para sua jornada está indisponível.

<a id="balanceamento"></a>
## Proxies reversos e algoritmos de balanceamento

Um proxy reverso recebe as requisições em nome dos servidores: esconde a topologia, termina TLS, aplica regras e encaminha. Um load balancer é um proxy reverso, ou um encaminhador de conexões, cuja função principal é distribuir a carga entre destinos saudáveis.

- **Camada 4 (transporte):** decide por conexão, com base em IP e porta, sem ler o HTTP. Na AWS, o NLB escolhe o destino por um hash do fluxo e mantém a conexão nele.
- **Camada 7 (aplicação):** lê a requisição e roteia por host, caminho ou cabeçalho. Na AWS, o ALB.

| Algoritmo | Como escolhe | Bom para |
|---|---|---|
| Round robin | Um destino de cada vez, em sequência | Requisições parecidas e destinos iguais |
| Ponderado | Proporcional a pesos | Destinos de capacidades diferentes; canary |
| Menos conexões ou menos requisições pendentes | O destino com menos trabalho em andamento | Requisições de duração variável |
| Hash (IP, chave, consistent hashing) | Sempre o mesmo destino para a mesma chave | Afinidade e caches locais |

No ALB, os algoritmos incluem round robin e least outstanding requests.

**Cuidado:** sessões presas a um destino (sticky sessions) atrapalham o balanceamento e a troca de instâncias; prefira o estado fora do processo. Ao retirar um destino, espere as requisições em andamento terminarem (deregistration delay).

## Implantação e estado

Explique de onde vem a imagem, como é identificada, como a task recebe credenciais, quando passa a atender e como deixa de aceitar trabalho. Conexões em andamento, migrações de schema e mensagens já recebidas exigem tratamento próprio.

Um deploy novo não deve depender de uma tag mutável sem rastreabilidade. Rollback de imagem não reverte automaticamente dados escritos pela versão nova.

## Perguntas de aprofundamento

“Duas tasks em uma AZ são Multi-AZ?” “O que ocorre após SIGTERM?” “Quem mantém o estado da sessão?” “O serviço novo consome uma mensagem que a versão antiga não entende?”

## Perguntas de entrevista

1. Que cargas você colocaria em instâncias Spot, e quais nunca colocaria? Por quê?
2. Lambda, ECS com Fargate ou EC2: como você escolhe para um serviço de pagamentos?
3. O tráfego varia muito ao longo do dia. Como você configura a escala automática, e o que pode impedir que ela funcione?

A pergunta de arquitetura serverless está nas [perguntas de design](../../interview/simulations/03-system-design/design-questions.md).

## Exercício

No [Case 10](../../cases/10-plataforma-autorizacao-cartoes.md), contraste uma requisição curta com uma sessão persistente. Proponha como interromper a entrada de trabalho, drenar ou recuperar o que estava em andamento e provar que uma repetição não criou outro efeito.
