# SD02 — Dados em Escala

**Origem:** seções que estavam em F02, F06 e F07.

## Escalar um banco: investigar primeiro

Comece pela consulta e pelo recurso limitante. Índices, planos, conexões, cache, capacidade, réplicas e particionamento resolvem problemas diferentes. Réplica de leitura não amplia automaticamente a autoridade de escrita. Cache introduz uma decisão de atualidade. Particionar pode afetar transações entre entidades.

A conversa deve ligar escolhas ao workload: proporção de leitura/escrita, tamanho, cardinalidade, distribuição das chaves, transações e requisitos de recuperação.

<a id="cache"></a>
## Estratégias de cache

| Estratégia | Como funciona | Risco principal |
|---|---|---|
| Cache-aside (lazy loading) | A aplicação lê do cache; se não encontra, lê do banco e grava no cache | Primeira leitura lenta; dado defasado até expirar ou ser invalidado |
| Read-through | A própria camada de cache busca no banco quando não encontra | Depende de suporte da camada de cache |
| Write-through | Toda escrita atualiza banco e cache juntos | Escrita mais lenta; cache cheio de dados pouco lidos |
| Write-behind (write-back) | Escreve no cache e grava no banco depois, de forma assíncrona | Perda de dados se o cache falhar antes de gravar |

Complementos: TTL para limitar a defasagem, invalidação explícita quando o dado muda e política de despejo (LRU, LFU) quando a memória enche. Na AWS: ElastiCache (Valkey, Redis OSS ou Memcached) e DynamoDB Accelerator (DAX) na aplicação; CloudFront na borda.

**Cuidado:** quando uma chave popular expira, muitas requisições podem ir ao banco ao mesmo tempo (cache stampede). Use expiração com variação aleatória, uma única recarga por chave ou atualização antecipada. E decida o que pode ser servido defasado: catálogo de produtos pode; saldo usado para autorizar um débito, não ([Case 10](../../cases/10-card-authorization-platform.md)).

<a id="replicacao"></a>
## Replicação

Manter cópias dos dados em vários nós serve para disponibilidade, leitura em escala e proximidade dos usuários. Os modelos principais:

- **Líder único:** todas as escritas passam por um líder, que replica para os seguidores. Simples e sem conflito de escrita; o líder limita a escrita e precisa de failover.
- **Multi-líder:** vários nós aceitam escrita (por exemplo, um por região) e precisam resolver conflitos.
- **Sem líder (quórum):** clientes escrevem e leem em vários nós. Com N réplicas, escrever em W e ler em R, com W + R > N, faz cada leitura alcançar ao menos uma cópia atualizada.

**Síncrona ou assíncrona:** a síncrona confirma depois que a réplica gravou (sem perda no failover, mais latência); a assíncrona confirma antes (mais rápida, mas o failover pode perder as últimas escritas, que é o RPO). Réplicas assíncronas também geram leituras defasadas: o cliente grava e, ao ler de outra réplica, não vê o que acabou de gravar.

Na AWS: o RDS Multi-AZ mantém um standby síncrono em outra AZ; as réplicas de leitura do RDS são assíncronas; o Aurora grava seis cópias em três AZs, e as réplicas compartilham esse armazenamento; o Aurora Global Database replica para outras regiões de forma assíncrona, normalmente com menos de um segundo de atraso; as global tables do DynamoDB, no modo padrão, aceitam escrita em várias regiões e resolvem conflitos pela última escrita.

**Cuidado:** réplica não é backup: exclusão e corrupção também são replicadas. Com escrita em várias regiões e “última escrita vence”, duas operações sobre o mesmo saldo podem se sobrescrever; para dinheiro, mantenha um escritor por escopo ([Case 09](../../cases/09-multi-region-internet-banking.md)).

<a id="particionamento"></a>
## Particionamento e sharding

Particionar divide os dados para que cada nó guarde e atenda uma parte; sharding é o nome comum quando as partes ficam em servidores diferentes. O resumo do padrão está em [Sharding](#sharding).

| Estratégia | Como distribui | Vantagem | Risco |
|---|---|---|---|
| Por intervalo (range) | Faixas da chave, como datas ou A–M | Consultas por intervalo eficientes | Pontos quentes, como “hoje” |
| Por hash | O hash da chave decide a partição | Distribuição uniforme | Perde consultas por intervalo |
| Consistent hashing | Hash num anel; cada nó cuida de um trecho | Acrescentar um nó move poucos dados | Mais complexo; pede nós virtuais para equilibrar |
| Por diretório | Uma tabela de consulta diz onde está cada chave | Flexível; permite mover clientes | O diretório vira dependência crítica |
| Geográfico | Pela região do usuário | Latência e residência de dados | Operações entre regiões ficam caras |

No DynamoDB, a partition key define a distribuição: escolha uma chave de alta cardinalidade e acesso bem distribuído. Para uma chave muito quente, uma técnica é acrescentar um sufixo (write sharding) e juntar os resultados na leitura.

**Cuidado:** consultas que não usam a chave de partição precisam visitar todas as partições ou de um índice global, mantido de forma assíncrona; transações entre partições ficam mais caras ou deixam de ser atômicas.

<a id="sharding"></a>
## Sharding

Como fatiar uma pizza grande: os dados se distribuem entre vários nós, e cada shard guarda um subconjunto, reduzindo a carga sobre cada um; shards perto de quem usa os dados também reduzem a latência. MongoDB e Cassandra usam esse modelo. Na AWS: partições do DynamoDB pela partition key, Aurora PostgreSQL Limitless Database e shards no ElastiCache, no Kinesis e no OpenSearch.

**Cuidado:** a chave de shard decide tudo: cardinalidade, distribuição e padrão de acesso. Uma chave quente concentra carga, consultas e transações entre shards ficam caras, e refazer a divisão é difícil (estratégias em [Particionamento e sharding](#particionamento)).

## Para treinar

1. Como você escolheria a chave de shard de uma tabela de transações?
