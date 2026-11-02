# Rubrica didática de troubleshooting

Avalie seis dimensões separadamente. Não some os pontos para definir carreira. Esta rubrica não é uma avaliação oficial da Amazon, não determina L5 ou L6 e não prevê aprovação. Não premie citar serviços ou Leadership Principles sem demonstrar mecanismo e decisão.

## Escala de 0 a 3

- **0 —** Não delimita o problema e propõe ações sem fundamento.
- **1 —** Cita ferramentas e métricas, mas não conecta evidências às hipóteses.
- **2 —** Investiga com estrutura, explica mecanismos e justifica decisões.
- **3 —** Além do diagnóstico, considera riscos, comunicação, validação e prevenção.

## Âncoras por dimensão

| Dimensão | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Impacto e enquadramento | Muda componentes sem entender a reclamação | Pergunta se está fora do ar | Delimita jornada, período, população e referência normal | Prioriza integridade e impacto, combina modo degradado e critério de recuperação |
| Hipóteses e evidências | Afirma causa sem suporte | Lista painéis e ferramentas | Prevê observação, busca evidência e descarta hipóteses | Procura contraevidência, explicita limites e identifica coleta complementar |
| Profundidade técnica | Confunde camadas ou garantias essenciais | Cita nomes sem explicar o mecanismo | Explica a cadeia causal e as fronteiras de garantia | Aplica o mecanismo a outra janela de falha, concorrência ou variante |
| Segurança e mitigação | Propõe ação insegura e não reconhece o risco | Reinicia ou amplia capacidade sem critério | Escolhe contenção proporcional, preserva controles e explica trade-offs | Define autoridade, canário, interrupção e recuperação compatíveis com o estado dos dados |
| Comunicação e responsabilidade operacional | Promete recuperação sem evidência ou abandona acompanhamento | Atualiza só com termos técnicos | Separa fato e hipótese, assume próximos passos e comunica impacto | Ajusta mensagem ao cliente, envolve responsáveis e mantém prazo de atualização sob incerteza |
| Validação e prevenção | Encerra com recurso verde | Olha uma métrica isolada | Testa jornada, integridade e população afetada contra a referência | Monitora recorrência e atraso, define responsável e teste da prevenção |

Uma proposta insegura exige discussão imediata, mas não zera automaticamente as outras dimensões. Registre se houve reconhecimento e correção autônoma ou após ajuda. Marque **não observado** quando faltou oportunidade; zero exige evidência da resposta correspondente.

## Uso no debrief

Peça primeiro a autoavaliação. Para cada nota, registre uma frase ou decisão observável, o cartão disponível naquele momento e a ajuda fornecida. Compare sessões com dificuldade e apoio semelhantes. Se uma variante mudar o mecanismo e a candidata ajustar a hipótese, isso é evidência de transferência; memorizar a solução anterior não é.

Use os critérios específicos de cada `instrutor.md` como sinais dentro destas dimensões, sem exigir caminho, produto ou comando único. Escolha até dois ajustes e uma pergunta nova para testar melhora. Mantenha o [registro preenchido](modelo-registro-sessao.md) em área privada fora do Git.
