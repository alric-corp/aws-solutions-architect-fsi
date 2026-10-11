# 09 — Desempenho, capacidade e custos

**Base:** notas sobre latência, GPU, DoS, eficiência e escala. **Complemento:** quantificar hipóteses e distinguir custo unitário de fatura.

<a id="performance"></a>
## Antes de otimizar

Defina a jornada, o objetivo, o percentil, o ponto de medição, a carga e o prazo. “Baixa latência” e “alto desempenho” não permitem comparar alternativas sem essas condições.

Throughput é taxa de trabalho concluído; concorrência é trabalho em andamento; latência é duração observada. Aumentar concorrência pode piorar filas e latência quando uma dependência está saturada.

<a id="exemplo-numerico"></a>
## Um exemplo numérico didático

Se um estágio recebe em média 200 requisições por segundo e mantém cada requisição por 0,25 segundo, um sistema estável tem aproximadamente 50 requisições simultâneas nesse estágio, sob as hipóteses do modelo de fluxo. Isso é um ponto de partida de dimensionamento, não quantidade garantida de threads ou instâncias.

Para um pico de 1.000 requisições por segundo, cinco tentativas indiscriminadas por solicitação podem criar até 5.000 chamadas ao componente limitado, conforme a política. O exercício mostra por que retries precisam de limites e coerência com a capacidade e a idempotência.

## Comparar custo por unidade de valor

Imagine duas soluções fictícias: A custa R$ 3.000 para 1 milhão de operações bem-sucedidas; B custa R$ 4.000 para 2 milhões. Os custos unitários são R$ 0,003 e R$ 0,002 por operação. Isso não decide sozinho a escolha: disponibilidade, prazo e risco também importam.

Toda estimativa real deve registrar data, região, carga, preço e premissas. Não use uma economia de exemplo do curso como garantia de que Lambda será sempre mais barato que ECS ou EC2.

## CPU, GPU e outros recursos

Não proponha GPU porque a aplicação está lenta. Verifique se o algoritmo e a implementação se beneficiam da capacidade, a utilização, o custo por resultado e as alternativas. Uma consulta aguardando disco não é corrigida automaticamente por mais poder de cálculo.

Para análise de recursos, use hipóteses de utilização, saturação e erros. [Fonte T27](../../references/README.md#t27)

<a id="concorrencia"></a>
## Concorrência e paralelismo

Concorrência é lidar com várias tarefas em andamento ao mesmo tempo, intercalando-as; paralelismo é executar várias ao mesmo tempo, em núcleos ou máquinas diferentes. Um servidor web atende milhares de requisições concorrentes com poucos núcleos porque a maioria está esperando rede ou disco.

- **Limitado por I/O:** passa a maior parte do tempo esperando; ganha com concorrência (I/O assíncrono, event loop, mais threads com cuidado).
- **Limitado por CPU:** ganha com paralelismo até o número de núcleos; mais threads que isso só trocam contexto.
- **Lei de Amdahl:** a parte que não paraleliza limita o ganho. Se 10% do trabalho é serial, o ganho máximo é de 10 vezes, com qualquer número de núcleos.

Recursos compartilhados criam contenção: locks, pools de conexão e linhas quentes no banco serializam o trabalho. Na AWS, a concorrência do Lambda é o número de execuções simultâneas, com limite por conta e opções de reserva e provisionamento por função; no ECS, é o número de tasks vezes a concorrência de cada uma.

**Cuidado:** mais concorrência contra uma dependência saturada piora a latência para todos ([exemplo numérico](#exemplo-numerico)). Limite a concorrência (pools, filas, reserved concurrency) e aplique backpressure.

## Perguntas de aprofundamento

“Qual p99 depois de perder uma AZ?” “Qual custo de manter prontidão para DR?” “Quanto volume foi usado para comparar o antes/depois?” “O gargalo mudou após a otimização?”

## Exercício

Escolha uma etapa do [Case 09](../../cases/09-multi-region-internet-banking.md). Faça uma estimativa com unidades, reserve capacidade de recuperação e identifique a hipótese que mais afeta o resultado. Desenhe o teste que a confirmaria. Não declare o objetivo cumprido antes da execução.

Conecte custos e performance aos riscos de operação usando o [Well-Architected](../../references/README.md#t14), sem transformar um pilar em justificativa para ignorar os demais.
