# 07 — Timeout, repetição e idempotência

[← 06 — Durabilidade](06-durabilidade.md) · [Índice](README.md) · [Próxima: 08 — ACID e BASE →](08-acid-base-sql-nosql.md)

A pessoa clicou em comprar e esperou. A tela mostrou “tempo esgotado”. O servidor pode ter parado antes de confirmar; também pode ter confirmado e perdido a resposta no caminho. **Timeout** é o fim de um prazo de espera em algum componente. Sem saber onde ocorreu e o que foi confirmado, a mensagem não resolve essa ambiguidade.

| Momento da falha | Estado possível no banco | Próximo passo coerente |
|---|---|---|
| Antes do commit, transação desfeita | Nenhum pedido dessa tentativa confirmado | Repetir a mesma intenção com a mesma identidade |
| Commit ocorreu, resposta se perdeu | Pedido e baixa confirmados | Recuperar o resultado pela mesma identidade |
| Resposta de confirmação chegou; depois a página falhou | Compra já conhecida como aceita | Consultar o pedido; nova compra requer outra intenção |

**Responda antes de abrir:** a API deu timeout. A compra certamente falhou?

<details><summary>Resposta comentada</summary>

Não. A falta de resposta é informação sobre o que o cliente recebeu. O banco pode ter confirmado antes dela. “Repetir com um novo ID para garantir” é enganoso: pode transformar uma repetição da mesma intenção em uma segunda compra. Primeiro preserve a identidade da operação e use o protocolo para descobrir ou obter o resultado.

</details>

## Três identidades com funções diferentes

Um token de sessão identifica ou autentica uma sessão da aplicação. Uma chave da operação identifica **esta intenção de compra**. Uma versão ou lock coordena mudanças concorrentes. Trocar o token de login não deveria transformar a mesma compra em outra; usar uma chave idempotente não impede outra pessoa de disputar o produto.

Chamamos uma operação de **idempotente** quando repetir a mesma operação preserva seu efeito sem acrescentar outro efeito equivalente. Para este laboratório, a chave `compra-001`, o produto `SKU-1` e a quantidade 1 formam uma intenção estável. O banco guarda o resultado. Repetições compatíveis recuperam esse resultado; a mesma chave com outros parâmetros é erro. Isso é uma implementação didática local do princípio de identidade explícita e registro atômico discutido na [AWS Builders' Library](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/).

A analogia é um protocolo de atendimento: a segunda consulta ao protocolo pergunta sobre o mesmo pedido. Um novo protocolo pode abrir outro pedido. O limite: um número impresso não impede duplicação sozinho. É necessário que a regra de unicidade e o registro do efeito sejam protegidos na mesma fronteira transacional.

## Uma implementação pequena, por dentro

O [arquivo de operações do laboratório](laboratorio/README.md) define `acid_lab.comprar(chave, produto, quantidade)`. Usa PL/pgSQL, a linguagem de funções do PostgreSQL. Aqui, `IF` escolhe um caminho, variáveis guardam resultados e `RAISE EXCEPTION` interrompe a tentativa com erro. Uma função não confirma por conta própria: participa da transação da chamada.

O mecanismo começa tentando **inserir** uma chave protegida por `PRIMARY KEY`. Duas chamadas que chegam ao mesmo tempo não podem ambas registrar a mesma chave. `INSERT ... ON CONFLICT DO NOTHING` faz a segunda esperar uma inserção conflitante ainda em andamento e então resolve o conflito. Não é o padrão vulnerável “consultar se existe e inserir depois”. [INSERT no PostgreSQL 18](https://www.postgresql.org/docs/18/sql-insert.html)

O vencedor tenta uma baixa condicional. Se afetar uma linha, registra o pedido e o resultado na mesma transação. Se não afetar, registra uma recusa sem criar pedido. Quem encontrou a chave já existente confere os parâmetros e devolve o resultado registrado. Em `READ COMMITTED`, a consulta seguinte pode ver o commit que resolveu a disputa pela chave. O protocolo do laboratório exige esse nível; outros níveis podem exigir reiniciar a transação.

```text
intenção recebida: chave, produto, quantidade
validar chave preenchida e quantidade positiva
tentar registrar chave única
se chave já existia:
    ler resultado confirmado e comparar produto e quantidade
    se diferentes: erro de reutilização
    se iguais: devolver pedido anterior ou recusa anterior
senão:
    UPDATE produto SET estoque = estoque - quantidade
        WHERE id = produto AND estoque >= quantidade
    se alterou exatamente uma linha:
        INSERT pedido
        guardar identificador do pedido e resultado aceito
    senão:
        guardar recusa (sem pedido e sem baixa)
confirmar a unidade inteira ou desfazer por erro
```

O pseudocódigo é uma leitura do protocolo; a versão SQL integral e executável acompanha o laboratório. O `UPDATE` e o `INSERT` não podem ser confirmados separadamente. Se o registro do pedido falhar após a baixa, o erro deve desfazer aquela tentativa inteira. A constraint do estoque e a unicidade são defesas concretas, não instruções decorativas.

Nossa regra adicional é **memorizar também a recusa**. Se amanhã houver reposição, repetir a mesma chave recusada continua devolvendo a recusa original. Uma nova decisão de compra usa outra chave. Produto inexistente é erro de integridade referencial: a chave estrangeira exige um produto cadastrado. Falta de estoque de um produto existente é recusa; entrada inválida e reutilização incompatível também geram erro. Isso evita que “a mesma intenção” mude de significado silenciosamente.

## Exemplo acompanhado: resposta perdida

**Contrato:** PostgreSQL 18, `READ COMMITTED`, autocommit ligado fora dos blocos explícitos; schema e funções instalados pelo laboratório. Execute o reset restrito com todas as outras sessões encerradas. Inicialmente estoque 1, nenhum pedido ou operação. Sessão A:

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT acid_lab.comprar('compra-001', 'SKU-1', 1) AS pedido;
COMMIT;
-- Imagine que a resposta HTTP deste commit não chegou ao cliente.
```

O resultado esperado é um identificador de pedido, sem exigir que seja um número específico: sequências podem ter lacunas. Agora a sessão B repete com a **mesma chave e parâmetros**:

```sql
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT acid_lab.comprar('compra-001', 'SKU-1', 1) AS mesmo_pedido;
COMMIT;
SELECT estoque FROM acid_lab.produtos WHERE id = 'SKU-1';
SELECT operacao_id, quantidade FROM acid_lab.pedidos ORDER BY id;
SELECT chave, resultado, pedido_id FROM acid_lab.operacoes;
```

| Estado | Estoque | Pedidos para `compra-001` | Resultado da repetição |
|---|---:|---:|---|
| Inicial | 1 | 0 | Ainda não existe |
| Primeiro commit | 0 | 1 | ID registrado |
| Repetição confirmada | 0 | 1 | Mesmo ID |

Isso demonstra repetição sem novo efeito **no banco deste exercício**. Não simula uma perda real de resposta HTTP nem demonstra entrega de e-mail exatamente uma vez. Para encerrar, `ROLLBACK` em qualquer tentativa deixada aberta; depois reset restrito para repetir outros exercícios.

**Responda antes de abrir:** se a segunda chamada usa `compra-001` com quantidade 2, deve devolver o pedido anterior, comprar mais uma unidade ou rejeitar?

<details><summary>Resposta comentada</summary>

Deve rejeitar a reutilização incompatível. A chave identifica uma intenção com parâmetros, não um passe para mudar o pedido. Devolver o pedido anterior esconderia um erro do cliente; comprar mais uma unidade violaria o contrato. A função compara os parâmetros antes de reutilizar o resultado.

</details>

## Duas chamadas chegam ao mesmo tempo

Antes desta variação, encerre os blocos anteriores e execute novamente o reset restrito: estoque 1, nenhuma operação ou pedido. Confira `pg_backend_pid()` em A e B; valores iguais significam que você não abriu conexões independentes. `BEGIN` em A e faça a primeira compra sem confirmar ainda. Alterne conforme esta tabela; não rode A inteira antes de B se quiser observar a espera:

| Passo | Sessão A | Sessão B | Resultado esperado |
|---|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | — | Transação aberta |
| 2 | `SELECT acid_lab.comprar('compra-001','SKU-1',1);` | — | Pedido provisório só em A |
| 3 | — | `BEGIN ISOLATION LEVEL READ COMMITTED;` | Transação B aberta |
| 4 | — | `SELECT acid_lab.comprar('compra-001','SKU-1',1);` | Espera pela disputa da chave única |
| 5 | `COMMIT;` | Aguardando | B prossegue e retorna o mesmo pedido |
| 6 | — | `COMMIT;` | Só um efeito confirmado |

Use os limites de espera do laboratório; se houver timeout, execute `ROLLBACK` antes de repetir. Se A fizer rollback no passo 5, B pode se tornar a primeira execução efetiva. A unicidade da chave e a fronteira transacional resolvem os dois caminhos. O teste automatizado observa a espera do servidor antes de liberar A.

**Responda antes de abrir:** idempotência impede duas compras **diferentes** de disputar a última unidade?

<details><summary>Resposta comentada</summary>

Não. `compra-001` e `compra-002` são intenções diferentes e podem disputar. A baixa condicional protege a quantidade disponível; a identidade estável protege contra repetir o efeito de uma intenção. A alternativa “uma chave única resolve todo o estoque” protege a identidade errada: cada compra tem sua própria chave, mas todas atingem a mesma linha de produto.

</details>

## Onde a promessa termina

Neste exercício há um único espaço de chaves, sem usuários reais e sem expiração. Uma API real precisaria definir o escopo por cliente, autenticação, retenção e o comportamento depois do prazo de retenção. Não apagar registros idempotentes arbitrariamente faz parte do contrato didático.

Confirmar a compra e enviar um e-mail são efeitos em autoridades diferentes. Uma **outbox** registra na mesma transação a intenção de publicar um evento; outro processo tenta entregá-lo, com tratamento de duplicatas. Coordenação distribuída exige protocolo próprio. Isso delimita o exemplo: não prometemos *exactly-once* ponta a ponta.

No trabalho, antes de repetir, pergunte “esta tentativa representa a mesma intenção?” e “como recupero seu resultado?”. Em linguagem simples: concorrência impede vender além do disponível; idempotência impede que o reenvio de uma compra a transforme em duas.

[Próxima: 08 — ACID, BASE e SQL/NoSQL →](08-acid-base-sql-nosql.md)
