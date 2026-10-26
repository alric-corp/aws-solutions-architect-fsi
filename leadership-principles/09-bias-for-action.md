# 09 — Bias for Action

**Em português:** Agir com risco calculado.

[Índice](README.md) · [STAR e evidências](00-star-and-evidence.md) · [Guia de prática](practice-guide.md)

Os nomes e o texto-base seguem [a lista oficial da Amazon](https://www.amazon.jobs/content/en/our-workplace/leadership-principles), conferida em 26/10/2026. Tradução didática; interpretação, perguntas e aplicações são autorais. [Proveniência](../references/README.md#s02).

## O que significa na prática

Avançar com velocidade quando a decisão permite experimentação, entendendo riscos e limites em vez de esperar informação perfeita.

### Texto do princípio

> Velocidade importa nos negócios. Muitas decisões e ações são reversíveis e não exigem estudo extenso. Valorizamos riscos calculados.

**Comportamento a evidenciar:** uma decisão rápida com risco entendido: por que era reversível, o que você limitou e como acompanhou.

### Como escolher uma experiência

Procure uma decisão sob prazo ou um incidente em que agiu com informação limitada e um mecanismo de contenção.

### Decisão e trade-off

Reversível precisa ter significado concreto. Retornar o código não reverte um vazamento ou um efeito financeiro externo. Identifique a fronteira antes de acelerar.

## Perguntas para prática

São 12 perguntas comportamentais, em português e inglês. Cada par PT/EN representa uma pergunta. Para o contexto de SA/FSI, use uma experiência equivalente se você ainda não atuou nesse setor.

### Decisões e execução

1. <a id="lp09-q01"></a> **LP09-Q01.** Conte uma decisão rápida que você tomou com informações incompletas. Por que agir naquele momento era melhor do que esperar?

   **EN:** Tell me about a quick decision you made with incomplete information. Why was acting then better than waiting?

2. <a id="lp09-q02"></a> **LP09-Q02.** Descreva uma situação em que você limitou o risco de uma ação tomada sob pressão.

   **EN:** Describe a situation where you limited the risk of an action taken under pressure.

3. <a id="lp09-q03"></a> **LP09-Q03.** Conte uma discussão que estava parada e que você destravou com uma decisão ou experimento.

   **EN:** Tell me about a stalled discussion you moved forward through a decision or experiment.

### Falhas e aprendizado

1. <a id="lp09-q04"></a> **LP09-Q04.** Conte uma decisão rápida sua que deu errado. Como você percebeu e corrigiu o caminho?

   **EN:** Tell me about a quick decision you made that went wrong. How did you recognize it and correct course?

2. <a id="lp09-q05"></a> **LP09-Q05.** Descreva uma ocasião em que você esperou informação demais e perdeu uma oportunidade de agir.

   **EN:** Describe a time when you waited for too much information and missed an opportunity to act.

3. <a id="lp09-q06"></a> **LP09-Q06.** Conte uma ação que parecia reversível, mas tinha consequências difíceis de desfazer. O que você aprendeu?

   **EN:** Tell me about an action that seemed reversible but had consequences that were hard to undo. What did you learn?

### Colaboração e influência

1. <a id="lp09-q07"></a> **LP09-Q07.** Conte como você conseguiu apoio para um teste pequeno quando outras pessoas queriam uma análise muito mais longa.

   **EN:** Tell me about a time when you gained support for a small test while others wanted a much longer analysis.

2. <a id="lp09-q08"></a> **LP09-Q08.** Descreva uma situação em que você percebeu que precisava parar e envolver quem tinha autoridade para decidir.

   **EN:** Describe a time when you realized you needed to stop and involve someone with the authority to decide.

3. <a id="lp09-q09"></a> **LP09-Q09.** Conte uma ocasião em que você ajudou o time a agir mais rápido sem perder um controle importante.

   **EN:** Tell me about a time when you helped your team move faster while maintaining an important control.

### Atuação de SA e contexto FSI

1. <a id="lp09-q10"></a> **LP09-Q10.** Conte um incidente em que você mitigou o impacto antes de concluir o diagnóstico. Como acompanhou o efeito da ação?

   **EN:** Tell me about an incident where you mitigated the impact before completing the diagnosis. How did you monitor the effect of your action?

2. <a id="lp09-q11"></a> **LP09-Q11.** Descreva uma mudança de arquitetura que você testou em um escopo limitado antes de ampliar.

   **EN:** Describe an architecture change you tested within a limited scope before rolling it out more broadly.

3. <a id="lp09-q12"></a> **LP09-Q12.** Conte como você tomou uma decisão urgente quando reverter código não bastaria para desfazer os efeitos sobre clientes ou transações.

   **EN:** Tell me about an urgent decision where reverting code would not have been enough to undo the effects on customers or transactions.

## Aprofundamentos

1. Qual era o custo de esperar e que informação ainda faltava?
2. O que poderia ser revertido de fato, em quanto tempo e com qual custo?
3. Qual era o raio de impacto e como você o limitou?
4. Quais sinais acionariam interrupção, rollback ou escalonamento?
5. Quem tinha autoridade para agir e como você manteve as outras pessoas informadas?
6. O que aconteceu após a ação e qual foi o custo total da escolha, inclusive dos erros?

## Evidências e revisão da resposta

Tempo até mitigação, alcance controlado, resultado e incidentes evitados ou causados. Não esconda os custos da escolha.

Registre a origem de cada número e o que você fez individualmente. Resultados da equipe devem continuar atribuídos à equipe. Quando a evidência for interna, prepare apenas uma forma permitida de descrevê-la, sem copiar documentos para o repositório.

**O que evitar:** Confundir coragem com imprudência; usar 70% de informação como regra para segurança; esperar aprovação para toda decisão pequena.

## Aplicação FSI — cenário hipotético

Durante falha regional, diferencie recuperar uma página estática de liberar novas transferências antes de confirmar autoridade de escrita.

Use o [Case 09](../cases/09-multi-region-internet-banking.md) para discutir a decisão. **Esse exercício não substitui uma história comportamental real.** Responder “eu faria” é apropriado aqui, mas não prova que você já fez aquilo no trabalho.

## Como Andy Jassy explica

Síntese do vídeo de 2024, [a partir de 21:34](https://www.youtube.com/watch?v=My-2-MyxamQ&t=1294s). Exemplos, números e referências temporais pertencem à época da gravação. [Fonte S07](../references/README.md#s07).

- Velocidade importa de forma desproporcional em qualquer negócio, estágio, setor e tamanho de empresa, a menos que você seja um monopólio.
- Quando liderava a AWS, ele ouviu muitos CEOs dizerem que não conseguiam mais ser rápidos por causa de segurança, compliance, tamanho ou cultura. Para ele, velocidade não é predestinada: é uma decisão de liderança e de cultura.
- **Portas de mão única e de mão dupla (one-way e two-way doors):** a grande maioria das decisões é de mão dupla; se você errar, volta pela porta sem dano. Essas decisões devem ser tomadas no nível do time, com cuidado, mas rapidamente. As poucas decisões de mão única merecem mais tempo de reflexão.
- **Urgência:** não leve semanas para o que pode ser feito em dias ou horas. Pense em janelas que se fecham: são corridas contra empresas bem financiadas e capazes. No fim da semana, meus clientes estão melhor do que no começo?
- **Tensão com Insist on the Highest Standards:** ser rápido não justifica lançar uma experiência abaixo do padrão, o que também violaria Customer Obsession. Dá para ser rápido e ter padrões altos. A Amazon deve se comportar como “a maior startup do mundo” e perguntar sempre por que não pode ir mais rápido pelos clientes.

## Próximo registro

Registre o episódio e os IDs das perguntas praticadas em uma cópia privada do [template STAR](../templates/star-story.md). Depois atualize a [matriz LP × histórias](../progress/leadership-principles-story-matrix.md). Para escolher a próxima rodada, use o [guia de prática](practice-guide.md).
