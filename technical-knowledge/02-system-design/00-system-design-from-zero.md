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
2. [Cenário — Loja Horizonte](ecommerce/00-scenario.md): o contexto comum a todas as aulas.

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

Os temas abaixo serão desenvolvidos em aulas futuras, cada um a partir de uma nova necessidade da loja. **Ainda não existem** como páginas; esta lista é um roteiro, não um conjunto de links:

- carrinho e pedido;
- escala e sessão (atender mais pessoas sem perder o que elas estavam fazendo);
- consultas e índices (manter a consulta rápida quando há muitos produtos);
- cache e CDN (reaproveitar respostas e servir conteúdo mais perto);
- disputa pela última unidade (reserva correta);
- pagamento com resposta perdida (recuperar sem cobrar duas vezes);
- processamento assíncrono (trabalho que não precisa ser imediato);
- recuperação de falhas;
- implantação de mudanças.

A aplicação da loja será **ampliada apenas quando uma necessidade nova aparecer** — nunca "porque sim". E **não há obrigação** de terminar a trilha usando todos os padrões de arquitetura: cada padrão entra quando resolve um problema real do cenário.

Cada etapa só será escrita quando chegar a sua vez na trilha.

## Para quem escreve ou mantém as aulas

O [guia editorial](../learning-guide.md) descreve como as aulas são estruturadas e revisadas. Não é preciso lê-lo para estudar.
