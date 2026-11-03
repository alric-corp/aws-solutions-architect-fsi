# SQL executável — código integral do laboratório

[Preparação](README.md) · [Roteiro A/B](roteiro.md)

PostgreSQL 18; executado em18.1. Execute em ordem somente no banco descartável `acid_lab`, conforme a preparação. Os comandos `\set` são do cliente `psql`. O script `local.sh load` aplica schema, seed e funções. O reset é uma ação separada, após encerrar A/B. Não rode o schema repetidamente sobre tabelas existentes. Cada bloco abaixo reproduz o arquivo de mesmo nome.

## 00-schema.sql

```sql
-- PostgreSQL 18. Execute somente no banco local acid_lab, criado pelo roteiro.
\set ON_ERROR_STOP on
DO $$ BEGIN
  IF current_database() <> 'acid_lab' THEN
    RAISE EXCEPTION 'Banco incorreto: exige acid_lab descartável';
  END IF;
END $$;
CREATE SCHEMA acid_lab;
COMMENT ON SCHEMA acid_lab IS 'Laboratório ACID local descartável; sem dados pessoais';
CREATE TABLE acid_lab.contas (
  id text PRIMARY KEY,
  nome text NOT NULL,
  saldo_centavos bigint NOT NULL CHECK (saldo_centavos >= 0)
);
CREATE TABLE acid_lab.produtos (
  id text PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  estoque integer NOT NULL CHECK (estoque >= 0),
  versao integer NOT NULL DEFAULT 0 CHECK (versao >= 0)
);
CREATE TABLE acid_lab.operacoes (
  chave text PRIMARY KEY CHECK (length(chave) BETWEEN 1 AND 100),
  produto_id text NOT NULL REFERENCES acid_lab.produtos(id),
  quantidade integer NOT NULL CHECK (quantidade > 0),
  resultado text NOT NULL CHECK (resultado IN ('em_andamento','aprovada','sem_estoque')),
  pedido_id bigint
);
CREATE TABLE acid_lab.pedidos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operacao_id text NOT NULL UNIQUE REFERENCES acid_lab.operacoes(chave),
  produto_id text NOT NULL REFERENCES acid_lab.produtos(id),
  quantidade integer NOT NULL CHECK (quantidade > 0)
);
ALTER TABLE acid_lab.operacoes ADD FOREIGN KEY (pedido_id) REFERENCES acid_lab.pedidos(id);
-- Aprofundamento: ao menos um responsável deve permanecer no turno.
CREATE TABLE acid_lab.turno (
  nome text PRIMARY KEY,
  presente boolean NOT NULL
);
-- Incremento didático: relatório de detalhes e total em consultas distintas.
CREATE TABLE acid_lab.vendas_relatorio (
  produto_id text PRIMARY KEY,
  quantidade integer NOT NULL CHECK (quantidade >= 0),
  preco_centavos bigint NOT NULL CHECK (preco_centavos > 0)
);
```

## 01-seed.sql

```sql
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO acid_lab.contas VALUES ('ana','Ana',100000),('bruno','Bruno',10000);
INSERT INTO acid_lab.produtos VALUES ('SKU-1','Caneca Horizonte',1,0);
INSERT INTO acid_lab.turno VALUES ('Ana',true),('Bruno',true);
INSERT INTO acid_lab.vendas_relatorio VALUES ('produto-1',10,500),('produto-2',20,400);
COMMIT;
```

## 02-operacoes.sql

```sql
\set ON_ERROR_STOP on
-- Funções didáticas locais. Usar com READ COMMITTED; exceções exigem rollback.
-- Não há tarifas, câmbio, e-mail, pagamento remoto ou qualquer efeito externo.
CREATE FUNCTION acid_lab.transferir(origem text, destino text, valor bigint)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE n integer;
BEGIN
  IF valor IS NULL OR valor <= 0 OR origem IS NULL OR destino IS NULL OR origem = destino THEN
    RAISE EXCEPTION 'Exige valor positivo e contas distintas não nulas';
  END IF;
  -- Mesma ordem para transferências nos dois sentidos; reduz deadlock.
  PERFORM id FROM acid_lab.contas WHERE id IN (origem,destino) ORDER BY id FOR UPDATE;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 2 THEN RAISE EXCEPTION 'Conta inexistente'; END IF;
  UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos - valor
    WHERE id = origem AND saldo_centavos >= valor;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Saldo insuficiente'; END IF;
  UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos + valor WHERE id = destino;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Destino não atualizado'; END IF;
END $$;

-- Uma chave identifica UMA intenção estável de compra. Toda compra desta aula
-- chama esta função; alteração direta das tabelas fica só nas demonstrações.
-- Retorna pedido_id na aprovação; NULL na recusa persistida por falta de estoque.
CREATE FUNCTION acid_lab.comprar(chave text, produto text, quantidade integer)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE op acid_lab.operacoes%ROWTYPE; novo boolean; pedido bigint; n integer;
BEGIN
  IF chave IS NULL OR length(chave) NOT BETWEEN 1 AND 100 OR produto IS NULL
     OR quantidade IS NULL OR quantidade <= 0 THEN
    RAISE EXCEPTION 'Parâmetros inválidos';
  END IF;
  INSERT INTO acid_lab.operacoes AS o (chave,produto_id,quantidade,resultado)
    VALUES (comprar.chave,produto,comprar.quantidade,'em_andamento')
    ON CONFLICT ON CONSTRAINT operacoes_pkey DO NOTHING;
  novo := FOUND;
  -- Em READ COMMITTED é uma NOVA instrução: após esperar pelo INSERT
  -- concorrente, enxerga a operação confirmada que causou o conflito.
  SELECT * INTO STRICT op FROM acid_lab.operacoes o
    WHERE o.chave = comprar.chave FOR UPDATE;
  IF op.produto_id IS DISTINCT FROM produto OR op.quantidade IS DISTINCT FROM comprar.quantidade THEN
    RAISE EXCEPTION 'Chave reutilizada com parâmetros diferentes';
  END IF;
  IF NOT novo THEN
    IF op.resultado = 'em_andamento' THEN RAISE EXCEPTION 'Estado incompleto inesperado'; END IF;
    RETURN op.pedido_id;
  END IF;
  UPDATE acid_lab.produtos SET estoque = estoque - comprar.quantidade, versao = versao + 1
    WHERE id = produto AND estoque >= comprar.quantidade;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN
    UPDATE acid_lab.operacoes o SET resultado = 'sem_estoque' WHERE o.chave = comprar.chave;
    RETURN NULL;
  END IF;
  INSERT INTO acid_lab.pedidos(operacao_id,produto_id,quantidade)
    VALUES (comprar.chave,produto,comprar.quantidade) RETURNING id INTO pedido;
  UPDATE acid_lab.operacoes o SET resultado = 'aprovada', pedido_id = pedido
    WHERE o.chave = comprar.chave;
  RETURN pedido;
END $$;
```

## 03-reset.sql

```sql
-- Encerrar A/B com ROLLBACK e fechar o executor antes de resetar.
-- Não remove banco, schema ou volumes. Restrito às seis tabelas deste laboratório.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
  IF current_database() <> 'acid_lab' OR
     obj_description('acid_lab'::regnamespace,'pg_namespace') IS DISTINCT FROM
       'Laboratório ACID local descartável; sem dados pessoais' THEN
    RAISE EXCEPTION 'Identidade do laboratório não validada';
  END IF;
END $$;
SET LOCAL lock_timeout = '2s';
TRUNCATE acid_lab.pedidos, acid_lab.operacoes, acid_lab.contas,
  acid_lab.produtos, acid_lab.turno, acid_lab.vendas_relatorio RESTART IDENTITY;
INSERT INTO acid_lab.contas VALUES ('ana','Ana',100000),('bruno','Bruno',10000);
INSERT INTO acid_lab.produtos VALUES ('SKU-1','Caneca Horizonte',1,0);
INSERT INTO acid_lab.turno VALUES ('Ana',true),('Bruno',true);
INSERT INTO acid_lab.vendas_relatorio VALUES ('produto-1',10,500),('produto-2',20,400);
COMMIT;
```

## 04-verificar.sql

```sql
SELECT version(), current_database(), pg_backend_pid();
SHOW transaction_isolation;
SHOW fsync;
SHOW synchronous_commit;
SHOW full_page_writes;
SELECT id,nome,saldo_centavos FROM acid_lab.contas ORDER BY id;
SELECT sum(saldo_centavos) AS total_centavos FROM acid_lab.contas;
SELECT * FROM acid_lab.produtos ORDER BY id;
SELECT * FROM acid_lab.operacoes ORDER BY chave;
SELECT * FROM acid_lab.pedidos ORDER BY id;
SELECT * FROM acid_lab.turno ORDER BY nome;
SELECT *, quantidade*preco_centavos AS subtotal_centavos FROM acid_lab.vendas_relatorio ORDER BY produto_id;
SELECT sum(quantidade*preco_centavos) AS total_centavos FROM acid_lab.vendas_relatorio;
```
