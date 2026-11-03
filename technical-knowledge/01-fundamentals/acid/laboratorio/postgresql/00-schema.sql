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
