# 06 — Durabilidade: o que fica depois do commit?

[← 05 — Locks e concorrência](05-locks-concorrencia-deadlocks.md) · [Índice](README.md) · [Próxima: 07 — Timeout e idempotência →](07-timeout-idempotencia.md)

A Loja Horizonte confirmou a compra da última unidade. A pessoa fecha a página e volta no dia seguinte. Se o pedido desaparecesse porque o processo do banco reiniciou, o significado de “compra confirmada” seria fraco demais. A durabilidade trata desse compromisso de preservar alterações confirmadas sob as condições de falha e configuração assumidas.

**Responda antes de abrir:** depois do `COMMIT`, ainda posso alterar ou excluir os dados?

<details><summary>Resposta comentada</summary>

Sim, se uma operação posterior tiver permissão e respeitar as regras. Durabilidade preserva o efeito confirmado contra falhas cobertas pelo contrato; não torna a linha imutável. A alternativa “nada mais pode mudar” confunde resistência a falhas com proibição de novas operações. Um `DELETE` confirmado depois é outra mudança durável.

</details>

## O problema de trabalhar só na memória

Memória volátil é o espaço de trabalho que pode perder seu conteúdo quando falta energia. Armazenamento persistente, como um SSD, é projetado para conservar dados sem alimentação contínua. **Persistência** é essa permanência além da execução que produziu a informação; não significa que o dispositivo seja indestrutível.

O SGBD usa memória para trabalhar com eficiência. Uma página é um bloco de armazenamento que pode conter partes de tabelas ou índices; não é a mesma coisa que uma linha. Não seria correto concluir que confirmar exige gravar imediatamente todas as páginas modificadas. Também seria incorreto concluir que nada é escrito antes da confirmação.

O PostgreSQL usa **WAL**, *Write-Ahead Logging*: um registro das mudanças que permite recuperação. De forma simplificada, os registros correspondentes precisam estar persistidos antes de as mudanças nas páginas de dados serem persistidas. Com confirmação síncrona local, o sucesso do commit espera a persistência do WAL necessária para recuperar a transação. As páginas podem ser gravadas em outro momento. Na recuperação, o banco pode refazer mudanças a partir do WAL. [WAL no PostgreSQL 18](https://www.postgresql.org/docs/18/wal-intro.html)

A analogia é uma oficina que registra serviços em um diário resistente antes de atualizar fichas distribuídas pelos armários. Se o trabalho é interrompido, o diário permite reconstruir as fichas. A correspondência é entre diário/WAL e fichas/páginas. O limite: o WAL é um protocolo técnico com ordenação e sincronização; escrever em qualquer caderno, ou apenas chamar uma função de gravação, não demonstra que o dispositivo persistiu os bytes.

## Qual compromisso estamos assumindo?

Nos exercícios, usamos tabelas permanentes, `synchronous_commit = on`, `fsync = on` e `full_page_writes = on`, sem reduzir proteções para acelerar testes. O armazenamento e o sistema operacional precisam cumprir corretamente os pedidos de persistência. Não há réplica neste laboratório. `synchronous_commit = on` não cria uma réplica nem um backup. [Configuração de WAL](https://www.postgresql.org/docs/18/runtime-config-wal.html)

| Falha ou necessidade | O que avaliar |
|---|---|
| Uma conexão ou processo encerra | Transações não confirmadas são desfeitas; o servidor pode precisar recuperar após falha do processo |
| Reinício abrupto do servidor | WAL e armazenamento íntegros permitem recuperar as mudanças confirmadas sob as premissas declaradas |
| Dispositivo perde todos os dados | WAL no mesmo dispositivo não oferece uma cópia independente |
| Serviço precisa continuar acessível | Replicação e mecanismos de disponibilidade são outro assunto; durável não significa imediatamente disponível |
| Exclusão acidental confirmada | Pode ser replicada também; recuperação histórica depende de backup e política de recuperação |
| Perda de todas as cópias | Durabilidade não promete reconstruir informação sem nenhum registro sobrevivente |

Backup é uma cópia recuperável mantida segundo uma política. Replicação mantém outras cópias em operação, com garantias próprias de propagação. São mecanismos diferentes; nenhum aparece automaticamente porque escrevemos `COMMIT`.

## Experimento acompanhado: confirmar e reencontrar

**Contrato deste exemplo:** PostgreSQL 18, `READ COMMITTED`, `psql` com autocommit ligado fora de `BEGIN`. Prepare o estado inicial pelo reset do [laboratório](laboratorio/README.md), encerrando antes as outras transações. Ana tem 100000 centavos e Bruno 10000. Usamos a função já apresentada em atomicidade para transferir 10000 centavos. Estes são comandos do roteiro com resultados **esperados**; a execução efetivamente medida está no relatório laboratorial.

Na sessão A, confira as premissas e confirme:

```sql
SHOW server_version;
SHOW transaction_isolation;
SHOW synchronous_commit;
SHOW fsync;
SHOW full_page_writes;
BEGIN ISOLATION LEVEL READ COMMITTED;
SELECT acid_lab.transferir('ana', 'bruno', 10000);
COMMIT;
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
```

O resultado esperado é Ana com 90000 e Bruno com 20000. Encerre **essa conexão** com `\q` no `psql`. Abra outra usando exatamente o destino local explícito do laboratório e execute:

```sql
SELECT pg_backend_pid();
SELECT id, saldo_centavos FROM acid_lab.contas ORDER BY id;
```

| Momento | Ana | Bruno |
|---|---:|---:|
| Antes | R$ 1.000 | R$ 100 |
| Depois do commit | R$ 900 | R$ 200 |
| Nova conexão | R$ 900 | R$ 200 |

Reconectar demonstra que a mudança não dependia de permanecer naquela conexão. Não demonstra resistência a queda de energia: a memória e os processos do servidor podem ter continuado intactos. Uma reinicialização **limpa** demonstra recuperação após encerramento ordenado, também diferente de falha abrupta. Não provoque falhas em serviços alheios. O reset restrito restaura os dados do exercício; ele próprio altera o banco novamente.

**Responda antes de abrir:** o teste reencontrou os saldos depois de reconectar. Qual conclusão é sustentada: “resiste a qualquer perda física” ou “a informação confirmada sobreviveu à troca de conexão”?

<details><summary>Resposta comentada</summary>

A segunda. A conexão é um participante, não o armazenamento inteiro. O teste não desligou o servidor, não removeu energia e não danificou mídia. Ampliar a conclusão para essas falhas seria afirmar algo que o experimento não mediu. Documentação e testes de recuperação têm papéis complementares.

</details>

## A ressalva do commit assíncrono

Uma configuração pode permitir responder ao cliente antes de o WAL correspondente chegar ao armazenamento persistente. É o **commit assíncrono**, associado a `synchronous_commit = off`. Uma queda durante essa janela pode perder confirmações recentes. Isso muda o contrato de durabilidade; não é uma licença para corromper arbitrariamente o banco. No laboratório mantemos `synchronous_commit = on` e `fsync = on`. [Commit assíncrono no PostgreSQL 18](https://www.postgresql.org/docs/18/wal-async-commit.html)

## Complemento: estar em memória não decide tudo

O novo insumo menciona Redis como banco em memória e depois ressalva que há persistência. A revisão técnica precisa preservar essa ressalva: Redis pode usar snapshots RDB, log AOF, os dois ou nenhuma persistência. A política de sincronização do AOF e o intervalo dos snapshots mudam a janela de perda possível. Uma cópia RDB de um instante não é o snapshot de visibilidade de uma transação que estudamos no capítulo 04: a palavra é usada para mecanismos diferentes. Não vamos instalar Redis nem comparar configurações por desempenho aqui. [Documentação oficial de persistência do Redis](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)

Quando isso importa no trabalho? Ao interpretar “sucesso” de uma gravação, especificar recuperação e conferir configurações de confirmação. Um estado que permaneceu após uma consulta é evidência limitada. Em linguagem simples: o D é a promessa de lembrar o que confirmou, dentro de um contrato explícito — e esse contrato precisa de armazenamento confiável.

[Próxima: 07 — Timeout e idempotência →](07-timeout-idempotencia.md)
