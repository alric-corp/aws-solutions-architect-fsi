# Simulado 6 — Material do instrutor

Entregue somente [candidato.md](candidato.md). Este é um incidente **inteiramente fictício**. Métricas, logs, decisões possíveis e resultados são **dados sintéticos para treinamento**, no dia fictício D em UTC. Nenhuma informação representa experiência de uma pessoa ou empresa. A migração é um aprofundamento opcional de decisão; não é a solução obrigatória. Use o [guia](../guia-do-instrutor.md).

## 1. Competências avaliadas

Diagnosticar capacidade por múltiplos sinais; diferenciar causa e correlação; explicar degradação parcial; comparar contenção, correção, capacidade e migração; reconhecer bloqueio de mudança; preservar integridade e autoridade de escrita. Na [rubrica](../rubrica.md), observar decisões seguras e validação antes e depois da mudança de destino.

## 2. Estado real e premissas do cenário

RDS PostgreSQL 16, DB instance Multi-AZ com um standby, 8 GiB de memória. API e importadores usam o mesmo escritor privado; não há cache de aplicação ou read replica explicando as consultas que continuam funcionando. Consultas simples indexadas usam pouco recurso e frequentemente encontram páginas nos buffers; cargas e atualizações mais pesadas executam joins e ordenações.

A concorrência de importação aumentou de 4 para 40 às 18:00. Sessões concorrentes e múltiplos operadores por consulta elevam a demanda de memória; erros de alocação e paginação aparecem depois disso. Não há evidência principal de lock ou saturação de disco no recorte. A pressão de memória por workload concorrente é a causa principal sustentada pelo conjunto de cartões, não pelo FreeableMemory isolado.

Separadamente, o pipeline de infraestrutura falha na validação de um parâmetro obsoleto após atualização do módulo; não chegou a chamar a API de alteração do RDS. Isso bloqueia o caminho habitual de redimensionamento, mas não comprova falha do serviço RDS ou falta de permissão na conta.

Escritores conhecidos: API de atualizações, workers de importação e job de manutenção agendado. Logs SQL e Enhanced Monitoring já estão habilitados no cenário; nenhum acesso ao sistema operacional do RDS é necessário. Há procedimento aprovado para pausar importadores e reduzir concorrência; mudanças de banco e migração requerem nova decisão dos responsáveis.

## 3. Linha do tempo

| Horário sintético | Evento |
|---|---|
| 17:40–17:55 | Referência do workload com quatro importadores |
| 18:00 | Concorrência sobe para quarenta |
| 18:04 | Crescem paginação e erros nas operações pesadas |
| 18:06 | Pipeline de ajuste de capacidade falha antes da chamada ao serviço |
| 18:08–18:10 | Coleta de investigação; consultas simples ainda funcionam |
| Após decisão | Cartões de contenção e, se escolhido, planejamento de migração |

O ramo de migração representa uma fase posterior com preparação e ensaio; não insinuar que uma cópia de dezenas de GiB termina nos minutos desta linha do tempo.

## 4. Evidências sintéticas progressivas

**E1 — Jornada e erros (18:08–18:10).** Consulta de produto por chave continua em p95 de 80 ms. Na referência de 17:40–17:55, atualizações pesadas tinham p95 de 200 ms e 0,5% de falhas; lotes tinham menos de 1% de falhas. Agora, atualizações pesadas têm 18% de falhas; lotes de importação têm 70% de falhas. API traduz erros de banco em indisponibilidade temporária, sem confirmar mutações que não tiveram sucesso. Amostra sanitizada: `operation=import_batch sqlstate=53200 error=out_of_memory`; não há evidência de erro de disco cheio ou autenticação. Mutações de resultado desconhecido precisam de reconciliação própria. A associação do código à condição está na [tabela SQLSTATE do PostgreSQL 16](https://www.postgresql.org/docs/16/errcodes-appendix.html), consulta em 01/11/2026; a ocorrência acima é sintética.

**E2 — Recursos e limites.** Valores representam medianas de pontos de 60 s nas duas janelas, salvo indicação. Bytes foram convertidos para GiB; latências de I/O, de segundos para ms. São unidades de apresentação, não unidades nativas diferentes do CloudWatch.

| Sinal | 17:40–17:55 | 18:08–18:10 |
|---|---|---|
| FreeableMemory | 2,4 GiB | 0,12 GiB |
| SwapUsage | 0,05 GiB | 1,4 GiB, aumentando |
| Atividade de paginação, coleta Enhanced Monitoring normalizada | Próxima de zero | Crescente, coincidente com erros |
| DatabaseConnections | 80 | 220; limite configurado 300 |
| CPUUtilization | 35% | 68% |
| ReadLatency / WriteLatency | 4 / 5 ms | 5 / 8 ms |
| DiskQueueDepth | 0,4 | 0,8 |
| FreeStorageSpace | 90 GiB | 89 GiB |

Esses sinais não provam capacidade de I/O suficiente para qualquer carga futura; apenas não apontam saturação de disco como explicação principal deste recorte. Swap ocupado sozinho não mede taxa de paginação. A coleta gerenciada inclui entrada/saída de swap: [Enhanced Monitoring](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Monitoring-Available-OS-Metrics.html), consulta em 01/11/2026.

**E3 — Workload e mudanças.** Importadores 4 → 40; mesmos dados e consultas. `work_mem` configurado em 64 MiB por sessão, com vários operadores de memória por consulta, não um teto global por conexão. Há 40 consultas de importação pesadas concorrentes. Logs e análise de planos já coletados mostram ordenações e joins; espera por locks é pequena e não explica os erros. Não executar `EXPLAIN ANALYZE` de uma mutação em produção para obter evidência. A correlação temporal favorece a hipótese, mas o teste controlado da concorrência a fortalece.

**E4 — Caminho de mudança.** Pipeline retorna `validation_error: unsupported input after module interface change`, antes de qualquer solicitação ao RDS. Plano revisado de correção do parâmetro ainda precisa passar por validação e aprovação. Há alternativa de mudança emergencial documentada com plataforma, dados e responsável pelo incidente; ela não autoriza uso improvisado de console, privilégios extras ou custos sem análise. O procedimento de aplicação permite reduzir importadores sem mudar infraestrutura.

**E5 — Contenção condicional.** Se propuser pausar novos lotes, limitar concorrência e retomar gradualmente: após drenar lotes, dez minutos com quatro importadores resultam em zero novos erros 53200, FreeableMemory 1,9 GiB, paginação perto da referência, consultas p95 85 ms e atualizações p95 210 ms. SwapUsage ainda é 1,2 GiB; sua permanência não invalida sozinha a recuperação. Backlog de importação existe e deve ser retomado sem reproduzir saturação. Isso sustenta a relação com concorrência, mas não demonstra que todas as consultas estejam otimizadas ou que a capacidade futura esteja dimensionada.

### Ramo M — Somente se discutir migração

**M1 — Inventário e viabilidade.** Migração proposta: homogênea de **RDS PostgreSQL 16 para RDS PostgreSQL 16**, mesma Região, por tarefa **AWS DMS provisionada de full load + CDC**. São 12 tabelas, 80 GiB, todas com PK inteira, tipos comuns e sem LOBs, partições ou extensões especiais no escopo. Há índices secundários, FKs, roles e sequências a preparar e validar separadamente. Premissas a comprovar antes de executar: versões menores e versão DMS compatíveis, capacidade no destino e no replicador, rede privada, TLS validado, permissões mínimas, logs retidos e espaço para WAL.

Na origem atual, replicação lógica ainda não está habilitada. Habilitá-la exige alteração e reinício aprovado; o pipeline quebrado também precisa ser resolvido ou substituído por procedimento autorizado. Logo, CDC **não está pronto para uso imediato**. Full load sem CDC só serviria com escritores suspensos durante todo o período necessário e janela aceita. CDC-only exigiria carga inicial consistente e posição de início comprovada, que não existem neste estado. Migração nativa com janela adequada também pode ser mais simples.

**M2 — Ensaio posterior incompleto.** Somente após a candidata explicitar preparação, aprovação e ensaio, avance narrativamente: replicação lógica habilitada, destino e tarefa preparados, 12/12 tabelas com full load concluído; 11 validadas, uma pendente; `CDCLatencyTarget=2 s` no ponto observado; sequência do destino ainda abaixo do maior ID copiado. Escritores continuam ativos na origem. Esses dados **não autorizam cutover (transferência controlada do destino autoritativo)**: há validação pendente, atraso, sequência incorreta e nenhuma suspensão dos escritores.

**M3 — Portão condicional de transferência.** Se definir congelamento de todos os escritores, drenagem de transações, isolamento da autoridade antiga, sincronização final e validação: cartão posterior declara fencing (bloqueio verificável de escritas na origem antiga) para as três classes de escritores, ponto final de alterações aplicado no destino e ausência de pendências/erros nas 12 tabelas. Contagens, verificações de conteúdo e invariantes de negócio conciliadas; schema, permissões, sequências e testes em ambiente de ensaio aprovados; leitura canário no destino passa. Nenhuma escrita de negócio no destino ocorreu ainda. A candidata deve explicar quando parar o aplicador DMS, transferir a autoridade, renovar conexões e autorizar a primeira escrita. Depois dessa escrita, usar as regras da seção 9; não anunciar reversibilidade simples.

## 5. Solicitação → evidência → conclusão e limite

| Solicitação da candidata | Evidência fornecida | O que permite concluir | O que não permite concluir |
|---|---|---|---|
| Quais operações falham e quais retornos o cliente recebe? | E1 | Há degradação parcial com falha de alocação em operações pesadas | Leituras funcionam porque há réplica ou cache externo |
| Memória, swap, CPU, conexões, I/O e limites mudaram? | E2 | Há múltiplos sinais compatíveis com pressão de memória | FreeableMemory baixo sozinho prova causa ou upgrade específico |
| Qual mudança, workload, consulta ou lock coincide? | E3 | A concorrência é hipótese causal forte | Multiplicar work_mem por conexões mede RAM exata usada |
| O pipeline falha onde? Há contenção sem redimensionar? | E4 | O caminho de mudança está bloqueado antes do serviço | A instância não pode ser modificada por nenhum caminho autorizado |
| O que acontece ao limitar a carga? | E5, condicional | Contenção melhora erros e jornada | Backlog sumiu ou não será preciso dimensionar capacidade |
| O que existe, quem escreve e o DMS está pronto? | M1 | Migração exige preparo e outra aprovação | DMS é atalho imediato para pipeline quebrado |
| Full load terminou: já posso trocar? | M2, após preparo narrado | Ainda faltam condições de transferência | “Running”, lag baixo ou uma validação verde bastam |
| Como comprovar sincronização e autoridade única? | M3, condicional | Há portão de transferência com escopo definido | Novas escritas podem ser descartadas ao voltar ao endpoint antigo |

## 6. Raciocínio esperado e alternativas válidas

Começar pela jornada e pelos erros, confrontar memória com paginação, conexões, consultas, locks e I/O. Formular previsão: reduzir concorrência deve diminuir demanda e erros; se isso não ocorrer, investigar outras causas. E5 fortalece o mecanismo e permite conter o incidente sem uma migração apressada.

Comparar caminhos: limitar carga preserva atendimento, mas atrasa importações; otimizar consultas pode reduzir recurso por operação e requer teste; ajustar capacidade precisa de previsão e validação de custo/indisponibilidade; reparar o pipeline recupera a capacidade de operar; migrar adiciona cópia, sincronização e mudança de autoridade. Aceitar qualquer caminho sustentado por evidência e restrições, inclusive manter o banco atual após conter a carga e planejar capacidade.

O ramo M não deve ser exigido como resposta inicial. Para aprofundamento, pode ser necessário outra sessão. A candidata pode rejeitar DMS se a janela permitir cópia nativa mais simples, ou adiar migração até haver capacidade para sua carga adicional. Não penalizar essa decisão quando justificada.

## 7. Perguntas de aprofundamento

- “O que FreeableMemory e SwapUsage permitem afirmar separadamente?”
- “Por que a consulta simples continua funcionando sem uma réplica?”
- “Qual evidência diferencia falta de memória de lock ou I/O?”
- “A intervenção de menor risco é reduzir trabalho ou iniciar uma cópia agora?”
- “Qual etapa do pipeline falhou e quem pode autorizar um caminho alternativo?”
- “Quem escreve além da API? Como impede que um job antigo escreva na origem?”
- “O destino já recebeu novas escritas: o que precisa reconciliar antes de voltar?”

## 8. Respostas incompletas e como aprofundá-las

| Resposta | Pergunta para aprofundar |
|---|---|
| “A memória livre está baixa, aumento RAM.” | Que sinais de erro e paginação confirmam pressão e qual workload mudou? |
| “São conexões demais.” | Há limite atingido, memória por operação ou outra espera? Como testaria a relação? |
| “Leitura funciona, então o banco está bom.” | Como a demanda das consultas difere das cargas e atualizações? |
| “Migro porque Terraform falhou.” | A falha impede só o caminho automatizado? Quais pré-requisitos a migração também precisa? |
| “DMS copia tudo.” | Quem prepara índices, FKs, roles, sequências e valida os fluxos? |
| “Lag zero, troco o endpoint.” | Escritores pararam? Qual posição final foi aplicada? Há transações e validações pendentes? |
| “Se falhar, volto o endpoint.” | Quem preserva as alterações já confirmadas no novo destino? |

## 9. Mitigações, riscos e validação

**Contenção:** pausar entrada de lotes, drenar trabalho, limitar concorrência e tentativas, preservar consultas e reconciliar operações incertas. Usar E5 para validar, observar atraso e retomar backlog gradualmente. Interromper retomada se erros de memória ou paginação reaparecerem. Aplicação e dados coordenam; negócio decide a tolerância a atraso.

**Capacidade e caminho de mudança:** validar correção do módulo, revisar plano, indisponibilidade, custos, compatibilidade e procedimento de recuperação com plataforma/dados. Não mudar classe só pela memória livre baixa, nem atribuir cada erro ao pipeline. Validar consultas e atualizações representativas, não apenas status do RDS.

**Migração, antes da transferência:** não iniciar se faltarem preparo, autorização, margem na origem ou plano de interrupção. Congelar API, importadores e job de manutenção; drenar ou resolver transações; impedir escritas por identidades antigas e verificar essa proteção. Permitir que o replicador conclua a aplicação até o ponto final conhecido. Conferir pendências e escopo de validação, dados, objetos, permissões, sequências e invariantes. Se qualquer condição falhar, manter o destino sem escrita de negócio e cancelar/adiar o cutover. M2 é um caso explícito de parada.

**Na transferência:** com M3, parar de forma controlada a aplicação de alterações pelo DMS após comprovar o ponto final; manter a origem protegida contra escritas; mudar configuração dos clientes, invalidar conexões antigas e habilitar um único escritor no destino. Primeira escrita canário deve ter aprovação e rastreabilidade; já conta como alteração a preservar. Verificar leitura após escrita, atualização, nova carga, unicidade de IDs e capacidade. Expandir tráfego gradualmente com limites definidos no ensaio; parar expansão diante de divergência, erros ou saturação.

**Recuperação antes e depois de escritas:** antes de novas escritas de negócio no destino, um retorno pode reabilitar a origem controladamente se ela ainda contiver toda a história autoritativa e o destino estiver isolado. Depois de escritas no destino, a origem está desatualizada: interromper novas mutações se necessário, preservar registros e escolher correção no novo destino ou transferência dos deltas para uma autoridade validada. Replicação reversa ou restauração com deltas exige projeto, captura e teste prévios; não é configurada magicamente pelo DMS original. Não fazer dual write improvisado. [AWS Prescriptive Guidance — cutover e retorno com dados alterados](https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-migration-cutover/cutover-stage.html), consulta em 01/11/2026.

## 10. Exemplo de resposta inicial organizada

“Primeiro vou separar quais consultas e atualizações falham e confirmar o erro. Memória baixa é um sinal; preciso relacioná-la a paginação, workload, conexões e mudanças, e comparar locks e I/O. Tentarei conter a demanda com menor risco enquanto plataforma identifica a etapa quebrada do caminho de mudança. Migração será uma alternativa com pré-condições, validação e autoridade de escrita definidas, não uma consequência automática desse sintoma.”

## 11. Explicação técnica aprofundada

FreeableMemory descreve memória disponível; interpretá-la exige workload e sinais de pressão. SwapUsage é quantidade ocupada, não taxa de troca. Conexões, múltiplos operadores, buffers e processos disputam memória. Leituras pequenas podem continuar atendendo enquanto alocações de operações pesadas falham; isso não comprova que toda leitura seja segura ou atual. [RDS — métricas e unidades](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html), consulta em 01/11/2026. No PostgreSQL, [work_mem](https://www.postgresql.org/docs/16/runtime-config-resource.html#GUC-WORK-MEM) pode ser usado por várias operações de uma mesma consulta, consulta em 01/11/2026. Não multiplicar sua configuração para declarar consumo medido.

Full load copia o conjunto inicial; CDC captura alterações enquanto a origem permanece ativa. CDC-only não inventa uma carga inicial consistente. A origem PostgreSQL exige configuração de replicação lógica e permissões; retenção por slots demanda monitoramento de WAL e espaço. Essa preparação pode exigir reinício e precisa ocorrer antes da janela. [DMS — CDC](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Task.CDC.html) e [PostgreSQL como origem](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.PostgreSQL.html), consulta em 01/11/2026.

DMS não substitui a preparação integral de schema, índices secundários, FKs e usuários. Sequências precisam de ajuste controlado antes das escritas no destino. Cópia por tabela também não torna o destino pronto para negócio durante full load. [DMS — boas práticas](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_BestPractices.html) e [PostgreSQL como destino](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Target.PostgreSQL.html), consulta em 01/11/2026.

A validação DMS compara dados no escopo suportado e consome recursos. Tabelas sem chave adequada, registros pendentes e alterações concorrentes impõem limites. Ela não valida permissões, planos de consulta, integrações, invariantes comerciais ou capacidade da jornada inteira. [DMS — validação e limitações](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html), consulta em 01/11/2026. Nem um ponto de lag zero substitui comprovar escritores suspensos e aplicação até uma fronteira final conhecida.

## 12. Exemplo de comunicação para negócio

Após E5: “O aumento de concorrência da importação elevou a demanda de memória e afetou atualizações pesadas. Limitamos os importadores e os erros cessaram no período observado; consultas e atualizações de teste passaram. Ainda há backlog, que será retomado gradualmente. Plataforma está corrigindo o caminho de mudança; compararemos capacidade e otimização antes de decidir uma migração. Essa decisão terá janela, responsáveis e critérios de parada.”

## 13. Debrief e links de revisão

Peça uma decisão que mudou após E5 e outra após M2. Pergunte qual evidência continuou faltando. Em nova rodada, retire o indício de memória e peça hipóteses sem induzir migração. Revise [F09 — capacidade](../../../../technical-knowledge/01-fundamentals/09-performance-costs.md), [F12 — resiliência e migração](../../../../technical-knowledge/01-fundamentals/12-resilience-migration.md), [F06 — transações](../../../../technical-knowledge/01-fundamentals/06-databases-transactions-consistency.md) e [SD02 — dados em escala](../../../../technical-knowledge/02-system-design/02-data-at-scale.md).

## 14. Fontes técnicas

Consultadas em **01/11/2026**: [RDS métricas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html), [PostgreSQL 16 — recursos](https://www.postgresql.org/docs/16/runtime-config-resource.html#GUC-WORK-MEM), [DMS CDC](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Task.CDC.html), [origem PostgreSQL](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.PostgreSQL.html), [destino PostgreSQL](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Target.PostgreSQL.html), [boas práticas](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_BestPractices.html), [validação](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html) e [cutover](https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-migration-cutover/cutover-stage.html). Verificar combinações de versões, permissões e tempo em ensaio é uma pré-condição futura; nenhuma migração foi executada. [Catálogo](../../../../references/troubleshooting-fontes.md).
