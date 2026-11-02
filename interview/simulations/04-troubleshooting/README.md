# Trilha prática de troubleshooting

Seis simulados orais para desenvolver investigação técnica, comunicação com clientes e responsabilidade operacional na preparação para entrevistas de Solutions Architect. Não exigem conta AWS, provisionamento ou execução de comandos.

**Origem:** complementação autoral aos fundamentos e roteiros existentes. Todos os incidentes, organizações, identificadores e resultados são fictícios. Logs, traces, métricas, horários e números são **dados sintéticos para treinamento**. Os mecanismos documentados têm fontes e data de consulta nos arquivos do instrutor; as causas e os critérios dos exercícios são escolhas pedagógicas.

Esta trilha pode ser usada na preparação para uma posição L5. A rubrica não é uma avaliação oficial da Amazon, não determina L5 ou L6 e não promete aprovação ou reenquadramento.

## Preparar a primeira sessão

O instrutor lê o [guia](guia-do-instrutor.md), aplica o [diagnóstico inicial](diagnostico-inicial.md) e abre o arquivo do instrutor do caso escolhido. Compartilha somente o arquivo `candidato.md` correspondente. Não compartilhar a pasta inteira ou a tela com o gabarito. A separação de arquivos facilita a condução; os arquivos do instrutor continuam públicos no repositório.

Reserve 45–55 minutos por caso: abertura e impacto (5), investigação (20), decisão e validação (10), comunicação (5), debrief (10). São tempos sugeridos, ajustáveis. Uma variante pode ocupar outra sessão de 20–30 minutos. Em cada rodada, escolha apenas uma variante; não misture seus dados.

## Simulados

| Ordem | Problema | Material da candidata | Material do instrutor |
|---|---|---|---|
| 1 | Checkout lento | [Abertura](01-checkout-lento/candidato.md) | [Base e variante curta](01-checkout-lento/instrutor.md) |
| 2 | Pedido durante falha do banco | [Abertura](02-pedido-durante-falha-do-banco/candidato.md) | [Três janelas de falha](02-pedido-durante-falha-do-banco/instrutor.md) |
| 3 | Conectividade privada | [Aberturas A e B](03-conectividade-privada/candidato.md) | [API externa e banco interno](03-conectividade-privada/instrutor.md) |
| 4 | TLS, identidade e autorização | [Aberturas A e B](04-tls-identidade-autorizacao/candidato.md) | [TLS e acesso ao S3](04-tls-identidade-autorizacao/instrutor.md) |
| 5 | Failover e reconexão | [Abertura](05-failover-e-reconexao/candidato.md) | [Recuperação da aplicação](05-failover-e-reconexao/instrutor.md) |
| 6 | Capacidade e migração de banco | [Abertura](06-capacidade-e-migracao/candidato.md) | [Contenção e decisão de mudança](06-capacidade-e-migracao/instrutor.md) |

Comece por 1 → 2 para praticar localização da espera e raciocínio sobre resultado incerto. Prossiga por 3 → 4 → 5 → 6 para integrar camadas de rede, segurança, recuperação e mudança. Depois retome as variantes sem antecipar a causa: o objetivo é transferir o método para novos cenários.

## Avaliar e revisar

Use a [rubrica por dimensão](rubrica.md) e o [modelo de registro em branco](modelo-registro-sessao.md). Guarde preenchimentos pessoais em cópia privada fora do repositório. Não há avaliação individual preenchida nesta trilha.

Revise os fundamentos conforme a dificuldade observada: [F08 — observabilidade](../../../technical-knowledge/01-fundamentals/08-observability-troubleshooting.md), [F06 — transações](../../../technical-knowledge/01-fundamentals/06-databases-transactions-consistency.md), [F07 — eventos](../../../technical-knowledge/01-fundamentals/07-events-messaging-distributed-systems.md), [F01 — redes](../../../technical-knowledge/01-fundamentals/01-networking-dns-connectivity.md), [F03 — segurança](../../../technical-knowledge/01-fundamentals/03-security-identity.md) e [F12 — resiliência e migração](../../../technical-knowledge/01-fundamentals/12-resilience-migration.md).

As [fontes verificadas](../../../references/troubleshooting-fontes.md) delimitam o suporte documental. Não houve execução dos cenários em AWS; resultados de recuperação são cartões sintéticos condicionados à decisão proposta.
