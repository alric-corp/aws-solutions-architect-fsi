#!/usr/bin/env python3
"""Teste real com três psql persistentes; nenhuma biblioteca Python adicional.
Só aceita o socket criado por local.sh, dentro deste checkout. Não lê URLs.
"""
import concurrent.futures as cf
import json
import os
from pathlib import Path
import queue
import subprocess
import sys
import threading
import time
import uuid

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
PSQL, SOCKET, PORT = sys.argv[1:]
assert Path(SOCKET).resolve() == ROOT / '.site/acid-lab/socket', 'Socket alheio recusado'
assert (ROOT / '.site/acid-lab/OWNER').read_text().strip() == str(ROOT)
ENV = {k: v for k, v in os.environ.items() if not k.startswith('PG')}
ENV.update(PGPASSFILE=str(ROOT / '.site/acid-lab/empty-password-file'), PGSERVICEFILE='/dev/null')
LIMIT = 12

class Session:
    def __init__(self, name):
        self.name = name
        self.process = subprocess.Popen([PSQL, '-X', '-qAt', '-h', SOCKET, '-p', PORT,
            '-d', 'acid_lab', '-v', 'VERBOSITY=verbose'], stdin=subprocess.PIPE,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1, env=ENV)
        self.q = queue.Queue()
        def read():
            for line in self.process.stdout:
                self.q.put(line.rstrip('\n'))
            self.q.put('__EOF__')
        self.thread = threading.Thread(target=read, daemon=True)
        self.thread.start()
        self.run("SET statement_timeout='8s'; SET lock_timeout='6s'; SET deadlock_timeout='100ms'; SET application_name='acid-test-" + name + "'")
        self.pid = int(self.ok('SELECT pg_backend_pid()')[-1])
    def run(self, sql):
        marker = '__ACID_' + uuid.uuid4().hex
        self.process.stdin.write(sql + ";\n\\echo " + marker + "\n")
        self.process.stdin.flush()
        lines = []
        end = time.monotonic() + LIMIT
        while True:
            line = self.q.get(timeout=max(.01, end-time.monotonic()))
            if line == marker:
                return lines
            if line == '__EOF__':
                raise RuntimeError('psql encerrou: ' + repr(lines))
            if line:
                lines.append(line)
    def ok(self, sql):
        lines = self.run(sql)
        assert not any('ERROR:' in x for x in lines), (sql, lines)
        return lines
    def scalar(self, sql):
        return self.ok(sql)[-1]
    def close(self):
        if self.process.poll() is None:
            try:
                self.run('ROLLBACK')
                self.process.stdin.write('\\q\n'); self.process.stdin.flush()
                self.process.wait(timeout=3)
            except Exception:
                self.process.terminate()
                self.process.wait(timeout=3)

sessions = []
results = []
pool = cf.ThreadPoolExecutor(max_workers=2)
def check(name, function):
    function()
    results.append({'teste': name, 'resultado': 'PASS'})
    print('PASS ' + name, flush=True)
def reset():
    A.run('ROLLBACK'); B.run('ROLLBACK')
    M.ok((HERE/'03-reset.sql').read_text().replace('\\set ON_ERROR_STOP on',''))
def blocked(pid, by):
    end = time.monotonic() + 4
    while time.monotonic() < end:
        if M.scalar(f'SELECT {by} = ANY(pg_blocking_pids({pid}))') == 't':
            return
        time.sleep(.02)  # Apenas intervalo de sondagem; condição observada é o lock.
    raise AssertionError(f'{pid} não bloqueado por {by}')
def stock(): return int(M.scalar("SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1'"))
def balances(): return M.scalar("SELECT string_agg(saldo_centavos::text,',' ORDER BY id) FROM acid_lab.contas")

try:
    for name in ('A','B','M'):
        sessions.append(Session(name))
    A, B, M = sessions
    version = M.scalar('SELECT version()')
    assert M.scalar('SHOW server_version_num').startswith('18')
    assert len({A.pid,B.pid,M.pid}) == 3
    config = {x: M.scalar('SHOW '+x) for x in ['fsync','synchronous_commit','full_page_writes','default_transaction_isolation']}
    assert all(config[x] == 'on' for x in ['fsync','synchronous_commit','full_page_writes'])
    def transaction():
        reset(); A.ok('BEGIN'); A.ok("SELECT acid_lab.transferir('ana','bruno',10000)")
        assert A.scalar("SELECT saldo_centavos FROM acid_lab.contas WHERE id='ana'") == '90000'
        assert B.scalar("SELECT saldo_centavos FROM acid_lab.contas WHERE id='ana'") == '100000'
        A.ok('ROLLBACK'); assert balances() == '100000,10000'
        A.ok("SELECT acid_lab.transferir('ana','bruno',10000)")
        assert balances() == '90000,20000'
    check('commit, rollback, visão própria e de outra sessão', transaction)
    def failure():
        reset(); A.ok('BEGIN'); A.ok("UPDATE acid_lab.contas SET saldo_centavos=90000 WHERE id='ana'")
        err = A.run("UPDATE acid_lab.contas SET saldo_centavos=-1 WHERE id='bruno'")
        assert any('23514' in x for x in err), err
        assert any('25P02' in x for x in A.run('SELECT 1'))
        A.ok('ROLLBACK'); assert balances() == '100000,10000'
        A.ok('BEGIN; SAVEPOINT tentativa')
        assert any('23514' in x for x in A.run("UPDATE acid_lab.contas SET saldo_centavos=-1 WHERE id='ana'"))
        A.ok('ROLLBACK TO SAVEPOINT tentativa; COMMIT'); assert balances() == '100000,10000'
        A.ok('BEGIN'); assert A.scalar("WITH u AS (UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos+10000 WHERE id='ausente' RETURNING 1) SELECT count(*) FROM u") == '0'
        A.ok('ROLLBACK')
        for args in ["'ana','ausente',10000", "'ana','ana',10000", "'ana','bruno',0", "'ana','bruno',100001"]:
            assert any('ERROR:' in x for x in A.run('SELECT acid_lab.transferir('+args+')'))
            assert balances() == '100000,10000'
    check('falha intermediária, constraint, recuperação, savepoint, zero linhas e validações', failure)
    def visibility():
        reset(); A.ok('BEGIN'); A.ok("UPDATE acid_lab.produtos SET estoque=0 WHERE id='SKU-1'")
        B.ok('BEGIN ISOLATION LEVEL READ UNCOMMITTED')
        assert B.scalar("SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1'") == '1'
        B.ok('ROLLBACK'); A.ok('ROLLBACK')
        A.ok('BEGIN ISOLATION LEVEL READ COMMITTED')
        assert A.scalar("SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1'") == '1'
        B.ok("UPDATE acid_lab.produtos SET estoque=2 WHERE id='SKU-1'")
        assert A.scalar("SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1'") == '2'
        assert A.scalar('SELECT count(*) FROM acid_lab.produtos WHERE estoque>0') == '1'
        B.ok("INSERT INTO acid_lab.produtos VALUES ('SKU-2','Lápis',1,0)")
        assert A.scalar('SELECT count(*) FROM acid_lab.produtos WHERE estoque>0') == '2'
        B.ok("UPDATE acid_lab.produtos SET estoque=0 WHERE id='SKU-2'")
        assert A.scalar('SELECT count(*) FROM acid_lab.produtos WHERE estoque>0') == '1'
        A.ok('ROLLBACK')
    check('ausência dirty read, non-repeatable e phantom por INSERT e UPDATE em RC', visibility)
    def repeatable():
        reset(); A.ok('BEGIN ISOLATION LEVEL REPEATABLE READ')
        assert A.scalar('SELECT count(*) FROM acid_lab.produtos WHERE estoque>0') == '1'
        B.ok("UPDATE acid_lab.produtos SET estoque=0 WHERE id='SKU-1'; INSERT INTO acid_lab.produtos VALUES ('SKU-2','Lápis',1,0)")
        assert A.scalar("SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1'") == '1'
        assert A.scalar('SELECT count(*) FROM acid_lab.produtos WHERE estoque>0') == '1'
        assert any('40001' in x for x in A.run("UPDATE acid_lab.produtos SET estoque=2 WHERE id='SKU-1'"))
        A.ok('ROLLBACK')
    check('snapshot RR estável e atualização conflitante abortada', repeatable)
    def lost():
        reset(); A.ok('BEGIN'); B.ok('BEGIN')
        assert A.scalar("SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1'") == '1'
        assert B.scalar("SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1'") == '1'
        A.ok("UPDATE acid_lab.produtos SET estoque=0 WHERE id='SKU-1'; INSERT INTO acid_lab.operacoes VALUES ('insegura-a','SKU-1',1,'aprovada',NULL); INSERT INTO acid_lab.pedidos(operacao_id,produto_id,quantidade) VALUES ('insegura-a','SKU-1',1); COMMIT")
        B.ok("UPDATE acid_lab.produtos SET estoque=0 WHERE id='SKU-1'; INSERT INTO acid_lab.operacoes VALUES ('insegura-b','SKU-1',1,'aprovada',NULL); INSERT INTO acid_lab.pedidos(operacao_id,produto_id,quantidade) VALUES ('insegura-b','SKU-1',1); COMMIT")
        assert stock() == 0 and M.scalar('SELECT count(*) FROM acid_lab.pedidos') == '2'
    check('fluxo INSEGURO: duas vendas admitidas para uma unidade', lost)
    def safe():
        reset(); A.ok('BEGIN'); A.ok("SELECT acid_lab.comprar('compra-a','SKU-1',1)")
        pending = pool.submit(B.ok, "SELECT acid_lab.comprar('compra-b','SKU-1',1)")
        blocked(B.pid,A.pid); assert stock() == 1
        A.ok('COMMIT'); pending.result(timeout=LIMIT)
        assert stock() == 0 and M.scalar('SELECT count(*) FROM acid_lab.pedidos') == '1'
        assert M.scalar("SELECT resultado FROM acid_lab.operacoes WHERE chave='compra-b'") == 'sem_estoque'
    check('compra condicional concorrente preserva última unidade e recusa', safe)
    def locking():
        reset(); A.ok('BEGIN'); A.ok("SELECT * FROM acid_lab.produtos WHERE id='SKU-1' FOR UPDATE")
        assert B.scalar("SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1'") == '1'
        B.ok('BEGIN')
        pending = pool.submit(B.ok, "SELECT estoque FROM acid_lab.produtos WHERE id='SKU-1' FOR UPDATE")
        blocked(B.pid,A.pid); A.ok("UPDATE acid_lab.produtos SET estoque=0,versao=versao+1 WHERE id='SKU-1'; COMMIT")
        assert pending.result(timeout=LIMIT)[-1] == '0'; B.ok('ROLLBACK')
        assert B.scalar("WITH u AS (UPDATE acid_lab.produtos SET estoque=estoque-1,versao=versao+1 WHERE id='SKU-1' AND estoque>=1 AND versao=0 RETURNING 1) SELECT count(*) FROM u") == '0'
        assert B.scalar("SELECT count(*) FROM acid_lab.produtos WHERE id='ausente'") == '0'
    check('FOR UPDATE espera, SELECT comum lê, versão detecta conflito e linha ausente', locking)
    def deadlock():
        reset(); A.ok('BEGIN'); B.ok('BEGIN')
        A.ok("UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos WHERE id='ana'")
        B.ok("UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos WHERE id='bruno'")
        fa = pool.submit(A.run,"UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos WHERE id='bruno'")
        blocked(A.pid,B.pid)
        fb = pool.submit(B.run,"UPDATE acid_lab.contas SET saldo_centavos=saldo_centavos WHERE id='ana'")
        # Abortar a vítima libera seus locks; a outra instrução pode concluir.
        # Não presumimos qual sessão perdeu nem a ordem de conclusão.
        outputs = [fa.result(timeout=LIMIT), fb.result(timeout=LIMIT)]
        assert sum(any('40P01' in x for x in out) for out in outputs) == 1, outputs
        A.ok('ROLLBACK'); B.ok('ROLLBACK')
        # Ordem idêntica: segundo espera pelo primeiro recurso, sem formar ciclo.
        A.ok('BEGIN'); A.ok("SELECT id FROM acid_lab.contas ORDER BY id FOR UPDATE")
        B.ok('BEGIN'); f = pool.submit(B.ok,"SELECT id FROM acid_lab.contas ORDER BY id FOR UPDATE")
        blocked(B.pid,A.pid); A.ok('COMMIT'); f.result(timeout=LIMIT); B.ok('COMMIT')
    check('deadlock com vítima indeterminada e aquisição em ordem consistente', deadlock)
    def idempotency():
        reset(); A.ok('BEGIN'); first=A.scalar("SELECT acid_lab.comprar('mesma','SKU-1',1)")
        f=pool.submit(B.ok,"SELECT acid_lab.comprar('mesma','SKU-1',1)")
        blocked(B.pid,A.pid); A.ok('COMMIT'); assert f.result(timeout=LIMIT)[-1] == first
        assert B.scalar("SELECT acid_lab.comprar('mesma','SKU-1',1)") == first
        assert any('Parâmetros' in x or 'parâmetros' in x for x in B.run("SELECT acid_lab.comprar('mesma','SKU-1',2)"))
        assert stock()==0 and M.scalar('SELECT count(*) FROM acid_lab.pedidos')=='1'
        B.ok("SELECT acid_lab.comprar('recusa','SKU-1',1)")
        M.ok("UPDATE acid_lab.produtos SET estoque=1,versao=versao+1 WHERE id='SKU-1'")
        B.ok("SELECT acid_lab.comprar('recusa','SKU-1',1)"); assert stock()==1
        B.ok("SELECT acid_lab.comprar('nova','SKU-1',1)"); assert stock()==0
    check('repetição serial/concorrente, parâmetros distintos e recusa estável', idempotency)
    def skew():
        for isolation in ['REPEATABLE READ','SERIALIZABLE']:
            reset(); A.ok('BEGIN ISOLATION LEVEL '+isolation); B.ok('BEGIN ISOLATION LEVEL '+isolation)
            for s in [A,B]: assert s.scalar('SELECT count(*) FROM acid_lab.turno WHERE presente')=='2'
            A.ok("UPDATE acid_lab.turno SET presente=false WHERE nome='Ana'")
            A.ok('COMMIT')
            out=B.run("UPDATE acid_lab.turno SET presente=false WHERE nome='Bruno'; COMMIT")
            if isolation=='REPEATABLE READ': assert M.scalar('SELECT count(*) FROM acid_lab.turno WHERE presente')=='0'
            else:
                assert any('40001' in x for x in out), out
                B.ok('ROLLBACK'); assert M.scalar('SELECT count(*) FROM acid_lab.turno WHERE presente')=='1'
    check('write skew em RR e erro de serialização em Serializable', skew)
    def report_mix():
        reset(); A.ok('BEGIN ISOLATION LEVEL READ COMMITTED')
        assert A.ok('SELECT quantidade*preco_centavos FROM acid_lab.vendas_relatorio ORDER BY produto_id')==['5000','8000']
        B.ok("UPDATE acid_lab.vendas_relatorio SET quantidade=15 WHERE produto_id='produto-1'")
        assert A.scalar('SELECT sum(quantidade*preco_centavos) FROM acid_lab.vendas_relatorio')=='15500'
        assert A.ok('SELECT quantidade*preco_centavos FROM acid_lab.vendas_relatorio ORDER BY produto_id')==['7500','8000']
        A.ok('COMMIT')
        assert A.ok('SELECT produto_id, sum(quantidade*preco_centavos) OVER () FROM acid_lab.vendas_relatorio ORDER BY produto_id')==['produto-1|15500','produto-2|15500']
    check('relatório RC: detalhes13000, total15500 e releitura alterada; janela única', report_mix)
    def report_phantom():
        reset(); A.ok('BEGIN ISOLATION LEVEL READ COMMITTED')
        assert A.scalar('SELECT count(*) FROM acid_lab.vendas_relatorio WHERE quantidade>0')=='2'
        B.ok("INSERT INTO acid_lab.vendas_relatorio VALUES ('produto-3',2,500)")
        assert A.scalar('SELECT count(*) FROM acid_lab.vendas_relatorio WHERE quantidade>0')=='3'
        assert A.scalar('SELECT sum(quantidade*preco_centavos) FROM acid_lab.vendas_relatorio')=='14000'
        B.ok("UPDATE acid_lab.vendas_relatorio SET quantidade=0 WHERE produto_id='produto-2'")
        assert A.scalar('SELECT count(*) FROM acid_lab.vendas_relatorio WHERE quantidade>0')=='2'
        A.ok('ROLLBACK')
    check('relatório RC: phantom por INSERT e saída do filtro por UPDATE', report_phantom)
    def report_snapshot():
        reset(); A.ok('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
        assert A.scalar('SELECT sum(quantidade*preco_centavos) FROM acid_lab.vendas_relatorio')=='13000'
        B.ok("UPDATE acid_lab.vendas_relatorio SET quantidade=15 WHERE produto_id='produto-1'")
        assert A.scalar('SELECT sum(quantidade*preco_centavos) FROM acid_lab.vendas_relatorio')=='13000'
        A.ok('COMMIT'); assert A.scalar('SELECT sum(quantidade*preco_centavos) FROM acid_lab.vendas_relatorio')=='15500'
        reset(); A.ok('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
        B.ok("UPDATE acid_lab.vendas_relatorio SET quantidade=15 WHERE produto_id='produto-1'")
        assert A.scalar('SELECT sum(quantidade*preco_centavos) FROM acid_lab.vendas_relatorio')=='15500'
        A.ok('COMMIT')
    check('relatório RR READ ONLY: snapshot estabelecido primeira consulta, não BEGIN', report_snapshot)
    def report_dirty():
        reset(); B.ok('BEGIN'); B.ok("UPDATE acid_lab.vendas_relatorio SET quantidade=15 WHERE produto_id='produto-1'")
        A.ok('BEGIN ISOLATION LEVEL READ UNCOMMITTED')
        assert A.scalar('SELECT sum(quantidade*preco_centavos) FROM acid_lab.vendas_relatorio')=='13000'
        A.ok('ROLLBACK'); B.ok('ROLLBACK')
    check('relatório PG READ UNCOMMITTED não vê UPDATE sem commit', report_dirty)
    reset()
    report={'versao':version,'configuracao':config,'conexoes_distintas':3,'resultados':results,
        'limites':'Não mede energia, perda de mídia, desempenho, MySQL ou efeitos externos. Reinício limpo não é crash.'}
    target=ROOT/'.site/acid-review/laboratorio-resultados.json'
    target.parent.mkdir(parents=True,exist_ok=True); target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
finally:
    for s in sessions: s.close()
    pool.shutdown(wait=True,cancel_futures=True)
