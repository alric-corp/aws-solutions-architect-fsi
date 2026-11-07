# Rodada 4 — Registro do pedido

## Cenário

A Loja Horizonte aceita acesso ao catálogo, mas uma etapa de registro do pedido espera até exceder o orçamento. O processo da aplicação e o processo do banco estão em execução. A equipe pede para analisar uma nova conexão da aplicação com o banco antes de reiniciar os serviços.

## Arquitetura conhecida

A aplicação está em `10.20.2.10`, subnet `10.20.2.0/24`; o banco privado está em `10.20.3.20`, subnet `10.20.3.0/24`, porta TCP 5432. Ambos pertencem à VPC A `10.20.0.0/16`. Há security groups nos recursos e NACLs nas subnets. Não há NAT, balanceador ou proxy entre aplicação e banco neste recorte.

## Restrições

Todos os dados são sintéticos; peça observações ao instrutor em vez de testar esses endereços. Não exponha o banco, não abra todas as portas e não desative SG ou NACL. Para qualquer regra proposta, explique origem, destino, direção e impacto. Um registro de fluxo não substitui a verificação da transação.

## Objetivo

Reconstrua a conversa nos dois sentidos, solicite evidências que separem hipóteses e proponha a intervenção de menor alcance. Defina como validar uma conexão nova e a etapa de negócio sem duplicar operações. Comunique os limites da conclusão.
