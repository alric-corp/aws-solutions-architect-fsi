# L5 — Ler registros de caminho, controle e contingência

[Laboratórios](README.md) · [Curso](../README.md)

## Objetivo

Reconstituir ida e retorno e localizar o limite de uma evidência. Separar uma configuração de caminho declarada de uma entrega ou compra demonstrada.

## Ambiente e estado inicial

Python e quatro arquivos JSON do checkout em `laboratorio/fixtures/`. São **fixtures inteiramente sintéticas**, não dumps de conta, resultado de captura ou saída de um emulador AWS. L5 não abre sockets, consulta DNS, anuncia rotas nem cria recursos.

- A: `10.20.0.0/16`; aplicação `10.20.2.10`; banco `10.20.3.20`.
- B: `10.30.0.0/16`; C: `10.40.0.0/16`.
- As permissões, associações e estados indicados são premissas do recorte. Não se presume que este inventário represente outra rede.

## Execute

```sh
# Analisa os registros fixos; nenhum endereço dos arquivos é contatado.
python3 -B technical-knowledge/01-fundamentals/redes/laboratorio/lab.py l5

# Inclui transferência para porta de cliente 51000 e regra deny anterior.
python3 -B -m unittest discover \
  -s technical-knowledge/01-fundamentals/redes/laboratorio \
  -p test_lab.py -v
```

## 1. Uma conexão tem dois sentidos

A ida é `10.20.2.10:40000 → 10.20.3.20:5432`. A volta é `10.20.3.20:5432 → 10.20.2.10:40000`. As rotas locais, SGs necessários e regras da subnet do banco foram declarados corretos. O retorno acompanhado é permitido pelos SGs neste fluxo; isso não cria uma regra stateful para a NACL. [SG](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) e [NACL](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html).

A NACL de entrada da subnet da aplicação contém apenas permissão para **destino 5432**, que não corresponde ao destino 40000 desse retorno. A leitura do registro termina no deny implícito. A fixture corrigida usa origem do banco e portas de destino 32768–60999, faixa explicitamente atribuída ao cliente fictício. Não é uma faixa universal. As regras são lidas em ordem numérica; um deny correspondente anterior não é cancelado por um allow posterior.

**Observado pelo cálculo real de autoria:** ida `allow`; retorno original `deny`; retorno corrigido `allow`. Não são resultados de pacotes AWS. Um Flow Log `REJECT` isolado não identificaria sozinho qual regra ou controle causou a rejeição.

## 2. Duas ligações não criam qualquer caminho

Os registros declaram peering A–B e B–C. A rotina verifica que **não existe peering direto A–C**. Não tenta atravessar B como roteador; peering não oferece essa transitividade. Um proxy de aplicação em B representaria outras conexões e requisitos. [Peering](https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html).

No snapshot separado de TGW, as associações levam A à tabela `from_A`, com rota para B; `from_B` contém o retorno. C tem attachment, mas não ganha rota na tabela de A. O código encontrou caminhos declarados A→B e B→A e ausência de correspondência A→C. Não deduziu propagação automática nem permissão de aplicação. [Tabelas de TGW](https://docs.aws.amazon.com/vpc/latest/tgw/tgw-route-tables.html).

## 3. O endereço atual não move uma conexão antiga

A fixture de contingência declara resposta atual `loja.test → 10.20.2.11`; um cliente conserva cache `.10` com 35 segundos restantes e uma conexão já aberta com `.10`. Um novo cliente com resolução atual alcança `.11`, valida TLS, recebe 200 em health e 503 ao tentar a jornada.

**Observado pela análise:** os campos coexistem; nenhum deles autoriza reescrever o outro. Nova resposta DNS não desloca a sessão antiga, e health 200 não prova compra. Os números foram escritos para o exercício, não medidos de Route53 ou de um link. Não há prazo real de failover/failback neste laboratório.

## Previsão, transferência e conclusão

Troque a porta de cliente 40000 por 51000: o retorno deve continuar permitido na faixa declarada. Para 62000, essa mesma regra não corresponde. Remova a rota de retorno B→A: a existência da ida já não bastaria. Pergunte qual resultado de aplicação ainda precisaria observar depois da correção de configuração.

## Limites e limpeza

A leitura é deliberadamente estreita: IPv4/TCP, CIDRs e campos explícitos. Não implementa SG, connection tracking, NACL completa, propagação TGW/BGP, Reachability Analyzer ou cache DNS real. O nome de uma fixture não é um diagnóstico de produção. Não há processo ou certificado para limpar; só o relatório privado é preservado. Fontes consultadas em 06/11/2026; [visão de health/failover DNS](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html) descreve mecanismos, não comprova estes registros.
