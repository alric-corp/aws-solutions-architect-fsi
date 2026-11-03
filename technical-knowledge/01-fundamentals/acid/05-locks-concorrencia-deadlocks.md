# 05 — Como proteger uma decisão

[Índice da trilha](README.md) · [Anterior: anomalias e níveis](04-anomalias-e-niveis.md) · [Próxima: durabilidade](06-durabilidade.md)

Marina e Caio têm intenções diferentes: cada pessoa quer comprar uma unidade de `SKU-1`. A loja só tem uma. Precisamos fazer a regra valer **quando a escrita acontece**, e não apenas quando alguém consulta o catálogo.

Neste capítulo, a unidade é consumida na compra confirmada; o carrinho continua sem reservar nada. Baixa e pedido ficam na mesma transação local. Não há pagamento externo. Todos os caminhos de escrita considerados participam do protocolo escolhido. As proteções não defendem o sistema de um administrador que altere os dados arbitrariamente.

## Contrato dos exemplos

Use PostgreSQL 18 no [laboratório descartável](laboratorio/README.md), `READ COMMITTED` explícito e autocommit ligado fora dos blocos. Os resultados descritos são esperados; consulte o laboratório para a versão exata e a execução registrada. Antes de **cada estratégia**, encerre A e B com `ROLLBACK` e execute o reset restrito, voltando a estoque 1, versão 0, sem pedidos nem operações.

Os pedidos referenciam registros de operação por chave estrangeira. Por isso os exemplos inserem esse registro, o pedido e o resultado juntos. Aqui usamos chaves novas e fixas apenas para identificar cada tentativa; o protocolo de repetição será ensinado no [capítulo 07](07-timeout-idempotencia.md).

`DO` executa um pequeno bloco no servidor. `DECLARE` cria variáveis locais; `SELECT ... INTO` guarda um resultado nelas; `IF` escolhe o caminho; `FOUND` informa se a instrução anterior encontrou ou afetou alguma linha; `RAISE EXCEPTION` sinaliza um erro. `GET DIAGNOSTICS ... ROW_COUNT` obtém a quantidade de linhas alteradas pela instrução anterior. Esses recursos evitam que o exercício confirme uma compra depois de uma baixa que afetou zero linhas. Não é necessário decorar a linguagem para entender a decisão.

## Escolha a proteção a partir do que precisa permanecer verdadeiro

O relatório anterior e a última unidade da loja não pedem a mesma coisa. Antes de escolher um nível mais forte ou adicionar locks, declare o resultado necessário. Os mecanismos abaixo são opções para estes exemplos, sem promessa universal de desempenho.

| Necessidade | Regra e mudança aceitável | Mecanismo adequado ao exemplo | Limite |
|---|---|---|---|
| Tela de acompanhamento no mesmo servidor | Mostrar o estado confirmado visível a cada consulta; aceitar números novos entre atualizações | Leitura comum em `READ COMMITTED` | Não mantém a mesma visão entre consultas e não reserva estoque |
| Relatório com detalhes e total do mesmo recorte | As partes precisam concordar; aceitar que commits posteriores fiquem para o próximo relatório | Uma consulta com total por janela, ou várias em `REPEATABLE READ READ ONLY` | A consulta única vale por instrução; o snapshot estável não é sempre o mais recente |
| Compra concorrente da última unidade | Só uma intenção diferente pode consumir a unidade; baixa e pedido confirmam juntos | Escrita condicional, protocolo com lock ou versão; conferir resultado na mesma transação | Um snapshot estável sozinho não demonstra a proteção; repetição da mesma intenção ainda precisa de identidade |

**Responda antes de abrir:** um relatório estável e uma compra concorrente precisam da mesma proteção?

<details>
<summary>Resposta comentada</summary>

Não necessariamente. O relatório pede concordância entre leituras; a compra pede que uma decisão concorrente não admita mais consumo do que o disponível. Para o relatório pequeno, uma única instrução pode bastar; para a compra, a baixa precisa verificar a condição e governar a criação do pedido. A alternativa enganosa é escolher “o maior isolamento” como resposta completa sem explicar a regra, o SQL e como tratar conflitos.

</details>

## Primeiro, reconheça o fluxo inseguro

**Exemplo inseguro para diagnóstico: não use como solução.** Depois do reset, abra A e B e siga esta ordem. Ambas usam transação explícita, mas ainda calculam a escrita com uma leitura antiga.

| Passo | A | B |
|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | — |
| 2 | Lê estoque = 1 | — |
| 3 | — | `BEGIN ISOLATION LEVEL READ COMMITTED;`; lê estoque = 1 |
| 4 | Grava o 0 calculado antes; registra pedido A; confirma | — |
| 5 | — | Grava o 0 calculado antes; registra pedido B; confirma |

A leitura em ambos é:

```sql
SELECT estoque FROM acid_lab.produtos WHERE id = 'SKU-1';
```

Depois das duas leituras, execute em A:

```sql
-- A: passo 4. INSEGURO: atribui um valor calculado antes.
UPDATE acid_lab.produtos SET estoque = 0 WHERE id = 'SKU-1';
INSERT INTO acid_lab.operacoes(chave, produto_id, quantidade, resultado)
VALUES ('insegura-a', 'SKU-1', 1, 'em_andamento');
INSERT INTO acid_lab.pedidos(operacao_id, produto_id, quantidade)
VALUES ('insegura-a', 'SKU-1', 1);
UPDATE acid_lab.operacoes
SET resultado = 'aprovada',
    pedido_id = (SELECT id FROM acid_lab.pedidos WHERE operacao_id = 'insegura-a')
WHERE chave = 'insegura-a';
COMMIT;
```

Em B, no passo 5, execute o mesmo bloco trocando **todas** as ocorrências de `insegura-a` por `insegura-b`. Observe que a escrita continua sendo o valor constante 0. A consulta de verificação, em autocommit depois dos dois commits, é:

```sql
SELECT estoque FROM acid_lab.produtos WHERE id = 'SKU-1'; -- Esperado: 0.
SELECT count(*) FROM acid_lab.pedidos;                    -- Esperado: 2.
```

O teste demonstra uma atualização perdida e a admissão indevida de dois pedidos. O `CHECK` de estoque não negativo não detecta a relação quebrada. Ele **não** mostra que `UPDATE` é desprotegido internamente: as escritas têm locks, mas o cálculo antigo continua errado. Encerre as sessões e resete antes de seguir.

## Estratégia 1: proteger a linha antes de decidir

`SELECT ... FOR UPDATE` obtém uma proteção das linhas encontradas e a mantém até o fim da transação. Um escritor ou outro locker incompatível sobre a mesma linha pode precisar esperar. Se a linha não existir, nada foi reservado por esse comando: verifique esse caso também.

A analogia é pegar a única ficha de atendimento de um item, olhar sua disponibilidade e concluir a decisão antes de devolver a ficha. **Limite:** o banco protege recursos concretos segundo modos de lock; a ficha não representa automaticamente todos os dados de uma regra nem bloqueia leitores comuns de versões.

A transação abaixo pode aceitar uma compra ou produzir erro sem deixar pedido parcial:

```sql
-- Inicial: SKU-1 estoque1 versão0; chave nova; sem pedidos.
BEGIN ISOLATION LEVEL READ COMMITTED;
SET LOCAL statement_timeout = '60s';
DO $$
DECLARE
  v_estoque integer;
  v_linhas bigint;
  v_pedido bigint;
  v_chave text := 'aula05-lock-a';
BEGIN
  SELECT estoque INTO v_estoque
  FROM acid_lab.produtos WHERE id = 'SKU-1' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'produto inexistente'; END IF;
  IF v_estoque < 1 THEN RAISE EXCEPTION 'sem estoque'; END IF;

  UPDATE acid_lab.produtos
  SET estoque = estoque - 1, versao = versao + 1 WHERE id = 'SKU-1';
  GET DIAGNOSTICS v_linhas = ROW_COUNT;
  IF v_linhas <> 1 THEN RAISE EXCEPTION 'baixa nao realizada'; END IF;

  INSERT INTO acid_lab.operacoes(chave, produto_id, quantidade, resultado)
  VALUES (v_chave, 'SKU-1', 1, 'em_andamento');
  INSERT INTO acid_lab.pedidos(operacao_id, produto_id, quantidade)
  VALUES (v_chave, 'SKU-1', 1) RETURNING id INTO v_pedido;
  UPDATE acid_lab.operacoes SET resultado = 'aprovada', pedido_id = v_pedido
  WHERE chave = v_chave;
END $$;
COMMIT;
```

Esperado em uma sessão: estoque 0, versão 1, um pedido e uma operação aprovada. Se qualquer instrução falhar, faça `ROLLBACK`; não trate o erro como compra aprovada. A exceção desfaz o bloco e a transação explícita precisa ser encerrada. Para repetir, use o reset do laboratório depois de encerrar as conexões concorrentes.

Para observar a espera sem depender de sorte, depois de novo reset intercale assim:

| Passo | A | B |
|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;`; `SELECT ... FOR UPDATE` abaixo | — |
| 2 | Mantém transação aberta | Executa o bloco de compra acima, usando chave `aula05-lock-b`; **espera no SELECT** |
| 3 | Executa o `DO` acima com chave `aula05-lock-a`, na transação já aberta; `COMMIT` | Ainda aguarda |
| 4 | Encerrou | Retoma, lê estoque 0, gera erro `sem estoque`; executar `ROLLBACK` |

A instrução de A no passo 1 é:

```sql
SELECT estoque FROM acid_lab.produtos WHERE id = 'SKU-1' FOR UPDATE;
```

No passo 3, não copie outro `BEGIN`: use somente `DO ... END $$;` e `COMMIT` dentro da transação de A. Não deixe passar o timeout de B: ele é um limite para o exercício, não uma forma de coordenar. O teste demonstra espera e decisão com a linha protegida; não garante que toda consulta de outra sessão espere.

**Responda antes de abrir:** se A segura esse lock e B executa somente um `SELECT` comum do estoque, B necessariamente espera? “A linha está trancada” é uma explicação suficiente?

<details>
<summary>Resposta comentada</summary>

Não. Sob MVCC, esse `SELECT` pode ler a versão confirmada visível, sem esperar pelo lock da linha. B precisa esperar se pedir acesso conflitante, como atualizar a mesma linha. Há também locks de tabela que bloqueiam leituras; por isso “qualquer SELECT” é uma generalização enganosa.

</details>

## Estratégia 2: verificar a regra na própria escrita

Quando a decisão cabe em uma linha, podemos dizer diretamente “diminua uma unidade **se ainda houver pelo menos uma**”. O `UPDATE` adquire os locks necessários. Não é obrigatório executar `FOR UPDATE` antes de todo `UPDATE`.

Depois do reset, use o bloco abaixo em A. Se executar também em B, mude a chave para `aula05-condicional-b`. Execute o `DO` de A sem confirmar, envie o de B, e só então confirme A: B espera e depois encontra zero linhas elegíveis.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
SET LOCAL statement_timeout = '60s';
DO $$
DECLARE
  v_linhas bigint;
  v_pedido bigint;
  v_chave text := 'aula05-condicional-a';
BEGIN
  UPDATE acid_lab.produtos
  SET estoque = estoque - 1, versao = versao + 1
  WHERE id = 'SKU-1' AND estoque >= 1;
  GET DIAGNOSTICS v_linhas = ROW_COUNT;
  IF v_linhas <> 1 THEN
    RAISE EXCEPTION 'compra recusada: produto ausente ou estoque insuficiente';
  END IF;

  INSERT INTO acid_lab.operacoes(chave, produto_id, quantidade, resultado)
  VALUES (v_chave, 'SKU-1', 1, 'em_andamento');
  INSERT INTO acid_lab.pedidos(operacao_id, produto_id, quantidade)
  VALUES (v_chave, 'SKU-1', 1) RETURNING id INTO v_pedido;
  UPDATE acid_lab.operacoes SET resultado = 'aprovada', pedido_id = v_pedido
  WHERE chave = v_chave;
END $$;
-- Na reprodução concorrente: pare aqui; envie B antes de confirmar A.
COMMIT;
```

| Passo | A | B | Resultado esperado |
|---|---|---|---|
| 1 | Executa até fim do `DO`, sem `COMMIT` | — | A baixou uma unidade ainda não confirmada |
| 2 | — | Executa até `DO`, com chave diferente | B espera no `UPDATE` |
| 3 | `COMMIT` | — | Libera a disputa |
| 4 | — | `UPDATE` retoma e afeta zero linhas; exceção; `ROLLBACK` | B não cria pedido |

Estado final: estoque 0, versão 1 e somente o pedido de A. PostgreSQL reavalia o `WHERE` do atualizador que esperou a transação concorrente; o valor agora é zero. Esse roteiro demonstra proteção da última unidade com a condição na escrita; não representa todas as regras de compra possíveis. A operação ausente e o estoque insuficiente compartilham o resultado de zero linhas aqui; uma releitura pode ajudar a diagnosticar, mas não deve autorizar uma escrita incondicional depois.

## Estratégia 3: detectar uma versão que mudou

Imagine que a aplicação exibiu um estado e quer gravar uma decisão apenas se esse estado não tiver sido alterado. A coluna `versao` funciona como um número de revisão. Todos os escritores participantes devem incrementá-la. A escrita tenta trocar a revisão esperada pela seguinte; esse padrão também é chamado controle otimista ou *compare-and-swap*.

Depois do reset, A e B leem:

```sql
-- PostgreSQL 18, READ COMMITTED, autocommit ligado.
SELECT estoque, versao FROM acid_lab.produtos WHERE id = 'SKU-1';
-- Ambas: estoque1, versao0. Guarde a revisão 0 como a esperada.
```

Para a compra completa, repita o bloco da estratégia 2 com três substituições precisas: use chave `aula05-versao-a` em A ou `aula05-versao-b` em B; acrescente a versão esperada no `WHERE`; e troque a mensagem de erro para refletir o conflito. A instrução e a verificação devem ficar assim:

```sql
-- Dentro do DO da estratégia 2, substitui UPDATE + verificação.
UPDATE acid_lab.produtos
SET estoque = estoque - 1, versao = versao + 1
WHERE id = 'SKU-1' AND estoque >= 1 AND versao = 0;
GET DIAGNOSTICS v_linhas = ROW_COUNT;
IF v_linhas <> 1 THEN
  RAISE EXCEPTION 'estado mudou, estoque insuficiente ou produto ausente';
END IF;
```

Este trecho depende das variáveis e das instruções de pedido do bloco anterior; não o execute sozinho. Faça a mesma intercalação: ambas leem versão 0; A executa até o fim do `DO`; B tenta seu `DO`; A confirma; B falha e desfaz. Esperado: versão final 1, estoque 0 e um pedido. Se B tentar só depois do commit de A, falha sem a espera anterior. Não faça retry apenas trocando o número para 1: releia e refaça a decisão; neste caso não há estoque.

O teste demonstra a detecção de revisão obsoleta. Não demonstra ausência de locks: a escrita otimista também usa locks internos. Tampouco prova que a versão é necessária para esta regra, pois o predicado de estoque já é suficiente para a última unidade.

| Escolha | Onde detecta a disputa? | Cuidado central |
|---|---|---|
| Lock antes da decisão | Ao tentar proteger a linha | Transação curta; conferir linha ausente; todos os caminhos corretos |
| Escrita condicional | Na própria mudança de estado | Conferir linhas alteradas antes de criar o pedido |
| Versão | Ao comparar revisão esperada com a atual | Manter revisão em todos os escritores e refazer decisão no conflito |

## Esperar não significa estar em deadlock

Se A segura uma linha e B espera por A, existe uma **espera por lock**. Se A terminar, B pode prosseguir. Um **deadlock** é um ciclo: A espera por algo de B e B espera por algo de A; nenhum dos dois consegue avançar sozinho.

Vamos reproduzir o ciclo com as contas fictícias, sem alterar saldo. Depois do reset, Ana tem 100000 centavos e Bruno 10000. O objetivo é testar somente aquisição de locks. Abra duas conexões exclusivas e configure um limite por instrução em cada uma antes de iniciar:

```sql
-- Em A e B: autocommit ligado; vale só para estas conexões de laboratório.
SET statement_timeout = '60s';
```

| Passo | A | B |
|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;`; trava Ana | — |
| 2 | — | `BEGIN ISOLATION LEVEL READ COMMITTED;`; trava Bruno |
| 3 | Tenta travar Bruno: **espera** | — |
| 4 | Ainda espera | Tenta travar Ana: fecha o ciclo |
| 5 | Uma transação é abortada; a outra pode retomar | Não suponha qual será vítima |
| 6 | `ROLLBACK` | `ROLLBACK` |

```sql
-- A: passo 1.
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT id FROM acid_lab.contas WHERE id = 'ana' FOR UPDATE;
```

```sql
-- B: passo 2.
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT id FROM acid_lab.contas WHERE id = 'bruno' FOR UPDATE;
```

```sql
-- A: passo 3. Envie; enquanto espera, volte à conexão B.
SELECT id FROM acid_lab.contas WHERE id = 'bruno' FOR UPDATE;
```

```sql
-- B: passo 4.
SELECT id FROM acid_lab.contas WHERE id = 'ana' FOR UPDATE;
```

O erro de deadlock é SQLSTATE `40P01`. O banco detecta o ciclo e interrompe uma transação. Não dependa de qual será escolhida, nem de uma mensagem com IDs fixos. Depois de ambas fazerem `ROLLBACK`, os saldos continuam iguais aos iniciais. Faça `RESET statement_timeout` em ambas para encerrar o ajuste local. Esse teste não demonstra transferência, alteração de dinheiro ou deadlock entre serviços. [Deadlocks no PostgreSQL](https://www.postgresql.org/docs/18/explicit-locking.html#LOCKING-DEADLOCKS).

### A mesma tarefa, uma ordem consistente

Refaça a aquisição com ambas as transações pedindo **Ana antes de Bruno**, independentemente da direção de uma transferência:

```sql
-- Em cada sessão: PostgreSQL 18, READ COMMITTED explícito.
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT id FROM acid_lab.contas WHERE id = 'ana' FOR UPDATE;
SELECT id FROM acid_lab.contas WHERE id = 'bruno' FOR UPDATE;
-- Neste exercício só protegemos as linhas; não alteramos saldo.
ROLLBACK;
```

Intercale: A obtém Ana; B tenta Ana e espera; A obtém Bruno e desfaz; B recebe Ana, depois obtém Bruno e desfaz. Não execute o bloco inteiro de A antes de B se quiser observar a espera. Não há ciclo nesse par de recursos. Ordem consistente reduz esse deadlock, mas não é prova de que um sistema com outros recursos nunca terá ciclos.

## Descubra onde o tempo está sendo gasto

| Situação | O que aconteceu | Próximo diagnóstico |
|---|---|---|
| Lock wait | O banco aguarda um acesso conflitante | Identificar quem segura o recurso e por quanto tempo |
| Deadlock | Um ciclo de espera foi detectado | Desfazer; revisar ordem; repetir a transação inteira quando adequado |
| Erro de serialização | A garantia de isolamento impediu um resultado concorrente | Refazer leituras e decisão numa nova transação |
| `lock_timeout` | Uma espera por lock passou do limite configurado | Tratar o erro e encerrar/recuperar a transação |
| `statement_timeout` | A instrução excedeu seu prazo no servidor | Pode incluir espera por lock ou execução; examinar o contexto |
| Timeout do cliente/API | Quem aguardava desistiu de esperar resposta | O resultado no banco pode ser incerto; não presumir rollback |
| Espera no pool | A aplicação ainda espera uma conexão livre | A instrução pode nem ter chegado ao banco |

Um **pool** é um conjunto de conexões reutilizadas pela aplicação. Esperar por uma vaga nele é diferente de esperar dentro de uma consulta. Esses limites precisam de nomes separados para que o diagnóstico não transforme todo atraso em “deadlock”. [Parâmetros de timeout no PostgreSQL 18](https://www.postgresql.org/docs/18/runtime-config-client.html).

## Observe sem interpretar o nome do lock literalmente

`pg_locks` é uma visão de diagnóstico do banco. Esta consulta pronta é opcional: `JOIN` cruza as visões pelos identificadores e `AS` dá apelidos curtos a elas. A consulta é somente leitura, usa autocommit, funciona no banco local e mostra locks das tabelas do laboratório:

```sql
SELECT l.pid, l.locktype, l.mode, l.granted, c.relname
FROM pg_locks AS l
JOIN pg_class AS c ON c.oid = l.relation
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'acid_lab'
ORDER BY l.pid, c.relname, l.mode;
```

As linhas exatas dependem do momento observado. **`RowExclusiveLock` é um modo de lock de tabela**, apesar de “Row” no nome. Sua presença isolada não prova que você encontrou o lock de uma linha específica; duas transações podem manter esse modo sobre a mesma tabela e disputar certas linhas. Locks de linha também não são apresentados como uma lista completa simples nessa visão. Para observar o bloqueador de uma sessão, use `SELECT pg_blocking_pids(<pid_da_sessao>)`, substituindo o marcador pelo PID real obtido no laboratório. [Modos de lock e escopo](https://www.postgresql.org/docs/18/explicit-locking.html) e [limites da visão pg_locks](https://www.postgresql.org/docs/18/view-pg-locks.html).

**Responda antes de abrir:** você encontrou `RowExclusiveLock` no diagnóstico e concluiu “toda a tabela está impedida de receber qualquer acesso”. Qual é o erro?

<details>
<summary>Resposta comentada</summary>

O nome descreve um modo de lock de tabela, mas o conjunto de conflitos desse modo não impede todos os acessos à tabela. Não basta traduzir o nome. Consulte o tipo do recurso e os modos incompatíveis, e investigue a espera concreta. A conclusão enganosa confunde escopo da proteção, exclusividade de todo acesso e lock de linha.

</details>

No trabalho, uma boa justificativa é pequena e específica: “a regra cabe nessa linha; a condição é verificada no `UPDATE`; zero linhas impede criar pedido; confirmação inclui baixa e pedido”. Depois explique como o cliente recupera uma resposta perdida — assunto da próxima etapa após durabilidade.

[Próxima: durabilidade](06-durabilidade.md) · [Glossário](glossario.md) · [Índice](README.md)
