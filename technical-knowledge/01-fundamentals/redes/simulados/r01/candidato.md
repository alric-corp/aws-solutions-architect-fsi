# Rodada 1 — Acesso ao catálogo

## Cenário

Uma equipe da Loja Horizonte relata que não consegue abrir o catálogo. Um teste ICMP autorizado recebe resposta, mas a operação no navegador continua falhando. Você foi chamado para organizar a investigação sem interromper os demais serviços.

## Arquitetura conhecida

O cliente do exercício está em `172.20.8.10`, na rede local fictícia. O catálogo é acessado como `http://loja.test:8080/catalogo`, em uma aplicação de `10.20.2.10`, dentro da VPC A `10.20.0.0/16`. Há um caminho privado aprovado entre as redes; neste recorte não há NAT nem balanceador intermediário. O trecho da aplicação é HTTP sem TLS, por escolha didática explícita. Um inventário informa que o processo da aplicação está em execução.

## Restrições

Os endereços são dados de um exercício, não destinos autorizados para testes reais. Solicite evidências ao instrutor. Não abra todas as portas, não desative controles e não reinicie todos os serviços como primeiro passo. Uma mudança exige alvo, justificativa, risco e critério de retorno.

## Objetivo

Delimite o impacto, formule hipóteses e solicite evidências que as diferenciem. Proponha a menor intervenção justificável e diga como verificar o catálogo a partir da origem afetada. Ao final, apresente uma atualização curta para o negócio e outra para quem executaria a mudança.
