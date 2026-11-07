#!/usr/bin/env python3
"""Laboratórios locais de redes: stdlib, loopback e fixtures; nenhuma chamada AWS."""
from __future__ import annotations
import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import ipaddress
import json
import os
from pathlib import Path
import secrets
import select
import shutil
import signal
import socket
import ssl
import subprocess
import sys
import tempfile
import threading
import time
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[4]
REVIEW = ROOT / '.site' / 'redes-review'
RUNTIME = REVIEW / 'runtime'
REPORTS = REVIEW / 'labs'
FIXTURES = Path(__file__).resolve().parent / 'fixtures'
OWNER = 'redes-local-lab-v1'
METRICS = '__REDES_METRICS__'
sys.dont_write_bytecode = True


def disable_tls_keylog():
    # Delete without inspecting the inherited value. create_default_context can
    # open SSLKEYLOGFILE during creation, so disabling it afterward is too late.
    try:
        del os.environ['SSLKEYLOGFILE']
    except KeyError:
        pass


disable_tls_keylog()


def clean_env(work: Path | None = None) -> dict[str, str]:
    """Do not consult proxies, curl rc files, custom CA paths or OpenSSL config."""
    blocked = {'CURL_CA_BUNDLE', 'SSL_CERT_FILE', 'SSL_CERT_DIR', 'OPENSSL_CONF',
               'OPENSSL_MODULES', 'OPENSSL_ENGINES', 'RANDFILE', 'CURL_HOME', 'SSLKEYLOGFILE'}
    env = {key: value for key, value in os.environ.items()
           if not key.lower().endswith('_proxy') and key not in blocked}
    env.update(PYTHONDONTWRITEBYTECODE='1', OPENSSL_CONF=os.devnull)
    if work:
        env['CURL_HOME'] = str(work / 'curl-home')
    return env


def require_owned(work: Path, token: str) -> None:
    if work.is_symlink() or work.parent.resolve() != RUNTIME.resolve():
        raise ValueError('Diretório fora do runtime próprio; operação recusada.')
    marker = json.loads((work / '.owner.json').read_text())
    if marker.get('owner') != OWNER or marker.get('token') != token:
        raise ValueError('Marcador não corresponde a esta execução; operação recusada.')


def safe_cleanup(work: Path, token: str) -> None:
    require_owned(work, token)
    shutil.rmtree(work)


@contextmanager
def runtime():
    RUNTIME.mkdir(parents=True, exist_ok=True, mode=0o700)
    work = Path(tempfile.mkdtemp(prefix='run-', dir=RUNTIME))
    work.chmod(0o700)
    token = secrets.token_hex(16)
    (work / '.owner.json').write_text(json.dumps({'owner': OWNER, 'token': token, 'pid': os.getpid()}))
    (work / '.owner.json').chmod(0o600)
    try:
        yield work, token
    finally:
        safe_cleanup(work, token)


def fixture(name: str):
    return json.loads((FIXTURES / name).read_text())


def capacity(cidr: str, aws_subnet: bool = False) -> dict:
    network = ipaddress.ip_network(cidr, strict=True)
    if network.version != 4:
        raise ValueError('Este exercício de capacidade usa apenas IPv4.')
    result = {'cidr': str(network), 'total': network.num_addresses,
              'hosts_convencionais': network.num_addresses - 2 if network.prefixlen <= 30 else network.num_addresses}
    if aws_subnet:
        if not 16 <= network.prefixlen <= 28:
            raise ValueError('Modelo comum AWS IPv4 limitado a /16–/28; não cobre BYOIP.')
        result['aws_comum_atribuiveis'] = network.num_addresses - 5
    return result


def longest_prefix(address: str, routes: list[dict]) -> dict | None:
    destination = ipaddress.ip_address(address)
    matching = [route for route in routes
                if ipaddress.ip_network(route['cidr']).version == destination.version
                and destination in ipaddress.ip_network(route['cidr'])]
    if not matching:
        return None
    prefix = max(ipaddress.ip_network(route['cidr']).prefixlen for route in matching)
    winners = [route for route in matching if ipaddress.ip_network(route['cidr']).prefixlen == prefix]
    if len(winners) != 1:
        raise ValueError('Empate fora do modelo; consultar regras específicas do produto.')
    return dict(winners[0])


def nacl_record(packet: dict, rules: list[dict]) -> dict:
    """Leitura de registros IPv4/TCP didáticos, não emulação de NACL/SG."""
    for rule in sorted(rules, key=lambda item: item['number']):
        peer = packet[rule['peer_field']]
        if ipaddress.ip_address(peer) in ipaddress.ip_network(rule['cidr']) and rule['ports'][0] <= packet['dst_port'] <= rule['ports'][1]:
            return {'action': rule['action'], 'rule': rule['number']}
    return {'action': 'deny', 'rule': '*'}


def run_l1() -> dict:
    records = fixture('rotas.json')
    capacities = [capacity(cidr, True) for cidr in ['10.20.0.0/16', '10.20.16.0/20', '10.20.2.0/24', '10.20.2.0/28']]
    queries = [{'destination': row['address'], 'selected': longest_prefix(row['address'], records['routes'])} for row in records['queries']]
    return {'kind': 'cálculo offline', 'capacities': capacities,
            'normalization_interface': str(ipaddress.ip_interface('10.20.17.0/20').network),
            'belongs': {'10.20.2.10_in_app': ipaddress.ip_address('10.20.2.10') in ipaddress.ip_network('10.20.2.0/24'),
                        '10.20.3.20_in_app': ipaddress.ip_address('10.20.3.20') in ipaddress.ip_network('10.20.2.0/24')},
            'subnets_24_in_20': len(list(ipaddress.ip_network('10.20.16.0/20').subnets(new_prefix=24))),
            'contained_overlap': ipaddress.ip_network('10.20.16.0/20').subnet_of(ipaddress.ip_network('10.20.0.0/16')),
            'routes': queries, 'limits': 'LPM sem empates; não atribui endereços, instala rotas nem emula AWS.'}


@contextmanager
def server(work: Path, token: str, tls: bool = False):
    require_owned(work, token)
    error_file = (work / ('tls-server.stderr' if tls else 'http-server.stderr')).open('w')
    process = subprocess.Popen([sys.executable, '-B', str(Path(__file__).resolve()), '_serve',
                                '--work', str(work), '--token', token, '--mode', 'tls' if tls else 'http'],
                               stdout=subprocess.PIPE, stderr=error_file, text=True,
                               env=clean_env(work), start_new_session=True)
    try:
        if not select.select([process.stdout], [], [], 5)[0]:
            raise RuntimeError('Servidor próprio não informou prontidão em cinco segundos.')
        line = process.stdout.readline()
        if not line:
            raise RuntimeError('Servidor próprio encerrou antes da prontidão.')
        ready = json.loads(line)
        if ready['bind'] != '127.0.0.1' or ready['port'] <= 1024 or ready['pid'] != process.pid:
            raise RuntimeError('Prontidão incompatível com loopback/porta/PID próprios.')
        yield ready
    finally:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill(); process.wait(timeout=3)
        if process.stdout:
            process.stdout.close()
        error_file.close()


def curl_local(url: str, work: Path, *, resolve: str | None = None, ca: Path | None = None,
               maximum: str = '3', fail_http: bool = False) -> dict:
    parsed = urlsplit(url)
    if parsed.scheme not in {'http', 'https'} or parsed.username or parsed.password or not parsed.port or parsed.port <= 1024:
        raise ValueError('URL de laboratório inválida.')
    if parsed.hostname == '127.0.0.1':
        if resolve:
            raise ValueError('Use o endereço literal sem resolve neste caso.')
    elif parsed.hostname in {'loja.test', 'outra.test'}:
        if resolve != f'{parsed.hostname}:{parsed.port}:127.0.0.1':
            raise ValueError('Nome .test exige resolve explícito para loopback.')
    else:
        raise ValueError('Somente loopback ou nomes .test fixos deste laboratório.')
    args = ['curl', '-q', '--noproxy', '*', '--proxy', '', '--proto', '=http,https',
            '--silent', '--show-error', '--connect-timeout', '1', '--max-time', maximum]
    if resolve:
        args += ['--resolve', resolve]
    if ca:
        if ca.resolve().parent != work.resolve() or ca.name != 'ca.crt':
            raise ValueError('CA deve ser a gerada no runtime desta execução.')
        args += ['--cacert', str(ca)]
    if fail_http:
        args += ['--fail-with-body']
    args += ['--write-out', f'\n{METRICS}%{{http_code}}|%{{time_connect}}|%{{time_starttransfer}}|%{{time_total}}|%{{remote_ip}}\n', url]
    result = subprocess.run(args, capture_output=True, text=True, env=clean_env(work), timeout=6)
    body, raw = result.stdout.rsplit('\n' + METRICS, 1)
    status, connect, first_byte, total, remote = raw.strip().split('|')
    return {'url': url, 'exit': result.returncode, 'http': status, 'body': body,
            'time_connect': float(connect), 'time_starttransfer': float(first_byte),
            'time_total': float(total), 'remote_ip': remote, 'stderr': result.stderr.strip()}


def events(work: Path) -> list[dict]:
    file = work / 'events.jsonl'
    return [json.loads(line) for line in file.read_text().splitlines()] if file.exists() else []


def run_l2(work: Path, token: str) -> dict:
    with server(work, token) as ready:
        base = f'http://127.0.0.1:{ready["port"]}'
        ok = curl_local(base + '/ok', work)
        unavailable = curl_local(base + '/unavailable', work)
        fail_option = curl_local(base + '/unavailable', work, fail_http=True)
    # Reuse only our child's now-closed endpoint. A merely bound, non-listening
    # socket can silently discard SYN on some systems; it is not our refusal fixture.
    refused = curl_local(base + '/ok', work)
    return {'kind': 'HTTP local executado', 'server': ready, 'ok': ok, 'http503': unavailable,
            'http503_fail_with_body': fail_option, 'no_listener': refused,
            'cleanup': 'Somente processo filho encerrado; recusa medida na sua porta já fechada.'}


def run_l3(work: Path, token: str) -> dict:
    with server(work, token) as ready:
        url = f'http://127.0.0.1:{ready["port"]}/slow'
        timed_out = curl_local(url, work, maximum='0.15')
        completed = curl_local(url, work, maximum='2')
        reached_handler = [event for event in events(work) if event.get('event') == 'request_received' and event.get('path') == '/slow']
    return {'kind': 'Atraso no handler após conexão e leitura HTTP', 'server': ready,
            'budget_short': timed_out, 'budget_long': completed, 'handler_requests': reached_handler,
            'limits': 'Não simula perda de SYN, latência WAN, congestionamento ou uma falha de rota.'}


def make_certificates(work: Path):
    ext = work / 'server.ext'
    ext.write_text('basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:loja.test\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid,issuer\n')
    commands = [
        ['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-noenc', '-sha256', '-days', '1', '-subj', '/CN=Redes Local Lab CA', '-addext', 'basicConstraints=critical,CA:TRUE,pathlen:0', '-addext', 'keyUsage=critical,keyCertSign,cRLSign', '-addext', 'subjectKeyIdentifier=hash', '-addext', 'authorityKeyIdentifier=keyid:always', '-keyout', str(work/'ca.key'), '-out', str(work/'ca.crt')],
        ['openssl', 'req', '-new', '-newkey', 'rsa:2048', '-noenc', '-subj', '/CN=loja.test', '-keyout', str(work/'server.key'), '-out', str(work/'server.csr')],
        ['openssl', 'x509', '-req', '-in', str(work/'server.csr'), '-CA', str(work/'ca.crt'), '-CAkey', str(work/'ca.key'), '-CAcreateserial', '-days', '1', '-sha256', '-extfile', str(ext), '-out', str(work/'server.crt')]
    ]
    for args in commands:
        subprocess.run(args, check=True, capture_output=True, text=True, env=clean_env(work), timeout=15, umask=0o077)
    for file in work.iterdir():
        if file.suffix in {'.key', '.crt', '.csr', '.srl', '.ext'}:
            file.chmod(0o600)


def run_l4(work: Path, token: str) -> dict:
    disable_tls_keylog()
    make_certificates(work)
    with server(work, token, tls=True) as ready:
        port = ready['port']; good = f'https://loja.test:{port}/ok'; bad = f'https://outra.test:{port}/ok'
        untrusted = curl_local(good, work, resolve=f'loja.test:{port}:127.0.0.1')
        trusted = curl_local(good, work, resolve=f'loja.test:{port}:127.0.0.1', ca=work/'ca.crt')
        wrong_name = curl_local(bad, work, resolve=f'outra.test:{port}:127.0.0.1', ca=work/'ca.crt')
        context = ssl.create_default_context(cafile=str(work/'ca.crt'))
        with socket.create_connection(('127.0.0.1', port), timeout=2) as sock:
            with context.wrap_socket(sock, server_hostname='loja.test') as secure:
                python_tls = {'version': secure.version(), 'cipher': secure.cipher()[0], 'san': secure.getpeercert().get('subjectAltName')}
        try:
            with socket.create_connection(('127.0.0.1', port), timeout=2) as sock:
                with context.wrap_socket(sock, server_hostname='outra.test'):
                    raise AssertionError('Nome indevido não deveria validar.')
        except ssl.SSLCertVerificationError as error:
            python_mismatch = {'verify_code': error.verify_code, 'verify_message': error.verify_message}
        observed = events(work)
    successes = [event for event in observed if event.get('event') == 'request_received' and event.get('tls')]
    return {'kind': 'HTTPS local com CA temporária, sem confiança global instalada', 'server': ready,
            'untrusted': untrusted, 'trusted': trusted, 'wrong_name': wrong_name,
            'curl_tls_seen_by_server': [{'version': event['tls'], 'cipher': event['cipher'], 'host': event['host']} for event in successes],
            'python_tls': python_tls, 'python_mismatch': python_mismatch,
            'limits': 'Resolve substitui apenas a resolução do cliente; não testou DNS. Nenhuma CA/hosts foi instalada.'}


def run_l5() -> dict:
    flow = fixture('controles.json')
    request, response = flow['request'], flow['response']
    peering = fixture('peering-tgw.json')
    failover = fixture('contingencia.json')
    return {'kind': 'SOMENTE análise offline de registros SINTÉTICOS; não emulador AWS',
            'nacl_request_app_out': nacl_record(request, flow['app_out']),
            'nacl_response_app_in_broken': nacl_record(response, flow['app_in_broken']),
            'nacl_response_app_in_fixed': nacl_record(response, flow['app_in_fixed']),
            'sg_return': flow['sg_return'],
            'peering_A_C_direct': sorted(['A', 'C']) in [sorted(edge) for edge in peering['peerings']],
            'tgw_A_B': longest_prefix('10.30.2.10', peering['tgw_tables']['from_A']),
            'tgw_A_C': longest_prefix('10.40.2.10', peering['tgw_tables']['from_A']),
            'tgw_B_A_return': longest_prefix('10.20.2.10', peering['tgw_tables']['from_B']),
            'contingency_records': failover,
            'limits': 'Caminhos/controles declarados não comprovam entrega, TLS, autenticação, HTTP nem compra.'}


def serve(work: Path, token: str, mode: str):
    require_owned(work, token)
    lock = threading.Lock()
    def record(**fields):
        with lock:
            with (work/'events.jsonl').open('a') as out:
                out.write(json.dumps({'monotonic': time.monotonic(), **fields})+'\n')
    class Handler(BaseHTTPRequestHandler):
        protocol_version = 'HTTP/1.1'
        def log_message(self, *_):
            pass
        def do_GET(self):
            tls_version = self.connection.version() if isinstance(self.connection, ssl.SSLSocket) else None
            record(event='request_received', path=self.path, host=self.headers.get('Host'),
                   tls=tls_version, cipher=self.connection.cipher()[0] if tls_version else None)
            if self.path not in {'/ok', '/unavailable', '/slow'}:
                status, message = 404, 'Rota inexistente neste servidor mínimo.'
            elif self.path == '/unavailable':
                status, message = 503, 'Indisponibilidade HTTP deliberada.'
            else:
                if self.path == '/slow':
                    time.sleep(0.45)
                status, message = 200, 'Resposta local do catálogo fictício.'
            payload = json.dumps({'status': status, 'message': message}, ensure_ascii=False).encode()
            try:
                self.send_response(status); self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload))); self.send_header('Connection', 'close'); self.end_headers()
                self.wfile.write(payload); self.close_connection = True
            except (BrokenPipeError, ConnectionResetError):
                record(event='client_closed_before_response', path=self.path)
    class Server(ThreadingHTTPServer):
        daemon_threads = True
        def handle_error(self, *_):
            record(event='connection_error')
    with Server(('127.0.0.1', 0), Handler) as httpd:
        if httpd.server_port <= 1024:
            raise RuntimeError('Porta efêmera precisa ser maior que 1024.')
        if mode == 'tls':
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.minimum_version = ssl.TLSVersion.TLSv1_2
            context.load_cert_chain(str(work/'server.crt'), str(work/'server.key'))
            context.set_servername_callback(lambda _socket, name, _context: record(event='sni_received', name=name))
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        print(json.dumps({'bind': '127.0.0.1', 'port': httpd.server_port, 'pid': os.getpid(), 'mode': mode}), flush=True)
        httpd.serve_forever(poll_interval=0.05)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('lab', choices=['l1', 'l2', 'l3', 'l4', 'l5', 'all', '_serve'])
    parser.add_argument('--work', type=Path); parser.add_argument('--token'); parser.add_argument('--mode', choices=['http', 'tls'], default='http')
    args = parser.parse_args()
    if args.lab == '_serve':
        serve(args.work, args.token, args.mode); return
    signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    result = {'executed_at': datetime.now(timezone.utc).isoformat(), 'python': sys.version.split()[0],
              'python_ssl': ssl.OPENSSL_VERSION,
              'curl_version_reported': subprocess.run(['curl', '-q', '--version'], capture_output=True, text=True, env=clean_env(), timeout=3).stdout.splitlines()[0],
              'openssl_cli_version': subprocess.run(['openssl', 'version'], capture_output=True, text=True, env=clean_env(), timeout=3).stdout.strip(),
              'scope': 'Loopback próprio e cálculo/fixtures offline; nenhuma AWS.', 'labs': {}}
    for name in (['l1', 'l2', 'l3', 'l4', 'l5'] if args.lab == 'all' else [args.lab]):
        if name in {'l1', 'l5'}:
            result['labs'][name] = globals()['run_'+name]()
        else:
            with runtime() as (work, token):
                result['labs'][name] = globals()['run_'+name](work, token)
    result['runtime_cleaned'] = True
    REPORTS.mkdir(parents=True, exist_ok=True)
    report = REPORTS/(args.lab+'-observado.json')
    report.write_text(json.dumps(result, indent=2, ensure_ascii=False)+'\n')
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print('Relatório privado: '+str(report.relative_to(ROOT)))

if __name__ == '__main__':
    main()
