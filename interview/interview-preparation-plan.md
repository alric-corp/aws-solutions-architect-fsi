# Cronograma integrado — preparação AWS Solutions Architect FSI

> **Base:** `Cronograma_Preparacao_AWS_Solutions_Architect.xlsx`, fornecido nesta conversa.  
> **Natureza:** proposta de integração ao repositório; não substitui o conteúdo original.  
> **Caminho sugerido:** `preparacao/06-cronograma-integrado.md`.  
> **Datas:** a origem registra 28/09 a 13/10, sem ano nas células. As referências abaixo usam Dia 1 a Dia 16; não assumem a data da entrevista.  
> **Privacidade:** este guia usa apenas IDs das histórias. A planilha contém episódios e métricas profissionais e deve permanecer privada até revisão.

## 1. O que reaproveitar

A planilha tem cinco abas, com papéis complementares:

| Aba da origem | Conteúdo observado | Como utilizar |
|---|---|---|
| Cronograma | 16 sessões, 2 horas cada; datas de 28/09 a 13/10 | Roteiro diário |
| Checklist Técnico | 39 itens, com prioridade, status, confiança e observações | Diagnóstico e fila de revisão |
| Cases STAR | 7 episódios, com LPs, métricas, decisão e aprofundamentos | Inventário privado de experiências |
| System Design | 6 cenários, com requisitos e perguntas de aprofundamento | Exercícios gerais, preservados como aquecimento |
| Revisão Rápida | 20 comparações | Recuperação ativa e verificação de lacunas |

**Carga da origem: 32 horas.** Os três blocos são 40 minutos de conceitos, 50 minutos de prática/Draw.io e 30 minutos de behavioral/inglês. A proposta mantém esse orçamento.

As atividades estão registradas como “Não iniciado”, e a confiança não está preenchida. Isso descreve o arquivo recebido, não o conhecimento ou o progresso atual da candidata. Nada foi marcado como concluído.

**Não fizemos uma auditoria técnica de cada afirmação das cinco abas.** Elas foram preservadas. A tabela abaixo adiciona exercícios e referências; não certifica como universais as respostas resumidas da aba Revisão Rápida.

## 2. Como encaixar as trilhas

A planilha responde **quando estudar e o que praticar**. Os Markdown respondem **onde aprofundar**. A evidência de estudo fica em [competências](../progress/competencies.md) e no [feedback do simulado](../templates/feedback-simulado.md).

| Camada | Identificação sem ambiguidade | Lugar |
|---|---|---|
| Experiência profissional real | STAR-01 a STAR-07 | Aba Cases STAR e arquivos privados |
| Exercício geral | SD-01 a SD-06 | Aba System Design |
| Case hipotético financeiro | FSI-01 a FSI-10 | Pasta cases |
| Conceito de apoio | F01 a F12 | Pasta fundamentos |

A origem usa “Case 1”, “Case 2” etc. em alguns blocos comportamentais, mas não declara um namespace para essas referências. **Não reinterpretar automaticamente esses números como FSI-01 e FSI-02.** Na proposta, cada tipo recebe um prefixo explícito.

Um case FSI não deve virar história de experiência profissional. Um laboratório pode ser apresentado como laboratório, com seu escopo real.

## 3. Como usar as duas horas

A divisão abaixo é **uma sugestão dentro dos blocos existentes**, não tempo extra.

| Bloco original | Divisão sugerida |
|---|---|
| Conceitos — 40 min | 20 min de leitura dirigida, 10 min explicando sem consulta, 10 min revendo uma lacuna anterior |
| Prática/Draw.io — 50 min | 10 min de requisitos, 20 min de desenho, 10 min de falha, 10 min de alternativa e trade-off |
| Behavioral/inglês — 30 min | 15 min de história real, 10 min de aprofundamentos, 5 min de trecho em inglês |

Quando o tema ainda não estiver compreendido, reduza o recorte do case. **Não tente ler um case inteiro, fazer um laboratório AWS e simular a entrevista dentro de 50 minutos.**

Os dias de mock e revisão final mantêm suas finalidades. A divisão interna é ajustável; a carga não cresce silenciosamente.

## 4. Mapa dos 16 dias

A ordem, os temas e as datas de referência vêm da aba Cronograma. Leituras, recortes FSI e entregas são sugestões novas. Escolher dois módulos como apoio significa consultar trechos, não ler ambos integralmente.


### Dia 01 — System Design + Networking I

**Data na origem:** 28/09. **Leitura de apoio:** [F01](../technical-knowledge/fundamentals/01-redes-dns-conectividade.md) · [F02](../technical-knowledge/fundamentals/02-http-rest-openapi.md).  
**Recorte aplicado:** [FSI-01 — Pagamentos e Pix](../cases/01-payment-processing-pix.md).

**40 min — proposta de foco:** Requisitos e caminho de uma requisição. Usar apenas os trechos de redes e HTTP necessários ao desenho.

**50 min — exercício proposto:** Manter o desenho web de três camadas. Nos minutos finais, contextualizar a entrada de pagamentos: quem chama, qual resposta espera e quais requisitos ainda faltam?

**30 min — STAR/inglês:** STAR-01 ou STAR-02: ensaiar a contribuição individual e o impacto no usuário. Encerrar com perguntas de descoberta em inglês.

**Evidência esperada:** 5 perguntas de descoberta + desenho inicial + 1 requisito que mudaria a escolha.


### Dia 02 — Networking II

**Data na origem:** 29/09. **Leitura de apoio:** [F01](../technical-knowledge/fundamentals/01-redes-dns-conectividade.md).  
**Recorte aplicado:** [FSI-04 — KYC e abertura de conta](../cases/04-kyc-abertura-de-conta.md).

**40 min — proposta de foco:** Rede do dia anterior: sub-redes, rotas, SG/NACL, endpoints e DNS.

**50 min — exercício proposto:** Traçar separadamente a chamada da API e o upload de documentos no recorte de KYC. Explicar quem acessa cada componente, sem tentar estudar toda a jornada de KYC.

**30 min — STAR/inglês:** STAR-01: aprofundar investigação. Procurar uma situação real de admissão de erro ou comunicação transparente para Earn Trust; não presumir que a história já a contém.

**Evidência esperada:** Explicar cada seta + justificar acesso privado/público + 1 hipótese de falha.


### Dia 03 — Load Balancing + Escalabilidade

**Data na origem:** 30/09. **Leitura de apoio:** [F04](../technical-knowledge/fundamentals/04-computacao-containers.md) · [F09](../technical-knowledge/fundamentals/09-performance-custos.md).  
**Recorte aplicado:** [FSI-10 — Autorização de cartões](../cases/10-plataforma-autorizacao-cartoes.md).

**40 min — proposta de foco:** Load balancing, health checks e escala. Ler o recorte relevante, não os dois módulos completos.

**50 min — exercício proposto:** Manter o desenho de alta disponibilidade. Contrastar a entrada HTTP do e-commerce com a integração do case de cartões e perguntar qual protocolo e comportamento de conexão são exigidos.

**30 min — STAR/inglês:** STAR-01: defender alternativas de escala e evidências. Para Think Big, procurar um episódio real com impacto além da correção imediata.

**Evidência esperada:** Comparação de duas alternativas de entrada + comportamento esperado na perda de uma AZ.


### Dia 04 — Segurança AWS

**Data na origem:** 01/10. **Leitura de apoio:** [F03](../technical-knowledge/fundamentals/03-seguranca-identidade.md).  
**Recorte aplicado:** [FSI-02 — Open Finance APIs](../cases/02-open-finance-apis.md).

**40 min — proposta de foco:** Identidade, autorização, proteção de dados e auditoria; priorizar as ameaças do recorte escolhido.

**50 min — exercício proposto:** Usar a consulta de Open Finance para separar autenticação, token, consentimento e acesso à conta. Aplicar a pergunta: o consentimento foi revogado; o que verificar?

**30 min — STAR/inglês:** STAR-03 ou STAR-05: contribuição e responsabilidade. Procurar evidência real de impacto mais amplo para Success and Scale Bring Broad Responsibility.

**Evidência esperada:** Tabela ameaça → controle → limitação e explicação da autorização sobre um recurso.


### Dia 05 — CloudFront + Route 53 + Arquitetura Global

**Data na origem:** 02/10. **Leitura de apoio:** [F01](../technical-knowledge/fundamentals/01-redes-dns-conectividade.md) · [F02](../technical-knowledge/fundamentals/02-http-rest-openapi.md) · [F12](../technical-knowledge/fundamentals/12-resiliencia-migracao.md).  
**Recorte aplicado:** [FSI-09 — Internet Banking Multi-Region](../cases/09-internet-banking-multi-region.md).

**40 min — proposta de foco:** CloudFront, DNS e requisitos globais. Recortes dirigidos; não ler três módulos inteiros.

**50 min — exercício proposto:** Separar conteúdo estático, consultas e comandos no Internet Banking. Explicar quais funções continuariam disponíveis durante uma falha regional e quais dependem de validação.

**30 min — STAR/inglês:** STAR-02: explicar decisão e medição de latência. Distinguir resultado observado de hipótese e ensaiar um trade-off em inglês.

**Evidência esperada:** Comparação CDN/DNS/recuperação + RTO/RPO propostos como requisitos, não como garantias.


### Dia 06 — Compute + Containers

**Data na origem:** 03/10. **Leitura de apoio:** [F04](../technical-knowledge/fundamentals/04-computacao-containers.md) · [F10](../technical-knowledge/fundamentals/10-dados-analytics-ia.md).  
**Recorte aplicado:** [FSI-06 — GenAI para assessor financeiro](../cases/06-genai-assessor-financeiro.md).

**40 min — proposta de foco:** EC2, containers e serverless. Reservar um recorte introdutório do módulo de IA para distinguir aplicação, recuperação e modelo.

**50 min — exercício proposto:** Escolher a execução do backend de um assistente interno. Explicar a fronteira de autorização antes da recuperação; não tentar dominar todas as APIs do Bedrock nesta sessão.

**30 min — STAR/inglês:** STAR-07: Learn and Be Curious. Separar claramente o que foi executado, medido e apenas projetado.

**Evidência esperada:** Uma decisão de compute, uma alternativa descartada e uma fronteira de autorização.


### Dia 07 — Microservices + DDD + Consistência

**Data na origem:** 04/10. **Leitura de apoio:** [F07](../technical-knowledge/fundamentals/07-eventos-sistemas-distribuidos.md) · [F06](../technical-knowledge/fundamentals/06-bancos-consistencia.md).  
**Recorte aplicado:** [FSI-03 — Banking Event-Driven](../cases/03-banking-event-driven.md).

**40 min — proposta de foco:** Domínios, limites de serviços, bases compartilhadas e coordenação distribuída.

**50 min — exercício proposto:** Manter Order/Payment/Inventory como aquecimento e aplicar o raciocínio à transferência interna: quem decide cada etapa e quem é a autoridade financeira?

**30 min — STAR/inglês:** STAR-03: explicar a decisão real. Buscar episódio de discordância respeitosa e compromisso após decisão para Have Backbone; Disagree and Commit.

**Evidência esperada:** Fronteiras de responsabilidade + comparação entre coreografia e orquestração.


### Dia 08 — Banco I — Fundamentos

**Data na origem:** 05/10. **Leitura de apoio:** [F06](../technical-knowledge/fundamentals/06-bancos-consistencia.md) · [F09](../technical-knowledge/fundamentals/09-performance-custos.md).  
**Recorte aplicado:** [FSI-01 — Pagamentos e Pix](../cases/01-payment-processing-pix.md).

**40 min — proposta de foco:** Transações, locks, isolamento e gargalos. Manter o cenário MySQL do cronograma para formular hipóteses.

**50 min — exercício proposto:** Trabalhar o recorte de requisições duplicadas e resultado desconhecido do pagamento. Separar registro da intenção, execução externa e recuperação.

**30 min — STAR/inglês:** STAR-06: aprofundar prazo, alternativas e evidências, sem transformar projeções em medições.

**Evidência esperada:** Sequência de concorrência/timeout + hipótese de diagnóstico + evidência que a confirmaria.


### Dia 09 — Banco II — SQL vs NoSQL

**Data na origem:** 06/10. **Leitura de apoio:** [F06](../technical-knowledge/fundamentals/06-bancos-consistencia.md) · [F05](../technical-knowledge/fundamentals/05-armazenamento.md).  
**Recorte aplicado:** [FSI-08 — Data Lake financeiro](../cases/08-data-lake-financeiro.md).

**40 min — proposta de foco:** SQL/NoSQL e padrões de acesso. Reservar até 10 dos 40 minutos para revisar armazenamento por objeto, bloco e arquivo, substituindo parte da revisão já dominada.

**50 min — exercício proposto:** Contrastar banco operacional e produto analítico. Perguntar o que precisa ser conciliado e quem pode acessar a saída da consulta. É um recorte do lake, não implementação completa.

**30 min — STAR/inglês:** STAR-05: Frugality. Esclarecer como uso, dependências e resultado foram verificados.

**Evidência esperada:** Escolha por padrão de acesso + uma regra de publicação + um risco de acesso.


### Dia 10 — Distributed Systems

**Data na origem:** 07/10. **Leitura de apoio:** [F07](../technical-knowledge/fundamentals/07-eventos-sistemas-distribuidos.md) · [F10](../technical-knowledge/fundamentals/10-dados-analytics-ia.md).  
**Recorte aplicado:** [FSI-07 — Fraude em tempo real](../cases/07-fraud-detection-tempo-real.md).

**40 min — proposta de foco:** Retries, idempotência, filas e eventos; introduzir apenas a distinção entre atualização de contexto e decisão síncrona.

**50 min — exercício proposto:** No antifraude, separar o que o cliente espera agora do que chega pelo stream. Perguntar como tratar evento duplicado, contexto atrasado e uma dependência indisponível.

**30 min — STAR/inglês:** STAR-03: aprofundamentos de falhas e compatibilidade. Manter as ações reais separadas do exercício antifraude.

**Evidência esperada:** Dois caminhos desenhados + uma hipótese de atraso + tratamento de duplicidade.


### Dia 11 — Migração + Modernização

**Data na origem:** 08/10. **Leitura de apoio:** [F12](../technical-knowledge/fundamentals/12-resiliencia-migracao.md).  
**Recorte aplicado:** [FSI-05 — Modernização do core](../cases/05-modernizacao-core-banking.md).

**40 min — proposta de foco:** Estratégias de migração, risco, prazo, dependências e critérios de cutover.

**50 min — exercício proposto:** Aplicar a fachada e a migração de uma capacidade do core. Identificar escritores antigos e definir que evidência permitiria transferir a operação.

**30 min — STAR/inglês:** STAR-06: comparar alternativas e risco calculado; explicar o que faria diferente.

**Evidência esperada:** Uma onda de migração + critérios de entrada/saída + condição que impede cutover.


### Dia 12 — Hybrid Networking + Direct Connect Redundante

**Data na origem:** 09/10. **Leitura de apoio:** [F01](../technical-knowledge/fundamentals/01-redes-dns-conectividade.md) · [F12](../technical-knowledge/fundamentals/12-resiliencia-migracao.md).  
**Recorte aplicado:** [FSI-09 — Internet Banking Multi-Region](../cases/09-internet-banking-multi-region.md).

**40 min — proposta de foco:** Conectividade híbrida, diversidade física, BGP e contingência; usar somente trechos do módulo de resiliência.

**50 min — exercício proposto:** Manter a falha do enlace como cenário. Estender ao acesso de duas regiões ao core e explicitar dependências, capacidade de backup e testes necessários.

**30 min — STAR/inglês:** Revisitar STAR-01 ou STAR-06 somente no que de fato aconteceu. Treinar comunicação de risco e limitações; não afirmar experiência em DX não vivida.

**Evidência esperada:** Caminhos primário/alternativo + falhas comuns + plano de teste do caminho de backup.


### Dia 13 — CI/CD + Deploy Strategies

**Data na origem:** 10/10. **Leitura de apoio:** [F11](../technical-knowledge/fundamentals/11-git-cicd-iac.md).  
**Recorte aplicado:** [FSI-06 — GenAI para assessor financeiro](../cases/06-genai-assessor-financeiro.md).

**40 min — proposta de foco:** Git, artefatos, CI/CD, canary, blue-green, rolling e critérios de rollback.

**50 min — exercício proposto:** Comparar mudança de aplicação com mudança de versão de configuração/modelo/índice no assistente. Selecionar uma mudança e definir validação e retorno.

**30 min — STAR/inglês:** STAR-04: qualidade e contribuição individual. Buscar exemplo real de mentoria/feedback para Hire and Develop the Best.

**Evidência esperada:** Pipeline com um gate de qualidade + versão identificada + critério de retorno.


### Dia 14 — Troubleshooting

**Data na origem:** 11/10. **Leitura de apoio:** [F08](../technical-knowledge/fundamentals/08-observabilidade-troubleshooting.md) · [F09](../technical-knowledge/fundamentals/09-performance-custos.md).  
**Recorte aplicado:** [FSI-07 — Fraude em tempo real](../cases/07-fraud-detection-tempo-real.md).

**40 min — proposta de foco:** Diagnóstico por hipóteses e evidências; priorizar a maior lacuna da checklist.

**50 min — exercício proposto:** Usar latência alta com CPU normal como base. Investigar a cadeia de decisão do antifraude sem saltar para aumentar recursos; fazer um segundo recorte curto apenas se sobrar tempo.

**30 min — STAR/inglês:** STAR-01: investigação e comunicação. Procurar episódio real de melhoria do ambiente de trabalho para Strive to be Earth's Best Employer.

**Evidência esperada:** Hipótese → sinal → próximo teste; diferenciar erro técnico de resultado de negócio.


### Dia 15 — MOCK COMPLETO

**Data na origem:** 12/10. **Leitura de apoio:** [Simulados](simulations/) e [revisão das lacunas](../progress/competencies.md).  
**Recorte aplicado:** [FSI-09 — Internet Banking Multi-Region](../cases/09-internet-banking-multi-region.md).

**40 min — proposta de foco:** Revisar somente lacunas já registradas e preparar o briefing do simulado.

**50 min — exercício proposto:** Simulado de 50 minutos com o case 09, ou trocar pelo case de maior lacuna já estudado. Não trocar a sessão por leitura da resposta.

**30 min — STAR/inglês:** 3 perguntas comportamentais dentro dos 30 minutos, incluindo aprofundamentos e um trecho em inglês. Usar somente experiências reais.

**Evidência esperada:** Feedback do simulado com 3 lacunas prioritárias e uma ação de revisão por lacuna.


### Dia 16 — Revisão Final

**Data na origem:** 13/10. **Leitura de apoio:** [Simulados](simulations/) e [revisão das lacunas](../progress/competencies.md).  
**Recorte aplicado:** [FSI-01 — Pagamentos e Pix](../cases/01-payment-processing-pix.md).

**40 min — proposta de foco:** Revisão rápida de comparações e pontos já estudados; nenhuma trilha nova.

**50 min — exercício proposto:** Um desenho curto de um case já conhecido (01 ou 09) e explicação das setas. Preferir clareza a acrescentar mais serviços.

**30 min — STAR/inglês:** Revisar o esqueleto dos 7 STARs, não 7 relatos completos; conferir métricas, aprendizado, pitch e logística.

**Evidência esperada:** Checklist final, perguntas ao entrevistador e pendências explicitamente reconhecidas.


## 5. Cobertura dos dez cases

Esta é **cobertura planejada de recortes**, não atestado de domínio dos dez documentos. A primeira passagem conecta os fundamentos; aprofundamentos posteriores dependem do diagnóstico.

| Case | Dias de contato planejado | Pergunta do recorte |
|---|---|---|

| [FSI-01 — Pagamentos e Pix](../cases/01-payment-processing-pix.md) | 1, 8, 16 | Quais requisitos faltam e como tratar uma operação repetida ou de resultado desconhecido? |

| [FSI-02 — Open Finance APIs](../cases/02-open-finance-apis.md) | 4 | A instituição pode acessar este recurso e o consentimento ainda permite isso? |

| [FSI-03 — Banking Event-Driven](../cases/03-banking-event-driven.md) | 7 | Quem decide cada etapa e como tratar efeitos de negócio diante de falhas? |

| [FSI-04 — KYC e abertura de conta](../cases/04-kyc-abertura-de-conta.md) | 2 | Por onde passam a API e os documentos, e quem pode acessá-los? |

| [FSI-05 — Modernização do core](../cases/05-modernizacao-core-banking.md) | 11 | Que evidência permite transferir uma capacidade e desativar o escritor antigo? |

| [FSI-06 — GenAI para assessor financeiro](../cases/06-genai-assessor-financeiro.md) | 6, 13 | Onde roda o backend, quem autoriza a recuperação e como validar uma mudança? |

| [FSI-07 — Fraude em tempo real](../cases/07-fraud-detection-tempo-real.md) | 10, 14 | O que deve responder agora e o que pode ser atualizado pelo stream? |

| [FSI-08 — Data Lake financeiro](../cases/08-data-lake-financeiro.md) | 9 | O dado está pronto para análise e quem pode acessar também os resultados? |

| [FSI-09 — Internet Banking Multi-Region](../cases/09-internet-banking-multi-region.md) | 5, 12, 15 | Que jornadas podem funcionar durante a falha e quais dependências permanecem? |

| [FSI-10 — Autorização de cartões](../cases/10-plataforma-autorizacao-cartoes.md) | 3 | Que requisitos de protocolo, conexão e disponibilidade alteram a entrada da aplicação? |


Alguns assuntos não têm um dia exclusivo na origem: armazenamento, dados/analytics e ML/GenAI. Os recortes nos dias 6, 9 e 10 criam um primeiro contato, **não substituem aprofundamento**. Se forem lacunas relevantes, troque uma sessão já dominada ou planeje um ciclo adicional; não comprima tudo nas mesmas duas horas.

## 6. Aproveitar as sete histórias STAR

Preserve os episódios originais como ponto de partida. Confirme fatos, contribuição individual, origem das métricas e limites de cada resultado antes de usar a história.

O mapeamento abaixo foi extraído das colunas C e D da aba Cases STAR. Para comparação com a nomenclatura do repositório, “Highest Standards” foi associado a “Insist on the Highest Standards”, e “Are Right A Lot” a “Are Right, A Lot”. Essa normalização não altera o texto da origem.

| Leadership Principle | Associação principal registrada | Associação secundária registrada |
|---|---|---|

| Customer Obsession | — | STAR-01, STAR-02 |

| Ownership | STAR-03 | STAR-01, STAR-05, STAR-06, STAR-07 |

| Invent and Simplify | STAR-02 | STAR-03, STAR-04 |

| Are Right, A Lot | — | STAR-06 |

| Learn and Be Curious | STAR-07 | — |

| Hire and Develop the Best | — | — |

| Insist on the Highest Standards | STAR-04 | STAR-03, STAR-07 |

| Think Big | — | — |

| Bias for Action | STAR-06 | STAR-01 |

| Frugality | STAR-05 | STAR-04 |

| Earn Trust | — | — |

| Dive Deep | STAR-01 | STAR-02, STAR-03, STAR-04, STAR-05, STAR-06, STAR-07 |

| Have Backbone; Disagree and Commit | — | — |

| Deliver Results | — | STAR-01, STAR-02, STAR-04, STAR-05, STAR-06 |

| Strive to be Earth's Best Employer | — | — |

| Success and Scale Bring Broad Responsibility | — | — |


**Dez dos 16 nomes aparecem explicitamente como principal ou secundário.** Os seis restantes não estão associados a episódios nas colunas consultadas; isso não demonstra que a candidata não tenha experiências adequadas.

| Associação ainda não registrada | Busca de uma experiência real | Dia sugerido para começar |
|---|---|---|
| Earn Trust | Admissão de erro, comunicação difícil ou reconstrução de confiança | 2 ou 12 |
| Think Big | Iniciativa que ampliou o impacto além de uma correção pontual | 3 |
| Success and Scale Bring Broad Responsibility | Consequências mais amplas e prevenção de impactos indesejados | 4 |
| Have Backbone; Disagree and Commit | Discordância respeitosa e atuação depois da decisão | 7 |
| Hire and Develop the Best | Mentoria, feedback e desenvolvimento de outra pessoa | 13 |
| Strive to be Earth's Best Employer | Melhoria concreta do ambiente e das condições de trabalho | 14 |

Essas são **perguntas para encontrar fatos**, não novas histórias preenchidas. Uma história pode apoiar mais de um princípio quando as ações demonstram isso; acrescentar um rótulo não cria a evidência.

Não invente números para melhorar o relato. A própria aba já distingue projeção de métrica real em um aprofundamento: preserve essa distinção em todos os ensaios.

Use [LPs e STAR](../leadership-principles/README.md), o [guia de evidências](../leadership-principles/00-star-e-evidencias.md), a [matriz LP × histórias](../progress/matrix-lp-stories.md) e o [template STAR](../templates/historia-star.md). Preencha detalhes pessoais somente na área privada.

## 7. Critério de avanço

Marcar uma sessão como realizada não significa dominar o conteúdo. Ao encerrar, registre se conseguiu:

1. Explicar o conceito sem ler.
2. Justificar uma escolha e uma alternativa.
3. Tratar uma falha ou uma mudança de requisito.
4. Separar experiência real, laboratório e hipótese.
5. Reconhecer uma lacuna específica e definir como validá-la.

A confiança de 1 a 5 é autoavaliação, não probabilidade de aprovação. Registre evidência junto com ela.

No começo da próxima sessão, use os minutos de revisão já previstos para testar a lacuna mais importante. Em caso de atraso, remaneje; não imponha quatro horas no dia seguinte automaticamente.

## 8. Uso do Excel integrado

A cópia integrada mantém as cinco abas e os conteúdos originais. Acrescenta:

| Aba adicionada | Finalidade |
|---|---|
| Guia FSI | Resumo por fórmulas, instruções, escopo e legenda de referências |
| Integração FSI | Mapa dos 16 dias com leituras e exercícios propostos |
| Cobertura LP | Contagem de associações registradas e triagem de evidências |

Na aba **Cronograma**, continue atualizando status, confiança e notas. A Integração FSI espelha status e horas; não é uma segunda fonte de progresso. Na Cobertura LP, a contagem lê as colunas originais de LPs; a triagem começa como “A verificar” e precisa de avaliação humana.

As fórmulas de LP consideram os sete episódios atuais, nas linhas 2 a 8 de Cases STAR. Novas linhas exigem expandir as fórmulas de cobertura. Contar uma associação de nome não valida a qualidade da história.

**Nenhuma data foi recalculada e nenhum progresso foi presumido.** Antes de usar como calendário vigente, confirme data da entrevista, dias disponíveis e tempo real por sessão. Até essa confirmação, trate Dia 1 a Dia 16 como sequência relativa.

## 9. Como incorporar ao repositório

Salve este guia como `preparacao/06-cronograma-integrado.md`. Depois de revisar, acrescente ao README:

```markdown
[Plano de 16 sessões integrado ao cronograma](preparacao/06-cronograma-integrado.md)
```

O guia depende dos arquivos do pacote de preparação já entregue. Se o repositório ainda contiver somente `cases/`, as referências a fundamentos, LPs, simulados e templates funcionarão após a incorporação daquele pacote.

**Não publique a planilha original ou integrada sem revisar seu conteúdo.** As abas de histórias incluem episódios, identificadores e métricas profissionais. O Markdown aqui evita copiá-los e utiliza apenas IDs STAR.

Nada foi commitado ou enviado ao GitHub.

## 10. Proveniência e limites

Leitura direta das células da planilha enviada:

| Evidência | Localização |
|---|---|
| Estrutura dos três blocos | Cronograma!D1:F1 |
| Datas, temas, horas e status | Cronograma!A2:K17 |
| Resumo da origem | Cronograma!M1:N7 |
| Checklist | Checklist Técnico!A1:G40 |
| Histórias e LPs | Cases STAR!A1:I8 |
| Cenários gerais | System Design!A1:G7 |
| Comparações rápidas | Revisão Rápida!A1:B21 |

O [README proposto do pacote anterior](../README.md), quando adotado, fornece a navegação entre trilhas. Foram conferidos os nomes dos arquivos do pacote; não se presume que esses arquivos já tenham sido publicados no remoto.

Toda proposta nova está identificada como integração, exercício, pergunta ou critério de estudo. Não houve pesquisa externa nem atualização silenciosa das definições técnicas da origem.
