# 12 — Dive Deep

## Mergulhar nos detalhes

**Base:** síntese das anotações N01/N02. **Nome:** conferido na lista oficial S02. **Aplicação e perguntas abaixo:** exercícios autorais, não rubrica de entrevista. [Proveniência](../referencias/README.md)

### Ideia central

Investigar causas, validar dados e conectar detalhes técnicos ao impacto, especialmente quando indicadores e experiência do cliente divergem.

### Texto do princípio

> Líderes atuam em todos os níveis, mantêm-se conectados aos detalhes, auditam com frequência e desconfiam quando métricas e relatos não batem. Nenhuma tarefa está abaixo deles.

**O que demonstrar:** o detalhe que você foi buscar quando os números não batiam com o que os clientes viviam.

### Como Andy Jassy explica

Resumo do trecho do vídeo em que o CEO da Amazon explica os 16 princípios (a partir de 15:59).

- Há tensão entre a estratégia de Think Big e o detalhe de Dive Deep. Quando perguntam qual das duas a Amazon quer, a resposta é: as duas. As pessoas devem ser estratégicas e também arregaçar as mangas nos detalhes.
- Muita gente enche quadros brancos de boas ideias, mas não sabe acertar os detalhes, e os detalhes são o que o cliente de fato vê. Todo produto ou negócio que ele viu na Amazon deu certo ou errado pela qualidade nos detalhes.
- Por isso a Amazon usa narrativas e documentos de working backwards: num PowerPoint dá para ficar no alto nível; numa narrativa, é difícil fingir os detalhes.
- Bons líderes criam mecanismos para inspecionar e auditar os detalhes, e os bons times entendem que isso serve para ajudá-los a acertar.
- **Siga as anedotas:** métricas operacionais medidas em grande volume, como SLAs, taxas de erro e latência, podem parecer razoáveis, mas um e-mail de cliente ou o relato de um amigo pode revelar um problema que não aparece nelas. Na escala da Amazon, 0,5% ou 1% de impacto são milhões de pessoas.

### Que experiência procurar

Procure um incidente ou uma métrica suspeita em que seu trabalho foi além do primeiro gráfico e encontrou evidência causal.

### A tensão que precisa aparecer na resposta

Aprofundar não significa recitar todas as linhas de um log. Selecione o detalhe que mudou a hipótese e mantenha a ligação com a decisão.

### Perguntas para treino

1. Conte um problema em que a primeira explicação estava errada.
2. Quando uma métrica parecia saudável, mas o usuário continuava afetado?
3. Que detalhe mudou sua abordagem em uma investigação?

### Perguntas de entrevista

1. Conte um incidente em que você precisou ir além dos dashboards para achar a causa.
2. Descreva uma vez em que você encontrou um erro num dado que todos consideravam correto.
3. Como você audita um sistema ou processo pelo qual é responsável?

### Aprofundamentos

Quais hipóteses formulou? Como eliminou cada uma? De onde vieram os dados? Como reproduziu ou confirmou a causa? Como preveniu recorrência?

### Evidência a organizar

Baseline, percentis, rastros correlacionados, comparação antes/depois e teste de hipótese. Diferencie correlação de causalidade.

Registre a origem de cada número e o que você fez individualmente. Resultados da equipe devem continuar atribuídos à equipe. Quando a evidência for interna, prepare apenas uma forma permitida de descrevê-la, sem copiar documentos para o repositório.

### O que evitar

Trocar profundidade por jargão; reiniciar sem investigar e chamar isso de causa raiz; selecionar um gráfico conveniente.

### Aplicação FSI — cenário hipotético

A inferência está rápida, mas as features estão atrasadas. Mostre quais medidas separariam latência de leitura e atualidade do dado.

Use o [Case 07](../cases/07-fraud-detection-tempo-real.md) para discutir a decisão. **Esse exercício não substitui uma história comportamental real.** Responder “eu faria” é apropriado aqui, mas não prova que você já fez aquilo no trabalho.

### Próximo registro

Em uma cópia privada do [template STAR](../templates/historia-star.md), identifique um episódio e escreva apenas os pontos que consegue sustentar. Deixe explícita qualquer lacuna; não peça que uma ferramenta a complete como fato.
