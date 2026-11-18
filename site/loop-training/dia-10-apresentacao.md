# Dia 10 — Apresentação do case

Minha avaliação é que essa apresentação foi consideravelmente melhor que a entrevista técnica individual com o Eduardo. Ela conseguiu demonstrar competências que ficaram menos evidentes naquela sessão: compreensão do cliente, decisões sob restrições, colaboração entre áreas e responsabilidade pela continuidade da operação.

**Minha nota para a apresentação e perguntas: 8,0/10.** Boa, com ressalvas técnicas e de resultados.

É uma avaliação independente para preparação, não uma nota oficial da AWS nem uma previsão do resultado do Loop.

O que mais me chamou a atenção foi que a Vitória não se limitou a explicar como recuperou o banco. Ela construiu uma história sobre o valor da jornada para o cliente, a urgência da campanha, as restrições de governança e a necessidade de deixar a plataforma sustentável.

Também houve um momento particularmente importante: quando uma pessoa da banca confundiu os dois meses de manutenção com o prazo necessário para recuperar a campanha de aproximadamente 97 mil clientes, Vitória conseguiu esclarecer que a recuperação aconteceu em cerca de uma semana, enquanto a manutenção era um trabalho posterior e mais amplo. Esse foi um bom exemplo de reação a um questionamento real da audiência.

## Minha avaliação por dimensão

| Competência | Nota de referência | Leitura |
| --- | --- | --- |
| Comunicação e apresentação | 8,5 | Narrativa organizada, exemplos acessíveis e bom relacionamento com a banca. |
| Entendimento de negócio | 8,5 | Conectou campanha, personalização, vencimentos e confiança do cliente. |
| Decisões arquiteturais | 8,0 | Apresentou alternativas e explicou restrições relevantes. |
| Profundidade técnica | 7,5 | Melhor que no Eduardo, mas ficaram pontos abertos sobre capacidade, consistência e recuperação. |
| Evidências e resultados | 7,0 | Relatou validações concretas, porém alguns números e conclusões precisam de melhor sustentação. |
| Liderança e colaboração | 8,5 | Boa demonstração de iniciativa, articulação e transferência de conhecimento. |
| Respostas às interrupções | 7,5 | Defendeu bem DMS, mas precisou de esclarecimento adicional em perguntas sobre impacto e estratégia futura. |

Essas notas não são médias de uma rubrica conhecida da Amazon. Servem para mostrar onde o desempenho foi mais forte e onde eu faria ressalvas.

## 1. O que a Vitória fez muito bem

### A. Começou pelo problema do cliente, não pela tecnologia

Ela apresentou a importância da recomendação personalizada, os clientes envolvidos e o impacto potencial da interrupção antes de entrar em RDS, Terraform ou DMS.

A distinção entre os três fluxos foi especialmente boa:

| Fluxo | Situação apresentada |
| --- | --- |
| Classificação de novos clientes | Carga bloqueada, afetando a preparação da campanha. |
| Renovação das recomendações | Risco de impacto futuro conforme as carteiras vencessem. |
| Consulta das recomendações existentes | Continuava funcionando e precisava ser preservada. |

Isso demonstra uma preocupação concreta: recuperar o que estava falhando sem prejudicar o que continuava saudável. Ela também procurou a PM para entender o prazo dos próximos vencimentos, descobriu a dependência de acompanhamento manual e utilizou essas informações para orientar a urgência.

Eu classificaria esse bloco como excelente em comunicação de negócio.

O detalhe que faltou foi definir melhor a métrica de conversão 9,3% superior: não ficou esclarecido o denominador, o período comparativo específico nem se a diferença era relativa ou em pontos percentuais.

### B. Explicou por que a solução escolhida era executável

O trecho das alternativas foi um dos mais fortes.

Ela não disse simplesmente que escolheu DMS porque é um serviço gerenciado da AWS. Explicou por que as opções consideradas tinham restrições diferentes:

- Aumentar a instância existente dependia de uma pipeline que não conseguia aplicar a alteração.
- Break Glass exigia uma exceção que não foi autorizada naquele contexto.
- Restaurar um snapshot em produção dependia de processos ou permissões indisponíveis.
- Nova instância com DMS exigia preparação adicional, mas oferecia um caminho operacional autorizado.

Ela também reconheceu o custo temporário de manter dois bancos durante a migração.

Aqui apareceu julgamento arquitetural, não apenas conhecimento de serviços.

A banca aprofundou justamente essa escolha, e ela sustentou razoavelmente bem o motivo de não utilizar snapshot. A pergunta sobre réplica de leitura, entretanto, não recebeu uma comparação igualmente detalhada.

### C. A explicação de validação melhorou em relação ao material preparado

Esse foi um dos pontos mais positivos da apresentação efetiva.

Além de comparar tabelas e quantidades, a Vitória afirmou que verificou dados utilizados pela jornada, como associação entre grupos, carteiras recomendadas e vigência. Reconheceu que duas tabelas com a mesma quantidade de registros podem conter informações diferentes.

Isso é substancialmente melhor que simplesmente dizer:

> “Comparei as contagens e estava tudo certo.”

Ela também descreveu uma carga controlada de recomendações, utilizando perfis de funcionários para conferir a integração e o comportamento da jornada depois da mudança.

Minha ressalva: a explicação ainda não demonstra equivalência integral de dados ou todos os critérios de aceite. A força está em ter apresentado verificações concretas e relevantes para o negócio, sem que isso signifique garantia absoluta.

### D. Demonstrou Ownership de forma convincente

Ela estava apoiando uma squad que não era originalmente a sua, precisava entender rapidamente as regras do negócio e tinha férias programadas.

O relato mostra que buscou apoio de outras equipes, utilizou o fluxo de priorização autorizado, documentou procedimentos e confirmou o entendimento dos colegas que dariam continuidade.

Esse é um dos melhores sinais de liderança do case.

Não é uma história em que tudo dependia de ela estar presente. Pelo contrário, ela descreveu como deixou a execução preparada para continuar durante sua ausência.

Também foi positivo atribuir a implementação do QuickSight à pessoa de Analytics e explicar sua própria contribuição na definição das regras e das informações necessárias. Isso fortalece a credibilidade do relato.

## 2. Mapeamento das perguntas da banca

Identifiquei seis blocos principais de perguntas e aprofundamentos. As formulações abaixo são paráfrases da transcrição. Quando o falante não está claramente identificado, não atribuí a pergunta a uma pessoa específica.

| ID | Pergunta feita | Avaliação da resposta |
| --- | --- | --- |
| P01 | O DMS executou full load ou CDC? Por quê? | Boa, com ressalva. Explicou full load, menor atividade na madrugada e suspensão das novas cargas. Não demonstrou que todas as possíveis escritas estavam suspensas. |
| P02 | Por que DMS e não snapshot ou réplica de leitura? | Boa para snapshot; parcial para réplica. Explicou bem as restrições de acesso e pipeline, mas não aprofundou a alternativa de réplica. |
| P03 | O que faria diferente tecnicamente hoje? | Regular. Propôs detecção de anomalias e separação de leitura/escrita, mas sem critérios concretos para justificar uma mudança de arquitetura. |
| P04 | O que mudaria no relacionamento ou na comunicação com negócio e outras equipes? | Regular. Disse que foi cuidadosa e clara, mas não identificou um aprendizado ou melhoria específica de comunicação. |
| P05 | Qual ganho de negócio justificou dois meses de manutenção para um problema relacionado a 97 mil clientes? | Regular inicialmente; boa recuperação. Interpretou a pergunta de outra forma, mas depois esclareceu a cronologia e o propósito da manutenção. |
| P06 | Por que não utilizaram IA no projeto? | Regular, com ressalva factual. Relacionou a resposta ao contexto de 2024, porém generalizou a cronologia da adoção de IA pelo Itaú. |

Fonte dos questionamentos: transcrição da apresentação.

### A pergunta técnica mais importante: DMS sem CDC

A Vitória afirmou que fez uma carga completa durante um horário de menor utilização, com as novas cargas de recomendação suspensas.

Essa é uma explicação defensável para o cenário descrito, desde que os dados migrados não sofressem alterações relevantes durante a janela de cópia e troca.

A questão não resolvida é justamente essa condição.

O DMS oferece full load e full load + CDC como estratégias distintas. Na primeira, a transferência dos dados existentes não implica manter automaticamente todas as mudanças posteriores sincronizadas; na segunda, existe uma fase específica para capturar e aplicar mudanças. [AWS DMS · Tipos de tarefa de migração](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Tasks.Creating.html) · [AWS DMS · Captura contínua de alterações](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Task.CDC.html)

A própria apresentação menciona um processo automático relacionado à expiração das recomendações.

Portanto, eu ainda perguntaria:

> “A carga de novas recomendações estava parada. Mas algum processo automático continuava alterando registros relevantes durante a migração?”

Não estou afirmando que houve perda ou divergência. Estou delimitando a garantia que a resposta demonstrou.

A Vitória fez bem em explicar o uso de um horário de menor atividade e a estratégia de reduzir mudanças na origem. Isso não elimina a necessidade de confirmar quais processos continuavam escrevendo.

### A pergunta de negócio mais importante: por que dois meses?

Esse foi, para mim, o momento mais revelador das perguntas.

A pessoa da banca queria entender o resultado de negócio de reservar dois meses para manutenção, e não apenas se a plataforma continuou operando.

Inicialmente, Vitória explicou que não houve impacto direto ao cliente. Depois o interlocutor esclareceu que perguntava sobre o ganho, e ela apresentou redução de incidentes e custos.

Mais adiante, surgiu a dúvida de que a recuperação de aproximadamente 97 mil clientes teria exigido dois meses. Ela interrompeu essa interpretação e separou:

- **Uma semana:** recuperação da jornada.
- **Dois meses posteriores:** manutenção mais ampla da plataforma.

A correção foi boa. Demonstrou que ela conseguia esclarecer uma conclusão equivocada sobre seu case sem abandonar a narrativa.

Mas a resposta poderia ter sido melhor desde o início:

> “A recuperação da campanha levou cerca de uma semana. Os dois meses posteriores não foram para atender apenas aquele público, mas para corrigir riscos da plataforma compartilhada por outras jornadas. O ganho observado foi menor recorrência de incidentes, redução de custos e recuperação da capacidade de realizar mudanças.”

Essa formulação organiza melhor os fatos relatados. Não acrescenta um resultado novo.

## 3. Onde eu faria ressalvas mais importantes

### A. A capacidade de 8 GiB para quatro milhões de clientes continuou sem comprovação

Ela explicou que a instância anterior tinha 4 GiB e que a nova foi dimensionada com 8 GiB, considerando a carga imediata e o crescimento planejado.

Mas não mostrou um teste, projeção quantitativa ou medição que demonstrasse capacidade para os quatro milhões.

Eu não exigiria uma prova de escala completa se ela não foi realizada. A melhoria é separar capacidade comprovada da capacidade planejada.

Esse é um ponto que a banca poderia ter aprofundado, especialmente depois do comentário final sobre pensar na escala futura.

### B. O diagnóstico de memória ficou mais claro, mas não totalmente auditável

Ela explicou a diferença entre consultas distribuídas no tempo e cargas concentradas, e afirmou que o armazenamento ainda tinha espaço disponível.

Foi uma explicação acessível ao público não técnico.

No entanto, não apareceram valores observados de memória, swap, consultas, eventos de falha ou métricas da execução. Isso não prova que o diagnóstico estava errado, mas limita a profundidade demonstrada.

Em Dive Deep, o passo adicional seria: “esta evidência me levou a concluir que o gargalo estava aqui”.

### C. O rollback por troca de apontamento ficou simplificado

Ela explicou que poderia redirecionar a aplicação à base antiga, caso houvesse problema na nova. Essa é uma estratégia plausível para determinadas falhas de integração.

Mas não explicou completamente o que aconteceria se o destino já tivesse recebido alterações que não existiam na origem.

Há uma distinção entre recuperar a conexão da aplicação e preservar a integridade de dados após novas gravações.

Eu registraria isso como uma lacuna de aprofundamento, não como erro comprovado, porque a banca não insistiu nesse cenário.

### D. Alguns números ficaram inconsistentes ou insuficientemente definidos

Essa é uma ressalva que eu levaria muito a sério, embora seja necessário lembrar que a transcrição possui erros de reconhecimento.

| Indicador | O que aparece |
| --- | --- |
| Incidentes | Slides preparados: aproximadamente 45% de redução. Fala transcrita: aproximadamente 40%. |
| Custos | Aproximadamente 30% de redução, mas a fala também menciona R$ 7 mil por mês e um valor próximo de R$ 70 mil sem deixar o recorte totalmente claro. |
| Conversão | 9,3% maior, sem definição precisa da base de comparação. |
| Capacidade | Crescimento planejado de aproximadamente 4 milhões, sem comprovação quantitativa apresentada. |

A diferença entre 40% e 45% pode decorrer da transcrição. Eu não classificaria automaticamente como contradição real.

Mas as métricas financeiras precisariam estar ligadas a período, escopo e fonte.

Também há uma distinção importante: impedir o impacto final sobre recomendações não significa que não houve impacto de negócio. A campanha estava bloqueada e havia risco comercial. O mais preciso seria afirmar que a recuperação ocorreu antes de determinados impactos aos clientes.

### E. A resposta sobre IA contém uma generalização problemática

Ricardo perguntou por que não utilizaram IA naquela solução. A Vitória respondeu que o Itaú começou a adotar IA depois daquele incidente, aproximadamente no final de 2024.

Lida literalmente como uma afirmação sobre o banco inteiro, essa resposta está incorreta.

O Relatório Anual Integrado de 2023 do próprio Itaú já descrevia múltiplas aplicações de IA e uma ferramenta voltada a clientes de investimentos lançada em setembro de 2023. [Itaú Unibanco · Relatório Anual Integrado 2023, p. 65](https://www.itau.com.br/download-file/v2/d/42787847-4cf6-4461-94a5-40ed237dca33/15ce52e3-fdd5-1bd2-4929-0674f0f3ce57?origin=2#page=65)

Isso não significa que o projeto específico da Vitória utilizava IA em agosto de 2024.

Uma resposta mais adequada teria sido:

> “Naquele momento, o problema era recuperar a capacidade de uma operação relacional que já existia. Adicionar IA não resolveria o gargalo de memória nem a dificuldade de provisionamento. Posteriormente, surgiram outras iniciativas de IA conversacional na área, mas eram necessidades diferentes.”

Esse é o principal ponto factual da apresentação que eu corrigiria.

## 4. Leadership Principles demonstrados

Não temos a atribuição oficial de LPs da sessão de apresentação. Portanto, estou identificando comportamentos compatíveis com os princípios, não dizendo quais cada participante estava formalmente avaliando.

A comparação usa as definições públicas da Amazon. [Amazon.jobs · Leadership Principles](https://amazon.jobs/content/en/our-workplace/leadership-principles)

| Leadership Principle | Evidência apresentada | Minha avaliação |
| --- | --- | --- |
| Customer Obsession | Procurou entender necessidades, vencimentos, personalização e confiança do cliente antes de propor a mudança. | Forte |
| Ownership | Assumiu uma recuperação fora da squad de origem, preparou continuidade e depois atuou na evolução da plataforma. | Forte |
| Bias for Action | Trabalhou com prazo curto e escolheu um caminho executável sem ignorar a governança. | Boa |
| Earn Trust | Articulou PM, desenvolvedores, DBAs e liderança; documentou e transferiu conhecimento. | Forte |
| Deliver Results | Relatou recuperação no prazo e retomada das cargas. Resultados posteriores foram apresentados, com algumas lacunas de medição. | Boa |
| Dive Deep | Investigação de memória, pipeline, DMS e validações. Faltaram algumas evidências quantitativas e garantias técnicas. | Boa, com ressalvas |
| Insist on the Highest Standards | Revisão de vulnerabilidades, privilégios, recuperação e observabilidade. | Boa |
| Have Backbone; Disagree and Commit | Defendeu a necessidade de manutenção diante da prioridade por novas funcionalidades. | Parcial a boa |
| Frugality | Identificação de recursos ociosos e relato de redução de custos. | Boa evidência de contribuição |
| Think Big | Considerou a expansão futura e o impacto da plataforma sobre outras equipes. | Parcial |

### Quais foram os três LPs mais bem demonstrados?

**Customer Obsession**

O prazo foi construído a partir dos vencimentos e das necessidades do negócio, não apenas da conveniência técnica. A preocupação foi preservar a experiência personalizada.

**Ownership**

Atuou fora de sua responsabilidade original, conduziu dependências e preparou outras pessoas para concluir a mudança sem sua presença.

**Earn Trust**

A história traz colaboração concreta, explicação de restrições e divisão de responsabilidades. Esse comportamento apareceu melhor que na entrevista individual do Eduardo.

O princípio Have Backbone; Disagree and Commit tem uma evidência interessante: ela defendeu a necessidade de manutenção quando havia pressão por funcionalidades.

Mas o relato mostra principalmente construção de alinhamento com a PM e a liderança, não uma decisão final com a qual ela discordou e depois precisou se comprometer. Portanto, eu não classificaria todas as facetas desse princípio como demonstradas.

## 5. Comparando com a entrevista do Eduardo

Essa comparação é útil, mas as duas sessões têm formatos diferentes.

| Aspecto | Eduardo — entrevista técnica | Apresentação — banca |
| --- | --- | --- |
| Natureza | Perguntas exploratórias, com aprofundamentos sucessivos. | Case preparado, com interrupções e discussão. |
| Contexto de negócio | Presente, mas secundário ao aprofundamento técnico. | Muito mais bem estruturado e valorizado. |
| Decisão do DMS | Explicação resumida, com limites técnicos. | Comparação mais completa entre alternativas. |
| Validação | Pouco detalhada. | Apresentou comparações de dados e testes funcionais. |
| Colaboração | Menos explorada. | Bastante evidente. |
| Profundidade sob perguntas inesperadas | Mostrou dificuldades importantes. | Respondeu melhor às perguntas relacionadas ao case, mas ainda deixou lacunas. |
| Minha leitura | 6,0/10 | 8,0/10 |

A principal diferença é que a Vitória conseguiu organizar melhor um projeto real quando teve tempo para preparar sua narrativa.

Isso reforça sua capacidade de apresentação consultiva. Não elimina, porém, os limites demonstrados na entrevista técnica mais aberta.

Para uma avaliação global do Loop, eu preservaria as duas evidências: boa capacidade de explicar decisões e colaborar com áreas diferentes; profundidade técnica ainda desigual quando o assunto muda inesperadamente.

## 6. O comportamento da banca: há algum sinal positivo?

Houve participação técnica, pergunta de negócio e interesse na experiência da Vitória com IA.

Os questionamentos não ficaram apenas em definições básicas. A banca investigou a razão do DMS, a necessidade de CDC, a alternativa de snapshot, o ganho dos dois meses de manutenção e a evolução possível da solução.

Isso indica uma discussão substantiva do case.

Também houve momentos em que os entrevistadores complementaram o raciocínio dela ou esclareceram o que estavam perguntando. Não trataria isso como penalização automática. O que importa é se, depois do esclarecimento, a resposta chegou ao ponto central.

Eu vejo como sinais favoráveis da interação:

- A apresentação não ficou restrita à leitura dos slides.
- Ela conseguiu sustentar uma conversa sobre decisões e não somente sobre ferramentas.
- Corrigiu uma interpretação errada da cronologia sem demonstrar resistência à pergunta.
- Fez duas perguntas pertinentes sobre colaboração entre arquitetura e negócio e sobre transição de engenharia para SA.

Esses sinais mostram qualidade de interação. Não mostram, por si só, como os entrevistadores votaram no debrief. Expressões como “legal”, “show” ou “perfeito” podem simplesmente ser maneiras de conduzir a conversa.

## 7. Meu parecer para registrar no acompanhamento do Loop

**Avaliação independente — Apresentação do case**

A candidata apresentou de maneira organizada um incidente relacionado a recomendações de investimentos, demonstrando compreensão da necessidade do cliente, capacidade de trabalhar sob restrições e preocupação com continuidade operacional.

A comparação entre alternativas foi coerente, especialmente diante das limitações de pipeline e permissões. A candidata apresentou verificações relevantes dos dados migrados e descreveu colaboração com áreas de negócio, DBAs, Analytics e liderança.

Os exemplos sustentam evidências positivas de Customer Obsession, Ownership e Earn Trust.

As principais ressalvas estão na ausência de comprovação quantitativa do dimensionamento futuro, nas garantias de consistência durante a migração, na demonstração incompleta dos critérios de recuperação e na precisão de alguns indicadores. Uma resposta sobre o histórico de IA do banco foi excessivamente generalizada.

**Parecer de preparação:** apresentação boa, com sinais fortes de atuação consultiva e liderança transversal; evidência técnica positiva, porém não conclusiva em todos os aprofundamentos.

### Minha conclusão

Eu consideraria essa apresentação um dos pontos potencialmente mais favoráveis da candidatura da Vitória até agora. Ela demonstrou comportamentos valiosos para SA FSI que não aparecem somente em respostas sobre serviços AWS.

A melhor parte, para mim, não foi o DMS. Foi a sequência completa:

**Entender o impacto → construir uma decisão executável → preservar a operação → preparar outras pessoas → atacar riscos estruturais.**

Isso é mais significativo do que simplesmente contar uma migração bem-sucedida.

Minha nota permanece **8,0/10**. Uma nota mais alta exigiria maior precisão dos resultados, melhor sustentação do dimensionamento e mais clareza sobre integridade dos dados e limites do rollback.

Para a consolidação do Loop, eu registraria a apresentação como uma evidência favorável sobretudo em negócio, comunicação, Ownership e Earn Trust, mantendo a avaliação técnica do Eduardo separada, porque ela testou uma capacidade diferente.

Quando reunirmos as entrevistas de Ricardo, Bruna, Fernanda e Lucas, poderemos verificar se esses mesmos comportamentos aparecem espontaneamente em outras situações — esse será um dos indicadores mais úteis da consistência do desempenho da Vitória.
