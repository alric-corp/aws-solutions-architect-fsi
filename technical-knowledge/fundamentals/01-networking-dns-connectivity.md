# 01 — Redes, DNS e conectividade híbrida

**Base:** N01/N05 listam CIDR, OSI, latência, VPN, Direct Connect e diagnóstico de transferência. **Complemento:** organizar a investigação por camadas e separar conectividade, segurança e desempenho. [Referências](../../references/README.md)

## Modelo mental

IP e prefixo descrevem endereçamento; rotas escolhem caminhos; protocolos de transporte conectam endpoints; DNS resolve nomes; TLS protege uma comunicação; HTTP define a troca da aplicação. Não são etapas intercambiáveis nem todos os protocolos seguem exatamente o mesmo transporte.

No desenho AWS, uma sub-rede pertence a uma AZ. VPC, tabelas de rotas, gateways e controles de tráfego definem a comunicação; colocar dois ícones próximos não cria conectividade. [Fonte T08](../../references/README.md#t08)

CIDR usa tamanho do prefixo, não categorias modernas obrigatórias de rede pequena, média e grande. `10.0.16.0/24` contém 256 endereços no bloco; quantidade utilizável depende do ambiente. Treine o cálculo, depois explique por que escolher a faixa exige crescimento, sobreposição e integrações.

## Pergunta inicial

“O que acontece quando o usuário digita o endereço do Internet Banking?”

Uma linha de raciocínio: verificar caches e resolução DNS; estabelecer a conexão pertinente; validar a identidade do servidor e a proteção do canal; enviar a requisição; passar pelos componentes de atendimento; consultar dependências; devolver e apresentar a resposta. Detalhes variam com protocolo, cache e conexões já abertas. Não descreva sempre uma nova resolução e um novo handshake completo.

<a id="protocolos"></a>
## Protocolos na prática

**TCP e UDP.** O TCP entrega um fluxo de bytes confiável e ordenado: abre a conexão com o handshake de três vias, retransmite o que se perde e controla o congestionamento. O UDP envia datagramas sem conexão, sem garantia de entrega nem de ordem; serve quando atraso importa mais que retransmissão ou quando o protocolo de cima cuida da confiabilidade, como em consultas DNS comuns, voz e QUIC. Na AWS, o ALB trabalha com HTTP, HTTPS e gRPC; o NLB, com TCP, UDP e TLS.

**Como o DNS resolve um nome.** A aplicação pergunta ao resolvedor configurado; na VPC, é o Route 53 Resolver. Sem a resposta em cache, o resolvedor recursivo consulta um servidor raiz, que indica os servidores do TLD (`.com`, `.br`); estes indicam os servidores autoritativos do domínio, que devolvem o registro (A, AAAA, CNAME ou alias do Route 53). Cada resposta fica em cache pelo TTL. Por isso uma mudança de DNS não chega a todos ao mesmo tempo, e alguns clientes guardam respostas por mais tempo que o esperado.

**HTTP/1.1, HTTP/2 e HTTP/3.** O HTTP/1.1 reaproveita conexões (keep-alive), mas cada uma atende uma requisição por vez. O HTTP/2 multiplexa várias requisições numa conexão TCP e comprime cabeçalhos; uma perda de pacote ainda atrasa todas, porque o TCP entrega em ordem. O HTTP/3 roda sobre QUIC, em UDP, com TLS 1.3 integrado e sem esse bloqueio entre fluxos. O CloudFront aceita HTTP/3 dos clientes, o que não muda o protocolo usado até a origem.

## Baixo throughput entre data centers

Antes de trocar o link, pergunte o que está sendo transferido, tamanho/quantidade dos arquivos, distância, taxa esperada, janela, criptografia e limites dos endpoints. Formule hipóteses sobre origem, destino e caminho. Meça os segmentos separadamente, com autorização.

Um link de alta capacidade não demonstra que a aplicação o utiliza. Compare latência, perdas, concorrência, leitura/escrita de disco e CPU. Não faça testes de carga indiscriminados em produção nem capture dados sensíveis para um laboratório.

## VPN, Direct Connect e MPLS

Compare implantação, previsibilidade, redundância, segurança e custo. MPLS é parte do repertório de conectividade do cliente; não é um botão da VPC nem garantia automática de criptografia. Pergunte qual serviço o provedor realmente entrega e como o conecta ao ambiente AWS.

Direct Connect não cifra dados por padrão. A decisão de proteção em trânsito considera TLS, IPsec e, onde aplicável, MACsec. Conectividade privada e cifragem são propriedades diferentes. [Fonte T09](../../references/README.md#t09)

## Aprofundamentos para o ensaio

“Existe rota de ida e volta?” “O problema ocorre por IP, por nome ou apenas em HTTPS?” “Um túnel UP prova que o banco consegue responder?” “O caminho de contingência suporta a carga?”

## Perguntas de entrevista

1. Do clique no navegador à resposta do internet banking: quais protocolos entram em cada etapa e onde há cache?
   - Aprofundamento: quem participa da resolução de um nome, do resolvedor ao servidor autoritativo?
2. Uma aplicação em três camadas deve expor só a camada web. Como você distribui sub-redes, rotas e controles?
3. Um banco quer manter o core no data center e lançar novos serviços na AWS. Que opções de conectividade você compara, e com quais critérios?
4. VPN pela internet ou Direct Connect: quando cada um faz sentido, e o que muda em criptografia?
5. Usuários de outros países reclamam de lentidão. Como você investiga e o que propõe?

Cache e CDN estão em [F02](02-http-rest-openapi.md); convivência híbrida, no [Case 05](../../cases/05-core-banking-modernization.md); arquitetura multi-região, no [Case 09](../../cases/09-multi-region-internet-banking.md).

## Exercício

No [Case 05](../../cases/05-core-banking-modernization.md), desenhe apenas o percurso entre uma task e o legado. Identifique rotas, resolução de nomes, controles, dependências de retorno e pontos de medição. Depois retire um caminho de rede e explique o comportamento esperado, sem prometer failover antes de testá-lo.
