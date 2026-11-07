# Conversa técnica — Vitória e Cleber

Aprendizados e próximos passos após a conversa: esclarecer o problema antes da tecnologia, sustentar decisões com evidências e explicar o que cada verificação permitiu — e não permitiu — concluir.

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="mensagem-de-abertura" aria-hidden="true"></div>
<div id="agenda--60-minutos" aria-hidden="true"></div>
<div id="combinado-de-condução" aria-hidden="true"></div>
<div id="cenário-fictício-compartilhado" aria-hidden="true"></div>

## Contexto e foco da revisão

A conversa já aconteceu. Esta página substitui a pauta de preparação por uma síntese didática dos temas recuperados na análise fornecida. Não é transcrição, avaliação oficial da AWS ou comprovação do histórico de um projeto. Perguntas e exemplos abaixo são propostas de revisão; informações pessoais e números ainda a confirmar ficam em material privado.

A pergunta que orienta o próximo estudo é: **consigo explicar o que fiz, por que fiz naquele contexto, o que verifiquei e o que essa verificação não me permitia garantir?**

Não é necessário acrescentar mais nomes de padrões e serviços à apresentação. É mais útil tornar visíveis necessidade, decisão, risco, mecanismo, validação e limite.

## Descobrir o problema antes de dimensionar a solução

Siga a sequência **objetivo e jornada → regras do negócio → restrições e escala → alternativas técnicas**. Perguntar volume, picos ou crescimento é útil quando o contexto permite entender por que esses números importam.

Para uma loja fictícia que está começando, perguntas de descoberta seriam:

- O que pretende vender, para quem e como a operação funciona hoje?
- Como estoque, confirmação do pagamento e aceitação da compra devem funcionar?
- O que precisa estar disponível no primeiro lançamento?
- Qual consequência é mais grave: atrasar uma confirmação, vender sem estoque ou perder uma compra?
- Com essas regras e restrições, qual volume precisamos estimar e quais alternativas devemos comparar?

Essas perguntas não reproduzem uma entrevista. Elas ajudam a ligar uma resposta técnica ao problema que a pessoa cliente precisa resolver.

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="0520--uma-unidade-duas-compras" aria-hidden="true"></div>

## Justificar os dados pelas operações e regras

“Há relacionamentos, joins e necessidade de consistência” é um começo, mas ainda falta dizer **qual domínio**, **quais operações** e **quais regras**. Pergunte o que precisa ser alterado junto, quais consultas são importantes e quais restrições tornam a escolha adequada.

Um banco relacional pode ser apropriado sem ser a única alternativa possível. A defesa deve mostrar a relação entre requisito e decisão, não trocar de tecnologia automaticamente diante de um contraponto.

A [trilha de transações e ACID](../../../technical-knowledge/01-fundamentals/acid/README.md) ajuda a revisar atomicidade, concorrência e idempotência. Esses mecanismos têm responsabilidades diferentes; o uso de uma transação não inventa as regras da compra.

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="3553--a-página-abre-mas-o-checkout-está-lento" aria-hidden="true"></div>

## Troubleshooting: investigar o trabalho executado

Conecte **sintoma do cliente → operação afetada → espera ou consumo → instrução ou dependência → hipótese → contenção → validação da jornada**. Não substitua uma investigação por uma lista de métricas ou comandos.

| Observação a solicitar | Pergunta que precisa responder | Limite |
|---|---|---|
| Tempo por etapa da requisição | A consulta começou ou a aplicação ainda espera uma conexão? | Tempo de aquisição de conexão não é execução SQL |
| Carga, eventos de espera e principais SQLs | O trabalho está consumindo CPU, aguardando recurso ou competindo com outra atividade? | CPU normal não encerra a investigação |
| Frequência, volume processado e plano quando disponível | É uma execução custosa, repetição muito frequente ou contenção? | Uma amostra ou um plano não representa automaticamente toda a carga |
| Mudança proposta e observação posterior | A ação reduz impacto ou trata a causa? Como verificar o efeito? | Restabelecer atendimento não comprova correção permanente |

A documentação atual de [CloudWatch Database Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Database-Insights-Database-Instance-Dashboard.html) descreve investigação de carga por dimensões como SQL e esperas; planos dependem da engine e do suporte disponível. Não se presume que essa instrumentação existia no ambiente discutido.

Aumentar capacidade precisa de hipótese, risco, efeito esperado e verificação. A [documentação do RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ModifyInstance.Settings.html) informa indisponibilidade para mudanças de classe da instância. Isso não torna a mudança proibida nem a primeira ação obrigatória de todo incidente.

## Aplicativo acessível não significa jornada disponível

No exemplo fictício da Loja Horizonte, o catálogo pode abrir enquanto a confirmação de pedidos está interrompida. O diagnóstico deve identificar a capacidade de negócio afetada, a população e a consequência, além da condição de infraestrutura.

Para observabilidade de negócio, reconstrua **risco identificado → indicador necessário → equipe responsável → mecanismo implementado → ação que passou a ser possível**. Pergunte quem recebia o sinal, qual antecedência era necessária, se o acompanhamento entrou em uso e que evidência demonstra sua utilidade.

A ferramenta entra como parte do mecanismo, não como resultado por si só. Uma possibilidade de alerta também não deve ser narrada como uma prevenção já observada.

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="2035--a-compra-retornou-timeout" aria-hidden="true"></div>

## Migração: delimitar a validação e a recuperação

Uma verificação só sustenta aquilo que examinou. Quantidades de linhas iguais não demonstram valores iguais; tamanho dos dados também não é uma comparação completa. Reconstrua tabelas, campos, chaves, critérios, regras de negócio e aceitação que foram realmente verificados.

### Quatro perguntas para fechar a sustentação

1. **Alternativa de snapshot:** quais escritas estavam interrompidas, em qual instante e por qual motivo concreto a opção não atendia? Não concluir que seria melhor ou pior sem essas premissas. A restauração de um [snapshot do RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_RestoreFromSnapshot.html) cria uma nova instância; a adequação depende do contexto.
2. **Equivalência dos dados:** houve reconciliação por chave e valores, amostragem ou somente contagem? A [validação do DMS](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html) precisa estar habilitada e ser aplicável, tem condições e limitações e consome recursos. Ter usado DMS não comprova que esse recurso foi utilizado, concluído ou suficiente.
3. **Retorno após novas escritas:** o que acontece com dados existentes somente no destino se a aplicação voltar à origem? A [orientação de cutover](https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-migration-cutover/cutover-stage.html) distingue esse caso de um retorno sem transações novas. Trocar endpoint ou feature flag não reconcilia os dados sozinho.
4. **Desativação da origem:** quais ciclos e processos críticos foram cobertos, quais testes foram aceitos e quem autorizou encerrar a contingência? Um prazo isolado não explica o critério de encerramento.

A resposta deve representar o que aconteceu. Se as verificações foram limitadas, delimite a conclusão e apresente uma reconciliação mais ampla como melhoria futura, sem afirmar que ela já ocorreu.

## Recuperar episódios sem misturar os resultados

Uma negociação de manutenção pode ser um episódio diferente de uma recuperação emergencial. Para demonstrar influência, recupere prioridade concorrente, participantes, resistência ou dúvida, evidência apresentada, acordo e o que foi executado. O tempo concedido para trabalhar é um possível resultado da negociação; não explica, sozinho, as ações que a produziram.

Colaboração com outra área também exige autoria delimitada: quem identificou a necessidade, definiu o indicador, implementou e observou o uso? Não atribua protagonismo, emoção ou discordância a alguém a partir de um trecho ambíguo.

Separe **impacto da interrupção**, **resultado da recuperação** e **melhorias posteriores de manutenção**. Para qualquer número, confirme definição, população, período, fonte, grau de certeza e permissão de divulgação. Projeção de escala não é carga efetivamente atendida; possibilidade futura não é adoção realizada.

Use o [mapa de episódios](../../../templates/episode-map.md) e a [ficha STAR](../../../templates/star-story.md) em cópia privada, sem converter uma hipótese de história em experiência confirmada.

## Apresentar a decisão sem reescrever o passado

| Campo | Como delimitar a explicação |
|---|---|
| Análise e decisão realizadas na época | Naquele momento, considerei… |
| Reflexão construída depois | Revendo essa decisão, percebo… |
| Melhoria de uma próxima execução | Em um próximo caso, acrescentaria… |

Não transforme uma avaliação informal em análise formal nem uma justificativa posterior em ação passada. Para discutir risco, explique impacto, alcance, recuperabilidade, incerteza e autoridade de decisão, em vez de adotar apenas o rótulo “baixo”.

A sequência para cada decisão importante pode ser **consequência para a jornada → motivo da escolha → mecanismo essencial → validação → limitação**. Ajuste os detalhes à audiência, preservando a sustentação técnica. Descreva condições observadas do ambiente sem transformar a apresentação em julgamento de pessoas.

No [C4, contexto](https://c4model.com/diagrams/system-context) privilegia pessoas e sistemas e serve a públicos amplos. O [diagrama de containers](https://c4model.com/diagrams/container) já mostra aplicações, armazenamentos, responsabilidades e escolhas tecnológicas, principalmente para público técnico; “container” não exige Docker.

Ao mencionar [Well-Architected](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), diferencie usar pilares como organização, consultar práticas, executar uma revisão estruturada e utilizar o Tool. O framework apoia a discussão de decisões e melhorias; não é um selo automático de conformidade.

## Revisões técnicas para sustentar decisões

As ressalvas abaixo verificam mecanismos. Não são atribuições de erros a falantes de uma transcrição nem uma receita de adicionar padrões à arquitetura.

| Tema | Distinção que precisa ficar clara |
|---|---|
| Atomicidade, concorrência e idempotência | Atomicidade agrupa mudanças integralmente; proteger compras diferentes contra disputa e reconhecer repetição da mesma intenção são problemas distintos. [PostgreSQL 18](https://www.postgresql.org/docs/18/tutorial-transactions.html) · [Idempotência](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) |
| CQRS | Separa modelos de comando e consulta; não exige dois microsserviços ou dois bancos. A complexidade precisa se justificar. [Fowler](https://martinfowler.com/bliki/CQRS.html) |
| Retry e circuit breaker | Retry repete; circuit breaker pode interromper novas chamadas diante de falhas recorrentes e verificar recuperação. Quantidade de tentativas não define o segundo mecanismo. [Retry](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html) · [Circuit breaker](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/circuit-breaker.html) |
| Mensageria e reconstrução | Ter eventos ou um broker não comprova que seja possível reconstruir a base. Event Sourcing exige histórico e mecanismos apropriados para reaplicar mudanças. [Fowler](https://martinfowler.com/eaaDev/EventSourcing.html) |
| TTL curto | Pode ser útil se houver reutilização no intervalo e desatualização aceitável. O benefício depende do acesso real e precisa ser medido. [AWS Caching](https://aws.amazon.com/caching/best-practices/) |
| Detecção de anomalias | Compara a métrica a uma faixa esperada aprendida; não garante antecipar qualquer esgotamento ou falha da jornada. [CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Anomaly_Detection.html) |

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="perguntas-para-atravessar-os-três-blocos" aria-hidden="true"></div>
<div id="5360--fechamento" aria-hidden="true"></div>

## Próximas revisões, em ordem

1. **Sustentação da migração:** uma ficha factual de escolha, snapshot, validação, troca, recuperação e desativação, com evidências e limites.
2. **Negociação da manutenção:** um episódio próprio com ações individuais, acordo e resultados, separado da recuperação.
3. **Troubleshooting por evidências:** refazer a [abertura existente de checkout lento](../04-troubleshooting/01-checkout-lento/candidato.md), solicitando dados conforme as hipóteses. Consulta, pool e dependência externa são etapas diferentes; não pressupor a causa.
4. **Números utilizáveis:** separar métricas confirmadas das afirmações que precisam ser qualificadas ou retiradas.
5. **Conceitos pontuais:** explicar os mecanismos acima e responder a uma variação de cenário, sem abrir uma revisão extensa de todos os padrões.

ACID, resultado desconhecido e repetição segura continuam disponíveis na [trilha existente](../../../technical-knowledge/01-fundamentals/acid/README.md). Uma conversa de mentoria não equivale, por si só, à execução e conclusão de todos esses exercícios.

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="acessos-da-sessão" aria-hidden="true"></div>

## Apoios e fontes

Esta síntese usa a análise fornecida pelo usuário; a transcrição integral não foi recebida para conferência nesta rodada. As referências técnicas foram consultadas em **7 de novembro de 2026**. Elas verificam conceitos e condições documentadas, não o histórico dos projetos. Nenhum cenário ou teste AWS foi executado para produzir a página.

[← Praticar](../../../praticar/index.html) · [Fundamentos](../../../technical-knowledge/01-fundamentals/README.md) · [Registro de evidências e feedback](../../../templates/mock-interview-feedback.md)

O apoio de condução e as perguntas de revisão permanecem no [acesso do instrutor](../../../praticar/index.html#instrutor). Registros preenchidos e dados internos devem permanecer privados.
