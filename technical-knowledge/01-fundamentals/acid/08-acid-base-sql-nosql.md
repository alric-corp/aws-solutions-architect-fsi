# 08 — ACID, BASE e SQL/NoSQL sem falsas dicotomias

[← 07 — Timeout e idempotência](07-timeout-idempotencia.md) · [Índice](README.md) · [Próxima: 09 — Revisão e desafio →](09-revisao-e-desafio.md)

Este complemento vem depois da compra protegida. Você não precisa escolher uma família de banco para entender ACID. Comece perguntando qual operação precisa de qual garantia e sobre quais dados.

## Três perguntas que os rótulos escondem

**Modelo de dados** trata de como representamos e acessamos informação: linhas relacionadas, documentos, pares chave/valor e outros modelos. **Garantia transacional** trata da unidade que confirma, das regras e da interação entre operações. **Replicação** trata de cópias e da propagação de mudanças entre elas. SQL é uma linguagem; “NoSQL” reúne produtos com contratos diferentes.

| Afirmação | Pergunta mais útil |
|---|---|
| “É SQL, então qualquer fluxo é consistente.” | Quais regras foram implementadas, em qual fronteira e nível de isolamento? |
| “É NoSQL, então não tem transações ACID.” | Quais APIs transacionais esse produto oferece e qual é seu escopo? |
| “Preciso escalar, então devo aceitar estoque incorreto.” | Como particionar trabalho e preservar a regra que autoriza a compra? |

Um contador do catálogo pode atrasar sem autorizar uma segunda compra. Uma transação correta no banco de origem também não garante que qualquer cópia já mostre o pedido. “A regra foi violada” e “uma réplica ainda não recebeu a mudança” descrevem problemas diferentes.

## Um contraexemplo concreto: DynamoDB

DynamoDB, um banco não relacional, oferece transações ACID. Suas APIs transacionais agrupam operações; não se deve generalizar esse contrato para qualquer chamada de lote. A documentação distingue `TransactWriteItems` de `BatchWriteItem`. [Transações do DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html)

Na documentação consultada, a escrita transacional abrange até **100 ações sobre itens distintos**, no total de até **4 MB**, em tabelas da **mesma conta e Região**. Não é uma transação entre Regiões. Índices secundários globais e streams recebem a propagação depois e não devem ser interpretados como uma fotografia atômica dessa transação. Esses limites qualificam a garantia; não invalidam seu uso como contraexemplo. Não fizemos chamadas AWS. [Escopo e funcionamento](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html)

**Responda antes de abrir:** uma loja usa um banco não relacional e uma réplica mostra estoque antigo. Isso prova que ele não oferece ACID?

<details><summary>Resposta comentada</summary>

Não. É preciso identificar a API, o escopo da transação e a cópia consultada. Atraso de propagação não demonstra ausência de atomicidade na origem. A alternativa enganosa usa o modelo de dados como explicação de todas as garantias. Também seria errado autorizar uma compra apenas porque uma projeção antiga mostra uma unidade.

</details>

## O que BASE acrescenta à conversa

BASE expande-se para **Basically Available, Soft state, Eventually consistent**. Em uma leitura introdutória: buscar atender operações dentro do contrato oferecido, admitir estados intermediários enquanto a informação se propaga e fazer as cópias convergirem, sob as condições do sistema, quando cessam novas atualizações. *Soft state* ressalta que o estado observado pode mudar com essa propagação mesmo sem uma nova ação do usuário naquele ponto.

Isso é um modo de discutir disponibilidade e convergência, não uma especificação completa de API. Não determina prazo máximo universal de convergência, regra de estoque, resolução de conflitos ou tolerância a perda de dados. O artigo de Dan Pritchett, **BASE: An ACID Alternative**, discute o comportamento do sistema como um todo; não autoriza tratar qualquer estado errado como aceitável. Usamos o artigo original em [cópia do PDF publicado](https://awoc.wolski.fi/dlib/big-data/Pritchett08-baseACID-acmqueue.pdf), sem adotar suas simplificações históricas como descrição universal dos produtos atuais.

O estoque de uma tela pode ficar temporariamente desatualizado. Duas compras aceitas para uma unidade violam nossa regra. Um pedido confirmado perdido descreve perda de dados. Esses três fatos precisam de diagnósticos próprios. “É eventual” não explica nem justifica todos eles.

Não precisamos de CAP para resolver os exercícios desta trilha. Nesse contexto, consistência significa linearizabilidade: as operações parecem ocorrer sobre uma única cópia e respeitam a ordem em tempo real. É uma definição separada do C das regras de estado válido em ACID; não vamos abrir aqui uma trilha de replicação. [Definição na análise de Martin Kleppmann](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html)

**Responda antes de abrir:** escolha uma frase para explicar a decisão da loja: “BASE permite vender qualquer quantidade” ou “posso aceitar atraso de exibição e ainda proteger a autorização da compra”?

<details><summary>Resposta comentada</summary>

A segunda. A loja pode definir uma experiência que tolera informação desatualizada na vitrine e verifica a disponibilidade na escrita autoritativa. A primeira mistura convergência entre cópias com violação de uma regra de negócio. A proteção concreta continua precisando de um mecanismo e de uma fronteira declarados.

</details>

No trabalho, compare contratos de operações e requisitos de acesso, não apenas categorias. Em linguagem simples: como os dados são organizados, como confirmam e como se espalham são decisões relacionadas, mas distintas.

[Próxima: 09 — Revisão e desafio →](09-revisao-e-desafio.md)
