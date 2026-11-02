# Simulado 2 — Pedido durante falha do banco

## Objetivo do exercício

Investigar o estado de uma compra com retorno incerto e defender como o atendimento deve prosseguir. O exercício é oral, sem acesso a serviços reais.

## Contexto e impacto inicial

“O cliente enviou uma compra, a API retornou timeout e ele tentou novamente. Como saber se o pedido foi perdido, concluído ou duplicado?”

A loja fictícia precisa orientar o cliente e proteger a integridade comercial da compra. Ainda não foi verificado o resultado das duas tentativas.

## Arquitetura mínima

```text
Navegador → ALB → API em ECS/Fargate → RDS PostgreSQL
                         └── provedor externo de pagamentos, via HTTPS
```

## Informações inicialmente disponíveis

A aplicação recebe solicitações de criação de pedido e permite consultar seu estado. Existem registros da aplicação e do banco acessíveis ao instrutor. A configuração de disponibilidade, o contrato atual da API e os detalhes de implementação podem ser solicitados.

## Restrições

Não executar nova cobrança nem apagar registros para testar. Não presumir o resultado da operação apenas pela mensagem exibida ao cliente. Mudanças de contrato, pagamentos e correções de dados exigem os responsáveis correspondentes. Todos os dados serão sintéticos para treinamento.

## Entrega ao final

Apresente sua conclusão com o grau de certeza permitido pelas evidências, a orientação imediata para o atendimento, os riscos e uma proposta de evolução do fluxo. Explique como verificaria o resultado e comunique os próximos passos ao cliente.
