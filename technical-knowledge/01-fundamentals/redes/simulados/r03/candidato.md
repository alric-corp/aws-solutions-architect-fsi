# Rodada 3 — Consulta ao parceiro

## Cenário

A aplicação da Loja Horizonte deixou de consultar um parceiro fictício. O registro da tentativa mostra uma conexão TCP estabelecida, seguida de erro de canal seguro antes de receber uma resposta HTTP. Uma equipe afirma que “a rede já está boa” e pede para ignorar o erro.

## Arquitetura conhecida

A aplicação `10.20.2.10` acessa `https://api.externa.test/consulta`, na porta 443. Neste desenho, o nome aponta para `203.0.113.40`, endereço de documentação que não deve receber tráfego de laboratório. Há um componente de terminação TLS do parceiro antes de sua aplicação. A confiança e a identidade do parceiro precisam ser verificadas pelo cliente.

## Restrições

Peça ao instrutor os registros; não execute testes contra o endereço. Não desabilite a validação TLS, não copie certificados sem conhecer a cadeia e não proponha downgrade apenas para eliminar o erro. Qualquer mudança no parceiro exige coordenação com seu responsável.

## Objetivo

Localize o ponto de falha usando evidências que distingam as causas possíveis. Explique o que a conexão TCP comprova e o que falta para uma consulta válida. Proponha correção e validação do ponto de vista da aplicação consumidora, com uma atualização técnica e outra para o negócio.
