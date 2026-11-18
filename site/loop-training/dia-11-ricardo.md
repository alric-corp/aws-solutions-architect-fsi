# Dia 11 — Entrevista com Ricardo

Analisei a transcrição da entrevista da Vitória com Ricardo, FSI Account Manager da AWS, incluindo as intervenções de Gabriel, que também participou da conversa.

Minha avaliação é que essa entrevista foi boa e consideravelmente mais consistente do que a entrevista técnica com Eduardo. Concordo com sua percepção de 8/10.

**Avaliação independente — Entrevista com Ricardo: 8,0/10.** Boa, com evidências comportamentais fortes.

Confiança moderada. A transcrição permite reconstruir as histórias e os aprofundamentos, mas contém erros de reconhecimento e não revela a avaliação interna da AWS.

O principal diferencial foi que Vitória apresentou situações concretas, assumiu decisões e explicou consequências. Isso apareceu especialmente na história em que interrompeu uma liberação gradual após detectar aumento de latência e erros, sem esperar pela disponibilidade do gestor.

Também houve uma evolução interessante em relação ao Phone Screen: ela reutilizou a história de mentoria, mas dessa vez explicou com mais clareza como sua perspectiva mudou — algo que havia ficado incompleto na primeira entrevista.

## Os Leadership Principles mais prováveis

A sequência de perguntas sugere dois focos principais:

**Learn and Be Curious**

Foi explorado pelas perguntas sobre mudança de perspectiva, aprendizado com outras pessoas, adoção de tendências externas e desenvolvimento de conhecimento fora da zona de conforto.

**Bias for Action**

Foi explorado pelas decisões sem a presença do gestor, contenção de uma implantação problemática e aceitação de riscos calculados para recuperar uma aplicação.

Essa é minha inferência com base nas perguntas, não uma confirmação dos LPs atribuídos ao Ricardo. Há outros princípios presentes nas histórias, principalmente Ownership, Earn Trust, Customer Obsession e Hire and Develop the Best.

A entrevista teve cinco histórias principais: mentoria de uma desenvolvedora, experimento com Amazon Comprehend, interrupção de rollout, recuperação de uma aplicação sob pico de tráfego e integração de Open Finance com agentes de IA.

## 1. Mapeamento das perguntas e follow-ups

Reconstruí cinco perguntas comportamentais principais, com aproximadamente vinte intervenções de aprofundamento ou esclarecimento.

As perguntas abaixo estão parafraseadas. A transcrição nem sempre permite identificar com segurança quem falou; atribuo a Gabriel somente as intervenções em que a identificação ficou suficientemente clara.

### Bloco 1 — Mentoria e mudança de perspectiva

| ID | Pergunta | Classificação |
| --- | --- | --- |
| R01 | Conte uma situação em que alguém da equipe fez você pensar de maneira diferente. | Boa |
| R02 | Você era Tech Lead ou desenvolvedora sênior? | Excelente — delimitou sua responsabilidade. |
| R03 | De onde veio o conhecimento ou a inspiração para ajudar essa pessoa? | Boa |
| R04 | Que resultado concreto ela alcançou? | Boa, com ressalva sobre a medição. |
| R05 | Gabriel: alguém pediu sua ajuda? Como começou a situação? | Excelente em autocrítica e esclarecimento da iniciativa. |

#### História 1 — Mentoria

**8,2/10**

**O que ela demonstrou bem**

Vitória percebeu que sua abordagem habitual não atendia às necessidades daquela profissional. Organizou um acompanhamento individual, buscou referências com lideranças mais experientes, envolveu o Tech Lead e acompanhou a evolução.

O melhor momento foi a pergunta de Gabriel sobre a origem da iniciativa.

Ela explicou que ninguém havia solicitado formalmente a mentoria, que já observava dificuldades e que, retrospectivamente, poderia ter começado a ajudar antes.

Esse reconhecimento foi significativo porque demonstrou aprendizado a partir do episódio, não apenas uma história com resultado positivo.

**O que ficou incompleto**

A pergunta original falava de alguém que desafiou a maneira como ela pensava.

Vitória demonstrou ter revisto sua perspectiva ao observar uma situação, mas não apresentou um confronto explícito de ideias nem alguém que tenha diretamente contestado sua abordagem.

Isso não torna a história inadequada. Apenas deixa uma nuance da pergunta menos demonstrada.

Também relatou que as entregas passaram de um ou dois meses para uma frequência semanal. É uma melhora relevante, mas não ficou claro se as histórias comparadas tinham complexidade equivalente.

Minha avaliação: forte evidência de Hire and Develop the Best, Earn Trust e Learn and Be Curious. Ela respondeu melhor com essa história do que no Phone Screen.

### Bloco 2 — Aprendizado externo e Amazon Comprehend

| ID | Pergunta | Classificação |
| --- | --- | --- |
| R06 | Conte uma tendência ou abordagem aprendida fora da empresa que você aplicou no trabalho. | Boa |
| R07 | Como ficou sabendo desse workshop? | Boa |
| R08 | Você acompanha fontes de conhecimento fora da AWS? | Regular |
| R09 | Quanto tempo durou a POC e quantos feedbacks foram analisados? | Boa |
| R10 | A POC trouxe alguma melhoria concreta, mesmo não sendo adotada amplamente? | Boa, com ressalva técnica |

#### História 2 — POC com Comprehend

**7,3/10**

Vitória relatou ter participado de um workshop da AWS, identificado uma oportunidade para analisar feedbacks dos clientes e conduzido uma prova de conceito com o Amazon Comprehend.

Ela apresentou dados úteis: aproximadamente 200 a 300 feedbacks, durante dois a três meses, e a conclusão de que o custo e a complexidade não justificavam expandir aquela implementação para outras jornadas.

Considero positivo ela não ter apresentado a POC como um sucesso comercial completo.

Reconhecer que uma tecnologia funciona, mas não gera valor suficiente para justificar sua adoção, é um exemplo de julgamento.

**A ressalva técnica**

Há um trecho no qual parece atribuir ao próprio Comprehend a sugestão de acrescentar um ícone explicativo a um gráfico.

Isso merece cuidado.

O Amazon Comprehend identifica sentimentos, frases-chave, entidades e outras informações textuais. A operação DetectSentiment, especificamente, retorna uma classificação de sentimento e suas pontuações, não uma recomendação generativa de UX. [Amazon Comprehend · Análise de texto](https://docs.aws.amazon.com/comprehend/latest/dg/how-it-works.html) · [Amazon Comprehend · DetectSentiment](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DetectSentiment.html)

Pode ter ocorrido uma interpretação humana dos resultados, ou alguma etapa adicional não explicada. A transcrição não permite confirmar.

Esse é o principal ponto tecnicamente impreciso dessa história.

Uma explicação mais forte distinguiria a análise de sentimento da decisão posterior da equipe de melhorar a apresentação do gráfico.

Ainda assim, o aprendizado externo, a POC e a avaliação de viabilidade foram demonstrados.

## 2. A melhor resposta da entrevista: interromper o rollout

### Bloco 3 — Decisão sem a presença do gestor

| ID | Pergunta | Classificação |
| --- | --- | --- |
| R11 | Conte uma decisão importante que precisou tomar sem consultar o gestor. | Excelente |
| R12 | Por que o gestor não estava disponível? | Boa |
| R13 | O que faria diferente hoje? | Excelente |
| R14 | O que teria acontecido se não tivesse agido? | Boa |
| R15 | O que aconteceu depois da contenção? | Excelente |

#### História 3 — Rollout interrompido

**9,1/10 — Minha resposta mais bem avaliada da sessão.**

| Liberação inicial | Latência relatada | Normalização |
| --- | --- | --- |
| 10% dos clientes | 700 → 2.500 milissegundos | ~10 min após contenção |

A resposta apresentou praticamente todos os elementos que eu procuraria numa boa história STAR.

- **Situação:** uma funcionalidade estava liberada para 10% dos clientes, com expansão prevista para o mesmo dia.
- **Problema:** aumento de latência e erros, comparando o novo fluxo com o anterior.
- **Decisão:** interromper a expansão e desabilitar a funcionalidade por feature flag, em vez de realizar um rollback completo que poderia afetar outras alterações.
- **Resultado:** latência normalizada em aproximadamente dez minutos, correção posterior de uma consulta ineficiente e retomada da liberação gradual dois dias depois.
- **Aprendizado:** definir antecipadamente indicadores e critérios de interrupção; posteriormente, criar mecanismos de acompanhamento.

#### Por que essa história merece nota alta?

Vitória deixou claro um raciocínio particularmente importante:

**Era possível conter o impacto antes de conhecer a causa raiz exata.**

Ela não confundiu contenção com correção definitiva.

Também demonstrou preocupação em não afetar outras partes da aplicação que continuavam funcionando.

Isso é uma evidência convincente de Bias for Action combinado com Customer Obsession e julgamento proporcional ao risco.

#### O aprofundamento foi muito bom

Quando Ricardo perguntou o que ela faria diferente, a resposta não ficou em “eu tomaria a mesma decisão”.

Ela reconheceu que os critérios de interrupção deveriam ter sido combinados antes da implantação, com limites de latência e taxa de erros.

Quando perguntaram o que aconteceu depois, ela explicou a criação de dashboards e alertas.

Aqui houve uma sequência completa: decisão → resultado → aprendizado → mecanismo posterior.

A única ressalva é que os limites exatos configurados não foram recuperados, e a abrangência do impacto sobre os clientes não foi quantificada.

Mas isso não compromete a qualidade central da resposta.

Se eu fosse o avaliador e tivesse de escolher apenas uma história como evidência forte de Bias for Action, escolheria esta.

## 3. Onde a entrevista perdeu mais força

### Bloco 4 — Risco calculado e recuperação de uma aplicação

| ID | Pergunta | Classificação |
| --- | --- | --- |
| R16 | Conte uma situação em que velocidade justificou assumir um risco calculado. | Boa, com ressalvas |
| R17 | Como reduziu os riscos da ação escolhida? | Regular |
| R18 | O aumento de capacidade gerou mais custo? | Boa |
| R19 | Não existia risco de escalabilidade descontrolada? | Regular/incompleta |
| R20 | Como identificou o momento certo de agir? | Boa |
| R21 | Quais alternativas considerou? | Boa, mas pouco aprofundada |

#### História 4 — Recuperação sob pico de tráfego

**7,1/10**

Vitória relatou um incidente de capacidade numa aplicação de projeção de investimentos, com erros e aumento de demanda.

Ela investigou métricas e logs, ampliou recursos e recuperou o serviço em aproximadamente 30 minutos.

O que foi bom: explicou que aceitar algum aumento temporário de custo poderia ser melhor do que prolongar o impacto aos clientes.

Essa foi uma resposta coerente para a pergunta sobre o trade-off entre custo e velocidade.

Mas Ricardo aprofundou algo diferente:

**Como você reduziu o risco da intervenção?**

E foi justamente aí que a resposta perdeu força.

Ela voltou à urgência e à rapidez do Break Glass, mas não explicou suficientemente os limites da alteração, as verificações prévias, as condições de retorno ou o tratamento posterior da mudança realizada diretamente em produção.

#### O problema do escalonamento

Quando perguntaram sobre o risco de escalar indefinidamente, Vitória explicou o funcionamento do escalonamento por CPU e a redução de recursos quando a utilização diminui.

A direção está correta, mas uma política orientada à utilização de CPU não demonstra, sozinha, o limite máximo de tarefas.

No ECS, esse limite é configurado explicitamente no Service Auto Scaling por meio da capacidade máxima, além das demais restrições do ambiente. [Amazon ECS · Service Auto Scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html)

Uma resposta mais completa mencionaria a configuração concreta de máximo de tasks, o comportamento durante o pico e como a equipe acompanhava os custos.

Como ela não informou esse limite, a pergunta ficou apenas parcialmente resolvida.

#### Minha leitura do Bias for Action nesse caso

Ela demonstrou ação rápida diante de um incidente verdadeiro, mas o caráter calculado do risco ficou menos evidente.

A diferença é importante:

- **Agir rapidamente:** demonstrado.
- **Explicar como limitou e controlou os riscos da ação:** parcialmente demonstrado.

Portanto, eu não descartaria a história, mas também não a classificaria como excelente.

## 4. A última história recuperou a força da entrevista

### Bloco 5 — Aprender IA e integrar Open Finance

| ID | Pergunta | Classificação |
| --- | --- | --- |
| R22 | Conte uma situação em que assumiu algo fora da zona de conforto. | Boa |
| R23 | Como buscou o conhecimento necessário? | Boa, após redirecionamento |
| R24 | Como transformou o aprendizado em entrega? | Boa |

#### História 5 — Open Finance e agentes de IA

**8,2/10**

Ela escolheu um episódio recente: ingressou numa equipe de agentes de IA e precisou implementar uma integração com informações de saldo externo, dentro de um contexto de investimentos.

O ponto positivo é que descreveu uma atividade fora do repertório anterior, mas ligada a um problema concreto de negócio.

Ela mencionou o aprendizado sobre as responsabilidades dos componentes, a implementação da integração, diferentes condições de consulta e testes para evitar comportamentos incorretos.

Também relatou uma falha particularmente relevante para o domínio financeiro: o agente somava valores em dólar e real sem tratar corretamente a diferença de moeda.

#### O que valorizo nessa história

A Vitória não apresentou o aprendizado como algo puramente acadêmico.

Ela conectou conhecimento novo à implementação e citou mais de cinquenta cenários automatizados de teste.

Essa é uma evidência melhor de Learn and Be Curious do que simplesmente afirmar que gosta de estudar.

O resultado apresentado inclui uma versão disponibilizada para testes de negócio. Não a trataria como implantação definitiva para todos os clientes, porque a fala não comprova isso.

#### A ressalva sobre as 800 mil chamadas

Ela apresenta um exemplo em que, de um milhão de interações, apenas 20% precisariam consultar o saldo externo.

Isso corresponde a:

**1.000.000 × 80% = 800.000**

Ou seja, 800 mil consultas potencialmente evitadas em relação à estratégia hipotética de consultar sempre.

A conta está correta, mas o cenário foi apresentado como uma projeção condicional.

Não podemos transformar isso automaticamente em:

> “Reduzi 800 mil chamadas reais.”

A proposta é interessante, mas o benefício medido e o benefício projetado precisam permanecer separados.

Também há uma distinção importante para serviços financeiros: usar um valor informado pelo próprio cliente não é o mesmo que confirmar esse valor numa fonte autorizada. O comportamento correto depende do que a aplicação promete e do objetivo da consulta.

Esses detalhes não foram explorados pelos entrevistadores. Portanto, eu os registraria como possíveis aprofundamentos técnicos, não como erros comprovados na entrevista.

## 5. Consolidação dos Leadership Principles

A entrevista apresentou uma concentração bastante clara em duas competências, embora outros princípios tenham aparecido nas histórias.

| Leadership Principle | Evidência | Minha leitura |
| --- | --- | --- |
| Learn and Be Curious | Workshop, POC, consulta a especialistas, aprendizado para trabalhar com agentes. | Forte |
| Bias for Action | Interrupção do rollout e resposta ao incidente de capacidade. | Forte, com ressalva no risco calculado |
| Ownership | Tomou iniciativa de mentoria, interrompeu expansão problemática e acompanhou correções. | Forte |
| Hire and Develop the Best | Mentoria estruturada, feedback e evolução da colega. | Forte |
| Earn Trust | Comunicação difícil, escuta, apoio e alinhamento com liderança. | Boa |
| Customer Obsession | Priorização da experiência do cliente e contenção de incidentes. | Boa |
| Invent and Simplify | Experimentação com Comprehend e regras para evitar consultas desnecessárias. | Parcial a boa |
| Deliver Results | Normalização do rollout, recuperação operacional e entregas de IA. | Boa |
| Dive Deep | Diagnóstico de consulta ineficiente e investigação de capacidade. | Parcial nesta sessão |

Eu não classificaria Have Backbone; Disagree and Commit como demonstrado de forma suficiente. Não houve um episódio claro de discordância com uma decisão já tomada e posterior comprometimento com o caminho definido.

Também não tentaria marcar todos os dezesseis princípios da Amazon a partir dessas histórias.

### Os dois LPs que provavelmente interessavam mais ao Ricardo

**Learn and Be Curious — 8,0/10**

Aprendizado aplicado e mudança de perspectiva demonstrados; algumas respostas precisaram de direcionamento.

**Bias for Action — 8,2/10**

Ótima história do rollout; controle de risco menos convincente no segundo incidente.

Essas notas são referências ilustrativas da qualidade das evidências, não pontuações oficiais.

## 6. O que mudou em relação ao Phone Screen?

Há uma evolução importante.

Na primeira entrevista, quando perguntaram sobre uma situação em que alguém desafiou a maneira de pensar, Vitória contou a história da mentoria, mas a relação com a mudança de perspectiva ficou pouco explícita.

Nesta entrevista, ela corrigiu justamente esse ponto.

Ela explicou que inicialmente esperava que o acompanhamento já disponível fosse suficiente, percebeu que a profissional precisava de apoio individualizado e reconheceu que poderia ter agido antes.

Outro avanço foi a utilização de episódios diferentes para perguntas distintas.

Ela não tentou responder tudo com o case do RDS ou com a história do cache.

Na entrevista do Ricardo, apresentou:

| História | Principal competência demonstrada |
| --- | --- |
| Mentoria | Aprendizado interpessoal e desenvolvimento de pessoas |
| Comprehend | Curiosidade e experimentação |
| Rollout interrompido | Autonomia, contenção e julgamento |
| Incidente de capacidade | Ação rápida sob risco |
| Open Finance e agentes | Aprendizado técnico aplicado |

Essa variedade fortalece o repertório comportamental.

Em contrapartida, os mesmos pontos de melhoria técnica continuam aparecendo ocasionalmente: explicar exatamente o mecanismo de uma ferramenta e distinguir resultado medido de uma estimativa.

## 7. Como interpreto as reações dos entrevistadores?

Houve reações como “boa”, “legal”, “faz sentido” e “perfeito”.

Gabriel também afirmou que a situação inicial da mentoria estava clara, mas queria aprofundar a origem da iniciativa.

Ricardo fez várias perguntas sucessivas e, ao final, disse que havia obtido as informações necessárias para aquela sessão.

A leitura mais segura é que a entrevista conseguiu produzir evidências que eles consideraram suficientes para encerrar a avaliação prevista.

Isso não significa necessariamente que as evidências tenham sido positivas.

Um entrevistador pode encerrar porque obteve informações suficientes tanto para um parecer favorável quanto para um desfavorável.

Portanto, não usaria a cordialidade ou a fala final como previsão da decisão.

## 8. Meu parecer sobre esta entrevista

**Parecer simulado — favorável, com ressalvas**

A candidata demonstrou experiência em engenharia de software para serviços financeiros e apresentou exemplos distintos de aprendizado, desenvolvimento de pessoas e tomada de decisão sob pressão.

Sua resposta mais convincente envolveu interromper uma liberação gradual após observar degradação de latência e erros. A candidata delimitou impacto, comparou alternativas, executou contenção e relatou correção e melhorias posteriores.

Também demonstrou disposição para revisar sua própria abordagem, buscar conhecimento e utilizar novas tecnologias em problemas reais.

As principais preocupações estão na explicação do risco calculado durante uma intervenção em produção, na delimitação de resultados quantitativos e em algumas imprecisões técnicas sobre Comprehend e limites de autoscaling.

Se eu fosse obrigado a formular um voto puramente hipotético, usando a escala informal que adotamos nos simulados:

> **Leaning Inclined**, especialmente pelas evidências de Learn and Be Curious e Bias for Action.

Isso não é uma classificação que eu atribua ao Ricardo real e não permite calcular a chance de contratação.

## 9. Como essa entrevista contribui para o Loop até agora

**Registro parcial da nossa análise independente**

| Sessão | Minha avaliação | Principal leitura |
| --- | --- | --- |
| Eduardo — Técnica | 6,0 | Profundidade técnica desigual; lacunas importantes em mecanismos e alternativas. |
| Apresentação do case | 8,0 | Boa comunicação, entendimento de negócio e liderança transversal. |
| Ricardo — Comportamental | 8,0 | Exemplos reais, autonomia, aprendizado e decisões bem sustentadas. |

A entrevista do Ricardo contribui positivamente para a avaliação global, porque apresentou evidências comportamentais que não dependem apenas do case previamente preparado.

E o aspecto mais importante é que a Vitória não pareceu depender de uma única história forte. Ela conseguiu sustentar episódios de momentos diferentes da carreira, com responsabilidades e resultados distintos.

Minha nota final permanece **8,0/10**, alinhada à sua.

Eu não aumentaria para 9 porque a história de risco calculado perdeu força diante dos aprofundamentos, e o experimento com Comprehend teve uma explicação técnica imprecisa. Mas também não reduziria para 7, porque a história do rollout foi particularmente convincente e os demais exemplos forneceram evidências relevantes.

O principal sinal favorável é a capacidade de agir, reconhecer limites e aprender. O principal ponto que ainda fica em aberto é a consistência da profundidade técnica — que deverá ser considerada junto da entrevista do Eduardo, não substituída por esta.
