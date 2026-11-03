# 04 — O que pode mudar entre duas consultas?

[Índice da trilha](README.md) · [Anterior: isolamento](03-isolamento.md) · [Próxima: locks, versão e deadlocks](05-locks-concorrencia-deadlocks.md)

Você abre o relatório de vendas da Loja Horizonte, atende uma mensagem e consulta outra vez. O número mudou. Isso pode ser perfeitamente aceitável numa tela de acompanhamento. Mas, se o relatório combina detalhes e total, é preciso compreender quais mudanças podem entrar entre suas consultas.

Os nomes deste capítulo descrevem **observações concretas**. Aprenda a prever a observação antes de memorizar o nome. Um nível de isolamento define garantias; ele não escolhe sozinho as regras da loja.

## Contrato dos roteiros A/B

Os exemplos executáveis usam PostgreSQL 18 e o [banco descartável do laboratório](laboratorio/README.md), com autocommit ligado fora dos blocos `BEGIN`/`COMMIT`. Os resultados descritos são esperados; o registro do que foi efetivamente executado está no laboratório. Abra duas conexões, confira `SELECT pg_backend_pid()` diferente em A e B, e siga **os passos numerados**. Quando uma tabela disser “A consulta de novo”, repita o mesmo `SELECT` no mesmo bloco de transação.

Antes de cada variação, finalize as transações anteriores com `ROLLBACK` e aplique o reset restrito do laboratório. Ao terminar, faça o mesmo. Os comandos abaixo alteram vendas fictícias para expor visibilidade; o exemplo de estoque ao final também não é uma implementação de compra. Use somente o banco identificado pelo laboratório.

## O relatório da loja: cinco intercalações

Retome o relatório do capítulo anterior. O reset deixa `acid_lab.vendas_relatorio` com produto 1: 10 unidades a 500 centavos; produto 2: 20 unidades a 400 centavos. Os subtotais são 5000 e 8000 centavos; o total é **13000 centavos, R$ 130,00**. Quantidade vendida é diferente do estoque da narrativa de compra. Alterar este relatório não baixa estoque nem cria pedidos.

Usaremos duas consultas, apresentadas aqui antes da alternância. A primeira mostra os detalhes; a segunda calcula o total. `SUM` soma uma expressão em várias linhas; `AS` dá um nome à coluna calculada.

```sql
-- Consulta DETALHES: uma linha por produto com vendas positivas.
SELECT produto_id, quantidade, preco_centavos,
       quantidade * preco_centavos AS subtotal_centavos
FROM acid_lab.vendas_relatorio
WHERE quantidade > 0
ORDER BY produto_id;
```

```sql
-- Consulta TOTAL: uma linha com a soma das mesmas vendas.
SELECT SUM(quantidade * preco_centavos) AS total_centavos
FROM acid_lab.vendas_relatorio
WHERE quantidade > 0;
```

As tabelas abaixo dizem quando executar **DETALHES** e **TOTAL**: são os blocos completos acima, não comandos SQL com esses nomes. Antes de cada consulta, escreva sua previsão. Depois execute e compare com a resposta oculta. Não pule o reset entre variações. Se interromper, execute `ROLLBACK` nas duas sessões; o reset restrito pode ser feito depois que elas terminarem. Os testes observam visibilidade; não medem desempenho, corrupção de arquivos, replicação ou proteção de uma compra.

### A — Detalhes antigos e total recém-confirmado

Objetivo: observar duas consultas diferentes na mesma transação `READ COMMITTED`. B passa a quantidade do produto 1 de 10 para 15 e confirma. Seu subtotal passa de 5000 para 7500; com o outro produto, o total passa a 15500.

| Passo | Sessão A | Sessão B | Previsão antes de consultar |
|---|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | — | — |
| 2 | Executa DETALHES | — | Quais subtotais aparecerão? |
| 3 | — | Executa a alteração abaixo e confirma | — |
| 4 | Executa TOTAL | — | 13000 ou 15500? Por quê? |
| 5 | `COMMIT;` | — | — |

```sql
-- B, passo 3: este bloco termina antes do TOTAL de A.
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.vendas_relatorio SET quantidade = 15
WHERE produto_id = 'produto-1';
COMMIT;
```

<details>
<summary>Resposta comentada: previsão e conclusão da variação A</summary>

Esperado: A vê detalhes de 5000 e 8000, depois total **15500**. B alterou uma linha e confirmou entre as consultas. Ambas consultaram somente dados confirmados; o relatório montado pela aplicação misturou visões de dois momentos. Isso não prova corrupção do banco e não é dirty read. Como são consultas diferentes, primeiro descreva essa mistura temporal; a variação seguinte repete exatamente a consulta para evidenciar a leitura não repetível.

Ao executar, registre seus resultados observados junto dos esperados. Se diferirem, confira a ordem e as conexões antes de concluir que a engine violou uma garantia.

</details>

### B — Repetir a consulta revela a mudança da mesma linha

Depois do reset, repita A com **DETALHES também no passo 4**, no lugar de TOTAL. A continua em `READ COMMITTED`; B usa o mesmo bloco de alteração confirmado acima. Antes de cada leitura, preveja a quantidade e o subtotal do produto 1.

<details>
<summary>Resposta comentada: previsão e conclusão da variação B</summary>

Primeira leitura: quantidade 10 e subtotal 5000. Segunda: quantidade **15** e subtotal **7500**. A mesma linha apareceu com outro valor depois de uma alteração concorrente confirmada. Isso é **leitura não repetível**, ou *non-repeatable read*. O problema não é uma mudança sem commit; é a mudança entre leituras dentro da transação.

O comportamento é permitido nesse nível. Uma tela de acompanhamento pode querer o valor recém-confirmado; um relatório que promete o mesmo recorte em todas as partes precisa de outra abordagem.

</details>

### C — Um produto passa a integrar o conjunto

Uma **leitura fantasma**, ou *phantom read*, ocorre quando a repetição de uma consulta encontra um conjunto diferente de linhas que satisfazem o filtro, por uma alteração concorrente confirmada.

Depois do reset, use esta intercalação; o produto 3 ainda não existe na base inicial:

| Passo | A | B | Previsão antes de consultar |
|---|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | — | — |
| 2 | Executa DETALHES | — | Quais produtos pertencem ao resultado? |
| 3 | — | Insere o produto 3 com o bloco abaixo | — |
| 4 | Executa DETALHES de novo | — | O conjunto permanece igual? |
| 5 | Executa TOTAL; `COMMIT;` | — | 13000 ou 14000? |

```sql
-- B, passo 3: uma instrução, em autocommit ligado.
INSERT INTO acid_lab.vendas_relatorio(produto_id, quantidade, preco_centavos)
VALUES ('produto-3', 2, 500);
```

<details>
<summary>Resposta comentada: previsão e conclusão da variação C</summary>

A primeira leitura retorna os produtos 1 e 2. A segunda acrescenta produto 3, subtotal **1000**, e TOTAL retorna **14000**. A inclusão no conjunto caracteriza o phantom; a inserção foi confirmada pelo autocommit antes de A repetir a consulta. Uma página que guardou só os detalhes iniciais e consultou o total depois também misturaria momentos.

O fenômeno não exige `INSERT`: um `UPDATE` pode fazer uma linha passar a satisfazer o filtro ou deixar de satisfazê-lo. Uma linha com quantidade zero passa a entrar quando a quantidade se torna positiva.

</details>

Para verificar a variante por `UPDATE`, resete, inicie A em `READ COMMITTED` e execute DETALHES; antes da repetição em A, execute em B, com autocommit ligado:

```sql
UPDATE acid_lab.vendas_relatorio SET quantidade = 0
WHERE produto_id = 'produto-2';
```

**Preveja antes de A repetir DETALHES:** qual produto sai do filtro `quantidade > 0`? Espere apenas produto 1, subtotal 5000; ao consultar TOTAL na mesma condição, espere 5000. A linha do produto 2 continua na tabela, mas saiu do conjunto. Encerre A com `COMMIT` e resete. Não se trata de dado perdido nem de exclusão da linha.

### D — Repetir o relatório sobre a mesma fotografia

Objetivo: usar uma transação **somente de leitura** (`READ ONLY`) em `REPEATABLE READ`. Ela mantém o recorte sem impedir B de confirmar a alteração. Depois do reset:

| Passo | A | B | Previsão antes de consultar |
|---|---|---|---|
| 1 | Executa o `BEGIN` abaixo | — | A fotografia já foi fixada só por BEGIN? |
| 2 | Executa DETALHES | — | Quais valores entram na fotografia? |
| 3 | — | Confirma quantidade 15 do produto 1, como em A | — |
| 4 | Executa TOTAL e DETALHES novamente | — | Valores iniciais ou novos? |
| 5 | `COMMIT;`; executa TOTAL em autocommit | — | O que muda após encerrar o recorte? |

```sql
-- A, passo 1.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
```

<details>
<summary>Resposta comentada: previsão e conclusão da variação D</summary>

A vê inicialmente 5000 e 8000; depois de B confirmar, continua vendo esses detalhes e total **13000**. A consulta nova, depois do `COMMIT`, vê **15500**. Isso demonstra estabilidade, sem prometer informação mais recente em cada passo.

No PostgreSQL, o snapshot de `REPEATABLE READ` é fixado pela primeira instrução que não é controle de transação — neste roteiro, o primeiro `SELECT` — e não apenas por executar `BEGIN`. Para distinguir os momentos, resete e troque a ordem: A executa só BEGIN; B altera e confirma; A faz seu primeiro DETALHES. Agora A já começa vendo subtotal **7500** e total **15500**. Encerre e resete antes de outra variação.

</details>

Repita C com o `BEGIN ... REPEATABLE READ READ ONLY` acima: mesmo após a inserção confirmada de B, A permanece com dois produtos e total 13000 até encerrar. PostgreSQL 18 não permite phantom em `REPEATABLE READ`, embora o padrão SQL permita implementações desse nível com garantia menor. [Garantias específicas da engine](https://www.postgresql.org/docs/18/transaction-iso.html).

A analogia é consultar uma fotografia do relatório: duas consultas à mesma foto mantêm os números, embora a loja continue vendendo. **Limite:** o snapshot não é uma fotografia literal, nem reserva estoque; numa transação que permita escrita, suas próprias alterações anteriores continuam visíveis para você.

**Responda antes de abrir:** uma fotografia estável dos dados é necessariamente a informação mais recente?

<details>
<summary>Resposta comentada</summary>

Não. Ela mantém o recorte estabelecido pela transação, enquanto novos commits podem acontecer fora dele. A alternativa enganosa é imaginar que “consistente entre as partes” e “atualizado a cada consulta” são o mesmo requisito. Escolha qual deles a tela ou o relatório precisa cumprir.

</details>

### E — A outra sessão mudou, mas ainda não confirmou

Uma **leitura suja**, ou *dirty read*, seria ler a alteração não confirmada de outra transação. Depois do reset, B muda a quantidade para 15 e mantém a transação aberta. A pede `READ UNCOMMITTED` deliberadamente, para testar o comportamento do PostgreSQL:

| Passo | A | B | Previsão antes de consultar |
|---|---|---|---|
| 1 | — | Executa BEGIN e UPDATE abaixo; não confirma | — |
| 2 | `BEGIN ISOLATION LEVEL READ UNCOMMITTED;`; executa TOTAL | Mantém aberto | A verá 13000 ou 15500? |
| 3 | — | `ROLLBACK;` | — |
| 4 | Repete TOTAL; `COMMIT;` | — | O resultado muda? |

```sql
-- B, passo 1; pare sem COMMIT.
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.vendas_relatorio SET quantidade = 15
WHERE produto_id = 'produto-1';
```

<details>
<summary>Resposta comentada: previsão e conclusão da variação E</summary>

A retorna **13000** em ambas as consultas. PostgreSQL 18 trata `READ UNCOMMITTED` como `READ COMMITTED`: a leitura comum não vê a quantidade não confirmada de B. A ausência de leitura suja foi testada, não a sua reprodução. Uma engine que realmente permitisse esse fenômeno poderia expor 15500 antes de B desfazer; isso é uma explicação conceitual, não uma saída atribuída ao PostgreSQL. A reprodução em MySQL/InnoDB fica no [comparativo separado](laboratorio/mysql-comparativo/README.md).

</details>

**Responda antes de abrir:** ler um valor antigo significa necessariamente dirty read?

<details>
<summary>Resposta comentada</summary>

Não. “Antigo” fala de atualidade; dirty read fala de ler alteração de **outra transação ainda não confirmada**. Um snapshot pode conservar um estado anterior que foi confirmado normalmente. A alternativa enganosa é usar “sujo” como sinônimo de “desatualizado”.

</details>

## Detalhes e total em uma única instrução

Se todo o relatório cabe em uma consulta, podemos calcular o total sem perder as linhas de detalhe. Uma **função de janela** faz um cálculo sobre várias linhas mantendo cada uma no resultado. `SUM(...) OVER ()` calcula aqui o mesmo total para todas as linhas retornadas; não é preciso decorar a sintaxe agora. [Funções de janela no PostgreSQL 18](https://www.postgresql.org/docs/18/tutorial-window.html).

```sql
-- PostgreSQL 18, READ COMMITTED, autocommit ligado.
-- Após reset: duas linhas, subtotais5000/8000; total13000 em cada linha.
SELECT produto_id, quantidade, preco_centavos,
       quantidade * preco_centavos AS subtotal_centavos,
       SUM(quantidade * preco_centavos) OVER () AS total_centavos
FROM acid_lab.vendas_relatorio
WHERE quantidade > 0
ORDER BY produto_id;
```

Antes de executar, preveja os detalhes e o total no estado inicial; depois execute a alteração confirmada da variação A e preveja uma nova execução da instrução. Na primeira, espere subtotais 5000/8000 e total 13000; na segunda, 7500/8000 e total 15500. Dentro de **cada execução dessa leitura comum**, detalhes e total usam o snapshot daquela instrução. Entre execuções eles podem mudar. O alcance termina aí: não reserva estoque, não mantém automaticamente a mesma fotografia em consultas posteriores e não prova ganho de desempenho. É uma alternativa para este relatório pequeno, não um substituto universal de transações.

## Investigue antes de atribuir uma causa

**Responda antes de abrir:** o que muda ao consultar outra réplica?

<details>
<summary>Resposta comentada</summary>

Uma réplica de leitura é outra cópia do banco. Além do isolamento da sessão, passa a importar até qual commit essa cópia já recebeu e aplicou. Uma réplica PostgreSQL pode estar atrasada em relação ao primário; novos snapshots nela veem o que foi reaplicado ali. Portanto, “A confirmou no primário” não prova que uma leitura imediata em outra cópia verá a mudança. Esses laboratórios usam um único servidor local e não reproduzem esse atraso. A alternativa enganosa é atribuir toda diferença entre cópias ao nível de isolamento. [Leitura em hot standby](https://www.postgresql.org/docs/18/hot-standby.html).

</details>

**Responda antes de abrir:** qual evidência preciso obter antes de culpar o nível de isolamento?

<details>
<summary>Resposta comentada</summary>

Registre as consultas exatas, versão da engine, nível efetivo, autocommit, IDs de conexão, ordem dos comandos e momento de cada commit. Confirme também se as leituras foram ao mesmo servidor e se aplicação ou cache reaproveitou algum resultado. Compare a observação com a garantia daquele produto. “O número mudou” sozinho não distingue mistura temporal, atraso de réplica, cálculo da aplicação ou uma anomalia permitida.

</details>

## A estabilidade do relatório não protege toda escrita

Volte ao estoque para separar leitura estável de decisão concorrente. Contrato: PostgreSQL 18, autocommit ligado fora dos blocos, reset com `SKU-1` em estoque 1; A e B têm PIDs diferentes.

| Passo | A | B | Esperado |
|---|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL REPEATABLE READ;`; consulta abaixo | — | A lê estoque1 |
| 2 | — | `UPDATE` abaixo, autocommit | B confirma estoque0 |
| 3 | Tenta o segundo `UPDATE` abaixo | — | Erro de serialização `40001` |
| 4 | `ROLLBACK;` | — | Recupera A; estoque continua0 |

```sql
-- A, passo 1: iniciar antes da consulta.
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT estoque FROM acid_lab.produtos WHERE id = 'SKU-1';
```

```sql
-- B, passo 2, autocommit ligado.
UPDATE acid_lab.produtos SET estoque = 0 WHERE id = 'SKU-1';
```

```sql
-- A, passo 3, após B confirmar.
UPDATE acid_lab.produtos SET estoque = estoque - 1 WHERE id = 'SKU-1';
-- Esperado: erro40001. Execute ROLLBACK; depois encerre ambas e resete.
```

A não pode alterar livremente uma linha que outra transação mudou depois de seu snapshot. O teste demonstra proteção contra esse conflito na mesma linha, **não** proteção de toda regra envolvendo linhas diferentes.

**Responda antes de abrir:** um snapshot estável protege qualquer decisão concorrente? Se ninguém consegue mudar a fotografia, ninguém consegue mudar a loja?

<details>
<summary>Resposta comentada</summary>

Não. Outras transações podem mudar o banco, enquanto sua visão permanece estável. Para uma decisão, importa também o que você escreve e como isso interage com as decisões das outras. Confundir “não verei a mudança” com “a mudança está proibida” é a alternativa enganosa.

</details>

## Quatro nomes do padrão; garantias da engine em outra tabela

Esta primeira tabela é **conceitual**: resume fenômenos que o padrão permite. “Permitido” não exige que uma engine os produza e não é uma previsão de toda consulta. A atualização perdida precisa ser analisada com o SQL concreto; ela não cabe adequadamente numa tabela só de tipos de leitura.

| Nível do padrão SQL | Leitura suja pode ocorrer? | Não repetível pode ocorrer? | Phantom pode ocorrer? | Anomalia de serialização pode ocorrer? |
|---|---|---|---|---|
| Read Uncommitted | Sim | Sim | Sim | Sim |
| Read Committed | Não | Sim | Sim | Sim |
| Repeatable Read | Não | Não | Sim | Sim |
| Serializable | Não | Não | Não | Não |

Agora as diferenças e os limites que usamos **no PostgreSQL 18**:

| Nível solicitado | Contrato relevante nesta trilha |
|---|---|
| `READ UNCOMMITTED` | Mesmo comportamento de `READ COMMITTED`; não reproduz leitura suja |
| `READ COMMITTED` | Leituras comuns renovam o retrato entre instruções; mudanças confirmadas podem entrar na consulta seguinte |
| `REPEATABLE READ` | Retrato estável; sem phantoms; ainda pode haver anomalia envolvendo decisões concorrentes |
| `SERIALIZABLE` | As transações confirmadas têm efeito equivalente a alguma ordem serial; conflitos podem exigir aborto e nova tentativa |

Não escolha o nível só pela quantidade de “não” numa tabela. Declare a regra, veja os acessos reais e planeje a recuperação de erros. A lista não diz que `SERIALIZABLE` será sempre mais lento ou sempre mais rápido.

## Aprofundamento opcional: duas pessoas deixam o turno

Ana e Bruno estão responsáveis por um turno. Regra nova e explícita para este exemplo separado: **pelo menos uma pessoa deve permanecer responsável**. Não usamos aqui saldos nem transferências. Cada pessoa só pode retirar a si própria se houver outra responsável.

| Passo | Transação A | Transação B |
|---|---|---|
| 1 | Lê Ana e Bruno responsáveis | — |
| 2 | — | Lê Ana e Bruno responsáveis |
| 3 | Decide que Ana pode sair; altera só a linha de Ana | — |
| 4 | — | Decide que Bruno pode sair; altera só a linha de Bruno |
| 5 | Confirma | Confirma |

Em um cenário de snapshot isolation, as duas podem alterar linhas diferentes sem o conflito de escrita na mesma linha que vimos antes. Cada decisão pareceu válida em seu retrato; o conjunto deixa zero responsáveis. Isso é **write skew**, uma forma de anomalia de serialização. Não haveria uma ordem serial equivalente: a segunda pessoa a decidir encontraria apenas uma responsável e teria de permanecer.

Esse quadro explica por que `REPEATABLE READ` não encerra toda discussão de corretude. Para reproduzir no laboratório, use a tabela `acid_lab.turno`, que começa com `Ana` e `Bruno` com `presente = true`. O contrato é PostgreSQL 18, autocommit ligado fora dos blocos, duas conexões distintas e reset antes da variação. Siga a ordem, sem executar A inteira antes de B:

| Passo | A | B | Esperado |
|---|---|---|---|
| 1 | Inicia em `REPEATABLE READ`; conta presentes | — | 2 |
| 2 | — | Inicia em `REPEATABLE READ`; conta presentes | 2 |
| 3 | Retira Ana; confirma | — | A conclui |
| 4 | — | Retira Bruno; confirma | B conclui; zero responsáveis |

```sql
-- A, passo 1; B executa o mesmo no passo 2.
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT count(*) FROM acid_lab.turno WHERE presente;
-- Pare para a outra sessão estabelecer seu retrato.
```

```sql
-- A, passo 3: a decisão usou a contagem 2 observada antes.
UPDATE acid_lab.turno SET presente = false WHERE nome = 'Ana';
COMMIT;
```

```sql
-- B, passo 4: usa sua contagem 2, sem refazer a decisão em estado atual.
UPDATE acid_lab.turno SET presente = false WHERE nome = 'Bruno';
COMMIT;
```

Verifique em uma consulta nova: `SELECT count(*) FROM acid_lab.turno WHERE presente;` retorna **0**. Este é um fluxo inseguro que demonstra a regra entre linhas quebrada; não use esse padrão para admitir saídas do turno.

Encerre A/B, resete e repita os mesmos passos trocando o início de **ambas** para `BEGIN ISOLATION LEVEL SERIALIZABLE;`. Agora o conjunto de duas saídas não pode confirmar assim: espere um erro `40001`, que pode aparecer antes do `COMMIT`. Encerre a transação com `ROLLBACK` e confira que resta **1** responsável. Para a tentativa abortada, recomece a transação e a consulta; a contagem atual 1 impede a nova saída. O roteiro demonstra proteção da equivalência serial e a necessidade de tratar falhas, não sucesso garantido de ambas as intenções nem atuação em outros bancos. Ao terminar, encerre transações e resete. Uma proteção possível concentra a decisão em um recurso compartilhado; outra usa todas as transações relevantes em `SERIALIZABLE` e trata os abortos. A escolha depende dos caminhos que precisam respeitar a regra. [Verificações de consistência na aplicação](https://www.postgresql.org/docs/18/applevel-consistency.html).

## O banco pode dizer “refaça a decisão”

Em `SERIALIZABLE`, preservar a garantia pode exigir interromper uma transação. No PostgreSQL, um erro de serialização tem SQLSTATE `40001`. A aplicação deve desfazer e repetir **a transação inteira**, incluindo leituras e decisões, com limite de tentativas. Reenviar só a última escrita conserva uma decisão antiga e perde o propósito da nova tentativa. Um erro de negócio, como falta de estoque, não deve virar repetição automática sem fim. [Tratamento oficial de falhas de serialização](https://www.postgresql.org/docs/18/mvcc-serialization-failure-handling.html).

**Responda antes de abrir:** “se o banco abortou minha transação, ele descumpriu ACID”. Essa conclusão procede?

<details>
<summary>Resposta comentada</summary>

Não. O aborto pode ser justamente a ação necessária para que as transações que confirmaram preservem a garantia escolhida. A aplicação precisa saber reagir. O engano é supor que uma garantia forte implica sucesso de toda tentativa; ela garante propriedades dos resultados admitidos.

</details>

No trabalho, leve uma linha do tempo para a discussão. Dizer “A leu antes, B confirmou aqui, A escreveu depois” revela mais do que dizer apenas “há concorrência”. Em linguagem simples: o nível de isolamento define o que pode aparecer entre seus passos e quais conflitos podem impedir a confirmação.

[Próxima: proteger a decisão](05-locks-concorrencia-deadlocks.md) · [Glossário](glossario.md) · [Índice](README.md)
