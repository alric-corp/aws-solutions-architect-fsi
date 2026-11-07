#!/usr/bin/env python3
"""Valida somente arquivos locais; não acessa rede, credenciais ou AWS."""
import hashlib
import ipaddress
import json
import re
import subprocess
from pathlib import Path

COURSE = Path(__file__).resolve().parents[1]
ROOT = Path(__file__).resolve().parents[4]
REVIEW = ROOT / '.site/redes-review'
CHAPTERS = ['00-clique-resposta.md','01-ip-cidr-subnets.md','02-rotas-ida-volta.md','03-dns-nomes.md','04-transportes-portas-http.md','05-https-tls.md','06-vpc-subnets-saida.md','07-sg-nacl.md','08-publicar-aplicacao.md','09-investigacao-evidencias.md','10-peering-tgw.md','11-conectividade-hibrida.md','12-falha-recuperacao-dns.md','13-revisao-desafios.md']

def digest(data):
    return hashlib.sha256(data).hexdigest()

def main():
    errors, checks = [], []
    baseline_path = REVIEW / 'baseline.json'
    if baseline_path.exists():
        baseline = json.loads(baseline_path.read_text())
        for name, before in baseline['hashes'].items():
            p = ROOT / name
            if not p.is_file() or digest(p.read_bytes()) != before:
                errors.append('Arquivo compartilhado mudou: ' + name)
        checks.append('Todos os arquivos-base preservados byte a byte')
        status = subprocess.check_output(['git','status','--porcelain=v1','-z','--untracked-files=all'],cwd=ROOT).decode().split('\0')
        for item in filter(None,status):
            if not item[3:].startswith('technical-knowledge/01-fundamentals/redes/'):
                errors.append('Escrita fora da fronteira: ' + item)
    for name in CHAPTERS:
        p = COURSE/name
        if not p.exists():
            errors.append('Capítulo ausente: '+name); continue
        t = p.read_text()
        if len(t.split()) < 250: errors.append('Capítulo incompleto: '+name)
        if '<details' not in t or 'Resposta comentada' not in t: errors.append('Perguntas/soluções ausentes: '+name)
        if re.search(r'<details\b[^>]*\bopen\b',t): errors.append('Resposta aberta por padrão: '+name)
        if '```mermaid' not in t: errors.append('Diagrama ausente: '+name)
    checks.append('14 capítulos completos com mecanismo, diagramas e perguntas comentadas')
    for p in COURSE.rglob('*.md'):
        t=p.read_text()
        if re.search(r'Vit[óo]ria|Adassa|20261105-053248|Texto colado|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY',t,re.I):errors.append('Insumo privado ou segredo no público: '+str(p.relative_to(COURSE)))
        for match in re.finditer(r'\[[^\]]*\]\(([^)]+)\)',t):
            url=match[1]
            if re.match(r'https?://|mailto:|#',url): continue
            if 'cases/' in url: errors.append('Novo vínculo FSI: '+str(p))
            target=(p.parent/url.split('#')[0]).resolve()
            if not target.exists():errors.append('Link local quebrado: '+str(p.relative_to(COURSE))+' -> '+url)
        if t.count('<details') != t.count('</details>'): errors.append('Details desbalanceado: '+str(p))
    checks.append('Links locais, privacidade, exclusão FSI e disclosures fechados')
    for network, total, last in [('10.20.0.0/16',65536,'10.20.255.255'),('10.20.16.0/20',4096,'10.20.31.255'),('10.20.2.0/24',256,'10.20.2.255'),('10.20.2.32/28',16,'10.20.2.47')]:
        n=ipaddress.ip_network(network); assert n.num_addresses==total and str(n.broadcast_address)==last
    assert ipaddress.ip_address('10.20.17.10') in ipaddress.ip_network('10.20.16.0/20')
    assert ipaddress.ip_address('10.20.32.1') not in ipaddress.ip_network('10.20.16.0/20')
    try:ipaddress.ip_network('10.20.17.0/20')
    except ValueError:pass
    else:raise AssertionError('Rede desalinhada foi aceita')
    assert len(list(ipaddress.ip_network('10.20.16.0/20').subnets(new_prefix=24)))==16
    checks.append('CIDRs: extremos, totais, pertencimento, subdivisão e rejeição do desalinhamento')
    manifest_path=ROOT/'dist/content-manifest.json'
    if manifest_path.exists():
        manifest=json.loads(manifest_path.read_text());index=json.loads((ROOT/'dist/search-index.json').read_text())
        new=[d for d in manifest if '/redes/' in d['sourcePath']]
        expected=list(COURSE.rglob('*.md'))
        assert len(new)==len(expected),(len(new),len(expected),'Build omitiu fontes')
        for d in new:
            source=ROOT/d['sourcePath']; html=ROOT/'dist'/d['canonicalUrl'].lstrip('/')
            assert html.exists(),d['canonicalUrl']
            assert d['contentVersion']==digest(source.read_bytes())[:16],d['sourcePath']
            if source.name=='instrutor.md':assert d['audience']=='instructor' and d['search'] is False
            else:assert d['audience']=='student'
        assert not any('/instrutor.html' in d['url'] and '/redes/' in d['url'] for d in index)
        assert not any(p.suffix in {'.py','.key','.pem','.crt','.json'} for p in (ROOT/'dist/technical-knowledge/01-fundamentals/redes').rglob('*') if p.is_file())
        checks.append('Build contém todas as fontes atuais; aluno/instrutor e versão SHA conferidos; runtime/keys/scripts/fixtures privados fora do pacote')
    report={'status':'FAIL' if errors else 'PASS','checks':checks,'errors':errors,'chapter_count':len(CHAPTERS),'markdown_files':len(list(COURSE.rglob('*.md'))),'note':'Verificação local de conteúdo/configuração. Não prova execução de serviços AWS.'}
    REVIEW.mkdir(parents=True,exist_ok=True);(REVIEW/'validacao-estatica.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return bool(errors)

if __name__=='__main__':raise SystemExit(main())
