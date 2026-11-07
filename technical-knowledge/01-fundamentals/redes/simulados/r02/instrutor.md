# Rodada 2 — Material de condução

Conduza a rodada liberando somente as observações solicitadas. A arquitetura e as saídas dos cartões são fictícias; este roteiro não autoriza tráfego para os endereços indicados.

## Objetivos de observação

A pessoa deve localizar o estágio anterior à conexão, comparar o contexto dos clientes e preservar o nome da aplicação nos controles de HTTPS. Observe se separa um teste que contorna uma etapa de uma correção dessa etapa.

## Estado reservado ao instrutor

O grupo afetado usa um resolvedor com encaminhamento incorreto para o domínio privado deste exercício. Ele devolve `NXDOMAIN` para `loja.test`; o contexto correto tem o registro `10.20.2.10`. O serviço, o caminho e o certificado estão adequados para o teste controlado. A causa é configuração do contexto de resolução, não o desaparecimento da aplicação. `NXDOMAIN` sozinho não identifica qual configuração está errada.

## Cartões

| Solicitação ou equivalente | Informação liberada — sintética | Conclusão possível | Ainda incerto |
|---|---|---|---|
| Qual erro exato e em qual etapa? | No cliente afetado, o nome não produz endereço: resposta DNS `NXDOMAIN`; não há tentativa TCP ao serviço. | A investigação deve começar pela resolução desse nome nesse contexto. | Registro inexistente, contexto errado, encaminhamento e cache não foram diferenciados. |
| Ambos usam o mesmo nome e o mesmo resolvedor? | Mesma URL; grupo saudável consulta o resolvedor do contexto privado correto. O grupo afetado segue um encaminhamento diferente. | A comparação tem uma diferença relevante antes do tráfego da aplicação. | Se essa diferença explica o registro ausente. |
| O registro existe no contexto que deveria atender o grupo? | A zona privada do exercício contém `loja.test → 10.20.2.10`; a revisão mostra encaminhamento do grupo afetado para um contexto sem essa zona. | Há causa de configuração compatível com a diferença entre grupos. | Não prova que aplicação e TLS funcionam pelo caminho afetado. |
| O que significa “por endereço funcionou”? | A pessoa digitou um IP e ignorou o aviso do certificado; não registrou Host, SNI nem conteúdo. | Esse relato não é um controle válido de HTTPS da URL original. | É preciso repetir um controle que preserve a identidade esperada, sem ignorar validação. |
| Como isolar resolução preservando a conversa esperada? | Controle autorizado com URL `https://loja.test/catalogo`, endereço fixado somente no cliente do teste e CA adequada: conexão, validação TLS e HTTP 200, com catálogo esperado. | Para esse endereço, origem e momento, o serviço responde sem depender daquela resolução. | A resolução normal do grupo continua incorreta; outras origens não foram testadas. |
| O que mudou e como verificar? | Após corrigir o encaminhamento com o responsável, consulta nova no grupo afetado produz o endereço esperado. A URL normal, sem substituição de endereço, valida TLS e abre o catálogo. | A etapa que estava incorreta foi reparada e a jornada foi confirmada no recorte. | Caches e clientes ainda não amostrados podem precisar de observação. |

Aceite “quero comparar o resultado de nome de dentro de cada rede” sem exigir `dig` ou o nome de um produto. Se pedirem apenas para limpar cache, pergunte que diferença de contexto essa limpeza corrige. Ela não conserta um encaminhamento errado; pode apenas repetir o mesmo resultado.

## Controle e correção são coisas distintas

No laboratório local, `curl --resolve` preserva o nome da URL e o usa para Host e SNI, substituindo somente a resolução daquele comando. O exemplo executável seguro está em [L4](../../laboratorio/l4-nome-certificado.md), com `.test` mapeado para loopback, `curl -q` e CA temporária. Não forneça um comando executável apontando para os IPs desta história.

Trocar a URL pelo IP pode mudar a identidade TLS e o virtual host. Se o certificado não cobre o IP, uma falha de nome nesse teste não prova que o serviço original está quebrado. Desativar a verificação também não prova que o interlocutor é o esperado. As regras de identidade do serviço são tratadas na [RFC 9525](https://www.rfc-editor.org/rfc/rfc9525.html).

## Intervenção, validação e comunicação

Esperado: revisar com o proprietário o encaminhamento e a visibilidade da zona no contexto afetado; planejar a mudança e a reversão; testar resolução normal e HTTPS a partir de uma origem afetada; comparar com a origem saudável. Tratar caches conforme os registros e políticas existentes, sem prometer uma propagação instantânea ou prazo universal.

Para negócio: “A falha impede esse grupo de encontrar o endereço do catálogo. Um controle preservando a identidade do serviço respondeu; estamos corrigindo o caminho de resolução, com validação no grupo afetado.” Para a operação: informar nome, tipo de resposta, contexto, diferença de encaminhamento e teste normal depois da alteração. Não divulgar uma causa antes do cartão que a sustenta.

## Critérios e debrief

Procure: erro anterior a TCP; comparação entre clientes; manutenção de Host/SNI/confiança; limites do controle por endereço; correção da etapa certa; validação pelo nome original. Resposta parcial “é DNS” requer a pergunta seguinte: “Que observação separa registro ausente de contexto incorreto?”

Transferência: se o nome resolvesse corretamente e só a validação TLS falhasse, a investigação mudaria de estágio. Pergunte o que o controle por endereço permite concluir e o que ele não testou. Não premie um nome de ferramenta sem interpretação.

[Revisar nomes no curso](../../03-dns-nomes.md) · [Praticar L4](../../laboratorio/l4-nome-certificado.md) · [Voltar aos simulados](../README.md)
