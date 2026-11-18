# Dia 10 — Entrevista técnica com Edu

Minha avaliação desta primeira entrevista fica em aproximadamente **6,0/10** — um pouco abaixo dos **6,5** que você atribuiu. A diferença não é grande, mas eu daria mais peso a três dificuldades: explicar o fluxo técnico de ponta a ponta, propor alternativas quando uma restrição muda e compreender o problema de drift em Terraform.

Ao mesmo tempo, não foi uma entrevista fraca do começo ao fim. A Vitória demonstrou conhecimento do negócio, experiência operacional, preocupação com continuidade e capacidade de explicar uma solução sob restrições. O desempenho ficou desigual: melhor no contexto e na execução relatada; menos consistente quando Eduardo pediu mecanismos específicos e caminhos diferentes do utilizado.

**Minha síntese:** ela demonstrou experiência relevante, mas não sustentou com a mesma profundidade todas as partes da arquitetura que apresentou.

Essa nota é uma referência nossa de preparação, não uma nota da AWS, classificação de nível ou probabilidade de aprovação. A confiança na avaliação geral é moderada: a transcrição permite identificar padrões, mas tem lacunas importantes, especialmente nas siglas de observabilidade e em parte da discussão de IA.

## 1. O que Eduardo efetivamente avaliou

A entrevista foi predominantemente um aprofundamento dos projetos reais da Vitória, e não um exercício completo de arquitetura hipotética ou troubleshooting com evidências progressivas.

O percurso foi:

**Trajetória → arquitetura de recomendações → ingestão e processamento → escala e observabilidade → incidente do banco → alternativas → Terraform e operação → arquitetura de agentes de IA.**

Ele utilizou o que ela mencionava para selecionar a próxima pergunta: ao ouvir “batch”, investigou o processamento; ao ouvir “Golden Signals”, pediu os sinais; ao ouvir “Terraform” e acesso emergencial, perguntou sobre drift.

Isso importa porque não devemos avaliar esta entrevista como se ele tivesse aplicado exatamente o roteiro que preparamos. Não houve, por exemplo, uma investigação completa de pedido com resultado desconhecido após timeout.

### Minha leitura por dimensão

| Dimensão | Avaliação da evidência nesta sessão |
| --- | --- |
| Conhecimento do domínio e contexto do cliente | Boa. Explicou personalização, carteiras padrão, agrupamento e consequências para a jornada. |
| Explicação da arquitetura de ponta a ponta | Regular. Vários componentes apareceram somente após perguntas direcionadas. |
| Profundidade técnica | Regular, com lacunas relevantes. SNS, processamento em lote, drift e memória dos agentes não ficaram suficientemente explicados. |
| Decisão sob restrições | Boa no caso concreto; incompleta na mudança de cenário. Explicou o caminho escolhido, mas teve dificuldade com uma alternativa sem ampliar a instância. |
| Evidências e validação | Regular. Relatou testes, dashboards e validações, mas frequentemente sem mostrar critérios ou resultados específicos. |
| Comunicação e aderência à pergunta | Oscilante. Algumas respostas foram claras; outras mudaram o assunto ou o nível de detalhe solicitado. |
| Reconhecimento dos próprios limites | Positivo. Admitiu desconhecimentos, embora isso deixe a competência correspondente sem demonstração. |

Não descontei pontos por expressões corrompidas como “bet”, “testes” no lugar de tasks ou nomes de ferramentas mal transcritos. Também não interpretei “boa”, “legal” e outras reações do Eduardo como sinal de aprovação.

## 2. Mapeamento das perguntas e respostas

Abaixo, as perguntas estão parafraseadas para recuperar seu sentido, não apresentadas como transcrição literal. Agrupei retomadas e esclarecimentos do mesmo assunto.

**Régua:**

- **Incompleta:** não resolve o núcleo da pergunta.
- **Regular:** tem elementos corretos, mas a explicação fica parcial.
- **Boa:** responde com clareza suficiente e coerência.
- **Não demonstrado:** o conhecimento ou a execução não apareceu; isso não equivale automaticamente a uma afirmação incorreta.

### A. Abertura e escolha do projeto

| ID | Pergunta ou objetivo | Resposta e avaliação | LP potencial |
| --- | --- | --- | --- |
| E01 | Apresente sua trajetória e o que faz atualmente. | Conectou engenharia, investimentos, IA, ensino e comunicação à função. Boa. | |
| E02 | Você continua em investimentos? Trabalhou no Íon e em quais camadas? | Diferenciou experiência com BFFs e atuação posterior em APIs core. Boa contextualização. | |
| E03 | Qual solução foi mais desafiadora? Descreva a arquitetura. | Considerou dois casos e escolheu o incidente do banco. Regular: demorou a delimitar qual história usaria e por que. | |
| E04 | Como funciona a arquitetura das recomendações? | Explicou carteiras padrão, recomendações por grupos e fallback. Boa no negócio; parcial na arquitetura física. | |

Esses elementos aparecem na apresentação inicial e na escolha da plataforma de recomendações. O enquadramento dos LPs é minha interpretação, não confirmação da atribuição interna.

### B. Ingestão, processamento e escala

| ID | Pergunta ou objetivo | Resposta e avaliação | LP potencial |
| --- | --- | --- | --- |
| E05 | Depois do upload da planilha, como acontece o processamento? | Explicou validações, rejeição de produtos e revisão manual. Boa para as regras; regular para o fluxo técnico solicitado. | Dive Deep |
| E06 | Onde o arquivo cai? Há bucket, evento, API? Qual tecnologia processa? | Começou por Java/ECS e escala; somente após nova pergunta informou o S3 e o processamento posterior. Regular, com direcionamento. | Dive Deep |
| E07 | Quem é o subscriber do SNS e como ele aciona o serviço? | Respondeu com Pub/Sub e “o batch escuta o SNS”, mas não identificou claramente o mecanismo de entrega. Incompleta. | Dive Deep |
| E08 | Como funciona internamente o processamento em lote? Há biblioteca específica? | Disse não lembrar e depois cogitou o SDK da AWS. Não demonstrado: a hipótese sobre conexão não respondeu ao processamento interno. | Dive Deep |
| E09 | Quais políticas de escala e limites de tasks são utilizados? | Indicou CPU, mínimo em torno de três tasks, máximo dez e testes de performance. Boa no básico, com critérios de capacidade pouco detalhados. | Dive Deep; padrões de qualidade |

O problema central desse bloco não foi desconhecer uma biblioteca isolada. Foi a dificuldade de fechar a sequência técnica mesmo depois de várias tentativas de esclarecimento.

### C. Observabilidade e geração das recomendações

| ID | Pergunta ou objetivo | Resposta e avaliação | LP potencial |
| --- | --- | --- | --- |
| E10 | Depois que os produtos estão no RDS, como segue o fluxo? | Disse que ficam disponíveis e passou para observabilidade. Regular: faltou inicialmente concluir o caminho funcional. | Dive Deep |
| E11 | Quais Golden Signals vocês utilizam? | Explicou tráfego, latência e erros. Saturação não ficou registrada; houve uma intervenção no meio. Regular, sem concluir que ela desconhece o quarto sinal. | Dive Deep |
| E12 | O que significa HTTP 400? | Relacionou a uma requisição inválida do consumidor. Boa para a pergunta básica. | Competência técnica |
| E13 | Qual a diferença entre SLI e SLO, com menção a SLA? | Associou indicador, objetivo e acordo, mas houve uma formulação imprecisa no meio. Majoritariamente boa, com ressalva de precisão. | Dive Deep |
| E14 | Existe uma rotina que gera automaticamente as recomendações? | Esclareceu o trabalho manual do negócio e a atuação técnica da squad. Boa delimitação. | Dive Deep; contexto do cliente |

Aqui houve evidência real de familiaridade operacional: Datadog, percentis, alertas e integração com a gestão de incidentes. Isso não deve ser apagado pelas imprecisões.

### D. Incidente do banco e alternativas

| ID | Pergunta ou objetivo | Resposta e avaliação | LP potencial |
| --- | --- | --- | --- |
| E15 | Qual foi o problema do banco, como foi descoberto e como foi resolvido? | Explicou a campanha, 97 mil clientes, infraestrutura desatualizada, restrições, DMS e continuidade. Boa narrativa de recuperação; regular na demonstração do diagnóstico e da validação. | Dive Deep; Ownership; Deliver Results |
| E16 | Como resolveria sem mudar o tamanho da instância? | Primeiro afirmou que não havia outra solução; depois teve dificuldade para construir uma alternativa. Incompleta. | Julgamento técnico; Dive Deep |
| E17 | Conhece CQRS? | Reconheceu conhecimento limitado e não fingiu domínio. Não demonstrado tecnicamente; postura honesta. | Competência técnica; possível sinal de Earn Trust |

A dificuldade com alternativas aparece de forma bastante explícita, mas não torna automaticamente errada a migração realizada. Ela limita a evidência de flexibilidade arquitetural naquela resposta.

### E. Terraform, mudanças e recuperação

| ID | Pergunta ou objetivo | Resposta e avaliação | LP potencial |
| --- | --- | --- | --- |
| E18 | Você escreve módulos Terraform ou utiliza os existentes? | Delimitou que consome e configura módulos corporativos. Boa resposta de escopo. | Dive Deep; autoria |
| E19 | Como detectar e tratar drift após alteração fora do Terraform? | Pediu explicação; depois respondeu sobre deploy, validação e rollback da aplicação. Incompleta e fora do núcleo da pergunta. | Dive Deep; competência técnica |
| E20 | O rollback é automatizado? | Explicou disparo manual e execução da esteira para voltar ao pacote anterior. Boa. | Operação; Dive Deep |
| E21 | Como automatizaria a recuperação usando indicadores? | Propôs alarmes/eventos acionando rollback. Regular: direção plausível, sem critérios e salvaguardas suficientemente definidos. | Dive Deep; melhoria operacional |
| E22 | Qual a diferença entre as métricas de detecção/triagem e recuperação? | Tentou explicar médias e uma linha do tempo. Parcial, com baixa confiança na avaliação das siglas, porque a transcrição alterna MTTD, MTTT e outras formas. | Competência técnica |

O trecho de drift é o mais claro para separar falta de vocabulário de falta de resposta ao conceito: Eduardo explicou o conceito, mas a resposta continuou em outro problema.

### F. Arquitetura de agentes de IA

| ID | Pergunta ou objetivo | Resposta e avaliação | LP potencial |
| --- | --- | --- | --- |
| E23 | Como a solução de agentes se integra ao chat e à plataforma de modelos? | Explicou a especialização em investimentos e a integração com o canal global. Boa no domínio; parte das ferramentas está ambígua no texto. | Dive Deep; contexto do cliente |
| E24 | Como a arquitetura se organiza internamente e trata contexto/execução? | Descreveu router, versões, harness, APIs de negócio, preparação de contexto e LangGraph. Boa visão estrutural, sem aprofundamento suficiente em todas as garantias. | Dive Deep |
| E25 | Como guardam memória de curto e longo prazo? | Disse não ter trabalhado nessa parte e não conseguir responder. Não demonstrado, com reconhecimento explícito do limite. | Dive Deep |

A pergunta anterior à descrição da arquitetura está parcialmente cortada; por isso, não atribuí a ela uma formulação exata sobre segurança, estado ou dados.

### Perguntas feitas pela própria Vitória

Ela perguntou sobre as competências indispensáveis para um SA L5. Na sequência, o trecho parece conter uma pergunta sobre os princípios valorizados por Eduardo, mas essa formulação não foi preservada com clareza. Eu avaliaria o encerramento como positivo, sem utilizá-lo para compensar lacunas técnicas.

## 3. Os melhores momentos da Vitória

### 3.1. Ela corrigiu uma expectativa sobre o sistema sem tentar engrandecê-lo

Eduardo inicialmente explorou a possibilidade de um motor com simulações e geração automatizada. A Vitória explicou que havia intervenção manual do negócio e que chamar aquilo de motor poderia produzir uma impressão errada.

Isso foi bom. Ela não tentou transformar o sistema real em algo mais sofisticado para impressionar.

Também conseguiu explicar por que recomendações por grupos ainda ofereciam uma personalização diferente da carteira padrão e por que perder essa experiência importava para o cliente.

### 3.2. A decisão de migração estava conectada às restrições reais

Ela apresentou uma dificuldade que não era apenas “falta de RAM”: havia módulo e workflow desatualizados, tentativa de recuperar o caminho existente, acesso emergencial não aprovado e ausência do fluxo necessário para snapshot em produção.

Essa foi uma boa demonstração de decisão contextual. A solução escolhida precisava ser executável dentro do ambiente e do prazo, não apenas existir na documentação da AWS.

O ponto a aprimorar é mostrar melhor como comparou os riscos e como verificou o resultado, não apagar essa parte positiva.

### 3.3. Ela pensou na continuidade da consulta e na possibilidade de retorno

Nesta entrevista, a Vitória relata que manteve a origem atendendo e utilizou uma feature toggle para controlar o destino, além de pensar na retirada posterior desse mecanismo.

Isso demonstra preocupação com a operação durante a mudança. O limite é que preocupação com recuperação não equivale, sozinha, a demonstrar um rollback seguro em qualquer estado dos dados. Volto a isso adiante.

Estou registrando o que ela afirmou nesta entrevista. Não substituí esse relato por versões anteriores dos materiais de preparação.

### 3.4. Houve uma explicação estrutural razoável da arquitetura de agentes

O trecho sobre router, distribuição gradual de versões, harness, ferramentas de negócio e preparação de contexto é mais organizado que parte da descrição inicial da ingestão de planilhas.

Ela conseguiu apresentar responsabilidades, não somente nomes de produtos. Esse é um ponto positivo.

A ausência de resposta sobre memória limita a profundidade demonstrada nesse domínio, mas não invalida tudo que explicou antes.

## 4. As dificuldades que mais pesam na avaliação

### 4.1. Em vários momentos, ela respondeu numa camada diferente da solicitada

Esse é o padrão mais recorrente da sessão.

| Eduardo buscava | A resposta caminhou inicialmente para |
| --- | --- |
| Caminho técnico do upload | Regras de negócio e revisão de produtos. |
| Processamento interno em lote | Conexão com AWS e possível SDK. |
| Detecção de drift | Validação e rollback de uma versão da aplicação. |
| Alternativa sem ampliar a instância | Justificativa de por que a ampliação havia sido necessária. |

Esses deslocamentos aparecem em momentos distintos, portanto não parecem apenas uma pergunta isolada mal compreendida.

Não considero tudo isso um problema de comunicação. Há duas situações:

1. Ela conhece algo relevante, mas responde no nível errado.
2. O aprofundamento expõe um mecanismo que ela não consegue explicar.

A preparação precisa distinguir as duas. Melhorar a narrativa não resolve sozinho o segundo caso.

Uma forma de ganhar precisão seria começar confirmando o recorte:

> “Você quer entender o fluxo entre os serviços ou o processamento dentro do serviço Java?”

Essa frase não substitui conhecimento. Ela evita desenvolver durante um minuto uma resposta para outra pergunta.

### 4.2. O fluxo S3 → SNS → processamento não ficou suficientemente fechado

Eduardo perguntou repetidamente onde o arquivo chegava, qual notificação existia e quem era o subscriber. A resposta final ficou em torno de “o batch está inscrito e escuta o SNS”, sem identificar claramente a interface que recebe a mensagem.

Aqui a exigência era pertinente ao projeto que ela própria escolheu apresentar. Não era uma pergunta aleatória sobre um serviço sem relação com sua experiência.

#### Conferência técnica externa

O SNS pode entregar notificações a endpoints HTTP/HTTPS inscritos, por requisições POST. Portanto, não seria correto concluir simplesmente que “uma aplicação não pode ser assinante”. O que precisava ser explicado era qual endpoint ou recurso estava inscrito e como isso acionava o processamento. [Documentação AWS · Entrega do SNS a endpoints HTTP/HTTPS](https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.prepare.html)

Uma resposta mais precisa, sem inventar a integração, poderia ser:

> “O arquivo chega ao S3 e a notificação passa pelo SNS. Não implementei o assinante e não consigo confirmar agora qual é o protocolo ou componente intermediário. O trecho que conheço diretamente começa quando o serviço recebe a referência do arquivo e executa as validações.”

Isso continuaria deixando um limite técnico, mas seria mais claro que repetir Pub/Sub como se a descrição já estivesse completa.

#### Outra afirmação que precisava de cuidado

Ela aproxima a falha no upload de um erro manual na planilha. Pode estar se referindo apenas às rejeições por regras de negócio, mas o texto não delimita isso bem.

Eu separaria:

> “Este produto foi rejeitado porque não passou pela validação.”
>
> “O processamento falhou por um problema técnico.”

Não afirmo que ela diagnosticava tudo incorretamente. A explicação apresentada generalizou mais do que deveria.

### 4.3. Drift foi a lacuna mais claramente demonstrada

A sequência é importante:

Eduardo pergunta sobre drift. Ela pede esclarecimento. Ele explica a diferença entre alteração em produção e infraestrutura como código. Depois, pergunta como detectar e evitar que a próxima execução reverta a mudança. Ela responde com blue/green, canary, validação e rollback da aplicação.

Não saber o termo inicialmente seria recuperável. Não responder ao mecanismo após a explicação é o ponto que pesa mais.

#### Conferência técnica externa

O `terraform plan`, no funcionamento usual, consulta os recursos existentes e propõe mudanças a partir da configuração. Ele não aplica essas mudanças sozinho. Já o modo `-refresh-only` permite examinar a atualização do estado para refletir mudanças externas; isso não substitui ajustar a configuração declarada quando a mudança deve ser mantida. [HashiCorp Developer · terraform plan](https://developer.hashicorp.com/terraform/cli/commands/plan)

Uma resposta conceitual adequada seria:

> “Primeiro compararia a alteração realizada com o código e o plano que será aplicado. Se a mudança emergencial precisar permanecer, ajustaria a configuração e revisaria o plano para garantir que ela não seja desfeita. Se não for desejada, planejaria sua reversão. Não aplicaria a pipeline automaticamente sem avaliar essa diferença.”

Isso é uma resposta de estudo, não algo que ela demonstrou na entrevista.

Também faço uma ressalva à explicação do entrevistador: dizer que “rodar Terraform novamente sobrescreve” simplifica demais; o risco está nas mudanças propostas e depois aplicadas, não na mera execução de qualquer comando.

### 4.4. Ela defendeu a solução utilizada, mas não explorou bem uma alternativa

Quando Eduardo retirou a possibilidade de mudar o tamanho da máquina, a Vitória inicialmente afirmou que não havia outra solução, porque o MVP estava desatualizado e precisava suportar mais carga. Depois não conseguiu desenvolver outra possibilidade.

Esse foi um teste de adaptação do raciocínio. Não exigia que ela dissesse que sua decisão passada estava errada.

Uma resposta mais forte começaria assim:

> “No incidente, aumentar a capacidade foi o caminho executável que escolhemos. Se essa alternativa estivesse indisponível, eu precisaria verificar o que causa o pico: tamanho dos lotes, concorrência das escritas, duração das transações ou consultas. Dependendo da evidência, tentaria reduzir a pressão, considerando o efeito no prazo de processamento.”

São hipóteses propostas, não afirmações sobre a causa real. A documentação do RDS inclui tanto ajuste de consultas quanto dimensionamento entre as formas de tratar pressão de recursos. [Documentação AWS · Boas práticas para Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)

#### CQRS não deve virar o gabarito obrigatório

Eduardo mencionou CQRS, e ela admitiu não dominá-lo. Isso é uma lacuna de repertório naquela sondagem, não prova de que CQRS seria a solução correta para aquele incidente.

O padrão separa responsabilidades de comando e consulta e pode atender necessidades distintas de escala, latência e consistência. Essa separação não demonstra, por si só, que um pico de escrita desapareceria. [Documentação AWS · Padrão CQRS](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/cqrs-pattern.html)

Eu daria mais importância a ela construir alternativas fundamentadas do que a pronunciar esse padrão.

### 4.5. O relato de recuperação não demonstrou suficientemente diagnóstico e validação

A Vitória afirmou que faltava RAM, que leituras continuavam funcionando e que picos de escrita falhavam. Explicou o caminho de recuperação, mas não apresentou os sinais concretos que permitiram concluir que memória era o impedimento.

Também afirmou que validou os dados e realizou a migração com sucesso, mas sem explicar, nesta sessão, os critérios dessa validação.

Essa distinção é central para a nota de Dive Deep:

- “Eu resolvi” demonstra um resultado relatado.
- “Eu descobri por estas evidências e confirmei por estes critérios” demonstra melhor o raciocínio investigativo.

Não estou afirmando que a investigação e a validação não aconteceram. Elas não ficaram suficientemente demonstradas nessa resposta.

#### O que o fallback deixou em aberto

A feature toggle mostra uma preocupação válida. Mas não ficou claro se o retorno era somente para consultas, como as escritas eram tratadas e em que condições a base antiga continuava adequada.

A orientação da AWS distingue retorno sem dados novos de retorno após novas transações; no segundo caso, o tratamento dos dados também precisa fazer parte do plano. [Documentação AWS · Rollback durante a migração](https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-migration-cutover/cutover-stage.html)

Importante: Eduardo não aprofundou essas condições. Eu registraria uma preocupação a esclarecer, não um erro comprovado de integridade.

### 4.6. Na IA, a fronteira do conhecimento apareceu na memória

A resposta sobre curto e longo prazo foi explícita: ela não trabalhou naquela parte e não conseguia responder.

Isso tem duas leituras simultâneas:

- **Positiva:** não inventou uma implementação.
- **Limitante:** não demonstrou o mecanismo de memória da solução apresentada.

Conceitualmente, a documentação do LangGraph distingue memória associada ao estado de uma conversa/thread e memória persistente entre conversas. Isso permitiria, se ela dominasse a distinção, separar conhecimento conceitual do detalhe específico da implementação. [Docs by LangChain · Memória de curto e longo prazo](https://docs.langchain.com/oss/python/concepts/memory)

Uma resposta de preparação poderia ser:

> “Não consigo confirmar o armazenamento escolhido pela equipe. Conceitualmente, separo o estado da conversa atual das informações persistidas entre sessões. Na nossa solução, minha atuação foi no trecho [confirmado], e essa implementação ficou com [responsabilidade confirmada].”

Não atribuiria a ela essa compreensão apenas porque seria uma boa resposta.

## 5. Observabilidade: onde eu seria rigoroso e onde não exageraria

Esse bloco merece uma avaliação equilibrada.

### Golden Signals

A referência clássica inclui latência, tráfego, erros e saturação. A Vitória explicou os três primeiros; a transcrição mostra uma intervenção justamente quando ela parecia continuar a enumeração. [Google SRE · Monitoramento de sistemas distribuídos](https://sre.google/sre-book/monitoring-distributed-systems/)

Meu registro seria “saturação não demonstrada”, não “ela não conhece os Golden Signals”.

Também não trataria o “400 OK… 400 não OK”, corrigido na mesma fala, como grande erro técnico.

### SLI, SLO e SLA

Ela identifica SLI como indicador e SLO como objetivo, mas usa “acordo” no meio e depois associa acordo ao SLA.

A distinção documentada é indicador mensurável, objetivo para esse indicador e acordo com consequências associadas. Vejo imprecisão verbal, mas não ausência completa de compreensão. [Google SRE · Objetivos de nível de serviço](https://sre.google/sre-book/service-level-objectives/)

### MTTD, triagem e MTTR

Este é um dos trechos menos confiáveis da transcrição. Eduardo aparece perguntando MTTD, enquanto a resposta inclui “MTTT” e tempo de triagem. Não vou converter essa ambiguidade em uma certeza de que ela confundiu as siglas.

O que pode ser melhorado independentemente disso é definir quais marcos iniciam e encerram cada intervalo. A definição de MTTD na orientação de DevOps da AWS usa o tempo entre ocorrência e detecção. [Documentação AWS · Métricas de monitoramento contínuo](https://docs.aws.amazon.com/wellarchitected/latest/devops-guidance/metrics-for-continuous-monitoring.html)

Num exemplo didático, uma falha às 10h e detecção às 10h02 representam dois minutos até detectar. Se o serviço retorna às 10h20, é preciso dizer de qual marco se está medindo a recuperação. A aritmética e os limites temporais precisam fechar. Não usei a conta mal transcrita como determinante da nota.

### Escala no ECS

A resposta sobre CPU, mínimo, máximo e testes foi razoável. Eu só evitaria apresentar “três tasks” como recomendação universal da AWS: a orientação de capacidade considera demanda, múltiplas zonas e capacidade restante durante falhas. [Documentação AWS · Capacidade e disponibilidade no ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/capacity-availability-best-practice.html)

## 6. Quais Leadership Principles foram abordados?

Dive Deep é o princípio mais claramente compatível com a condução da entrevista. Não há, porém, uma declaração no texto confirmando que era o único LP atribuído ao Eduardo.

A definição oficial enfatiza atenção aos detalhes, auditoria e ceticismo quando métricas e relatos divergem. Usei esses comportamentos como referência, sem pressupor que profundidade exige executar pessoalmente cada comando. [Amazon.jobs · Leadership Principles](https://amazon.jobs/content/en/our-workplace/leadership-principles)

| LP | Evidências nesta entrevista | Minha avaliação |
| --- | --- | --- |
| Dive Deep | Perguntas sobre fluxo, assinante SNS, processamento, escala, métricas, diagnóstico, drift e memória. | Regular, com preocupações relevantes. Contexto presente; mecanismos e provas inconsistentes. |
| Customer Obsession | Explicação da perda de personalização e necessidade de preservar a jornada. | Boa evidência contextual, sem um caso completo de descoberta e validação com o cliente. |
| Ownership | Relato de atuação temporária na squad e procura de uma solução viável dentro das restrições. | Boa evidência, com participação e responsabilidades ainda passíveis de maior delimitação. |
| Deliver Results | Relato de recuperação dentro da janela necessária e antes de outros impactos. | Evidência positiva, porém pouco auditável: resultado descrito sem critérios detalhados de confirmação. |
| Earn Trust | Reconhecimento de desconhecimentos e correção de expectativas sobre o sistema. | Sinal positivo de transparência, não uma história completa de construção de confiança. |
| Learn and Be Curious | Ensino, curso de comunicação e entrada numa área nova de IA. | Indícios positivos, mas intenção de aprender não equivale a domínio aplicado demonstrado. |
| Insist on the Highest Standards | Testes de performance, observabilidade e preocupação com validação. | Evidência parcial: mecanismos citados, eficácia pouco aprofundada. |

As associações acima vêm da apresentação pessoal, do contexto das recomendações, da observabilidade, da recuperação e dos limites assumidos.

Eu não marcaria Think Big ou Have Backbone como comprovados nesta entrevista. Também não trataria os princípios citados pelo Eduardo no encerramento como uma revelação da sua atribuição: ele estava falando da própria trajetória e das prioridades do seu trabalho.

### Dive Deep, faceta por faceta

| Faceta | Evidência obtida |
| --- | --- |
| Transitar entre negócio e implementação | Conseguiu apresentar os dois níveis, mas nem sempre conectar o caminho entre eles. |
| Manter conexão com detalhes | Alguns limites e componentes foram explicados; integração SNS, drift e memória ficaram abertos. |
| Verificar em vez de assumir | Testes e validações foram mencionados, porém faltaram critérios concretos em pontos centrais. |
| Questionar hipóteses e conclusões | Pouca demonstração de hipóteses descartadas; a alternativa sem aumento de capacidade não foi desenvolvida. |
| Sustentar aprofundamentos | Desempenho misto: escala, regras e organização da IA resistiram melhor; outros follow-ups encerraram a evidência. |

Esse é o motivo principal de eu não considerar a entrevista um sinal técnico fortemente positivo, apesar dos bons momentos.

## 7. Comunicação: o que melhorar sem transformar a Vitória em uma pessoa ensaiada

### Escolher e delimitar o caso mais rapidamente

Na abertura técnica, ela considerou se o incidente era realmente o mais desafiador, cogitou o caso de IA e depois voltou ao banco.

Uma abertura mais direta seria:

> “Vou usar uma recuperação da plataforma de recomendações. O desafio foi recuperar as cargas sem interromper as consultas, com a infraestrutura de mudança desatualizada. Primeiro explico o fluxo e depois a decisão.”

É uma reorganização dos elementos narrados, não uma nova experiência.

### Concluir o fluxo antes de abrir uma evolução futura

Em alguns momentos, ela ofereceu explicar a evolução para ativos recomendados enquanto Eduardo ainda tentava entender o funcionamento da arquitetura atual.

A melhoria é simples:

> “Primeiro fecho o caminho atual. Depois explico o que mudamos e por quê.”

Isso evita que o entrevistador tenha de reconstruir dois sistemas simultaneamente.

### Declarar o limite sem preenchê-lo com uma suposição pouco relacionada

Na pergunta sobre processamento em lote, ela reconheceu não saber a biblioteca, mas depois cogitou o SDK da AWS.

Seria melhor:

> “Não lembro a biblioteca. Posso explicar as etapas de processamento que conheço e separar a parte implementada por outra pessoa.”

A resposta pode continuar incompleta, mas não cria uma falsa sensação de que a pergunta foi respondida.

Esses ajustes de comunicação ajudam. Porém, drift e alternativas técnicas exigem estudo e prática, não apenas frases melhores.

## 8. O que eu não concluiria a partir desta sessão

Não concluiria que a Vitória não sabe ACID ou idempotência. Esses assuntos não foram explorados suficientemente para uma conclusão independente nesta entrevista.

Não diria que ela realizou uma validação incorreta ou perdeu dados. O procedimento não foi detalhado; isso é uma lacuna de evidência.

Não concluiria que ela desconhece toda a arquitetura de agentes. Houve uma descrição estruturada, seguida de um limite específico sobre memória.

Não atribuiria as dificuldades automaticamente a nervosismo ou gripe. O texto menciona mal-estar, mas não permite medir seu efeito no desempenho.

Não transformaria a fala final de Eduardo em feedback indireto. Ao explicar amplitude, alguma profundidade e comunicação, ele respondia a uma pergunta da Vitória sobre o papel de SA. Não disse que ela atendia ou deixava de atender a esses critérios.

## 9. Meu parecer desta primeira entrevista

Se eu tivesse que registrar um parecer de preparação, seria:

> A candidata demonstra experiência relevante em aplicações financeiras, conhecimento do contexto de negócio e participação na recuperação de uma plataforma sob restrições. Explica componentes, práticas operacionais e parte da arquitetura de agentes com coerência. Entretanto, o aprofundamento expôs dificuldade em fechar integrações, tratar drift e construir alternativas quando uma condição da solução é retirada. Diagnóstico e validação foram mais afirmados do que demonstrados por evidências. O conjunto sustenta potencial e experiência, mas deixa dúvidas relevantes sobre consistência da profundidade técnica.

**Sua nota: 6,5. Minha referência: 6,0.** Não vejo diferença suficiente para dizer que sua percepção estava equivocada. Você provavelmente valorizou o domínio do contexto e a recuperação relatada; eu descontei um pouco mais pelos follow-ups não resolvidos.

### As três prioridades de desenvolvimento

| Prioridade | Prática que eu escolheria | Critério de evolução |
| --- | --- | --- |
| Fluxo técnico completo | Desenhar um caminho real de ingestão e responder quem chama quem, por qual interface e o que acontece na falha. | Fechar a sequência sem depender de o avaliador fornecer os componentes. |
| Mudança de restrição | Retirar a possibilidade de aumentar a instância e pedir opções condicionadas a evidências. | Comparar alternativas sem negar automaticamente a possibilidade de outro caminho. |
| Diferença entre os estados do sistema | Exercitar configuração desejada, infraestrutura existente, Terraform state e versão da aplicação. | Distinguir drift, falha de deploy, rollback de código e recuperação de dados. |

O aprendizado central desta entrevista é que ela não precisa apenas “saber mais AWS”. Precisa conectar melhor aquilo que conhece: **necessidade → fluxo → mecanismo → evidência → decisão.**

Ela já demonstra bem partes dessa cadeia. O que impediu uma avaliação mais alta foi a falta de consistência ao percorrê-la até o fim, especialmente quando Eduardo mudou o ângulo da pergunta.
