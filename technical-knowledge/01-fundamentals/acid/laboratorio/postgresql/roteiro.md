# Roteiro A/B — intercalar, observar e explicar

[Preparação](README.md) · [SQL completo](sql-executavel.md) · [Índice da trilha](../../README.md)

**Contrato comum:** PostgreSQL 18 (execução desta entrega: 18.1), cliente `psql` com autocommit ligado, banco descartável `acid_lab`. Configure os timeouts e confira os PIDs conforme a preparação. Cada linha da tabela é um passo: execute somente aquela linha na sessão indicada. Uma coluna vazia significa aguardar. Não rode todo A antes de B. Antes de cada seção, feche as transações e faça o reset; estado inicial sempre volta ao descrito na preparação. Os níveis estão explícitos em `BEGIN` quando relevantes.

Em cada exercício, escreva primeiro o resultado previsto. O roteiro nomeia observações e limites; as respostas conceituais estão nos capítulos. Para parar qualquer exercício, execute `ROLLBACK` em A e em B antes de sair. Uma instrução aguardando pode precisar de cancelamento pelo cliente ou expirar pelo timeout; após isso, faça rollback.

## 1. Confirmar e desfazer

Objetivo: transferir R$ 100,00 de Ana para Bruno. Os SQL abaixo usam duas alterações apenas para ensinar a fronteira, com contas já existentes e sem outro escritor; a função segura é usada adiante.

| Passo | Sessão A (READ COMMITTED) | Sessão B (autocommit) |
|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | |
| 2 | `UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos-10000 WHERE id='ana';` | |
| 3 | `SELECT saldo_centavos FROM acid_lab.contas WHERE id='ana';` → 90000 | |
| 4 | | Mesma consulta → 100000 |
| 5 | `UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos+10000 WHERE id='bruno';` | |
| 6 | `ROLLBACK;` | |
| 7 | | `SELECT id,saldo_centavos FROM acid_lab.contas ORDER BY id;` → 100000 / 10000 |
| 8 | `SELECT acid_lab.transferir('ana','bruno',10000);` | |
| 9 | | Repetir consulta anterior → 90000 / 20000 |

O passo 8 é uma única instrução em autocommit: a função inteira participa da mesma transação implícita. Ela valida valor, existência, contas distintas e quantidade de linhas, e bloqueia em ordem. O teste demonstra visibilidade e efeito de commit/rollback; não inclui falha física ou transferência entre serviços. Reset antes de seguir.

## 2. Falha intermediária, recuperação e zero linhas

Somente A, READ COMMITTED explícito. Execute cada instrução separadamente para ver o erro:

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.contas SET saldo_centavos=90000 WHERE id='ana';
UPDATE acid_lab.contas SET saldo_centavos=-1 WHERE id='bruno'; -- erro CHECK: 23514
SELECT 1; -- 25P02: transação abortada, precisa recuperação
ROLLBACK;
SELECT id,saldo_centavos FROM acid_lab.contas ORDER BY id; -- 100000 / 10000

BEGIN;
SAVEPOINT tentativa;
UPDATE acid_lab.contas SET saldo_centavos=-1 WHERE id='ana'; -- 23514
ROLLBACK TO SAVEPOINT tentativa;
SELECT saldo_centavos FROM acid_lab.contas WHERE id='ana'; -- 100000
COMMIT;

BEGIN;
UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos-10000 WHERE id='ana';
UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos+10000 WHERE id='ausente'; -- UPDATE 0
ROLLBACK; -- UPDATE 0 não gerou exceção. Nossa decisão deve desfazer a unidade.
```

Agora tente `SELECT acid_lab.transferir('ana','ausente',10000);`: a função gera erro e não debita. Tente contas iguais, valor zero e valor maior que o saldo; nenhuma deve mudar saldos. Este teste demonstra as proteções implementadas, não que o banco conheça regras de negócio ausentes.

## 3. READ COMMITTED: leitura muda e conjunto muda

Objetivo: observar a diferença entre reler uma linha e reler um filtro. Comece com estoque1.

| Passo | A | B (autocommit, confirma cada comando) |
|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | |
| 2 | `SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1';` → 1 | |
| 3 | | `UPDATE acid_lab.produtos SET estoque=2 WHERE id='SKU-1';` |
| 4 | Repetir SELECT → 2: non-repeatable read | |
| 5 | `SELECT count(*) FROM acid_lab.produtos WHERE estoque>0;` → 1 | |
| 6 | | `INSERT INTO acid_lab.produtos VALUES ('SKU-2','Lápis',1,0);` |
| 7 | Repetir count → 2: phantom | |
| 8 | | `UPDATE acid_lab.produtos SET estoque=0 WHERE id='SKU-2';` |
| 9 | Repetir count → 1: linha saiu do filtro por UPDATE | |
| 10 | `ROLLBACK;` | |

São valores já confirmados. Não há dirty read. Este teste usa novas fotografias por instrução em RC; não demonstra toda forma de anomalia de serialização.

## 4. Repeatable Read: fotografia estável, escrita pode abortar

Reset. A usa `BEGIN ISOLATION LEVEL REPEATABLE READ;` e lê estoque1. B, em autocommit, executa `UPDATE acid_lab.produtos SET estoque=0 WHERE id='SKU-1';`. A repete a leitura: continua1. B insere SKU-2 como acima; A continua vendo apenas SKU-1 no filtro positivo, sem phantom. Agora A tenta `UPDATE acid_lab.produtos SET estoque=2 WHERE id='SKU-1';`: espera-se erro **40001**, conflito com atualização posterior ao snapshot. A encerra com `ROLLBACK`.

Em PostgreSQL o snapshot RR começa na primeira consulta relevante, não apenas no `BEGIN`. Visão estável não é licença para gravar sobre qualquer alteração concorrente. Aprofundamento com turno e Serializable no exercício10.

## 5. A venda insegura da última unidade

**Exemplo inseguro para diagnóstico, nunca solução.** Reset. A e B iniciam `BEGIN ISOLATION LEVEL READ COMMITTED;`, depois ambas leem estoque1. A aplica o bloco abaixo com chave `insegura-a` e confirma. B aplica o mesmo bloco trocando por `insegura-b` e confirma. A escrita é a constante0 calculada de leitura antiga.

```sql
UPDATE acid_lab.produtos SET estoque=0 WHERE id='SKU-1';
INSERT INTO acid_lab.operacoes VALUES ('insegura-a','SKU-1',1,'aprovada',NULL);
INSERT INTO acid_lab.pedidos(operacao_id,produto_id,quantidade)
VALUES ('insegura-a','SKU-1',1);
COMMIT;
```

`SELECT estoque FROM acid_lab.produtos;` retorna0, mas `SELECT count(*) FROM acid_lab.pedidos;` retorna2. O CHECK de estoque não negativo passou. Nenhuma constraint declarou a soma entre pedidos e estoque inicial. A segunda atribuição perdeu o efeito da primeira decisão; transações em RC não corrigem cálculo feito antes. Os registros de operações deste exemplo também estão deliberadamente incompletos: não são o protocolo de idempotência. Faça reset antes da correção.

## 6. Proteger a baixa e o pedido

| Passo | A (READ COMMITTED) | B (READ COMMITTED, autocommit) |
|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | |
| 2 | `SELECT acid_lab.comprar('compra-a','SKU-1',1);` → pedido1 ainda não confirmado | |
| 3 | | `SELECT acid_lab.comprar('compra-b','SKU-1',1);` → aguarda |
| 4 | `COMMIT;` | |
| 5 | | Comando conclui com NULL: sem estoque, sem novo pedido |

Verifique `SELECT * FROM acid_lab.operacoes ORDER BY chave;` e `SELECT * FROM acid_lab.pedidos;`: uma aprovação e uma recusa persistida, só um pedido e estoque0. A condição está na escrita; a função verifica zero linhas antes de inserir pedido. Se o processo perder a resposta, a chave permite recuperar o mesmo resultado. Produto inexistente falha pela FK; quantidade não positiva gera erro de entrada. Não interpretar NULL como sucesso. A versão completa e copiável está em [SQL executável](sql-executavel.md); o capítulo05 também oferece blocos completos de lock, condição e versão.

## 7. Lock, leitura comum e conflito de versão

Reset. A executa `BEGIN; SELECT * FROM acid_lab.produtos WHERE id='SKU-1' FOR UPDATE;`. B executa `SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1';`: retorna1, não espera por esse lock de linha. B então executa `BEGIN; SELECT * FROM acid_lab.produtos WHERE id='SKU-1' FOR UPDATE;`: aguarda. A muda estoque para0 e versão para1 e confirma. B recebe a versão atualizada, vê0 e deve recusar a compra; encerra com `ROLLBACK`.

Depois tente uma escrita otimista com a versão antiga:

```sql
UPDATE acid_lab.produtos
SET estoque=estoque-1,versao=versao+1
WHERE id='SKU-1' AND estoque>=1 AND versao=0
RETURNING estoque,versao; -- zero linhas: não inserir pedido
```

Este comando sozinho é uma primitiva, não uma compra completa. A linha ausente também gera zero linhas; diagnostique antes de decidir sobre nova tentativa. Um UPDATE já adquire locks. `RowExclusiveLock` em `pg_locks` é lock de tabela; sua presença sozinha não prova um lock de linha. Para observar espera num terceiro cliente local:

```sql
SELECT pid,pg_blocking_pids(pid) AS bloqueadores
FROM pg_stat_activity WHERE datname='acid_lab';
```

O teste demonstra bloqueio entre lockers/escritores e leitura MVCC; não garante que todo SELECT nunca bloqueie, pois existem locks de tabela conflitantes.

## 8. Deadlock e ordem consistente

Reset, A/B READ COMMITTED. Estas escritas mantêm o valor: servem para adquirir os recursos e produzir o ciclo.

| Passo | A | B |
|---|---|---|
| 1 | `BEGIN; UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos WHERE id='ana';` | |
| 2 | | `BEGIN; UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos WHERE id='bruno';` |
| 3 | `UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos WHERE id='bruno';` → aguarda | |
| 4 | | `UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos WHERE id='ana';` → ciclo |
| 5 | Uma das sessões recebe 40P01 | A outra pode prosseguir |
| 6 | `ROLLBACK;` | `ROLLBACK;` |

Não presuma a vítima. Deadlock é ciclo de espera, diferente de esperar por um único lock. Se o timeout encerrar primeiro, você observou timeout, não prova de detecção de deadlock; ajuste apenas os timeouts desta sessão e repita com o reset.

Compare com ordem consistente: em A execute `BEGIN; SELECT id FROM acid_lab.contas ORDER BY id FOR UPDATE;`. B inicia e executa a mesma consulta: espera no primeiro recurso. A confirma; B termina e confirma. Não há aquisição invertida. A função de transferência usa essa ordem. Isso remove este ciclo, sem prometer ausência de todos os deadlocks de qualquer aplicação.

## 9. Mesma intenção, resposta perdida e repetição

Reset. A inicia uma transação e chama `SELECT acid_lab.comprar('intencao-1','SKU-1',1);`. Antes de A confirmar, B chama o mesmo SQL em autocommit: aguarda a chave única da operação. A confirma; B recebe o mesmo pedido, sem outra baixa. A execução serial do mesmo comando depois também retorna esse ID.

Agora B chama `SELECT acid_lab.comprar('intencao-1','SKU-1',2);`: deve gerar erro de reutilização de chave com parâmetros diferentes. Consulte estoque0 e um único pedido. Uma chave nova para outra compra retorna NULL e registra recusa. Se depois houver reposição, repetir a chave da recusa continua retornando a recusa; uma nova intenção deve receber uma nova chave. Este é o contrato didático declarado, com retenção sem expiração neste pequeno banco.

O teste demonstra efeito único **no banco local sob este protocolo**, incluindo chamadas concorrentes. Não demonstra exactly-once entre navegador, API e serviço de entrega. Timeout de cliente não revela se COMMIT aconteceu. A e B são duas conexões, não identidades de operações.

## 10. Aprofundamento: snapshot não protege toda decisão

Reset, turno com Ana e Bruno presentes. A e B iniciam RR e ambas executam `SELECT count(*) FROM acid_lab.turno WHERE presente;` →2. A executa `UPDATE acid_lab.turno SET presente=false WHERE nome='Ana'; COMMIT;`. B executa a escrita equivalente para Bruno e confirma. `SELECT count(*) ...` agora retorna0: duas linhas diferentes mudaram, sem conflito direto de atualização. É write skew; a regra “pelo menos um presente” não foi preservada.

Reset e repita com `BEGIN ISOLATION LEVEL SERIALIZABLE;` nas duas sessões, mantendo ambas as leituras antes das escritas. Uma delas deverá receber **40001**, durante escrita ou commit. Desfaça a abortada. Numa nova tentativa completa, a leitura mostra apenas um presente e a lógica precisa impedir que ele saia. Repetir só a última escrita seria repetir uma decisão inválida.

O teste mostra este conflito de serialização, sem provar uma única ordem física de execução nem prever desempenho.

## 11. Relatório: detalhes e total da mesma fotografia

Estado inicial adicional: produto-1 = 10 × 500 =5000; produto-2 =20 ×400 =8000; total13000 centavos. Nenhum dado é dinheiro em FLOAT. O contexto é a leitura de um relatório, sem baixar estoque. Os casos estão acompanhados no [capítulo04](../../04-anomalias-e-niveis.md).

| Caso | A | B, entre as leituras de A | Observação esperada |
|---|---|---|---|
| A: detalhes e total em RC | BEGIN RC; detalhes; total | UPDATE produto-1 quantidade15; COMMIT | Detalhes antigos somam13000, total novo15500 |
| B: mesma consulta em RC | BEGIN RC; detalhes duas vezes | Mesmo UPDATE confirmado | Segunda consulta subtotal7500/8000: non-repeatable |
| C: conjunto em RC | BEGIN RC; filtro quantidade>0 duas vezes | INSERT produto-3 q2 p500; COMMIT | Duas→três linhas, total14000; phantom |
| C adicional | Mesmo filtro após insert | UPDATE produto-2 quantidade0; COMMIT | Produto-2 sai do filtro por UPDATE |
| D: RR READ ONLY | BEGIN RR READ ONLY; total; total | UPDATE produto-1 q15 confirmado após primeiro SELECT | Ambas13000; depois COMMIT, novo SELECT15500 |
| D adicional | BEGIN RR READ ONLY; só depois primeiro SELECT | B confirma antes desse SELECT | A primeira consulta já vê15500: BEGIN não fixou snapshot |
| E: sem dirty read | BEGIN RU; total | B UPDATE produto-1 q15 ainda sem COMMIT | A vê13000 no PostgreSQL; B ROLLBACK |

SQL para A, ajustando o isolamento ao caso, com **reset entre casos**:

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT produto_id,quantidade*preco_centavos AS subtotal_centavos
FROM acid_lab.vendas_relatorio ORDER BY produto_id;
-- PARE: execute somente a ação B indicada na tabela.
SELECT sum(quantidade*preco_centavos) AS total_centavos FROM acid_lab.vendas_relatorio;
-- Caso B: repetir também a primeira consulta literalmente.
COMMIT;
```

Blocos B alternativos, cada um somente no caso correspondente:

```sql
-- A/B/D: autocommit confirma a atualização antes de A reler.
UPDATE acid_lab.vendas_relatorio SET quantidade=15 WHERE produto_id='produto-1';
-- C, após reset e primeira consulta A:
INSERT INTO acid_lab.vendas_relatorio VALUES ('produto-3',2,500);
-- E, após reset: mantenha B aberta até A ler.
BEGIN;
UPDATE acid_lab.vendas_relatorio SET quantidade=15 WHERE produto_id='produto-1';
-- Só depois de A observar13000:
ROLLBACK;
```

Para C, consulte em A `SELECT * FROM acid_lab.vendas_relatorio WHERE quantidade>0 ORDER BY produto_id;` antes/depois do INSERT. Para D use `BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;`, depois detalhes e total como acima. Esses comandos são alternativos, não um grande script para executar de uma vez.

Quando cabe numa instrução, detalhes e total podem compartilhar o mesmo snapshot de comando em RC:

```sql
SELECT produto_id,quantidade*preco_centavos AS subtotal_centavos,
       sum(quantidade*preco_centavos) OVER () AS total_centavos
FROM acid_lab.vendas_relatorio ORDER BY produto_id;
```

`OVER ()` calcula o total sobre o conjunto da própria consulta e o repete em cada linha. Não é necessário bloqueá-las para produzir esse relatório. Isso não protege automaticamente uma futura decisão de compra baseada nele. Faça rollback em A/B, depois reset; o teste não cobre réplica, Redis ou cache externo.
