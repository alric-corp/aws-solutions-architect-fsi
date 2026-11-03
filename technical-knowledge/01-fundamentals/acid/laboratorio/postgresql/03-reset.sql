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
