# Rodada 1 — Material de condução

Use este roteiro com a página do candidato e libere informações conforme as perguntas. Todos os registros abaixo foram criados para o exercício; não são saídas de ferramentas executadas contra uma rede real.

## Objetivos de observação

Observe se a pessoa distingue alcance ICMP, conexão TCP e resposta HTTP; se verifica origem, destino, porta e vínculo do processo; e se evita mudar permissões sem necessidade. A conclusão deve explicar a evidência e preservar o acesso restrito da aplicação.

## Estado reservado ao instrutor

Na rodada principal, o processo escuta somente em `127.0.0.1:8080`. Está vivo e atende no próprio host, mas não no endereço privado utilizado pelo cliente. As rotas privadas de ida e volta e os controles necessários à conversa descrita estão presentes. Isso não faz da política de bind uma conclusão possível antes de liberar as evidências.

Não diga “é o bind” ao ouvir uma pergunta vaga. Peça que a pessoa formule o que deseja descobrir. Uma pergunta sobre “em qual interface esse processo recebe” ou “quais sockets estão ouvindo” merece o mesmo cartão.

## Cartões da rodada principal

| Solicitação ou equivalente | Informação liberada — sintética | Conclusão possível | Ainda incerto |
|---|---|---|---|
| Qual operação, origem e destino falham? | Clientes desse grupo em `172.20.8.0/24`; URL `http://loja.test:8080/catalogo`; nome fornece `10.20.2.10`. | Há uma conversa concreta para investigar. | O estágio em que ela falha. |
| Qual é o erro da conexão, além do ping? | Tentativa TCP ao endereço privado recebe recusa imediata; não há status HTTP. | O teste não chegou a uma resposta HTTP; timeout e recusa não são o mesmo sinal. | Listener, intermediário e política efetiva ainda precisam ser diferenciados. |
| O que o inventário “processo em execução” comprova? Quais sockets existem? | Processo vivo; único socket de escuta da aplicação é `127.0.0.1:8080`. | A escuta não abrange a interface privada deste cenário. | Se a aplicação responde corretamente quando recebe a requisição. |
| A aplicação responde no endereço em que escuta? | No próprio host, requisição a `127.0.0.1:8080/catalogo` retorna HTTP 200 e o catálogo esperado. | O recorte local atende; a diferença de interface explica a falha remota. | O acesso remoto depois da correção e outras jornadas. |
| Há mudança de caminho ou permissão necessária? | Ida e volta aprovadas; regras efetivas permitem a conversa cliente → app:8080 e retorno. Nenhum NAT neste recorte. | Não há evidência para ampliar regras. | A nova configuração de escuta ainda precisa de validação. |
| Como foi validada a contenção proposta? | Após revisão da configuração e bind na interface privada correta, a origem afetada obtém HTTP 200 e catálogo esperado; origem não autorizada continua sem acesso. | A intervenção resolve o recorte sem remover a restrição. | Não demonstra saúde de todas as dependências ou de um pagamento. |

## Intervenção e comunicação esperadas

Uma resposta suficiente propõe corrigir a configuração de escuta para a interface privada prevista, revisar quem consegue alcançá-la e executar uma mudança controlada. `0.0.0.0` não é resposta automática: pode ser apropriado a um ambiente, mas exige conhecer todas as interfaces e os controles. Tornar a instância pública não é necessário neste cenário.

Para o negócio: “O catálogo estava indisponível para esse grupo. Identificamos que o serviço não recebia pela interface usada pelos clientes. A alteração foi limitada ao serviço; o catálogo voltou a responder no caminho afetado.” Para a operação: registrar socket anterior/novo, origem, porta, teste positivo e teste de acesso não autorizado, além do procedimento de reversão.

## Variante reservada — R01-B

Use **a mesma abertura do candidato**, sem anunciar a causa. Nesta variante, use somente a abertura e o cartão inicial de escopo da rodada principal; depois use exclusivamente os cartões, a intervenção e a validação desta variante. Não libere os demais cartões principais, sobretudo a validação após mudança de bind, pois descrevem outro estado. O processo já escuta em `10.20.2.10:8080`; a conexão TCP funciona. O cliente recebe HTTP **503 emitido pela aplicação**, e a resposta local reproduz o 503. A causa agora é a espera pelo pool de conexões da aplicação ao banco, ocupado por operações demoradas. A capacidade “8 conexões” e as observações seguintes são números inventados para este cartão, não valores institucionais ou recomendados.

| Solicitação ou equivalente | Informação liberada — sintética | Conclusão possível | Ainda incerto |
|---|---|---|---|
| Houve recusa, timeout de conexão ou resposta do serviço? | TCP conecta; aplicação responde 503 após uma espera. | O listener privado recebeu; o caso não é o da rodada principal. | O motivo da indisponibilidade da aplicação. |
| Quem gerou o 503 e o que ocorria no mesmo intervalo? | Identificador da requisição aparece no log da aplicação: espera por conexão do pool excedeu o orçamento. | A falha está no atendimento da aplicação/dependência, não demonstrada como falha de rota. | Por que as conexões estão ocupadas e qual é o limite seguro. |
| Como está o pool e o banco? | As 8 conexões do pool estão ocupadas; consultas longas aparecem no banco. Conectividade TCP com o banco existe. | É necessário correlacionar trabalho, espera e capacidade. | Se há consulta ruim, aumento legítimo de carga ou outra contenção. |
| Qual contenção de menor risco? | A equipe pode limitar a entrada de trabalho e investigar a operação lenta; não há capacidade aprovada para aumentar o pool. | Evitar ampliação cega que pode sobrecarregar o banco. | A solução permanente depende de análise com os responsáveis. |
| Como foi validada essa contenção? | Em uma amostra controlada após limitar a entrada e concluir o trabalho pendente, há conexões disponíveis no pool, a leitura do catálogo retorna 200 e a espera fica no orçamento acordado para o teste. | O atendimento se recuperou na amostra sem alterar o bind ou ampliar o pool. | Ainda falta demonstrar capacidade para a carga completa e corrigir a causa das operações demoradas. |

Aceite uma investigação que chegue à dependência sem exigir a palavra “pool” de início. Rejeite transplantar o ajuste de bind: ele não muda uma resposta 503 deste cenário. O candidato deve reconhecer a nova evidência e trocar de hipótese. A comunicação desta variante deve tratar da espera por recursos e da contenção validada na amostra; não reutilize a atualização de negócio sobre interface da rodada principal.

## Critérios e debrief

Registre exemplos concretos de: delimitação da conversa; distinção entre recusa e HTTP; teste que separa interface de aplicação; intervenção restrita; validação positiva e negativa; explicitação de incerteza. Uma conclusão parcial (“o ping não prova a aplicação”) é boa, mas deve ser seguida por uma pergunta que localize a falha.

Pergunte: “Se a porta fosse outra, o que mudaria?”, “Se recebesse 503, qual hipótese deixaria de servir?” e “O teste local representa qual origem?”. A qualidade está no mecanismo e na revisão da hipótese, não em decorar um comando.

[Revisar L2](../../laboratorio/l2-processo-porta.md) · [Revisar L3](../../laboratorio/l3-conectou-demorou.md) · [Voltar aos simulados](../README.md)
