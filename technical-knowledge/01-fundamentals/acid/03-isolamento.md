# 03 — Duas pessoas querem a última unidade

[Índice da trilha](README.md) · [Anterior: consistência](02-consistencia.md) · [Próxima: anomalias e níveis](04-anomalias-e-niveis.md)

Marina e Caio chegaram à finalização da compra na Loja Horizonte. Resta uma unidade de `SKU-1`. Ambos consultam o estoque antes que qualquer compra termine. O que acontece se os dois ouvirem “tem uma unidade” e decidirem comprar?

Vamos fixar a regra: **colocar no carrinho não reserva estoque**. Nesta trilha, a compra aceita baixa o estoque e registra o pedido na mesma transação; a baixa e o pedido tornam-se confirmados no `COMMIT`. Durante o bloco, os locks da escrita já coordenam a disputa com outros escritores, embora uma leitura comum de outra sessão ainda não veja a baixa não confirmada. Não há pagamento ou serviço externo neste exercício. Uma compra recusada não cria pedido.

## Antes de comprar: um relatório que precisa fazer sentido

Nem toda transação muda dados. A Loja Horizonte também prepara um relatório de vendas: primeiro busca os detalhes por produto; depois consulta o total. Nesta pequena tabela, cada linha representa um produto e suas vendas acumuladas, não uma compra individual nem o estoque disponível.

| Produto | Quantidade vendida | Preço unitário | Subtotal |
|---|---|---|---|
| produto-1 | 10 | 500 centavos, R$ 5,00 | 5000 centavos, R$ 50,00 |
| produto-2 | 20 | 400 centavos, R$ 4,00 | 8000 centavos, R$ 80,00 |
| Total | — | — | **13000 centavos, R$ 130,00** |

Entre a consulta dos detalhes e a consulta do total, outra transação confirma mais cinco unidades do produto 1. A quantidade passa a 15; seu subtotal, a 7500; o total novo, a **15500 centavos, R$ 155,00**. Uma tela pode acabar exibindo os detalhes antigos e o total novo.

**Responda antes de abrir:** se cada consulta está correta para o momento em que foi executada, por que o relatório completo pode apresentar valores que não combinam?

<details><summary>Resposta comentada — as partes pertencem a momentos diferentes</summary>

A aplicação guardou os detalhes de antes da mudança e juntou a eles um total calculado depois da confirmação. Duas respostas corretas separadamente não prometem o mesmo recorte temporal. O relatório precisa definir essa necessidade e escolher como obtê-la. A alternativa enganosa é supor que uma consulta correta congela o banco para todas as consultas seguintes.

</details>

Esse exemplo adapta a ideia de relatório presente no material fornecido; os roteiros e as ressalvas para PostgreSQL foram construídos nesta trilha e estão detalhados no [próximo capítulo](04-anomalias-e-niveis.md). A [nota de revisão técnica](referencias-e-revisao-tecnica.md) separa contribuição e correção.

**Responda antes de abrir:** por que usar uma transação se estou apenas fazendo `SELECT`?

<details>
<summary>Resposta comentada</summary>

Para definir como várias consultas se relacionam no tempo. Se o relatório precisa que detalhes e total representem o mesmo recorte, uma transação com isolamento adequado pode manter essa visão. Um `BEGIN` sozinho, com `READ COMMITTED`, não promete isso; cada consulta ainda pode ver commits novos. A alternativa enganosa é imaginar que transação só existe para confirmar escritas.

</details>

**Responda antes de abrir:** um total diferente dos detalhes prova que o banco foi corrompido?

<details>
<summary>Resposta comentada</summary>

Não. Pode ser apenas a aplicação combinando consultas de momentos diferentes, como no exemplo. Para esse relatório isso quebra a apresentação desejada, mas não prova que os registros armazenados estão inválidos nem que algum arquivo foi corrompido. Primeiro reconstrua a ordem das leituras e commits. A alternativa enganosa transforma uma observação insuficiente numa causa definitiva.

</details>

**Responda antes de abrir:** ler somente dados confirmados garante o mesmo resultado em duas consultas?

<details>
<summary>Resposta comentada</summary>

Não. Uma nova alteração pode ser confirmada entre as duas. Em `READ COMMITTED`, a segunda consulta pode vê-la legitimamente. A garantia de não ler trabalho não confirmado não equivale a manter a mesma fotografia durante todo o relatório.

</details>

Na compra, queremos proteger uma decisão que altera o estado compartilhado. No relatório, queremos uma relação definida entre leituras. O nome isolamento aparece nos dois problemas, mas a necessidade concreta é diferente.

## Duas leituras verdadeiras podem sustentar uma decisão errada

Uma **condição de corrida** aparece quando o resultado depende da ordem em que operações concorrentes se intercalam. Concorrência significa que os períodos de execução se sobrepõem; não exige que dois processadores executem exatamente no mesmo instante.

Considere uma aplicação que lê o estoque, calcula o novo valor fora do banco e depois grava esse número. Cada transação pode ter SQL perfeitamente válido, e ainda assim o conjunto admitir duas compras.

| Momento | Sessão A, compra de Marina | Sessão B, compra de Caio | Estado confirmado |
|---|---|---|---|
| 1 | Lê estoque = 1 | — | 1 unidade; nenhum pedido |
| 2 | — | Lê estoque = 1 | 1 unidade; nenhum pedido |
| 3 | Calcula 1 − 1 = 0 | Calcula 1 − 1 = 0 | Sem mudança |
| 4 | Grava 0; cria pedido A; confirma | — | 0 unidades; 1 pedido |
| 5 | — | Grava o 0 calculado antes; cria pedido B; confirma | 0 unidades; **2 pedidos** |

O estoque final não ficou negativo. Portanto, até um `CHECK (estoque >= 0)` pode aceitar as duas gravações. A regra violada está na relação entre a unidade disponível e as compras admitidas. Uma atualização sobrescreveu a outra sem representar o segundo consumo: uma **atualização perdida**, ou *lost update*.

**Responda antes de abrir:** por que ler `estoque = 1` não garante que ainda poderei comprar depois? Escolha entre “a leitura estava errada” e “outra operação pode agir entre a leitura e minha escrita”.

<details>
<summary>Resposta comentada</summary>

A leitura pode estar correta no momento em que foi feita. O problema é o intervalo até a decisão ser aplicada. Nesse intervalo outra compra pode consumir a unidade. A alternativa “a leitura estava errada” desvia a atenção: aumentar a precisão da leitura não protege automaticamente os passos seguintes.

</details>

## O que isolamento quer dizer

Isolamento é a propriedade que controla a interferência entre transações concorrentes. A referência ideal é um resultado que poderia ter sido obtido executando as transações uma por vez, em alguma ordem. Os bancos também oferecem níveis com garantias menores; por isso precisamos dizer qual nível foi escolhido.

A analogia de uma fila ajuda: se Marina comprasse primeiro, Caio encontraria estoque zero; se Caio comprasse primeiro, Marina encontraria zero. Um resultado com dois pedidos aceitos não corresponde a nenhuma dessas ordens. **O limite da analogia** é físico: o banco pode sobrepor trabalho e ainda garantir um resultado equivalente ao de uma fila. `SERIALIZABLE` não exige que todas as instruções sejam executadas literalmente em sequência.

O “I” não significa que transações são independentes ou que podem começar e terminar em qualquer ordem sem consequências. Elas compartilham dados e podem esperar, falhar ou precisar de nova tentativa. O próximo capítulo mostra exatamente quais observações cada nível permite. [Definição e níveis no PostgreSQL 18](https://www.postgresql.org/docs/18/transaction-iso.html).

## Ler uma versão não é reservar uma linha

Uma **versão** é um estado de uma linha relevante para a visibilidade de alguma transação. Um **snapshot**, ou retrato de leitura, determina quais alterações são visíveis naquele contexto. Não é uma cópia particular completa do banco feita para cada pessoa.

No PostgreSQL, o controle de concorrência com várias versões recebe a sigla **MVCC**. Uma leitura comum pode consultar um estado confirmado enquanto outra transação prepara uma alteração. Assim, o banco evita que toda leitura precise esperar por toda escrita. Isso beneficia a consulta de um catálogo, mas ler uma versão não dá ao leitor exclusividade sobre a unidade disponível. [Introdução ao MVCC](https://www.postgresql.org/docs/18/mvcc-intro.html).

Um **lock** é uma proteção que coordena acessos conflitantes a um recurso. Em português, costuma-se dizer bloqueio ou trava. Ele não é uma “senha de dono do banco”: há recursos e modos diferentes. Um lock sobre uma linha pode fazer outro escritor esperar, enquanto um `SELECT` comum continua lendo uma versão visível. Além disso, o próprio `UPDATE` adquire proteções; não depende de um `FOR UPDATE` anterior para ter algum lock.

| Ação | Pergunta que ela responde | O que não concede sozinha |
|---|---|---|
| `SELECT` comum | O que esta consulta pode ver? | Reserva para uma escrita futura |
| `UPDATE` | Posso aplicar esta escrita, respeitando conflitos e regras? | Validade de um cálculo antigo que veio da aplicação |
| `SELECT ... FOR UPDATE` | Posso proteger estas linhas para decidir dentro da transação? | Proteção automática de linhas ausentes ou de toda regra entre tabelas |

## A própria sessão vê o que acabou de fazer

O contrato abaixo vale para PostgreSQL 18, com autocommit ligado fora dos blocos explícitos e `READ COMMITTED` dentro deles. Prepare o [laboratório local](laboratorio/README.md) e seu estado inicial: `SKU-1` com estoque 1. Use duas conexões exclusivas do laboratório; duas abas podem compartilhar uma conexão.

Em **cada conexão**, execute antes de começar:

```sql
SELECT pg_backend_pid(); -- A e B devem receber números diferentes.
SHOW transaction_isolation;
```

No cliente `psql`, `\echo :AUTOCOMMIT` deve mostrar `on`. Esse comando do cliente não é SQL. A versão exata executada consta no relatório do laboratório; os resultados abaixo são expectativas para PostgreSQL 18.

Siga a ordem da tabela. Não execute todos os comandos de A antes de iniciar B.

| Passo | Sessão A | Sessão B | Resultado esperado |
|---|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | — | A abre transação |
| 2 | Atualiza estoque para 0 | — | Alteração ainda não confirmada |
| 3 | Consulta estoque | — | A vê **0** |
| 4 | — | Consulta estoque, em autocommit | B vê **1**, sem esperar por esse lock de linha |
| 5 | `ROLLBACK;` | — | A desfaz sua mudança |
| 6 | — | Consulta estoque novamente | B continua vendo **1** |

Blocos de A, executados nos passos indicados:

```sql
-- A: passos 1, 2 e 3.
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.produtos SET estoque = 0 WHERE id = 'SKU-1';
SELECT estoque FROM acid_lab.produtos WHERE id = 'SKU-1';
-- Pare aqui para B consultar no passo 4.
```

```sql
-- A: passo 5, depois da consulta de B.
ROLLBACK;
```

Bloco de B, usado nos passos 4 e 6:

```sql
SELECT estoque FROM acid_lab.produtos WHERE id = 'SKU-1';
```

O `ROLLBACK` restaura o estado inicial sem reset adicional. Se interromper o exercício, encerre qualquer transação aberta com `ROLLBACK` em A e B. O teste demonstra a visibilidade da própria escrita e a ausência de leitura suja na outra sessão; **não** demonstra que todo leitor vê sempre o estado mais recente, nem que a aplicação já protegeu uma compra.

**Responda antes de abrir:** o que minha sessão vê antes de `COMMIT`? E a outra? A resposta “ninguém pode ver nada antes de confirmar” está correta?

<details>
<summary>Resposta comentada</summary>

A própria transação vê suas alterações anteriores. Em nosso teste, A vê zero; B, em uma leitura comum de `READ COMMITTED`, vê o último estado confirmado disponível no início da consulta: uma unidade. Dizer que “ninguém vê” confunde visibilidade para outras transações com a capacidade de a própria transação continuar seu trabalho.

</details>

## Uma primeira proteção, sem fingir que ela resolve tudo

Para esta regra de uma única linha, podemos fazer a verificação na escrita:

```sql
-- PostgreSQL 18, uma sessão, READ COMMITTED, autocommit ligado.
-- Inicial: SKU-1 estoque 1. Aqui mostramos só a primitiva de estoque.
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.produtos
SET estoque = estoque - 1, versao = versao + 1
WHERE id = 'SKU-1' AND estoque >= 1
RETURNING id, estoque, versao;
-- Esperado: uma linha, estoque 0. Ainda falta registrar o pedido.
ROLLBACK; -- Demonstração: desfaz; volta a estoque 1, versão 0.
```

`RETURNING` devolve os valores das linhas que a instrução alterou. Zero linhas não é exceção automática: significa que a condição não encontrou uma linha elegível. A aplicação precisa conferir o resultado. A compra completa deve registrar o pedido somente se a baixa aconteceu, e confirmar as duas partes juntas. No [capítulo 05](05-locks-concorrencia-deadlocks.md) faremos isso por três caminhos.

Em `READ COMMITTED`, dois `UPDATE`s condicionais que disputam a mesma linha não passam livremente pela verificação antiga. Um pode esperar pelo outro; se o primeiro confirmar estoque zero, o segundo reavalia o predicado sobre a linha atualizada e não encontra uma unidade disponível. Isso é uma garantia específica da operação e da engine, não um argumento para dispensar análise de regras mais amplas.

## Quando isso aparece no trabalho

Uma oferta de vaga, a última cadeira de uma sessão e um contador de uso compartilham a mesma pergunta: a verificação continua válida quando a decisão é gravada? Primeiro escreva a regra, depois identifique o dado que duas operações disputam. Só então escolha lock, escrita condicional, versão ou isolamento mais forte.

Explique em voz alta: “ler é observar; comprar é tomar uma decisão protegida e registrar seu efeito”. Se sua explicação só diz “coloco um `BEGIN`”, ainda falta dizer o que impede a outra transação de tomar a mesma decisão.

[Próxima: anomalias e níveis](04-anomalias-e-niveis.md) · [Glossário](glossario.md) · [Índice](README.md)
