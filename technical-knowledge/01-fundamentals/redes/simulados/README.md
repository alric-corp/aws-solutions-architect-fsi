# Simulados — uma evidência de cada vez

[Voltar ao curso](../README.md) · [Preparar nos laboratórios](../laboratorio/README.md)

São seis situações autorais da Loja Horizonte fictícia. Uma pessoa conduz e outra investiga. O material do candidato contém apenas o cenário inicial; o material de condução contém cartões liberados conforme as perguntas. Todos os endereços, resultados de ferramentas, horários relativos e mensagens são **sintéticos**. Não execute comandos contra esses endereços nem trate um cartão como observação de AWS real.

## Escolha uma rodada

| Rodada | Material do candidato | Material de condução |
|---|---|---|
| 1 | [Acesso ao catálogo](r01/candidato.md) | [Instrutor — rodada 1](r01/instrutor.md) |
| 2 | [Catálogo no turno da manhã](r02/candidato.md) | [Instrutor — rodada 2](r02/instrutor.md) |
| 3 | [Consulta ao parceiro](r03/candidato.md) | [Instrutor — rodada 3](r03/instrutor.md) |
| 4 | [Registro do pedido](r04/candidato.md) | [Instrutor — rodada 4](r04/instrutor.md) |
| 5 | [Consulta entre equipes](r05/candidato.md) | [Instrutor — rodada 5](r05/instrutor.md) |
| 6 | [Compra após a troca de caminho](r06/candidato.md) | [Instrutor — rodada 6](r06/instrutor.md) |

Os títulos não revelam a causa. A rodada 1 inclui uma variante exclusiva do instrutor: a abertura é a mesma e a causa muda. Assim, decorar o diagnóstico da primeira execução não basta.

## Como conduzir

Comece somente pela página do candidato. Peça que a pessoa descreva quem conversa com quem, a operação afetada e a primeira evidência que discriminaria hipóteses. O instrutor aceita perguntas semanticamente equivalentes: pedir “endereço do outro lado da conexão” pode obter a mesma informação que pedir “peer remoto”. Não exija o nome de uma ferramenta como senha para liberar um fato.

Em cada cartão, separe **solicitação → informação liberada → conclusão possível → o que continua incerto**. Se houver uma solicitação fora do roteiro, responda “não temos essa observação” e discuta como obtê-la com autorização. Não invente uma medição para favorecer uma hipótese.

A rodada termina quando há uma explicação compatível com as evidências, uma contenção proporcional, uma validação da jornada e uma comunicação clara de limites. Uma lista de serviços sem mecanismo ou evidência não resolve o exercício. Também não basta acertar a causa por adivinhação.

## Avaliação e acesso

Use os critérios específicos de cada rodada para orientar a conversa; eles não são nota de carreira nem garantia de entrevista. Dê retorno sobre perguntas, atualização de hipótese, risco da intervenção e clareza para negócio e operação técnica.

Os arquivos `instrutor.md` têm a classificação de instrutor reconhecida pelo site e devem ficar fora da busca global de estudo. Essa classificação organiza a experiência; **não é autenticação nem proteção de segredo**. Estes roteiros não contêm dados privados. Quem deseja praticar sem ver as respostas deve abrir apenas o material do candidato. Os laboratórios de código são independentes dos cartões e executam apenas em loopback.

## Depois destas rodadas

Os seis simulados anteriores permanecem intactos e podem ampliar a prática. Abra somente seus enunciados se quiser preservar a investigação:

- [Checkout lento](../../../../interview/simulations/04-troubleshooting/01-checkout-lento/candidato.md): aprofunde a correlação de espera da aplicação e dependências depois da variante da rodada 1.
- [Pedido durante falha do banco](../../../../interview/simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/candidato.md): explore estado de negócio e decisão sobre repetição depois da rodada 6.
- [Conectividade privada](../../../../interview/simulations/04-troubleshooting/03-conectividade-privada/candidato.md): passe do fluxo único e explícito da rodada 4 a uma investigação mais abrangente.
- [TLS, identidade e autorização](../../../../interview/simulations/04-troubleshooting/04-tls-identidade-autorizacao/candidato.md): amplie as responsabilidades separadas trabalhadas na rodada 3.
- [Failover e reconexão](../../../../interview/simulations/04-troubleshooting/05-failover-e-reconexao/candidato.md): compare novas evidências com o recorte delimitado da rodada 6.
- [Capacidade e migração](../../../../interview/simulations/04-troubleshooting/06-capacidade-e-migracao/candidato.md): avance da hipótese localizada para decisões de mudança e limites operacionais.

São aprofundamentos opcionais, sem copiar os cartões ou substituir os seis roteiros iniciantes deste curso.
