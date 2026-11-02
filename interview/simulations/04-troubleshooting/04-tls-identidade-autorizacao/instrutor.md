# Simulado 4 — Material do instrutor

Leia somente a abertura escolhida de [candidato.md](candidato.md). A e B são variantes independentes. Todos os inventários, certificados representados, registros e horários são **dados sintéticos para treinamento**, no dia fictício D em UTC. Domínios `.example` representam nomes fictícios: não são domínios nos quais este exercício tenha emitido certificados públicos. Não fornecer credenciais, chaves privadas ou payloads de clientes.

## 1. Competências avaliadas

Localizar a falha por trecho; separar transporte, autenticação e autorização; identificar o principal efetivo e o contexto de uma decisão; corrigir com menor privilégio. Na [rubrica](../rubrica.md), observar profundidade, segurança e comunicação da incerteza.

## 2. Estado real e premissas do cenário

**Arquitetura comum:** navegador → HTTPS/ALB → HTTP/Fargate → HTTPS/S3 via gateway endpoint, mesma conta e Região. O trecho interno HTTP é uma limitação explícita do desenho, não evidência de cifragem ponta a ponta. Não há CloudFront ou mTLS no caminho. WAF está ativo, sem bloqueio correlacionado nos recortes fornecidos.

**A — Certificado apresentado incorreto.** O alias novo aponta ao ALB correto. O certificado default do listener só contém SAN `portal.loja.example`; a lista não contém certificado para `comprovantes.loja.example`. Um certificado que cobre o novo nome foi emitido no inventário fictício do ACM, mas não associado ao listener. O cliente envia SNI correto, confia na cadeia e usa relógio correto; falha ao conferir o nome. Não é falha IAM nem de autorização de negócio.

**B — Negação no S3.** TLS e autenticação do usuário no portal funcionam. O backend assina `GetObject` com a **task role**, não com a execution role. O objeto existe, pertence ao bucket e usa SSE-S3, sem dependência de KMS neste exercício. Bucket Owner Enforced está ativo; ACLs desabilitadas. Não há acesso cross-account, access point ou Requester Pays. Inventário autorizado confirma ausência de permissions boundary e de política de sessão restritiva; SCP/RCP aplicáveis não bloqueiam a ação.

A identidade permite `s3:GetObject` no prefixo `recibos/*`; a política do gateway endpoint também permite esse acesso. A bucket policy tem um `Deny` explícito quando `aws:SourceVpce` difere de `vpce-antigo`. Uma mudança de caminho passou a usar `vpce-novo` e o `Deny` passou a corresponder. A regra de restringir o caminho deve ser preservada; corrigir seu valor é diferente de removê-la.

Essas premissas delimitam a avaliação de políticas neste caso. Não ensinar uma fórmula universal de “todas as políticas precisam ter Allow”: tipo de principal, concessões por recurso, conta e controles superiores mudam a análise.

Hipóteses alternativas em A: cadeia não confiável, validade/relógio, seleção por SNI ou incompatibilidade de protocolo. A1/A2 distinguem o nome incorreto. Em B: autorização do usuário, bloqueio na borda, identidade técnica inesperada ou política/restrição do armazenamento. B1 localiza a origem e B2/B3 explicam a decisão; não concluir só pelo código 403.

## 3. Linha do tempo

| Variante | Antes | Mudança | Falha |
|---|---|---|---|
| A | 15:00, nome antigo funciona | 15:05, novo alias publicado sem associação do certificado ao listener | 15:07, cliente rejeita o nome apresentado |
| B | 16:00, consulta via endpoint antigo funciona | 16:04, rota S3 passa ao endpoint novo aprovado | 16:06, backend recebe AccessDenied ao buscar objeto |

Não combine a falha de certificado de A com o contexto de políticas de B.

## 4. Evidências sintéticas progressivas

### A — Conexão segura

**A1 — Etapa do erro.** DNS aponta ao ALB esperado e TCP 443 conclui. Cliente relata `certificate hostname mismatch` ao acessar `comprovantes.loja.example`, usando esse nome em SNI. Não envia requisição HTTP depois de rejeitar a identidade. O nome antigo funciona. Não há registro de requisição correspondente no backend; essa ausência, sozinha, não provaria a causa.

**A2 — Apresentação e configuração.** Recorte sanitizado do diagnóstico do cliente: SAN apresentado contém somente `portal.loja.example`; cadeia confiável e validade vigente no cenário. Inventário: listener 443 tem esse certificado como default; nenhum certificado da lista cobre o novo nome. No ACM fictício há outro certificado com SAN `comprovantes.loja.example`, status emitido, na mesma Região, ainda sem associação ao ALB.

**A3 — Recuperação condicional.** Se propuser associar o certificado correto ao listener, preservar o nome antigo e validar seleção por SNI: cliente com validação normal conclui TLS para ambos os nomes; consulta de comprovante autorizado funciona. Testes também cobrem cadeia, validade e cliente representativo. Não há necessidade de copiar chave privada para a task. Isso não cifra o trecho HTTP ALB–API.

### B — Negação de acesso

**B1 — Correlação da resposta.** Portal autentica o usuário e autoriza a consulta do seu comprovante no domínio de negócio. Backend retorna 403 com mensagem pouco específica após receber do S3 `403 AccessDenied`, `request_id=s3-sintetico-17`. Registro sanitizado da chamada: `operation=GetObject`, bucket `treino-comprovantes-ficticio`, chave `recibos/pedido-ficticio.pdf`. TLS com S3 foi validado. O ID é correlação, não credencial.

**B2 — Identidade efetiva e contexto.** Evento de dados S3 de CloudTrail, cuja coleta **já está habilitada no cenário**, correlaciona o ID: sessão da `role-comprovantes`, ação `s3:GetObject`, objeto no prefixo `recibos/`, `vpcEndpointId=vpce-novo`, erro AccessDenied. A aplicação usa credenciais temporárias da task role. A execution role serve ao agente ECS; não é a identidade que assinou essa chamada. Não fornecer valores de credenciais. Eventos de objetos S3 não devem ser presumidos disponíveis no histórico padrão sem a configuração de coleta. [S3 — eventos CloudTrail](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cloudtrail-logging-s3-info.html), consulta em 01/11/2026.

**B3 — Conjunto de políticas e restrições.** Inventário sanitizado, completo para este caso:

| Camada | Resultado aplicável à requisição |
|---|---|
| Task role | Allow `s3:GetObject` em `arn:aws:s3:::treino-comprovantes-ficticio/recibos/*` |
| Gateway endpoint novo | Permite a role e esse recurso/ação; não concede por si só permissão IAM |
| Bucket policy | Deny `s3:GetObject` nesse prefixo, `Principal=*`, condição `StringNotEquals aws:SourceVpce = vpce-antigo` |
| Boundary/sessão | Sem restrições adicionais, conforme premissa |
| SCP/RCP | Sem bloqueio aplicável, conforme inventário autorizado |
| ACL/KMS | ACLs desabilitadas; SSE-S3, sem chamada KMS |

Na tentativa, a condição é verdadeira: `vpce-novo` é diferente de `vpce-antigo`. O `Deny` do bucket prevalece sobre o Allow da role. O evento sozinho não substitui inspeção de políticas e contexto. [S3 — restrição por endpoint](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies-vpc-endpoint.html), consulta em 01/11/2026.

**B4 — Recuperação condicional.** Após revisão por dados/segurança e atualização da condição para o endpoint aprovado: a mesma role, por `vpce-novo`, lê somente um objeto canário no prefixo autorizado. Outra role sem permissão continua negada; caminho fora do endpoint aprovado continua negado; usuário do portal não pode consultar comprovante de outro usuário. São testes sintéticos com identidades de teste, sem credenciais reais. Retorno de sucesso não autoriza tornar o bucket público.

## 5. Solicitação → evidência → conclusão e limite

| Solicitação da candidata | Evidência fornecida | O que permite concluir | O que não permite concluir |
|---|---|---|---|
| Qual componente falha? TCP/TLS concluem? Há HTTP? | A1 ou B1 | A falha antes de HTTP; B recebe resposta S3 | Todo 403 vem de WAF ou da autorização do usuário |
| Qual nome/cadeia foi validado e qual certificado o listener apresenta? | A2 | Certificado apresentado não cobre o nome solicitado | Certificado emitido no ACM já está em uso |
| Quem assinou a chamada e qual action/resource/contexto? | B2 | Principal técnico e endpoint efetivos | Role usada no deploy é a role usada pelo código |
| Quais políticas e restrições correspondem à requisição? | B3 | O Deny por SourceVpce se aplica | Fórmula geral para qualquer principal ou acesso entre contas |
| Como ficou o acesso permitido e o que segue negado? | A3 ou B4, condicional | Recuperação no escopo testado | Transporte seguro substitui autorização de negócio |

## 6. Raciocínio esperado e alternativas válidas

Na A, seguir cliente → listener e comparar nome de referência com SAN apresentado, configuração de SNI, cadeia, validade e protocolo. Associar certificado correto é suficiente para a causa; reemitir sem associar não é. Reverter temporariamente a publicação do novo endereço pode ser contenção válida se acordada com o negócio e se não quebrar clientes já integrados.

Na B, rastrear a origem do 403 antes de editar controles. Relacionar assinatura real, ação, ARN do objeto e condição de endpoint; avaliar o Deny no contexto fornecido. Corrigir a condição após aprovar o novo caminho, ou restaurar o caminho antigo ainda homologado, são alternativas possíveis com validação e análise de impacto. Não exigir uso de CLI ou do simulador IAM. Simulação auxilia, mas precisa representar contexto e limitações do serviço.

## 7. Perguntas de aprofundamento

- “Quem gerencia o certificado, quem o apresenta e quem o valida?”
- “Onde termina TLS e qual trecho continua sem cifragem neste desenho?”
- “Como distinguir falha de certificado de incompatibilidade de protocolo ou cifra?”
- “Qual principal foi autenticado pelo S3? Isso é a identidade do usuário do portal?”
- “Qual valor torna essa condição verdadeira? O que um Allow adicional mudaria?”
- “Que evidência pediria se o erro fosse genérico ou o evento de dados não estivesse habilitado?”

## 8. Respostas incompletas e como aprofundá-las

| Resposta | Pergunta para aprofundar |
|---|---|
| “O ACM resolve o TLS.” | Onde o certificado está associado e qual nome o cliente compara? |
| “Troco o certificado para resolver o 403.” | O TLS concluiu? Quem produziu a resposta correlacionada? |
| “A execution role já tem acesso.” | Qual identidade assinou GetObject e como você verificou isso sem expor segredo? |
| “Adiciono Allow na role.” | O Deny que corresponde ao contexto continua existindo? |
| “Abro o SG ou desativo WAF.” | Qual evidência vincula esses controles à negação do S3? |
| “Dou AdministratorAccess ou ignoro TLS.” | Como corrigir a causa com escopo restrito e preservar os controles? |

## 9. Mitigações, riscos e validação

A: equipe responsável pelo listener e certificados revisa associação, nomes existentes e seleção; canário com validação normal. Interromper se o nome antigo regredir, houver cadeia inválida ou seleção inesperada. Guardar a configuração anterior para recuperação, sem exportar chaves.

B: dados/segurança validam o novo endpoint e a política; aplicação valida o objeto permitido e tentativas negadas. Interromper se a condição abrir caminho indevido ou a identidade alcançar outro prefixo. Uma reversão de política deve considerar outros consumidores do bucket; não remover todo o controle de origem. Não alterar SCP/RCP sem evidência e autoridade.

Prevenção: teste de nomes na implantação do listener, inventário de associações e teste de autorização pelo principal e caminho reais. Melhorar a mensagem do portal para separar falha técnica de autorização do usuário. Planejar proteção do trecho interno HTTP conforme requisitos, como decisão distinta da causa atual.

## 10. Exemplo de resposta inicial organizada

“Vou localizar quem está recusando o acesso: precisamos separar conexão, validação TLS e resposta de autorização. Se não há HTTP, compararei o nome com o certificado apresentado pelo listener. Se há uma negação do serviço, correlacionarei requisição, identidade efetiva, ação, recurso e condições antes de mudar uma política. A correção deve preservar o isolamento e ser validada com acessos permitidos e negados.”

## 11. Explicação técnica aprofundada

ACM gerencia certificados; neste desenho o ALB os apresenta e o cliente verifica a identidade do serviço. SNI informa o nome solicitado na negociação para permitir a seleção apropriada. Certificado emitido e válido, mas não associado ao listener correto, não atende esse cliente. [ACM](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html), [certificados do ALB](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/https-listener-certificates.html) e [RFC 9525 — identidade em TLS](https://www.rfc-editor.org/rfc/rfc9525.html), consulta em 01/11/2026.

TLS termina no ALB para a conexão do navegador; a conexão ALB–API é outro trecho. O HTTPS da API para o S3 é uma terceira conexão. Rede privada não demonstra cifragem. Avaliar HTTPS também no trecho interno requer decidir como estabelecer proteção e validação apropriadas; não inferir garantias desse trecho pelo certificado da borda.

Autenticar estabelece a identidade; autorizar decide a ação sobre um recurso no contexto. O código recebe permissões pela [task role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html), enquanto a execution role atende funções do agente. Permissão técnica do backend não dispensa autorização do usuário sobre o comprovante. Consulta em 01/11/2026.

Na B, o Allow da role cobre o ARN do **objeto**, não só o bucket. O Deny por condição do recurso também corresponde e impede o acesso. Nem SG nem certificado removem essa decisão. Outros cenários exigiriam examinar boundary, sessão, organizações, KMS e concessões por recurso conforme o principal; as premissas aqui evitam generalizar incorretamente. [Lógica IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) e [diagnóstico de 403 no S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/troubleshoot-403-errors.html), consulta em 01/11/2026.

## 12. Exemplo de comunicação para negócio

A: “O novo endereço está apresentando um certificado que não cobre seu nome. Vamos associar o certificado correspondente ao listener e testar também o endereço antigo. Manteremos a validação de segurança dos clientes. Atualizaremos em dez minutos; o trecho interno da aplicação será avaliado separadamente.”

B: “A consulta chega ao armazenamento, mas a política ainda reconhece o caminho anterior. A equipe de segurança está revisando a atualização para o endpoint aprovado. Preservaremos a restrição de acesso e verificaremos que somente usuários e serviços autorizados consultam os comprovantes.”

## 13. Debrief e links de revisão

Peça que a candidata desenhe as três conexões e marque as identidades em cada uma. Na próxima sessão troque A por B. Revise [F03 — identidade e proteção](../../../../technical-knowledge/01-fundamentals/03-security-identity.md), [F01 — camadas](../../../../technical-knowledge/01-fundamentals/01-networking-dns-connectivity.md) e [F04 — papéis do runtime](../../../../technical-knowledge/01-fundamentals/04-compute-containers.md).

## 14. Fontes técnicas

Consultadas em **01/11/2026**: [ACM](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html), [ALB e certificados](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/https-listener-certificates.html), [RFC 9525](https://www.rfc-editor.org/rfc/rfc9525.html), [ECS task role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html), [avaliação IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) e [S3 AccessDenied](https://docs.aws.amazon.com/AmazonS3/latest/userguide/troubleshoot-403-errors.html). Suportam os mecanismos, não políticas de uma conta real. [Catálogo](../../../../references/troubleshooting-fontes.md).
