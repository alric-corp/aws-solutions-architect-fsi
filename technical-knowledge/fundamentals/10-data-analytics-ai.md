# 10 — Dados, analytics e IA

**Base:** N01/N05 mencionam Big Data, ciclo de vida e HDFS; os cases 06–08 fornecem a camada aplicada. **Complemento:** distinguir finalidades e fontes de verdade.

## Começar pela pergunta de negócio

Um painel de transações, um fechamento contábil, um modelo antifraude e um assistente de texto podem usar parte dos mesmos dados, mas têm contratos de atualidade, qualidade e autorização diferentes.

Mapeie origem, ingestão, transformação, publicação, consumo, retenção e eliminação. O fato de o dado chegar não demonstra completude; a conclusão de um job não prova conciliação financeira.

## HDFS, S3 e catálogo

HDFS organiza arquivos em blocos e separa responsabilidades de metadados e armazenamento entre NameNode e DataNodes. [Fonte T22](../../references/README.md#t22) S3 não se torna HDFS porque guarda os arquivos que uma engine analisa.

Um catálogo descreve recursos e schemas; não deve ser confundido com as linhas armazenadas. A escolha de engine depende da consulta, custo, volume e governança, não do desejo de incluir todo produto de analytics no desenho.

## Governança com limites concretos

Classificação, finalidade, dono, qualidade, autorização e lineage fazem parte da operação. Lake Formation governa acessos integrados, mas permissões diretas inadequadas ao S3 podem contornar esse percurso. [Fonte T18](../../references/README.md#t18)

Pergunte também onde vão resultados, exportações e cópias de BI. Retirar uma permissão na origem não apaga automaticamente o que alguém já extraiu.

## ML e GenAI são jornadas diferentes

Como distinção conceitual de estudo: um modelo preditivo produz uma estimativa utilizada por uma política; um LLM gera conteúdo. Um score não confirma fraude. Uma resposta com referência não comprova que o usuário está autorizado a recebê-la.

Revise no [Case 07](../../cases/07-real-time-fraud-detection.md) as evidências de avaliação e no [Case 06](../../cases/06-genai-financial-advisor.md) as fronteiras de recuperação, geração e divulgação. Os detalhes e referências dos serviços permanecem nesses cases, sem serem revalidados por esta ficha.

## Cenário: analytics de microblogging

Antes de escolher um stream, pergunte: contagem de posts, tópicos em tendência ou alertas? Em qual janela? Com eventos atrasados? Há exigência de apagar dados? Quem consome? Qual volume de leitura e qual retenção?

Proponha uma primeira solução e acrescente streaming ou processamento mais elaborado somente quando responderem aos requisitos. Um painel “ao vivo” não precisa necessariamente do mesmo prazo de uma decisão antifraude antes da autorização.

## Aprofundamentos

“Duas ocorrências representam o mesmo evento?” “A base de treino tinha conhecimento que só chegou depois?” “Hash de CPF é anonimização garantida?” “Quem aprova a definição do número no relatório?”

## Exercício

No [Case 08](../../cases/08-financial-data-lake.md), desenhe um produto financeiro com dono, fonte, qualidade, acesso e data de referência. Explique por que dois públicos podem receber representações diferentes do mesmo conjunto de fatos.
