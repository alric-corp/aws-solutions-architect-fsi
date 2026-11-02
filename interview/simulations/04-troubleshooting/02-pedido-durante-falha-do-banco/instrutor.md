# Simulado 2 — Material do instrutor

Entregue somente [candidato.md](candidato.md). Todos os registros, identificadores e horários deste arquivo são **dados sintéticos para treinamento**; horários em UTC no dia fictício D. As três janelas são operações independentes para comparação, não três resultados da mesma tentativa. Libere evidências por significado, conforme o [guia](../guia-do-instrutor.md).

## 1. Competências avaliadas

Distinguir disponibilidade, sessão, durabilidade e confirmação; explicar atomicidade, commit e resultado desconhecido; proteger repetição concorrente; separar efeitos locais e externos. Na [rubrica](../rubrica.md), observe mecanismo e segurança da decisão, inclusive ao orientar o cliente com resultado ainda incerto.

## 2. Estado real e premissas do cenário

API em Fargate grava pedido e itens em uma transação PostgreSQL 16, com durabilidade habilitada, em RDS Multi-AZ DB instance com um standby síncrono. Não há read replica no caminho de consulta usado aqui. A consulta diagnóstica ocorre no escritor recuperado, por uma identidade autorizada. O problema não é sessão do usuário.

**Implementação atual, deliberadamente insuficiente:** navegador mantém `client_request_id` estável ao repetir a mesma intenção; a API registra esse campo, mas sempre insere novo pedido e não impõe unicidade. O identificador é distinto do token de login. A API retorna `201` depois do commit. O disparo de pagamento é agendado apenas na memória do processo depois disso; não há outbox. O disparador verifica pendências a cada 30 s, nos segundos 00 e 30. Na janela B, a contenção suspende esse disparador às 10:01:02.300, antes do próximo ciclo, às 10:01:30; por isso os dois pedidos ainda não foram enviados ao provedor.

**Contrato fictício atual:** “pedido confirmado” significa registro durável de pedido e itens; pagamento tem estado separado e começa `pendente`. Isso não autoriza apresentar “compra paga”. A documentação comercial precisa tornar essa distinção clara. O exercício permite propor outro contrato coerente, incluindo confirmação final somente depois do pagamento, desde que os estados intermediários sejam explícitos.

A abertura corresponde à **janela B**: houve commit, a resposta se perdeu e o retry criou outro pedido para a mesma intenção. Os pagamentos desses dois pedidos ainda não foram disparados no momento da contenção. Janelas A e C são contrafactuais de aprofundamento com seus próprios cartões. Não é possível inferir qualquer janela somente do timeout.

Hipóteses iniciais válidas incluem persistência abortada, commit com resposta perdida, repetição da mesma intenção ou duas compras distintas. A correlação E1 distingue a intenção; E2/E3 distinguem o resultado. Token de sessão expirado poderia explicar outro tipo de falha, mas não explica os commits observados neste caso.

## 3. Linha do tempo

| Janela | Sequência sintética (UTC) |
|---|---|
| A — antes de concluir persistência | 10:00:00.000 inicia transação; 10:00:00.060 conexão cai antes do commit; 10:00:02 cliente vê timeout; recuperação posterior confirma aborto |
| B — persistência concluída, confirmação perdida | 10:01:00.090 commit de P201; resposta não chega; timeout às 10:01:02; retry às 10:01:02.100; commit de P202 às 10:01:02.250 |
| C — confirmação entregue, falha posterior | 10:02:00.090 commit de P301; 10:02:00.110 cliente recebe 201; 10:02:00.130 processo cai antes de disparar pagamento |

São pontos de injeção de falha distintos. A falha de A não é prova de perda de commits confirmados; C não transforma uma confirmação já recebida em transação não concluída.

## 4. Evidências sintéticas progressivas

**E1 — Identidade e contrato.** Tentativas da abertura: mesmo comprador fictício, `client_request_id=intencao-B`, mesmo carrinho e total, IDs de transporte diferentes `req-B1` e `req-B2`. A API não faz deduplicação durável. Há um token de autenticação válido, cujo conteúdo não é fornecido. O token autentica o sujeito; não identifica sozinho a intenção de compra.

**E2 — Logs da abertura B.** Recorte de aplicação instrumentada; “commit retornou” é observação dessa chamada, não leitura de WAL bruto:

```text
10:01:00.090 req=req-B1 intent=intencao-B order=P201 db_commit=returned_ok
10:01:00.110 req=req-B1 response_attempted=true client_delivery=unconfirmed
10:01:02.250 req=req-B2 intent=intencao-B order=P202 db_commit=returned_ok
```

**E3 — Estado durável após estabilização.** Leitura no escritor às 10:03, com transações em andamento já resolvidas:

| Intenção | Pedidos e itens | Resultado local | Pagamento no provedor |
|---|---|---|---|
| intencao-A | Nenhum; transação abortada confirmada na recuperação | Não persistiu | Nenhum envio |
| intencao-B | P201 e P202, ambos com os mesmos itens | Duplicou o registro comercial | Nenhum envio até a contenção |
| intencao-C | P301 e seus itens | Persistiu e 201 foi entregue | Nenhum envio; disparo em memória perdido |

Na janela A, ausência em uma leitura durante indisponibilidade ou em réplica atrasada não seria suficiente. O cartão declara resolução da transação e leitura na autoridade correta. Se essa coleta não fosse possível, a conclusão permaneceria desconhecida.

**E4 — Janelas alternativas.** Para A, entregue a linha do tempo A e o registro de aborto; para C, entregue a linha C, confirmação de recebimento no cliente e ausência de disparo durável. Nenhum cartão informa que um timeout isoladamente significa rollback.

**E5 — Concorrência contra uma proposta ingênua.** Se a candidata propuser “consulto antes de inserir”, forneça esta execução permitida sem restrição única: X consulta a chave K e não encontra; Y consulta K e não encontra; X insere; Y insere; ambos fazem commit. Pergunte qual mecanismo impede esse interleaving. Não é exigida sintaxe SQL.

**E6 — Testes condicionais do desenho proposto.** Após explicar proteção atômica e concorrente: duas solicitações simultâneas com mesma chave e conteúdo resultam em um único pedido e no mesmo resultado durável; mesma chave com conteúdo diferente é rejeitada; queda antes do commit não deixa efeito parcial; queda depois do commit permite recuperar resultado pela chave. Esses são resultados esperados de testes narrados, não testes executados. Solicite ainda um teste de duplicação do evento de pagamento e de resposta perdida do provedor.

## 5. Solicitação → evidência → conclusão e limite

| Solicitação da candidata | Evidência fornecida | O que permite concluir | O que não permite concluir |
|---|---|---|---|
| É a mesma compra ou só o mesmo cliente? O que o retorno promete? | E1 | A intenção é a mesma; contrato local exclui liquidação | Token válido impede duplicação |
| A requisição chegou a persistir? A resposta saiu? | E2 | Primeiro pedido teve commit observado e a resposta se perdeu | Todo timeout corresponde à janela B |
| Qual estado está no banco recuperado e no provedor? | E3 | Há dois registros para B e nenhum pagamento enviado no recorte | É seguro excluir um pedido ou cobrar automaticamente |
| Se falhar antes do commit? E depois da confirmação? | E4 | A precisa refazer trabalho local; C precisa recuperar trabalho posterior | Sessão ou failover resolvem a pendência externa |
| Como testar concorrência da deduplicação? | E5 | Consulta prévia separada permite corrida | Qualquer uso de SELECT é incorreto, inclusive com proteção transacional adequada |
| Como validar a solução sob quedas e retries? | E6 | O desenho precisa preservar invariantes nessas janelas | Há exactly-once ponta a ponta |

## 6. Raciocínio esperado e alternativas válidas

Começar distinguindo resultado desconhecido de fracasso confirmado. Correlacionar intenção, tentativas e estado durável; conter retries que criam novos efeitos até saber o resultado. Na abertura, há duplicidade local comprovada. Não eliminar registros sem procedimento de reconciliação e aprovação.

Um desenho válido registra, no responsável pelo estado, a chave da intenção, o conteúdo relevante e o resultado de forma durável, junto ao efeito local e com exclusão de concorrentes. Por exemplo, restrição única por comprador + intenção e uma transação curta que cria pedido, itens e resultado. Ao disputar a chave, o segundo chamador espera a resolução ou recebe estado consultável; não cria outro pedido. Se o primeiro abortar, uma nova tentativa pode executar o efeito. Se confirmar, retorna o resultado já registrado. Uma consulta seguida de inserção é aceitável somente com proteção real contra a corrida.

Aceitar outras primitivas transacionais ou condicionais que preservem os mesmos invariantes. Não exigir DynamoDB, PostgreSQL ou biblioteca específica. A retenção da chave deve cobrir o período de retries e reconciliação acordado; não inventar um TTL universal. A autorização da consulta de estado deve impedir acesso a pedido de outro cliente.

## 7. Perguntas de aprofundamento

- “Se o COMMIT foi executado, mas sua resposta também se perdeu, o que o cliente do banco sabe?”
- “Como identifica a mesma intenção em duas abas ou após reiniciar a aplicação?”
- “O que duas requisições concorrentes conseguem observar antes de qualquer commit?”
- “Quando o contrato permite dizer recebido, em processamento ou confirmado?”
- “A cobrança ocorreu, mas a confirmação do provedor se perdeu. Você cobraria de novo?”
- “Se a chave expirar e chegar uma tentativa antiga, o que impede uma nova cobrança?”

## 8. Respostas incompletas e como aprofundá-las

| Resposta | Pergunta para aprofundar |
|---|---|
| “Coloco Multi-AZ.” | O que ocorre com a conexão e com o cliente que não recebeu a confirmação do commit? |
| “Uso um token.” | É autenticação, sessão ou intenção? Onde fica o resultado? Quem protege duas chamadas simultâneas? |
| “Faço backup.” | Como um restore esclarece essa compra agora sem sobrescrever operações válidas? |
| “Coloco uma fila.” | Em qual confirmação a intenção já está durável? Quem trata redelivery e cobrança incerta? |
| “Vejo se existe e depois insiro.” | O que acontece com X e Y no cartão E5? |
| “Uso outbox, saga, CQRS…” | Qual janela concreta o primeiro mecanismo resolve e qual falha ainda sobra? |

## 9. Mitigações, riscos e validação

Imediato: sinalizar estado em verificação ao atendimento, conter novos disparos para a intenção afetada e reconciliar P201/P202 com responsáveis de pedidos e pagamento. No recorte não houve cobrança, mas a ação deve verificar isso antes de alterar estado. Preservar trilha de auditoria; não apagar uma duplicata para esconder o problema.

Reconectar ao endpoint correto recupera acesso; repetição de mutação só é segura com contrato e proteção adequados. Usar tentativas limitadas, backoff com variação aleatória e orçamento de tempo; parar se o estado não puder ser determinado ou a dependência continuar indisponível. Não renovar a chave a cada tentativa.

Validação: E6, autorização da consulta, recuperação após reinício e conciliação das pendências de pagamento. Impedir que um evento repetido cobre duas vezes. Alerta sobre intenções com múltiplos pedidos e pendências sem progresso. Alterações em dados e contrato exigem aplicação, dados, pagamentos e negócio.

## 10. Exemplo de resposta inicial organizada

“O timeout não me diz se a compra foi gravada. Vou correlacionar as tentativas da mesma intenção e consultar o estado durável e o pagamento antes de orientar nova cobrança. Quero saber o que o retorno da API promete e onde a falha ocorreu em relação ao commit. Para repetir com segurança, precisamos recuperar o resultado anterior ou executar uma única vez o efeito local sob proteção concorrente.”

## 11. Explicação técnica aprofundada

**Três propriedades diferentes.** Disponibilidade descreve conseguir atender; sessão mantém contexto de interação; durabilidade preserva alterações confirmadas sob as garantias configuradas. A fronteira atômica local evita pedido sem itens, mas não inclui automaticamente rede, navegador ou provedor. PostgreSQL documenta [COMMIT](https://www.postgresql.org/docs/16/sql-commit.html) e a disputa entre inserções com índice único em [INSERT](https://www.postgresql.org/docs/16/sql-insert.html), consultados em 01/11/2026. Nesta premissa, a transação usa durabilidade padrão habilitada; não extrapolar para escrita sem confirmação durável.

**Resultado desconhecido.** Perder a resposta após enviar uma operação pode deixar o cliente sem saber se ela concluiu. A chave estável expressa a intenção, e registrar chave e efeito de forma atômica permite recuperar um resultado equivalente. Reutilizar a chave com parâmetros incompatíveis precisa de tratamento explícito. [Builders’ Library — idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/), consulta em 01/11/2026. O desenho concreto deste exercício é uma proposta de contrato, não uma garantia automática do SDK ou de um cabeçalho HTTP.

**Estados propostos.** “Recebido” só pode prometer recuperabilidade depois de aceitação durável; um ACK em memória não basta. `202 em processamento` exige intenção persistida e identificador consultável. “Confirmado” precisa indicar qual fronteira foi concluída: registro do pedido ou compra com pagamento. Durante incerteza, não converter “não sei” em “falhou” ou “pagou”. Se reservar `confirmado` para a compra completa, manter o pedido em processamento até verificar o pagamento.

**Efeito externo e janela C.** Gravar uma intenção de publicação junto com o pedido na mesma transação — outbox — permite retomar o disparo perdido depois do commit. O publicador ainda pode repetir após enviar e cair antes de marcar envio; consumidor/provedor precisa reconhecer a mesma operação. Esse padrão resolve a dupla escrita local + publicação, não torna cobrança remota parte da transação. [AWS Prescriptive Guidance — transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), consulta em 01/11/2026.

Para este desenho, proponha contrato com o provedor que aceite referência estável e consulta de estado; a disponibilidade e o período de deduplicação desse contrato precisam ser confirmados. Se o provedor não oferecer proteção suficiente, usar reconciliação e bloquear nova cobrança enquanto o resultado for ambíguo. Não prometer exactly-once ponta a ponta. [Builders’ Library — retries](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/), consulta em 01/11/2026.

## 12. Exemplo de comunicação para negócio

Após E3: “Encontramos dois registros de pedido para uma mesma tentativa de compra. Até o recorte verificado não houve envio de cobrança. Suspendemos novos disparos dessa intenção enquanto pedidos e pagamentos conciliam o estado. Ainda não orientaremos uma nova compra. A próxima atualização será em dez minutos, com o pedido válido e o tratamento dos registros confirmado pelos responsáveis.”

## 13. Debrief e links de revisão

Peça para desenhar commit e resposta como eventos distintos. Mova a falha entre A, B e C; peça uma decisão diferente em cada janela. Revise [F06 — transações](../../../../technical-knowledge/01-fundamentals/06-databases-transactions-consistency.md), [F07 — entrega e idempotência](../../../../technical-knowledge/01-fundamentals/07-events-messaging-distributed-systems.md) e [SD03 — outbox e coordenação](../../../../technical-knowledge/02-system-design/03-distributed-workflows.md).

## 14. Fontes técnicas

Todas consultadas em **01/11/2026**: [PostgreSQL 16 — COMMIT](https://www.postgresql.org/docs/16/sql-commit.html), [INSERT e ON CONFLICT](https://www.postgresql.org/docs/16/sql-insert.html), [Builders’ Library — idempotência](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/), [retries](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/), [transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) e [RDS Multi-AZ com um standby](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html). As janelas, o contrato comercial e os testes narrados são autorais e sintéticos. Escopo no [catálogo](../../../../references/troubleshooting-fontes.md).
