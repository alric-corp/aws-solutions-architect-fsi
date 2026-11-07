# Conversa técnica — Vitória e Cleber

Uma conversa de 60 minutos para praticar o raciocínio sobre transações, repetição segura e investigação de falhas, usando três situações fictícias da Loja Horizonte.

**Participantes:** Vitória e Cleber. Este é o roteiro da participante, sem respostas ou diagnóstico antecipado. Não exige slides, instalação de banco, conta cloud ou acesso a sistemas reais.

## Mensagem de abertura

> Cleber, para aproveitar nossa hora, queria focar no meu raciocínio sobre transações e investigação de falhas. Estou revisando ACID, concorrência, idempotência e troubleshooting, mas queria sair das definições e discutir situações concretas.
>
> Pensei em três situações: duas pessoas comprando a última unidade de um produto; uma compra que retorna timeout e deixa dúvida sobre o resultado; e uma operação lenta mesmo com o sistema aparentemente disponível.
>
> Queria tentar explicar minha abordagem primeiro e depois receber suas perguntas, contrapontos e correções. No final, gostaria de identificar dois pontos prioritários para aprofundar e uma forma prática de exercitá-los.

## Agenda — 60 minutos

- **00–05 —** Alinhar objetivo e dinâmica.
- **05–20 —** Compra da última unidade: transação, regras e concorrência.
- **20–35 —** Compra com timeout: resultado desconhecido e repetição segura.
- **35–53 —** Checkout lento: diagnóstico por evidências, mitigação e validação.
- **53–60 —** Feedback específico, síntese e duas ações de estudo.

Os tempos são um orçamento de conversa, não duração medida. Se faltar tempo, reduzir o aprofundamento em níveis de isolamento e preservar os sete minutos finais.

## Combinado de condução

Vitória explica primeiro, por cerca de **60–90 segundos**, antes de receber pistas. Cleber aprofunda com perguntas sobre mecanismos, alternativas, limites e testes e anota os pontos de dúvida sem completar a resposta dela.

Após cada correção importante, Vitória explica novamente com suas palavras ou responde a uma pequena variação. O objetivo é verificar o entendimento, não terminar a correção apenas com “entendi”.

## Cenário fictício compartilhado

A Loja Horizonte tem um produto com **uma unidade disponível**. A compra aceita deve registrar o pedido e reduzir o estoque **no mesmo banco relacional**. Colocar no carrinho não reserva o produto.

Neste modelo inicial não há cobrança externa, tarifas, envio de mensagens ou e-mail. Essas situações podem ser acrescentadas depois, com novas premissas explícitas. PostgreSQL 18 é a referência quando a discussão depender de um comportamento específico da engine.

## 05–20 — Uma unidade, duas compras

Duas pessoas tentam comprar ao mesmo tempo. Registrar uma compra exige reduzir o estoque e criar um pedido no mesmo banco de dados. Como você organizaria isso para não vender duas vezes a mesma unidade nem deixar metade da operação confirmada?

Comece pela regra que precisa preservar. Desenhe onde começa e termina a transação e explique em que momento considera a compra aceita.

**Pergunta central:** onde começa e termina a transação? Como evitar aceitar duas compras diferentes da última unidade?

## 20–35 — A compra retornou timeout

Uma pessoa envia uma compra. A aplicação demora e ela recebe timeout. O banco pode ter confirmado o pedido antes de a resposta se perder. O usuário tenta novamente.

**Pergunta central:** como descobrir o que aconteceu e permitir uma nova tentativa sem criar outra compra? Como distinguir a repetição da mesma intenção de uma nova compra legítima?

## 35–53 — A página abre, mas o checkout está lento

Clientes relatam lentidão e timeout ao concluir compras. A página inicial abre normalmente. A equipe do banco diz que há conexões ativas e que a CPU não está alta.

**Pergunta central:** como localizar a espera antes de escolher uma solução? Peça as informações que ajudariam a distinguir suas hipóteses. As evidências serão liberadas conforme a investigação; não é preciso executar ferramentas.

## Perguntas para atravessar os três blocos

- Qual regra você está tentando preservar?
- O que esse mecanismo garante e o que não garante?
- Qual evidência confirma ou contradiz sua hipótese?
- Qual alternativa você consideraria?
- Como verificaria o resultado para o cliente?

## 53–60 — Fechamento

Qual conceito ficou menos claro? Qual parte da investigação foi prematura? O que foi conhecimento insuficiente e o que foi dificuldade de explicar? Quais **duas ações concretas** devem vir a seguir?

Para cada ação, combinar uma prática e uma evidência de aprendizado: uma explicação refeita, um desenho ou uma variação resolvida. Não há pontuação de carreira nem promessa de resultado em entrevista.

## Acessos da sessão

[← Voltar às simulações](../README.md) · [Praticar](../../../praticar/index.html)

**Para Cleber:** o guia de condução está em [Praticar, no acesso do instrutor](../../../praticar/index.html#instrutor). Contém referências de raciocínio, respostas, evidências progressivas e espaço de registro em branco. Abra-o separadamente; não compartilhe toda a tela com a participante. A separação de audiência organiza o treino e não é autenticação.
