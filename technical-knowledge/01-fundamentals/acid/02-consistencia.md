# 02 — Consistência: regras que definem um estado válido

[Índice](README.md) · [Anterior: atomicidade](01-atomicidade.md) · [Próxima: isolamento](03-isolamento.md) · [Glossário](glossario.md)

A Loja Horizonte conseguiu confirmar uma baixa de estoque e um pedido juntos. Isso ainda permite um erro: a quantidade comprada poderia ser negativa, o produto poderia não existir ou dois registros poderiam representar o mesmo pedido. Confirmar o pacote inteiro não basta se o pacote contém dados que a loja considera inválidos.

Antes de escolher comandos, escrevemos as regras. Neste exercício, um produto precisa de identidade e nome; estoque não pode ser negativo; a quantidade de um pedido deve ser positiva; o pedido precisa referenciar um produto existente. Uma tentativa de compra pode ser recusada por falta de estoque, mas não deve gerar um pedido de sucesso.

Uma **invariante** é uma regra que deve permanecer verdadeira nos estados válidos. “Não vender mais unidades do que temos” é uma invariante da loja. No cenário das contas, declaramos outra: uma transferência local sem tarifas conserva o total dos saldos de Ana e Bruno. Também proibimos saldo negativo **neste exercício**. Uma conta com limite de crédito poderia ter outra regra; a letra C não define os produtos que uma empresa pode oferecer.

**Consistência**, em ACID, é a preservação das regras de validade ao levar o banco de um estado válido a outro. Isso exige uma operação correta, restrições apropriadas e proteção da decisão quando há concorrência. O SGBD não conhece automaticamente todas as regras descritas em uma reunião. [Verificações de consistência da aplicação no PostgreSQL 18](https://www.postgresql.org/docs/18/applevel-consistency.html)

## Regra, restrição e comportamento são coisas relacionadas

“Só vender se houver estoque” é uma regra do negócio. `CHECK (estoque >= 0)` é uma **restrição**, escrita no schema e verificada pelo banco. Tentar uma baixa, conferir se uma linha mudou e só então registrar o pedido é comportamento da aplicação ou de uma função. A restrição ajuda, mas não substitui a sequência correta.

Uma analogia: o formulário de matrícula exige um número de identificação e impede duplicatas. Os campos obrigatórios correspondem a restrições. A secretaria ainda precisa saber se a pessoa tem direito à vaga. O limite da analogia é que o banco executa as restrições formalizadas; não interpreta uma política escrita em linguagem natural para descobrir sozinho todas as validações.

**Responda antes de abrir:** uma tabela sem constraints sabe todas as regras da loja? Se aceitarmos somente estoque não negativo, estaremos protegidos contra vender a última unidade para duas pessoas?

<details>
<summary>Resposta comentada — formalizar a regra inteira</summary>

Não. O banco conhece tipos e mecanismos definidos, não a política completa da loja. Duas compras podem ler estoque 1 e depois gravar 0, cada uma criando um pedido: o estoque fica não negativo, mas dois pedidos disputaram uma unidade. A alternativa enganosa confunde uma regra por linha com a correção de todo o fluxo. Precisamos também condicionar a baixa à disponibilidade atual e conferir seu resultado, tema do capítulo 05.

</details>

## Cinco restrições por exemplos pequenos

Uma **chave primária**, `PRIMARY KEY` ou PK, identifica uma linha e combina unicidade com ausência de nulos. Uma **chave estrangeira**, `FOREIGN KEY` ou FK, exige que a referência corresponda a uma chave permitida da tabela de destino. `UNIQUE` impede repetição de uma combinação de valores, conforme o tratamento de nulos escolhido. `NOT NULL` proíbe valor ausente. `CHECK` verifica uma expressão sobre a linha.

**Nulo**, escrito `NULL`, representa ausência de um valor conhecido no modelo; não é o número zero nem o texto vazio. A diferença será importante logo abaixo. [Restrições do PostgreSQL 18](https://www.postgresql.org/docs/18/ddl-constraints.html)

| Restrição | Pergunta que resolve neste exercício | O que não resolve sozinha |
|---|---|---|
| PK em `produtos.id` | Qual linha representa `SKU-1`? | Se uma pessoa pode comprá-la |
| FK de pedido para produto | Existe o produto referenciado? | Se há unidades disponíveis |
| `UNIQUE` na identidade da operação | Já registramos essa identidade? | Se a repetição tem os mesmos parâmetros |
| `NOT NULL` no nome | O nome foi informado? | Se o nome foi digitado corretamente |
| `CHECK (estoque >= 0)` | O estoque desta linha é não negativo? | Se o número de pedidos corresponde às baixas |

**Prática 02.1 — ler um schema.** PostgreSQL 18, `READ COMMITTED`, autocommit ligado fora do bloco, uma sessão. Não exige seed: usa tabelas temporárias novas. Execute na ordem. `CREATE TABLE` define a estrutura; a criação e as inserções abaixo serão desfeitas no `ROLLBACK` final.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
CREATE TEMP TABLE consistencia_produtos (
    id text PRIMARY KEY,
    nome text NOT NULL,
    estoque integer NOT NULL CHECK (estoque >= 0)
);
CREATE TEMP TABLE consistencia_pedidos (
    id integer PRIMARY KEY,
    operacao_id text NOT NULL UNIQUE,
    produto_id text NOT NULL REFERENCES consistencia_produtos(id),
    quantidade integer NOT NULL CHECK (quantidade > 0)
);
INSERT INTO consistencia_produtos (id, nome, estoque)
VALUES ('SKU-1', 'Caneca Horizonte', 1);
INSERT INTO consistencia_pedidos (id, operacao_id, produto_id, quantidade)
VALUES (1, 'compra-a', 'SKU-1', 1);
SELECT id, estoque FROM consistencia_produtos; -- SKU-1, estoque 1.
SELECT id, quantidade FROM consistencia_pedidos; -- Pedido 1, quantidade 1.
ROLLBACK; -- Remove também as duas tabelas temporárias criadas no bloco.
```

Esse último par de consultas revela um limite proposital: o schema aceitou um pedido sem baixar estoque. Nenhuma restrição escrita acima exigiu essa relação entre os dois registros. A prática demonstra regras de formato e referência; **não é um fluxo seguro de compra**. Não a use para criar pedidos reais.

Para observar erros, repita a preparação até as duas inserções válidas, sem executar o `ROLLBACK` ainda. Depois escolha **uma** tentativa da tabela abaixo, execute-a e encerre com `ROLLBACK`. Refaça a preparação antes de testar outra: no PostgreSQL, o primeiro erro deixa esse bloco em estado abortado.

| Tentativa na sessão A | Resultado esperado | Motivo |
|---|---|---|
| `INSERT INTO consistencia_produtos VALUES ('SKU-1', 'Outro nome', 1);` | Erro `23505` | PK repetida |
| `INSERT INTO consistencia_produtos VALUES ('SKU-2', NULL, 1);` | Erro `23502` | Nome obrigatório |
| `UPDATE consistencia_produtos SET estoque = -1 WHERE id = 'SKU-1';` | Erro `23514` | Estoque negativo |
| `INSERT INTO consistencia_pedidos VALUES (2, 'compra-a', 'SKU-1', 1);` | Erro `23505` | Identidade de operação repetida |
| `INSERT INTO consistencia_pedidos VALUES (2, 'compra-b', 'ausente', 1);` | Erro `23503` | Produto não existe |
| `INSERT INTO consistencia_pedidos VALUES (2, 'compra-b', 'SKU-1', 0);` | Erro `23514` | Quantidade deve ser positiva |

Os códigos ajudam a identificar o tipo do erro; o texto exato pode variar. O `ROLLBACK` encerra a tentativa e limpa as tabelas desta prática. Isso mostra rejeição de valores inválidos e recuperação, sem simular todas as combinações de concorrência ou mecanismos de produção.

## Por que CHECK não substitui NOT NULL

Uma condição de `CHECK` é aceita quando resulta em verdadeiro **ou nulo** no PostgreSQL. Por isso, `CHECK (saldo_centavos >= 0)` sem `NOT NULL` não proíbe saldo ausente. Isso não significa que “nulo é positivo”; significa que a comparação com um valor ausente não resultou em falso.

**Prática 02.2.** PostgreSQL 18, `READ COMMITTED`, autocommit ligado fora do bloco, uma sessão, sem seed. Objetivo: observar a diferença sem alterar as tabelas comuns. Execute o bloco inteiro na ordem.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
CREATE TEMP TABLE check_sem_obrigatoriedade (
    id integer PRIMARY KEY,
    saldo_centavos bigint CHECK (saldo_centavos >= 0)
);
INSERT INTO check_sem_obrigatoriedade (id, saldo_centavos)
VALUES (1, NULL);                          -- Aceito.
SELECT id, saldo_centavos IS NULL AS saldo_ausente
FROM check_sem_obrigatoriedade;            -- 1, true.
ROLLBACK;
```

`IS NULL` testa se o valor é ausente; não use `= NULL` como se fosse uma comparação comum. Com `saldo_centavos bigint NOT NULL CHECK (saldo_centavos >= 0)`, a inserção acima seria rejeitada. O teste demonstra a necessidade de duas regras distintas, sem sugerir que todo campo precise ser obrigatório. [Semântica de `CHECK`](https://www.postgresql.org/docs/18/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS)

**Responda antes de abrir:** “saldo não pode ser negativo” é suficiente para exigir um saldo numérico informado? E a PK precisa de outro `NOT NULL` para proibir identificador ausente?

<details>
<summary>Resposta comentada — duas ausências diferentes</summary>

Para o saldo, não: use também `NOT NULL` quando a regra exigir valor presente. Para a chave primária, o próprio PostgreSQL já exige ausência de nulos e unicidade. A alternativa enganosa imagina que toda expressão sobre números rejeite automaticamente `NULL`. A prática mostrou que o resultado da comparação pode ser desconhecido, aceito pelo `CHECK`.

</details>

## Confirmar uma lógica errada continua sendo possível

As contas do laboratório têm saldo obrigatório e não negativo. Nenhuma dessas restrições, por si só, afirma que o total de Ana e Bruno deve continuar em `110000` centavos após uma transferência sem tarifas.

**Prática 02.3 — erro deliberado, para diagnóstico.** PostgreSQL 18, `READ COMMITTED`, autocommit ligado fora do bloco, uma sessão e nenhuma outra escrita. Comece com o seed, Ana `100000` e Bruno `10000`. O objetivo é demonstrar uma confirmação válida para as constraints e errada para a operação de negócio. Este código está incompleto e não é uma transferência recomendada.

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
UPDATE acid_lab.contas SET saldo_centavos = saldo_centavos - 10000
WHERE id = 'ana';                          -- Esquecemos o crédito.
COMMIT;                                   -- O schema não adivinha a omissão.
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
-- ana=90000, bruno=10000; ambos ainda não negativos.
SELECT sum(saldo_centavos) AS total_centavos FROM acid_lab.contas;
-- 100000: sum soma os valores das linhas; antes eram 110000.
```

| Regra | Antes | Depois da confirmação errada |
|---|---|---|
| Saldos presentes e não negativos | Satisfeita | Satisfeita |
| Total conservado na transferência | 110000 | 100000: violada |
| Destino recebeu R$ 100 | Ainda não se aplica | Não: etapa omitida |

Para encerrar, execute o [reset restrito](laboratorio/README.md), que restaura as duas contas do laboratório. Um `ROLLBACK` posterior não desfaz o `COMMIT` já realizado. A prática mostra que a aplicação pode confirmar lógica errada quando uma regra não foi implementada. Não mostra uma falha de atomicidade: o trabalho enviado confirmou como unidade, mas faltou trabalho obrigatório. A correção é a operação validada do capítulo 01, que confere ambos os lados, protegendo também a concorrência.

## Uma regra entre linhas exige outro raciocínio

“O saldo desta linha é não negativo” depende de uma linha. “A soma de todos os débitos é igual à soma de todos os créditos” compara várias. Um `CHECK` comum não percorre automaticamente outras linhas para garantir uma soma global, e tentar escondê-la em uma função chamada pelo `CHECK` não torna essa garantia segura. Alterações futuras em outras linhas poderiam invalidar a soma sem reavaliar a linha anterior.

No exemplo pequeno, o procedimento da transferência e sua fronteira transacional mantêm os dois lados juntos. Em outras regras, podem ser adequados uma modelagem diferente, chaves e referências, uma linha de coordenação, locks ou isolamento `SERIALIZABLE`. O mecanismo precisa corresponder à regra, e todos os caminhos de escrita precisam respeitá-lo. Não é necessário decorar essas alternativas agora: os capítulos 03–05 mostram quando uma decisão pode envelhecer entre leitura e escrita. [Limites das restrições entre linhas](https://www.postgresql.org/docs/18/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS) e [regras na aplicação](https://www.postgresql.org/docs/18/applevel-consistency.html).

**Responda antes de abrir:** uma transação com `BEGIN` e `COMMIT`, sem constraints nem validações, conhece a regra “não vender mais do que temos”? Como você explicaria a diferença entre atomicidade e consistência em voz alta?

<details>
<summary>Resposta comentada — pacote e regras</summary>

Não. Os delimitadores reúnem o trabalho; não descrevem estoque, quantidades permitidas ou relação entre pedido e baixa. Uma explicação possível: “Atomicidade decide se o conjunto confirma inteiro. Consistência exige que o estado confirmado respeite as regras que definimos e implementamos.” A alternativa enganosa atribui todo erro de regra a uma confirmação parcial. O teste anterior confirmou integralmente uma operação mal escrita.

</details>

## A mesma palavra aparece em outros assuntos

Aqui, consistência trata de estados válidos e regras da operação. Em discussões de réplicas, podemos perguntar se uma leitura já vê uma escrita recente. Em CAP, a palavra costuma indicar outra garantia, relacionada à aparência de uma única cópia com ordenação em tempo real. Uma réplica atualizada não corrige automaticamente uma regra de negócio ausente; uma transação correta também não torna toda réplica imediatamente atualizada. O [complemento 08](08-acid-base-sql-nosql.md) separa esses assuntos depois do núcleo.

No trabalho, comece pedindo uma frase verificável: “qual estado nunca pode ser confirmado?”. Depois identifique onde essa frase é implementada e tente uma escrita que a contradiga. Em linguagem simples: **o banco consegue defender regras formalizadas; ele não inventa a política da loja**.

[Anterior: atomicidade](01-atomicidade.md) · [Próxima: isolamento](03-isolamento.md)
