# SD05 — Escala, Capacidade e Deploy

**Origem:** seções que estavam em F09 e F11.

<a id="scale-cube"></a>
## Escalabilidade e scale cube

Escalar verticalmente é usar uma máquina maior: simples, mas com teto e uma peça única. Escalar horizontalmente é acrescentar instâncias: exige serviço sem estado na instância (sessão, arquivos e cache fora do processo) e um balanceador na frente. Na AWS, o Auto Scaling pode seguir uma métrica-alvo (target tracking, como 50% de CPU), etapas, agenda ou previsão.

O scale cube organiza as três formas de escalar:

| Eixo | Como escala | Exemplo |
|---|---|---|
| X | Clonar o mesmo serviço atrás de um balanceador | Mais tasks do mesmo serviço no ECS |
| Y | Dividir por função ou domínio | Serviços de pagamentos, limites e cadastro ([SD01](01-arquitetura-de-servicos.md#microsservicos)) |
| Z | Dividir por dados ou clientes: cada cópia atende um subconjunto | Sharding por cliente ([SD02](02-dados-em-escala.md#particionamento)), células ([SD04](04-resiliencia-e-isolamento.md#celulas)) |

**Cuidado:** escalar uma camada só move o gargalo para a seguinte; mais tasks podem esgotar as conexões do banco (o RDS Proxy ajuda a reaproveitá-las). Confira dependências, limites e cotas antes de prometer escala.

<a id="capacity"></a>
## Capacity planning

1. **Linha de base:** carga atual por jornada (requisições por segundo, transações por minuto) e consumo por unidade (CPU, memória, conexões e IOPS por transação).
2. **Demanda futura:** crescimento, sazonalidade e eventos. No varejo, Black Friday; no banco, dias de pagamento de salário, início de mês e campanhas.
3. **Pico, não média:** dimensione pelo pico, com margem de segurança.
4. **Falha incluída:** a capacidade que sobra depois de perder uma AZ precisa aguentar o pico (estabilidade estática). Com três AZs, cada uma precisa atender metade do pico, 50% a mais do que atenderia com as três ativas.
5. **Dependências e cotas:** banco, terceiros e as Service Quotas da AWS têm limites; peça aumentos com antecedência.
6. **Validação:** confirme com teste de carga e revise com os dados reais depois do evento.

**Cuidado:** a estimativa vale o que valem as premissas; registre-as junto com o número.

<a id="testes-carga"></a>
## Testes de carga e estresse

| Tipo | Pergunta que responde |
|---|---|
| Carga | O sistema atende a carga esperada dentro do SLO? |
| Estresse | Onde e como ele quebra acima do esperado, e como se recupera? |
| Pico (spike) | Aguenta um salto súbito, como a abertura de uma campanha? |
| Resistência (soak) | Mantém o desempenho por horas, sem vazamento de memória ou de conexões? |

Meça throughput, latência em percentis (p50, p95, p99), taxa de erro e saturação de cada recurso, no cliente e no servidor. Use carga e dados realistas (mistura de jornadas, tamanho de payload, cache frio e quente), um ambiente parecido com produção e um gerador de carga que não seja ele próprio o gargalo. Ferramentas comuns: k6, JMeter, Gatling e Locust; na AWS, a solução Distributed Load Testing on AWS.

**Cuidado:** simule terceiros (provedor de Pix, bureau de crédito) em vez de testá-los sem acordo, siga as políticas da AWS para testes e não use dados reais de clientes. Teste também a recuperação: o sistema volta sozinho quando a carga cai?

<a id="deployment"></a>
## Estratégias de deployment

| Estratégia | Como funciona | Rollback | Custo ou risco |
|---|---|---|---|
| All-at-once | Troca tudo de uma vez | Novo deploy | Rápido; afeta todos se der errado |
| Rolling | Troca em lotes de instâncias | Lento, lote a lote | Duas versões convivem durante a troca |
| Blue/green | Sobe o ambiente novo (green) inteiro e vira o tráfego | Voltar o tráfego para o blue | Capacidade em dobro durante a troca |
| Canary | Uma fração pequena do tráfego vai para a versão nova, que cresce se as métricas estiverem boas | Tirar o tráfego do canary | Exige métricas e critérios automáticos |
| Linear | Aumenta o tráfego em degraus iguais, a intervalos fixos | Como no canary | Mais lento e mais controlado |

**Feature toggles (flags)** separam implantar de liberar: o código vai desligado para produção e é ativado por configuração, para um grupo de clientes, uma região ou um percentual, e desligado sem novo deploy. Permitem dark launch (código em produção, invisível ao cliente). Exigem limpeza: flag esquecida vira dívida e caminho não testado.

Na AWS: CodeDeploy (blue/green no ECS e no EC2; canary e linear no Lambda), rolling no ECS com o circuit breaker de implantação, pesos em target groups do ALB ou em registros do Route 53, canary em estágios do API Gateway e feature flags no AWS AppConfig. O rollback pode ser automático, disparado por alarmes do CloudWatch.

**Cuidado:** em toda estratégia, duas versões convivem por algum tempo, inclusive sobre o mesmo banco; mudanças de schema precisam funcionar com as duas (veja [Rollback e compatibilidade](../fundamentals/11-git-cicd-iac.md#rollback)). No canary, meça também métricas de negócio, como taxa de aprovação ou conversão, não só erro HTTP.
