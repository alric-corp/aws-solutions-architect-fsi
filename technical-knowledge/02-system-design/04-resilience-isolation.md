# SD04 — Resiliência e Isolamento

**Origem:** seções que estavam em F07, F08, F09 e F12.

<a id="resiliencia"></a>
## Padrões de resiliência

- **Timeout:** toda chamada remota precisa de um, menor que o prazo de quem chamou. Sem timeout, uma dependência lenta prende threads e conexões até derrubar quem chama.
- **Retry com backoff exponencial e jitter:** repita só o que é seguro repetir, com poucas tentativas, espera crescente e aleatoriedade, e em uma só camada. Os SDKs da AWS já fazem retries com backoff.
- **Idempotência:** permite repetir sem duplicar o efeito, com chave de idempotência e registro do resultado ([F02](../01-fundamentals/02-http-rest-openapi.md), [F07](../01-fundamentals/07-events-messaging-distributed-systems.md)).
- **Circuit breaker:** para de chamar uma dependência que falha repetidamente ([Circuit Breaker](#circuit-breaker)).
- **Fallback:** resposta alternativa quando a dependência falha, como dado em cache ou funcionalidade reduzida.
- **Limitação de taxa e descarte de carga (load shedding):** recusar cedo o excesso, priorizando o tráfego mais importante, protege o que ainda dá para atender.
- **Estabilidade estática:** o sistema segue funcionando com o que já tem quando uma dependência ou o plano de controle falha, por exemplo com capacidade já provisionada em cada AZ, sem depender de escalar na hora.

**Cuidado:** fallback pouco exercitado falha justamente quando é preciso; a Amazon Builders' Library recomenda evitá-lo em muitos casos e preferir tornar o caminho principal mais confiável. Em finanças, o fallback é decisão de negócio: aprovar sem a verificação de fraude não é “modo degradado”, é risco assumido.

<a id="circuit-breaker"></a>
## Circuit Breaker

Como fechar o registro quando um cano estoura: se uma dependência falha repetidamente, o disjuntor para de enviar chamadas novas por um tempo, evita falhas em cascata e dá espaço para ela se recuperar. Estados: fechado (as chamadas passam), aberto (falha rápido, sem chamar) e semiaberto (deixa passar algumas chamadas de teste). A Netflix popularizou o padrão com a biblioteca Hystrix, hoje em modo de manutenção; a alternativa comum é a Resilience4j. Na AWS, ele fica no código da aplicação ou no proxy. Não confunda com o circuit breaker de implantação do ECS, que interrompe deploys que não estabilizam.

**Cuidado:** o que responder com o circuito aberto (recusar, aceitar dentro de um limite, enfileirar) é decisão de negócio. E o disjuntor protege chamadas novas; não resolve operações já enviadas ([Case 01](../../cases/01-payment-processing-pix.md#s09)).

## Proteção e elasticidade

Capacidade máxima de uma dependência continua relevante quando a camada de entrada escala. Limites por cliente, admissão de trabalho e backlog precisam proteger o sistema sem confundir tráfego legítimo com ataque. Defina o que ocorre quando o orçamento de processamento se esgota.

<a id="bulkhead"></a>
## Bulkhead

Como os compartimentos estanques de um navio: isolar recursos para que a falha ou a sobrecarga de uma parte não afunde as outras. Pools de threads ou de conexões separados por dependência, filas separadas por prioridade ou cliente, serviços ou funções separados para jornadas críticas.

Na AWS: reserved concurrency por função Lambda (uma função não consome a concorrência das outras), filas SQS separadas, serviços ECS e target groups separados, contas separadas e, no limite, células. O shuffle sharding, descrito na Amazon Builders' Library, combina isolamento e distribuição: cada cliente usa uma combinação diferente de nós, e um cliente problemático afeta poucos outros.

**Cuidado:** isolar demais fragmenta a capacidade e deixa recursos ociosos. Defina o que proteger primeiro: no banco, a autorização de pagamentos não deve disputar recursos com a geração de extratos em PDF.

<a id="celulas"></a>
## Arquitetura baseada em células

Em vez de uma instalação única e grande, o sistema roda em várias células: cópias completas e independentes da pilha (compute, dados, filas), cada uma atendendo um subconjunto de clientes. Uma camada de roteamento fina envia cada cliente para a sua célula por uma chave de partição, como o ID do cliente.

- **Raio de impacto:** uma falha ou um deploy ruim atinge só os clientes daquela célula.
- **Escala:** cresce acrescentando células de tamanho conhecido e testado, em vez de ampliar sem limite uma instalação única.
- **Implantação em ondas:** célula por célula, começando por uma de menor risco.

A AWS usa células em muitos serviços e descreve o padrão no whitepaper do Well-Architected “Reducing the Scope of Impact with Cell-Based Architecture”.

**Cuidado:** a camada de roteamento vira peça crítica e precisa ser simples e muito confiável. Operações entre células (relatórios, transferências entre clientes de células diferentes) e mover clientes de célula exigem desenho próprio. Monitore por célula ([F08](../01-fundamentals/08-observability-troubleshooting.md#slo)).

**Monitorar por célula:** numa [arquitetura de células](#celulas), publique as métricas por célula. Uma média global esconde uma célula degradada; comparar as células entre si, e a que acabou de receber um deploy com as demais, mostra o problema cedo e limita o raio de impacto.

## Para treinar

1. Com o circuit breaker aberto, o que o fluxo de autorização de cartão deve responder? ([Case 10](../../cases/10-card-authorization-platform.md))
