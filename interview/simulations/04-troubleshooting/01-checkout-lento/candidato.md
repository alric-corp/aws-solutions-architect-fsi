# Simulado 1 — Checkout lento

## Objetivo do exercício

Conduzir uma investigação oral, solicitar informações e defender uma decisão diante de um problema que afeta compras. Não é necessário executar comandos ou acessar AWS.

## Contexto e impacto inicial

“Clientes relatam dificuldade para concluir compras. A página inicial abre normalmente, mas o checkout ficou lento.”

Uma loja fictícia recebe a reclamação durante o horário de vendas. O suporte ainda não sabe quantos clientes estão afetados nem se todas as tentativas terminam em compra.

## Arquitetura mínima

```text
Navegador ── CloudFront/S3 (página inicial)
     └── HTTPS → ALB → API em ECS/Fargate
                           ├── RDS PostgreSQL
                           └── API externa de cotação de frete
```

## Informações inicialmente disponíveis

A API atende consulta do carrinho, cotação e conclusão da compra. Há telemetria de aplicação e infraestrutura; você pode pedir ao instrutor os recortes necessários. A existência de telemetria não garante cobertura completa.

## Restrições

O atendimento deve preservar a integridade de pedidos e pagamentos. Mudanças dependem do responsável pela aplicação e de procedimento de mudança. Não há autorização para gerar carga, ampliar acessos ou alterar o contrato comercial sem alinhamento. Todos os dados recebidos serão sintéticos para treinamento.

## Entrega ao final

Explique o impacto delimitado, o que as evidências sustentam, o que continua incerto, sua decisão e seus riscos. Descreva como avaliaria o resultado e faça uma atualização curta para o cliente com próximos passos.
