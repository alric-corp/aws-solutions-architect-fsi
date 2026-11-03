\set ON_ERROR_STOP on
BEGIN;
INSERT INTO acid_lab.contas VALUES ('ana','Ana',100000),('bruno','Bruno',10000);
INSERT INTO acid_lab.produtos VALUES ('SKU-1','Caneca Horizonte',1,0);
INSERT INTO acid_lab.turno VALUES ('Ana',true),('Bruno',true);
INSERT INTO acid_lab.vendas_relatorio VALUES ('produto-1',10,500),('produto-2',20,400);
COMMIT;
