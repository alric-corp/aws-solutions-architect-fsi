# Mentoria técnica — Vitória e Cleber

Apoio à revisão após a conversa: perguntas para recuperar fatos, conferir evidências e orientar próximos exercícios. A pauta e a agenda da sessão encerrada foram substituídas. Este material não contém avaliação individual preenchida, transcrição ou comprovação dos resultados de um projeto.

[Aprendizados e próximos passos](candidato.md) · [Ficha STAR](../../../templates/star-story.md) · [Feedback em branco](../../../templates/mock-interview-feedback.md)

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="preparar-e-combinar-a-dinâmica" aria-hidden="true"></div>
<div id="agenda" aria-hidden="true"></div>
<div id="0005--abertura-sugerida" aria-hidden="true"></div>
<div id="condução-por-cleber" aria-hidden="true"></div>

## Como usar o apoio

Parta das perguntas da página de aprendizados. Quem estuda explica a decisão com os fatos que consegue sustentar; quem acompanha pede esclarecimentos sem preencher lacunas por ela. Não interpretar sugestões surgidas depois como ações realizadas na época.

Uma transcrição incompleta não permite atribuir falas, emoções ou protagonismo com segurança. Se houver dúvida sobre uma tecnologia citada ou sobre quem identificou, decidiu e executou, registre como pendência. Feedback informal de mentoria não é avaliação oficial ou nota de preparação.

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="0520--uma-unidade-duas-compras" aria-hidden="true"></div>
<div id="abertura-entregue-à-vitória" aria-hidden="true"></div>
<div id="perguntas-essenciais" aria-hidden="true"></div>
<div id="referências-de-raciocínio-para-o-facilitador" aria-hidden="true"></div>
<div id="aprofundamentos-opcionais--escolher-apenas-um" aria-hidden="true"></div>
<div id="2035--a-compra-deu-timeout-aconteceu-ou-não" aria-hidden="true"></div>
<div id="abertura-entregue-à-vitória-1" aria-hidden="true"></div>
<div id="perguntas-essenciais-1" aria-hidden="true"></div>
<div id="janelas-para-discutir" aria-hidden="true"></div>
<div id="referências-de-raciocínio-para-o-facilitador-1" aria-hidden="true"></div>
<div id="uma-pergunta-de-mecanismo-não-de-marca" aria-hidden="true"></div>

## Ficha factual da migração

Use uma cópia privada para preencher, sem anexar dados internos ao repositório.

| Afirmação a revisar | O que ocorreu na época | Evidência cuja divulgação é permitida | Limite ou melhoria futura |
|---|---|---|---|
| Motivo da alternativa escolhida | A preencher | A preencher | A preencher |
| Escritas interrompidas e restrição do snapshot | A preencher | A preencher | A preencher |
| Tabelas, chaves, campos e regras validadas | A preencher | A preencher | A preencher |
| Critérios de troca e aceitação | A preencher | A preencher | A preencher |
| Tratamento de novas escritas em caso de retorno | A preencher | A preencher | A preencher |
| Critério para encerrar a contingência | A preencher | A preencher | A preencher |

Pergunte quais verificações foram executadas, por quem, em que período e com qual aceitação. Contagem ou tamanho igual não é comparação completa de valores. Usar DMS não demonstra que a validação estava habilitada ou concluída. Uma troca de destino não resolve automaticamente dados gravados apenas no destino novo.

Se a resposta for “essas verificações reduziram o risco, mas não foram completas”, preserve esse limite. Uma prática recomendável pode ser registrada como próxima melhoria, sem ser acrescentada retroativamente ao relato.

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="reteste" aria-hidden="true"></div>
<div id="reteste-1" aria-hidden="true"></div>
<div id="3553--página-disponível-compra-falhando" aria-hidden="true"></div>
<div id="abertura-entregue-à-vitória-2" aria-hidden="true"></div>
<div id="o-que-cleber-deve-perguntar" aria-hidden="true"></div>
<div id="evidências-progressivas--todas-sintéticas" aria-hidden="true"></div>
<div id="referência-de-raciocínio" aria-hidden="true"></div>
<div id="variante-curta" aria-hidden="true"></div>

## Reteste por evidências

Reutilize a [abertura de checkout lento](../04-troubleshooting/01-checkout-lento/candidato.md). Quem conduz escolhe e segue **um** dos roteiros do [instrutor existente](../04-troubleshooting/01-checkout-lento/instrutor.md); não combine seus cartões nem invente um novo diagnóstico.

A pessoa que investiga pede os dados. Pergunte qual operação está afetada, onde começou a espera e que observação faria abandonar a hipótese. Diferencie fila para obter conexão, execução SQL e chamada a uma dependência externa.

Se a evidência apontar para execução no banco, aprofundar carga, esperas, SQL frequente ou custoso, volume processado e plano quando disponível. Se a requisição nem chegou ao SQL, não transformar consulta lenta em causa para cumprir um roteiro de estudo. CPU baixa também não descarta todo problema de banco.

Uma contenção deve ter hipótese, risco, efeito esperado e critério de validação. Mudanças de capacidade podem causar indisponibilidade; não tornar reinício ou aumento de classe a primeira ação universal. Só há recuperação quando a operação necessária ao cliente foi verificada no escopo descrito.

## Negociação, colaboração e autoria

Para um possível episódio de manutenção, recuperar: prioridade concorrente, quem precisava concordar, resistência ou dúvida, evidências apresentadas, proposta inicial, concessões, acordo e resultados. Não basta o período obtido; a ação de influência precisa aparecer.

Não chamar automaticamente uma negociação com liderança de realinhamento entre equipes. Para colaboração, separar quem identificou a necessidade, definiu um indicador, implementou e observou uso. Um trecho sobre vulnerabilidade ou discordância só vira episódio da pessoa quando sua participação e o desfecho forem confirmados.

Resultados da recuperação e melhorias posteriores são unidades diferentes. Antes de usar uma redução, confirmar definição, base, período, escopo, fonte e autorização. Não somar projeção de escala e público potencial como impacto efetivamente demonstrado.

## Decisão passada, reflexão e próxima prática

| Perspectiva | Pergunta |
|---|---|
| Na época | Que informação e avaliação realmente orientaram a decisão? |
| Revendo hoje | Que risco ou limitação agora consegue perceber melhor? |
| Em uma nova execução | Que verificação ou mecanismo acrescentaria e por quê? |

Ao mencionar Well-Architected, diferencie contato com pilares, consulta a práticas, revisão estruturada e uso do Tool. Recupere o uso real, sem apagá-lo nem ampliá-lo para uma certificação. Risco exige contexto e justificativa; não aceitar o rótulo “baixo” sem discutir alcance, recuperabilidade, incerteza e autoridade.

Escolha uma decisão e ensaie **jornada → motivo → mecanismo → validação → limite**, primeiro para negócio e depois para arquitetura e operação. C4 contexto e containers têm níveis de detalhe e públicos distintos; o segundo já inclui escolhas tecnológicas e não equivale necessariamente a Docker.

<!-- Compatibilidade com links de seção da pauta anterior. -->
<div id="5360--feedback-e-reformulação" aria-hidden="true"></div>
<div id="duas-ações-ao-sair" aria-hidden="true"></div>

## Próxima prática e critério de conclusão

| Prioridade escolhida | Prática | Evidência de entendimento |
|---|---|---|
| A preencher | A preencher | A preencher |
| A preencher | A preencher | A preencher |

Uma explicação curta precisa resistir a uma mudança de condição. Nos temas de concorrência e timeout, use os exercícios da [trilha ACID](../../../technical-knowledge/01-fundamentals/acid/README.md). A sessão de mentoria não comprova que todos foram executados com autonomia.

Não preencher uma nota de carreira ou uma probabilidade de aprovação. O registro deve deixar claros os fatos, o raciocínio, as evidências e as dúvidas que continuam abertas.

## Referências técnicas

As fontes da revisão atual estão ligadas diretamente na [página de aprendizados](candidato.md) e foram conferidas em **7 de novembro de 2026**. Database Insights e planos dependem do suporte da engine; DMS exige validação habilitada e condições aplicáveis; rollback depois de novas escritas exige estratégia de dados. As referências verificam mecanismos, não acontecimentos de um projeto.

Os identificadores T1–T8 da pauta anterior continuam como referências de apoio, preservando os links já existentes:

| ID | Referência | Escopo de apoio |
|---|---|---|
| <a id="t1"></a>T1 | [PostgreSQL 18 — Transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html) | Unidade transacional |
| <a id="t2"></a>T2 | [PostgreSQL 18 — Transaction Isolation](https://www.postgresql.org/docs/18/transaction-iso.html) | Concorrência e limites do isolamento |
| <a id="t3"></a>T3 | [PostgreSQL 18 — Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) | Regras e proteções adicionais |
| <a id="t4"></a>T4 | [Builders’ Library — Idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Repetição da mesma intenção |
| <a id="t5"></a>T5 | [Well-Architected — Idempotent operations](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_prevent_interaction_failure_idempotent.html) | Operações que alteram estado |
| <a id="t6"></a>T6 | [RDS — Multi-AZ DB instance failover](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.Failover.html) | Conectividade e recuperação da aplicação são perguntas distintas |
| <a id="t7"></a>T7 | [OpenTelemetry — Traces](https://opentelemetry.io/docs/concepts/signals/traces/) | Intervalos conforme a instrumentação disponível |
| <a id="t8"></a>T8 | [node-postgres — Pooling](https://node-postgres.com/features/pooling) | Aquisição e devolução de conexões |

[← Voltar aos aprendizados](candidato.md)
