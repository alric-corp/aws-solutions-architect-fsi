# Apêndice — MySQL 8.4 com InnoDB

[Laboratório principal](../README.md) · [Isolamento](../../04-anomalias-e-niveis.md) · [Revisão técnica](../../referencias-e-revisao-tecnica.md)

**Estado desta entrega:** SQL revisado na documentação MySQL 8.4, não executado. Não conecte ao MySQL pessoal instalado para tentar obter uma saída. O laboratório principal e suas saídas pertencem ao PostgreSQL 18.1. Este apêndice é uma comparação opcional depois do núcleo.

O mesmo nome de nível não promete a mesma implementação em engines diferentes. InnoDB usa REPEATABLE READ como padrão; no laboratório principal explicitamos o nível para cada cenário. Um SELECT comum consistente usa versões; leituras com lock e escritas têm regras próprias. Não misture leituras comuns e locking reads como se compartilhassem automaticamente o mesmo contrato em RR. [Manual de isolamento MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html)

| Ponto | PostgreSQL 18 | MySQL 8.4 / InnoDB |
|---|---|---|
| READ UNCOMMITTED | Comporta-se como READ COMMITTED | Leituras comuns podem observar dados não confirmados |
| Erro de constraint no bloco | Transação fica abortada; rollback ou rollback a savepoint | Alguns erros desfazem só a instrução; a transação pode continuar |
| Deadlock | Uma transação é abortada | InnoDB desfaz toda a transação vítima; refazer unidade completa |
| Timeout de lock | Erro precisa recuperação conforme fronteira | Por padrão, desfaz a instrução que esperou; configuração pode alterar isso |

Após um erro, código cliente deve classificar a falha e decidir explicitamente o destino da unidade. Não assuma que erro de uma instrução desfez todas as anteriores. [Tratamento de erros InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html)

## Atividade complementar: leitura suja, separada do PostgreSQL

Pré-condição: alguém preparou **uma instância MySQL 8.4 exclusivamente descartável**, sem dados pessoais, identificou a engine, reservou o nome novo `acid_mysql_lab` e abriu duas conexões distintas. Não fornecemos aqui comandos de criação/remoção de container ou volume porque o isolamento precisa ser conferido no seu ambiente. Se não houver essa instância, responda conceitualmente e mantenha “não executado”.

**Objetivo:** distinguir uma leitura de dados ainda não confirmados de uma leitura de dados confirmados que mudou. Todo bloco abaixo é MySQL; não colar no `psql`.

Na instância descartável, autocommit ligado:

```sql
SELECT VERSION(), CONNECTION_ID(), @@autocommit, @@transaction_isolation;
CREATE DATABASE acid_mysql_lab; -- parar se já existir: não sobrescrever
USE acid_mysql_lab;
CREATE TABLE produto (
  id varchar(20) PRIMARY KEY,
  estoque int NOT NULL CHECK (estoque >= 0)
) ENGINE=InnoDB;
INSERT INTO produto VALUES ('SKU-1',1);
```

Em cada conexão `USE acid_mysql_lab;` e confira IDs diferentes. Estado inicial SKU-1 estoque1. Intercale:

| Passo | A, escritora | B, leitora |
|---|---|---|
| 1 | `START TRANSACTION;` | |
| 2 | `UPDATE produto SET estoque=0 WHERE id='SKU-1';` sem COMMIT | |
| 3 | | `SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;` |
| 4 | | `START TRANSACTION; SELECT estoque FROM produto WHERE id='SKU-1';` → esperado0 |
| 5 | `ROLLBACK;` | |
| 6 | | `SELECT estoque FROM produto WHERE id='SKU-1';` → esperado1 |
| 7 | | `ROLLBACK;` |

A leitura0 veio de uma alteração que nunca foi confirmada. No PostgreSQL, até pedindo READ UNCOMMITTED, essa leitura comum veria1. Os números da tabela são **esperados**, não medidos neste trabalho.

Encerramento: `ROLLBACK` nas duas conexões; confirme estoque1 e saia. Para repetir, na mesma instância descartável, `UPDATE acid_mysql_lab.produto SET estoque=1 WHERE id='SKU-1';` em autocommit e nenhuma transação concorrente. Não remover banco ou volume como parte do exercício. Este exemplo demonstra apenas dirty read em uma linha sob esse nível; não valida a implementação de compras/idempotência do PostgreSQL em outra engine.

## Recuperação após erro: previsão

Antes de executar em ambiente descartável, explique por que um `INSERT` duplicado pode falhar e ainda deixar as alterações anteriores abertas no InnoDB. O manual distingue rollback de instrução e rollback de transação. Não copie o raciocínio do erro PostgreSQL25P02 para toda engine.

**Responda antes de abrir.**

<details>
<summary>Resposta comentada — o que deve ser desfeito?</summary>

Se a unidade de negócio exige tudo ou nada, o cliente deve desfazer a unidade quando a falha impede completá-la, mesmo que a engine tenha desfeito somente a instrução. A alternativa enganosa é confirmar as alterações anteriores porque “o banco já tratou o erro”. O escopo do tratamento pode ser menor que o escopo da intenção.

</details>

Fontes consultadas em 03/11/2026: os dois capítulos MySQL 8.4 vinculados acima; a matriz PostgreSQL está documentada no [capítulo13.2 da versão18](https://www.postgresql.org/docs/18/transaction-iso.html). Nenhuma conexão MySQL foi utilizada nesta entrega.
