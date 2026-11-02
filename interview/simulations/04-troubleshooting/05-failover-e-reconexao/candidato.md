# Simulado 5 — Failover e reconexão

## Objetivo do exercício

Investigar por que a recuperação informada pela infraestrutura ainda não corresponde ao comportamento da aplicação. Exercício oral sem mudança real em AWS.

## Contexto e impacto inicial

“O banco concluiu um failover, mas parte da aplicação continua apresentando erros.”

O portal fictício de pedidos voltou a atender algumas requisições. O suporte ainda recebe reclamações de consulta e atualização.

## Arquitetura mínima

```text
Cliente → ALB → API Java em ECS/Fargate, em duas AZs
                     └── pool JDBC → endpoint de RDS PostgreSQL
```

## Informações inicialmente disponíveis

A equipe recebeu um evento de conclusão de failover do RDS. Há inventário da implantação, eventos do banco, métricas da aplicação e registros de erro. Você pode pedir informações ao instrutor para delimitar o incidente.

## Restrições

Não provocar novo failover para testar. Não repetir mutações indiscriminadamente, alterar dados ou abrir acessos. Qualquer troca de configuração ou reciclagem de tasks exige avaliação de impacto e o responsável pela aplicação. Não há acesso ao sistema operacional do RDS. Todos os dados recebidos serão sintéticos para treinamento.

## Entrega ao final

Explique o escopo da falha, a conclusão sustentada pelas evidências e a intervenção proposta. Defina seus limites, critérios de interrupção e validação funcional. Faça uma atualização ao cliente incluindo o tratamento de operações cujo resultado ainda não foi verificado.
