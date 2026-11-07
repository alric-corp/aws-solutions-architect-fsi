# Glossário — que responsabilidade estou investigando?

[Índice](README.md) · [Revisão e desafios](13-revisao-desafios.md)

Use a definição junto do exemplo da aula. Os termos abaixo não substituem a descrição de origem, destino, direção, porta e evidência.

## Participantes e endereços

| Termo | Significado neste percurso |
|---|---|
| Cliente / servidor | Papéis de quem solicita e de quem atende uma interação; um programa pode exercer ambos. |
| Processo | Programa em execução; existir não significa estar escutando na porta desejada. |
| Interface de rede | Ponto físico ou virtual pelo qual o sistema participa de uma rede. |
| IP | Endereço usado no encaminhamento entre redes; não é uma identidade de pessoa ou permissão. |
| IPv4 / IPv6 | Versões de IP, com 32 e 128 bits de endereço; ambas exigem análise de rotas e controles. |
| Octeto | Grupo de 8 bits; cada grupo do IPv4 escrito em decimal vai de 0 a 255. |
| Prefixo / CIDR | Fronteira de bits fixos de um bloco, como /24; o restante varia. |
| Máscara | Representação dessa fronteira, como 255.255.255.0 para/24. |
| Subnet / sub-rede | Conjunto de endereços separado para determinado contexto; numa VPC, pertence a umaAZ. |
| Loopback | Comunicação com o próprio sistema;127.0.0.1 e::1 são nossos exemplos. |
| MAC / switch / enlace | Identificador, equipamento e trecho relacionados à comunicação local; não descrevem sozinhos uma VPC. |

## Caminho e nomes

| Termo | Significado neste percurso |
|---|---|
| Rota / próximo salto | Decisão de encaminhamento e próximo alvo; não garantia de atendimento. |
| Gateway | Passagem com papel definido entre redes ou domínios de encaminhamento. |
| Default | Rota usada na ausência de prefixo mais específico; /0 abrange todos os endereços daquela família. |
| Longest prefix match | Escolha do prefixo mais específico que contém o destino, respeitadas as regras do contexto. |
| Ida / retorno | Os dois sentidos que precisam ter caminho e controles compatíveis. |
| Assimetria | Caminhos diferentes nos dois sentidos, que podem exigir cuidados com controles stateful. |
| DNS / resolvedor | Sistema de informações sobre nomes e participante que procura/responde consultas. |
| Autoritativo / zona | Servidor com responsabilidade pelos dados de uma zona e a unidade administrativa desses dados. |
| A / AAAA / CNAME | Registros para IPv4,IPv6 e outro nome, respectivamente. |
| TTL / cache | Tempo de vida do dado e armazenamento para reutilização; não cronômetro universal de troca de tráfego. |
| Alias Route 53 | Recurso específico do provedor; não tipo universal DNS. |
| NXDOMAIN / NODATA | Nome inexistente versus resposta sem o tipo procurado, conforme a mensagem completa. |
| SERVFAIL / timeout | Resposta de falha do servidor DNS versus ausência de resposta dentro do prazo do cliente. |

## Conversa e proteção

| Termo | Significado neste percurso |
|---|---|
| Pacote / segmento / datagrama | Unidades de dados em contextos de protocolo; não correspondem necessariamente a uma compra. |
| Porta / bind / listener | Ponto de comunicação, sua associação local e atendimento que está escutando. |
| Porta efêmera | Porta temporária de origem escolhida no contexto do cliente; intervalo não é universal. |
| TCP | Transporte com conexão e fluxo de bytes confiável/ordenado; não confirma o negócio. |
| UDP / ICMP | Transporte de datagramas e protocolo de controle/diagnóstico IP, com papéis diferentes. |
| SYN / SYN-ACK / ACK | Eventos da abertura TCP simplificada;ACKnão é recibo comercial. |
| HTTP / Host | Protocolo de aplicação e nome de atendimento informado no HTTP/1.1 deste percurso. |
| TLS / HTTPS | Proteção da comunicação e uso de HTTP com TLS. |
| Certificado / SAN | Documento criptográfico de identidade e campo com nomes sujeitos à verificação. |
| CA / cadeia de confiança | Autoridade certificadora e caminho de assinaturas aceito pelo cliente. |
| SNI | Indicação de nome na negociação TLS; alterar a URL pode mudar essa identidade esperada. |
| Autenticação / autorização | Verificar identidade versus decidir a ação permitida. |
| Trânsito / repouso | Informação em comunicação versus armazenada; uma proteção não comprova a outra. |

## Aplicação na AWS e entre redes

| Termo | Significado neste percurso |
|---|---|
| Região / AZ / VPC | Área geográfica de serviços, zona de disponibilidade e rede virtual do contexto AWS. |
| ENI | Interface de rede elástica; associa endereços e configurações no contexto dos recursos. |
| IGW / NAT | Gateway de internet da VPC e tradução de endereços; não são permissões ou autenticação. |
| SG / NACL | Security Group e lista de controle de rede; estado, associação e avaliação diferem. |
| Stateful / stateless | Controle que acompanha estado da conexão versus avaliação independente do pacote. |
| IAM / WAF / ACM | Permissões AWS, filtragem de requisições web e gerenciamento de certificados; não substituem todos os demais controles. |
| Listener / target group | Ponto de atendimento do balanceador e conjunto/configuração de destinos. |
| Health check | Verificação específica de saúde; não teste automático da compra inteira. |
| Peering / transitividade | Ligação de um par de VPC s e capacidade de passar por uma rede intermediária; peeringnão oferece essa transitividade. |
| TGW / attachment | Transit Gateway e ligação de uma rede a ele; associação/propagação determinam parte do alcance. |
| On-premises / equipamentoCGW | Rede local administrada pela empresa e equipamento que termina suaVPN. |
| RecursoCustomer Gateway / VGW | Representação do equipamento na AWS e gateway virtual anexado à VPC nesta topologia. |
| VPN / IKE / IP sec / DPD | Conexão por túneis, negociação de chaves, proteção IP e detecção de ponta sem resposta. |
| Direct Connect / VIF / DXGW | Conectividade dedicada, interface virtual e gateway usado na associação do caminho escolhido. |
| BGP / ASN / anúncio | Protocolo de alcançabilidade, identificação de domínio administrativo e divulgação de prefixos/caminhos. |
| MACsec / AES / SHA / HMAC | Proteção de enlace; cifragem; funções de hash; autenticação com hash e chave, respectivamente. Não são alternativas da mesma função. |

## Evidências e recuperação

| Termo | Significado neste percurso |
|---|---|
| Latência / banda / throughput | Demora, capacidade nominal e taxa efetivamente obtida; não são medidas intercambiáveis. |
| Perda / jitter / retransmissão | Dados que não chegam, variação de atraso e reenvio no contexto do protocolo. |
| MTU / PMTUD | Tamanho de unidade transmissível e descoberta do tamanho de caminho; aprofundamentos, não pré-requisito inicial. |
| Reachability Analyzer | Modelo de configuração com escopo próprio; não envia tráfego real de aplicação. |
| Flow Logs | Registros de metadados de fluxos; não payload ou transação completa. |
| Failover / failback / fallback | Mudar de caminho após falha, retornar conforme política e oferecer comportamento alternativo de aplicação. |
| Hipótese / evidência / critério | Explicação proposta, observação que a sustenta/restringe e condição definida para decidir. |

As definições operacionais e suas ressalvas são desenvolvidas nas aulas e rastreadas nas [referências](referencias-e-revisao-tecnica.md).
