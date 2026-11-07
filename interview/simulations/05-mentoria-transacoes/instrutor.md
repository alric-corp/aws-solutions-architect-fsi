# Mentoria técnica — Vitória e Cleber

Guia de condução de 60 minutos para Cleber: transações, repetição segura e investigação de falhas. Contém referências de raciocínio e respostas; não apresentar todas as evidências à participante antes de ela investigar.

[Abrir somente o roteiro da participante](candidato.md) · [Voltar às simulações](../README.md)

**Natureza:** roteiro autoral de treinamento. Os cenários, números e evidências são fictícios e **não foram executados**. As notas técnicas usam as fontes primárias indicadas ao final; não constituem um sistema pronto para produção. Não exige conta cloud, ambiente corporativo ou instalação de ferramentas.

## Preparar e combinar a dinâmica

Uma folha ou quadro para desenho, esta pauta e um espaço para registrar respostas. Evitar slides longos ou uma lista extensa de tecnologias. Cleber já conhece Vitória: limitar a contextualização ao objetivo da sessão.

Vitória explica primeiro; Cleber aprofunda, corrige e anota as dúvidas sem completar a resposta dela. Reservar **60–90 segundos** para a explicação inicial e, depois, perguntar pelo mecanismo e pela evidência. Ao corrigir, pedir uma reformulação ou uma variante, em vez de encerrar com “entendi”. Aceitar perguntas equivalentes; não exigir uma palavra ou ferramenta como senha para liberar uma informação.

## Agenda

| Minutos | Bloco | Saída |
|---|---|---|
| 00–05 | Objetivo e combinação da dinâmica | Conversa prática, não exposição de teoria |
| 05–20 | ACID e concorrência | Delimitar uma unidade de mudança e proteger a última unidade |
| 20–35 | Timeout e idempotência | Separar resultado da operação de recebimento da resposta |
| 35–53 | Troubleshooting | Localizar a espera e justificar uma intervenção |
| 53–60 | Síntese e próximos passos | Duas prioridades e evidência de aprendizado |

Os tempos são orçamento de conversa, não duração medida. Se faltar tempo, reduzir o aprofundamento em níveis de isolamento, sem eliminar o feedback final.

## 00–05 — Abertura sugerida

> Quero melhorar minha capacidade de explicar como uma solução funciona durante concorrência e falhas. Separei três situações simples. Gostaria de tentar responder primeiro, e que você me questionasse quando eu citar um mecanismo sem explicar como ele resolve o problema. No final, queria duas prioridades para aprofundar.

Não inventar experiências ou um incidente real para justificar a conversa. O objetivo de desenvolvimento técnico é suficiente.

## 05–20 — Uma unidade, duas compras

### Abertura entregue à Vitória

A Loja Horizonte tem uma unidade de um produto. Duas pessoas tentam comprar ao mesmo tempo. Registrar uma compra exige reduzir o estoque e criar um pedido no mesmo banco de dados. Como você organizaria isso para não vender duas vezes a mesma unidade nem deixar metade da operação confirmada?

**Premissas:** cenário fictício; PostgreSQL 18 como referência para detalhes de engine; operações de compra diferentes; carrinho não reserva estoque; sem tarifas, pagamento externo, filas ou e-mail no primeiro desenho.

### Perguntas essenciais

1. O que precisa confirmar junto? Em que momento você considera a compra aceita?
2. As duas transações leram `estoque = 1`. Isso basta para ambas aprovarem a compra? Apenas colocar `BEGIN` e `COMMIT` resolve?
3. Qual mecanismo escolheria para proteger a decisão? O que a segunda compra observaria?

### Referências de raciocínio para o facilitador

Atomicidade agrupa a alteração do estoque e o registro do pedido. As regras de negócio precisam ser implementadas: uma transação não as inventa. A proteção da concorrência depende da operação e do isolamento; declarar `BEGIN` não descreve sozinho uma estratégia suficiente. Durabilidade se refere à persistência do resultado confirmado dentro do contrato e da configuração da engine, não à disponibilidade imediata da aplicação. [T1](#t1) · [T2](#t2) · [T3](#t3)

Evitar cobrar apenas as quatro definições de ACID. Perguntar em qual parte do exemplo cada propriedade importa.

Um desenho possível é atualizar condicionalmente o estoque, verificar se a alteração ocorreu e somente então inserir o pedido, dentro da mesma transação. Outra opção pode usar bloqueio explícito ou controle de versão, desde que a participante explique a sequência e seus limites.

Trecho parcial para discussão — **não é uma implementação completa e não foi executado aqui**:

```sql
UPDATE produtos
SET estoque = estoque - 1
WHERE id = 1 AND estoque >= 1
RETURNING estoque;
```

Perguntar: “O que significa não retornar nenhuma linha? Você criaria o pedido mesmo assim? E se o `INSERT` falhar depois da baixa?”

No PostgreSQL em **READ COMMITTED**, uma atualização concorrente na mesma linha pode esperar e reavaliar a condição sobre a versão atualizada. Isso sustenta discutir a condição na própria escrita; não autoriza generalizar o resultado a qualquer engine, isolamento ou fluxo. [T2](#t2)

Uma constraint de estoque não negativo pode ser uma defesa adicional; não substitui a ligação correta entre a baixa e o pedido. [T3](#t3)

### Aprofundamentos opcionais — escolher apenas um

- Por que um `SELECT` comum não equivale a reservar a última unidade?
- Quando `SELECT FOR UPDATE` ajudaria e quais custos introduziria?
- O que é necessário tratar se a estratégia adotada abortar a transação por conflito?
- O que deixa de estar coberto por essa transação local quando acrescentamos uma cobrança externa?

### Reteste

Mudar para **três unidades e duas compras de duas unidades cada**. Perguntar se o mecanismo ainda preserva a regra e o que precisa mudar na condição e no decremento. A regra agora precisa considerar a quantidade solicitada; não basta repetir literalmente a atualização de uma unidade.

## 20–35 — A compra deu timeout: aconteceu ou não?

### Abertura entregue à Vitória

Agora uma pessoa envia uma compra. A aplicação demora e ela recebe timeout. O banco pode ter confirmado o pedido antes de a resposta se perder. O usuário tenta novamente. Como distinguir repetição da mesma intenção de uma nova compra legítima e evitar repetir o efeito?

### Perguntas essenciais

1. Timeout prova que a transação foi desfeita?
2. Como você identifica a mesma intenção e onde registra o resultado de maneira confiável?
3. E se duas tentativas com a mesma identificação chegarem simultaneamente?

### Janelas para discutir

| Situação conhecida no exercício | Pergunta |
|---|---|
| A transação foi abortada antes do commit | O que ficou no banco e como a aplicação decide uma nova tentativa? |
| O commit ocorreu, mas sua confirmação ou a resposta ao cliente se perdeu | Como resolver o resultado desconhecido sem repetir a compra? |
| A resposta chegou, mas o cliente reenviou a mesma intenção | Como reconhecer a repetição e devolver resultado coerente? |

O cliente ter recebido timeout, sozinho, não informa em qual linha dessa tabela a execução está. [T4](#t4)

### Referências de raciocínio para o facilitador

A identificação deve permanecer estável entre tentativas da **mesma intenção**, em escopo apropriado de cliente e operação. O serviço relaciona identidade, parâmetros e resultado, verifica reutilização incompatível e protege o registro contra concorrência. No modelo de um único banco, registro da operação e alterações de negócio precisam de uma fronteira atômica coerente. Uma simples consulta de existência seguida de inserção sem proteção não elimina a corrida. [T4](#t4) · [T5](#t5)

Não aceitar apenas “uso um UUID”, “coloco cache” ou “uso uma fila”. Pedir onde e quando o mecanismo decide, qual o efeito de duas requisições concorrentes e como o resultado anterior é recuperado.

**Distinção central:** idempotência trata a repetição da mesma intenção; proteção de estoque trata também intenções diferentes competindo pelo mesmo recurso. Precisamos explicar as duas, sem chamar um token de sessão de chave de operação.

### Uma pergunta de mecanismo, não de marca

“O banco voltou após failover. Isso, por si só, resolve o pedido cujo resultado ficou desconhecido?”

Como exemplo de infraestrutura, a documentação de uma **DB instance RDS Multi-AZ** descreve troca para standby e necessidade de restabelecer conexões. O protocolo de recuperação da operação deve ser explicado separadamente. Não generalizar os detalhes desse modelo a todo cluster ou banco. [T6](#t6) · [T4](#t4)

### Reteste

“E se a mesma identificação chegar com outro produto ou outra quantidade?” Ou: “A pessoa realmente quer uma segunda compra igual; como representar essa nova intenção?”

Não exigir discutir Saga, consenso, todas as filas ou todos os tipos de banco. Uma solução simples bem delimitada é suficiente para a conversa.

## 35–53 — Página disponível, compra falhando

### Abertura entregue à Vitória

Clientes relatam lentidão e timeout ao concluir compras. A página inicial abre normalmente. A equipe do banco diz que há conexões ativas e que a CPU não está alta. Como você investigaria?

Inicialmente, **não fornecer a causa nem indicar qual componente examinar**.

### O que Cleber deve perguntar

- Qual informação você pede primeiro para delimitar o problema?
- Que requisição ou operação você acompanharia?
- Você citou uma métrica: que resultado espera e como ele muda sua hipótese?
- Qual ação reduziria o impacto com menor risco?
- Como comprovaria recuperação para o cliente?

### Evidências progressivas — todas sintéticas

Abra cada cartão quando a participante pedir a informação correspondente ou fizer uma pergunta equivalente. Os cartões descrevem o mesmo cenário; não são medições de um sistema real.

<details>
<summary>1. Operações, usuários, período e mudanças</summary>

**Informação liberada:** a falha está concentrada nas tentativas atendidas por uma instância com versão nova. As demais continuam atendendo. O aumento começou após essa alteração.

**Limite:** correlação temporal não prova a causa.

</details>

<details>
<summary>2. Tempo por etapa de uma tentativa</summary>

**Informação liberada:** uma amostra levou **2.020 ms**: **2.000 ms esperando obter conexão do pool** e **20 ms de preparação e tratamento da falha**. A tentativa expirou **sem executar SQL**. As etapas são sequenciais nesta amostra.

**Limite:** não é soma de percentis e não representa automaticamente todas as requisições. Os 20 ms não são o tempo de uma consulta SQL.

</details>

<details>
<summary>3. Estado do pool e do banco</summary>

**Informação liberada:** na instância afetada, **10/10 conexões estão emprestadas, sem retorno ao pool**; há solicitações esperando. Elas aparecem ociosas no banco e sem transação aberta. Consultas das instâncias saudáveis continuam próximas de 30 ms.

**Limite:** CPU normal e amostra saudável não descartam todo problema de banco; restringem esta hipótese. Estar emprestada para o código e estar ociosa no servidor são estados compatíveis, observados em lados diferentes.

</details>

<details>
<summary>4. Mudança de código e ciclo de vida</summary>

**Informação liberada:** um caminho de validação adquire uma conexão, conclui uma consulta e retorna sem liberar a conexão ao pool. O registro de aquisições e devoluções e a revisão do código confirmam a diferença.

**Limite:** esta é a evidência de mecanismo no cenário, não apenas o fato de ter havido deploy.

</details>

A telemetria de pool é parte da instrumentação fictícia do exercício; não alegar coleta automática universal. A consulta que terminou no caminho defeituoso pertence às aquisições anteriores que retiveram conexões, não à tentativa do cartão 2 que expirou antes de obter uma.

### Referência de raciocínio

Pool é um conjunto de conexões reutilizadas pela aplicação. A conexão pode estar ociosa no banco e continuar marcada como emprestada pelo código. A documentação do node-postgres descreve a necessidade de devolver o cliente ao pool mesmo em caminhos de erro e o risco de esgotamento quando isso não acontece. [T8](#t8)

Um trace ajuda a reconstruir operações e seus intervalos; sua utilidade depende da instrumentação disponível. Sem esse recorte, pedir logs correlacionados e métricas ou explicar como coletaria a evidência, sem inventar visibilidade. [T7](#t7)

A investigação esperada localiza a espera antes de propor aumentar o banco. Com a causa sustentada, uma mitigação possível é retirar a versão defeituosa do tráfego ou reverter, com verificação de capacidade, aprovação da equipe responsável e tratamento de requisições em andamento. A correção permanente envolve liberar recursos nos caminhos adequados e testar a regressão. Essa mitigação é proposta para este cenário, não regra universal.

A validação deve observar tempo de espera, erros, capacidade das instâncias restantes e compra controlada com estado final verificado. Pedidos de resultado desconhecido exigem o cuidado discutido no bloco anterior. Reiniciar pode aliviar temporariamente e não provar correção.

### Variante curta

Agora o pool está livre e uma consulta SQL aguarda um lock. Perguntar: “Qual evidência você pediria? A ação anterior continua fazendo sentido?” Não introduzir todos os detalhes de um novo incidente; observar se ela transfere o método em vez de repetir a solução. Não reutilizar os cartões de esgotamento do pool como se descrevessem esta variante.

## 53–60 — Feedback e reformulação

Reservar cerca de **três minutos para feedback, dois para uma resposta refeita e dois para pactuar próximos passos**.

- Em qual ponto citei um termo sem explicar o mecanismo?
- Onde pulei para uma solução antes de localizar o problema?
- O que foi lacuna de conceito e o que foi dificuldade de organizar a explicação?
- Quais duas atividades devo fazer agora, e como saberemos que melhorei?

Critério didático, **sem pontuação de carreira**: explicou sozinha; explicou com pergunta neutra; precisou de explicação; pendente. Registrar a evidência, não só o rótulo.

| Tema | O que Vitória conseguiu explicar | Ajuda necessária | Próxima prática |
|---|---|---|---|
| ACID e concorrência | | | |
| Resultado desconhecido e idempotência | | | |
| Diagnóstico por evidências | | | |
| Comunicação e limites | | | |

O quadro está em branco para orientar um registro em folha ou cópia privada. Não há avaliação individual preenchida neste material.

## Condução por Cleber

Cleber conduz a conversa e registra as perguntas e os pontos em que a resposta muda de direção, sem completar o raciocínio no lugar da Vitória. Ao corrigir, diferenciar princípio geral de comportamento específico de uma engine. Manter sete minutos para fechamento.

Não usar a hora para revisar currículo, remuneração, todas as redes, DDD ou uma arquitetura completa de produção.

## Duas ações ao sair

Combinar somente duas prioridades, cada uma com uma prática observável e um critério de conclusão. O quadro é uma proposta em branco, não uma avaliação já realizada.

| Prioridade escolhida na conversa | Prática combinada | Como verificar o aprendizado |
|---|---|---|
| 1. | | |
| 2. | | |

Se for útil depois da sessão, consultar [ACID e concorrência](../../../technical-knowledge/01-fundamentals/acid/03-isolamento.md), [timeout e idempotência](../../../technical-knowledge/01-fundamentals/acid/07-timeout-idempotencia.md) ou [investigação de checkout lento](../04-troubleshooting/01-checkout-lento/candidato.md). Essas leituras não são pré-requisitos para a conversa.

## Referências técnicas

Consultadas em **6 de novembro de 2026**. Leitura documental, não execução dos cenários. Detalhes de engine referem-se ao PostgreSQL 18; as páginas AWS, OpenTelemetry e node-postgres são documentação contínua no escopo indicado.

### T1

[PostgreSQL 18 — Transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html). Unidade transacional e confirmação ou cancelamento das mudanças.

### T2

[PostgreSQL 18 — Transaction Isolation](https://www.postgresql.org/docs/18/transaction-iso.html). Concorrência e reavaliação de condições em READ COMMITTED; não generalizar a outras engines ou níveis.

### T3

[PostgreSQL 18 — Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html). Restrições como proteção adicional às regras implementadas pelo fluxo transacional.

### T4

[Amazon Builders’ Library — Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/). Intenção, parâmetros, repetição e registro consistente dos efeitos.

### T5

[AWS Well-Architected — Make mutating operations idempotent](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_prevent_interaction_failure_idempotent.html). Repetição segura de operações que alteram estado.

### T6

[Amazon RDS — Failing over a Multi-AZ DB instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.Failover.html). Escopo de DB instance Multi-AZ e restabelecimento de conexões; não comprova o resultado de uma operação da aplicação.

### T7

[OpenTelemetry — Traces](https://opentelemetry.io/docs/concepts/signals/traces/). Operações, spans e intervalos conforme a instrumentação disponível.

### T8

[node-postgres — Pooling](https://node-postgres.com/features/pooling). Devolução de clientes ao pool e risco de esgotamento quando isso não acontece.

[← Voltar ao roteiro da participante](candidato.md)
