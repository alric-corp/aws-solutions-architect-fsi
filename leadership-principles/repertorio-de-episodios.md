# Repertório de episódios e respostas à pergunta

Prepare experiências que consiga explicar sob aprofundamento: delimite um episódio, escolha os fatos que respondem à pergunta e mostre decisões, autoria, consequências e evolução. Um repertório não é uma coleção de textos para recitar.

[Guia de histórias com evidências](historias-com-evidencias.md) · [Mapa de episódios](../templates/episode-map.md) · [Ficha STAR](../templates/star-story.md) · [Guia de prática](practice-guide.md)

Esta ampliação contém método e perguntas autorais, exemplos fictícios e fichas em branco. Não reproduz entrevistas pessoais, avaliações ou transcrições dos insumos. As fontes oficiais e os limites da conferência estão ao final.

## Projeto, episódio e resposta são unidades diferentes

| Unidade | O que significa | O que precisa ficar delimitado |
|---|---|---|
| Projeto | O contexto amplo, como uma migração, melhoria ou automação | Objetivo geral, participantes e período |
| Episódio | Uma decisão, divergência, falha, investigação ou mudança dentro desse contexto | Questão própria, ações distinguíveis e desfecho explicável separadamente |
| Resposta | A seleção dos fatos do episódio que atende à pergunta feita | Comportamento solicitado, contribuição e evidência relevante |

Um projeto pode conter uma investigação que descartou uma hipótese, uma discordância sobre a solução e uma dificuldade de implantação. Só há três episódios se esses acontecimentos realmente existiram e cada um puder ser explicado com sua questão, atuação e resultado. “Investiguei, implementei e medi” não cria automaticamente três histórias independentes.

Também não atribua o impacto financeiro integral do projeto a cada episódio. A aprovação pode ter como desfecho uma decisão autorizada; a implantação pode terminar com uma solução validada. O efeito global pode contextualizar os dois, com o limite de atribuição explicado.

Use o [mapa em branco](../templates/episode-map.md) para registrar projeto de origem, episódio específico, decisão central, resultado do episódio e sobreposição com outras histórias. Esse modelo é uma proposta didática, não uma taxonomia oficial da Amazon.

## Escute o que a pergunta pede antes de escolher a estrutura

Antes de responder, identifique: **esta pergunta pede evidência de quê?** Pode ser assumir um erro, influenciar sem autoridade ou apoiar uma decisão que não venceu. Você não precisa adivinhar o formulário ou o princípio que a pessoa entrevistadora está avaliando.

Nem toda pergunta pede um STAR completo. A organização abaixo é uma proposta de treino:

| Pergunta ou situação | Estrutura de preparação | O que evitar |
|---|---|---|
| Apresentação pessoal | Trajetória relevante → atuação atual → direção desejada | Recitar o currículo ou contar um projeto inteiro |
| Motivação pela oportunidade | Interesse próprio → características da função → ligação com a trajetória | Elogiar tamanho ou fama sem explicar a escolha |
| Contribuição para a função | Necessidade discutida → capacidade relevante → evidência breve | Adjetivos sem sustentação |
| Ponto de desenvolvimento | Comportamento real → consequência → melhoria → evolução e limite atual | Qualidade disfarçada de defeito |
| “Conte uma situação em que…” | Episódio específico em STAR, com reflexão quando pertinente | Responder apenas o que faria hipoteticamente |
| Problema técnico hipotético | Esclarecer → declarar premissas → investigar ou comparar → decidir → validar | Trocar o problema proposto por uma história que não o resolve |

Os materiais oficiais sobre STAR tratam de experiências comportamentais; não é necessário forçar essa estrutura sobre toda fala da entrevista. [Orientação sobre STAR](historias-com-evidencias.md#b3)

### Motivação: quatro perguntas, sem resposta escrita por outra pessoa

Separe **por que AWS**, **por que Solutions Architect**, **por que FSI** e **por que essa mudança agora**. As respostas devem se conectar, mas não são iguais. Gostar de uma tecnologia não explica, sozinho, o interesse por atuação consultiva; experiência em uma instituição também não determina automaticamente a motivação pela vertical.

Recupere seus próprios fatos antes de polir a fala:

- Quais atividades gostaria de fazer mais no próximo trabalho?
- Quais experiências anteriores ajudaram a perceber essa direção?
- Que responsabilidades da função combinam com isso?
- Que contribuição consegue sustentar com uma evidência breve?
- O que deseja aprender e por que esta mudança faz sentido agora?

A orientação oficial liga motivação à trajetória, contribuição e aprendizado desejado. As perguntas acima são moldes de reflexão, não declarações de motivação prontas. [Fonte sobre motivação](historias-com-evidencias.md#b8)

## Para cada ação: o que, por que, como e o que mudou

| Expressão ainda vaga | Detalhes a recuperar |
|---|---|
| “Analisei as métricas” | Quais métricas, qual hipótese, como examinou e o que encontrou? |
| “Conversei com outra equipe” | Qual divergência existia, o que precisava compreender e o que negociou? |
| “Escolhi uma solução mais simples” | Simples em qual aspecto, comparada a quê e com qual limitação aceita? |
| “Criei uma documentação” | Quem precisava dela, como foi usada e o que passou a permitir? |

Ligue cada ação à decisão seguinte. Uma investigação pode ter permitido abandonar uma hipótese; uma conversa pode ter mudado o critério de aceite. Não basta dizer que a atividade aconteceu.

Separe **o raciocínio que teve na época** da **análise que consegue fazer hoje**. Se não comparou determinada alternativa naquele momento, não apresente a comparação retrospectiva como decisão original. Pode dizer o que faria diferente hoje, identificando essa perspectiva.

## Resultado explicável: escopo, certeza e atribuição

Classifique cada afirmação como **medida**, **estimada**, **qualitativa observada** ou **ainda não confirmada**. Registre definição, fonte, período, população, base de comparação e limites. Mantenha potencial de expansão separado de adoção realizada.

Feedback específico, uma decisão registrada ou um processo efetivamente adotado podem fornecer evidência qualitativa. O relato precisa indicar o que foi observado e por quem, sem transformar elogio genérico em prova de qualquer impacto. A orientação oficial também reconhece resultados qualitativos específicos. [Fonte sobre resultados](historias-com-evidencias.md#b7)

### Exercício numérico fictício — taxa não é receita

Considere dois períodos inventados, cada um com 1.000 sessões elegíveis de checkout. No primeiro, 600 terminaram a compra; no segundo, 750. Esses dados não vieram de uma empresa ou experimento executado.

| Cálculo | Resultado |
|---|---|
| Taxa inicial | 600 ÷ 1.000 = 60% |
| Taxa posterior | 750 ÷ 1.000 = 75% |
| Diferença em pontos percentuais | 75 − 60 = 15 pontos percentuais |
| Aumento relativo da taxa | (75 − 60) ÷ 60 = 25% |

Isso não demonstra receita adicional nem que uma mudança específica causou a diferença. Seria necessário examinar ticket, composição das sessões, período, sazonalidade e outras alterações, além do método de atribuição. “Aconteceu depois” e “foi causado por” são afirmações diferentes.

Da mesma forma, uma redução de latência em uma dependência não se converte automaticamente na mesma redução da jornada inteira ou em aumento de conversão. Explique onde mediu, qual operação mudou e o que não mediu.

**Transferência:** se a taxa passar de 50% para 60%, quais são a diferença em pontos percentuais e o aumento relativo? Que informação ainda falta para afirmar um efeito financeiro?

<details><summary>Resposta comentada</summary>

A diferença é de 10 pontos percentuais, e o aumento relativo da taxa é de 20%: (60 − 50) ÷ 50. Não é uma estimativa de receita. Faltam dados como volume, ticket e condições comparáveis, além de uma análise que sustente atribuir a mudança ao fator proposto. Os números deste exercício são fictícios.

</details>

## Falha, feedback, desenvolvimento e mudança de opinião

Uma estrutura útil para um episódio de falha é: **decisão ou omissão → consequência real → responsabilidade → recuperação possível → mudança de comportamento → evidência posterior**.

Não é preciso procurar uma catástrofe nem ampliar o dano para impressionar. Explique a consequência que de fato ocorreu e o que permaneceu incompleto mesmo após a reação. Também não converta “eu faria diferente” em “passei a fazer diferente” sem uma aplicação posterior.

| Pergunta | Evidência específica |
|---|---|
| Qual é seu ponto de melhoria? | Um padrão atual ou ainda em desenvolvimento, consequência, medida adotada e limite reconhecido |
| Conte um feedback difícil | Mensagem recebida, reação e o que fez com ela |
| Conte uma falha | Episódio, responsabilidade e consequências |
| Quando mudou de opinião? | Crença anterior, informação ou perspectiva recebida e revisão da própria posição |

Um ponto de desenvolvimento não precisa ser uma qualidade em excesso. Escolha um comportamento que reconheça e sobre o qual consiga descrever ações reais, sem outra pessoa selecionar uma fraqueza conveniente por você.

### O que continuou funcionando depois de você?

Pergunte quem passou a executar ou acompanhar, como desvios eram detectados e se outra pessoa conseguiu usar a solução sem depender de sua presença. Documentação, dashboard ou automação não demonstram, sozinhos, uso ou impacto duradouro.

“Nunca mais aconteceu” exige período e escopo de observação. “Agora nunca mais pode acontecer” costuma prometer mais do que a evidência permite. Um molde mais preciso é:

> Passamos a detectar [desvio] por [mecanismo]. Durante [período], observamos [resultado]. Ainda permanece [limitação].

Esse é um molde em branco, não uma afirmação sobre um projeto real nem um critério para determinar nível de carreira.

## Simulação adaptativa: aprofundar sem recomeçar

Use o [ciclo de prática](historias-com-evidencias.md#um-ciclo-curto-de-prática). Antes da fala, escolha o episódio pelo comportamento pedido. Quem conduz pode interromper com uma pergunta de decisão, evidência ou alternativa; quem responde trata daquele ponto diretamente, sem voltar ao início do STAR.

Depois, mantenha o episódio e mude a pergunta. Uma versão pode pedir discordância; outra, resultado; outra, mudança de opinião. Os fatos não mudam. Se o episódio não demonstrar o novo comportamento, escolher outro ou declarar o limite é parte do exercício.

**Exercício fictício:** uma pessoa ajudou uma colega da Loja Horizonte a executar uma tarefa e recebeu um retorno favorável. A pergunta pede uma ocasião em que ela própria mudou de opinião depois de ouvir alguém. A ajuda, sozinha, responde à pergunta?

<details><summary>Resposta comentada</summary>

Não demonstra automaticamente a revisão de opinião. Seria necessário identificar a crença anterior da pessoa que responde, o que ouviu ou observou e como alterou sua própria abordagem. Se isso não aconteceu, não deve ser inventado para aproveitar a história de ajuda. O episódio pode responder bem a outra pergunta. Este exemplo é inteiramente fictício.

</details>

## Perguntas finais: conhecer o trabalho por exemplos

A entrevista também permite avaliar função, equipe e crescimento. Escolha uma ou duas perguntas ainda relevantes, conforme o interlocutor e o tempo disponível; não use a lista como interrogatório. [Avaliação mútua](historias-com-evidencias.md#b5) · [Exemplos e esclarecimentos](historias-com-evidencias.md#b7)

| Interlocutor | Pergunta autoral sugerida |
|---|---|
| Gestor | Pode compartilhar um exemplo de como ajudaram uma pessoa nova a ganhar autonomia com clientes? |
| SA da equipe | Sem expor dados de clientes, pode contar uma situação em que mudaram a recomendação inicial depois de entender uma restrição? |
| Parceiro de outra função | Quando prazo comercial e risco técnico apontam para caminhos diferentes, como constroem a decisão? |
| Gestor ou colega | Que entrega recente representa bem o que consideram um bom resultado de Solutions Architecture? |

Não solicite informações confidenciais. As perguntas são sugestões de treino, não questões secretas ou previsão do processo.

## Como resolver recomendações conflitantes

- **Duração:** use 2–3 minutos como referência inicial ajustável. Um guia oficial recomenda esse tempo tipicamente; outro sugere quatro minutos ou menos para deixar espaço ao aprofundamento. Não some as recomendações nem aplique a duração de uma resposta STAR a uma apresentação técnica inteira. [B5](historias-com-evidencias.md#b5) · [B7](historias-com-evidencias.md#b7)
- **Quantidade e repetição:** preparar uma ou duas realizações por princípio é uma recomendação editorial; não exige 32 histórias independentes. Um episódio pode mostrar mais de um comportamento, e um aprofundamento não exige outra história. Trabalhe variedade, cobertura e fatos consistentes, respeitando as orientações do processo. [B7](historias-com-evidencias.md#b7)
- **Princípios por nível:** não exclua Think Big nem outros princípios com base em uma dispensa genérica de um vídeo. Prepare os princípios e as orientações aplicáveis à função sem tentar prever cada pergunta. [Preparação AWS](historias-com-evidencias.md#b4)
- **Anotações:** há orientação oficial favorável a notas para acompanhar exemplos e perguntas. Isso não autoriza automaticamente leitura de respostas ou assistência em qualquer etapa. Confirme o formato permitido e mantenha transparência; fingir que escreve para esconder uma consulta não é método deste treino. [B8](historias-com-evidencias.md#b8)
- **Erro e correção:** declare hipóteses, procure evidências e revise a conclusão. Reagir a uma correção não garante avaliação positiva. A preparação comportamental também não substitui o aprofundamento técnico previsto para a função.
- **Bar Raiser e “50%”:** a descrição oficial trata de comparação com pares em funções semelhantes, debrief e decisão com o gestor. Não fornece fórmula para calcular uma nota individual nem frases que assegurem aprovação. Identificar esse entrevistador não é uma tarefa deste treino. [B9](historias-com-evidencias.md#b9)

No [registro de insumos](../templates/source-extraction.md), documente o escopo de cada conselho e a decisão prática de treino. Uma regra não se torna oficial por aparecer em vários resumos, e um resumo de workshop não permite atribuir ao autor detalhes ausentes do original.

## Fontes e próxima prática

Ampliação autoral revisada em **7 de novembro de 2026**, horário de São Paulo. As referências primárias estão no [guia de histórias com evidências](historias-com-evidencias.md#fontes-e-escopo-da-revisão), especialmente B5 e B7–B9. As transcrições e o workshop mencionados na síntese recebida não foram fornecidos para conferência integral nesta rodada.

Comece por um projeto e delimite um episódio no [mapa](../templates/episode-map.md). Preencha a [ficha factual](../templates/star-story.md) em cópia privada. Escolha uma pergunta, responda e teste duas mudanças de foco. A conclusão deve permitir entender o que você decidiu, fez, aprendeu e consegue sustentar.
