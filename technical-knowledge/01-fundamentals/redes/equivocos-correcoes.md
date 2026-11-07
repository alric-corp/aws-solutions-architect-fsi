# Equívocos frequentes — mecanismo antes do nome do serviço

[Índice](README.md) · [Referências e revisão](referencias-e-revisao-tecnica.md)

Esta tabela reúne correções técnicas e limites didáticos. São explicações autorais apoiadas nas fontes indicadas, sem atribuir os equívocos a pessoas ou transformar um relato de experiência em regra universal.

| Equívoco | Correção e pergunta que faltava | Fonte primária |
|---|---|---|
| Privado equivale a criptografado | Endereçamento/caminho privado e proteção do canal são decisões diferentes. Que trecho está protegido? | [Direct Connect e criptografia](https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html) |
| Há rota, portanto está autorizado e saudável | Rota encaminha; controles e aplicação ainda precisam permitir e atender. | [Tabelas de rotas](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html) |
| Ping valida a aplicação | ICMP não testa a conexão TCP, o TLS ou a transação HTTP pretendida. | [ICMP](https://www.rfc-editor.org/rfc/rfc792.html), [HTTP](https://www.rfc-editor.org/rfc/rfc9110.html) |
| Anexar ao TGW libera todos os pares | Associação, propagação e tabelas de VPC/TGW determinam o caminho. | [TGW](https://docs.aws.amazon.com/vpc/latest/tgw/how-transit-gateways-work.html) |
| Dois peerings criam uma passagem transitiva | A↔B eB↔C não fornecem trânsito depeeringA↔C. Proxy de aplicação seria outro mecanismo. | [Peering](https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html) |
| BGP escolhe continuamente o link com menor latência | Troca de prefixos e políticas/atributos não é teste contínuo de compra ou ping. | [Roteamento noDX](https://docs.aws.amazon.com/directconnect/latest/UserGuide/routing-and-bgp.html) |
| AES e SHA são alternativas da mesma função | Cifragem, hash e autenticação têm papéis distintos; não se escolhe só pela lista de algoritmos suportados. | [HMAC](https://www.rfc-editor.org/rfc/rfc2104.html), [opçõesVPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/tunnel-configure.html) |
| Subnet pública expõe qualquer processo | Rotas, endereço aplicável, controles e listener compõem a análise IPv4. | [Internet Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html) |
| NAT publica a aplicação para conexões externas | O fluxo de saída e sua tradução não constituem um balanceador de entrada. | [NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) |
| Um /16 provoca broadcast para 65 mil máquinas na VPC | O bloco é espaço de endereços. VPC não suporta broadcast; dimensionar exige consumo e crescimento. | [Subnet sizing](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html) |
| /24 sempre oferece 254 hosts | A convenção comum não é a regra universal; no recorte AWSIPv4 semBYOIP, são 251 atribuíveis. | [ReservasAWS](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html) |
| DNS, BGP e aplicação trocam todos juntos | Cache, seleção de rotas e estado da aplicação têm mecanismos e tempos diferentes. | [PolíticasDNS](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html) |
| Após voltar o principal, todo tráfego retorna sempre automaticamente | Failback depende da política, detecção, conexões e validação do cenário. | [RoteamentoDX](https://docs.aws.amazon.com/directconnect/latest/UserGuide/routing-and-bgp.html), [políticasDNS](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html) |
| --resolve corrigiu o DNS | A opção fornece endereço para um teste por nome/porta; não é uma consulta ou alteração DNS real. | [curl](https://curl.se/docs/manpage.html#--resolve) |
| ACK, ACCEPT ou alvo saudável significam compra confirmada | São evidências de escopos diferentes; precisamos localizar a confirmação da operação. | [TCP](https://www.rfc-editor.org/rfc/rfc9293.html), [Flow Logs](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html) |
| O certificado protege também o trecho seguinte | Terminação cria fronteiras; uma nova conexão precisa da proteção exigida para ela. | [ACM](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html) |
| Todo HTTP usa TCP | O núcleo local escolhe HTTP/1.1/TCP; HTTP/3 usa QUIC/UDP. | [HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html) |
| Dois túneis eliminam qualquer ponto único de falha | Equipamento, provedor, energia e outras dependências podem continuar compartilhados. | [ResiliênciaVPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/vpn-redundant-connection.html) |

Para praticar uma correção, troque a porta, a direção, a causa ou a política do exemplo e explique o novo resultado. Nomear um produto sem descrever mecanismo e evidência não responde ao desafio.
