# Rodada 6 — Material de condução

Este roteiro orienta a liberação de registros da rodada e a avaliação das decisões. As observações são sintéticas; não houve alteração de DNS, conexão externa ou execução em conta AWS para produzir os cartões.

## Objetivos de observação

Observe se a pessoa diferencia resposta de nome, conexão estabelecida, saúde de um endpoint e resultado de uma compra. A contenção deve considerar reconexão controlada e operações de resultado desconhecido, sem prometer que a infraestrutura de contingência transfere sessões automaticamente.

## Estado reservado ao instrutor

O cliente afetado mantém em seu pool uma conexão cujo peer é `10.20.2.10`, o endpoint antigo indisponível. Seu resolvedor **já devolve `10.20.2.11`** para consultas novas. O pool ainda tenta reutilizar a conexão antiga e não houve reconexão bem-sucedida. A conexão de controle nova com nome e identidade preservados funciona no endpoint de contingência; uma operação canário autorizada também funciona. A causa remanescente desta rodada é o uso da conexão antiga, não cache DNS incorreto nem falta de rota ao novo endpoint.

Os dois endpoints estão na mesma subnet por simplificação. Este exercício trata de falha do endpoint e comportamento do cliente; não prova resiliência a perda de AZ. Não atribua as verificações sintéticas a um health check público do Route 53 sobre um IP privado.

## Cartões

| Solicitação ou equivalente | Informação liberada — sintética | Conclusão possível | Ainda incerto |
|---|---|---|---|
| O que significa “contingência disponível”? | Processo no novo endpoint responde 200 em `/health`; isso não testa uma compra nem o cliente afetado. | Há um sinal de saúde limitado. | Caminho do cliente, sessão e operação de negócio. |
| O que o nome responde agora, no contexto afetado? | Autoritativo e consulta nova no resolvedor do cliente apontam `loja.test → 10.20.2.11`. | Essa consulta já conhece o endpoint novo. | Uma conexão existente pode usar outro peer; o TTL não diz qual socket a aplicação reutiliza. |
| Com quem a integração efetivamente tenta conversar? | Registro do pool mostra peer `10.20.2.10:8443`, associado à conexão criada antes da mudança; ocorre falha de leitura/reutilização. | Alterar o DNS novamente não muda esse socket. | Se uma conexão nova ao endpoint atual atende corretamente. |
| Um controle novo preserva a identidade e a jornada? | Na mesma origem, nova conexão usando o nome original, confiança adequada e endereço novo valida TLS. Leitura do catálogo funciona; operação canário autorizada com identidade própria é confirmada uma vez. | Endpoint novo e caminho dessa origem atendem a jornada controlada. | O destino de operações anteriores com resposta perdida não foi determinado. |
| Como o cliente trata falha e reconexão? | Não descartou a conexão antiga; não há reconexão controlada concluída. A equipe pode invalidar esse item do pool e criar conexão nova, dentro de limites acordados. | Há contenção localizada no cliente. | Volume de clientes, capacidade, orçamento de repetição e operações pendentes precisam de controle. |
| O que aconteceu aos pedidos com resposta perdida? | O roteiro não fornece estado final sem consulta pela identidade da operação. O responsável precisa reconciliar no sistema de registro. | Não é correto declarar “não gravou” nem reenviar às cegas. | O estado de cada operação permanece desconhecido até confirmação. |

## Intervenção e validação

Esperado: descartar ou renovar a conexão inválida pelo mecanismo suportado pelo cliente, com limite de novas tentativas, espera e capacidade acordados; evitar uma tempestade de reconexão. Validar o peer efetivo da nova conexão, TLS com o nome original e uma jornada controlada. Se o protocolo ou aplicação mantiver estado além da conexão, verificar como esse estado é retomado: nova conexão não migra automaticamente uma sessão de negócio.

O [modelo de DNS e cache](https://www.rfc-editor.org/rfc/rfc1034.html#section-4.3.4) ajuda a separar respostas novas de dados armazenados. Nesta rodada o dado novo já está correto; o cartão do socket discrimina a hipótese. O TTL de DNS não é uma ordem para transferir conexões existentes. Reduzir TTL depois da falha tampouco reescreve o estado que um cliente já tem.

Consultar operações por identidade e respeitar o mecanismo de idempotência acordado antes de repetir gravações. O aprofundamento está em [timeout e idempotência](../../../acid/07-timeout-idempotencia.md). Não duplicar aqui o projeto transacional nem inventar garantia de exatamente uma execução da infraestrutura.

## Critérios e debrief

Procure: diferenciar saúde e compra; pedir o peer real, não só a resposta DNS; considerar conexão nova; conter sem reiniciar toda a plataforma; reconhecer resultado desconhecido; validar com identidade de operação; comunicar uma previsão condicionada. Uma resposta parcial “esperar o TTL” precisa lidar com o fato discriminante de que o resolvedor já responde o endereço novo.

Negócio: “O endpoint de contingência atendeu a operação controlada. A integração afetada ainda usava uma conexão anterior; a renovação será limitada e acompanhada. Pedidos com resposta perdida serão conciliados antes de qualquer repetição. Ainda não temos evidência para afirmar o resultado de todos eles.” Operação: informar endpoint conhecido, peer observado, política de reconexão, capacidade, testes e fila de verificação de operações, sem expor conteúdo sensível.

Transferência: se o peer já fosse o novo endpoint, a hipótese de conexão antiga perderia força. Seria necessário investigar serviço, dependências e estado da operação, mesmo com `/health` positivo. Pergunte qual evidência muda a próxima ação e por que failback não deve acontecer automaticamente sem critérios.

[Praticar L5](../../laboratorio/l5-topologias-registros.md) · [Voltar aos simulados](../README.md)
