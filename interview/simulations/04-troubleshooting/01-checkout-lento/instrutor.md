# Simulado 1 — Material do instrutor

Uso reservado à condução da sessão; entregue somente [candidato.md](candidato.md). Todos os horários, números, logs e traces abaixo são **dados sintéticos para treinamento**. Horários em UTC, no dia fictício D. Escolha a base ou a variante V; não combine seus cartões. Aplique as regras de liberação do [guia](../guia-do-instrutor.md).

## 1. Competências avaliadas

Delimitar a jornada afetada; comparar com o normal; localizar espera antes de atribuir causa; explicar pool, consulta e dependência externa; escolher contenção e validar compras. Na [rubrica](../rubrica.md), observe especialmente hipóteses/evidências e profundidade técnica. Para chegar a 3, deve haver também risco, comunicação, validação e prevenção.

## 2. Estado real e premissas do cenário

**Base:** quatro tasks atendem a mesma API. Uma task recebeu uma versão canário às 09:02. Nessa versão, uma saída por cupom inválido deixa de devolver ao pool a conexão já adquirida, depois de concluir a leitura SQL. O pool local tem dez conexões; as demais tasks continuam saudáveis. As conexões abandonadas pelo código ficam ociosas no PostgreSQL, mas ainda emprestadas para o pool. Não há transação aberta segurando lock. O esgotamento ocorre gradualmente e às 09:07 a task canário não consegue adquirir conexão.

O checkout usa `POST /checkout/quote`: lê carrinho, devolve conexão e consulta frete. A confirmação do pedido é outra operação. A página inicial vem de CloudFront/S3 e não comprova a saúde do checkout. O health check do ALB usa uma rota local que não adquire conexão, por isso mantém o canário como alvo. Banco e parceiro estão saudáveis na base. Hipóteses alternativas iniciais: regressão SQL, lock, rede, fornecedor, carga ou falta de compute. A falha principal é de gerenciamento de recurso na aplicação, não de execução do banco.

**Variante V:** nenhuma task tem vazamento ou versão nova. O parceiro de frete fica lento às 11:00. A aplicação devolve a conexão antes da chamada externa. Aumentar pool ou reiniciar tasks não reduz a espera no parceiro.

## 3. Linha do tempo

| Base (UTC) | Evento sintético |
|---|---|
| 08:50–09:00 | Referência saudável da jornada |
| 09:02 | Canário em uma das quatro tasks |
| 09:03–09:07 | Empréstimos sem devolução após cupom inválido acumulam nessa task |
| 09:07 | Pool local esgotado; demais tasks atendem normalmente |
| 09:08–09:10 | Reclamações e recorte de investigação |

Na V: 10:50–11:00 é a referência; 11:00 começa a degradação do parceiro; 11:03–11:05 é o recorte. Esses horários substituem a linha do tempo da base.

## 4. Evidências sintéticas progressivas

**B1 — Impacto e referência (09:08–09:10).** Tráfego de checkout estável em relação a 08:50–09:00; falhas técnicas passam de 0,4% a 25%; p95 do tempo de resposta passa de 260 ms a 2.050 ms, incluindo timeouts. Falhas se concentram em `POST /checkout/quote`, em uma task; não há concentração por país ou meio de pagamento. A taxa de sessões que concluem compra em cinco minutos caiu de 70% a 52%. Isso mede conversão observada, não causalidade isolada: não atribuir cada abandono à falha.

**B2 — Fluxo e trace (09:09:00).** Instrumentação customizada separa aquisição da conexão e execução SQL. Os intervalos abaixo são sequenciais dentro de cada amostra, não percentis somáveis.

```text
amostra saudável, task controle, total=200 ms
  outro processamento=40 ms; pool.acquire=5 ms; SQL=35 ms; frete.HTTP=120 ms
amostra com falha, task canário, total=2020 ms
  outro processamento=20 ms; pool.acquire=2000 ms → timeout
  sem execução SQL e sem chamada de frete nesta requisição
```

**B3 — Recorte por recurso (09:08–09:10).** Task canário: pool emprestadas 10/10, pendentes 14 no instante de 09:09:00; controles: 1–3/10, pendentes 0. As dez conexões do canário aparecem como `idle`, sem transação, no banco. CPU do RDS 23% (referência 22%); p95 das leituras SQL executadas 40 ms (referência 39 ms), sem espera de lock significativa no recorte. Não confundir consultas executadas com solicitações que sequer obtiveram conexão.

**B4 — Mudança e ciclo de vida (09:03–09:07).** Versão canário altera validação de cupom. Instrumentação de empréstimos identifica dez aquisições sem devolução nesse caminho; revisão de código confirma saída antes da liberação do recurso. Não se trata de log nativo do RDS:

```text
09:06:55 task=canario lease=L10 pool_acquired=true sql_finished=true
09:06:55 task=canario lease=L10 outcome=cupom_invalido resource_released=false
09:09:00 task=canario operation=checkout.quote error=pool_acquire_timeout timeout_ms=2000
```

**B5 — Recuperação condicional.** Após retirar o canário do tráfego e substituí-lo pela versão anterior, com drenagem e capacidade verificadas: de 09:15 a 09:25, p95 de checkout 265 ms, falhas técnicas 0,5%, pendentes 0–1 por task; testes de cotação e conclusão com cupom válido e inválido passam. Conversão deve ser acompanhada por coortes com tempo de conclusão suficiente; não declarar recuperação desse indicador imediatamente. Se apenas reiniciar a versão defeituosa, o pool começa vazio, mas os empréstimos sem devolução reaparecem; não há cartão de recuperação sustentada para essa ação.

**V1 — Impacto e localização.** No recorte V, todas as tasks têm checkout p95 de 4.250 ms, falhas técnicas 12%, pools com 1–3/10 emprestadas e pendentes 0. Uma amostra bem-sucedida leva 4.200 ms: outros 40 + aquisição 5 + SQL 35 + frete HTTP 4.120. DNS, TCP e TLS do parceiro somam 30 ms dentro desses 4.120 ms; a maior espera é pela resposta HTTP. Leituras SQL permanecem em p95 de 40 ms.

**V2 — Discriminação e decisão.** Sem mudança local; parceiro comunica degradação de processamento. Não há rota alternativa homologada. Negócio admite suspender temporariamente a conclusão de compras que dependam de frete, mantendo carrinho e mensagem clara. Não admite inventar preço nem confirmar sem cotação. Retentativas automáticas atuais são limitadas, sem tempestade observada. Para a V, após contenção e recuperação informada pelo parceiro, liberar **V3** somente se a candidata pedir validação: dez minutos de cotação e compra canário, p95 270 ms, falhas 0,6%, nenhuma compra confirmada sem frete válido. A contenção sozinha reduz dano, mas não recupera a capacidade de comprar.

## 5. Solicitação → evidência → conclusão e limite

| Solicitação da candidata (equivalentes aceitos) | Evidência fornecida | O que permite concluir | O que não permite concluir |
|---|---|---|---|
| Quem, desde quando, qual operação, comparação com normal? | B1 ou V1 e linha do tempo selecionada | Há degradação da jornada e seu recorte | A causa é RDS ou a página inicial prova saúde |
| Onde a requisição passa e onde espera? | B2 ou trace V1 | Aquisição na base; resposta externa na V | Toda duração de acesso ao banco é execução SQL |
| Há saturação de pool, consultas lentas ou locks? | B3 ou métricas V1 | A base esgota um pool local com conexões idle | CPU baixa exclui qualquer problema de banco |
| O que mudou? A conexão é devolvida em erro? | B4 ou V2 | Evidência causal da regressão na base | Uma mudança temporal, sozinha, prova causalidade |
| Como ficou após a intervenção e o teste da jornada? | B5 ou V3, se a ação corresponder | Recuperação nos testes e período definidos | Correção permanente, recuperação de todas as coortes ou todos os usuários |

## 6. Raciocínio esperado e alternativas válidas

Começar pelo impacto e reconstruir navegador → borda → API → leitura → frete → resposta. Prever como distinguir espera no pool, SQL e HTTP externo. Na base, o contraste entre tasks, o trace e a ausência de devolução sustentam a regressão. Na V, os mesmos passos levam a outro componente: o banco deixou de ser suspeito principal para essa espera.

Aceitar ferramentas de tracing ou métricas equivalentes, análise de logs correlacionados e testes de alcance restrito. Não exigir X-Ray. Retirar a task canário e repor capacidade saudável, ou reverter a versão com drenagem, são caminhos válidos. Corrigir o caminho de liberação e testar antes de reimplantar é solução duradoura. Aumentar pool sem corrigir vazamento só adia a saturação e pode ampliar conexões no banco.

## 7. Perguntas de aprofundamento

- “Você disse que olharia essa métrica. O que espera encontrar e como isso muda seu próximo passo?”
- “Como uma conexão pode estar idle no banco e indisponível para a aplicação?”
- “Que observação faria você abandonar a hipótese de SQL lento?”
- “Um trace amostrado representa quais requisições? Há falhas antes da instrumentação?”
- “Na variante, o que mudaria na decisão se o preço do frete pudesse ser consultado em cache com validade comercial aprovada?”

## 8. Respostas incompletas e como aprofundá-las

| Resposta | Pergunta para aprofundar |
|---|---|
| “Vou olhar CPU do banco.” | Qual relação entre CPU, tempo SQL e tempo total você espera? O que CPU normal descartaria? |
| “Vou usar tracing.” | Qual requisição escolheria, quais intervalos precisa separar e como compararia com uma saudável? |
| “Reinicio ou aumento o pool.” | Por que as conexões não voltam? O que acontecerá após mais cupons inválidos? |
| “Desligo o frete.” | O contrato permite confirmar a compra sem valor válido? Qual jornada fica disponível? |

## 9. Mitigações, riscos e validação

Na base, dono da aplicação aprova retirada do canário e reposição pela versão saudável, preservando capacidade e requisições em andamento. Parar se os controles saturarem ou surgirem erros de integridade; reduzir novas entradas e escalar a equipe se faltar capacidade. Não reiniciar todas as tasks ao mesmo tempo. Não repetir criação de pedidos como se fosse apenas cotação.

Na V, alinhar modo degradado com negócio, limitar espera e repetição conforme contrato e preservar carrinhos. Timeouts menores podem falhar mais cedo sem recuperar vendas; tentativas extras podem piorar o parceiro. Só reabrir conclusão após validar o fluxo inteiro.

Critérios didáticos de recuperação: dez minutos com checkout p95 abaixo de 300 ms, falhas técnicas abaixo de 1%, pool sem espera sustentada e compras de teste com efeitos verificados. Esses limites pertencem à loja fictícia, não são SLOs universais. Prevenção: teste de liberação em todos os caminhos de erro, alerta de espera por task, correlação de versão e teste de degradação do parceiro.

## 10. Exemplo de resposta inicial organizada

“Vou confirmar quais clientes e operações falham, desde quando e o que mudou. A página inicial usa outro caminho. Quero seguir uma cotação afetada e uma saudável, separando espera para obter conexão, consulta e frete. Isso dirá onde concentrar a coleta. Enquanto investigamos, alinharei uma contenção que preserve compras e definirei como medir a recuperação.”

Este é um exemplo de organização anterior aos cartões, não uma frase para memorizar ou a conclusão antecipada.

## 11. Explicação técnica aprofundada

O pool é um conjunto de conexões reutilizáveis gerido pela aplicação. Adquirir uma conexão não executa SQL; esperar pela sua disponibilidade pode consumir todo o prazo da requisição. Uma conexão TCP saudável e ociosa no banco pode permanecer marcada como emprestada no pool. Por isso métricas do PostgreSQL não mostram as requisições ainda na fila local. Os spans explicitados neste caso dependem de instrumentação própria, não de coleta automática garantida por um serviço.

Um trace descreve amostras de trabalho e seus intervalos. Spans podem ser paralelos ou aninhados; não somar p95 de componentes para calcular p95 da jornada. A V usa intervalos sequenciais declarados para permitir a decomposição simples. Distinguir latência no cliente, na API e no fornecedor evita aplicar uma mitigação local à espera remota. Esperas também retêm recursos e retries podem amplificar falhas: [Builders’ Library — timeouts e retries](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/), consulta em 01/11/2026.

## 12. Exemplo de comunicação para negócio

Base, após B4: “A cotação falha em uma das quatro instâncias da API; a página inicial segue disponível. Identificamos um problema na versão em teste e vamos substituí-la com acompanhamento de capacidade. Ainda estamos medindo o impacto nas compras. Atualizaremos em dez minutos com latência, falhas e testes da jornada; pedidos de resultado incerto serão verificados separadamente.”

## 13. Debrief e links de revisão

Peça a evidência que mudou a hipótese principal e o que a candidata faria sem traces. Na próxima sessão, aplique V sem anunciar a causa. Revise [F08](../../../../technical-knowledge/01-fundamentals/08-observability-troubleshooting.md), [F06](../../../../technical-knowledge/01-fundamentals/06-databases-transactions-consistency.md) e [capacidade](../../../../technical-knowledge/01-fundamentals/09-performance-costs.md). Registre avaliação por dimensão, não uma lista de ferramentas.

## 14. Fontes técnicas

Consultadas em **01/11/2026**: [Builders’ Library — timeouts, retries e jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) sustenta o risco de reter recursos e amplificar carga; [RDS — métricas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html) delimita as medidas do banco; [Well-Architected — Operate](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/operate.html) sustenta impacto e validação operacional. O vazamento, os spans e os limiares são premissas sintéticas, não incidentes ou benchmarks dessas fontes. Veja o [catálogo de fontes](../../../../references/troubleshooting-fontes.md).
