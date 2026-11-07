# Rodada 2 — Catálogo no turno da manhã

## Cenário

Um grupo da Loja Horizonte não consegue abrir o catálogo no início do turno. Outro grupo consegue. Uma pessoa comenta que “por endereço funcionou”, mas não informa como fez o teste. A equipe quer um diagnóstico antes de alterar a aplicação.

## Arquitetura conhecida

O acesso esperado é `https://loja.test/catalogo`, na porta 443. O serviço está no endereço privado fictício `10.20.2.10`; os dois grupos usam caminhos privados aprovados até a VPC A. Os clientes podem ter contextos de resolução diferentes. O certificado do serviço deve corresponder ao nome utilizado pelos clientes. Neste recorte não há troca de versão da aplicação informada.

## Restrições

Solicite os resultados ao instrutor; os endereços não são alvos reais autorizados. Não mude o arquivo hosts, DNS do sistema ou validação de certificado para “fazer funcionar”. Um teste por endereço precisa declarar qual nome, Host e SNI preservou. Não transforme uma medida de diagnóstico em correção permanente sem justificativa.

## Objetivo

Explique quais informações faltam no relato e faça pedidos que discriminem hipóteses. Proponha um teste comparável entre os grupos, uma correção controlada e um critério de validação. Comunique o que já foi comprovado e o que ainda depende de outra equipe.
