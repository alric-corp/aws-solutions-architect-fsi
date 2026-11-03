# 01 — Atomicidade: confirmar a unidade inteira

[Índice](README.md) · [Anterior: transações do zero](00-transacoes-do-zero.md) · [Próxima: consistência](02-consistencia.md) · [Glossário](glossario.md)

Ana pediu uma transferência de R$ 100. O sistema diminuiu seu saldo de R$ 1.000 para R$ 900 e encontrou um problema antes de aumentar o saldo de Bruno de R$ 100 para R$ 200. Se o débito ficar e o crédito desaparecer, Ana perde dinheiro sem que Bruno receba. O problema é decidir o destino de uma operação composta.

**Atomicidade** significa que as alterações abrangidas pela transação são confirmadas como uma unidade ou desfeitas. “Atômica” descreve essa unidade indivisível de confirmação; não significa um único comando nem execução instantânea. Débito executado e débito confirmado são coisas diferentes. [Transações no PostgreSQL 18](https://www.postgresql.org/docs/18/tutorial-transactions.html)

Nossa fronteira é explícita: duas linhas da tabela `acid_lab.contas`, no mesmo banco de dados local. Os únicos saldos são Ana `100000` e Bruno `10000`, em centavos; a transferência é `10000`. Não há tarifas, câmbio, cobrança remota ou envio de dinheiro para outro sistema.

## A analogia ajuda até certo ponto

Imagine assinar um acordo com duas vias que só é entregue quando o conjunto está completo. Preparar cada via corresponde a executar um passo; entregar o conjunto corresponde a confirmar. Descartar ambas antes da entrega corresponde a desfazer.

O limite: o banco não recolhe automaticamente algo que já saiu de sua fronteira. Se a aplicação enviar um e-mail e depois executar `ROLLBACK`, o e-mail continua na caixa do destinatário. Se cobrar em outro serviço, a transação SQL local não desfaz a cobrança. A unidade atômica precisa ser definida pelos mecanismos que realmente participam dela.

**Responda antes de abrir:** se o primeiro `UPDATE` funcionou e o segundo não encontrou nenhuma linha, a transferência está correta? Um `COMMIT` saberá que faltou um destinatário?

<details>
<summary>Resposta comentada — comando aceito não é objetivo cumprido</summary>

Não. O pedido era debitar Ana **e** creditar Bruno. Um `UPDATE` com zero linhas não é, por si só, uma exceção no PostgreSQL. Se a aplicação não conferir o resultado nem implementar outra validação, pode confirmar só o débito. A alternativa enganosa é atribuir ao banco o conhecimento do significado “transferir”: ele executa comandos e verifica regras implementadas, não adivinha a intenção.

</details>

## Acompanhe sucesso e desistência

**Prática 01.1.** PostgreSQL 18, `READ COMMITTED`, cliente `psql` com autocommit ligado fora dos blocos, uma sessão A, sem outra escrita. Execute o [reset restrito](laboratorio/README.md) antes de cada variação. O estado inicial é Ana `100000`, Bruno `10000`. Cada `UPDATE` esperado afeta uma linha.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos - 10000
WHERE id = 'ana';
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos + 10000
WHERE id = 'bruno';
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- A vê ana=90000 e bruno=20000 antes da confirmação.
COMMIT;
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- Os mesmos valores agora estão confirmados.
```

Em uma segunda execução, após reset, substitua `COMMIT` por `ROLLBACK`. A primeira consulta continua mostrando `90000` e `20000`, pois A lê suas próprias alterações. A segunda mostra `100000` e `10000`: os dois passos foram desfeitos.

| Variação | Antes | Após executar débito e crédito em A | Após encerrar |
|---|---|---|---|
| `COMMIT` | 100000 / 10000 | 90000 / 20000 pendentes | 90000 / 20000 confirmados |
| `ROLLBACK` | 100000 / 10000 | 90000 / 20000 pendentes | 100000 / 10000 |

Ao terminar, faça reset para a próxima prática. Este teste compara confirmação e desistência; não testa crédito remoto, perda de conexão nem concorrência.

## Falha intermediária: o PostgreSQL não permite continuar como se nada tivesse ocorrido

Uma **restrição**, ou *constraint*, é uma regra que o SGBD verifica ao receber dados. Neste laboratório, saldo negativo é proibido por uma restrição. Isso é uma regra do exercício, não uma regra universal de contas. Vamos provocar sua violação depois do débito.

**Prática 01.2.** PostgreSQL 18, `READ COMMITTED`, autocommit ligado fora do bloco. Estado inicial do seed; uma sessão, sem concorrência. Cole **um comando por vez**, mantendo a sessão após o erro. No `psql`, se estiver com `ON_ERROR_STOP` ligado, use a interação manual para conseguir enviar o `ROLLBACK`; não execute o trecho como script que termina antes da limpeza.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos - 10000
WHERE id = 'ana';                           -- Sucesso: uma linha.
UPDATE acid_lab.contas SET saldo_centavos = -1
WHERE id = 'bruno';                         -- Erro de CHECK: SQLSTATE 23514.
SELECT id, saldo_centavos FROM acid_lab.contas;
-- Erro: a transação está em estado de falha (SQLSTATE 25P02).
ROLLBACK;                                  -- Recupera a sessão.
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- ana=100000, bruno=10000; o débito não ficou confirmado.
```

**SQLSTATE** é um código padronizado de cinco caracteres que identifica uma classe de resultado ou erro; a mensagem em português ou inglês pode variar. Depois desse erro dentro do bloco, comandos normais são recusados até a recuperação. Não tente “salvar o que deu certo” enviando `COMMIT`: no estado abortado, o bloco não terá uma confirmação bem-sucedida do débito. Aqui a saída clara é `ROLLBACK`. O teste demonstra falha e recuperação transacional; não prova que todo problema de negócio produza erro SQL. [Códigos do PostgreSQL 18](https://www.postgresql.org/docs/18/errcodes-appendix.html)

Não transporte esse comportamento automaticamente para outra engine. No MySQL 8.4/InnoDB, alguns erros desfazem apenas a instrução que falhou; outros, como deadlock, desfazem a transação inteira. Um erro de chave duplicada pode deixar mudanças anteriores pendentes. A aplicação precisa conhecer o contrato da engine e decidir a recuperação da operação completa. [Tratamento de erros do InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html)

## Zero linhas: uma falha de negócio sem exceção

**Prática 01.3 — exemplo deliberadamente incompleto.** PostgreSQL 18, `READ COMMITTED`, autocommit ligado fora do bloco, uma sessão, seed restaurado. Objetivo: descobrir por que “não houve erro SQL” é insuficiente. O destino `'inexistente'` não existe. Encerramos com `ROLLBACK` justamente porque o segundo passo não cumpriu a intenção.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos - 10000
WHERE id = 'ana';                           -- UPDATE 1.
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos + 10000
WHERE id = 'inexistente';                   -- UPDATE 0; não é exceção.
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- ana=90000, bruno=10000: total temporário de 100000, não 110000.
ROLLBACK;                                  -- Obrigatório para esta tentativa.
```

`UPDATE 0` é a indicação do `psql` para zero linhas alteradas. Em uma aplicação, use o resultado do driver ou as linhas de `RETURNING`, cláusula que devolve valores das linhas efetivamente alteradas. Não confirme se esperava uma linha e recebeu zero. [Resultado de `UPDATE`](https://www.postgresql.org/docs/18/sql-update.html)

Essa defesa também vale para estoque: se uma baixa condicional não altera linha, não crie o pedido como se a unidade tivesse sido obtida. O capítulo 05 constrói essa fronteira com concorrência.

## Uma transferência pequena com verificações explícitas

No laboratório, a função `acid_lab.transferir(origem, destino, valor)` reúne a validação e os dois `UPDATE`. Uma **função** é um conjunto nomeado de instruções que executamos com parâmetros. Não precisamos aprender sua linguagem inteira agora; acompanhe sua responsabilidade: valor positivo, contas distintas e existentes, saldo suficiente, acesso às contas em ordem consistente e exatamente uma linha alterada em cada passo. O código completo está em `laboratorio/postgresql/02-operacoes.sql`; o [roteiro](laboratorio/README.md) explica como instalá-lo localmente.

Bloquear o acesso de escritores concorrentes à linha será explicado no capítulo 05. Aqui basta reconhecer o motivo: a validação não pode envelhecer enquanto outro escritor muda as mesmas contas.

**Prática 01.4 — usar a operação validada.** PostgreSQL 18, `READ COMMITTED`, autocommit ligado fora do bloco. Prepare schema, funções e seed; uma sessão A. Execute a primeira sequência inteira; depois restaure o seed antes de experimentar um parâmetro inválido.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT acid_lab.transferir('ana', 'bruno', 10000);
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- Esperado: ana=90000, bruno=20000, soma=110000.
COMMIT;
```

Para diagnosticar, tente, **uma por vez em uma nova transação**, `transferir('ana','bruno',0)`, `transferir('ana','ana',10000)` ou `transferir('ana','inexistente',10000)`. Cada tentativa deve produzir erro, e não um débito confirmado. Depois de cada erro, envie `ROLLBACK` e consulte os saldos: `100000` e `10000` após seed. A função não confirma sozinha; seu resultado vazio (`void`) significa que não retorna um valor de negócio. Sucesso depende da ausência de erro e da confirmação do bloco que a chamou.

O teste valida o contrato pequeno da função. Ele não implementa autenticação, autorização, tarifas ou um sistema bancário real, e não torna duas chamadas diferentes a mesma transferência: a repetição exige identidade, tema do capítulo 07.

**Responda antes de abrir:** por que verificar só se o débito afetou uma linha não basta? Se os dois passos aconteceram, ainda posso desistir antes do `COMMIT`?

<details>
<summary>Resposta comentada — unidade de confirmação</summary>

O destino também precisa existir e receber exatamente o crédito previsto. Aceitar só o débito quebra a operação definida. Antes da confirmação, você pode desfazer os dois passos com `ROLLBACK`, mesmo que cada comando tenha terminado com sucesso. A alternativa enganosa trata sucesso de instrução como confirmação irreversível da operação inteira. Dentro de um bloco explícito, o destino final ainda está pendente.

</details>

## Savepoint: recuperação parcial exige uma operação final correta

Um marcador anterior à instrução que falha permite voltar a ele e continuar o bloco. Isso é útil para uma parte opcional; é perigoso se for usado para ignorar uma parte obrigatória. Não podemos decidir que um crédito é “opcional” depois que ele falha.

**Prática 01.5.** PostgreSQL 18, `READ COMMITTED`, autocommit ligado fora do bloco, seed restaurado, uma sessão. Execute manualmente para permanecer conectado após o erro. O objetivo é descartar a tentativa errada de crédito e concluir com o crédito correto, não preservar uma transferência incompleta.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos - 10000
WHERE id = 'ana';
SAVEPOINT credito;
UPDATE acid_lab.contas SET saldo_centavos = -1 WHERE id = 'bruno';
-- Erro de constraint; retornar ao marcador recupera este bloco.
ROLLBACK TO SAVEPOINT credito;
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos + 10000
WHERE id = 'bruno';                         -- Deve afetar uma linha.
RELEASE SAVEPOINT credito;
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- ana=90000, bruno=20000; as duas partes agora estão completas.
COMMIT;
```

Se o crédito correto também falhar ou afetar zero linhas, use `ROLLBACK` da transação inteira. Ao final desta prática, restaure o seed. Ela demonstra recuperação para um savepoint existente; não autoriza ignorar erros em geral nem simula uma perda do processo servidor. [Savepoints](https://www.postgresql.org/docs/18/sql-savepoint.html) e [rollback da transação](https://www.postgresql.org/docs/18/sql-rollback.html).

## O que atomicidade não garante

Uma transação pode confirmar dois comandos perfeitamente atômicos com valores errados: debitar R$ 100 e creditar R$ 90, por exemplo. Pode ainda sofrer interferência concorrente se a proteção escolhida não bastar. Atomicidade não escolhe regras, isolamento ou identidade da operação; ela dá um destino conjunto ao trabalho que você incluiu na fronteira.

No trabalho, isso importa quando uma ação altera mais de um registro, quando uma falha ocorre entre passos ou quando alguém confunde “o comando retornou” com “o pedido foi confirmado”. Em linguagem simples: **o pacote certo precisa confirmar inteiro; o banco não escolhe sozinho o que deveria estar dentro dele**.

[Anterior: transações do zero](00-transacoes-do-zero.md) · [Próxima: consistência](02-consistencia.md)
