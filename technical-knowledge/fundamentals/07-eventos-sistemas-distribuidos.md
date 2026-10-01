# 07 — Eventos, mensageria e sistemas distribuídos

**Base:** N04 apresenta comunicação, bancos por serviço, saga e títulos de padrões. **Complemento:** separar contratos de entrega, efeitos de negócio e recuperação.

## Mensagem, comando e evento

Mensagem é uma unidade de comunicação. Comando pede uma ação e deve ter um responsável por aceitá-la. Evento comunica um fato. Publicar `PagamentoSolicitado` não equivale a afirmar `PagamentoEfetivado`.

Uma fila distribui trabalho entre consumidores da mesma responsabilidade. Pub/sub permite distribuir cópias para responsabilidades independentes. Um log de eventos pode ser relido por grupos com posições próprias. A escolha depende de ordenação, retenção, replay, fan-out, volume e capacidade operacional.

<a id="assincrona"></a>
## Fila, pub/sub e streaming na AWS

| Modelo | Serviço AWS | Entrega | Quando usar |
|---|---|---|---|
| Fila | SQS (Standard ou FIFO) | Cada mensagem vai para um consumidor e é apagada após o processamento | Distribuir trabalho e absorver picos |
| Pub/sub | SNS | Uma cópia para cada assinante (com SQS, uma fila por assinante) | Fan-out simples |
| Barramento de eventos | EventBridge | Roteamento por regras sobre o conteúdo do evento | Integrar domínios e SaaS com filtros |
| Streaming (log) | Kinesis Data Streams, MSK (Kafka) | Log ordenado por partição e retido por um período; cada consumidor lê no seu ritmo e pode reler | Alto volume, ordem por chave, replay, vários leitores |

No streaming, a ordem vale dentro de uma partição (shard, no Kinesis), definida pela chave: eventos da mesma conta na mesma partição saem em ordem; entre partições, não. O paralelismo de leitura é limitado pelo número de partições.

**Cuidado:** SQS FIFO e streaming ordenam por grupo ou partição, não globalmente, e o consumidor continua precisando ser idempotente. Retenção do stream não é arquivo de auditoria ([Case 03](../../cases/03-banking-event-driven.md#s10)).

## Entrega não é efeito único

SQS Standard admite duplicatas e ordem diferente. Visibility timeout não torna o processamento financeiro exatamente uma vez. [Fontes T20](../../referencias/README.md#t20), [T21](../../referencias/README.md#t21)

No exercício, considere o consumidor que fez a chamada externa e morreu antes de confirmar a mensagem. Repetir a entrega exige recuperar a mesma operação, não presumir que nada aconteceu.

## Síncrono não é errado; assíncrono não elimina falhas

O cliente precisa de uma decisão final agora ou pode acompanhar depois? A resposta muda onde colocar uma fila. Retirar e-mail do caminho de pagamento é diferente de retirar a verificação obrigatória de limite sem mudar o contrato.

Assincronia desloca espera e recuperação. Backlog, expiração, duplicação e mensagens inválidas continuam precisando de operação.

<a id="pubsub"></a>
## Pub/Sub

Como um serviço de entrega de jornal: publicadores emitem eventos sem saber quem vai recebê-los, e assinantes ouvem só o que interessa, como na atualização do perfil de um usuário em vários serviços. Isso melhora escalabilidade e modularidade. O Google Cloud Pub/Sub é um exemplo; na AWS, SNS e EventBridge, com SNS + SQS para dar uma fila a cada assinante.

**Cuidado:** a entrega costuma ser pelo menos uma vez, com duplicatas e sem ordem garantida (veja “Entrega não é efeito único”, acima). Vários workers na mesma fila não fazem fan-out: competem pela mesma mensagem ([Case 03](../../cases/03-banking-event-driven.md)).

## Perguntas de aprofundamento

“Três serviços na mesma fila recebem todos os eventos?” “Um replay pode repetir um lançamento?” “O que a DLQ resolve e o que ainda exige análise?” “Qual evento pertence ao mesmo agregado?”

## Exercício

No [Case 03](../../cases/03-banking-event-driven.md), pare o consumidor após cada fronteira: antes do efeito, depois do efeito, antes da confirmação. Registre o resultado esperado de uma repetição. Faça o teste somente com simuladores e dados fictícios.
