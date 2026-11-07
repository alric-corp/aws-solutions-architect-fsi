# Referências e revisão técnica — redes

[Índice](README.md) · [Equívocos e correções](equivocos-correcoes.md) · [Laboratórios](laboratorio/README.md)

Consulta técnica realizada em **06/11/2026**. As aulas são autorais. Documentos de produto descrevem comportamentos e condições; RFCs descrevem protocolos. O identificador de uma fonte não prova todas as frases do capítulo: o escopo de cada uso aparece abaixo e nos links contextuais. Exemplos de topologia, medidas, nomes e respostas são escolhas didáticas, não observações de uma conta AWS.

## Fontes iniciais e seus recortes

A numeração R1–R17 preserva a lista inicial do briefing; os sufixos distinguem URLs que dividiam o mesmo identificador. AWS mantém documentação contínua. Fixamos no exemplo um **NAT público zonal**, sem afirmar que seja a única modalidade atual. Usamos a nomenclatura atual **Route 53 VPC Resolver**; isso não torna o novo material uma avaliação de todas as modalidades do serviço.

| ID | Uso | Escopo consultado | Fonte primária |
|---|---|---|---|
| R1 | 01,06 | Faixas e reservas de subnet IPv4; exceções não generalizadas | [Documento](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html) |
| R2 | 02,06,10 | Tabelas, destinos, alvos e associação; prioridade exige contexto | [Documento](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html) |
| R3 | 03,12 | Route 53 VPC Resolver, nome atual e resolução híbrida | [Documento](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html) |
| R4 | 05,08 | Papel do ACM, distinto do endpoint que negocia TLS | [Documento](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html) |
| R5 | 06 | Internet Gateway e condições do caminho IPv4 | [Documento](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html) |
| R6 | 06 | Modalidades NAT; exemplo escolhe público zonal | [Documento](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) |
| R7a | 07 | Security Groups, estado e alcance | [Documento](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) |
| R7b | 07 | NACL, ordem, direções e exceções | [Documento](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) |
| R8 | 08 | Diagnóstico ALB: emissor, destino e condição observada | [Documento](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html) |
| R9a | 09 | Reachability Analyzer: modelo e limites; não tráfego real | [Documento](https://docs.aws.amazon.com/vpc/latest/reachability/how-reachability-analyzer-works.html) |
| R9b | 09 | Flow Logs: metadados, não payload ou transação | [Documento](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html) |
| R10 | 10 | Peering e ausência de trânsito por terceira VPC | [Documento](https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html) |
| R11 | 10 | TGW, attachments e roteamento | [Documento](https://docs.aws.amazon.com/vpc/latest/tgw/how-transit-gateways-work.html) |
| R12 | 03–05,labs | Opções curl: conferir versão local, confiança, nome e tempos | [Documento](https://curl.se/docs/manpage.html) |
| R13 | 11 | Criptografia no Direct Connect, trechos e condições | [Documento](https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html) |
| R14 | 11 | Túneis VPN: parâmetros compatíveis, não prescrição de algoritmo | [Documento](https://docs.aws.amazon.com/vpn/latest/s2svpn/tunnel-configure.html) |
| R15 | 11,12 | BGP e políticas de seleção no Direct Connect | [Documento](https://docs.aws.amazon.com/directconnect/latest/UserGuide/routing-and-bgp.html) |
| R16 | 12 | Políticas DNS; não encaminhamento por pacote | [Documento](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html) |
| R17 | 01,L1 | ipaddress: redes estritas, interfaces, pertencimento e sobreposição | [Documento](https://docs.python.org/3/library/ipaddress.html) |

## Complementos de protocolo e mecanismo

| ID | Uso | Escopo | Fonte primária |
|---|---|---|---|
| S01 | 00 | TCP/IP como divisão de responsabilidades | [Documento](https://www.rfc-editor.org/rfc/rfc1122.html) |
| S02 | 01 | CIDR e agregação por prefixos | [Documento](https://www.rfc-editor.org/rfc/rfc4632.html) |
| S03 | 01 | Endereçamento privado IPv4 | [Documento](https://www.rfc-editor.org/rfc/rfc1918.html) |
| S04 | 01 | IPv6: endereços e loopback | [Documento](https://www.rfc-editor.org/rfc/rfc4291.html) |
| S05 | 01 | IPv6 e sua especificação de protocolo | [Documento](https://www.rfc-editor.org/rfc/rfc8200.html) |
| S06 | 01 | Faixa IPv6 reservada a documentação | [Documento](https://www.rfc-editor.org/rfc/rfc3849.html) |
| S07 | 02 | Prioridade de rotasAWS e limites do exemplo LPM | [Documento](https://docs.aws.amazon.com/vpc/latest/userguide/route-tables-priority.html) |
| S08 | 03 | DNS: papéis, hierarquia e cache | [Documento](https://www.rfc-editor.org/rfc/rfc1034.html) |
| S09 | 03 | DNS: mensagens e tipos | [Documento](https://www.rfc-editor.org/rfc/rfc1035.html) |
| S10 | 03 | DNS: respostas negativas e NODATA | [Documento](https://www.rfc-editor.org/rfc/rfc2308.html) |
| S11 | 03 | Alias como recurso específico doRoute 53 | [Documento](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-aws-resources.html) |
| S12 | 04 | TCP e limites do recebimento de bytes | [Documento](https://www.rfc-editor.org/rfc/rfc9293.html) |
| S13 | 04 | UDP | [Documento](https://www.rfc-editor.org/rfc/rfc768.html) |
| S14 | 04 | ICMP | [Documento](https://www.rfc-editor.org/rfc/rfc792.html) |
| S15 | 04 | Semântica HTTP | [Documento](https://www.rfc-editor.org/rfc/rfc9110.html) |
| S16 | 04 | HTTP/3 sobre QUIC | [Documento](https://www.rfc-editor.org/rfc/rfc9114.html) |
| S17 | 05 | TLS 1.3: recorte sem PSK/retomada/0-RTT | [Documento](https://www.rfc-editor.org/rfc/rfc8446.html) |
| S18 | 05 | Identidade de serviço e SAN | [Documento](https://www.rfc-editor.org/rfc/rfc9525.html) |
| S19 | 09 | Medições TCP e limites de throughput | [Documento](https://www.rfc-editor.org/rfc/rfc6349.html) |
| S20 | 11 | Mecanismo BGP | [Documento](https://www.rfc-editor.org/rfc/rfc4271.html) |
| S21 | 11 | IKEv2 | [Documento](https://www.rfc-editor.org/rfc/rfc7296.html) |
| S22 | 11 | HMAC: hash e autenticação, distintos de cifragem | [Documento](https://www.rfc-editor.org/rfc/rfc2104.html) |

## Como ler a evidência

- **Tema do pedido:** caminho e permissão, dimensionamento, transitividade, conectividade híbrida, falhas e necessidade antes do serviço. Origem temática genérica; não há citação pessoal ou transcrição pública.
- **Autoria didática:** cenas, analogias e seus limites, tabelas pequenas, perguntas, soluções, topologias e registros fictícios.
- **Revisão técnica:** fontes oficiais corrigem as simplificações listadas na tabela de equívocos. Acréscimos sobre DNS autoritativo e políticas são desenvolvimento autoral pesquisado.
- **Execução:** o executor registra versões e resultados locais dos laboratórios; contas AWS, roteamento AWS, health checks reais, circuitos VPN/DX, BGP e tráfego de produção não foram exercitados. Um resultado sintético não é PASS de um serviço AWS.

## Versões e portabilidade

As RFCs citadas são as edições identificadas por seus números, com seu escopo e atualizações. O exemplo conceitual de TLS usa TLS 1.3; o laboratório registra separadamente o protocolo negociado e os backends reais. A documentação de Python consultada é a versão contínua disponível (3.15.2 na data), enquanto a execução local usa Python 3.15.0. As flags do curl precisam existir na versão testada; um manual mais novo não autoriza copiar uma opção ausente no computador.

Os roteiros explicam o que rodou e o que foi somente previsto. Capturas e relatórios de execução não acompanham o pacote público. Os scripts locais e fixtures são fontes do repositório; disponibilizá-los como downloads pelo site exige uma decisão de integração separada.
