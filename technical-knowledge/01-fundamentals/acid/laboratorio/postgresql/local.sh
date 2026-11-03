#!/usr/bin/env bash
# Invocar com bash; não instala nem altera serviços globais.
set -euo pipefail
lab_dir="$(cd "$(dirname "$0")" && pwd -P)"
repo_dir="$(cd "$lab_dir/../../../../.." && pwd -P)"
run_dir="$repo_dir/.site/acid-lab"
data_dir="$run_dir/data"
socket_dir="$run_dir/socket"
port=55439
: "${PG_BIN:?Defina PG_BIN para a pasta bin de uma instalação PostgreSQL 18}"
export PATH="$PG_BIN:$PATH"
export PGPASSFILE="$run_dir/empty-password-file" PGSERVICEFILE=/dev/null
unset PGHOST PGPORT PGDATABASE PGUSER PGSERVICE PGOPTIONS PGPASSWORD
command_name="${1:-help}"
case "$command_name" in
  init)
    test ! -e "$run_dir" || { echo 'Diretório já existe: não sobrescrevo'; exit 1; }
    pg_version_text="$("$PG_BIN/postgres" --version)"
    case "$pg_version_text" in
      *"PostgreSQL) 18."*) ;;
      *) echo 'Exige PostgreSQL 18'; exit 1 ;;
    esac
    mkdir -m 700 -p "$run_dir" "$socket_dir"
    printf '%s\n' "$repo_dir" > "$run_dir/OWNER"
    touch "$PGPASSFILE"; chmod 600 "$PGPASSFILE"
    initdb -D "$data_dir" --auth-local=trust --auth-host=reject --no-locale -E UTF8
    ;;
  start|stop|psql|test|load|reset)
    test "$(cat "$run_dir/OWNER")" = "$repo_dir"
    test "$(cat "$data_dir/PG_VERSION")" = 18
    case "$command_name" in
      start) pg_ctl -D "$data_dir" -l "$run_dir/server.log" -o "-k $socket_dir -p $port -c listen_addresses='' -c unix_socket_permissions=0700" -w start ;;
      stop) pg_ctl -D "$data_dir" -m fast -w stop ;;
      psql) exec psql -X -h "$socket_dir" -p "$port" -d acid_lab ;;
      load)
        createdb -h "$socket_dir" -p "$port" acid_lab
        for f in 00-schema.sql 01-seed.sql 02-operacoes.sql; do
          psql -X -v ON_ERROR_STOP=1 -h "$socket_dir" -p "$port" -d acid_lab -f "$lab_dir/$f"
        done ;;
      reset) psql -X -h "$socket_dir" -p "$port" -d acid_lab -f "$lab_dir/03-reset.sql" ;;
      test) python3 "$lab_dir/testar.py" "$PG_BIN/psql" "$socket_dir" "$port" ;;
    esac ;;
  *) echo 'Uso: PG_BIN=/caminho/bin bash local.sh init|start|load|psql|test|reset|stop'; exit 1 ;;
esac
