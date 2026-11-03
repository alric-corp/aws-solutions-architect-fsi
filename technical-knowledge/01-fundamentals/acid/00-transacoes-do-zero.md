# 00 — Antes de ACID: o que é uma transação?

[Índice da trilha](README.md) · [Próxima: atomicidade](01-atomicidade.md) · [Glossário](glossario.md)

Na Loja Horizonte, duas pessoas querem comprar a última unidade de uma caneca. A página mostra “1 disponível”. Isso descreve um instante; ainda precisamos decidir quem pode levar o produto e registrar essa decisão. Se o sistema diminuir o estoque e falhar antes de criar o pedido, alguém verá “esgotado” sem que exista uma compra correspondente.

Vamos declarar a regra antes de construir a solução: **colocar no carrinho não reserva estoque**. Neste exercício, a unidade fica comprometida quando a transação que baixa o estoque e registra o pedido é confirmada. Não modelamos pagamento, entrega, expiração de reserva ou serviços externos. Duas compras diferentes podem disputar a unidade; repetir uma compra já feita é outro problema, tratado no capítulo 07.

Esta aula apresenta as peças necessárias para acompanhar o restante. Você não precisa instalar nada para prever os resultados no papel. Para executar, siga primeiro a preparação do [laboratório local](laboratorio/README.md).

## Onde ficam os dados e quem recebe os comandos

Um **banco de dados** reúne dados organizados. O **SGBD**, sistema gerenciador de banco de dados, é o software que os administra: PostgreSQL é um exemplo. A palavra *engine* costuma designar o mecanismo que executa e armazena operações; seu significado depende do produto. No MySQL, por exemplo, InnoDB é uma engine de armazenamento. Não suponha que todos os produtos executem o mesmo SQL com o mesmo comportamento.

**SQL** é a linguagem em que vamos pedir consultas e alterações. O **cliente** é o programa que envia esses pedidos: um terminal `psql`, uma ferramenta gráfica ou a aplicação da loja. O cliente não é o banco. Fechar sua janela não apaga dados já confirmados.

Uma **tabela** organiza registros com a mesma estrutura. Cada **linha** representa um registro; cada **coluna**, uma característica. Um tipo, como texto ou número inteiro, limita que valores cabem na coluna. Uma **chave** identifica um registro ou relaciona registros. No laboratório, `SKU-1` identifica o produto; `ana` e `bruno` identificam duas contas fictícias. Os nomes visíveis são Ana e Bruno.

| Tabela `produtos`: id | nome | estoque | versao |
|---|---|---:|---:|
| SKU-1 | Caneca Horizonte | 1 | 0 |

`acid_lab.produtos` significa “tabela `produtos` no **schema** `acid_lab`”. Um schema é um agrupamento de nomes dentro do banco. Usamos esse prefixo para tornar explícita a área descartável do exercício. [Conceitos de tabelas no PostgreSQL 18](https://www.postgresql.org/docs/18/tutorial-concepts.html)

## Cinco palavras de SQL antes de começar

Uma **consulta** pede informações. `SELECT` escolhe colunas e `FROM` indica a tabela. `WHERE` é um filtro: só entram as linhas que satisfazem a condição. Não significa “a primeira linha” nem limita automaticamente a alteração a um registro.

`INSERT` acrescenta linhas. `UPDATE` altera colunas das linhas encontradas; `SET` descreve os novos valores. `DELETE` remove linhas. Tanto `UPDATE` quanto `DELETE` podem atingir muitas linhas se o filtro for amplo, ou todas se não houver filtro. As aspas simples delimitam texto, como `'SKU-1'`. O ponto e vírgula encerra a instrução. Comentários iniciados por `--` explicam o exemplo e não são comandos.

**Prática 00.1 — vocabulário.** PostgreSQL 18, uma sessão, isolamento `READ COMMITTED`, cliente `psql` com autocommit ligado fora de blocos explícitos. Não depende do seed: cria uma tabela temporária, que existe somente nesta sessão. Execute na ordem; o `ROLLBACK` final também desfaz sua criação. O objetivo é reconhecer leitura, inclusão, alteração e remoção, sem mudar os dados compartilhados do laboratório.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
CREATE TEMP TABLE vocabulario_produto (
    id text PRIMARY KEY,
    nome text NOT NULL,
    estoque integer NOT NULL
);
INSERT INTO vocabulario_produto (id, nome, estoque)
VALUES ('SKU-1', 'Caneca Horizonte', 1); -- Acrescenta uma linha.

SELECT id, nome, estoque FROM vocabulario_produto
WHERE id = 'SKU-1';                     -- Uma linha, estoque 1.

UPDATE vocabulario_produto SET estoque = 0
WHERE id = 'SKU-1';                     -- Uma linha alterada.

SELECT estoque FROM vocabulario_produto
WHERE id = 'SKU-1';                     -- A própria sessão vê 0.

DELETE FROM vocabulario_produto WHERE id = 'SKU-1';
SELECT id FROM vocabulario_produto;      -- Zero linhas.
ROLLBACK;                               -- Encerra e limpa a prática.
```

`PRIMARY KEY` e `NOT NULL` são regras verificadas pelo banco; vamos abri-las no capítulo 02. O exercício demonstra os comandos e a leitura das próprias alterações. Uma tabela temporária não serve para testar o que outra sessão vê. [Inclusão](https://www.postgresql.org/docs/18/tutorial-populate.html), [consulta](https://www.postgresql.org/docs/18/tutorial-select.html), [alteração](https://www.postgresql.org/docs/18/tutorial-update.html) e [remoção](https://www.postgresql.org/docs/18/tutorial-delete.html) na documentação.

**Responda antes de abrir:** um `WHERE id = 'inexistente'` garante que uma linha será alterada? O que você esperaria ao consultar o produto depois do `DELETE`, antes do `ROLLBACK`?

<details>
<summary>Resposta comentada — filtro e resultado</summary>

O filtro descreve uma condição, não promete que exista uma linha correspondente. Se não existir, o `UPDATE` altera zero linhas. Depois do `DELETE`, a consulta da própria sessão retorna zero linhas: a remoção já faz parte do estado que ela observa. A alternativa enganosa é imaginar que a sessão só enxergue suas escritas depois de confirmá-las. Isso impediria até conferir uma operação em andamento.

</details>

## Uma operação de negócio pode precisar de vários comandos

Agora considere um segundo cenário, separado da loja: duas contas fictícias **no mesmo banco de dados**. Ana começa com R$ 1.000; Bruno, com R$ 100. Transferir R$ 100 deve produzir R$ 900 e R$ 200. Não existem tarifas, câmbio ou efeitos externos. É um exercício de registros locais.

Usamos **centavos inteiros**: `100000` representa R$ 1.000. Assim, somas e subtrações destes valores não dependem de aproximações de ponto flutuante. `bigint` é um inteiro com uma faixa grande, ainda finita. Um sistema com moedas, juros e arredondamento exigiria regras adicionais; aqui os valores já chegam em centavos e não usamos `FLOAT`.

| Momento | Ana | Bruno | Total |
|---|---:|---:|---:|
| Inicial | R$ 1.000 | R$ 100 | R$ 1.100 |
| Após debitar Ana, antes de creditar Bruno | R$ 900 | R$ 100 | R$ 1.000 |
| Operação completa | R$ 900 | R$ 200 | R$ 1.100 |

O estado intermediário é necessário durante o cálculo, mas não deve virar o resultado final. Uma **transação** reúne trabalho em uma unidade que pode ser **confirmada**, tornando suas alterações parte do estado confirmado, ou **desfeita**, descartando suas alterações pendentes. **Executar** o primeiro comando não é o mesmo que **confirmar** a operação inteira.

Uma analogia: preparar uma encomenda com duas peças e só entregá-la quando ambas estiverem na caixa. A caixa corresponde à unidade de trabalho e a entrega à confirmação. O limite é que o banco usa protocolos de concorrência e recuperação; uma caixa física não explica como ele impede leituras indevidas ou recupera uma falha.

## Autocommit e transação explícita

Com **autocommit** ligado, o cliente deixa que uma instrução bem-sucedida fora de um bloco explícito seja confirmada automaticamente. No PostgreSQL, até uma instrução sem `BEGIN` explícito executa dentro de uma transação. Portanto, “não escrevi `BEGIN`” não significa “não existe transação”; significa que você pode estar usando uma unidade menor do que pretendia. Alguns drivers começam blocos automaticamente: confira o modo da ferramenta. [Transações no PostgreSQL 18](https://www.postgresql.org/docs/18/tutorial-transactions.html)

Se os dois `UPDATE` da transferência forem confirmados separadamente, a falha do segundo não desfaz a confirmação do primeiro. Para reunir os passos, `BEGIN` abre o bloco, `COMMIT` confirma e encerra, e `ROLLBACK` desfaz e encerra.

**Prática 00.2 — confirmar ou desfazer.** PostgreSQL 18, `READ COMMITTED`, `psql` com autocommit ligado fora do bloco, uma sessão A. Prepare o schema e seed do laboratório; confira Ana `100000` e Bruno `10000`. Sem outra sessão escrevendo nas contas, execute o bloco abaixo. É uma primeira demonstração com contas conhecidas; a validação completa dos parâmetros vem no capítulo 01.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.contas
SET saldo_centavos = saldo_centavos - 10000 WHERE id = 'ana';
UPDATE acid_lab.contas
SET saldo_centavos = saldo_centavos + 10000 WHERE id = 'bruno';
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- Dentro da transação: ana=90000, bruno=20000.
ROLLBACK; -- Escolha desta primeira execução: descartar os dois passos.
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- Novamente ana=100000, bruno=10000.
```

Cada `UPDATE` deve informar uma linha alterada. Repita **o bloco inteiro**, substituindo seu `ROLLBACK` por `COMMIT`: agora a consulta final deve mostrar `90000` e `20000`. Não execute a transferência mais vezes sem reset, pois cada execução confirmada é uma nova transferência. Encerre qualquer transação aberta e use o reset restrito descrito no [laboratório](laboratorio/README.md). O teste demonstra agrupamento e escolha do resultado; não simula queda de energia nem valida concorrência.

## Duas sessões: quem está olhando?

Uma **conexão** é o canal entre cliente e servidor. Neste laboratório, cada conexão mantém uma **sessão**, com seu próprio estado, configuração e eventual transação aberta. Duas abas podem reutilizar a mesma conexão; não são prova de duas sessões. Abra dois clientes como orientado no laboratório e execute, em cada um, a consulta abaixo, que é somente leitura, em PostgreSQL 18, `READ COMMITTED`, autocommit ligado:

```sql
SELECT pg_backend_pid(), current_database();
SHOW transaction_isolation;
```

Os identificadores `pg_backend_pid()` devem ser diferentes; o nome do banco descartável deve ser o mesmo. A consulta não altera dados e não exige reset. Se os identificadores forem iguais, você não está observando duas sessões independentes.

**Prática 00.3 — enxergar a própria escrita.** PostgreSQL 18, `READ COMMITTED` em ambas, autocommit ligado fora do `BEGIN` de A. Estado inicial: Ana `100000`; nenhuma outra escrita. Execute **uma linha da tabela por vez**, na sessão indicada. Não execute A inteiro e depois B inteiro.

| Passo | Sessão A | Sessão B | Resultado esperado |
|---|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | — | A abre transação |
| 2 | `UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos - 10000 WHERE id = 'ana';` | — | A altera uma linha |
| 3 | `SELECT saldo_centavos FROM acid_lab.contas WHERE id = 'ana';` | — | A vê `90000` |
| 4 | — | `SELECT saldo_centavos FROM acid_lab.contas WHERE id = 'ana';` | B vê `100000` |
| 5 | `ROLLBACK;` | — | A desfaz sua mudança |
| 6 | — | Repete o `SELECT` do passo 4 | B continua vendo `100000` |

A própria transação lê suas alterações anteriores. B não lê o débito pendente de A. Se A confirmasse em vez de desfazer, uma **nova consulta** de B em `READ COMMITTED` veria `90000`; nos próximos capítulos veremos por que outro isolamento pode preservar uma visão anterior. O roteiro termina sem mudanças persistentes; se interrompido, execute `ROLLBACK` em A. Ele demonstra visibilidade nesta intercalação e neste isolamento, sem provar que qualquer leitura em qualquer engine terá essa visão. [Visibilidade em `READ COMMITTED`](https://www.postgresql.org/docs/18/transaction-iso.html#XACT-READ-COMMITTED)

**Responda antes de abrir:** o que minha sessão vê antes de `COMMIT`? E a outra? Fechar A depois de um `COMMIT` permitiria desfazê-lo com `ROLLBACK` ao reconectar?

<details>
<summary>Resposta comentada — sessão e confirmação</summary>

A vê sua própria mudança pendente. B, nesta prática, lê o valor confirmado anterior. Depois da confirmação de A, a próxima consulta de B em `READ COMMITTED` pode ver a mudança. `ROLLBACK` em uma nova conexão não volta no tempo para desfazer uma transação já confirmada. Corrigir um dado confirmado exige outra operação, sujeita às regras do banco. A resposta enganosa mistura “fechar a janela” com “desfazer trabalho já confirmado”.

</details>

## Um ponto de retorno dentro do trabalho

Às vezes uma parte opcional pode falhar sem invalidar o restante. **Savepoint** é um marcador dentro da transação; `ROLLBACK TO SAVEPOINT` desfaz o que ocorreu depois dele, mantendo a transação aberta. Não é um commit parcial. `RELEASE SAVEPOINT` libera o marcador; também não confirma dados para outras sessões.

**Prática 00.4 — marcador.** PostgreSQL 18, `READ COMMITTED`, uma sessão, autocommit ligado fora do bloco. Comece após o reset, Ana `100000` e Bruno `10000`, sem concorrência. Objetivo: descartar uma tentativa e observar que o trabalho anterior ao marcador permanece pendente.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos - 10000
WHERE id = 'ana';
SAVEPOINT antes_do_credito;
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos + 10000
WHERE id = 'bruno';
ROLLBACK TO SAVEPOINT antes_do_credito;
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- ana=90000, bruno=10000: crédito desfeito, débito ainda pendente.
RELEASE SAVEPOINT antes_do_credito;
ROLLBACK; -- Não confirmar uma transferência pela metade.
```

O `ROLLBACK` final restaura o seed. Este exemplo mostra o alcance do marcador; não recomenda confirmar só o débito. Uma recuperação só é correta se, ao final, as regras da operação inteira continuarem satisfeitas. [Savepoints no PostgreSQL 18](https://www.postgresql.org/docs/18/sql-savepoint.html)

## O que levar para o trabalho

Ao investigar um pedido incompleto, descubra primeiro quais comandos pertencem à mesma operação e onde ocorre a confirmação. Pergunte também quem controla o autocommit e se as telas abertas representam conexões diferentes. Essas perguntas revelam erros antes que seja necessário decorar nomes de locks.

Em linguagem simples: uma transação permite preparar mudanças relacionadas e decidir seu destino juntas. Ainda precisamos aprender quais regras ela deve preservar, como convivem operações simultâneas e o que significa conservar uma confirmação após falhas. Essas são as próximas peças de ACID.

[Anterior: índice](README.md) · [Próxima: atomicidade](01-atomicidade.md)
