# 06 — Bancos, transações, consistência e escala

**Base:** N04 organiza ACID/BASE/CAP e microsserviços. **Revisão:** alguns trechos apresentam equivalências e garantias excessivas; a correção está separada em [Revisões](../../references/study-notes-revisions.md).

## Três dimensões diferentes

**Modelo de dados e acesso:** relações, documentos, chave-valor, séries e consultas. **Transação:** operações que precisam cumprir propriedades de integridade e isolamento. **Replicação e disponibilidade:** o que os clientes observam quando cópias se atrasam ou perdem comunicação.

SQL/NoSQL não determina sozinho todas as outras dimensões. DynamoDB, por exemplo, documenta transações ACID. [Fonte T04](../../references/README.md#t04)

<a id="modelos"></a>
## Modelos de dados

| Modelo | Bom para | Na AWS |
|---|---|---|
| Relacional | Integridade, joins, transações entre entidades, consultas ad hoc | Aurora, RDS |
| Chave-valor | Acesso por chave em grande escala, com latência previsível | DynamoDB |
| Documento | Entidades de estrutura flexível, lidas inteiras | DocumentDB, DynamoDB |
| Colunar largo (wide-column) | Escrita massiva particionada por chave | Keyspaces (compatível com Cassandra) |
| Grafo | Relações de muitos para muitos, como redes de fraude | Neptune |
| Série temporal | Medições indexadas por tempo | Timestream for InfluxDB |
| Em memória | Cache, sessões, rankings | ElastiCache, MemoryDB |

Comece pelos padrões de acesso: quais consultas, com que frequência, volume e consistência. No DynamoDB, a modelagem parte das consultas, não das entidades, e mudar o padrão de acesso depois custa caro. No relacional, normalizar protege a integridade; desnormalizar acelera leituras ao custo de manter cópias coerentes.

<a id="indexacao"></a>
## Indexação

Um índice é uma estrutura extra que permite achar linhas sem varrer a tabela, em troca de espaço e de escrita mais cara: cada inserção ou atualização também atualiza os índices.

- **B-tree:** o padrão dos bancos relacionais; serve igualdade, intervalos e ordenação.
- **Hash:** só igualdade, sem intervalo.
- **Composto:** várias colunas, e a ordem importa. Um índice em (`conta`, `data`) serve “transações da conta X no mês”, mas não “todas as transações do dia”.
- **De cobertura:** contém todas as colunas da consulta, que é respondida sem ler a tabela.

No DynamoDB, a chave primária (partition key e, opcionalmente, sort key) define o acesso principal. Índices secundários globais (GSI) oferecem outra chave, com cópia assíncrona e leitura eventual; índices locais (LSI) mantêm a partition key, mudam a sort key e só podem ser criados junto com a tabela.

**Cuidado:** índice demais deixa a escrita lenta; índice de menos faz varreduras. Confirme com o plano de execução (`EXPLAIN`) e com as consultas reais, não com intuição.

<a id="acid-cap"></a>
## ACID não significa executar tudo uma transação por vez

Atomicidade trata a unidade que confirma ou desfaz. Consistência ACID preserva invariantes definidas. Isolamento determina interações permitidas entre transações. Durabilidade descreve preservação do commit dentro do modelo de falhas e configuração considerados.

Não presuma que todo leitor aguarda todo escritor. MVCC e níveis de isolamento permitem comportamentos de concorrência diferentes. [Fontes T06](../../references/README.md#t06), [T07](../../references/README.md#t07)

## CAP sem o atalho perigoso

Durante uma partição de rede, não é possível garantir simultaneamente consistência no sentido de linearizabilidade e disponibilidade nos termos do teorema para todas as operações. “Escolha dois” não é uma tabela universal SQL versus NoSQL. O C de CAP também não é o mesmo C de ACID. [Fonte T05](../../references/README.md#t05)

Pergunte qual operação pode esperar, qual leitura pode estar atrasada e que invariante não pode ser violada. Não classifique um banco inteiro por uma palavra sem delimitar configuração e acesso.

<a id="base-pacelc"></a>
## BASE e PACELC

**BASE** (basically available, soft state, eventually consistent) descreve sistemas que priorizam disponibilidade e aceitam consistência eventual: as réplicas convergem com o tempo, e leituras podem ver dado antigo nesse intervalo. Não é o oposto de ACID para o banco inteiro; um mesmo sistema pode ter operações com garantias fortes e outras eventuais.

**PACELC** completa o CAP: havendo partição (**P**), escolhe-se entre disponibilidade (**A**) e consistência (**C**); senão (**E**, de *else*), entre latência (**L**) e consistência (**C**). O segundo trecho é o que mais pesa no dia a dia, porque partições são raras e a escolha entre esperar a confirmação das réplicas ou responder logo acontece em toda escrita. Exemplos: o DynamoDB deixa escolher, por leitura, entre consistência eventual (padrão e mais barata) e leitura fortemente consistente; as global tables, no modo padrão, e o Aurora Global Database replicam entre regiões de forma assíncrona.

## Cenário de concorrência

Duas compras de R$ 800 consultam R$ 1.000 de limite disponível. Ler um valor correto em cada chamada não garante que ambas não reservem o mesmo limite. É preciso que a autoridade financeira faça a verificação e a mudança sob o contrato atômico necessário.

Esse raciocínio é um exercício de invariante, não uma recomendação para implementar um ledger com uma variável em memória. Use o [Case 10](../../cases/10-card-authorization-platform.md).

## Perguntas de aprofundamento

“Qual unidade é atômica?” “Uma leitura forte vê um evento ainda não ingerido?” “Como detectar uma chave quente?” “O que uma réplica atrasada pode devolver após failover?”

## Perguntas de entrevista

1. Um banco relacional está no limite de CPU nos horários de pico. Que hipóteses você testa antes de escalar?
2. Que perguntas você faria a um cliente antes de recomendar um banco de dados?
3. Para o extrato de transações de milhões de clientes, Aurora ou DynamoDB? Que critérios decidem?
4. O que pode dar errado ao migrar um banco transacional crítico para a AWS, e como você reduziria o risco?
5. Uma tabela do DynamoDB tem uma partição muito mais acessada que as outras. Como você identifica e corrige?

Escala de dados está em [SD02](../system-design/02-data-at-scale.md); consistência entre regiões, nas [perguntas de design](../../interview/simulations/03-system-design/design-questions.md); migração, em [F12](12-resilience-migration.md).

## Exercício

Compare Aurora e DynamoDB para uma operação específica do [Case 01](../../cases/01-payment-processing-pix.md). Defina o acesso antes da tecnologia, escreva uma invariante e proponha um teste com chamadas concorrentes. Não conclua que um banco serve para tudo porque passou nesse teste.
