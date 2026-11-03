# Glossário para acompanhar a trilha

[Índice](README.md) · [Começar pelas transações](00-transacoes-do-zero.md)

Use esta página quando uma palavra atrapalhar a leitura. Os capítulos apresentam o problema e o mecanismo; este glossário apenas ajuda a reencontrar o significado.

| Termo | Significado nesta trilha |
|---|---|
| Banco de dados | Conjunto organizado de dados; no laboratório, um banco dedicado no servidor local |
| SGBD / engine | Software que gerencia dados, executa operações e implementa garantias; aqui PostgreSQL, no comparativo InnoDB dentro do MySQL |
| SQL / cliente | Linguagem para consultar e mudar dados / programa que envia comandos, como `psql` |
| Tabela / linha / coluna | Conjunto estruturado / um registro / um atributo desse registro |
| Chave | Valor ou conjunto de valores usado para identificar um registro; a chave primária é única e não nula |
| Consulta | Pedido ao banco para obter ou processar dados; em uso cotidiano, costuma significar um `SELECT` |
| Conexão / sessão | Canal de comunicação / contexto de execução no servidor, com configurações e transações; duas abas podem compartilhar uma conexão |
| Transação | Unidade de trabalho que confirma ou desfaz mudanças em conjunto |
| Confirmar / desfazer | Tornar os efeitos da transação confirmados (`COMMIT`) / abandonar seus efeitos não confirmados (`ROLLBACK`) |
| Autocommit | Modo do cliente em que cada comando fora de um bloco explícito é normalmente confirmado em sua própria transação |
| Savepoint | Ponto intermediário ao qual se pode desfazer parte de uma transação ainda aberta |
| Invariante / restrição | Regra que deve permanecer verdadeira / mecanismo do banco que implementa uma condição, como `CHECK` ou `UNIQUE` |
| Concorrência / corrida | Operações que se sobrepõem no tempo / resultado dependente de uma intercalação desprotegida |
| Isolamento | Garantias sobre o que uma transação observa e como interage com outras |
| Versão | Estado de um dado em certo momento; uma coluna de versão também pode contar mudanças para detectar conflito |
| Snapshot | Visão de quais alterações confirmadas podem ser vistas em determinado momento lógico; não é backup |
| MVCC | Controle de concorrência com múltiplas versões, permitindo leituras segundo a visibilidade da transação |
| Lock | Controle de acesso conflitante a um recurso, mantido segundo o protocolo do banco; pode causar espera |
| Deadlock | Ciclo de espera: participantes seguram recursos que os outros precisam; o banco pode abortar uma transação |
| Serial / Serializable | Uma execução por vez / resultado equivalente a alguma execução serial, mesmo havendo trabalho concorrente |
| Anomalia | Comportamento de concorrência que pode surpreender ou invalidar uma decisão; o nível escolhido determina quais são permitidos |
| Persistência / WAL | Permanência dos registros além da execução / registro antecipado de mudanças usado na recuperação |
| Timeout | Prazo de espera esgotado em um componente; sozinho não informa o resultado do commit |
| Idempotência | Repetir a mesma operação sem acrescentar outro efeito equivalente |
| Réplica / backup | Cópia mantida em operação por propagação / cópia mantida para recuperação |
| Fronteira transacional | Conjunto de efeitos que participam da mesma unidade de confirmação |

ACID reúne **Atomicidade, Consistência, Isolamento e Durabilidade**. Nenhuma definição isolada substitui identificar a regra, a unidade de confirmação, as operações concorrentes e as falhas assumidas no exemplo.
