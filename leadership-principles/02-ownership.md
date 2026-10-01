# 02 — Ownership

## Senso de dono

**Base:** síntese das anotações N01/N02. **Nome:** conferido na lista oficial S02. **Aplicação e perguntas abaixo:** exercícios autorais, não rubrica de entrevista. [Proveniência](../referencias/README.md)

### Ideia central

Assumir responsabilidade pelo resultado e pelas consequências ao longo do tempo, sem usar fronteiras organizacionais como desculpa para abandonar um problema.

### Texto do princípio

> Líderes são donos. Pensam no longo prazo e não trocam valor de longo prazo por resultados imediatos. Agem em nome da empresa inteira, não só do próprio time. Nunca dizem “isso não é trabalho meu”.

**O que demonstrar:** que você assume o resultado de ponta a ponta, inclusive fora do seu escopo formal, e deixa mecanismos que não dependem de você.

### Como Andy Jassy explica

Resumo do trecho do vídeo em que o CEO da Amazon explica os 16 princípios (a partir de 26:15).

- É o mais atitudinal dos princípios, um modo de pensar e de agir. Quando você diz ao time que vai cuidar de algo, você cuida, sem precisar ser lembrado. E é também uma forma holística e de longo prazo de pensar o negócio e a empresa.
- Bons donos se perguntam: o que eu faria se o dinheiro fosse meu?
- **Inquilinos e donos:** um inquilino às vezes prega a árvore de Natal no piso de madeira; quem é dono do apartamento nunca faria isso.
- **Contraexemplo:** uma pessoa jovem que trabalha em uma loja, fora da Amazon, disse que não tinha interesse em ideias para aumentar a receita porque não ganharia comissão e aquilo não era da sua área. Isso não é ownership.
- Donos garantem que os problemas tenham dono e um caminho para a solução. Se não sabem quem cuida de algo, procuram o responsável em vez de supor que alguém já cuida; se algo está pela metade ou sem passagem de bastão, garantem a passagem ou resolvem eles mesmos. Diante de um problema difícil, não o empurram para outro: reúnem as pessoas certas para encontrar a melhor solução para o cliente, pensando na empresa toda e no longo prazo.

### Que experiência procurar

Procure um trabalho em que havia responsabilidade pouco clara, um risco fora da sua tarefa imediata ou uma transição que precisava continuar funcionando depois da sua participação.

### A tensão que precisa aparecer na resposta

Ser dono não significa fazer tudo sozinho. Mostre como definiu responsáveis, buscou ajuda e deixou um mecanismo que não dependesse permanentemente de você.

### Perguntas para treino

1. Conte uma situação em que um problema importante não tinha dono claro.
2. Descreva algo que assumiu além da sua tarefa e como evitou prejudicar outras prioridades.
3. Como você garantiu a continuidade de um projeto ao transferi-lo para outra pessoa?

### Perguntas de entrevista

1. Conte uma situação em que você agiu como dono de um sistema que não era formalmente seu.
2. Descreva um custo ou risco de longo prazo que você evitou, mesmo atrasando um resultado imediato.
3. O que você fez quando percebeu, depois de entregar, que algo seu tinha falhado?

### Aprofundamentos

Qual era sua responsabilidade formal? O que assumiu? Quem aprovou a mudança? Como acompanhou até a conclusão? Quem ficou responsável depois?

### Evidência a organizar

Pendências fechadas, tempo de recuperação, execução do handover e redução de dependências individuais. Delimite o que foi sua contribuição.

Registre a origem de cada número e o que você fez individualmente. Resultados da equipe devem continuar atribuídos à equipe. Quando a evidência for interna, prepare apenas uma forma permitida de descrevê-la, sem copiar documentos para o repositório.

### O que evitar

Heroísmo sem coordenação; ultrapassar autorização; assumir crédito por tudo; resolver hoje deixando dívida desconhecida para outro time.

### Aplicação FSI — cenário hipotético

A fachada nova funciona, mas um job do legado ainda escreve no mesmo dado. Explique quem deve acompanhar a eliminação desse risco antes da migração.

Use o [Case 05](../cases/05-modernizacao-core-banking.md) para discutir a decisão. **Esse exercício não substitui uma história comportamental real.** Responder “eu faria” é apropriado aqui, mas não prova que você já fez aquilo no trabalho.

### Exemplo STAR

Exemplo para ilustrar a estrutura, **não uma história sua**. Os números fazem parte do exemplo; nas suas respostas, use apenas dados que você consegue sustentar.

**Pergunta:** Conte uma situação em que você agiu como dono de um sistema que não era formalmente seu.

**Situação:** Em uma migração fictícia, a nova API de consulta de limites já estava em produção, mas um job noturno do sistema legado continuava gravando na mesma tabela.

**Tarefa:** Eu respondia pela API, não pelo job. Mesmo assim, havia risco de dados divergentes no cutover, e ninguém tinha o problema como seu.

**Ação:** Levantei quando o job rodava e o que ele alterava, mostrei ao time do legado um caso real de divergência e propus um plano: congelar as escritas do job durante a janela, registrar quem passaria a ser o único escritor e criar uma conciliação diária. Acompanhei até o desligamento do job e documentei o procedimento.

**Resultado:** O cutover terminou sem divergências na conciliação, e o procedimento passou a ser usado nas ondas seguintes. Aprendi a mapear todos os escritores de um dado antes de qualquer migração.

### Próximo registro

Em uma cópia privada do [template STAR](../templates/historia-star.md), identifique um episódio e escreva apenas os pontos que consegue sustentar. Deixe explícita qualquer lacuna; não peça que uma ferramenta a complete como fato.
