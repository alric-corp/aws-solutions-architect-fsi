# Simulado 3 — Material do instrutor

Compartilhe somente a abertura escolhida de [candidato.md](candidato.md). A e B são cenários separados. Inventário, resultados de ferramentas, horários e registros são **dados sintéticos para treinamento**, no dia fictício D em UTC. Nenhum comando deve ser executado. Use o [guia](../guia-do-instrutor.md) para aceitar perguntas equivalentes.

## 1. Competências avaliadas

Reconstruir origem e destino; separar resolução, roteamento, controles, TCP, TLS e resposta da aplicação; comparar ida e retorno; propor correção restrita. Na [rubrica](../rubrica.md), observe se as evidências mudam a hipótese e se a mitigação preserva controles.

## 2. Estado real e premissas do cenário

**A — API externa IPv4.** VPC `10.20.0.0/16`; tasks em subnets privadas `10.20.11.0/24` (AZ A) e `10.20.12.0/24` (AZ B). A API fictícia `frete.parceiro.example` resolve para `203.0.113.40:443`. Cada AZ usa um NAT Gateway público zonal na subnet pública correspondente; essas subnets têm rota para Internet Gateway. Não há IPv6, proxy ou firewall intermediário. Uma alteração associou a subnet privada B a uma tabela contendo apenas a rota local: falta saída para o NAT dessa AZ. O NAT permanece disponível. A subnet A continua correta.

**B — PostgreSQL privado.** Na mesma VPC, task `10.20.12.18` tenta `db.pedidos.interno.example → 10.20.22.40:5432`, em outra subnet. A rota local atende ambos os sentidos e não há rota mais específica ou inspeção. SGs permitem o fluxo. Uma alteração na NACL da subnet da aplicação permite saída para 5432, mas não o retorno para a porta efêmera do cliente. A causa é o bloqueio de retorno, não NAT. Banco atende conexões de uma subnet de controle.

Endereços públicos de documentação e nomes `.example` são ilustrativos. As topologias são premissas destes exercícios, não regras para toda VPC. Hipóteses alternativas iniciais: DNS, caminho, SG, NACL, processo sem listener, certificado ou resposta de negócio.

## 3. Linha do tempo

| Variante | Antes | Mudança | Sintoma e coleta |
|---|---|---|---|
| A | 13:00, ambas as AZs acessam frete | 13:04, nova associação de tabela na subnet B | 13:06, só B tem timeout de conexão; 13:08, inventário e comparação |
| B | 14:00, acesso privado funcional | 14:03, troca de NACL na subnet da aplicação | 14:05, novas conexões falham; 14:07, coleta de ida e retorno |

Na B, conexões anteriores não são usadas como prova de que novos handshakes passam. O cartão descreve novas conexões.

## 4. Evidências sintéticas progressivas

### A — Cartões da API externa

**A1 — Recorte e resolução.** Tasks estão RUNNING, sem health check dessa dependência. Erro da aplicação: `connect_timeout after 3000 ms; remote=203.0.113.40:443`; não há status HTTP. Somente requests originadas da AZ B falham. Resolução a partir do contexto da aplicação em ambas as AZs retorna `203.0.113.40`. DNS correto não demonstra acesso TCP.

**A2 — Caminho efetivamente associado.** Inventário às 13:08:

| Subnet | Rotas relevantes |
|---|---|
| privada A | `10.20.0.0/16 → local`; `0.0.0.0/0 → nat-A` |
| privada B | `10.20.0.0/16 → local`; nenhuma rota que alcance `203.0.113.40` |
| pública de nat-B | `10.20.0.0/16 → local`; `0.0.0.0/0 → igw-treino` |

`nat-B` está disponível, tem endereço público associado e não há evidência de esgotamento de portas. A associação de tabela mudou às 13:04. Não basta ver uma tabela correta sem confirmar sua associação à subnet da task.

**A3 — Controles e comparação.** SG da task permite saída TCP 443 para o destino declarado. NACLs permitem os pacotes de ida e retorno do caminho aprovado. Uma verificação controlada preexistente na AZ A conclui TCP e TLS com certificado válido, e recebe HTTP 200 da API. Na B, TCP não se estabelece; não há negociação TLS nem requisição HTTP enviada. Esses resultados não são capturas de host Fargate.

**A4 — Recuperação condicional.** Se propuser restaurar a associação correta ou a rota aprovada para `nat-B`, com revisão da equipe de rede: novas conexões da B concluem TCP/TLS; cotação recebe HTTP 200 e checkout canário conclui. Cinco minutos de recorte por AZ sem novos connect timeouts. A correção não prova sozinha o tratamento de pedidos que falharam durante o incidente.

### B — Cartões do banco privado

**B1 — Recorte e nome.** Novas conexões da subnet da task expiram em três segundos; uma subnet de controle conecta ao banco. Resolução vista pela aplicação e por coleta autorizada retorna `10.20.22.40`. Não há erro de senha, SQLSTATE de autenticação ou mensagem TLS nas tentativas afetadas.

**B2 — Rotas e SGs.** Tabelas das duas subnets têm `10.20.0.0/16 → local`, sem desvios. SG da task permite saída TCP 5432 ao SG do banco; SG do banco permite entrada TCP 5432 do SG das tasks. Não há NAT, Internet Gateway ou endpoint público no fluxo. No recorte inspecionado, não há outro SG associado que altere a análise.

**B3 — Portas e NACLs.** Uma tentativa foi instrumentada como `10.20.12.18:40000 → 10.20.22.40:5432`. Retorno esperado: `10.20.22.40:5432 → 10.20.12.18:40000`. Premissa do cliente neste exercício: novas conexões usam portas efêmeras de 32768 a 60999; isso não é uma faixa universal.

| Controle inspecionado | Regras relevantes, em ordem |
|---|---|
| NACL da subnet da aplicação, saída | 100: permitir TCP, destino `10.20.22.0/24`, porta de destino 5432 |
| NACL da subnet da aplicação, entrada | 100: permitir TCP, origem `10.20.22.0/24`, porta de destino 5432; nenhum Allow posterior cobre retorno para 32768–60999 |
| NACL da subnet do banco, entrada | Permite da subnet da aplicação para destino 5432 |
| NACL da subnet do banco, saída | Permite à subnet da aplicação para destinos 32768–60999 |

O padrão final das NACLs é negar; outras regras preservam os fluxos de atendimento da API e não correspondem ao retorno do banco. Recorte normalizado de Flow Logs já disponíveis: saída de SYN pela ENI da aplicação `ACCEPT`; retorno do banco de 5432 para 40000 na ENI da aplicação `REJECT`. O inventário da NACL identifica a regra incompatível. O registro `REJECT` isolado não informa automaticamente qual SG ou NACL foi responsável.

**B4 — Recuperação condicional.** Após substituir a regra de entrada equivocada por permissão de retorno, restrita à subnet do banco e à faixa validada, com aprovação da rede: novas conexões estabelecem TCP; negociação PostgreSQL/TLS com validação do servidor passa; autenticação e operação canário autorizadas passam. Cinco minutos sem novos connect timeouts nas subnets afetadas. Teste de origem não autorizada continua negado.

## 5. Solicitação → evidência → conclusão e limite

| Solicitação da candidata | Evidência fornecida | O que permite concluir | O que não permite concluir |
|---|---|---|---|
| Qual task, AZ, dependência, erro e nome resolvido? | A1 ou B1 | Escopo e etapa provável anterior a HTTP/SQL | RUNNING garante acesso à dependência |
| Qual origem, destino e caminho efetivamente associado? | A2 ou B2 | Falta rota externa em A; há caminho local em B | Toda subnet privada depende de NAT para qualquer destino |
| O que SGs e NACLs permitem, incluindo retorno? | A3 ou B2+B3 | Controles de A não são a causa; retorno é bloqueado em B | Um `REJECT` sozinho identifica exatamente o controle |
| TCP conclui? TLS começa? Há resposta da aplicação? | A3 ou B3; B4 só após mitigação | Localização por etapa e comparação com controle | Uma porta aberta comprova certificado, senha ou compra correta |
| O que mudou e o que descarta a hipótese? | Associação em A2 ou regra em B3 | Mudança compatível com a falha observada | Correlação temporal sem mecanismo basta |
| Como ficaram novas conexões e a jornada? | A4 ou B4, condicional | Recuperação do fluxo testado | Todos os fluxos e dados foram validados |

## 6. Raciocínio esperado e alternativas válidas

Começar com origem real da conexão e dependência exata, incluindo porta e família IP. Validar nome, caminho, controles e retorno; localizar se a falha ocorre antes de TCP, em TLS ou depois da requisição. Na A, associar a tabela sem rota ao recorte por AZ. Na B, identificar porta de destino do retorno e o caráter sem estado da NACL.

Aceitar inspeção de inventário, Flow Logs e análise estática preexistentes, ou coleta autorizada no contexto da aplicação. Reachability Analyzer pode ajudar dentro do seu escopo suportado, mas não testa a saúde da API externa nem conclui uma transação. Não exigir acesso ao host Fargate ou shell no RDS. Se a ferramenta estiver ausente, discutir como obter uma evidência equivalente e seu limite.

## 7. Perguntas de aprofundamento

- “De qual origem seu teste foi feito? Ela segue o mesmo caminho da task?”
- “Resolver o nome prova que a conexão abriu?”
- “No retorno do banco, a porta de destino é 5432 ou a porta do cliente?”
- “Um timeout, uma conexão recusada e um HTTP 403 sugerem qual etapa?”
- “Qual evidência descartaria o NAT na variante B?”
- “Como validaria uma nova conexão se o pool ainda tivesse conexões antigas?”

## 8. Respostas incompletas e como aprofundá-las

| Resposta | Pergunta para aprofundar |
|---|---|
| “É o NAT porque está privado.” | Qual é o destino e qual rota mais específica o alcança? |
| “Abro entrada 5432 na task.” | Para qual porta o banco envia o retorno dessa tentativa? |
| “SG permite, então passa.” | Qual controle de subnet também avalia ida e volta? |
| “Dou ping.” | O que ICMP prova sobre TCP 5432, TLS e a operação? |
| “Libero tudo para testar.” | Como obter a mesma discriminação por inventário e fluxo restrito, preservando os controles? |

## 9. Mitigações, riscos e validação

A: restaurar associação/rota aprovada para o NAT correto; revisar impacto em todos os destinos da subnet, capacidade e procedimento de retorno. B: corrigir somente a regra de retorno necessária, respeitando origem, protocolo, faixa efetiva e precedência. Não alterar NACL da VPC inteira por padrão, publicar banco ou retirar SG.

Equipe de rede aprova e acompanha; aplicação valida cotação ou operação de banco com dados fictícios. Parar se outro fluxo antes funcional regredir, aparecer acesso indevido ou a mudança não explicar os resultados. Reverter configuração de rede conforme procedimento se seguro; isso não resolve automaticamente operações de negócio de resultado incerto.

Prevenção: revisão de associações de rotas/NACLs, verificações por AZ e teste de novas conexões com origem permitida e negada. A4/B4 são limites didáticos de observação, não garantias gerais.

## 10. Exemplo de resposta inicial organizada

“Quero saber qual dependência e quais origens falham, desde quando e com qual erro. Tasks em execução não comprovam comunicação. Vou reconstruir o fluxo pelo nome e endereço efetivo, porta, rotas e controles dos dois sentidos. Precisamos localizar se o TCP abre, se o TLS conclui e se há resposta antes de escolher uma intervenção restrita.”

## 11. Explicação técnica aprofundada

A rota decide o próximo salto. Nesta A, o destino IPv4 público exige a saída desenhada: subnet privada → NAT público → Internet Gateway → parceiro. Nesta B, a rota local da VPC conduz ao IP privado do banco. Uma rota local pode coexistir com rotas mais específicas; por isso o cartão declara sua ausência. [Rotas](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html) e [NAT](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html), consulta em 01/11/2026.

SGs acompanham estado e permitem retorno de fluxos aceitos; NACLs avaliam regras de entrada e saída sem esse estado. A porta do servidor é destino na ida e origem na volta. O caso B exige retorno à porta efêmera da task, não uma entrada adicional 5432 para receber a resposta. [Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) e [NACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html), consulta em 01/11/2026.

Timeout de conexão indica ausência de conclusão no prazo, podendo resultar de descarte, caminho ou destino silencioso. Recusa ativa sugere RST ou rejeição por algum componente, não prova qual processo a gerou. Falha de validação TLS exige transporte já suficiente para chegar à negociação; HTTP 403 demonstra que algum componente HTTP respondeu, não que o backend de negócio autorizou. Use logs do cliente e do destino para localizar a origem.

Flow Logs ajudam a observar metadados de fluxo; `ACCEPT` não valida TLS nem aplicação. Análise de configuração também não comprova entrega funcional. [Flow Logs](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html) e [Reachability Analyzer](https://docs.aws.amazon.com/vpc/latest/reachability/what-is-reachability-analyzer.html), consulta em 01/11/2026. Testes DNS, de porta e TLS são complementares, no contexto autorizado e sem imprimir segredos. Aqui seus resultados são narrados pelo instrutor.

## 12. Exemplo de comunicação para negócio

A: “A falha está concentrada nas cotações originadas de uma zona. Confirmamos que esse caminho perdeu a rota de saída aprovada. A equipe de rede revisará a correção e a aplicação testará a compra em cada zona. Enquanto isso, não confirmaremos compras sem frete válido. Atualizaremos em dez minutos com o resultado e eventuais tentativas pendentes.”

B: “Identificamos um bloqueio no retorno da conexão privada com o banco. A correção proposta preserva o banco privado e restringe o tráfego às origens necessárias. Vamos verificar novas conexões e operações antes de declarar a recuperação.”

## 13. Debrief e links de revisão

Peça um desenho dos dois sentidos com endereços e portas. Troque A por B em outra rodada e observe se a candidata muda o caminho investigado. Revise [F01 — redes](../../../../technical-knowledge/01-fundamentals/01-networking-dns-connectivity.md), [F03 — segurança](../../../../technical-knowledge/01-fundamentals/03-security-identity.md) e [F08 — evidência](../../../../technical-knowledge/01-fundamentals/08-observability-troubleshooting.md).

## 14. Fontes técnicas

Consultadas em **01/11/2026**: [rotas](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html), [NAT Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html), [SG](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html), [NACL](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html), [Flow Logs](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html) e [Reachability Analyzer](https://docs.aws.amazon.com/vpc/latest/reachability/what-is-reachability-analyzer.html). Suportam mecanismos e limites das ferramentas, não os resultados fictícios. Veja o [catálogo](../../../../references/troubleshooting-fontes.md).
