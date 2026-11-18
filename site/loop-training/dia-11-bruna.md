# Dia 11 — Entrevista com Bruna Franzoni

Com a entrevista da Bruna Franzoni, Enterprise Account Manager da AWS, temos agora as transcrições das cinco entrevistas individuais da Vitória, além da apresentação do case.

Li a conversa completa, incluindo as interrupções, perguntas adicionais e os momentos em que a Bruna discordou das explicações.

Sua percepção de 7/10 faz bastante sentido. Esta foi uma entrevista com bons momentos, inclusive uma história excelente de entrega sob pressão, mas também com dificuldades para demonstrar impacto de negócio e defender algumas decisões usando métricas.

**Avaliação independente — Bruna Franzoni: 7,0/10.** Satisfatória, com ressalvas relevantes.

**Sua nota: 7,0. Minha nota: 7,0.**

Avaliação das evidências da transcrição, não um resultado oficial da AWS.

## Visão geral das seis histórias

| História apresentada | Minha nota | Leadership Principle mais evidente |
| --- | --- | --- |
| Transações pelo chat de investimentos | 5,8 | Customer Obsession |
| Ensino de Amazon Athena | 7,5 | Earn Trust |
| Discordância sobre métricas de entrega | 6,0 | Have Backbone; Disagree and Commit |
| Observabilidade, SLI/SLO e cache | 7,0 | Dive Deep |
| Publicação de 2.400 carteiras com prazo crítico | 9,0 | Deliver Results |
| Incidente de escalabilidade na jornada de projeção | 7,0 | Bias for Action |

Notas ilustrativas de qualidade e aderência, sem pesos oficiais ou correspondência com a avaliação interna.

A melhor resposta foi a das 2.400 carteiras. Vitória descreveu um bloqueio concreto, reproduziu a falha, fez uma correção delimitada, preservou as validações e entregou dentro do prazo. Foi uma história com boa sequência de investigação, ação, testes e resultado verificável.

A resposta mais problemática foi a discordância sobre lead time. A intenção de distinguir tempo de espera e tempo de execução era válida, mas ela apresentou uma alteração na definição da métrica como se fosse uma redução real de 30% no tempo de entrega. A própria Bruna questionou se o período em backlog não deveria continuar sendo medido.

Outro ponto importante: a Bruna tinha uma preocupação recorrente com *data points*, ou seja, evidências concretas de resultado. Isso ficou especialmente evidente quando pediu números para a nova experiência transacional do chat, que ainda não estava aberta aos clientes.

Minha leitura inicial é que a Vitória demonstrou boa capacidade de resolver problemas técnicos e cumprir compromissos, mas foi menos consistente ao traduzir essas soluções em resultados de negócio comprovados.

## 1. Mapeamento das perguntas da Bruna

Reconstruí seis blocos de avaliação, com aproximadamente 23 perguntas e aprofundamentos.

A primeira pergunta e parte da pergunta sobre discordância estão cortadas na transcrição. Nesses casos, reconstruí somente o sentido que ficou preservado.

### Bloco A — Entendimento da necessidade do cliente

| ID | Pergunta | Minha avaliação da resposta |
| --- | --- | --- |
| B01 | Conte uma situação em que precisou entender o time de negócio antes de construir uma solução. | Regular. O exemplo mostrou iniciativa, mas pouca descoberta junto às partes interessadas antes da implementação. |
| B02 | Como identificou essa necessidade? | Regular. Baseou-se principalmente na própria experiência como usuária. |
| B03 | O que teria construído se não tivesse investigado? | Regular. Explicou o fluxo antigo, mas não demonstrou uma investigação estruturada. |
| B04 | Como mediu se a mudança atendeu ao cliente? | Incompleta para clientes finais. A funcionalidade ainda estava em testes internos. |
| B05 | Você tem algum dado numérico para sustentar o resultado? | Parcial. Informou mais de 100 cenários testados e uma expectativa de aumento de 60%, não um resultado medido. |

#### O que faltou nessa história?

Vitória apresentou uma funcionalidade interessante: permitir que o cliente realizasse transações de investimentos dentro do chat quando possível e fosse direcionado à jornada apropriada quando necessário.

O raciocínio é plausível. Reduzir etapas pode melhorar uma jornada digital.

Ela também demonstrou preocupação com testes, incluindo situações em que o agente poderia recomendar algo inadequado.

O problema é que a pergunta da Bruna parecia buscar descoberta de necessidades junto ao negócio, antes de decidir o que construir.

A Vitória explicou que utilizou a versão anterior e percebeu que, como cliente, preferiria transacionar sem sair do chat.

Isso demonstra empatia e capacidade de identificar oportunidades. Mas não substitui uma investigação com usuários, stakeholders ou dados sobre abandono de jornada.

#### Por que a Bruna insistiu nos números?

Porque a Vitória afirmou que a nova experiência seria melhor, mas a funcionalidade ainda não estava disponibilizada aos clientes finais.

Ela apresentou mais de 100 cenários de teste, o que é uma evidência válida de verificação técnica e funcional.

Depois mencionou uma expectativa de 60% mais transações.

Esses dois números medem coisas diferentes.

| Informação | O que comprova |
| --- | --- |
| Mais de 100 cenários testados | Esforço de validação antes da liberação. |
| Aprovação ou experimentação pelo negócio | Aceitação preliminar pelos stakeholders internos. |
| Expectativa de 60% mais transações | Uma meta ou hipótese, se houver fundamentação. |
| Aumento efetivo de conversão | Ainda não demonstrado. |

A Vitória deixou claro que o produto não estava aberto ao público final. Portanto, não atribuo a ela uma mentira sobre resultados.

Mas a origem da expectativa de 60% não foi apresentada, e isso pode ter enfraquecido a resposta diante de uma entrevistadora que explicitamente procurava data points.

#### A resposta que teria sido mais forte

Uma estrutura melhor, utilizando somente os fatos relatados, seria:

> “Identifiquei uma oportunidade ao utilizar a versão anterior do chat. Levei essa necessidade para a construção da nova funcionalidade e disponibilizei a solução para validação com as áreas de negócio. Como ainda não está em produção para os clientes finais, não tenho resultado de conversão. O que já posso demonstrar são os cenários de teste e as validações internas. Após a liberação, o indicador principal será a proporção de conversas que resultam em transações concluídas.”

Isso separaria hipótese, validação interna e benefício realizado.

**LP mais provável:** Customer Obsession.

Meu parecer: demonstrou intenção de melhorar a experiência, mas não apresentou evidências suficientes de que trabalhou de trás para frente a partir de uma necessidade validada do cliente.

### Bloco B — Adaptar a comunicação para outra pessoa

| ID | Pergunta | Minha avaliação |
| --- | --- | --- |
| B06 | Conte quando precisou adaptar sua explicação para alguém com dificuldade. | Boa. Escolheu um exemplo concreto da Escola da Nuvem. |
| B07 | Como percebeu que sua comunicação estava funcionando? | Boa, com ressalva. Citou reação, participação e feedback, mas não uma verificação objetiva de aprendizagem. |
| B08 | E se a explicação não funcionasse? Como se adaptaria novamente? | Boa. Propôs investigar a linha de raciocínio do aluno e mudar a abordagem. |

#### A história do Amazon Athena

Vitória explicou que um aluno não conseguia associar o nome do serviço à sua função.

Ela utilizou uma referência à deusa Atena, ligada à sabedoria, para criar uma associação e ajudar o aluno a lembrar que o Amazon Athena pode consultar dados no S3.

A escolha da história foi adequada para a pergunta.

Ela demonstrou criatividade e preocupação em ajustar a linguagem à pessoa que estava aprendendo.

Também explicou que não utiliza a mesma abordagem em todas as turmas. Com públicos mais experientes, prefere explicações técnicas e diretas.

#### O aprofundamento da Bruna foi importante

Bruna não se limitou a ouvir a história. Quis saber como Vitória verificava se a explicação havia funcionado e o que faria se não funcionasse.

A Vitória respondeu com participação dos alunos, perguntas e formulários de feedback.

Isso é positivo, mas existe uma diferença entre:

- O aluno gostou da explicação.
- O aluno compreendeu o conceito e consegue aplicá-lo.

A transcrição não demonstra que ela verificou o aprendizado desse aluno posteriormente.

Ainda assim, sua proposta de investigar as dúvidas antes de criar outra analogia foi boa.

**LPs compatíveis:** Earn Trust, Learn and Be Curious e desenvolvimento de pessoas.

Minha avaliação: boa resposta de comunicação, especialmente relevante para uma função consultiva, mas com evidência de resultado limitada.

## 2. A pergunta que mais prejudicou a entrevista: lead time

### Bloco C — Discordância com uma liderança

| ID | Pergunta | Avaliação |
| --- | --- | --- |
| B09 | Conte quando discordou de alguém com maior autoridade ou responsabilidade. | Boa escolha de situação, com problema na fundamentação. |
| B10 | O tempo em backlog realmente não deveria contar? | Incompleta inicialmente. |
| B11 | A espera não afeta o resultado e o cliente? | Regular. Reconheceu a necessidade de medir espera, mas somente após a objeção. |
| B12 | Não seria necessário manter um indicador separado para essa espera? | Boa recuperação parcial. Concordou com a importância de outra métrica. |

Essa história merece uma análise mais rigorosa.

#### O que aconteceu

Vitória percebeu que o painel utilizado para acompanhar entregas começava a contar o tempo de uma tarefa ainda no backlog.

Na visão dela, isso dificultava entender a duração do desenvolvimento propriamente dito.

Defendeu iniciar a contagem quando a tarefa passasse para a etapa de desenvolvimento.

Relatou que o indicador caiu de dez para sete dias, uma diferença de 30%.

A proposta de medir o tempo ativo de execução é legítima. O problema é apresentar a alteração como uma melhoria efetiva de lead time.

#### Lead time versus cycle time

A distinção mais comum em Kanban é:

| Métrica | O que mede |
| --- | --- |
| Lead time | Tempo total desde a entrada da solicitação no fluxo definido até a entrega. |
| Cycle time | Tempo desde o início efetivo do trabalho até sua conclusão. |
| Tempo em espera | Períodos em que a demanda aguarda priorização, capacidade ou outra etapa. |

A Atlassian diferencia explicitamente lead time e cycle time dessa maneira. Já a definição de lead time for changes do DORA usa outro recorte, do commit à implantação em produção. Por isso, o marco inicial deve sempre ser declarado. [Atlassian — lead time e cycle time](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-control-chart/) · [DORA — métricas de entrega de software](https://dora.dev/guides/dora-metrics/)

#### Exemplo ilustrativo

| Intervalo | Duração |
| --- | --- |
| Tempo de espera | 7 dias |
| Tempo em execução | 7 dias |
| Tempo total até a entrega | 14 dias |

Se a equipe passar a medir somente os últimos sete dias, o número exibido diminui, mas o cliente continua esperando quatorze dias.

#### Por que Bruna questionou?

A Bruna percebeu uma implicação de negócio:

**A demanda existe, está aguardando e essa espera também precisa ser gerenciada.**

Essa era uma objeção pertinente.

Vitória tentou explicar que queria avaliar a eficiência da execução, não o tempo total da demanda.

Nesse ponto, a proposta dela fazia sentido. O erro estava em não distinguir com clareza as duas perspectivas desde o começo.

Uma resposta excelente teria sido:

> “Você tem razão: o tempo em backlog importa para o cliente e não pode desaparecer. Minha proposta não deveria ser eliminar essa medição, mas separar o tempo total de entrega do tempo efetivo de execução. Assim conseguimos identificar se o gargalo está na priorização ou no desenvolvimento.”

Essa resposta preservaria a preocupação da Bruna e o objetivo técnico da Vitória.

#### O que considero mais problemático

A Vitória relatou uma redução de 30% como resultado da mudança.

Entretanto, não ficou demonstrado que as tarefas passaram a ser entregues mais rapidamente.

O número caiu porque o método de contagem mudou.

Isso não significa que a alteração tenha sido inútil. Separar indicadores pode melhorar decisões e diagnósticos.

Mas o resultado deveria ser apresentado como maior precisão na observabilidade do processo, não como redução comprovada no tempo de entrega.

#### O que a reação da Bruna sugere?

Ela insistiu na relevância do tempo em backlog, mesmo depois de ouvir a justificativa.

Minha leitura é que Vitória não a convenceu integralmente naquele momento.

Isso não prova uma avaliação negativa de Have Backbone. O princípio não exige vencer toda discordância.

Porém, numa entrevista com uma profissional de negócio, deixar de valorizar claramente o tempo total do cliente pode prejudicar a percepção de Customer Obsession e julgamento.

**Minha nota para essa história: 6,0.**

A postura foi respeitosa, e houve abertura ao contraponto. A argumentação e a interpretação do resultado foram insuficientes.

## 3. Observabilidade e métricas de serviço

### Bloco D — SLI, SLO e melhoria operacional

| ID | Pergunta | Avaliação |
| --- | --- | --- |
| B13 | Conte uma situação em que definiu SLI/SLO e obteve melhoria operacional. | Boa, com imprecisões. |
| B14 | O resultado foi efetivamente menor latência? | Regular inicialmente. Diferenciou detecção de melhoria após novo aprofundamento. |
| B15 | Qual foi sua contribuição individual, separada do time? | Boa, mas com delimitação técnica incompleta. |
| B16 | Houve algum obstáculo durante essa implementação? | Resposta direta. Disse que não houve obstáculo relevante. |

Vitória contou que identificou falta de indicadores e alertas numa aplicação de recomendações.

Ela passou a acompanhar latência, estabeleceu objetivos e configurou mecanismos para sinalizar comportamentos fora do esperado.

Posteriormente, um problema de latência foi identificado e a equipe utilizou cache para melhorar o desempenho.

Ela relatou uma redução aproximada de dois segundos para 300 milissegundos.

#### O que foi positivo

A sequência tem elementos concretos:

**Ausência de visibilidade → criação de indicadores → identificação de problema → melhoria de desempenho.**

Ela também explicou que a observabilidade precisava servir tanto à equipe técnica quanto às pessoas que acompanhavam o funcionamento da jornada.

Essa é uma boa visão.

#### O que ficou tecnicamente impreciso

A transcrição alterna referências a dois segundos e a um percentual de 2%.

Não vou concluir que houve um erro definitivo, porque o reconhecimento de voz é pouco confiável nesse trecho.

Mas a diferença conceitual é importante:

- **SLI:** o indicador que será medido, como latência ou percentual de requisições dentro de um limite.
- **SLO:** o objetivo estabelecido para esse indicador, com um período de avaliação.
- **Alerta:** o mecanismo que sinaliza determinada condição operacional.

A documentação de SRE do Google utiliza, por exemplo, objetivos como 99% das requisições concluídas abaixo de um limite de latência. [Google SRE — objetivos de nível de serviço](https://sre.google/sre-book/service-level-objectives/)

Uma resposta completa precisaria esclarecer qual indicador foi utilizado, qual objetivo foi estabelecido, qual janela de avaliação e o que disparava o alerta.

#### Outra distinção importante

Criar um SLI não reduz diretamente a latência.

A observabilidade pode permitir detectar e investigar uma degradação.

A intervenção técnica — nesse caso, o cache — é que pode reduzir o tempo de resposta.

A Bruna perguntou especificamente sobre essa diferença, e a Vitória conseguiu apresentar a história do cache como resultado posterior.

Minha avaliação é positiva, mas não excelente, porque faltaram detalhes sobre as medições, o funcionamento da solução e a responsabilidade individual na implementação.

## 4. A melhor resposta: publicação de 2.400 carteiras

### Bloco E — Entrega crítica com prazo curto

| ID | Pergunta | Avaliação |
| --- | --- | --- |
| B17 | Conte uma entrega crítica com bloqueio e prazo curto. Como garantiu o resultado? | Excelente. |
| B18 | Você conseguiu investigar e testar tudo nesse período? | Boa. Apresentou a duração aproximada do trabalho. |
| B19 | A entrega ocorreu dentro do prazo? | Excelente. Resposta clara e afirmativa. |
| B20 | Por que esse problema não foi identificado antes? | Boa, com ressalva. Explicou a mudança recente e a ausência de teste antecipado com aquele produto. |

Essa foi a resposta mais consistente da entrevista.

#### Case relatado — Publicação de carteiras

| Indicador | Valor | Referência |
| --- | --- | --- |
| Lote total | 2.400 | Carteiras |
| Com produto J7 | 360 | 15% do lote |
| Divergências relatadas | 0 | Após validação |

#### A sequência foi muito boa

A situação aconteceu aproximadamente dois dias úteis antes da publicação.

Um novo código de produto, J7, já estava aprovado pelo negócio, mas a rotina técnica ainda não o reconhecia.

Como consequência, o sistema rejeitou o lote completo.

Vitória reproduziu a falha, identificou uma tabela de mapeamento desatualizada e confirmou a classificação com a área de investimentos.

Depois realizou três testes relevantes:

| Teste | Objetivo |
| --- | --- |
| Carteira contendo J7 | Confirmar que o produto aprovado passou a ser reconhecido. |
| Carteira anteriormente válida | Verificar que a correção não quebrou o funcionamento existente. |
| Carteira com produto inválido | Confirmar que as regras de rejeição continuavam funcionando. |

Essa terceira validação é particularmente importante.

Ela não resolveu o problema simplesmente afrouxando as regras para permitir a publicação.

Preservou os controles e confirmou que entradas inválidas continuavam sendo recusadas.

Depois verificou o lote em homologação e relatou uma conferência em produção dos percentuais de alocação contra o arquivo aprovado.

A publicação foi concluída dentro do prazo.

#### Por que essa história se destaca?

Diferentemente de outras respostas, aqui quase tudo ficou explícito:

- **Problema:** lote rejeitado.
- **Impacto:** 2.400 carteiras, 360 contendo J7.
- **Prazo:** aproximadamente dois dias úteis.
- **Causa identificada:** mapeamento não atualizado.
- **Correção:** mudança pontual.
- **Qualidade:** testes positivos, regressão e entrada inválida.
- **Resultado:** publicação dentro do prazo, sem divergências identificadas na verificação relatada.

Essa resposta demonstra Deliver Results, Dive Deep e Insist on the Highest Standards.

É um exemplo forte porque ela conseguiu equilibrar velocidade e qualidade.

#### O único ponto que faltou

Bruna perguntou por que o problema não havia sido identificado antes.

Vitória explicou que o novo produto havia sido incorporado pouco antes da publicação e que o cenário não tinha sido testado antecipadamente da mesma maneira.

Isso esclarece a origem do problema, mas deixa uma oportunidade: a criação de um mecanismo preventivo para novas classificações de produtos.

Por exemplo, uma validação de compatibilidade de códigos antes da janela final de publicação poderia reduzir a recorrência.

Ela não afirmou ter implementado esse mecanismo. Portanto, não atribuo esse resultado a ela.

**Minha nota permanece 9,0.**

## 5. Incidente em produção e aprendizado posterior

### Bloco F — Recuperação da jornada de projeção

| ID | Pergunta | Avaliação |
| --- | --- | --- |
| B21 | Conte um incidente importante: como investigou e o que mudou depois? | Boa no diagnóstico e na recuperação; parcial nas mudanças posteriores. |
| B22 | Por que essa situação foi difícil? | Boa. Explicou urgência, impacto e necessidade de acesso excepcional. |
| B23 | Que aprendizado ou mecanismo foi implantado depois? | Regular. Apresentou práticas e retrospectiva, mas pouco resultado verificável. |

Vitória reutilizou a história de um incidente na jornada de projeção, também discutida com Ricardo.

Relatou aumento de tráfego, insuficiência de capacidade, análise de métricas e logs e uma intervenção para ampliar recursos.

Mencionou recuperação em aproximadamente 20 a 30 minutos.

#### O que foi positivo

A história mostra uma decisão tomada diante de um problema ativo, com clientes afetados.

Ela explicou o trade-off entre aguardar a pipeline convencional e utilizar um acesso emergencial autorizado.

Esse ponto é interessante quando comparamos com o case do RDS:

| Caso | Decisão relatada |
| --- | --- |
| RDS de recomendações | Evitou Break Glass porque ainda havia janela de recuperação, consultas funcionando e alternativas controladas. |
| Incidente de projeção | Utilizou acesso emergencial diante de impacto ativo e necessidade de recuperação imediata. |

Essas decisões não são contraditórias. Elas demonstram que a justificativa para uma exceção depende do contexto e do risco de não agir.

Esse é um ponto favorável ao julgamento da Vitória.

#### O que faltou

A Bruna não pediu apenas a resolução do incidente.

Ela perguntou o que mudou depois.

Vitória mencionou maior preocupação com testes de performance, capacidade, thresholds, feature flags e discussões posteriores.

Mas não apresentou claramente um mecanismo específico implantado naquela aplicação, com evidência de que reduziu a probabilidade de recorrência.

A diferença é:

> “Depois passei a considerar testes de capacidade.”

versus

> “Depois implementamos este controle, com estes limites, e observamos este resultado.”

A segunda resposta demonstraria melhor aprendizado transformado em mudança operacional.

Minha avaliação: boa evidência de Bias for Action, mas apenas parcial de melhoria estrutural posterior.

## 6. O que as perguntas revelam sobre a avaliação da Bruna?

Esta entrevista parece ter buscado várias competências associadas à atuação consultiva:

| Leadership Principle | Evidência encontrada | Qualidade |
| --- | --- | --- |
| Customer Obsession | Nova experiência de transação no chat, preocupação com fricção da jornada e entrega de recomendações. | Mista: intenção forte, descoberta e resultados menos demonstrados. |
| Earn Trust | Adaptação da comunicação, resposta respeitosa ao questionamento da Bruna. | Boa |
| Have Backbone; Disagree and Commit | Discordância com a métrica apresentada pela liderança. | Parcial: defendeu sua visão, mas não sustentou integralmente o contraponto de negócio. |
| Dive Deep | Investigação do J7, observabilidade e incidente de capacidade. | Boa, com variação entre histórias |
| Insist on the Highest Standards | Testes de regressão e preservação das validações durante a correção crítica. | Forte no caso J7 |
| Deliver Results | Publicação das 2.400 carteiras no prazo. | Forte |
| Bias for Action | Recuperação rápida do incidente de projeção. | Boa |
| Learn and Be Curious | Adaptação da comunicação e reflexão sobre incidentes. | Indícios, não o foco principal |

Usei as definições públicas dos Leadership Principles como referência. [Princípios de Liderança da Amazon](https://www.aboutamazon.com.br/quem-somos/principios-de-lideranca)

Os três princípios que considero mais diretamente explorados foram Customer Obsession, Earn Trust e Deliver Results.

Have Backbone e Dive Deep também apareceram de maneira relevante.

Não sabemos, entretanto, quais princípios foram formalmente atribuídos a essa entrevistadora.

## 7. O comportamento da Bruna durante a entrevista

A Bruna começou destacando que a avaliação utiliza exemplos e dados concretos.

Isso foi coerente com toda a condução da conversa.

Em vários momentos, ela não aceitou somente uma conclusão e pediu o fundamento:

- Quando Vitória afirmou que a experiência do chat seria melhor, perguntou como isso havia sido medido.
- Quando explicou a mudança da métrica de entrega, questionou o desaparecimento do tempo de espera.
- Quando descreveu a observabilidade, perguntou se a latência realmente havia melhorado.
- Quando relatou a publicação das carteiras, perguntou como garantiu a qualidade e por que o erro não foi descoberto antes.

A Bruna foi uma entrevistadora que separou intenção, atividade e resultado.

Isso é muito pertinente para uma Account Manager que precisa demonstrar valor de soluções técnicas aos clientes e às lideranças.

### Essa insistência significa que ela não gostou da Vitória?

Não necessariamente.

Ela avisou no começo que faria perguntas para recuperar evidências e validar seu entendimento.

Portanto, o fato de interromper ou aprofundar não é negativo por si só.

Por outro lado, na história do lead time, o questionamento chegou a um desacordo substantivo sobre o que deveria ser medido.

Esse é um sinal de que aquela resposta não resolveu completamente a preocupação da entrevistadora.

Eu não tentaria transformar a cordialidade do encerramento em um sinal de aprovação.

Bruna explicou que o resultado seria discutido por várias pessoas, incluindo hiring manager e Bar Raiser. Isso é informação sobre o processo, não sobre seu voto individual.

## 8. Comparação com sua nota

Sua nota de 7/10 estava bem calibrada.

Eu não aumentaria para 8 porque duas histórias relacionadas diretamente a negócio deixaram dúvidas importantes:

**Primeiro:** a funcionalidade transacional ainda não tinha resultado com clientes finais, e a meta de 60% não teve fundamentação apresentada.

**Segundo:** o indicador de entrega foi redefinido, mas a Vitória apresentou a queda numérica como melhoria, sem distinguir claramente eficiência de desenvolvimento e tempo total de espera.

Também houve falta de precisão em partes da explicação de SLI/SLO e das mudanças posteriores ao incidente.

Ao mesmo tempo, não reduziria para 6.

A história do J7 foi muito boa, a adaptação da comunicação teve elementos relevantes, e a recuperação da jornada de projeção demonstrou experiência com incidentes.

O desempenho foi irregular, não predominantemente ruim.

### Meu parecer simulado

**Parecer — Evidências mistas**

A candidata apresentou experiências concretas de desenvolvimento de soluções, comunicação com públicos distintos e recuperação de problemas operacionais.

Demonstrou boa capacidade de investigação e execução numa entrega crítica, preservando critérios de qualidade sob prazo restrito.

Entretanto, mostrou menor consistência em descoberta de necessidades de negócio, demonstração de impacto com dados e interpretação de métricas de fluxo de trabalho.

O desempenho sustenta competências relevantes para a função, mas deixa dúvidas sobre a consistência da atuação consultiva quando o entrevistador questiona as premissas e os indicadores utilizados.

Se eu tivesse de caracterizar esta sessão qualitativamente, seria mista, com uma história claramente forte e outras que exigiriam maior sustentação.

Não atribuiria um voto formal hipotético de aprovação ou reprovação à Bruna apenas com essa evidência.

## 9. Consolidação das cinco entrevistas e da apresentação

Agora podemos olhar o conjunto.

### Comparação entre suas notas e as minhas

| Sessão | Sua avaliação | Minha avaliação |
| --- | --- | --- |
| Eduardo — Principal SA | 6,5 | 6,0 |
| Apresentação do case | — | 8,0 |
| Ricardo — FSI Account Manager | 8,0 | 8,0 |
| Fernanda — Customer Success Leader | 8,0 | 8,4 |
| Lucas — Hiring Manager | 9,0 | 8,3 |
| Bruna — Enterprise Account Manager | 7,0 | 7,0 |

As notas foram atribuídas independentemente, segundo a qualidade das evidências disponíveis. Não há garantia de pesos iguais ou de que essa escala corresponda à utilizada pela Amazon.

### O que o conjunto mostrou

**Competências comportamentais consistentes**

As entrevistas de Ricardo, Fernanda e Lucas apresentaram boas evidências de iniciativa, colaboração, aprendizado, autonomia e capacidade de desenvolvimento de outras pessoas.

**Boa atuação em situações reais**

A apresentação do DMS, o rollout interrompido, a governança do CMDB e a publicação das 2.400 carteiras são exemplos relevantes de decisões e entregas concretas.

**Profundidade técnica heterogênea**

Eduardo revelou lacunas em mecanismos, integração e alternativas arquiteturais. As demais entrevistas não eliminaram essas preocupações, embora tenham trazido exemplos técnicos positivos.

**Demonstração de resultados nem sempre precisa**

Em diferentes momentos, apareceram metas projetadas, mudanças na forma de medir indicadores e resultados relatados sem uma base de comparação claramente definida.

### Os Leadership Principles mais bem sustentados no Loop

| LP | Minha leitura global |
| --- | --- |
| Ownership | Forte. Apareceu em diferentes contextos e entrevistadores. |
| Learn and Be Curious | Forte. Aprendizado aplicado, adaptação a novas tecnologias e revisão de abordagens. |
| Earn Trust | Boa a forte. Colaboração, transparência e desenvolvimento de pessoas. |
| Hire and Develop the Best | Forte. História de mentoria particularmente convincente. |
| Bias for Action | Boa. Especialmente na interrupção de rollout e recuperação de incidentes. |
| Think Big | Boa. Ampliação da governança do CMDB além da área original. |
| Have Backbone; Disagree and Commit | Boa. Evidência especialmente forte na entrevista com Fernanda. |
| Deliver Results | Boa, com variação. Entregas fortes, mas a história de atraso com Lucas foi menos completa. |
| Customer Obsession | Boa, porém irregular. Excelente contexto no case; menor comprovação na história do chat com Bruna. |
| Dive Deep | Irregular. Bons diagnósticos pontuais, mas dificuldade em alguns aprofundamentos técnicos do Eduardo. |

Não classificaria os LPs restantes como ausentes da candidata; apenas não tivemos evidências suficientes para avaliá-los com o mesmo grau de confiança.

## 10. O que realmente pode pesar na decisão?

Há três perguntas que eu gostaria de responder com os dados da avaliação interna, mas às quais não temos acesso.

### 1. Eduardo considerou as lacunas técnicas impeditivas para o nível L5?

Essa é, para mim, a maior incerteza.

A Vitória demonstrou boa experiência operacional e conhecimentos relevantes, mas algumas perguntas de arquitetura não foram resolvidas.

Não sei qual profundidade mínima foi exigida naquela avaliação.

### 2. Bruna considerou a dificuldade com métricas uma preocupação relevante ou apenas uma oportunidade de aprofundamento?

A história das 2.400 carteiras pode ter produzido uma evidência bastante favorável de Deliver Results.

Mas a resposta sobre lead time pode ter levantado dúvidas sobre a interpretação de métricas sob a perspectiva do cliente.

O peso relativo dessas evidências é desconhecido.

### 3. As boas evidências de Ricardo, Fernanda e Lucas foram suficientes para demonstrar o conjunto de competências esperado?

As entrevistas comportamentais foram mais consistentes.

Entretanto, não existe uma regra pela qual três boas entrevistas automaticamente compensem duas avaliações com ressalvas.

O processo considera o conjunto, os requisitos da função e a discussão interna.

## Minha conclusão sobre o Loop completo

Minha avaliação independente é **moderadamente favorável, mas não conclusiva**.

A Vitória demonstrou competências reais de engenharia e atuação transversal, especialmente em Ownership, aprendizado, comunicação e resolução de problemas sob restrições.

Também demonstrou potencial para uma função consultiva, principalmente quando precisava compreender um problema de negócio e coordenar diferentes pessoas para resolvê-lo.

O principal risco continua sendo a profundidade técnica exigida para SA L5, seguida da precisão com que traduz algumas ações em resultados mensuráveis.

A impressão positiva que você teve do Lucas é compatível com a qualidade da conversa. E minha avaliação da Fernanda foi até um pouco superior à sua.

Mas a entrevista do Eduardo e alguns questionamentos da Bruna impedem que eu apresente o desempenho global como inequivocamente forte.

Se a reunião interna concluir que a Vitória atingiu a profundidade técnica necessária e valorizar as evidências comportamentais apresentadas, há um conjunto defensável para uma decisão positiva.

Se, por outro lado, as lacunas técnicas forem consideradas essenciais para a função, elas podem pesar bastante.

Portanto, eu não diria que a Vitória passou, nem que foi reprovada. Diria que ela construiu uma candidatura com evidências favoráveis importantes, mas não sem riscos.

E, considerando tudo que analisamos, a entrevista da Bruna não foi um desastre — foi a mais irregular depois da técnica do Eduardo, mas terminou com uma história de entrega muito convincente. Isso explica bem a sua percepção de 7/10.
