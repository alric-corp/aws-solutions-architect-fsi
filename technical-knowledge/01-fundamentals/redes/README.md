# Redes do zero — do clique à resposta

Ana abre o catálogo da Loja Horizonte. Às vezes não encontra o nome; às vezes chega ao endereço e não recebe a página. Esta trilha ensina a distinguir essas situações antes de escolher um serviço ou mudar uma regra. Você começa sem precisar conhecer IP, subnet, porta, DNS, rota ou TLS.

O percurso segue perguntas que podem ser respondidas com evidências:

**Quem conversa com quem? → Há caminho de ida e volta? → Está permitido? → O canal está protegido? → O serviço atende? → O que sustenta essa conclusão?**

As aulas e exercícios são autorais, construídos a partir de dúvidas temáticas de estudo e revisados em documentação primária. Personagens, empresas, endereços e registros são fictícios. Não é um programa oficial de entrevista nem um projeto pronto para produção. A [tabela de equívocos](equivocos-correcoes.md) explica as simplificações revistas, sem atribuições pessoais.

## Como estudar

Comece por 00. Em cada aula, desenhe a conversa e responda antes de abrir a **Resposta comentada**. Depois execute o laboratório correspondente, se puder: compare previsão, resultado observado e limite do experimento. Resolver um exemplo não mede senioridade nem certifica um serviço AWS.

O núcleo essencial é 00–09. Você já pode praticar processos, portas, tempo de espera e certificados antes de conhecer conectividade híbrida. A etapa 10–12 amplia o mesmo raciocínio para redes conectadas e contingência;13 reúne os desafios. O [glossário](glossario.md) é apoio para consulta, não uma lista para decorar.

## Núcleo essencial: uma comunicação e suas dependências

| Capítulo | Pergunta concreta | Prática associada |
|---|---|---|
| [00 — Do clique à resposta](00-clique-resposta.md) | Quem envia, quem atende e que mensagem volta? | Desenhar dois pedidos diferentes |
| [01 — IP, CIDR e sub-redes](01-ip-cidr-subnets.md) | O endereço cabe no bloco? Que espaço estou reservando? | [L1 — Cálculos e rotas](laboratorio/l1-cidr-rotas.md) |
| [02 — Rotas de ida e volta](02-rotas-ida-volta.md) | Quem encaminha o pedido e a resposta? | Selecionar prefixos e trocar um alvo |
| [03 — DNS e nomes](03-dns-nomes.md) | Que informação foi obtida para o nome? | Interpretar respostas; limite de --resolve |
| [04 — Transportes, portas e HTTP](04-transportes-portas-http.md) | Chegou ao processo e houve resposta? | [L2 — Processo/porta](laboratorio/l2-processo-porta.md), [L3 — Espera](laboratorio/l3-conectou-demorou.md) |
| [05 — HTTPS e TLS](05-https-tls.md) | O canal e a identidade foram validados? | [L4 — Nome e certificado](laboratorio/l4-nome-certificado.md) |
| [06 — VPC, subnets e saída](06-vpc-subnets-saida.md) | Qual caminho atende entrada, banco e API externa? | Desenho de três fluxos separados |
| [07 — SG e NACL](07-sg-nacl.md) | Que regra trata cada sentido da conexão? | [L5 — Topologias e registros](laboratorio/l5-topologias-registros.md) |
| [08 — Publicar uma aplicação](08-publicar-aplicacao.md) | O ponto de entrada e sua origem estão atendendo? | Comparar saúde e jornada |
| [09 — Investigar com evidências](09-investigacao-evidencias.md) | Que teste discrimina as hipóteses restantes? | [Simulados](simulados/README.md) |

## Etapa seguinte: interligar redes e recuperar a jornada

| Capítulo | Pergunta concreta |
|---|---|
| [10 — Peering, TGW e segmentação](10-peering-tgw.md) | As ligações existentes oferecem o acesso pretendido? |
| [11 — Rede local, VPN, Direct Connect e BGP](11-conectividade-hibrida.md) | Que caminho e proteção atendem os requisitos? |
| [12 — Falha, recuperação e DNS](12-falha-recuperacao-dns.md) | O que muda quando rotas, nomes e aplicação convergem em tempos diferentes? |
| [13 — Revisão e desafios](13-revisao-desafios.md) | Consigo defender uma decisão e explicar sua evidência? |

## Nossos recortes não mudam silenciosamente

No começo existem navegador e aplicação. Depois entram nome, transporte e proteção. No desenho AWS, a VPC A usa `10.20.0.0/16`; as subnets web, aplicação e banco usam respectivamente `10.20.1.0/24`, `10.20.2.0/24` e `10.20.3.0/24`. A aplicação pode usar `10.20.2.10` e o banco `10.20.3.20`. A aula 08 acrescenta outra subnet web, `10.20.4.0/24`, ao explicar duas AZs para sua opção de ALB.

Na etapa de interligação, B usa `10.30.0.0/16`, C usa `10.40.0.0/16` e a rede local usa `172.20.0.0/16`. Cada aula declara portas, iniciador e o que mudou. As faixas dos desenhos não autorizam enviar tráfego a elas.

Nos laboratórios, endereços e portas são outros: somente loopback, no próprio computador, com portas livres acima de 1024. `loja.test` é um nome de laboratório, resolvido explicitamente apenas no teste apropriado. Não há conta AWS, captura de trabalho ou dependência de domínios de terceiros. Veja [preparação e limites](laboratorio/README.md).

## Apoios e aprofundamentos

- [Glossário por responsabilidade](glossario.md).
- [Referências e revisão técnica](referencias-e-revisao-tecnica.md), com data, versão e escopo.
- [Equívocos frequentes e correções documentadas](equivocos-correcoes.md).
- [Laboratórios L1–L5](laboratorio/README.md) e [simulados com condução separada](simulados/README.md).

Depois do núcleo, [F01](../01-networking-dns-connectivity.md) funciona como visão geral e aprofundamento. [F02](../02-http-rest-openapi.md) detalha HTTP; [F03](../03-security-identity.md) aprofunda identidade; [F08](../08-observability-troubleshooting.md) amplia o método de investigação. Para resultado de compra incerto, vá ao capítulo de [timeout e idempotência de ACID](../acid/07-timeout-idempotencia.md), sem confundir recuperação de rede com confirmação da compra.

[Começar: 00 — O que acontece quando abro um site? →](00-clique-resposta.md)
