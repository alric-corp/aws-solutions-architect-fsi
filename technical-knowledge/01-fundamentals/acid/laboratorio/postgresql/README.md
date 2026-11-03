# Preparar o PostgreSQL local

[Laboratório](../README.md) · [Roteiro A/B](roteiro.md) · [SQL para copiar](sql-executavel.md)

Use uma instalação **PostgreSQL 18** cujo diretório `bin` contenha `postgres`, `initdb`, `pg_ctl`, `createdb` e `psql`. A instalação fornece programas; não vamos conectar ao serviço pessoal ou corporativo. O roteiro cria seu próprio cluster, isto é, um conjunto independente de arquivos de banco, dentro de `.site/acid-lab` deste checkout. Não lê `DATABASE_URL` nem credenciais do projeto.

O executor desta entrega usou PostgreSQL **18.1**, compilado a partir do arquivo oficial `postgresql-18.1.tar.bz2`, em diretório privado de teste. Não é uma recomendação de versão de manutenção. Para repetir, use PostgreSQL 18 disponível no seu ambiente, registre `SELECT version()` e compare os resultados. Não substitua por SQLite.

## Inicializar uma única vez

No seu worktree, ajuste apenas o caminho de `PG_BIN` para a instalação local. Este exemplo usa shell POSIX/bash. O script não sobrescreve um diretório existente.

```bash
export PG_BIN=/caminho/da/instalacao/postgresql18/bin
export ACID_LAB=technical-knowledge/01-fundamentals/acid/laboratorio/postgresql
bash "$ACID_LAB/local.sh" init
bash "$ACID_LAB/local.sh" start
bash "$ACID_LAB/local.sh" load
```

`init` cria dados fictícios num diretório privado, com permissões locais restritas. `start` usa somente um **socket Unix**, um ponto de comunicação local dentro daquele diretório; TCP está desativado por `listen_addresses=''`. O número 55439 identifica o socket, não abre porta de rede. `load` cria apenas o banco novo `acid_lab`; se já existir, falha. Não aponta para serviço global, volume Docker ou porta de outro projeto. Se o sandbox bloquear memória compartilhada ou conexão ao socket, use o mecanismo de permissão do ambiente, mantendo o mesmo cluster isolado.

Se a instalação não puder ser criada ou executada, siga com previsão e revisão do SQL. Registre “não executado”, a versão pretendida e a limitação; uma previsão correta não é uma saída medida.

## Abrir A e B de verdade

Em **dois terminais**, execute o mesmo comando abaixo. Cada chamada abre um processo `psql` independente, ligado a uma conexão diferente. Duas abas de uma ferramenta gráfica podem compartilhar conexão: confira em cada uma.

```bash
bash "$ACID_LAB/local.sh" psql
```

Em A e em B, configure o cliente e observe a identidade:

```sql
\set AUTOCOMMIT on
\set ON_ERROR_STOP off
\set VERBOSITY verbose
SET statement_timeout = '30s';
SET lock_timeout = '20s';
SELECT version(), current_database(), pg_backend_pid();
SHOW transaction_isolation;
```

Os PIDs devem ser diferentes e o banco deve ser `acid_lab`. `AUTOCOMMIT on` é a configuração do cliente `psql`: fora de `BEGIN`, cada comando é confirmado separadamente. Dentro de `BEGIN`, o bloco fica aberto até `COMMIT` ou `ROLLBACK`. Os exercícios especificam nível e ordem. `ON_ERROR_STOP off` permite aprender recuperação depois de erro; não significa ignorar erro no código da aplicação.

## Estado inicial e verificação

| Tabela | Estado inicial | Regra do exercício |
|---|---|---|
| contas | Ana 100000; Bruno 10000 centavos | Valor positivo, contas distintas/existentes; saldo não negativo; total 110000 preservado na transferência |
| produtos | SKU-1, estoque 1, versão 0 | Cada compra aprovada consome quantidade positiva; carrinho não reserva |
| operacoes / pedidos | Vazias | Uma identidade estável registra uma intenção e seu resultado |
| turno | Ana e Bruno presentes | Pelo menos um presente, regra usada no aprofundamento |
| vendas_relatorio | produto-1: 10 × 500; produto-2: 20 × 400 | Subtotais 5000/8000, total 13000 centavos |

Veja o SQL completo na [página de código](sql-executavel.md). No cliente, `\i` carrega um arquivo a partir do caminho local. As instruções `\...` pertencem ao `psql`, não à linguagem SQL. Para usar outro cliente, execute apenas as instruções SQL e configure o autocommit nele.

```sql
\i technical-knowledge/01-fundamentals/acid/laboratorio/postgresql/04-verificar.sql
```

O reset exige que A/B já tenham encerrado suas transações. Em cada uma execute `ROLLBACK;`, depois saia com `\q`. No terminal:

```bash
bash "$ACID_LAB/local.sh" reset
```

Ele usa `TRUNCATE` com nomes explícitos, sem `CASCADE`, apenas nas seis tabelas do laboratório, com timeout de lock de dois segundos. Reinicia também os números dos pedidos. Reset não deve ser executado durante um exercício concorrente.

## Executar a suíte coordenada

Feche A/B. A suíte cria suas próprias A, B e observadora M, confere três PIDs, coordena comandos e confirma esperas consultando `pg_blocking_pids`. Intervalos curtos de sondagem não determinam a intercalação; o estado observado determina o avanço. Há limites de espera e timeout de instrução, recuperação com rollback e fechamento dos clientes no final. O deadlock aceita qualquer vítima.

```bash
bash "$ACID_LAB/local.sh" test
```

O processo deve terminar com **14 linhas PASS** e um relatório JSON. O teste reinicia os dados entre cenários e os deixa no estado inicial. O relatório detalhado é local em `.site/acid-review/laboratorio-resultados.json`, não conteúdo de aula. Se falhar, preserve a saída como falha: não altere o esperado para escondê-la.

## Parar sem apagar

Feche os clientes e pare somente este cluster:

```bash
bash "$ACID_LAB/local.sh" stop
```

Nada é removido. Uma futura sessão usa `start`, sem repetir `init` ou `load`. Não há `DROP DATABASE`, remoção de volumes nem desligamento de serviço global neste roteiro. O encerramento limpo não equivale a uma queda de energia e não prova a durabilidade em todo tipo de falha.
