# Rodada 4 — Material de condução

Este roteiro contém os cartões para uma investigação orientada por evidências. Todos os registros de pacotes, regras e aplicação são sintéticos e não correspondem a uma conta AWS.

## Objetivos de observação

Observe se a pessoa desenha ida e volta com as portas corretas, distingue o comportamento de SG e NACL e confirma qual tabela está efetivamente associada. O foco não é decorar uma faixa efêmera universal: o intervalo do cliente é um dado contextual que precisa ser solicitado.

## Estado reservado ao instrutor

A NACL da subnet da aplicação permite entrada na porta de destino 5432, mas o pacote de retorno desta conversa chega à porta 40000 do cliente. A regra não corresponde e o retorno cai na negação implícita. As rotas locais, SGs e regras da subnet do banco estão adequados para o fluxo declarado. O intervalo efêmero configurado no cliente deste exercício é 32768–60999; não generalize para todo sistema ou produto.

## Cartões

| Solicitação ou equivalente | Informação liberada — sintética | Conclusão possível | Ainda incerto |
|---|---|---|---|
| Qual tentativa concreta e qual etapa expira? | Uma nova conexão TCP usa `10.20.2.10:40000 → 10.20.3.20:5432`; o cliente não conclui a conexão. | Não houve uma consulta SQL demonstrada; existe uma conversa concreta. | Onde a ida ou a volta deixa de ser permitida. |
| Qual seria o pacote de retorno? | `10.20.3.20:5432 → 10.20.2.10:40000`. | A porta de destino da resposta é a porta escolhida pelo cliente, não 5432. | Quais controles correspondem a essa direção. |
| Ida chegou ao destino e há indício no retorno? | Registros do exercício mostram a ida permitida e uma rejeição no retorno junto à subnet da aplicação. | Priorizar o caminho de volta é justificável. | Um `REJECT` isolado não identifica sozinho a regra ou o controle causador. |
| Quais rotas, SGs e associações são efetivos? | Rotas locais cobrem as duas subnets. SG da app permite saída ao banco:5432; SG do banco permite a origem prevista. Estado da conexão permite o retorno no modelo de SG. NACLs e respectivas associações são entregues ao pedir as regras por direção. | Não há evidência para expor o banco ou ampliar SG; NACL deve ser analisada separadamente por ser stateless. | A regra efetiva que permite ou nega o retorno. |
| Quais regras de NACL valem em cada sentido, na ordem? | App saída permite banco:5432; banco entrada permite app:5432; banco saída permite destino app:32768–60999; app entrada permite **destino 5432** vindo do banco e depois nega implicitamente. Nenhuma regra anterior muda a conclusão. | A entrada da app não corresponde ao destino 40000 do retorno. | A menor correção deve considerar o intervalo real e o escopo de origem. |
| Qual intervalo o cliente pode escolher e qual validação é possível? | Cliente deste exercício usa 32768–60999. Após regra de retorno com origem na subnet do banco e intervalo de destino adequado, conexões novas usam portas distintas e concluem; uma origem não autorizada continua negada. | A correção cobre esta configuração do cliente sem abrir todo tráfego. | Uma conexão aberta não demonstra o resultado de um pedido anterior. |

## Intervenção e validação

Aceite a proposta de ajustar a NACL efetiva da subnet da aplicação para o retorno necessário, com origem e protocolo delimitados, revisão de precedência e manutenção dos demais controles. Exigir só a porta 40000 fixa corrigiria uma observação, mas não outras escolhas legítimas deste cliente. Permitir todas as portas de qualquer origem não é a resposta ao exercício.

[Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) acompanham estado de conexões permitidas; [NACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) avaliam entrada e saída conforme as regras ordenadas. Não transporte a propriedade stateful de um para o outro. O formato exato de registros e exceções de serviços exige consulta à documentação; aqui o tráfego é TCP entre app e banco, não consulta ao resolvedor da VPC.

Validar: conexão nova a partir da origem afetada, teste negativo de origem não autorizada e operação controlada do pedido. Se uma operação anterior teve resultado desconhecido, conferir sua identidade e estado antes de reenviar. O teste da rede não resolve sozinho a incerteza transacional.

## Critérios e debrief

Pontos para observar: tuplas corretas; busca da associação real; primeira regra correspondente; intervalo contextual; negativa a mudanças amplas; conexão nova e validação de negócio. Uma resposta parcial “liberar a volta” deve informar de onde, para onde, em qual direção e quais portas de destino. Aceite desenho ou explicação equivalente ao nome técnico.

Transferência: mude a porta de origem da app para 51000. Ela deve continuar coberta. Depois use 62000: esta regra contextual não cobre o pacote; a pessoa precisa verificar a configuração antes de ampliá-la. Inverta quem inicia a conversa: não reutilize automaticamente as mesmas portas e permissões.

Negócio: “O bloqueio identificado impede o retorno de novas conexões ao banco; a correção é limitada à regra necessária. Ainda vamos verificar os pedidos pendentes antes de repetir qualquer gravação.” Operação: registrar as duas tuplas, a NACL associada, ordem/regras e amostras positivas e negativas, sem capturar payload de produção.

[Praticar L5](../../laboratorio/l5-topologias-registros.md) · [Voltar aos simulados](../README.md)
