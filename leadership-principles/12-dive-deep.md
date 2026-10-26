# 12 — Dive Deep

**Em português:** Mergulhar nos detalhes.

[Índice](README.md) · [STAR e evidências](00-star-and-evidence.md) · [Guia de prática](practice-guide.md)

Os nomes e o texto-base seguem [a lista oficial da Amazon](https://www.amazon.jobs/content/en/our-workplace/leadership-principles), conferida em 26/10/2026. Tradução didática; interpretação, perguntas e aplicações são autorais. [Proveniência](../references/README.md#s02).

## O que significa na prática

Investigar causas, validar dados e conectar detalhes técnicos ao impacto, especialmente quando indicadores e experiência do cliente divergem.

### Texto do princípio

> Líderes atuam em todos os níveis, mantêm-se conectados aos detalhes, auditam com frequência e desconfiam quando métricas e relatos não batem. Nenhuma tarefa está abaixo deles.

**Comportamento a evidenciar:** o detalhe que você foi buscar quando os números não batiam com o que os clientes viviam.

### Como escolher uma experiência

Procure um incidente ou uma métrica suspeita em que seu trabalho foi além do primeiro gráfico e encontrou evidência causal.

### Decisão e trade-off

Aprofundar não significa recitar todas as linhas de um log. Selecione o detalhe que mudou a hipótese e mantenha a ligação com a decisão.

## Perguntas para prática

São 12 perguntas comportamentais, em português e inglês. Cada par PT/EN representa uma pergunta. Para o contexto de SA/FSI, use uma experiência equivalente se você ainda não atuou nesse setor.

### Decisões e execução

1. <a id="lp12-q01"></a> **LP12-Q01.** Conte um problema em que a primeira explicação estava errada. Como você investigou as alternativas?

   **EN:** Tell me about a problem where the initial explanation was wrong. How did you investigate alternatives?

2. <a id="lp12-q02"></a> **LP12-Q02.** Descreva uma situação em que uma métrica parecia saudável, mas os usuários continuavam afetados.

   **EN:** Describe a time when a metric looked healthy but users were still affected.

3. <a id="lp12-q03"></a> **LP12-Q03.** Conte uma investigação em que um detalhe mudou sua hipótese e a decisão tomada.

   **EN:** Tell me about an investigation where a detail changed your hypothesis and the resulting decision.

### Falhas e aprendizado

1. <a id="lp12-q04"></a> **LP12-Q04.** Conte uma ocasião em que você concluiu uma investigação cedo demais e o problema voltou.

   **EN:** Tell me about a time when you ended an investigation too early and the problem returned.

2. <a id="lp12-q05"></a> **LP12-Q05.** Descreva um erro em um dado ou cálculo que você havia aceitado como correto. Como o descobriu e corrigiu?

   **EN:** Describe an error in data or a calculation you had accepted as correct. How did you discover and correct it?

3. <a id="lp12-q06"></a> **LP12-Q06.** Conte uma investigação em que você seguiu uma hipótese por tempo demais. O que fez você mudar de caminho?

   **EN:** Tell me about an investigation where you pursued one hypothesis for too long. What made you change direction?

### Colaboração e influência

1. <a id="lp12-q07"></a> **LP12-Q07.** Conte como você investigou um problema entre equipes que tinham métricas ou explicações diferentes.

   **EN:** Tell me about a time when you investigated a problem across teams that had different metrics or explanations.

2. <a id="lp12-q08"></a> **LP12-Q08.** Descreva uma ocasião em que você questionou um dado aceito pelo grupo e reuniu evidências para verificar a dúvida.

   **EN:** Describe a time when you questioned data the group accepted and gathered evidence to investigate your concern.

3. <a id="lp12-q09"></a> **LP12-Q09.** Conte como você explicou uma descoberta técnica detalhada a quem precisava tomar uma decisão de negócio.

   **EN:** Tell me about a time when you explained a detailed technical finding to someone who needed to make a business decision.

### Atuação de SA e contexto FSI

1. <a id="lp12-q10"></a> **LP12-Q10.** Conte um incidente em que você precisou ir além dos dashboards para entender o impacto sobre o cliente.

   **EN:** Tell me about an incident where you had to go beyond dashboards to understand the customer impact.

2. <a id="lp12-q11"></a> **LP12-Q11.** Descreva uma auditoria de sistema ou processo que você conduziu e o problema que ela revelou.

   **EN:** Describe a system or process audit you conducted and the problem it uncovered.

3. <a id="lp12-q12"></a> **LP12-Q12.** Conte uma situação em que você verificou a jornada de uma transação ou dado entre serviços para localizar uma divergência.

   **EN:** Tell me about a time when you traced a transaction or data across services to locate a discrepancy.

## Aprofundamentos

1. Quais hipóteses você formulou e que evidência eliminou cada uma?
2. De onde vieram os dados e como você verificou completude, período e definição?
3. Como você relacionou o relato do cliente à telemetria disponível?
4. Que detalhe mudou a decisão e por que ele era relevante para o negócio?
5. Como você confirmou a causa, distinguindo-a de uma correlação ou de uma mitigação?
6. Qual verificação ou auditoria ficou em funcionamento para detectar recorrência?

## Evidências e revisão da resposta

Baseline, percentis, rastros correlacionados, comparação antes/depois e teste de hipótese. Diferencie correlação de causalidade.

Registre a origem de cada número e o que você fez individualmente. Resultados da equipe devem continuar atribuídos à equipe. Quando a evidência for interna, prepare apenas uma forma permitida de descrevê-la, sem copiar documentos para o repositório.

**O que evitar:** Trocar profundidade por jargão; reiniciar sem investigar e chamar isso de causa raiz; selecionar um gráfico conveniente.

## Aplicação FSI — cenário hipotético

A inferência está rápida, mas as features estão atrasadas. Mostre quais medidas separariam latência de leitura e atualidade do dado.

Use o [Case 07](../cases/07-real-time-fraud-detection.md) para discutir a decisão. **Esse exercício não substitui uma história comportamental real.** Responder “eu faria” é apropriado aqui, mas não prova que você já fez aquilo no trabalho.

## Como Andy Jassy explica

Síntese do vídeo de 2024, [a partir de 15:59](https://www.youtube.com/watch?v=My-2-MyxamQ&t=959s). Exemplos, números e referências temporais pertencem à época da gravação. [Fonte S07](../references/README.md#s07).

- Há tensão entre a estratégia de Think Big e o detalhe de Dive Deep. Quando perguntam qual das duas a Amazon quer, a resposta é: as duas. As pessoas devem ser estratégicas e também arregaçar as mangas nos detalhes.
- Muita gente enche quadros brancos de boas ideias, mas não sabe acertar os detalhes, e os detalhes são o que o cliente de fato vê. Todo produto ou negócio que ele viu na Amazon deu certo ou errado pela qualidade nos detalhes.
- Por isso a Amazon usa narrativas e documentos de working backwards: num PowerPoint dá para ficar no alto nível; numa narrativa, é difícil fingir os detalhes.
- Bons líderes criam mecanismos para inspecionar e auditar os detalhes, e os bons times entendem que isso serve para ajudá-los a acertar.
- **Siga as anedotas:** métricas operacionais medidas em grande volume, como SLAs, taxas de erro e latência, podem parecer razoáveis, mas um e-mail de cliente ou o relato de um amigo pode revelar um problema que não aparece nelas. Na escala da Amazon, 0,5% ou 1% de impacto são milhões de pessoas.

## Próximo registro

Registre o episódio e os IDs das perguntas praticadas em uma cópia privada do [template STAR](../templates/star-story.md). Depois atualize a [matriz LP × histórias](../progress/leadership-principles-story-matrix.md). Para escolher a próxima rodada, use o [guia de prática](practice-guide.md).
