# Rodada 6 — Compra após a troca de caminho

## Cenário

Um incidente tornou o endpoint principal da Loja Horizonte indisponível. A equipe informa que o endpoint de contingência está disponível e responde a uma verificação de saúde, mas uma integração continua relatando falha ao registrar compras. O negócio pede uma previsão e a confirmação de que pedidos não foram perdidos nem duplicados.

## Arquitetura conhecida

O cliente fictício `172.20.8.10` acessa `https://loja.test:8443`. Há dois endpoints de aplicação, `10.20.2.10` e `10.20.2.11`, e um caminho privado aprovado da rede local até ambos. Os endpoints pertencem à mesma subnet neste recorte; não se deve inferir redundância de AZ ou de provedor. Uma seleção de endereço por nome direciona novas consultas. Não há balanceador entre cliente e aplicações neste desenho. A integração pode reutilizar conexões.

## Restrições

Os registros e endereços são sintéticos; solicite informações ao instrutor. Não execute tráfego real nem repita gravações de resultado desconhecido sem verificar identidade e estado. Não prometa recuperação instantânea a partir de um status de saúde ou de uma alteração de nome. Qualquer contenção precisa de orçamento, responsável e critério de validação.

## Objetivo

Explique quais evidências distinguem disponibilidade do endpoint e recuperação da jornada. Proponha uma contenção segura para a integração afetada e uma validação de conectividade e de estado de negócio. Comunique fatos, hipóteses, próxima verificação e limites da previsão.
