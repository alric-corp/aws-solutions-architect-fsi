# System Design a partir do zero

Esta trilha ensina **decisões de arquitetura** começando do absoluto zero, com uma loja fictícia — a [Loja Horizonte](ecommerce/00-scenario.md) — como fio condutor. Você não precisa saber de antemão o que é cliente, servidor, API, banco de dados ou qualquer serviço AWS: cada termo é explicado quando aparece.

## Para quem é

Para quem quer entender **como** e **por que** um sistema é desenhado de um jeito, não apenas decorar nomes de serviços. Se você já domina os fundamentos, use os módulos [SD01–SD05](README.md) e os [cases FSI](../../cases/); esta trilha é a porta de entrada antes deles.

## Como usar a trilha

- Siga as **aulas** na ordem, começando pela Aula 1.
- Responda às **perguntas** em voz alta antes de abrir as respostas.
- Cada aula apresenta o que você precisa saber da loja. O **cenário** reúne personagens, produto e regras comuns; consulte-o quando quiser o contexto completo.
- Trate os **aprofundamentos** e links para outros módulos como material extra, não como pré-requisito para entender a aula.

## Comece por aqui

1. [Aula 1 — Você clicou em um produto. O que aconteceu?](ecommerce/01-from-click-to-catalog.md): o caminho do nome, do preço e da fotografia até a tela.
2. [Aula 2 — Você colocou no carrinho. O que a loja precisa guardar?](ecommerce/02-from-cart-to-order.md): da escolha de produtos ao registro de um pedido, com persistência, validação e limites explícitos.
3. [Aula 3 — A loja cresceu. Como Ana continua no mesmo carrinho?](ecommerce/03-scaling-and-session.md): duas cópias da aplicação, balanceamento e sessão compartilhada para continuar a visita.
4. [Aula 4 — O catálogo cresceu. Como encontrar os produtos sem esperar tanto?](ecommerce/04-catalog-queries.md): consultas, índice composto e evidências para avaliar o trabalho do banco.
5. [Aula 5 — Todo mundo consulta os mesmos produtos. O que podemos reaproveitar?](ecommerce/05-cache-cdn.md): cache público compartilhado, fotografias por CDN e limites de atualização.
6. [Aula 6 — Ana e Bruno querem a última unidade. Quem consegue reservar?](ecommerce/06-last-unit.md): alteração condicional, transação e limites da reserva concorrente.
7. [Aula 7 — O pagamento ficou sem resposta. Como evitar cobrar duas vezes?](ecommerce/07-payment-uncertain.md): intenção durável, idempotência e reconciliação de resultados incertos.
8. [Aula 8 — O trabalho precisa continuar. Como processar sem deixar Ana esperando?](ecommerce/08-async-work.md): tarefa durável, outbox, fila e processamento com repetições.
9. [Aula 9 — A loja falhou. Como voltar sem perder o que foi confirmado?](ecommerce/09-failure-recovery.md): continuidade, recuperação de dados e reconciliação após falhas.
10. [Aula 10 — A loja precisa mudar. Como atualizar com compras em andamento?](ecommerce/10-safe-changes.md): versões compatíveis, atualização gradual e limites do retorno de código.
11. [Cenário — Loja Horizonte](ecommerce/00-scenario.md): o contexto comum a todas as aulas.

Fundamentos de apoio (opcionais, para aprofundar): [HTTP e requisição/resposta (F02)](../01-fundamentals/02-http-rest-openapi.md) · [computação e EC2 (F04)](../01-fundamentals/04-compute-containers.md) · [armazenamento e objetos (F05)](../01-fundamentals/05-storage.md) · [modelos de dados (F06)](../01-fundamentals/06-databases-transactions-consistency.md) · [nuvem e responsabilidades (F00)](../01-fundamentals/00-cloud-computing.md).

## O que significa estudar decisões de arquitetura

Projetar um sistema é, sobretudo, **tomar decisões sob restrições e explicá-las**. Em cada aula você vai:

- partir de uma **situação concreta** (alguém fazendo algo na loja);
- identificar **o que precisamos entregar** e com que qualidade (os requisitos);
- entender o **funcionamento** antes de nomear tecnologias;
- comparar **alternativas e trade-offs** de uma decisão;
- ver uma **implementação possível na AWS**, sabendo o que ela resolve e o que não resolve;
- observar **o que acontece quando algo falha**.

Uma boa resposta de arquitetura não é "qual serviço usar". É "qual é o problema, quais opções existem, o que cada uma favorece e custa, e como eu verificaria se funcionou".

## Próximas etapas (planejadas)

As dez aulas desta sequência estão disponíveis. Não há uma Aula 11 planejada neste roteiro. Para continuar, revise as decisões no índice e aprofunde os temas que precisarem de estudo ou validação próprios.

A aplicação da loja será **ampliada apenas quando uma necessidade nova aparecer** — nunca "porque sim". E **não há obrigação** de terminar a trilha usando todos os padrões de arquitetura: cada padrão entra quando resolve um problema real do cenário.

Concluir as páginas não significa que a loja foi implantada ou que as propostas foram testadas em produção; os limites e as evidências ainda necessárias ficam explícitos em cada aula.

## Para quem escreve ou mantém as aulas

O [guia editorial](../learning-guide.md) descreve como as aulas são estruturadas e revisadas. Não é preciso lê-lo para estudar.
