# Revisões explícitas das anotações

As notas são a base do estudo, mas misturam conteúdo didático, relato de experiência, interpretação e dados de época. A tabela registra ajustes para **não substituir silenciosamente** o material de origem por uma versão diferente.

Legenda: **correção técnica** = uma afirmação precisa ser reformulada; **qualificação** = o conteúdo pode fazer sentido no contexto, mas não deve ser universalizado; **pendente** = as fontes usadas não confirmam a afirmação.

## Processo, cultura e preparação

| Ponto das notas | Classificação | Tratamento no repositório |
|---|---|---|
| N03, trecho sobre one-way/two-way door | Correção | Os rótulos estão invertidos nesse trecho: two-way é reversível; one-way é difícil de reverter. N02 apresenta a distinção corretamente. [S06](README.md#s06) |
| N02 traduz Best Employer como melhor funcionário | Correção de tradução | Employer é empregador. A reflexão considera ambiente de trabalho e desenvolvimento, não ser o empregado mais produtivo. [S02](README.md#s02) |
| N02 diz que respostas sem STAR ficam necessariamente atrás | Qualificação | Usar STAR como apoio recomendado à clareza; não afirmar regra automática de seleção que as fontes consultadas não estabelecem. [S04](README.md#s04) |
| Quantidade de histórias e duração máxima da resposta | Qualificação | Há sugestões diferentes nas notas. O plano propõe inventário inicial e ensaio, não um número obrigatório de narrativas/minutos. |
| N01 manda enfatizar “eu” e não dividir créditos | Refinamento | Explicitar ações individuais sem apagar colaboração ou atribuir a si resultados alheios. O próprio material também exige honestidade. |
| N05 sugere excluir exemplos que não pintem positivamente | Refinamento | Não excluir toda falha. O próprio N01 discute assumir erros, mostrar recuperação e aprendizado. |
| N03 diz que história não pode estar em andamento | Qualificação | Um episódio já ocorrido pode ter resultado observado dentro de um projeto maior ainda em andamento; não apresentar previsão como conquista. |
| “70% de informação” | Qualificação | Heurística contextual de velocidade; não regra para ignorar controles ou liberar efeitos irreversíveis. [S06](README.md#s06) |
| L4 = júnior, L5 = pleno e assim por diante | Pendente para esta vaga | Referência informal das notas. Não tratamos equivalência com títulos brasileiros como regra universal. A página da vaga consultada não publica L5. |

## Fundamentos técnicos

| Ponto das notas | Classificação | Tratamento no repositório |
|---|---|---|
| REST “inteiramente baseado em HTTP” | Correção de precisão | REST é um estilo arquitetural; HTTP é o uso comum nas APIs web. Diferenciar restrições de REST de semântica HTTP. [T01](README.md#t01), [T02](README.md#t02) |
| Stateless entendido como servidor não guardar informação alguma | Correção | Não depender de contexto de sessão implícito entre requisições não proíbe estado de negócio persistente. [T01](README.md#t01) |
| API tratada somente como software ou JSON/XML | Refinamento | Interface/contrato e implementação são conceitos diferentes; formato da representação não define sozinho a arquitetura. |
| SQL necessariamente ACID e NoSQL incapaz de ACID, em N04 | Correção | DynamoDB oferece transações ACID. Modelo de dados, contrato de transação e configuração devem ser examinados separadamente. [T04](README.md#t04) |
| ACID = escala apenas vertical; BASE = apenas horizontal | Correção | A classificação não determina, sozinha, a estratégia de escala; investigar acesso, mecanismo e limites do banco. Não usar essa tabela como regra. |
| Isolamento sempre obriga toda transação a esperar a anterior | Correção | MVCC e níveis de isolamento mostram outras formas de concorrência. Não há essa serialização universal. [T06](README.md#t06), [T07](README.md#t07) |
| CAP como escolha simples e permanente de quaisquer dois | Correção de precisão | Delimitar a partição e os significados de consistência/disponibilidade. Não é uma escolha de SQL versus NoSQL, e o C de ACID é distinto. [T05](README.md#t05) |
| Durabilidade como ausência de qualquer perda sob qualquer falha | Qualificação | O compromisso depende do modelo de falhas, configuração e recuperação; não dispensa backup e testes. [T23](README.md#t23) |
| Microserviços como evolução necessariamente superior | Qualificação | Fronteiras e autonomia podem ajudar; distribuição também introduz operação e consistência. Escolher pelo problema, não pela época. |
| Assincronia garante disponibilidade e remove acoplamento | Correção de precisão | Reduz dependências temporais em alguns caminhos, mas mantém contratos, backlog e falhas. Filas podem entregar novamente. [T20](README.md#t20) |
| Saga como transação distribuída que desfaz tudo | Correção | Há transações locais e compensações; isolamento global não surge automaticamente. [T17](README.md#t17) |
| Serverless sempre mais barato ou economia fixa do exemplo | Qualificação | Resultado de um exemplo não vira lei de custo. Medir workload, operação, capacidade e risco. |

## Como acrescentar uma revisão

Registre a afirmação original com sua origem, a dúvida, a fonte primária consultada e o novo limite. Não apague a proveniência nem apresente uma interpretação nova como transcrição fiel da fonte.

Este registro não declara que todo o material foi auditado exaustivamente. Ele cobre os pontos que afetam o conteúdo atual do repositório.

## Revisões desta preparação

### AWS App Mesh

**Antes:** materiais de referência apresentavam o App Mesh como a opção AWS de service mesh.

**Agora:** o material registra que o App Mesh foi descontinuado em 30/09/2026 e cita ECS Service Connect, Amazon VPC Lattice e Istio no EKS.

**Motivo:** fim de suporte anunciado pela AWS ([T34](README.md#t34)).

**Impacto:** `technical-knowledge/system-design/01-arquitetura-de-servicos.md` (Ambassador e Service mesh).

### Envoy e Istio

**Antes:** a explicação do padrão Ambassador atribuía ao próprio Kubernetes o uso do Envoy.

**Agora:** o Envoy aparece como o proxy que service meshes como o Istio colocam ao lado de cada serviço.

**Motivo:** o Kubernetes não traz o Envoy por padrão; é a malha que o usa como data plane ([T35](README.md#t35)).

**Impacto:** `technical-knowledge/system-design/01-arquitetura-de-servicos.md` (Ambassador e Service mesh).

### Hystrix

**Antes:** a biblioteca Hystrix era citada como implementação atual de circuit breaker.

**Agora:** o material diz que a Netflix popularizou o padrão com a Hystrix, hoje em modo de manutenção, e indica a Resilience4j como alternativa comum.

**Motivo:** status declarado no próprio repositório do projeto ([T36](README.md#t36)).

**Impacto:** `technical-knowledge/system-design/04-resiliencia-e-isolamento.md` (Circuit Breaker).

### Texto do LP 16

**Antes:** Success and Scale Bring Broad Responsibility aparecia em versão resumida, sem os efeitos secundários das ações e sem “deixar as coisas melhores do que as encontraram”.

**Agora:** o arquivo traz o texto oficial completo, em tradução própria, e a explicação de Andy Jassy.

**Motivo:** fidelidade ao texto oficial ([S02](README.md#s02), [S07](README.md#s07)).

**Impacto:** `leadership-principles/16-success-and-scale-bring-broad-responsibility.md`.

### Sínteses autorais no lugar de material de terceiros

**Antes:** guias de entrevista, partes dos princípios e listas de perguntas seguiam de perto anotações privadas baseadas em material de terceiros.

**Agora:** esses trechos são sínteses autorais, com exemplos fictícios identificados, perguntas próprias e textos oficiais traduzidos diretamente da fonte pública.

**Motivo:** o repositório é público e não republica material de terceiros.

**Impacto:** `interview/` (guias e roteiros de simulação), `leadership-principles/` (texto do princípio, “O que demonstrar”, perguntas de entrevista, exemplos STAR e guia STAR), `technical-knowledge/fundamentals/00-computacao-em-nuvem.md`, `role/solutions-architect-role.md` e as perguntas de entrevista de F01, F03, F04, F05, F06 e F12.
