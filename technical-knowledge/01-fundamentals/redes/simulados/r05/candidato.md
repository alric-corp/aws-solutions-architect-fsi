# Rodada 5 — Consulta entre equipes

## Cenário

Uma equipe da Loja Horizonte adicionou uma consulta a um serviço de outra área. A nova conversa não funciona, embora uma conversa antiga entre duas áreas continue disponível. Você deve organizar a análise e confirmar o requisito antes de propor mudanças.

## Arquitetura conhecida

Existem três VPCs com endereços distintos: A `10.20.0.0/16`, B `10.30.0.0/16` e C `10.40.0.0/16`. Há peering A–B e B–C. A conversa antiga é A com B; a nova tentativa é A com C, na porta TCP 443. Não há proxy de aplicação em B nem Transit Gateway implantado neste cenário. A matriz aprovada de comunicação pode ser solicitada ao responsável.

## Restrições

Peça as evidências ao instrutor; não execute tráfego para esses endereços. Não altere a conectividade entre áreas sem confirmar autorização e isolamento. “Conectado” em um inventário não substitui rota, controle ou teste. Não há uma exigência de adotar um produto específico.

## Objetivo

Explique como investigaria a nova conversa e a preservação da antiga. Solicite o requisito e as informações técnicas necessárias para decidir entre corrigir um incidente, preservar um isolamento ou propor uma evolução. Compare alternativas somente para uma necessidade aprovada e informe seus limites.
