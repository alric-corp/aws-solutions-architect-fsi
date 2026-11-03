# ACID do zero — uma compra que precisa dar certo

Duas pessoas encontram a última unidade na Loja Horizonte. Ambas clicam em comprar. Como evitar prometer o mesmo produto duas vezes? E se a compra acontecer, mas a resposta não chegar? Esta trilha constrói as ferramentas para responder a essas perguntas, começando pelas tabelas e terminando em uma decisão protegida contra concorrência e repetição.

Você não precisa conhecer SQL, transações ou locks. Precisa apenas acompanhar os exemplos na ordem e tentar prever o resultado antes de abrir as respostas. A trilha é uma introdução com prática local, sem avaliação de senioridade ou pretensão de arquitetura de produção.

## O acordo da nossa loja

O produto `SKU-1` começa com **uma unidade disponível**. Colocar no carrinho apenas expressa interesse: **não reserva estoque**. Neste exercício, a compra aceita baixa o estoque e registra um pedido na mesma transação. A unidade só fica comprometida de forma definitiva quando essa transação confirma. Não há pagamento externo, entrega, cancelamento ou expiração de reserva neste modelo. Quando introduzirmos outra regra, vamos declará-la antes do exemplo.

O segundo cenário é uma transferência fictícia entre contas no **mesmo banco de dados**. Ana começa com **R$ 1.000**, Bruno com **R$ 100**. Transferir **R$ 100** deve terminar em **R$ 900 e R$ 200**. Não há tarifa, câmbio ou efeito em outro serviço. Não estamos implementando um sistema bancário real. Os saldos usam centavos inteiros para representar exatamente esses valores, sem `FLOAT`.

## Percurso

| Etapa | Pergunta que você aprenderá a responder |
|---|---|
| [00 — Transações do zero](00-transacoes-do-zero.md) | Como agrupar mudanças e decidir se confirmo ou desfaço? |
| [01 — Atomicidade](01-atomicidade.md) | Como impedir que só metade da transferência fique confirmada? |
| [02 — Consistência](02-consistencia.md) | Quem define e quem verifica um estado válido? |
| [03 — Isolamento](03-isolamento.md) | Por que uma leitura correta pode produzir uma decisão errada depois? |
| [04 — Anomalias e níveis](04-anomalias-e-niveis.md) | Que mudanças uma sessão pode observar durante sua transação? |
| [05 — Locks, versão e deadlocks](05-locks-concorrencia-deadlocks.md) | Como proteger a última unidade e reconhecer os conflitos? |
| [06 — Durabilidade](06-durabilidade.md) | O que significa o banco dizer que confirmou? |
| [07 — Timeout e idempotência](07-timeout-idempotencia.md) | Como repetir a mesma intenção sem comprar duas vezes? |
| [08 — ACID, BASE e modelos](08-acid-base-sql-nosql.md) | Por que SQL e NoSQL não decidem essas garantias sozinhos? |
| [09 — Revisão e desafio](09-revisao-e-desafio.md) | Consigo explicar e justificar uma solução pequena? |

O núcleo vai de 00 a 07. O capítulo 08 é um complemento; write skew e Serializable são aprofundamentos sinalizados no capítulo 04 e no laboratório. Você pode voltar a eles depois de proteger uma compra simples. O [glossário](glossario.md) serve para consulta durante a leitura, sem substituir as explicações.

## Da previsão ao experimento

O [laboratório](laboratorio/README.md) oferece schema, dados iniciais, funções, roteiros para duas sessões e verificações automatizadas. O dialeto principal é **PostgreSQL 18**. Resultados esperados nos capítulos são previsões fundamentadas na documentação; a versão efetivamente executada e a cobertura dos testes ficam no relatório do laboratório. O apêndice MySQL 8.4/InnoDB tem contexto próprio.

Não é necessário executar tudo na primeira leitura. Leia a tabela de intercalação, escreva sua previsão e só então rode os comandos alternando as sessões. Depois confronte o estado final com a regra que queria preservar. Essa sequência ensina mais que apenas obter uma tela sem erros.

As perguntas usam **“Responda antes de abrir”** e respostas recolhidas sob **“Resposta comentada”**, compatíveis com a exclusão de gabaritos da busca do site. Respostas continuam acessíveis por escolha do leitor.

## Origem e limites

As aulas, os números, as analogias e os exercícios são complementação autoral didática. As ideias temáticas indicadas no pedido foram revisadas contra fontes primárias, registradas em [referências e revisão técnica](referencias-e-revisao-tecnica.md). Os quatro anexos iniciais não estavam disponíveis no ambiente consultado. O complemento `Texto colado(20261103-045930).txt` foi recebido e lido; dele adaptamos o pequeno relatório de vendas, com revisão explícita de suas simplificações. Não presumimos título ou URL do vídeo.

No site, encontre esta trilha em **Biblioteca → Fundamentos → Transações e ACID do zero**. Use a navegação da trilha para avançar pelas aulas ou consultar os apoios. Depois desta introdução, o [F06 — Bancos, transações, consistência e escala](../06-databases-transactions-consistency.md) aprofunda modelos, índices e decisões distribuídas.

[Começar: 00 — Transações do zero →](00-transacoes-do-zero.md)
