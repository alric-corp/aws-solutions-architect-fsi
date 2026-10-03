# 05 — Armazenamento: da interface à recuperação

**Base:** N05 pergunta SAN, NAS, DAS e RAID; N01 compara S3, EBS e EFS. **Complemento:** conectar a interface ao padrão de acesso, às falhas e ao custo.

## Modelos que deve distinguir

DAS é armazenamento ligado diretamente ao host. SAN oferece acesso em blocos por uma rede de armazenamento, com tecnologias como Fibre Channel ou iSCSI. NAS expõe arquivos pela rede, com protocolos como NFS ou SMB. Não classifique apenas por ser “um disco remoto”. [Fonte T25](../../references/README.md#t25)

Objetos, blocos e arquivos também têm contratos diferentes na nuvem. S3 é armazenamento de objetos; EBS oferece volumes em blocos; EFS e opções FSx atendem necessidades de sistemas de arquivos com características próprias. Avalie a opção concreta, em vez de generalizar todos os serviços da categoria. [Fonte T11](../../references/README.md#t11)

## Pergunta inicial

“Tenho uma aplicação que usa diretórios compartilhados; posso apontá-la para um bucket?”

Antes de responder, investigue operações esperadas, concorrência, locks, metadados, renomeações, latência e compatibilidade da aplicação. Uma ferramenta de montagem não garante equivalência semântica completa com o sistema de arquivos anterior.

## RAID e backup

RAID combina discos com diferentes compromissos de capacidade, desempenho e tolerância conforme o nível. Ele não cria por si só uma cópia histórica isolada de exclusão, corrupção ou credencial comprometida. Um teste de recuperação precisa considerar o tipo de falha que você deseja suportar.

Pergunte também se a aplicação tolera perder o armazenamento local do host. Persistência esperada e tolerância a interrupção precisam ser documentadas, não deduzidas do nome do serviço.

<a id="raid"></a>
## Níveis de RAID

| Nível | Como funciona | Tolera | Capacidade útil | Observação |
|---|---|---|---|---|
| RAID 0 | Striping: dados divididos entre discos | Nenhuma falha | 100% | Mais desempenho; perder um disco perde tudo |
| RAID 1 | Espelhamento | Falha de um disco do par | 50% | Boa leitura; cada escrita vai para os dois discos |
| RAID 5 | Striping com paridade distribuída | Falha de um disco | (n−1)/n | Penalidade de escrita; reconstrução lenta e arriscada em discos grandes |
| RAID 6 | Paridade dupla | Falha de dois discos | (n−2)/n | Mais proteção, escrita ainda mais cara |
| RAID 10 | Espelhos combinados com striping | Um disco por espelho | 50% | Bom equilíbrio para bancos com muita escrita |

Na AWS, o EBS já replica cada volume dentro da AZ. RAID 0 entre volumes serve para somar desempenho além do limite de um volume; a AWS não recomenda RAID 5 ou 6 com EBS, porque a escrita de paridade consome parte do IOPS.

## Desempenho e preço

IOPS, throughput e latência medem propriedades distintas. Muitas operações pequenas podem ter um gargalo diferente de poucos arquivos grandes. Compare o workload real, incluindo leitura, escrita, sincronização, concorrência, capacidade e movimentação de dados.

Não some somente GB armazenados: recuperação, requisições, replicação, transferências e operação podem mudar a decisão. As cifras precisam de região, data e configuração verificadas antes de serem apresentadas como orçamento.

<a id="io"></a>
## Padrões de I/O

- **Sequencial ou aleatório:** ler um arquivo grande do início ao fim é sequencial e limitado pelo throughput (MB/s); um banco buscando páginas espalhadas faz I/O aleatório, limitado por IOPS e latência.
- **Tamanho do I/O:** throughput ≈ IOPS × tamanho de cada operação. Muitas operações pequenas esgotam o IOPS antes do throughput; poucas grandes, o contrário.
- **Leitura ou escrita:** escrita costuma custar mais (espelhamento, paridade, journaling, `fsync`), e a proporção entre as duas muda a escolha.
- **Fila e latência:** mais operações em paralelo (profundidade de fila) aumentam o IOPS até o limite do dispositivo; depois disso, só aumentam a latência.

Na AWS, o gp3 permite configurar IOPS e throughput separadamente; o io2 atende latência baixa e IOPS altos e consistentes; st1 e sc1 (HDD) servem a leituras sequenciais grandes e baratas. Em sistemas distribuídos, o disco de um nó ainda importa: um nó com I/O saturado fica lento e pode arrastar réplicas, filas e timeouts por toda a cadeia.

## Perguntas de aprofundamento

“Quem precisa montar ou ler o dado?” “Qual falha apaga a única cópia?” “A aplicação depende de POSIX?” “Qual o tempo de restauração?” “Quem pode ler versões antigas?”

## Perguntas de entrevista

1. Um sistema legado grava arquivos em um diretório compartilhado. S3, EBS ou EFS: o que você avaliaria antes de escolher?
2. Como você protegeria e organizaria os dados brutos e tratados de um data lake bancário?
3. Documentos precisam ser guardados por anos, mas raramente são lidos. Como reduzir o custo sem perder a capacidade de recuperação?

Para o data lake, veja também [F10](10-data-analytics-ai.md) e o [Case 08](../../cases/08-financial-data-lake.md).

## Exercício

No [Case 04](../../cases/04-kyc-account-opening.md), acompanhe um documento: upload, versão aprovada, processamento e retenção. Explique por que nome de arquivo não é prova suficiente de que se processou a mesma versão.

No [Case 08](../../cases/08-financial-data-lake.md), compare documentos de origem, arquivos analíticos e resultados de consulta. O dado pode ter sido protegido na entrada e exposto na saída.

**Entrega:** uma recomendação com interface, padrão de acesso, proteção e recuperação definidos. Evite responder apenas “S3 porque é barato”.
