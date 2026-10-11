# 08 — Observabilidade e troubleshooting

**Base:** N05 pergunta eficiência de hardware, se CloudWatch é suficiente e quais comandos usar. **Complemento:** método de investigação e evidência por hipótese.

## Uma sequência útil

Delimite impacto e período. Verifique o que mudou. Construa hipóteses. Busque medidas que distingam essas hipóteses. Mitigue com risco controlado. Confirme a recuperação pelo comportamento do usuário. Depois investigue a causa e a prevenção.

Logs, métricas e traces respondem a perguntas distintas. Um painel verde não invalida uma reclamação; talvez o indicador não cubra a jornada afetada.

## Recursos: utilização, saturação e erros

O método USE propõe examinar utilização, saturação e erros por recurso. [Fonte T27](../../references/README.md#t27) Use-o como guia para CPU, memória, disco e rede, mas inclua também filas, pools e dependências da aplicação.

CloudWatch não recebe automaticamente toda informação necessária. Métricas adicionais de sistema operacional e determinados logs exigem instrumentação, agente ou outra coleta configurada. [Fonte T15](../../references/README.md#t15)

<a id="slo"></a>
## Sinais de ouro, SLI e SLO

Para serviços, os quatro sinais de ouro são latência, tráfego, erros e saturação. O método RED (taxa, erros e duração das requisições) é a versão enxuta para APIs, e o USE, acima, a versão para recursos.

- **SLI:** o indicador medido do ponto de vista do cliente, como a proporção de transferências concluídas em até 2 s.
- **SLO:** a meta para o SLI num período, como 99,9% em 30 dias.
- **Orçamento de erro:** o que sobra até violar o SLO (0,1%, ou cerca de 43 minutos em 30 dias). Gastá-lo rápido pede mais cautela com mudanças; ter folga permite arriscar mais.

Alerte por sintoma que afeta o cliente (SLO em risco), não por cada CPU alta. Na AWS: métricas, logs, alarmes e alarmes compostos no CloudWatch; traces com AWS X-Ray ou OpenTelemetry (ADOT); SLOs no CloudWatch Application Signals.

## Ferramentas, não respostas mágicas

| Pergunta | Exemplos de ferramentas, conforme ambiente |
|---|---|
| Qual processo consome recursos? | `top`, `ps`; ferramentas do runtime |
| Há pressão de memória? | `vm_stat` no macOS; `/proc`, `vmstat`/`free` no Linux quando disponíveis |
| O caminho de rede está correto? | tabela de rotas, resolução DNS e teste de porta/protocolo |
| Em que etapa HTTP há espera? | `curl` com tempos; traces distribuídos |
| Há espera de banco ou disco? | planos, locks, métricas do banco, `iostat` quando disponível |

Opções variam por sistema. Não copie comandos Linux para macOS supondo equivalência. Evite imprimir variáveis de ambiente, tokens ou payloads sensíveis como etapa genérica de diagnóstico.

Exemplo de observação contra um domínio de laboratório, substituindo a URL:

```bash
curl --silent --show-error --output /dev/null \
  --connect-timeout 5 --max-time 15 \
  --write-out 'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} first_byte=%{time_starttransfer} total=%{time_total}\n' \
  'https://seu-servico-de-laboratorio.example/health'
```

As medidas são acumuladas a partir do início da transferência, não durações independentes para somar. Cache, conexão reutilizada e protocolo alteram a interpretação. Não use `--insecure` para transformar falha de certificado em “sucesso”. [Fonte T26](../../references/README.md#t26)

Esse comando não foi executado contra um serviço seu e não é um teste de capacidade. A URL é deliberadamente ilustrativa.

## Perguntas de aprofundamento

“CPU baixa exclui gargalo?” “p95 bom garante que todos os clientes estão bem?” “Erro de negócio é indisponibilidade?” “Reiniciar removeu a causa ou somente o sintoma?”

## Exercício

No [Case 07](../../cases/07-real-time-fraud-detection.md), o modelo responde rápido, mas bloqueios indevidos aumentaram. Separe disponibilidade, atualidade, qualidade estatística e política de decisão. Apresente ao cliente o que já sabe e o que ainda não foi confirmado.
