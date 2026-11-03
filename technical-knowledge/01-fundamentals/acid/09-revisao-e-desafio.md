# 09 — Revisão e desafio: a última unidade, outra vez

[← 08 — ACID e BASE](08-acid-base-sql-nosql.md) · [Índice](README.md) · [Laboratório](laboratorio/README.md) · [Glossário](glossario.md)

Você já pode ligar as letras a consequências concretas. Atomicidade evita deixar metade da unidade confirmada. Consistência exige regras implementadas para distinguir estados válidos. Isolamento define como operações concorrentes podem interagir; o nível escolhido e o mecanismo precisam proteger a decisão. Durabilidade dá significado à confirmação diante das falhas cobertas pelo contrato.

## Explique em voz alta

Imagine que uma colega vai implementar sua primeira compra com estoque. Explique em dois minutos por que `BEGIN` sozinho não basta, qual é a unidade que deve confirmar e o que ela deve fazer se perder a resposta. Use um exemplo com números. Depois abra os critérios para revisar sua explicação.

<details><summary>Resposta comentada — critérios de uma boa explicação</summary>

Uma explicação suficiente começa com a unidade disponível e duas intenções diferentes que a disputam. Mostra que ambas podem ler 1 antes de qualquer escrita, inclusive em transações `READ COMMITTED`. Propõe uma baixa condicional, ou lock/versão corretamente usados, e confere o resultado antes do pedido. Estoque, pedido e identidade confirmam juntos. Uma repetição usa a mesma chave e recupera o resultado registrado. Um timeout deixa o resultado incerto até consultar ou repetir pelo protocolo. Dizer apenas “o banco é ACID” omite as escolhas que tornam essa operação correta.

</details>

## Desafio final — abertura

O contexto é exatamente o da Loja Horizonte: carrinho não reserva, `SKU-1` começa com estoque 1, quantidade da compra é 1, não há pagamento externo. A primeira intenção é `compra-001`; a segunda é `compra-002`. Cada chave tem parâmetros estáveis. O contrato memoriza também recusas. Todas as decisões usam o mesmo banco e a função `acid_lab.comprar` do laboratório.

Antes de executar, desenhe o estado de estoque, pedidos e operações depois de cada linha. Use **PostgreSQL 18, READ COMMITTED**, autocommit ligado fora de `BEGIN`; faça o reset restrito do laboratório e abra duas conexões com PIDs diferentes. Aplique os timeouts sugeridos no roteiro laboratorial. Os resultados abaixo são perguntas, não saídas medidas.

| Passo | Sessão A | Sessão B |
|---|---|---|
| 1 | `BEGIN ISOLATION LEVEL READ COMMITTED;` | — |
| 2 | `SELECT acid_lab.comprar('compra-001','SKU-1',1);` | — |
| 3 | — | `BEGIN ISOLATION LEVEL READ COMMITTED;` |
| 4 | — | `SELECT acid_lab.comprar('compra-002','SKU-1',1);` |
| 5 | `COMMIT;` | Aguardando a disputa de estoque |
| 6 | Imagine resposta de A perdida | B recebe o resultado; `COMMIT;` |
| 7 | `SELECT acid_lab.comprar('compra-001','SKU-1',1);` | — |

Responda antes de abrir:

1. Em qual passo B espera, e qual recurso está sendo disputado?
2. Qual é o resultado esperado de B? Quantos pedidos existem depois do passo 7?
3. O passo 7 deveria usar uma nova chave? Por quê?
4. Se A fizer `ROLLBACK` no passo 5, como muda o resultado de B?
5. Se a mesma chave reaparecer com quantidade 2, o que deve acontecer?
6. Que garantia este experimento não oferece sobre uma cobrança em outro serviço?

<details><summary>Resposta comentada — desafio final</summary>

B espera no passo 4 ao tentar modificar o mesmo produto que A já alterou, ainda sem confirmar. As chaves são diferentes, portanto a disputa principal é pelo estoque, não pela unicidade da operação. Depois do commit de A, a baixa condicional de B não encontra estoque suficiente. B recebe recusa, representada por `NULL`, e confirma o registro dessa recusa. Há um pedido e estoque zero.

No passo 7, A deve usar `compra-001` e os mesmos parâmetros. Recupera o pedido que já confirmou, mesmo com estoque zero agora. Usar uma chave nova significaria outra intenção, podendo produzir outra decisão em condições diferentes.

Se A desfizer em vez de confirmar, sua baixa e seus registros não ficam confirmados; B pode baixar a unidade liberada e registrar o pedido. Não suponha que B tenha sido recusada só porque esperou. Esperar não é um resultado de negócio.

Quantidade 2 com `compra-001` é reutilização incompatível e deve gerar erro, sem outro efeito. Se estiver em uma transação explícita que recebeu erro, encerre com `ROLLBACK` antes de continuar.

Uma chamada externa não participa automaticamente desta transação SQL local. O teste não prova cobrança, e-mail ou entrega exatamente uma vez. A alternativa “o rollback desfaz qualquer coisa que o programa fez” ignora a fronteira transacional.

</details>

Depois da execução, verifique pelo banco:

```sql
-- Mesmas condições e estado produzidos pelo desafio; consulta em autocommit.
SELECT id, estoque, versao FROM acid_lab.produtos ORDER BY id;
SELECT operacao_id, produto_id, quantidade FROM acid_lab.pedidos ORDER BY id;
SELECT chave, produto_id, quantidade, resultado, pedido_id
FROM acid_lab.operacoes ORDER BY chave;
```

Essa verificação encontra o efeito registrado. Ela não mede latência da API, segurança de autenticação ou resistência a queda de energia. Para encerrar, faça `ROLLBACK` nas sessões que ficaram abertas e use o reset restrito se for repetir. Não confunda números de sequência sem lacunas com quantidade correta de pedidos.

## Diagnóstico e escolha

**Responda antes de abrir:** uma implementação lê estoque 1, grava 0 e insere pedido, tudo em uma transação. Outra faz `UPDATE ... WHERE estoque >= 1`, verifica uma linha alterada e só então insere o pedido, também na mesma transação. Qual você escolheria neste pequeno exemplo?

<details><summary>Resposta comentada</summary>

A segunda protege a condição no momento da escrita e detecta quando outra operação consumiu a unidade. A primeira pode usar um valor lido antes e perder uma atualização. “As duas têm transação, então são equivalentes” é a alternativa enganosa. Um lock adquirido antes da decisão ou uma versão conferida na escrita também podem resolver, mas exigem seguir seu protocolo integralmente.

</details>

Você concluiu o núcleo quando consegue explicar o mecanismo e seu limite, prever uma intercalação e reconhecer o resultado incerto de um timeout. O próximo passo de prática é mudar uma hipótese pequena — por exemplo, estoque inicial 2 —, prever novamente e conferir as mesmas invariantes. Não é preciso transformar esse exercício em um sistema distribuído para demonstrar compreensão.

[Voltar ao índice](README.md) · [Repetir os laboratórios](laboratorio/README.md)
