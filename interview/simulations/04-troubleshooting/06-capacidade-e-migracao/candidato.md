# Simulado 6 — Capacidade e migração de banco

## Objetivo do exercício

Investigar uma degradação e defender uma decisão operacional, considerando alternativas de recuperação e de mudança. O cenário é inteiramente fictício e será conduzido oralmente.

## Contexto e impacto inicial

“Uma jornada continua consultando dados existentes, mas novas cargas e atualizações falham. Há sinais de pressão de memória. O caminho habitual de mudança da infraestrutura também apresenta problemas.”

Uma distribuidora fictícia consulta e atualiza disponibilidade de produtos. A equipe precisa manter o atendimento e decidir como retomar as atualizações com integridade.

## Arquitetura mínima

```text
Portal → ALB → API em ECS/Fargate → RDS PostgreSQL 16 privado
Agendador → workers de importação ──┘
Pipeline de infraestrutura → mudanças controladas no ambiente
```

## Informações inicialmente disponíveis

Há métricas do banco, logs da aplicação e resultados do pipeline. O volume de dados, os escritores e as restrições para uma mudança precisam ser esclarecidos com o instrutor. Não há migração em execução informada na abertura.

## Restrições

Não perder atualizações confirmadas nem criar dois destinos com escritas independentes sem controle. Mudanças com interrupção, custos ou alteração de destino exigem responsáveis de aplicação, dados, plataforma e negócio. Não existe autorização para contornar o processo de aprovação ou criar recursos reais. Não se presume acesso ao sistema operacional do RDS. Toda evidência será sintética para treinamento.

## Entrega ao final

Apresente diagnóstico e incertezas, compare as alternativas que considerar pertinentes e escolha um caminho com critérios de decisão. Descreva pré-condições, validação, interrupção e recuperação para a mudança proposta. Comunique impacto, riscos e próximos passos ao negócio.
