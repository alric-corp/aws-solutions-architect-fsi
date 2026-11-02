# Simulado 3 — Conectividade privada

O instrutor seleciona **somente uma** das aberturas abaixo. São situações independentes. Todos os dados fornecidos são sintéticos para treinamento.

## Objetivo do exercício

Investigar por que uma dependência deixou de ser acessível e propor uma intervenção segura. Não há execução real de ferramentas.

## Abertura A — API externa

**Contexto e impacto inicial:** “Uma aplicação em subnet privada deixou de acessar uma dependência. As tasks continuam em execução.” A dependência é uma API externa de cotação de frete; o checkout de parte dos clientes não conclui a cotação.

**Arquitetura mínima:** API em ECS/Fargate, em subnets privadas de duas AZs de uma VPC IPv4, chama `https://frete.parceiro.example`. O desenho aprovado prevê saída por NAT Gateway público por AZ e Internet Gateway. Não há proxy ou inspeção intermediária neste exercício.

**Informações inicialmente disponíveis:** o serviço tem tasks em execução nas duas AZs. A equipe mantém inventário de rede e registros de erros. Peça os recortes necessários ao instrutor.

## Abertura B — Banco interno

**Contexto e impacto inicial:** “Uma aplicação em subnet privada deixou de acessar uma dependência. As tasks continuam em execução.” A dependência é o banco privado usado para gravar pedidos; parte das requisições falha.

**Arquitetura mínima:** API em ECS/Fargate conecta ao RDS PostgreSQL privado, porta TCP 5432, em outra subnet da mesma VPC IPv4. Não há peering, Transit Gateway, proxy ou equipamento intermediário no caminho declarado.

**Informações inicialmente disponíveis:** o banco está marcado como disponível e há tasks em execução. Existem inventário de rede e registros de erros. Peça os recortes necessários ao instrutor.

## Restrições comuns

Não liberar todas as portas, publicar o banco ou retirar controles para testar. Mudanças de rede dependem da equipe responsável. Não se presume acesso ao host do Fargate nem ao sistema operacional do RDS. Uma coleta por dentro da task precisaria de mecanismo disponível e autorização específica; pode ser descrita sem execução.

## Entrega ao final

Explique o caminho investigado, a conclusão possível, as hipóteses restantes e a decisão proposta. Inclua risco, responsável pela mudança, evidência de recuperação e atualização para o cliente.
