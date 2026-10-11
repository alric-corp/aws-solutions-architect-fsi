# 02 — HTTP, REST, OpenAPI e borda

**Base:** N05 traz APIs e REST; N01 traz URL, web e CloudFront. **Revisão explícita:** a formulação “REST se baseia inteiramente em HTTP” e a interpretação de stateless como ausência de dados armazenados foram refinadas. Veja [o registro editorial](../../references/study-notes-revisions.md).

## Fundamentos que não podem se misturar

Uma API define uma interface e um contrato de interação. Pode ter implementação em software, mas não é necessariamente sinônimo de um servidor web. REST é um estilo arquitetural com restrições como cliente-servidor, stateless, cache, interface uniforme e camadas; HTTP é uma realização comum no contexto web. Retornar JSON e utilizar verbos não prova, sozinho, aderência a todas as restrições. [Fonte T01](../../references/README.md#t01)

**Stateless:** a solicitação precisa trazer o contexto necessário para ser interpretada sem depender de uma sessão de conversação guardada pelo servidor entre requisições. Isso não proíbe bancos, recursos persistentes ou estado de negócio. Não confunda uma conta persistida com uma sessão HTTP implícita.

## Semântica e contrato

HTTP distingue métodos seguros de idempotentes. GET deve ter semântica de leitura; idempotência refere-se ao efeito pretendido da repetição, não à resposta ser idêntica em todos os bytes. Um POST financeiro pode receber um contrato de idempotência da aplicação, mas não se torna repetível com segurança por conter JSON. [Fonte T02](../../references/README.md#t02)

OpenAPI descreve um contrato HTTP: caminhos, parâmetros, respostas, schemas e segurança declarada. O documento não implementa autorização nem garante o comportamento do servidor. Usamos 3.1.1 como versão de referência, sem dizer que é a mais recente. [Fonte T03](../../references/README.md#t03)

<a id="sincrona"></a>
## REST, RPC e gRPC

Na comunicação síncrona, quem chama espera a resposta. Isso simplifica o raciocínio, mas cria acoplamento temporal: se o serviço chamado está lento ou fora, quem chama também fica.

| Estilo | Ideia | Quando costuma servir |
|---|---|---|
| REST | Recursos e métodos HTTP com semântica padrão | APIs públicas e de parceiros, cache HTTP, ampla compatibilidade |
| RPC | Chamar uma operação remota como uma função (`reservarLimite(...)`) | Comunicação interna orientada a ações |
| gRPC | RPC sobre HTTP/2, com contrato em Protocol Buffers, payload binário e streaming | Chamadas internas de alto volume e baixa latência, contrato forte entre linguagens |

O gRPC exige HTTP/2 entre as pontas e não funciona direto no navegador sem um proxy (gRPC-Web). Na AWS, o ALB roteia gRPC; o API Gateway não oferece gRPC nativo.

**Cuidado:** defina timeout em toda chamada e um prazo total para a cadeia. Uma cadeia síncrona longa soma latências e multiplica pontos de falha; se a resposta não precisa ser imediata, avalie comunicação assíncrona ([F07](07-events-messaging-distributed-systems.md#assincrona)).

## Exercício de design

Projete criação e consulta de uma intenção de pagamento. Defina identidade da operação, moeda, representação do valor, resposta em andamento, resposta concluída, conflito por chave reutilizada com dados diferentes e falhas técnicas.

Não devolva apenas “erro 500” quando o resultado financeiro é desconhecido. O status HTTP descreve o contrato de comunicação; a máquina de estados descreve o negócio. Use o [Case 01](../../cases/01-payment-processing-pix.md).

## Cache e CDN

A chave de cache determina quais solicitações podem reutilizar uma resposta. Headers, cookies e parâmetros precisam de política consistente com a variação do conteúdo. [Fonte T28](../../references/README.md#t28)

Pergunte: o conteúdo é público ou individual? Uma mudança de usuário pode recuperar a resposta de outro? Como uma alteração de permissão afeta conteúdo armazenado? Qual é o comportamento de expiração? Colocar uma CDN não torna segura a reutilização de respostas financeiras.

## Perguntas de aprofundamento

“Token válido é suficiente para consultar qualquer conta?” “O que acontece se o cliente repetir um POST depois de timeout?” “Quando usar paginação?” “Como evoluir um campo sem quebrar consumidores?” “Uma especificação OpenAPI correta prova que o backend respeita o contrato?”

## Evidência de domínio

Explique uma API sem começar pela ferramenta. Escreva um pequeno contrato, inclua um caso negativo e mostre uma mudança compatível e outra incompatível. Depois avalie como cache e autorização alteram sua decisão.
