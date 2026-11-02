# Guia do instrutor

Conduza uma investigação oral com informações incompletas. Avalie como a candidata conecta observação, hipótese, mecanismo e decisão. Não conte serviços citados nem exija um vocabulário específico.

## Preparação e condução

1. Escolha o caso e uma variante. Leia o estado real, as premissas e todos os cartões de evidência antes de começar. Use o [diagnóstico inicial](diagnostico-inicial.md) para escolher o apoio necessário.
2. Entregue somente a abertura em `candidato.md`; nas aberturas com variantes, leia somente a selecionada. Não entregue este guia, a rubrica detalhada do caso ou o arquivo do instrutor durante a investigação.
3. Peça que a candidata explique o entendimento do problema. Ela pode desenhar, escrever ou pensar em silêncio por um momento. Não trate hesitação como prova de desconhecimento.
4. Libere cartões quando a solicitação corresponder semanticamente ao que eles medem. “Onde o tempo foi gasto?” libera o mesmo trace que “há spans da requisição?”. Não exija nome de métrica, ferramenta ou comando.
5. Uma solicitação ampla pode liberar vários cartões. Se não estiver claro o que ela quer descobrir, peça que explique a hipótese e a observação esperada. Não esconda evidência pertinente para impor uma sequência única.
6. Se pedir algo não previsto, diga: “Essa evidência não está disponível no exercício. Como a coletaríamos, com que permissão, custo e limite?”. Registre a proposta; não invente valores, permissões ou uma segunda causa. Ela pode decidir sob incerteza com limites explícitos.
7. Cartões de recuperação só são liberados depois de uma intervenção coerente e dos critérios que a candidata usaria para avaliá-la. Em uma alternativa válida sem cartão correspondente, discuta a previsão e a coleta; não anuncie sucesso fictício.
8. Interrompa uma proposta insegura para explorar risco e pedir reformulação antes de simular sua execução. Toda execução é narrada: não abrir contas AWS, gerar carga, coletar segredos ou fazer mudanças reais.
9. Encerre com decisão, validação e atualização ao cliente. Faça debrief usando evidências da resposta e no máximo dois ajustes para a próxima rodada.

Registre ajuda oferecida: nenhuma, pergunta neutra, indicação de uma camada ou explicação do conceito. Uma resposta após ensino não equivale a uma investigação independente. Se o tempo acabar, registre “não observado”, sem transformar falta de oportunidade em nota zero.

## Perguntas neutras para usar em todos os casos

- “O que você já sabe e o que ainda é hipótese?”
- “Qual observação descartaria sua hipótese?”
- “Você disse que olharia essa métrica. O que espera encontrar e como isso muda seu próximo passo?”
- “Qual é a intervenção de menor risco?”
- “Como você comprova que a jornada voltou?”
- “O que comunica ao cliente enquanto investiga?”
- “Qual decisão precisa de aprovação ou envolvimento de outra equipe?”
- “O que evita que o problema se repita?”

Não use todas como checklist obrigatório. Escolha as que permitam observar o raciocínio que ainda ficou implícito. Avise no debrief quando o próprio instrutor induziu uma direção.

## Comportamentos e Leadership Principles

As relações abaixo são orientação autoral de treino, apoiada nos [princípios existentes](../../../leadership-principles/README.md). Premie o comportamento demonstrado; citar o nome do princípio não acrescenta pontos.

| Princípio | Comportamento observável na investigação |
|---|---|
| Dive Deep | Segue uma requisição e distingue medição direta, correlação e inferência; procura contraevidência |
| Ownership | Define responsável, escalonamento e acompanhamento até a jornada recuperar; registra pendências |
| Customer Obsession | Mede compras concluídas e impacto por população; considera integridade e confiança do cliente |
| Earn Trust | Comunica fatos, incertezas, riscos e horário da próxima atualização sem prometer o que não sabe |
| Bias for Action | Escolhe contenção proporcional e reversível, com critérios de parada e a autoridade necessária |

Intervir depressa não justifica ampliar acesso indiscriminadamente ou repetir uma cobrança sem conhecer o resultado. Investigar profundamente não exige adiar uma contenção segura até explicar todos os detalhes.

## Fontes e limites

As decisões de treino acima são didáticas. O vínculo entre impacto, autoridade operacional, comunicação e validação é compatível com [AWS Well-Architected — Operate](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/operate.html) e [Responding to events](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/responding-to-events.html), consultados em 01/11/2026. Esses documentos não validam esta rubrica nem o enquadramento de carreira.
