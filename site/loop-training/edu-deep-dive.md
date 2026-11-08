# Edu — fichas autorais dos novos ensaios

Material público de preparação do instrutor, sem autenticação. Não contém perfil pessoal nem registros de avaliação. Todos os cenários e números abaixo são sintéticos e não executados. Não são histórias da participante nem questões oficiais. Consulta documental em 08/11/2026; versão/escopo de cada cenário explicitados na ficha.

## V1A · migração planejada fictícia

Um cliente quer migrar uma plataforma de investimentos com perda mínima de dados e recuperação rápida. Como você esclareceria o objetivo e construiria um plano verificável?

### Premissas

Ficção independente do case real e do SIM02-B. Origem RDS PostgreSQL 16, destino PostgreSQL 16 e AWS DMS 3.5.3 ou posterior, neste desenho didático. Sem executar recursos. A aplicação confirma uma operação somente após commit no escritor. O cenário tem dados e alterações sintéticos, sem pagamentos ou ordens reais.

### Ficha reservada à condução

Objetivo: migração planejada sem perder operações cujo commit foi confirmado. Janela máxima de suspensão de novas escritas: 300 s; essa é uma meta do exercício, não garantia AWS. Comparar preparação de origem/destino, captura das alterações, validação e controle do corte. Inventário de escritores inclui API e lote de expiração. Backlog inicial 900 MB decimais, geração constante 2 MB/s, aplicação estimada 5 MB/s: redução líquida 3 MB/s, tempo ideal 300 s enquanto continuam escritas. Não confundir esse tempo de drenagem com indisponibilidade ou com latência DMS em segundos. A variação anunciada de geração 6 MB/s faz a fila crescer 1 MB/s; não há catch-up nessas hipóteses. Depois de novas escritas no destino, voltar endpoint exige tratar diferenças. Aceitar outro mecanismo se justificar consistência, parada, recuperação e limite de operação. Não exigir DMS como palavra certa. A escolha de réplica, full load/CDC ou snapshot depende de requisitos e preparação, sem atribuir ao case real. Meta adicional de recuperação após falha do corte:600 s, sujeita a ensaio e confirmação; não confundir com pausa máxima de300 s nem com o cálculo de drenagem.

### M1 — pedido semântico

Pergunta pela jornada, confirmação da operação e sistemas envolvidos.

**Informação sintética — não executada.**

Dia fictício D, UTC. Uma API consulta e atualiza recomendações sintéticas; um lote expira recomendações. Ambos escrevem no mesmo PostgreSQL 16. Leitura não confirma escrita. A aplicação só informa sucesso após commit. Não há cobrança, corretora externa ou fila no escopo inicial.

**Synthetic information — not executed.**

Fictional day D, UTC. An API reads and updates synthetic recommendations; a batch job expires recommendations. Both write to the same PostgreSQL 16 database. Reading does not confirm a write. The application reports success only after commit. External payments, brokers and queues are outside this initial scope.

Orientação: Aceitar perguntas semanticamente equivalentes sobre jornada, escritores e fronteira da confirmação. Não inferir que só a API escreve.

### M2 — pedido semântico

Pede metas mensuráveis, impacto da parada e critério de sucesso.

**Informação sintética — não executada.**

O cliente aceita suspender novas escritas por no máximo 300 s em um corte planejado. Não aceita perder operações cujo sucesso já foi confirmado. Consultas devem continuar quando o plano permitir. A equipe tem duas pessoas para operar a mudança e exige procedimento de parada e recuperação. Se o corte falhar, a meta de recuperar confirmações é600 s, a ser ensaiada; não é garantia de serviço.

**Synthetic information — not executed.**

The customer accepts pausing new writes for at most 300 seconds during a planned cutover. Operations already acknowledged as successful must not be lost. Reads should continue when the plan permits. Two people can operate the change, and they require stop and recovery procedures. If cutover fails, the target for restoring confirmations is600 seconds and must be rehearsed; it is not a service guarantee.

Orientação: Metas do cliente, não SLA de um serviço. Perguntar como medir os 300 s e comprovar operações confirmadas.

### M3 — pedido semântico

Pergunta por preparação, modo de transferência e todos os escritores.

**Informação sintética — não executada.**

A opção em estudo é full load seguido de CDC, não configurado nem executado neste treino. Origem e destino são PostgreSQL 16. Índices secundários, vínculos, usuários, permissões e objetos necessários precisam de inventário e responsáveis. API e lote podem alterar dados até a suspensão controlada que o plano definir.

**Synthetic information — not executed.**

The option under discussion is full load followed by CDC; it has not been configured or executed in this exercise. Source and target are PostgreSQL 16. Required secondary indexes, relationships, users, permissions and other objects need an inventory and owners. Both API and batch may write until the controlled pause defined by the plan.

Orientação: Não presumir preparação concluída nem validação automática habilitada. Pode defender alternativa tecnicamente válida dentro das restrições.

### M4 — pedido semântico

Pede volume pendente e taxas para estimar drenagem.

**Informação sintética — não executada.**

Para uma conta idealizada, a fila inicial é 900 MB decimais. Novas alterações entram a 2 MB/s constantes; a capacidade estimada de aplicação no destino é 5 MB/s constantes. São premissas sintéticas, não throughput medido. Desconsidere overhead somente nesta conta e explicite esse limite.

**Synthetic information — not executed.**

For an idealized calculation, the initial backlog is 900 decimal MB. New changes arrive at a constant 2 MB/s, and estimated target apply capacity is a constant 5 MB/s. These are synthetic assumptions, not measured throughput. Ignore overhead only for this calculation and state that limit.

Orientação: Resposta de referência: 900 MB ÷ (5−2) MB/s = 300 s. Aceitar ferramentas e estimativas coerentes. Nunca concluir que a fila diminui sem comparar taxas.

### M5 — pedido semântico

Pergunta como validar dados e critérios para autorizar a troca.

**Informação sintética — não executada.**

Ainda não há resultado de validação executada. O plano precisa definir comparação por chaves e valores relevantes, regras de negócio, tratamento de divergências e critérios de aceite. Contagens e tamanho em disco podem ser informações auxiliares. O recurso de validação do DMS não foi declarado como habilitado.

**Synthetic information — not executed.**

There is no executed validation result. The plan must define comparisons using relevant keys and values, business rules, discrepancy handling and acceptance criteria. Row counts and disk size can provide supporting information. DMS data validation has not been declared enabled.

Orientação: Cobrar alcance da garantia, não um produto obrigatório. Não transformar plano de validação em verificação concluída.

### M6 — pedido semântico

Pergunta por corte, falha e retorno após operações no destino.

**Informação sintética — não executada.**

Nenhum corte ocorreu neste cenário. Compare duas situações anunciadas: parar antes de novas escritas no destino e precisar recuperar depois de novas escritas nele. Há dois escritores a coordenar. Trocar o endpoint não explica, por si só, o destino dos dados produzidos depois do corte.

**Synthetic information — not executed.**

No cutover has occurred in this scenario. Compare two announced situations: stopping before new target writes and recovering after new target writes. Two writers must be coordinated. Changing an endpoint alone does not explain what happens to data produced after cutover.

Orientação: São situações conceituais anunciadas, não uma alteração oculta da causa. Propostas precisam explicitar estado, autoridade, sincronização e teste de recuperação.

## V1B · assistente financeiro fictício

Um cliente quer um assistente que informe saldos. O negócio não aceita um valor inventado nem de outra pessoa. Como você desenharia o fluxo, seus limites e a validação?

### Premissas

Cenário autoral sem relação confirmada com o trabalho real da participante. Ana e todas as contas, valores e horários são fictícios. Fluxo de consulta somente; nenhuma ferramenta executa investimentos ou pagamentos. O desenho está aberto, mas identidade, autorização e origem dos valores precisam ser explícitas.

### Ficha reservada à condução

A ferramenta autorizada devolve saldo disponível, moeda, instante de referência e identificador de conta autorizado. O contexto de identidade vem da sessão confiável; a API deve verificar a autorização, não confiar em um accountId proposto pelo modelo. A referência sintética é BRL 1250,40 às 10:00:00 UTC. O requisito da tentativa é referência de no máximo30 s. Uma tentativa às 10:02:00 com a mesma referência é obsoleta e deve ser tratada como uma condição distinta anunciada. Falha de ferramenta não autoriza o modelo a completar números. RAG e guardrails podem ajudar em aspectos limitados, mas não demonstram autorização nem atualidade da referência. Conta idealizada:30 respostas/s ×2 consultas/resposta=60 consultas/s; com duração média0,2 s porconsulta, concorrência média de chamadas=12, sob regime estável e sem filas/caching/retries nesta conta. Isso não é quota nem benchmark. Aceitar fluxos equivalentes que garantam autorização, semântica, atualidade, transformações controladas e não resposta segura.

### A1 — pedido semântico

Pergunta qual saldo, de onde vem e o que significa.

**Informação sintética — não executada.**

A operação pede saldo disponível para uso, não patrimônio, saldo contábil nem projeção. Uma API financeira autorizada fornece valor, moeda e instante de referência. O modelo não é fonte contábil e não deve reconstruir o saldo a partir de texto incompleto.

**Synthetic information — not executed.**

The request is for funds available to use, not total assets, ledger balance or a forecast. An authorized financial API provides the amount, currency and reference time. The model is not the accounting source and must not reconstruct a balance from incomplete text.

Orientação: Pedir contrato e semântica antes de escolher RAG, guardrail ou base vetorial.

### A2 — pedido semântico

Pergunta por identidade, autorização e vínculo com a conta.

**Informação sintética — não executada.**

A sessão confiável identifica a pessoa fictícia Ana e a conta de laboratório conta-A. Um identificador de conta vindo do texto ou do modelo não concede acesso. A ferramenta precisa conferir, no servidor, o vínculo autorizado antes de buscar ou devolver qualquer valor.

**Synthetic information — not executed.**

A trusted session identifies fictional user Ana and lab account account-A. An account identifier from text or model output does not grant access. The tool must verify the authorized relationship on the server before retrieving or returning any amount.

Orientação: Não exigir um serviço específico. Creditar mecanismo de identidade propagada e verificação de escopo fora do raciocínio do modelo.

### A3 — pedido semântico

Solicita um exemplo de retorno e requisitos de atualidade.

**Informação sintética — não executada.**

Retorno sintético da API: conta-A; saldo_disponivel=1250,40; moeda=BRL; referencia=10:00:00 UTC no dia D. A pergunta da primeira tentativa chega às 10:00:15 UTC. O requisito aceito no cenário permite referência de até30 s. Identifique valor, significado, moeda e atualidade na resposta.

**Synthetic information — not executed.**

Synthetic API response: account-A; available_balance=1250.40; currency=BRL; reference_time=10:00:00 UTC on dayD. The first request arrives at10:00:15 UTC. This scenario permits a reference up to30 seconds old. Preserve amount, meaning, currency and freshness in the answer.

Orientação: Idade15 s dentro do requisito. Não converter atualidade em garantia universal; o limite foi fornecido pelo cliente fictício.

### A4 — pedido semântico

Pede casos de não resposta, indisponibilidade ou dados antigos.

**Informação sintética — não executada.**

Caso de teste distinto, anunciado: a pergunta chega às 10:02:00 UTC e a ferramenta não entrega dado novo; a única referência continua10:00:00 UTC. Ela tem120 s e excede o limite de30 s. Não há autorização para completar, estimar ou apresentar esse valor como saldo atual.

**Synthetic information — not executed.**

A separate, announced test case: the request arrives at10:02:00 UTC and the tool provides no fresh data; the only reference remains10:00:00 UTC. It is120 seconds old and exceeds the30second limit. There is no permission to fabricate, estimate or present it as the current balance.

Orientação: Avaliar recusa/limitação segura e explicação ao cliente, sem fabricar um saldo. Não tratar como mudança secreta da causa.

### A5 — pedido semântico

Pergunta por volume e dados para uma conta de capacidade.

**Informação sintética — não executada.**

Conta idealizada:30 respostas/s; cada resposta requer duas consultas de ferramenta; cada consulta dura em média0,2 s. Regime estável, sem cache, retries ou filas somente para esta conta. Os valores são hipóteses de dimensionamento, não medições nem quotas de serviço.

**Synthetic information — not executed.**

Idealized calculation:30 answers/s; each answer requires two tool calls; each call takes0.2 seconds on average. Assume steady state with no caching, retries or queuing only for this calculation. These are sizing assumptions, not measurements or service quotas.

Orientação: 60 consultas/s e12 chamadas em andamento em média. Não confundir concorrência média de chamadas com latência total ou limite de produção.

### A6 — pedido semântico

Pergunta como avaliar autorização, transformações e falhas.

**Informação sintética — não executada.**

A bateria proposta deve incluir conta de outra pessoa, moeda diferente, referência antiga, ferramenta indisponível e texto que tente mudar a conta. Nenhum teste foi executado. É necessário observar o fluxo da autorização até a resposta e definir critérios para não responder.

**Synthetic information — not executed.**

The proposed evaluation must include another user’s account, a different currency, stale data, tool unavailability and text attempting to switch accounts. No test has been executed. Trace authorization through the final response and define when not to answer.

Orientação: Cobrar cobertura e resultado esperado, não a frase RAG/guardrails resolvem. Não alegar base de testes real da participante.

## V2 · incidente fictício de aquisição de conexão

A página inicial abre e a CPU do banco parece normal, mas parte dos clientes recebe timeout ao confirmar uma operação. Como você delimita o impacto e escolhe a primeira evidência?

### Premissas

Incidente novo, independente de SIM02-B e SIM03-B. PostgreSQL 16, aplicação fictícia com três instâncias A/B/C e driver node-postgres 8.x. Não há pagamento, fila nem efeito externo. Uma confirmação exige registro e mudança de negócio na mesma transação local; cada intenção tem identificador estável e unicidade no banco. Os dados abaixo são sintéticos e não foram executados.

### Ficha reservada à condução

Causa fixa: somente a instância C com a versão r17 toma clientes do pool em um caminho de validação e retorna sem liberá-los. Nenhuma transação é aberta nesse caminho. Após dez ocorrências, os dez clientes continuam emprestados ao aplicativo e aparecem idle no PostgreSQL. Não confundir idle do servidor com idleCount do pool. Pool max10, connectionTimeoutMillis1800. Na amostra R-17, pool espera1800 ms, não obtém cliente e não enviaSQL; mais200 ms de aplicação/intermediário levam aoHTTP504 em2000 ms. CPU média do banco18% porque há capacidade e outras instâncias continuam; o indicador não prova operação saudável. Página inicial não usa esse pool. A eB têm limite operacional fictício40 confirmações/s cada e atendem20/s; C recebia10/s. Redistribuir para25/s é conta sob premissas, não prova de capacidade medida. Propostas válidas: conter versão/rota com capacidade e operações em andamento verificadas; corrigir release em caminhos de saída; testar regressão. Reiniciar C pode aliviar, mas não prova correção. Reiniciar ou fazer failover do banco não corrige a devolução de clientes e pode criar risco adicional. Não rotular toda reinicialização como errada; exigir hipótese, autoridade, efeito e validação. Contrato da amostra R-17: aquisição falhou antes deSQL; não declarar isso sobre todas as tentativas sem evidência. Outra tentativa desconhecida deve ser investigada pelo identificador. Não mudar a causa se a candidata acertar rápido.

### P1 — pedido semântico

Pede impacto, origem, janela e mudanças.

**Informação sintética — não executada.**

Dia D, UTC. O aumento começou às 12:00 após r17 chegar somente à instância C. As instânciasA/B continuam confirmando; o catálogo abre nas três e não depende deste pool. A CPU média do banco está em18%. Correlação com a mudança ainda não comprova a causa.

**Synthetic information — not executed.**

DayD, UTC. The increase began at12:00 after r17 was deployed only to instanceC. InstancesA/B still confirm operations; the catalog works on all three and does not use this pool. Average database CPU is18%. Correlation with the change does not yet establish the cause.

Orientação: Não chamar p50 de média nem usar média global para descartar subconjunto afetado. Pedir recorte e operação.

### P2 — pedido semântico

Pede tempo por etapa de uma tentativa e se SQL chegou ao banco.

**Informação sintética — não executada.**

Amostra sintética R-17 em C:1800 ms aguardando adquirir cliente do pool; aquisição expira; nenhumSQL é enviado; outros200 ms de tratamento e resposta completam2000 ms atéHTTP504. Não houve conexão disponibilizada nem início de transação nesta tentativa. Esta é uma amostra, não todas as operações.

**Synthetic information — not executed.**

Synthetic sampleR-17 on C:1800 ms waiting to acquire a pool client; acquisition times out; noSQL is sent; another200 ms of handling and response produceHTTP504 after2000 ms. No client was obtained and no transaction began for this attempt. This is one sample, not every operation.

Orientação: Fixar connectionTimeoutMillis1800, não simular timeout TCP nem executarSQLretroativamente. Exigir alcance de cada evidência.

### P3 — pedido semântico

Pede pool, sessões e comparação com instâncias saudáveis.

**Informação sintética — não executada.**

Em C: max=10, totalCount=10, idleCount=0 e waitingCount>0. No PostgreSQL, os dez clientes aparecem idle e sem transação aberta. EmA/B há clientes disponíveis e consultas próximas de25 ms. CPU normal não significa que todas as solicitações alcançam o banco.

**Synthetic information — not executed.**

On C: max=10, totalCount=10, idleCount=0 and waitingCount>0. PostgreSQL shows the ten clients as idle with no open transaction. A/B have available clients and queries around25 ms. Normal CPU does not mean every request reaches the database.

Orientação: Cliente idle no banco pode continuar emprestado no pool. Essa aparente contradição é parte fixa e explicável da ficha.

### P4 — pedido semântico

Pergunta pelo ciclo de vida das conexões e evidência da mudança.

**Informação sintética — não executada.**

O caminho de validação de r17 adquire um cliente e retorna antes de devolvê-lo ao pool. O registro sintético de aquisições/devoluções e a revisão do caminho mostram dez aquisições sem devolução em C. Esse caminho não inicia transação. Não há evidência de defeito no protocolo TCP ou no PostgreSQL.

**Synthetic information — not executed.**

The r17 validation path acquires a client and returns before releasing it to the pool. Synthetic acquisition/release records and code review show ten acquisitions without release on C. This path does not begin a transaction. There is no evidence of a TCP protocol or PostgreSQL defect.

Orientação: Evidência de mecanismo, não só coincidência de deploy. Aceitar pedido semanticamente equivalente sobre recursos não devolvidos.

### P5 — pedido semântico

Pede restrições para contenção e estado de operações em andamento.

**Informação sintética — não executada.**

Não há mudança executada no exercício. A/B atendem20 confirmações/s cada; C recebia10/s. O limite operacional fictício aprovado é40/s por instância. Antes de retirar C, verificar capacidade, tráfego, estado das tentativas e autorização. R-17 não chegou aoSQL; não há essa conclusão para todos os identificadores.

**Synthetic information — not executed.**

No change has been executed in this exercise. A/B each handle20confirmations/s; C received10/s. The approved fictional operating limit is40/s per instance. Before removingC, verify capacity, traffic, attempt states and authorization. R-17 did not reachSQL; that conclusion does not cover every identifier.

Orientação: Conta25/s por remanescente é hipótese para plano, não benchmark. Não inferir rollback de toda operação só peloHTTP504.

### P6 — pedido semântico

Pede critérios de recuperação, testes de regressão e análise posterior.

**Informação sintética — não executada.**

Somente expectativas de testes narrados, não resultados executados: novas confirmações devem obter cliente, concluir operação e devolver o cliente também nos caminhos de erro. Acompanhar espera, erros, taxa de devolução e estado confirmado por intenção. Preservar trilha de operações desconhecidas. Corrigir o caminho defeituoso e verificar uma variação que não passe pela mesma validação.

**Synthetic information — not executed.**

Narrated test expectations only, not executed results: new confirmations should acquire a client, finish the operation and release the client on error paths too. Check waiting, errors, release rate and confirmed state by intent. Preserve unresolved operations. Fix the defective path and test a variation that does not use that same validation path.

Orientação: Liberar após a candidata propor contenção segura e critérios de validação. Não usar teste esperado como prova real de recuperação.

## Fontes e limites

As taxas são premissas autorais, não indicadores coletados. Full load/CDC precisa de preparação; sua presença no desenho não comprova configuração. Guardrail não demonstra que uma referência é autorizada/atual: essa é uma inferência arquitetural a partir do escopo documentado. O driver trata devolução de clientes; idle no servidor não equivale a cliente livre no pool.

- [PostgreSQL como origem no DMS](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.PostgreSQL.html)
- [Monitoramento e unidades do DMS](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Monitoring.html)
- [Validação dos dados DMS](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html)
- [Cutover e rollback](https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-migration-cutover/cutover-stage.html)
- [Autorização de ferramentas fora do raciocínio do modelo](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsec02-bp01.html)
- [Alcance do grounding contextual](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-contextual-grounding-check.html)
- [Contrato do pool node-postgres](https://node-postgres.com/apis/pool)
