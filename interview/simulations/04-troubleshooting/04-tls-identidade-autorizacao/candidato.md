# Simulado 4 — TLS, identidade e autorização

O instrutor seleciona **somente uma** abertura. As variantes são independentes; todos os dados são sintéticos para treinamento.

## Objetivo do exercício

Localizar a etapa em que o acesso falha, explicar o mecanismo e propor uma correção com escopo justificável. Não executar comandos reais.

## Arquitetura mínima comum

```text
Cliente → HTTPS → ALB → HTTP → API em ECS/Fargate
                                  └── HTTPS → S3, por gateway endpoint
```

O portal fictício permite consultar comprovantes fictícios. O bucket é privado e pertence à mesma conta da aplicação. O trecho ALB–API usa HTTP na rede privada nesta arquitetura; você pode discutir seus limites. ACM é utilizado pela equipe para gerenciar certificados do ALB.

## Abertura A — Conexão segura

**Contexto e impacto inicial:** depois da disponibilização de um endereço novo do portal, clientes relatam que a conexão segura falha antes de visualizar a página.

**Informações inicialmente disponíveis:** o nome acessado é `comprovantes.loja.example`; as tasks estão em execução. Há inventário da configuração do listener e resultados de diagnóstico disponíveis mediante solicitação.

## Abertura B — Acesso negado

**Contexto e impacto inicial:** o cliente abre o portal, mas a consulta de um comprovante retorna “acesso negado”. O suporte ainda não localizou qual componente produziu a negação.

**Informações inicialmente disponíveis:** o backend usa um AWS SDK para buscar o objeto. A equipe pode fornecer recortes sem segredos sobre a requisição, as identidades e a configuração pertinente.

## Restrições comuns

Preservar a validação TLS e o isolamento de dados. Não usar AdministratorAccess, desativar WAF, ampliar acesso público ou expor credenciais. Alterações de identidade, certificado e políticas exigem seus responsáveis. Não se presume acesso ao host do Fargate.

## Entrega ao final

Apresente a etapa da falha e seu grau de certeza, a decisão e suas condições. Explique riscos, validação de acesso permitido e negado, além da comunicação ao cliente durante a investigação.
