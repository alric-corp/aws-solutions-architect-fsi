# Referências e revisão técnica

[Índice da trilha](README.md) · [Laboratório](laboratorio/README.md)

**Consulta real às fontes: 03/11/2026.** O dialeto principal e a documentação de referência são PostgreSQL **18**; MySQL **8.4/InnoDB** fica separado no comparativo. A versão exata executada e as limitações dos experimentos estão no relatório do laboratório. Consultar documentação não equivale a executar SQL.

## O que recebemos e o que acrescentamos

Os arquivos denominados `Texto colado(20261103-043403).txt`, `Texto colado (2)(2).txt`, `Texto colado (3)(1).txt` e `Texto colado (4)(1).txt` não foram encontrados na árvore do projeto nem nos diretórios Desktop/Downloads consultados. A mensagem disponível descreve temas e ressalvas, mas não traz o corpo dessas transcrições. Não recebemos esses vídeos ou links. Posteriormente recebemos e lemos integralmente o complemento `Texto colado(20261103-045930).txt`, com 812 linhas e timestamps de 0:00 a 42:37. Os registros de revisão desse complemento estão separados abaixo; não inferimos título, URL ou identidade completa do apresentador.

**Ideias derivadas do material efetivamente fornecido:** os temas e as dúvidas enumerados no pedido — transferência, última unidade, cinema como possibilidade de exemplo, confirmação/desistência, anomalias, locks, repetição, BASE e comparação de bancos. Usamos compra e transferência para preservar continuidade; não afirmamos ter extraído uma explicação específica dos anexos iniciais ausentes ou de comentários não recebidos.

**Contribuição do novo insumo:** em 11:42–18:47, o relatório usa quantidades 10/20 e preços 5/4, com subtotais 50/80 e total 130. Adaptamos para reais, armazenados como 500/400 centavos, dentro da Loja Horizonte; com a primeira quantidade em 15, o total passa a R$ 155. O cenário ajuda a entender por que uma transação só de leitura pode precisar de uma visão estável. A releitura da mesma consulta e o conjunto filtrado explicitam a classificação das anomalias, sem importar automaticamente os nomes usados na transcrição.

**Complementação autoral didática:** capítulos, perguntas, analogias com limites, nomes fictícios, números, sequências A/B, funções e testes. Os exemplos não são transcrições nem produção bancária. Comentários de espectadores não foram tratados como autoridade e nomes pessoais não foram reproduzidos.

**Correção ou ressalva documental:** o quadro a seguir registra formulações do pedido que exigem cuidado técnico. São paráfrases de riscos identificados **no pedido**, não citações atribuídas a um autor ausente. Se os demais insumos chegarem depois, será necessário confrontá-las e acrescentar origem/timestamp sem inventar essa rastreabilidade.

## Registro de revisão

| Trecho ou paráfrase curta a revisar | Fonte e timestamp disponíveis | Problema | Formulação adotada | Base consultada |
|---|---|---|---|---|
| “Sem BEGIN, não há transação.” | Pedido §5/00; sem timestamp | Confunde bloco explícito com existência de transação | Instruções também executam em transações implícitas; o cliente pode usar autocommit | P1 |
| “Ninguém vê mudanças antes do commit.” | Pedido §5/00; sem timestamp | Ignora a própria sessão | A transação lê suas mudanças anteriores; outra sessão segue seu isolamento | P1, P2 |
| “O segundo UPDATE não achou destino, então o banco desfaz.” | Pedido §5/01; sem timestamp | Zero linhas não é exceção automática | Conferir linhas alteradas e não confirmar transferência incompleta | P11 |
| “Qualquer erro desfaz o bloco inteiro em qualquer banco.” | Pedido §5/01; sem timestamp | Generalização entre engines | PostgreSQL exige recuperação do bloco abortado; InnoDB distingue rollback de instrução e transação | P1, P6a, P12 |
| “Consistência descobre todas as regras.” | Pedido §5/02; sem timestamp | O SGBD não infere intenção de negócio | Regras precisam ser traduzidas em constraints e operações protegidas | P3, P9 |
| “CHECK positivo também impede NULL e somas erradas.” | Pedido §5/02; sem timestamp | Um CHECK admite resultado nulo e não protege agregados entre linhas | Associar NOT NULL quando necessário; proteger regra entre registros por protocolo adequado | P3, P9 |
| “O C só existe para completar a sigla.” | Advertência do pedido §3; sem fonte histórica | Provocação não é prova histórica | Não fazemos afirmação histórica; ensinamos regras de estado válido | P3, P9 |
| “I significa independência.” | Pedido §5/03; sem timestamp | Não define isolamento | Definimos interferência e garantias do nível escolhido | P2 |
| “PostgreSQL permite dirty read em READ UNCOMMITTED.” | Pedido §5/04; sem timestamp | Resultado impossível no teste proposto | PostgreSQL trata esse nível como READ COMMITTED; dirty read fica conceitual ou no apêndice InnoDB | P2, P6a/P6b |
| “REPEATABLE READ sempre permite phantom.” | Pedido §5/04; sem timestamp | Tabela mínima não descreve toda engine | PostgreSQL 18 impede phantom nesse nível, mas ainda permite anomalias de serialização | P2 |
| “Phantom é apenas INSERT.” | Pedido §5/04; sem timestamp | UPDATE pode mudar quem satisfaz o filtro | Mostramos alteração do conjunto também por UPDATE | P2 |
| “Snapshot estável protege toda decisão.” | Pedido §5/04; sem timestamp | Não elimina write skew | Separamos fotografia estável de execução equivalente à serial | P2, P9 |
| “Serializable põe tudo literalmente em fila.” | Pedido §5/04; sem timestamp | Confunde equivalência com implementação física | Resultado equivalente a alguma execução serial; pode abortar e exigir nova tentativa | P2 |
| “Lock impede qualquer SELECT; UPDATE precisa de FOR UPDATE antes.” | Pedido §5/05; sem timestamp | Ignora versões e locks da escrita | Leituras comuns usam visibilidade MVCC; UPDATE já adquire proteções | P2, P4 |
| “RowExclusiveLock prova lock de linha.” | Correção explícita do pedido §5/05; sem timestamp | O nome engana | É modo de lock de tabela; examinar tipo/recurso/espera, sem inferir linha pela presença isolada | P4 |
| “Commit grava todas as páginas; nada é escrito antes.” | Pedido §5/06; sem timestamp | Contradiz o protocolo de WAL | Separar persistência de WAL e páginas; gravações podem acontecer antes e depois | P5 |
| “Durável é imutável, disponível e tem backup.” | Pedido §5/06; sem timestamp | Mistura contratos distintos | Alterações posteriores são possíveis; disponibilidade, mídia, réplica e backup são discutidos separadamente | P5, P8 |
| “Timeout prova rollback.” | Pedido §5/07; sem timestamp | Resposta perdida pode vir após commit | Resultado pode ser incerto; repetir/consultar com identidade estável | P10 |
| “SELECT antes de INSERT basta para idempotência.” | Pedido §5/07; sem timestamp | Corrida entre consulta e inserção | Chave única, comparação de parâmetros e efeito registrados na mesma transação | P10, P13 |
| “SQL sempre tem ACID; NoSQL nunca.” | Pedido §5/08; sem timestamp | Categoria não determina API | DynamoDB é contraexemplo documentado, com escopo explicitado | P7a/P7b |
| “BASE permite dado errado ou perda arbitrária.” | Pedido §5/08; sem timestamp | Mistura propagação, invariante e durabilidade | Definimos convergência e seus limites sem aceitar toda violação como temporária | P14, P7a/P7b |

## Revisão técnica do complemento recebido

As paráfrases desta tabela vêm do arquivo complementar efetivamente lido. Os timestamps localizam a transcrição, que pode conter erros de reconhecimento de voz; as formulações corrigidas são nossas, não falas atribuídas ao apresentador. Não publicamos o insumo bruto.

| Paráfrase / localização | Problema ou limite | Formulação adotada | Documentação consultada |
|---|---|---|---|
| 0:00–0:44 e 39:07–40:21: ACID associado aos relacionais e NoSQL descrito como abandono dessas garantias | Modelo de dados não determina todas as APIs transacionais | Separar modelo, transação e replicação; DynamoDB oferece transações ACID com escopo delimitado | P7a, P7b |
| 11:11–11:22: lost update descrito como sobrescrever antes de o outro confirmar | Mistura atualização perdida com escrita sobre alteração não confirmada | No nosso PostgreSQL, escritores conflitantes esperam; o lost update inseguro usa cálculo antigo e sobrescreve após a outra confirmação | P2, P4 |
| 11:42–14:03: detalhes 50/80 e total 155 com mudança ainda não confirmada | Dirty read é conceitualmente possível em outras garantias, mas não é uma saída de SELECT comum no PostgreSQL | Em PostgreSQL mostramos ausência de dirty read; total misturado só incorpora a outra alteração após commit, em consulta posterior de RC | P2, P6b |
| 15:19–16:44: detalhes e total diferentes chamados de leitura não repetível | Duas consultas distintas primeiro demonstram partes de momentos diferentes | Acrescentamos a repetição literal da consulta para demonstrar non-repeatable read; não alegamos corrupção | P2 |
| 17:16–18:08: inserção altera o relatório | Uma soma diferente sozinha não classifica phantom | Repetimos filtro e mostramos mudança das linhas; UPDATE também pode alterar quem satisfaz o predicado | P2 |
| 21:06–21:43: snapshot estabelecido ao começar a transação | Momento depende da engine e do nível | No PG18 RR é estabelecido pela primeira instrução que não seja de controle transacional; BEGIN sozinho não congela a visão | P2 |
| 25:59–27:05: tabela de RR/phantom e ressalva de implementação | Garantias mínimas do padrão não esgotam a engine | Tabela conceitual separada: PG18 RR não permite phantom, mas permite write skew | P2, P9 |
| 23:42–24:48: Serializable associado a execução sem paralelismo e desempenho sempre decrescente | Equivalência serial não exige fila literal; custo depende da carga | Concorrência continua possível; conflitos podem abortar transações; não fornecemos ranking universal de desempenho | P2, P18 |
| 28:07–30:26 e 34:20–37:44: regras, visão das consultas e propagação tratadas sob consistência | São perguntas relacionadas, mas distintas | C de ACID: invariantes implementadas; visão temporal: snapshot/isolamento; atraso entre cópias: replicação | P3, P9, P19 |
| 32:22–33:46 e 36:01–38:25: afirmações sobre contadores e arquitetura de empresas | A transcrição não fornece evidência verificável da implementação dessas empresas | Omitimos essas alegações; usamos exemplos fictícios e não inferimos arquitetura a partir de contador arredondado | P19 sustenta o mecanismo genérico, não as empresas |
| 41:12–41:52: Redis descrito como não durável, seguido de ressalva sobre persistência | Estar em memória não determina uma única política de persistência | Redis oferece RDB, AOF, combinação ou ausência de persistência; a janela de perda depende da configuração e das falhas | P20 |
| 41:52–42:17: generalizações sobre ausência de schema/índices/garantias em NoSQL | Produtos distintos não têm um único contrato | Não reproduzimos catálogo universal; o capítulo 08 usa contraexemplo documentado e ensina comparar operações | P7a/P7b |

## Fontes originais consultadas

Cada link sustenta a afirmação indicada; não copiamos seções extensas. Os capítulos também colocam os links próximos das explicações relevantes.

| ID | Fonte / versão | Afirmação sustentada |
|---|---|---|
| P1 | [Transactions — PostgreSQL 18](https://www.postgresql.org/docs/18/tutorial-transactions.html) | Unidade transacional, BEGIN/COMMIT/ROLLBACK, savepoints, transação implícita |
| P2 | [Transaction Isolation — PostgreSQL 18](https://www.postgresql.org/docs/18/transaction-iso.html) | Visibilidade, níveis, anomalias, equivalência serial e retry |
| P3 | [Constraints — PostgreSQL 18](https://www.postgresql.org/docs/18/ddl-constraints.html) | PK/FK/UNIQUE/NOT NULL/CHECK e limites |
| P4 | [Explicit Locking — PostgreSQL 18](https://www.postgresql.org/docs/18/explicit-locking.html) | Locks de tabela/linha, espera e deadlocks |
| P5 | [Write-Ahead Logging — PostgreSQL 18](https://www.postgresql.org/docs/18/wal-intro.html) | Ordem de persistência, recuperação e páginas |
| P6a | [InnoDB Error Handling — MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html) | Rollback da instrução versus transação |
| P6b | [InnoDB Isolation Levels — MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html) | Níveis, leitura não confirmada e particularidades InnoDB |
| P7a | [Transactions — DynamoDB, guia vigente na consulta](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html) | Oferta de transações ACID não relacionais |
| P7b | [Transaction APIs — DynamoDB, guia vigente na consulta](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html) | Escopo de conta/Região, 100 ações, 4 MB e propagação |
| P8 | [Asynchronous Commit — PostgreSQL 18](https://www.postgresql.org/docs/18/wal-async-commit.html) | Contrato síncrono/assíncrono e janela de perda |
| P9 | [Application-level consistency — PostgreSQL 18](https://www.postgresql.org/docs/18/applevel-consistency.html) | Proteção de regras com concorrência |
| P10 | [Making retries safe with idempotent APIs — AWS Builders' Library](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Identidade da intenção, parâmetros e registro atômico |
| P11 | [UPDATE — PostgreSQL 18](https://www.postgresql.org/docs/18/sql-update.html) | Contagem de linhas e RETURNING |
| P12 | [ROLLBACK](https://www.postgresql.org/docs/18/sql-rollback.html), [SAVEPOINT](https://www.postgresql.org/docs/18/sql-savepoint.html) e [códigos de erro](https://www.postgresql.org/docs/18/errcodes-appendix.html) — PostgreSQL 18 | Recuperação e distinção de SQLSTATE |
| P13 | [INSERT — PostgreSQL 18](https://www.postgresql.org/docs/18/sql-insert.html) | Conflito de unicidade e ON CONFLICT |
| P14 | [BASE: An ACID Alternative — Dan Pritchett, ACM Queue, maio/junho de 2008; cópia do PDF original](https://awoc.wolski.fi/dlib/big-data/Pritchett08-baseACID-acmqueue.pdf) | Expansão de BASE e discussão de comportamento global; não é especificação de produto atual |
| P15 | [WAL settings — PostgreSQL 18](https://www.postgresql.org/docs/18/runtime-config-wal.html) | fsync, full_page_writes e configuração de confirmação |
| P16 | [MVCC introduction — PostgreSQL 18](https://www.postgresql.org/docs/18/mvcc-intro.html) | Leitura por versões |
| P17 | [Tutorial SQL — PostgreSQL 18: conceitos](https://www.postgresql.org/docs/18/tutorial-concepts.html), [inserção](https://www.postgresql.org/docs/18/tutorial-populate.html), [consulta](https://www.postgresql.org/docs/18/tutorial-select.html), [atualização](https://www.postgresql.org/docs/18/tutorial-update.html), [exclusão](https://www.postgresql.org/docs/18/tutorial-delete.html) | Vocabulário e SQL inicial do capítulo 00 |
| P18 | [Serialization Failure Handling — PostgreSQL 18](https://www.postgresql.org/docs/18/mvcc-serialization-failure-handling.html) e [Client Connection Defaults](https://www.postgresql.org/docs/18/runtime-config-client.html) | Retry integral e prazos de execução/espera |
| P19 | [Hot Standby — PostgreSQL 18](https://www.postgresql.org/docs/18/hot-standby.html) | Atraso de replay na réplica e visibilidade em novos snapshots |
| P20 | [Redis persistence — Redis Open Source, documentação vigente na consulta](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) | RDB, AOF, combinação, ausência de persistência e políticas de sincronização |
| P21 | [pg_locks — PostgreSQL 18](https://www.postgresql.org/docs/18/view-pg-locks.html) e [funções de informação](https://www.postgresql.org/docs/18/functions-info.html) | Limites da observação de locks de linha e identificação das sessões bloqueadoras |
| P22 | [Please stop calling databases CP or AP — Martin Kleppmann, 2015](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html) | Distinção entre linearizabilidade em CAP e consistência de ACID |
| P23 | [Window Functions — PostgreSQL 18](https://www.postgresql.org/docs/18/tutorial-window.html) | Detalhes e total mantidos numa única instrução com OVER |

O acesso direto à página ACM Queue de P14 retornou HTTP 403; não a declaramos lida. O PDF original em espelho foi aberto e lido. Não usamos snippets de busca como substituto do documento nem estendemos recomendações históricas a todo banco moderno.

## Como interpretar a validação

Uma previsão nos capítulos não é uma captura de saída. O laboratório separa revisão documental, resultados esperados e testes executados. Reconectar não simula queda de energia; teste em PostgreSQL não valida InnoDB; renderizar em Chromium não prova compatibilidade com todos os navegadores. Essas distinções fazem parte da evidência, não reduzem a necessidade de entregar os exemplos completos.
