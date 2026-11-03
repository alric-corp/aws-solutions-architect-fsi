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
