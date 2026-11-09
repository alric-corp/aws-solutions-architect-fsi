# Phone Screen — revisão e plano de treino

Primeira entrevista da Vitória com a AWS: cenário de e-commerce e perguntas comportamentais. Uma revisão para preservar os melhores episódios, organizar o raciocínio e escolher o próximo treino.

> **Leitura central:** a análise fornecida aponta amplitude técnica, capacidade de explicar e experiências relevantes. Os momentos mais fortes aparecem quando a Vitória descreve algo que investigou e implementou. O próximo passo é fazer esse raciocínio chegar com consistência ao ponto solicitado, também diante de um cenário hipotético.

## Visão geral por área

| Área | Leitura da análise fornecida | Foco do próximo ensaio |
| --- | --- | --- |
| Apresentação pessoal e motivação | Boa: conectou experiência financeira, tecnologia e ensino à função desejada. | Valorizar a trajetória com exemplos, sem diminuir a experiência. |
| Descoberta e arquitetura inicial | Boa abertura, com ressalvas: perguntas relevantes, seguidas de uma solução complexa antes de justificar a complexidade. | Traduzir a descoberta para o cliente e comparar uma opção inicial mais simples. |
| CMDB e mudança de abordagem | Um dos melhores momentos: investigação, revisão da solução, critérios e tratamento de casos inconclusivos. | Sustentar critérios, validação e significado do resultado. |
| Cache e redução de latência | Um dos melhores momentos: problema, diagnóstico, implementação e acompanhamento. | Definir métricas, recorte, TTL, invalidação e efeito na jornada. |
| Feedback e mentoria | Experiências úteis, com ajustes de narrativa. | Mostrar a mudança posterior e escolher o episódio pela pergunta. |
| Troubleshooting de checkout | Parcial: sinais e ferramentas conhecidos, com investigação pouco organizada de ponta a ponta. | Localizar a espera antes de aprofundar um componente. |
| Pedido durante falha do banco | Incompleta para o problema: recuperação da infraestrutura e sessão sem fechar o estado da operação. | Separar persistência, confirmação e repetição segura. |
| Desalinhamento entre equipes | Não demonstrado naquela resposta: rotinas e intenções, sem episódio concreto de negociação entre times. | Recuperar prioridades conflitantes, atuação, decisão e resultado. |

## O que preservar

### Apresentação: uma motivação sustentada pela trajetória

A Vitória relacionou a atuação em investimentos, o interesse por decisões de arquitetura e o ensino de fundamentos de cloud a pessoas iniciantes. A observação de que passou a aprender pensando em como explicaria a outras pessoas torna visível uma habilidade de comunicação relevante para SA.

O ajuste é retirar expressões que diminuem a experiência, como ensinar “somente Cloud Practitioner”. Não é necessário ampliar o nível do conteúdo para explicar seu valor.

<details>
<summary>Ver formulação proposta para o próximo ensaio</summary>

**Proposta de reformulação, não fala verificada da entrevista:**

> “Ensino fundamentos de cloud para pessoas que estão começando. Isso me exige entender os conceitos e explicá-los de forma acessível, algo que também utilizo nas conversas com negócio.”

Use somente se representar com precisão a experiência relatada.

</details>

### CMDB: reconhecer limites e mudar o caminho

O problema relatado envolvia **aproximadamente 400 repositórios associados à mesma squad**, com distorção de indicadores e do direcionamento de incidentes e alertas. A análise descreve uma primeira abordagem com agente, limitações nas informações utilizadas e uma mudança para cruzamento de dados com Python.

O ponto forte é a decisão: critérios explícitos, execução prévia sem alteração (**dry-run**) e revisão manual quando a evidência era insuficiente. O resultado relatado foi a redução das pendências para **aproximadamente 39**, cujo significado precisa ser confirmado.

**O que sustenta a história:** perceber que a primeira abordagem não era suficiente, revisar a solução e delimitar quando a automação não deveria decidir.

Perguntas para aprofundar:

- Por que escolheu os critérios de atividade e predominância de uma squad?
- Como verificou se a recomendação de responsável estava correta?
- Os 39 eram repositórios ainda sem identificação, chamados pendentes ou transferências não concluídas?
- A expansão para outras áreas aconteceu ou continuava como intenção?

A análise apresenta a expansão como objetivo futuro. Não convertê-la em adoção comprovada. Trocar “scriptizinho” por “script” ou “automação” ajuda a descrever a contribuição sem diminuí-la.

### Cache: investigação antes da intervenção

A sequência relatada é consistente: latência acima da referência utilizada pelo banco → análise de traces no Datadog → localização de duas dependências → avaliação de dados com pouca mudança → implementação de cache e acompanhamento.

A resposta incluiu retorno à origem quando necessário, TTL e invalidação por evento. Ao explicar que identificou a oportunidade revisando indicadores da plataforma, a Vitória tornou sua iniciativa mais visível.

Os números são **aproximados**: algo entre **2 e 2,4 segundos para cerca de 180 milissegundos em uma dependência**. O insumo não define se eram média, percentil ou outra medida. Não calcular um ganho da jornada completa a partir dessa comparação.

Perguntas para aprofundar:

- Qual métrica, operação, população e período foram comparados?
- Por que sete horas de TTL eram aceitáveis para aqueles dados?
- O que acontecia se a invalidação não fosse processada?
- Quanto melhorou a dependência e quanto melhorou a jornada completa?

O objetivo é explicar por que a solução era apropriada e quais limites tinha. A simplicidade da implementação pode ser uma qualidade.

### Honestidade, autocrítica e interesse pelo trabalho de SA

No episódio de feedback da primeira atividade como júnior, a Vitória assumiu a comunicação tardia das dificuldades e não inventou um impacto direto no cliente quando perguntaram.

No encerramento, perguntou sobre contribuição do SA além da técnica, impacto da IA na função e avaliação de valor para o cliente depois de uma entrega. O conteúdo dessas perguntas é útil para a preparação; a simpatia das respostas dos entrevistadores não permite prever aprovação.

## As três prioridades de treino

### 1. Fechar o estado do pedido durante uma falha

**O que apareceu na análise:** diante da pergunta sobre evitar perder um pedido durante uma falha no banco, a resposta trouxe backup, Multi-AZ, réplica, estado externo à aplicação e token de sessão. Mesmo após a retomada da pergunta sobre a compra, permaneceu centrada na recuperação.

**A lacuna:** esclarecer o que aconteceu com aquele pedido. Citar uma estratégia de disponibilidade não resolve, sozinho, a confirmação de uma operação específica.

| Questão | O que a resposta precisa esclarecer |
| --- | --- |
| O banco voltou? | Recuperação da infraestrutura e restabelecimento do acesso. |
| O pedido foi confirmado? | Estado persistido da operação. |
| O cliente sabe o resultado? | Confirmação recebida ou resultado ainda desconhecido. |
| Uma nova tentativa é segura? | Identidade da mesma intenção e prevenção de efeitos duplicados. |

O [failover de uma instância RDS Multi-AZ](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.Failover.html) muda o destino do banco e exige restabelecer conexões. A [AWS Builders’ Library](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) trata o contrato para repetir uma intenção sem novos efeitos, incluindo identidade e resposta equivalente. Recuperar acesso e resolver o resultado de uma operação são questões relacionadas, com garantias distintas.

<details>
<summary>Ver abertura proposta e perguntas de aprofundamento</summary>

**Proposta de treino, não resposta já dada pela Vitória:**

> “Eu separaria recuperar o banco de descobrir o resultado do pedido. Primeiro, precisamos saber em que momento a falha ocorreu: antes da confirmação da transação ou depois dela, com perda da resposta. Para permitir uma nova tentativa segura, a aplicação precisa reconhecer a mesma intenção e recuperar ou concluir seu resultado sem criar outro pedido.”

Depois da abertura, pedir o mecanismo:

- Onde ficam a identidade da intenção e o resultado?
- O que impede duas tentativas concorrentes de gerar dois pedidos?
- Como o registro da identidade se coordena com a alteração de estado?
- O que o cliente recebe se o resultado ainda estiver desconhecido?
- Como tratar uma repetição com a mesma identidade e conteúdo diferente?

A abertura organiza o problema; não é uma implementação completa. O sinal de evolução é explicar o contrato e seus limites, não apenas pronunciar “idempotência”.

</details>

**Prática existente:** [Pedido durante falha do banco — abertura da candidata](../simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/candidato.md). Para consolidar o mecanismo, estudar [timeout e idempotência](../../technical-knowledge/01-fundamentals/acid/07-timeout-idempotencia.md).

### 2. Investigar checkout lento de ponta a ponta

**O que apareceu na análise:** dependências externas, logs, CPU, memória, IOPS, conexões, locks, deadlocks, queries e índices. Quando solicitado o fluxo a partir da reclamação do cliente, a resposta voltou principalmente às métricas do banco.

**Correção de leitura:** ela mencionou queries e índices. A lacuna não foi esquecer esses temas, mas explicar como descobrir onde aprofundar antes de escolher o banco como centro da investigação.

**Sequência para o ensaio:** delimitar o sintoma → acompanhar uma operação afetada → localizar a espera → testar hipóteses → agir → verificar a jornada.

<details>
<summary>Ver resposta de abertura proposta</summary>

**Proposta de método, não transcrição da entrevista:**

> “Primeiro, eu delimitaria qual operação está lenta, desde quando e para quais clientes. Acompanharia uma tentativa afetada pelo fluxo disponível na observabilidade, procurando onde o tempo se concentra. Se a espera estiver no banco, aprofundo consultas, bloqueios e recursos. Se estiver numa dependência externa ou antes de obter uma conexão, a investigação muda.”

Liberar evidências aos poucos e pedir que ela explique qual hipótese cada uma favorece, qual ainda não resolve e o que pediria em seguida. Não transformar a sequência em uma lista obrigatória de ferramentas nem antecipar a causa do simulado.

</details>

**Conexão útil:** no caso real de cache, a Vitória já relatou localizar dependências lentas por traces antes de escolher a intervenção. Há experiência que pode ajudar a tornar o método explícito e transferível ao cenário hipotético; isso não dispensa revisar fundamentos.

**Prática existente:** [Checkout lento — abertura da candidata](../simulations/04-troubleshooting/01-checkout-lento/candidato.md).

### 3. Escolher um episódio real de desalinhamento entre equipes

**O que apareceu na análise:** rotinas de métricas, manutenção da plataforma e alinhamento ao direcionamento do banco. Ao aprofundar a interação com outro time, a resposta descreveu o que faria: levar dados, conversar com liderança técnica e discutir alternativas.

**A lacuna:** um episódio em que duas equipes tinham objetivos diferentes e a Vitória atuou para construir uma decisão. Estar abaixo de um indicador corporativo não demonstra, por si só, esse conflito.

Antes de escolher a história, ela pode confirmar o recorte: “Você quer um episódio em que duas equipes tinham prioridades diferentes e eu precisei ajudar a construir um acordo, correto?” Essa é uma formulação proposta para o treino.

O episódio precisa permitir reconstruir:

1. O que cada parte precisava.
2. Qual conflito existia.
3. O que a Vitória fez e quais alternativas discutiu.
4. Qual decisão foi alcançada e por quem.
5. Qual resultado foi observado.

A análise menciona que o material da apresentação posterior descreve negociação de tempo para manutenção e articulação com outras áreas. Isso é **uma pista para recuperar fatos**, não evidência desta resposta. Negociar com a liderança da própria squad não comprova automaticamente um conflito entre duas equipes.

Melhor pedir alguns segundos para escolher um exemplo do que preencher a resposta com um processo hipotético. [STAR e evidências](../../leadership-principles/00-star-and-evidence.md) oferece apoio para organizar o episódio sem inventá-lo.

## Precisão técnica para o próximo ensaio

### Descoberta em linguagem de negócio

A análise registra perguntas sobre produtos, clientes, abrangência, canais, cadastro e disponibilidade. Portanto, houve tentativa de entender o negócio.

O ajuste é adequar a linguagem a uma empresa recém-fundada que espera orientação. Perguntas sobre tipos de consulta e registro podem pressupor um desenho técnico que o cliente ainda não tem.

| Formulação a revisar | Formulação proposta |
| --- | --- |
| “Quais consultas você precisa fazer?” | “O que você e sua equipe precisam saber depois de uma venda? Por exemplo, acompanhar um pedido, consultar o histórico do cliente ou identificar produtos mais vendidos?” |

Obter essa informação continua sendo descoberta técnica; o ponto de partida é uma necessidade que o interlocutor consegue explicar.

### Justificar a separação dos componentes

A arquitetura relatada separou usuários, catálogo, carrinho e pagamento, com bancos diferentes e integração por eventos. Isso mostra repertório, mas a comparação com um início mais simples ficou insuficiente diante de time, prazo e operação ainda pouco definidos.

Não classificar a arquitetura como errada apenas por usar microsserviços. Pedir uma comparação:

- O que precisa ser independente desde o início?
- Qual benefício justifica separar esse componente agora?
- Que responsabilidade operacional a separação acrescenta?
- Qual alternativa mais simples atende ao primeiro estágio do cliente?

**Postura proposta:** “Esta é uma opção. Antes de fixá-la, preciso validar se o benefício de separação compensa a complexidade para o estágio e o time desse cliente.”

### Concorrência: mostrar a proteção da última unidade

A Vitória reconheceu o risco de múltiplos compradores e mencionou transações, bloqueios e reserva. A explicação ainda precisava fechar o mecanismo que impediria duas aprovações concorrentes.

**Exercício autoral:** A e B leram que existe uma unidade. O que exatamente impede as duas compras?

Pedir a sequência das operações e, depois, mudar uma condição: concorrência, falha ou expiração da reserva. A resposta precisa explicar uma proteção válida no mecanismo escolhido. Dizer apenas “uso ACID” não mostra essa proteção; não há obrigação de usar um padrão específico se a garantia for sustentada.

### Fargate, ACM e modalidades Multi-AZ

As conferências abaixo complementam os temas do insumo. **Não são novas falas atribuídas à Vitória.**

| Tema | Explicação a consolidar | Referência primária |
| --- | --- | --- |
| Fargate e escala automática | Explicar quem altera a quantidade desejada de tasks e quais critérios e limites foram configurados. No ECS, o Service Auto Scaling usa Application Auto Scaling. Escolher Fargate não descreve essa política. | [ECS Service Auto Scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html) |
| ACM e TLS | ACM gerencia emissão, armazenamento e renovação de certificados e chaves. Identificar o componente que usa o certificado e atende a conexão; não atribuir todo esse fluxo ao gerenciador de certificados. | [Visão geral do ACM](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html) |
| Multi-AZ e leituras | Nomear a modalidade. A standby de uma implantação Multi-AZ DB instance não atende leituras. Um Multi-AZ DB cluster tem instâncias leitoras que também são destinos de failover. Não generalizar uma modalidade para todo “Multi-AZ”. | [Instância com standby](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html) · [Multi-AZ DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/multi-az-db-clusters-concepts.html) |

O exercício é explicar configuração, mecanismo, garantia e limite, sem acrescentar serviços apenas para aumentar a lista.

### IA: esclarecer a tarefa antes do nome do produto

Na pergunta sobre recomendação, a análise relata uma abertura por análise de sentimentos com Comprehend e a tentativa de recuperar outro serviço. Quando o cenário foi delimitado como chatbot, a conexão entre Bedrock, fontes de dados e API de catálogo ficou mais clara.

**Abertura proposta:** “Precisamos sugerir produtos, localizar informações ou responder dúvidas sobre eles?”

Depois, explicar dados, fluxo e critério de resultado. Não lembrar o nome comercial de um serviço não precisa interromper um raciocínio que ela consegue sustentar.

## Ajustes nas respostas comportamentais

### Feedback difícil: começar pelo episódio e demonstrar a mudança

O episódio da primeira atividade como desenvolvedora júnior era válido. A abertura, ao ponderar se o feedback era realmente crítico, enfraqueceu a relevância de algo que marcou sua forma de trabalhar.

**Abertura proposta, baseada nos fatos relatados:**

> “Um feedback que mudou minha forma de trabalhar aconteceu na minha primeira atividade como desenvolvedora júnior. Além da dificuldade técnica, eu demorei para comunicar o risco de atraso.”

O aprofundamento sobre refinamento, etapas menores e comunicação antecipada foi melhor que a abertura. Falta recuperar **uma situação posterior em que essas mudanças ocorreram**, com ações e efeito observável. Explicar o que faria hoje não comprova a mudança aplicada na época.

Não acrescentar impacto direto no cliente se ele não ocorreu ou não foi confirmado.

### Mentoria: aderir à pergunta sobre mudança de perspectiva

A Vitória descreveu acompanhamento de uma colega, estrutura de apoio, checkpoints e evolução, reconhecendo o mérito da colega. É uma experiência útil para perguntas sobre apoio, desenvolvimento e colaboração.

A pergunta recebida, porém, era sobre alguém tê-la desafiado a pensar diferente. A resposta deixou menos claro **o que mudou no pensamento da Vitória**.

Para esse recorte, recuperar fatos que sustentem: “Eu inicialmente pensava [X]. Ao ouvir ou observar [Y], percebi [Z] e mudei minha abordagem.” Se essa mudança não aconteceu, escolher outro episódio.

Descrever dificuldades observáveis e o apoio combinado. Evitar especular sobre ansiedade ou condições pessoais da colega.

### Autoria clara com reconhecimento do coletivo

Expressões como “uma mãozinha”, “super simples” e “scriptizinho” podem esconder a contribuição individual. O ajuste não exige grandiosidade: reconhecer o coletivo e nomear com precisão o próprio trabalho.

<details>
<summary>Ver formulações propostas para explicar a contribuição</summary>

**Exemplos para adaptar aos fatos:**

> “O desenvolvimento foi mérito dela. Minha contribuição foi estruturar o acompanhamento, identificar impedimentos e ajustar o apoio.”

> “A implementação foi simples, mas a decisão exigiu identificar o gargalo e validar as condições para usar cache.”

</details>

## Plano dos próximos simulados

Priorizar os melhores episódios e as três lacunas principais. O ganho mais imediato não depende de criar muitas histórias novas ou decorar mais nomes de serviços.

| Prioridade | Treino | Sinal de evolução |
| --- | --- | --- |
| 1 | Pedido confirmado ou não após falha ou timeout. | Distingue recuperação, persistência, confirmação e repetição segura; explica o mecanismo. |
| 2 | Checkout lento, com evidências liberadas aos poucos. | Localiza a espera antes de escolher a correção e verifica a jornada após agir. |
| 3 | Episódio real de prioridades conflitantes. | Explica o que cada parte queria, sua atuação, a decisão e o resultado. |
| 4 | Aprofundamento nos casos de CMDB e cache. | Sustenta critérios, métricas, limites e participação individual. |
| 5 | Perguntas comportamentais variadas. | Escolhe a história pela pergunta e demonstra o comportamento solicitado. |

Em cada rodada, ouvir a primeira resposta antes de orientar. Registrar qual parte foi autônoma e qual surgiu após ajuda, usando os registros locais já existentes. Depois, mudar uma condição ou fazer uma nova pergunta para verificar se o raciocínio se sustenta. Os sinais acima orientam o treino, sem nota de carreira ou probabilidade de contratação.

### Três transições para observar

| Ponto de partida | Resposta a construir |
| --- | --- |
| “Eu conheço estas ferramentas.” | “Esta evidência me levou a investigar este componente.” |
| “Eu faria esse processo.” | “Neste episódio, eu fiz estas ações e ocorreu este resultado.” |
| “Essa tecnologia oferece uma capacidade.” | “Esta configuração e este mecanismo entregam esta garantia, dentro destes limites.” |

Em alguns trechos, a melhoria é organização; em outros, aderência à pergunta; e, em outros, fundamento técnico que precisa ser consolidado. Nem toda lacuna é nervosismo, e nem toda hesitação é falta de competência.

## Pendências a recuperar antes de fixar a narrativa

| Tema | O que permanece a confirmar |
| --- | --- |
| CMDB | Critérios escolhidos, validação das recomendações e significado dos aproximadamente 39 casos. |
| Expansão da automação | Se houve adoção por outras áreas ou apenas intenção futura. |
| Cache | Métrica, janela, população e recorte dos valores aproximados de 2–2,4 s e 180 ms. |
| Cache e jornada | Justificativa das sete horas de TTL, falha da invalidação e resultado da operação completa. |
| Feedback | Um episódio posterior que demonstre a mudança de planejamento e comunicação. |
| Mudança de perspectiva | O que mudou no pensamento da Vitória e qual fato provocou a mudança. |
| Desalinhamento entre equipes | Partes envolvidas, prioridades diferentes, atuação, acordo e resultado concretos. |

Essas pendências não devem ser completadas com o resultado de um simulado, uma sugestão de mentoria ou uma versão escolhida entre relatos divergentes.

## Feedback proposto para a Vitória

CMDB e cache mostram, segundo a análise, uma profissional que identifica problemas, muda de abordagem, implementa e procura evidências. A entrevista também deixou perguntas relevantes em aberto: o destino de um pedido durante uma falha, o caminho de investigação da lentidão e um episódio concreto de alinhamento entre equipes.

**Síntese proposta para a conversa de feedback:**

> “Você já tem experiências fortes e repertório técnico. Agora precisamos fazer suas respostas chegarem com mais consistência ao ponto solicitado: qual problema você entendeu, qual decisão tomou, como o mecanismo funciona e qual evidência permite concluir que deu certo.”

## Materiais de apoio

Os materiais abaixo apoiam novos ensaios. Não completam retroativamente o conteúdo desta entrevista nem resolvem as pendências factuais desta página.

- [Caso de cache — história autoral](../../leadership-principles/stories/star-02-cache-latency.md).
- [Caso de CMDB — história autoral](../../leadership-principles/stories/star-04-cmdb-ownership.md).
- [Feedback após atraso — história autoral](../../leadership-principles/stories/star-08-missed-deadline.md).
- [STAR, evidências e contribuição individual](../../leadership-principles/00-star-and-evidence.md).
- [Praticar — cenários e roteiros](../../praticar/index.html).

As referências técnicas primárias junto às explicações foram consultadas em **8 de novembro de 2026**. Verificam mecanismos gerais; não auditam resultados, autoria ou respostas da entrevista. A página não reproduz os documentos citados que não foram disponibilizados nesta edição.
