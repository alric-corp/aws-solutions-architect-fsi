# Rodada 3 — Material de condução

Use os cartões para responder às perguntas da investigação. As mensagens e verificações são dados sintéticos da rodada, não resultados obtidos de um parceiro real.

## Objetivos de observação

A pessoa deve separar transporte, confiança na cadeia, identidade do serviço e atendimento HTTP. Observe se pede o nome usado pelo cliente e os nomes presentes no certificado, sem interpretar um código genérico como diagnóstico completo.

## Estado reservado ao instrutor

O componente de terminação apresenta um certificado válido no tempo e com cadeia confiável para este cliente, mas o SAN contém somente `api-antiga.test`. A URL e o SNI são `api.externa.test`. A validação de identidade falha antes de enviar a requisição HTTP. Não há exigência de certificado do cliente neste recorte; não introduza mTLS como fato novo.

## Cartões

| Solicitação ou equivalente | Informação liberada — sintética | Conclusão possível | Ainda incerto |
|---|---|---|---|
| Qual etapa foi concluída? | O cliente resolve o destino e estabelece TCP na porta 443. Em seguida, aborta a validação TLS. | Existe comunicação TCP com um interlocutor nesse endereço. | Sua identidade, um canal TLS aceito e a operação HTTP ainda não foram demonstrados. |
| Qual URL, nome enviado e erro detalhado? | URL e SNI usam `api.externa.test`; mensagem indica que o nome do certificado não corresponde ao destino. Um cliente do cartão reporta código 60. | Há evidência de falha de identidade, além do código numérico. | É preciso comparar a identidade apresentada e verificar outras condições. |
| Quais nomes, cadeia e validade foram apresentados? | SAN: `DNS:api-antiga.test`; cadeia reconhecida pelo cliente; validade inclui o instante do teste; relógio correto. | O nome esperado não está coberto. Neste recorte não há evidência de CA desconhecida ou expiração. | Qual componente apresentou o certificado e qual configuração precisa mudar. |
| Quem termina TLS e qual certificado está associado ali? | O endpoint de terminação do parceiro está associado ao certificado antigo. | A troca precisa acontecer nesse endpoint; editar a aplicação consumidora não corrige essa associação. | O resultado depois da intervenção e outros endpoints. |
| Qual prova depois da correção? | Após associação do certificado com SAN `api.externa.test` e cadeia correta, o cliente original valida TLS e recebe a resposta esperada de uma consulta de leitura autorizada. | Canal e consulta foram comprovados nesse recorte. | Não prova outras rotas ou autorização de todas as operações do parceiro. |

“Quero ver a identidade que o servidor mostrou”, “o nome da URL cabe nesse certificado?” e perguntas equivalentes liberam o mesmo cartão. Não exija a sigla SAN antes de explicar que é a extensão com os nomes contemplados. Se a pessoa suspeitar de relógio ou CA, entregue os respectivos fatos: são hipóteses válidas, eliminadas pelas evidências.

## Conduzir sem atalhos inseguros

O código 60 do curl cobre problemas de validação que precisam ser diferenciados pela mensagem e pelo contexto. [L4](../../laboratorio/l4-nome-certificado.md) executa dois casos que podem compartilhar esse código: falta de confiança e nome errado. Não aceite “60 significa certificado expirado” nem “o TCP abriu, então está autenticado”.

A correção é coordenar com o proprietário a apresentação de um certificado e cadeia adequados para a identidade contratada, no componente que realmente termina TLS. Um recurso de gestão de certificados não negocia sozinho a sessão: o endpoint configurado o utiliza. Não apagar a validação, instalar uma CA indiscriminadamente ou trocar a URL por IP.

Uma consulta de leitura serve como controle inicial. Operações com efeitos exigem seus próprios critérios e autorização. O cliente autenticado pelo canal ainda pode receber uma negativa de autorização da aplicação; a verificação do certificado não concede permissão a todo recurso. Essas responsabilidades de identidade estão descritas na [RFC 9525](https://www.rfc-editor.org/rfc/rfc9525.html).

## Critérios e debrief

Evidências desejadas: delimitar o nome e estágio; distinguir código genérico de mensagem específica; comparar referência e SAN; localizar terminação; propor correção pelo responsável; testar consumidor original sem ignorar verificação; comunicar o que foi e não foi provado.

Uma resposta parcial (“é certificado”) precisa localizar a condição incorreta. Uma hipótese diferente pode receber crédito se a pessoa pede uma evidência capaz de refutá-la e a revisa ao receber o cartão. Para transferência, troque apenas a condição: SAN correto, mas CA não reconhecida. O ajuste do certificado antigo não deve ser repetido como receita automática; peça como mudaria a prova necessária.

Negócio: “A consulta foi bloqueada pela proteção de identidade do parceiro, antes de uma resposta da aplicação. A associação foi corrigida pelo responsável e a consulta de leitura voltou no cliente afetado.” Operação: informar URL/SNI, SAN anterior/novo, endpoint, cadeia validada e teste executado, evitando expor chaves ou conteúdo sensível.

[Praticar L4](../../laboratorio/l4-nome-certificado.md) · [Voltar ao curso](../../README.md) · [Voltar aos simulados](../README.md)
