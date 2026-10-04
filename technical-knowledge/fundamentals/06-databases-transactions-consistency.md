# 06 — Bancos, transações, consistência e escala

**ID:** F06. **Base:** [N04](../../references/README.md#n04) e [revisões das anotações](../../references/study-notes-revisions.md). **Revisão técnica:** 03/10/2026. Explicações, exemplos e exercícios são complementos autorais apoiados nas fontes indicadas.

**Objetivo:** explicar o que uma operação de dados garante, onde essa garantia termina e como proteger uma invariante quando operações concorrem.

## Roteiro de leitura

**Essencial:** padrões de acesso → modelos e constraints → exemplo de concorrência → ACID → isolamento e leituras. Faça o exemplo com papel antes de escolher uma engine.

**Aprofundamentos:** indexação, write skew, CAP/BASE/PACELC e escopos do DynamoDB. Termine pelas perguntas e pelo exercício; não é necessário memorizar configurações de produção.

**Fronteira:** F06 explica índices, transações, locks, versões e consistência de uma operação. [SD02](../system-design/02-data-at-scale.md) combina esses mecanismos com capacidade, pooling, cache, réplicas e sharding. Outbox, idempotência de consumidores e coordenação entre autoridades estão em [SD03](../system-design/03-distributed-workflows.md).

**Natureza dos exemplos:** valores, IDs e intercalações são hipóteses didáticas, sem dados reais. O SQL e o pseudocódigo não foram executados; não há benchmark nem saída de `EXPLAIN` medida. Quando o comportamento depende da engine, usamos explicitamente PostgreSQL 18; isso não afirma que todo serviço gerenciado execute essa versão.

## Três dimensões diferentes

Separe **modelo e acesso** (como representar e consultar), **transação** (que mudanças precisam confirmar juntas) e **replicação** (qual cópia responde e com que atualidade). SQL é uma linguagem; NoSQL agrupa produtos diferentes. Esses rótulos não determinam sozinhos ACID, disponibilidade, escala ou consistência. DynamoDB oferece transações ACID, por exemplo. [Fonte T04](../../references/README.md#t04)

### Padrões de acesso antes da tecnologia

Uma pergunta útil é “consultar quais dados, para tomar qual decisão?”. “Armazenar pagamentos” ainda não descreve um workload.

| Descoberta | Exemplo sintético | Consequência para a decisão |
|---|---|---|
| Consultas e frequência | Consultar `op-a` por identidade; listar 50 lançamentos de uma conta por período | São acessos diferentes; uma chave eficiente para o primeiro não resolve necessariamente o segundo |
| Volume e crescimento | Quantidade de contas, lançamentos por conta, tamanho de cada registro e retenção | Estimar dados e índices; separar média, pico e concentração |
| Cardinalidade e distribuição | Milhões de contas, mas poucas concentram pedidos | Muitos valores distintos não garantem carga uniforme |
| Leitura/escrita e latência | Consultas frequentes; reserva de limite com prazo de resposta curto | Índices favorecem leitura e custam escrita; contenção pode dominar a latência |
| Consistência necessária | Extrato pode indicar atualização; reserva precisa verificar o limite vigente | Distinguir exibição de uma decisão autoritativa |
| Invariantes | Não reservar mais que o limite; não repetir o efeito de `op-a` | Determinar fronteira atômica, identidade e controle de concorrência |

Registre também consultas futuras plausíveis, recuperação e custo operacional. Normalização reduz redundância e facilita integridade; desnormalização pode reduzir joins, mas cria cópias que alguém precisa manter. “Flexível” não significa “sem regras”.

<a id="modelos"></a>
## Modelos de dados

| Modelo | Como pensar o acesso | Utilidade e limite |
|---|---|---|
| Relacional | Linhas relacionadas por chaves; consultas e joins | Reservas, contratos e reconciliação com relações explícitas; joins e transações ainda precisam de bons planos e fronteiras |
| Chave-valor (key-value) | Uma chave identifica um valor/item | Buscar uma operação por ID; consultas por outros atributos exigem outro caminho de acesso |
| Documento (document) | Um agregado contém campos e estruturas aninhadas | Ler uma proposta com seus componentes; duplicar dados entre documentos exige manutenção |
| Colunar largo (wide-column) | Grupos de registros organizados por chave de partição e ordenação interna | Histórico por entidade, como em Cassandra; não confundir com armazenamento colunar analítico |
| Grafo (graph) | Vértices e arestas representam relações a percorrer | Investigar conexões de fraude; não substitui automaticamente o armazenamento transacional da autorização |
| Série temporal (time series) | Tempo, dimensão e medida orientam consultas | Métricas por janela e retenção; o timestamp sozinho não identifica uma operação financeira |
| Em memória (in-memory) | O conjunto ativo é atendido principalmente da RAM | Baixa latência; persistência, replicação e perda tolerável dependem do produto e da configuração |

Os modelos podem coexistir: DynamoDB suporta chave-valor e documentos; um relacional também pode armazenar JSON. “Em memória” descreve principalmente uma escolha de armazenamento, não uma alternativa exclusiva aos outros modelos. Compare a operação necessária e seu contrato, não apenas o nome da categoria. [Componentes do DynamoDB][r-ddb-model]

### Chaves, constraints e invariantes

Considere uma linha de limite `lim-001` e reservas identificadas por operação. Valores monetários do exemplo usam centavos inteiros; não há conversão cambial nem arredondamento.

| Mecanismo | Exemplo | O que ainda falta |
|---|---|---|
| Primary key | `limit_id` identifica a linha de limite | Identidade de registro não impede operações distintas sobre o mesmo limite |
| Unique constraint | `UNIQUE(limit_id, operation_id)` impede duas reservas com a mesma identidade | Comparar a intenção: reutilizar `op-a` com outro valor não é repetição válida |
| Foreign key | A reserva referencia um limite existente | Existência não prova autorização nem disponibilidade de valor |
| Check constraint | `amount_centavos > 0`; contador disponível não negativo | Condição por linha não verifica automaticamente somas de outras linhas |

No PostgreSQL, primary key implica unicidade e ausência de nulos. Um `CHECK` aceita expressão verdadeira **ou nula**: use `NOT NULL` quando necessário. Não use `CHECK` como se validasse de forma segura um agregado de outras linhas. [Constraints][r-constraints]

A aplicação deve traduzir a invariante em operações protegidas pela engine. Um contador na linha do limite pode concentrar a decisão; contador e reserva precisam mudar na mesma transação. Validar apenas no código, antes da escrita, abre uma janela de concorrência. Constraints são uma defesa adicional, não uma descrição completa das regras de negócio.

## Cenário de concorrência

### Exemplo acompanhado: duas operações de R$ 800

**Hipótese:** `lim-001` começa com limite total de **R$ 1.000**, nada reservado ou consumido e, portanto, **R$ 1.000 disponíveis**. A (`op-a`) e B (`op-b`) são pedidos legítimos **diferentes**, de R$ 800 cada.

**Invariante:** “o total reservado/consumido não pode ultrapassar o limite disponível”. Aqui, esse limite é o orçamento autorizado de R$ 1.000; a disponibilidade **remanescente** é `total − reservado − consumido`. Uma mesma parcela não pode ser contada simultaneamente como reserva e consumo definitivo.

#### 1. O fluxo inseguro: read → decide → write

Pseudocódigo conceitual em centavos, não executado, sem lock nem condição na atualização:

```text
valor_lido = ler_disponivel("lim-001")
se valor_lido >= 80000:
    gravar_disponivel("lim-001", valor_lido - 80000)
    registrar_reserva(operation_id, 80000)
    responder_aprovado()
```

| Passo | A: `op-a` | B: `op-b` | Efeito |
|---|---|---|---|
| 1 | Lê R$ 1.000 | — | A decide que pode reservar |
| 2 | — | Lê R$ 1.000 | B também decide que pode reservar |
| 3 | Grava R$ 200; registra R$ 800 | — | A conclui |
| 4 | — | Grava R$ 200; registra R$ 800 | B sobrescreve o disponível com cálculo antigo |

O registro de disponibilidade termina em R$ 200, mas foram admitidas reservas de R$ 1.600. É uma atualização perdida (**lost update**) combinada com violação da invariante entre registros. Mesmo leituras fortes podem retornar R$ 1.000 se ambas ocorrerem antes da primeira escrita. Cada chamada isolada correta não torna atômica a sequência inteira.

Envolver a sequência em uma transação, sem escolher isolamento ou proteção adequados, também não basta. Na variação com `READ COMMITTED` do PostgreSQL, uma escrita que atribui o valor constante calculado antes pode sobrescrever a anterior depois de esperar pelo lock da atualização.

#### 2. Estratégia pessimista: proteger a decisão antes de ler

**Desenho didático para PostgreSQL 18, `READ COMMITTED`:** todos os caminhos que alteram esse limite usam a mesma linha de coordenação.

1. A inicia a transação e obtém `SELECT ... FOR UPDATE` na linha `lim-001`.
2. Dentro dela, consulta a identidade da operação. Se já existe, verifica a intenção e devolve o resultado registrado, sem nova reserva.
3. Caso novo, verifica os R$ 1.000, atualiza o contador, insere a reserva com chave única e confirma tudo junto.
4. B tenta bloquear a mesma linha e espera. Após o commit de A, obtém a versão com R$ 200 disponíveis.
5. B recusa a nova reserva por insuficiência; não há motivo para retry imediato dessa regra de negócio. Se o contrato exige repetir também recusas, registra a decisão pela mesma identidade, sem criar reserva.

O conflito é sobre a **linha compartilhada**, embora os IDs sejam diferentes. O lock bloqueia escritores e lockers conflitantes até o fim da transação; um `SELECT` comum sob MVCC não fica automaticamente impedido de ler. Um deadlock ocorre, por exemplo, quando A segura X e espera Y, enquanto B segura Y e espera X; PostgreSQL aborta uma das transações para desfazer o ciclo. Transações curtas e ordem consistente de aquisição reduzem esse risco. Não segure o lock enquanto chama um serviço externo. [Locks do PostgreSQL][r-locks]

**Falha inserida:** A cai depois de alterar o contador, antes do commit. Sem commit, a transação deve ser desfeita; B não pode tratar a reserva incompleta como confirmada. Se A cai **após** o commit e antes da resposta, o cliente não sabe o resultado: consulte/reenvie a mesma identidade sob o protocolo de idempotência. Timeout não prova rollback.

#### 3. Estratégia otimista: detectar mudança no momento da escrita

A e B podem ler `version = 7`. A atualização condiciona a mudança à versão esperada e ao orçamento ainda disponível. Este SQL PostgreSQL ilustra **apenas a primitiva de concorrência**, não uma implementação completa de reserva:

```sql
-- Ilustrativo; não executado. R$ 800 = 80000 centavos.
UPDATE credit_limit
SET reserved_centavos = reserved_centavos + 80000,
    version = version + 1
WHERE limit_id = 'lim-001'
  AND version = 7
  AND total_centavos - reserved_centavos - consumed_centavos >= 80000
RETURNING version;
```

A altera a versão para 8. B não encontra mais a versão 7 e afeta zero linhas. A aplicação precisa inspecionar esse resultado: pode ser conflito de versão, entidade ausente ou falta de limite. Releia e **refaça a decisão**; neste cenário, restaram R$ 200, então B deve ser recusada. No PostgreSQL `READ COMMITTED`, uma atualização concorrente pode esperar e reavaliar o `WHERE` sobre a versão atualizada. [Isolamento da engine][r-isolation]

Compare-and-swap (CAS) significa “troque apenas se o estado ainda for o esperado”. A versão detecta alteração concorrente mesmo quando o valor volta ao anterior; todos os escritores participantes precisam mantê-la corretamente. Quando toda a regra cabe no predicado atômico, uma atualização condicional pode dispensar uma leitura prévia e até a versão. No DynamoDB, `ConditionExpression` é o mecanismo correspondente para condicionar a escrita de um item. [Escritas condicionais][r-conditions]

Registrar a identidade da operação e modificar o limite continuam exigindo uma unidade atômica. Um desenho possível insere primeiro o registro único da operação na transação, aplica a atualização condicional e confirma ambos; se a condição falhar, desfaz a tentativa e classifica o motivo. Se a identidade já existir, recupera o resultado anterior em vez de executar a atualização de novo. Quando o contrato exige memorizar uma recusa definitiva, essa decisão também precisa ser registrada; conflito transitório de versão não é recusa de negócio. O trecho SQL sozinho **não** implementa esse protocolo.

#### 4. Escolha, recuperação e repetição

| Aspecto | Lock/transação | Atualização condicional/versão |
|---|---|---|
| Quando detectar conflito | Antes de decidir, aguardando acesso à linha | Na tentativa de modificar o estado |
| Custo | Espera, locks e possíveis deadlocks | Tentativas descartadas e releituras sob contenção |
| Boa aplicação | Regra concentrada, decisão curta e coordenação clara | Predicado expressável atomicamente; conflitos administráveis |
| Limite | Bloquear uma linha não protege dados fora do protocolo | CAS de um item não transforma escritas independentes em transação |

Retry é aceitável para conflito transitório quando a tentativa anterior foi abortada ou sua identidade permite recuperar o resultado. Use limite de tentativas, prazo total e espaçamento; não repita indefinidamente durante contenção. No PostgreSQL, um erro de serialização pede retry da **transação completa**, incluindo a lógica que escolheu os valores, não só do último comando. [Tratamento de falhas][r-retry]

Se B fosse uma repetição de **`op-a`**, o problema seria também idempotência: devolver o mesmo resultado sem consumir outros R$ 800. Com limite maior, duas repetições poderiam satisfazer o predicado e consumir duas vezes; só verificar disponibilidade não basta. Inversamente, deduplicar `op-a` não impede `op-b` de disputar o mesmo orçamento.

**Conexão FSI:** o [Case 10, modelo de dados](../../cases/10-card-authorization-platform.md#s08) mantém a decisão financeira e a reserva no core. O exemplo explica um mecanismo dentro da autoridade pertinente, sem transferi-la para cache ou banco auxiliar. No [Case 03](../../cases/03-event-driven-banking.md#s01), limite operacional é distinto de saldo, e débito/crédito continuam uma operação atômica do core. Não estamos implementando um ledger.

<a id="acid-cap"></a>
## ACID não significa executar tudo uma transação por vez

Use a mesma transação de `op-a`: registrar sua identidade, reservar R$ 800 e atualizar o contador de `lim-001`.

| Propriedade | Aplicação à transação | O que não promete |
|---|---|---|
| Atomicity | Registro e contador confirmam juntos ou não deixam efeitos confirmados parciais | Não inclui automaticamente uma chamada externa ou uma mensagem fora da transação |
| Consistency | Preserva regras: reserva positiva, identidade única e orçamento respeitado | A engine não adivinha regras que ninguém expressou ou protegeu |
| Isolation | Controla interações que A e B podem observar e realizar | Não implica execução física de uma transação por vez |
| Durability | O commit sobrevive às falhas cobertas pela configuração e pelo sistema | Não cobre qualquer desastre, exclusão lógica ou perda de todas as cópias |

`BEGIN`/`COMMIT` delimitam a unidade; rollback abandona uma tentativa não confirmada. Após commit, uma reversão de negócio é outra operação, não apagamento do passado. [Transações PostgreSQL][r-transactions]

**Aprofundamento — durabilidade:** write-ahead logging (WAL) registra alterações antes de depender das páginas de dados finais para recuperação. O que precisa chegar ao armazenamento durável antes do ACK depende da configuração. No PostgreSQL, `synchronous_commit = off` pode confirmar antes do flush local; `on` e modos remotos têm outros contratos. “Recebi sucesso” só é uma garantia útil quando sabemos o que esse sucesso confirma. [Configuração de WAL][r-wal]

### Concorrência: o que cada anomalia revela

| Anomalia | Pequena intercalação | Pergunta para investigação |
|---|---|---|
| Dirty read | B lê reserva não confirmada de A; A aborta | B decidiu sobre estado que nunca virou commit? |
| Non-repeatable read | B lê uma linha; A confirma mudança; B relê outro valor | B precisava de uma visão estável? |
| Phantom read | B consulta reservas; A insere outra; B repete e recebe outro conjunto | A regra depende de um predicado? |
| Lost update | A e B calculam sobre o mesmo valor; B substitui o efeito de A | A atribuição usou uma leitura antiga? |
| Write skew | A e B verificam o orçamento em snapshots e inserem linhas distintas | Existe conflito lógico sem disputa pela mesma linha? |

As anomalias e a diferença entre snapshot isolation e serialização são discutidas por [Berenson et al.][r-anomalies]. Os exemplos são adaptações didáticas.

**Aprofundamento — write skew:** suponha que só existam linhas de reservas, sem contador comum. A e B leem soma zero, verificam `soma + 800 <= 1000` e inserem linhas distintas. Um snapshot estável pode permitir que ambas confirmem: cada tentativa julgou o mesmo orçamento livre. `UNIQUE(operation_id)` não conflita, pois os IDs são diferentes. Uma linha de coordenação, proteção adequada do predicado ou serialização podem resolver, com custos diferentes.

### MVCC, locks e níveis de isolamento

MVCC — multiversion concurrency control — mantém versões e regras de visibilidade: a leitura escolhe quais versões pertencem ao seu snapshot. Enquanto A altera `lim-001` sem confirmar, um leitor pode observar a versão anterior confirmada, sem dirty read nem espera pelo fim de A. Isso reduz bloqueios entre consultas e atualizações, mas não elimina conflitos de escrita nem todos os locks. Versões antigas também precisam de manutenção. É um mecanismo; não é sinônimo de `SERIALIZABLE`. [Introdução ao MVCC][r-mvcc]

A tabela descreve **PostgreSQL 18**, não todos os bancos com os mesmos nomes. Consulte o isolamento da leitura e a reação à escrita concorrente. [Documentação da engine][r-isolation]

| Nível solicitado | Comportamento no PostgreSQL 18 | Consequência |
|---|---|---|
| Read Uncommitted | Funciona como Read Committed | Não habilita dirty reads |
| Read Committed | Snapshot por comando | Consultas sucessivas podem divergir |
| Repeatable Read | Snapshot estável; impede também phantoms | Ainda pode admitir write skew |
| Serializable | Resultados equivalentes a uma ordem serial | Pode abortar tentativas incompatíveis |

Escolha a proteção da invariante, não o nome mais forte por reflexo. Para o orçamento de uma linha, a atualização condicional pode ser suficiente. Para regras envolvendo vários conjuntos, a complexidade de coordenar locks pode justificar serialização. Meça abortos, espera e latência; retries sem limite podem piorar a sobrecarga. Verifique também o nível efetivamente usado pela conexão, e não apenas o padrão que alguém supôs.

### Consistência de leitura não é isolamento entre decisões

| Garantia/conceito | O que o cliente pode esperar | Limite |
|---|---|---|
| Strong consistency | No contrato linearizável de um item, leitura respeita escritas concluídas antes de começar; pode observar escrita concorrente | Não reserva o valor nem congela mudanças futuras |
| Eventual consistency | Sem novas escritas e com propagação/reconciliação concluídas, cópias convergem | Não fornece, por si, prazo máximo de defasagem |
| Read-your-writes | A sessão não lê uma visão anterior às próprias escritas confirmadas | Pode observar mudanças posteriores de outros clientes |
| Monotonic reads | A sessão não retrocede na informação já observada ao trocar de réplica | Não obriga a primeira leitura a ser a mais recente |
| Stale read | Resposta anterior a alguma atualização já confirmada no escopo de interesse | Sua admissibilidade depende do contrato |

As garantias de sessão não equivalem a transações: [Terry et al.][r-session] tratam read-your-writes e monotonic reads. A engine/API define o escopo da leitura forte; para DynamoDB, veja [consistência de leitura][r-ddb-read].

Uma leitura forte de uma **projeção** só vê o que já chegou a ela. Não descobre uma transferência ainda não ingerida. A diferença entre autoridade e modelo de consulta está em [SD03, CQRS](../system-design/03-distributed-workflows.md#cqrs); o [Case 09](../../cases/09-multi-region-internet-banking.md#s08) mostra como comunicar um extrato em atualização sem negar um resultado financeiro confirmado.

<a id="indexacao"></a>
## Indexação

**Leitura essencial:** índice é uma estrutura de acesso adicional. Pode poupar buscas e ordenações, mas ocupa espaço e precisa acompanhar escritas. Compare o que a consulta lê com o que devolve; escolher índice não altera, por si, a autoridade dos dados.

**Aprofundamento com PostgreSQL 18:** uma B-tree organiza chaves em ordem e permite localizar uma faixa, depois percorrê-la. Atende igualdade, intervalos e algumas ordenações. Um índice hash atende igualdade; não oferece o mesmo percurso ordenado por faixa. Tipo, operadores e consulta precisam ser compatíveis. [Tipos de índice][r-index-types]

### Composição, seletividade e ordem

Imagine o extrato por `account_id`, intervalo de `occurred_at` e desempate por `entry_id`. Um índice B-tree nessa ordem agrupa entradas de uma conta e favorece buscar seu período em ordem. A ordem deve seguir filtros, faixas, joins e ordenação do workload; “coloque sempre a coluna mais seletiva primeiro” também é uma simplificação.

**Cardinalidade** é a quantidade de valores distintos; **seletividade do predicado** é quanto ele restringe o conjunto. Uma coluna com muitos valores pode ter uma conta excepcionalmente frequente. Estatísticas desatualizadas ou distribuição desigual podem levar o planner a estimar mal o trabalho.

Um índice `(A, B)` **não é inutilizável só porque A não está no filtro**. No PostgreSQL 18, o planner pode considerar acesso por B, inclusive skip scan em situações favoráveis, como poucos valores distintos de A. Isso não garante eficiência: percorrer grande parte do índice pode custar mais que varrer a tabela. Confirme engine, versão, estatísticas e plano. [Índices compostos][r-multicolumn]

### Cobertura e custo de manutenção

Um covering index contém os dados exigidos pela consulta. No PostgreSQL, `INCLUDE` adiciona colunas como payload, sem torná-las chaves de busca. Mesmo com cobertura, um index-only scan pode precisar consultar o heap para verificar visibilidade MVCC quando a página não estiver marcada como totalmente visível no visibility map. Não prometa “zero leitura da tabela”. [Index-only scans][r-index-only]

Adicionar colunas e índices amplia armazenamento, WAL e trabalho de manutenção. Atualizações frequentes podem diminuir o benefício de cobertura. Um índice útil para o extrato pode ser ruim para ingestão se seu ganho de leitura não compensar a escrita; avalie os dois caminhos.

### Ler o plano para testar uma hipótese

No PostgreSQL, `EXPLAIN` mostra o plano estimado; `EXPLAIN ANALYZE` executa a consulta e mede seu comportamento. Custos estimados não são milissegundos. Compare estimativa/linhas efetivas, filtros, ordenação, loops e buffers; um sequential scan pode ser apropriado. Nenhum plano foi executado para este módulo. [Using EXPLAIN][r-explain]

A aplicação desses sinais ao extrato, à paginação e à capacidade fica em [SD02](../system-design/02-data-at-scale.md#consultas-e-conexões-antes-de-adicionar-nós).

## CAP sem o atalho perigoso

Uma **partition** de rede impede grupos de nós de trocar as mensagens necessárias; não é particionar uma tabela. No CAP, consistência é **linearizability**: cada operação parece ocorrer em um instante entre pedido e resposta, respeitando a ordem real das operações não sobrepostas. Disponibilidade exige que pedidos a nós não falhos terminem com resposta conforme o serviço; não é apenas um percentual de uptime, nem “sempre devolver um erro rapidamente”. [Gilbert e Lynch][r-cap]

**Experimento mental:** a região X confirmou `version = 8`, mas a comunicação com Y foi interrompida. Y só conhece 7. Responder imediatamente com 7 viola a leitura linearizável; esperar até conseguir a informação pode sacrificar disponibilidade durante a partição. Um protocolo pode continuar atendendo um lado com quórum e bloquear o outro, sem garantir atendimento em **todos** os nós não falhos.

O dilema aparece durante a partição. Fora dela ainda existem custos de coordenação, mas “escolha dois de três” não é uma classificação universal de SQL/NoSQL. **ACID Consistency preserva invariantes de estado; CAP Consistency ordena a observação das operações distribuídas.** Consulte também a revisão de Brewer em [T05](../../references/README.md#t05).

<a id="base-pacelc"></a>
## BASE e PACELC

**BASE** — basically available, soft state, eventually consistent — ajuda a pensar em operação parcial e convergência: uma cópia pode mudar por propagação mesmo sem novo pedido local. É uma abordagem, não um protocolo que resolve conflitos ou prova uma invariante. O artigo de [Dan Pritchett][r-base] é uma referência histórica; sua oposição retórica entre ACID e BASE não deve ser aplicada como classificação absoluta dos produtos atuais.

Um sistema pode confirmar a reserva numa transação local e atualizar o extrato de forma eventual. É preciso especificar quem propaga, como conflitos são tratados e como se detecta atraso; “eventualmente” não substitui recuperação. O exemplo não autoriza aceitar duas reservas conflitantes esperando corrigir o dinheiro depois.

**PACELC** acrescenta a pergunta da operação normal: se houver partição (**P**), como se equilibram disponibilidade (**A**) e consistência (**C**); caso contrário (**E**, else), qual o compromisso entre latência (**L**) e consistência (**C**)? Esperar comunicação entre regiões afeta o tempo de resposta mesmo com rede saudável. [Daniel Abadi][r-pacelc]

Não presuma que partições sejam raras em todo ambiente ou que todo acesso de um banco faça a mesma escolha. BASE e PACELC orientam perguntas; não especificam isolamento, durabilidade, resolução de conflitos ou o comportamento completo de uma API.

### DynamoDB: delimitar a garantia

**Aprofundamento aplicado:** partition key direciona a distribuição; numa chave composta, partition key + sort key identificam o item. A sort key ordena itens de uma mesma chave de partição. Um `Query` exige a partition key e pode restringir a sort key; não é um join arbitrário. Um global secondary index (GSI) permite outra chave de acesso; um local secondary index (LSI) conserva a partition key e muda a sort key. [Modelo de acesso][r-ddb-model]

| Recurso | Garantia útil | Fronteira |
|---|---|---|
| Conditional write | Só modifica o item se a condição for satisfeita | A condição deve expressar a regra; não protege automaticamente outros itens |
| `TransactWriteItems` | Confirma ou desfaz o conjunto de escritas/condições | Escopo de conta e região; não inclui API externa |
| `TransactGetItems` | Leitura atômica do conjunto solicitado | Várias leituras individuais fortes não equivalem automaticamente a esse conjunto |
| Leitura de tabela ou LSI | Eventual por padrão; opção fortemente consistente | Não bloqueia escritores após a leitura |
| GSI | Outro acesso por chave, mantido a partir da tabela | Propagação e leituras eventuais; não aceita leitura forte |

Fontes: [condições][r-conditions], [APIs transacionais][r-ddb-tx], [leituras][r-ddb-read] e [GSI][r-gsi]. Um GSI pode localizar candidatos pendentes; uma decisão posterior deve validar o estado atual e condicionar a mudança na base. Um resultado ausente no índice não prova inexistência na tabela, como explica o [Case 01](../../cases/01-payment-processing-pix.md#s08).

#### Global tables: MREC e MRSC

Contratos conferidos em **03/10/2026**, para global tables versão 2019.11.21. [Documentação AWS][r-global]

| Modo | Replicação e leitura | Limites relevantes |
|---|---|---|
| MREC — multi-Region eventual consistency, padrão | Assíncrona; conflitos por item usam last writer wins. Leitura forte e condições têm escopo regional | Transação é atômica na origem, mas não é replicada como unidade |
| MRSC — multi-Region strong consistency | Confirma após replicar sincronamente para pelo menos outra região; leitura forte solicitada e condições usam a versão mais recente | Três regiões: três réplicas, ou duas e um witness sem API de dados; sem transações, TTL ou LSI |

MRSC opera em conjuntos regionais autorizados nos EUA, Europa e Ásia-Pacífico, sem cruzá-los; São Paulo não está na lista consultada. O modo não é alterável depois da criação. Escritas concorrentes podem gerar `ReplicatedWriteConflictException`. A AWS documenta RPO zero para MRSC; isso não transforma uma jornada financeira em transação global.

**Consequência para os cases:** substituir MREC por MRSC exige rever regiões, APIs e modelo de dados. Não é uma opção transparente para o fluxo transacional do [Case 01, disponibilidade](../../cases/01-payment-processing-pix.md#s15). Nenhum dos modos desloca a autoridade financeira do core nos Cases 03 e 10.

## Perguntas de aprofundamento

Ao mudar um requisito, volte a quatro pontos: unidade atômica, estado usado na decisão, reação ao conflito e evidência do resultado. Para investigar chaves quentes, atraso de réplica e failover, avance para [SD02](../system-design/02-data-at-scale.md#replicacao). Para migração, consulte [F12](12-resilience-migration.md).

## Perguntas de entrevista

As respostas abaixo são critérios de raciocínio, não discursos para memorizar. Em cada tentativa, explicite descoberta, hipótese, decisão, trade-off e validação.

### 1. Que informação falta antes de escolher relacional ou DynamoDB?

**Follow-up:** agora precisamos buscar operações por conta, estado e período, além do ID.

<details>
<summary>Resposta comentada</summary>

Liste consultas, distribuição, picos, invariantes e recuperação. A nova consulta pode exigir índice, projeção ou outra modelagem; compare custo de mantê-la e atraso permitido. “NoSQL escala” não responde se a operação crítica cabe na fronteira atômica. Uma boa resposta produz uma matriz de acessos e justifica pelo menos duas alternativas.

</details>

### 2. Duas leituras fortes de R$ 1.000 impedem duas reservas de R$ 800?

**Follow-up:** as duas chamadas terminaram a leitura antes de qualquer atualização.

<details>
<summary>Resposta comentada</summary>

Não. Ambas podem ter lido corretamente. Identifique a janela entre verificar e mudar; proponha lock com decisão na transação ou predicado atômico. A evidência é uma intercalação em que só uma reserva confirma e o disponível termina em R$ 200. Não atribua exclusão mútua à leitura forte.

</details>

### 3. Uma unique constraint por operação resolve o limite compartilhado?

**Follow-up:** `op-a` reaparece com outro valor após um timeout.

<details>
<summary>Resposta comentada</summary>

A unicidade evita duas identidades iguais, mas A e B legítimas ainda concorrem. Associe identidade à intenção e ao resultado. Uma repetição compatível recupera a decisão; payload diferente exige tratamento de conflito. Contador e registro devem confirmar juntos. Teste separadamente operações distintas e retries da mesma operação.

</details>

### 4. Como escolher entre lock e versão otimista?

**Follow-up:** uma única conta passa a receber a maior parte das tentativas.

<details>
<summary>Resposta comentada</summary>

Compare duração da decisão, contenção e possibilidade de refazer a tentativa. Locks podem formar fila; CAS pode produzir repetidas tentativas inúteis. Releia após conflito e recalcule a regra. Sob chave quente, meça espera, abortos e trabalho por sucesso, impondo prazo e admissão; trocar o mecanismo não aumenta o orçamento financeiro.

</details>

### 5. Um snapshot estável garante a soma das reservas?

**Follow-up:** A e B inserem linhas distintas após ler a mesma soma.

<details>
<summary>Resposta comentada</summary>

Mostre o write skew. Não há atualização da mesma linha para detectar automaticamente o conflito. Compare uma linha comum de coordenação com isolamento serializável apropriado. Diga quais caminhos devem participar do protocolo e como tratar abortos. A validação deve olhar a soma final, não apenas a ausência de erros SQL.

</details>

### 6. ACID Consistency e CAP Consistency são equivalentes?

**Follow-up:** uma réplica devolve um estado antigo que ainda respeita todas as constraints.

<details>
<summary>Resposta comentada</summary>

O estado pode ser válido e, mesmo assim, violar a atualidade/ordenação exigida pela leitura. Separe integridade da transição e observação entre cópias. Durante isolamento de rede, declare qual operação espera ou fica indisponível. Não trate a palavra “consistente” como garantia financeira completa.

</details>

### 7. O índice `(account_id, occurred_at)` atende uma busca só por data?

**Follow-up:** há poucas contas, mas grande variação no tamanho de cada uma.

<details>
<summary>Resposta comentada</summary>

Não responda com proibição universal. Engine, versão, distribuição e plano determinam uso e eficiência. Compare páginas percorridas, linhas devolvidas e custo de um índice alternativo na escrita. Cobrir a consulta também não prova ausência de acessos ao heap. Peça evidência de plano; não invente `EXPLAIN` nem ganho percentual.

</details>

### 8. A reserva confirmou, mas a aplicação recebeu timeout. Pode tentar de novo?

**Follow-up:** o histórico de consulta ainda não mostra a operação.

<details>
<summary>Resposta comentada</summary>

Ausência na projeção não prova ausência na autoridade. Consulte pelo mesmo identificador ou repita segundo um contrato idempotente. Não gere outro ID para “garantir”. Separe resultado desconhecido, aborto conhecido e recusa de negócio; cada um pede recuperação diferente. Preserve a confirmação financeira mesmo quando a visualização atrasa.

</details>

### 9. Um GSI pode arbitrar se uma operação já existe?

**Follow-up:** a base recebeu a operação, mas o índice não a retornou.

<details>
<summary>Resposta comentada</summary>

Use o índice para descoberta, não sua ausência como prova de inexistência. Arbitre a criação com a chave e condição apropriadas na base; leia o resultado da autoridade quando necessário. Considere também a unicidade de negócio: IDs diferentes podem representar a mesma intenção externa. O Case 01 separa esses escopos.

</details>

### 10. MRSC resolve automaticamente a autorização em duas regiões?

**Follow-up:** a proposta depende de São Paulo, TTL e uma transação com vários itens.

<details>
<summary>Resposta comentada</summary>

Compare os requisitos com a tabela de contratos, que impede uma substituição direta. Mesmo uma garantia forte por item não implementa as regras do core nem a coordenação da jornada. Identifique a incompatibilidade, ofereça outra arquitetura ou renegocie requisitos, sem chamar uma garantia de replicação de “efeito financeiro exatamente uma vez”.

</details>

## Exercício

**Simulação de mesa, sem executar SQL nem criar recursos:** desenhe uma autoridade hipotética de reserva com `lim-001`, orçamento de R$ 1.000 e A/B de R$ 800. Use duas folhas, uma para estado e outra para ordem dos passos.

1. Reproduza a implementação insegura e a violação de R$ 1.600 admitidos.
2. Escolha lock/transação ou atualização condicional; indique exatamente onde a disputa é resolvida.
3. Insira uma queda antes do commit e outra após commit/antes da resposta. Repita `op-a` sem trocar sua identidade.
4. Troque o limite para R$ 2.000: A e B distintas podem confirmar; repetir A continua sem novo consumo.
5. Mude a regra para somar reservas em várias linhas. Explique por que sua proteção ainda funciona ou qual parte precisa mudar.
6. Relacione a identidade estável ao [Case 01](../../cases/01-payment-processing-pix.md#s08) e mantenha a autoridade da reserva conforme o [Case 10](../../cases/10-card-authorization-platform.md#s08).

**Critérios observáveis:** a folha identifica autoridade, invariante e unidade atômica; distingue conflito de versão de insuficiência; mostra R$ 800 reservados e R$ 200 disponíveis no cenário protegido com orçamento de R$ 1.000; não duplica a mesma operação; não assume rollback por timeout; e propõe uma validação concorrente com resultado esperado, sem apresentá-la como teste já executado.

## Fontes e escopo da revisão

Fontes primárias consultadas em 03/10/2026. Links próximos às afirmações delimitam o suporte; os exemplos financeiros, escolhas e critérios são autorais. As páginas de PostgreSQL abaixo são da versão 18. O catálogo compartilhado permanece em [references](../../references/README.md).

- PostgreSQL: [transações][r-transactions], [constraints][r-constraints], [MVCC][r-mvcc], [isolamento][r-isolation], [locks][r-locks], [retry][r-retry] e [WAL][r-wal]. Sustentam mecanismos e limites da engine, não equivalência automática com outras implementações.
- PostgreSQL: [tipos de índice][r-index-types], [índices compostos][r-multicolumn], [index-only scans][r-index-only] e [EXPLAIN][r-explain]. Sustentam acesso, planejamento e a correção das antigas afirmações absolutas.
- DynamoDB: [modelo][r-ddb-model], [condições][r-conditions], [transações][r-ddb-tx], [leituras][r-ddb-read], [GSI][r-gsi] e [global tables][r-global]. Sustentam os escopos das APIs e os modos MREC/MRSC.
- Berenson et al., *A Critique of ANSI SQL Isolation Levels* (1995): [publicação original][r-anomalies]. Terry et al., *Session Guarantees for Weakly Consistent Replicated Data* (1994): [texto original disponibilizado por Cornell][r-session].
- Gilbert e Lynch, *Perspectives on the CAP Theorem* (2012): [publicação dos autores][r-cap]. Pritchett, *BASE: An ACID Alternative* (2008): [original disponibilizado por Stanford][r-base]. Abadi, *Consistency Tradeoffs in Modern Distributed Database System Design* (2012): [publicação do autor][r-pacelc]. As classificações históricas não substituem contratos atuais dos serviços.

[r-transactions]: https://www.postgresql.org/docs/18/tutorial-transactions.html
[r-constraints]: https://www.postgresql.org/docs/18/ddl-constraints.html
[r-mvcc]: https://www.postgresql.org/docs/18/mvcc-intro.html
[r-isolation]: https://www.postgresql.org/docs/18/transaction-iso.html
[r-locks]: https://www.postgresql.org/docs/18/explicit-locking.html
[r-retry]: https://www.postgresql.org/docs/18/mvcc-serialization-failure-handling.html
[r-wal]: https://www.postgresql.org/docs/18/runtime-config-wal.html
[r-index-types]: https://www.postgresql.org/docs/18/indexes-types.html
[r-multicolumn]: https://www.postgresql.org/docs/18/indexes-multicolumn.html
[r-index-only]: https://www.postgresql.org/docs/18/indexes-index-only-scans.html
[r-explain]: https://www.postgresql.org/docs/18/using-explain.html
[r-ddb-model]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html
[r-conditions]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
[r-ddb-tx]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html
[r-ddb-read]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html
[r-gsi]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html
[r-global]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/V2globaltables_HowItWorks.html
[r-anomalies]: https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-95-51.pdf
[r-session]: https://www.cs.cornell.edu/courses/cs734/2000FA/cached%20papers/SessionGuaranteesPDIS_1.html
[r-cap]: https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf
[r-base]: https://web.stanford.edu/class/cs245/spr2019/readings/base.pdf
[r-pacelc]: https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf
