# AWS FSI — Pesquisa de experiência e proposta de redesign
## Identidade Amazon. Leitura confortável. Prática com evidências.

**Data da pesquisa:** 2 de novembro de 2026.  
**Destinatários:** Tomas e Vitória.  
**Status:** proposta para aprovação; nenhuma alteração no repositório, na aplicação, no S3 ou no CloudFront.  
**Base inspecionada:** `alric-corp/aws-solutions-architect-fsi`, branch `main`, commit `39298e79fc762a88cf101b01cf45dbc414b1bcca`.  
**Complemento:** `Proposta_Visual_AWS_FSI.html`, estudo visual navegável e independente da aplicação.

> **Recomendação central:** adotar uma direção editorial, com abertura compacta usando a capa fornecida, e organizar a experiência por tarefas: encontrar → estudar → explicar → praticar → revisar. O leitor deve ser mais importante que o painel inicial. Simulados precisam de uma interface própria, não apenas do mesmo artigo com respostas recolhidas.

## 1. Escopo, evidências e limites

### O que foi realmente verificado

O conector GitHub retornou uma branch, `main`, no commit acima. Examinei a raiz, a árvore de arquivos, a organização de fundamentos, o início da aula 1 da Loja Horizonte, o sumário e a abertura do case de pagamentos/Pix, o índice de Leadership Principles, o simulado de checkout nas versões candidata/instrutor e a matriz de competências. Os materiais têm objetivos, percursos, perguntas, referências e separação de papéis. [R1–R8]

Não localizei o frontend nas evidências acessíveis. A consulta à raiz e a pesquisa na árvore não identificaram `AGENTS.md`; não foi possível ler instruções de frontend que não foram encontradas. Uma busca por outros repositórios relacionados não identificou o aplicativo. Isso **não prova que ele não existe**: pode estar apenas localmente, em outro repositório ou fora do acesso desta conexão.

A URL pública não foi informada nem recuperada. Portanto, não houve auditoria visual do site publicado em desktop/mobile, medição de performance de produção, inspeção de CSS/comportamentos reais ou confirmação do framework/build. A informação de hospedagem em S3 + CloudFront vem do usuário. Não atribuo ao site defeitos que não observei.

A imagem `amazon.jpg` foi localizada: JPEG de **2048 × 1360**, **273.141 bytes**, proporção aproximada **1,506:1**. A arte original foi preservada; uma derivação WebP de demonstração, sem recorte, ficou em **960 × 638 e 21.220 bytes**. Esses tamanhos são medições de arquivos locais, não métricas de carregamento do site.

### Como ler este relatório

- **Confirmado no conteúdo:** observação apoiada em arquivo ou trecho lido.
- **Fonte externa:** informação documentada por uma referência consultada.
- **Proposta:** escolha de design/engenharia para este projeto, ainda não validada com uso real.
- **Pendente:** depende da URL, do frontend, de execução ou de decisão do proprietário.

Os wireframes são propostas, não screenshots do site atual. Os exemplos não representam desempenho, histórico, notas ou proficiência de uma pessoa.

## 2. Diagnóstico: o conteúdo já é melhor que um catálogo de arquivos

| Achado confirmado | Consequência para o redesign | Prioridade |
|---|---|---|
| A entrada atual no README diferencia aprender do zero, consultar e aplicar. | Preservar esses propósitos, mas oferecer ações claras na interface. Não forçar todos a começar pela aula 1. | P0 |
| Fundamentos relacionam assuntos a cases e explicitam o nível de explicação esperado. | Usar essas relações como metadados de pré-requisito, prática e próximo passo, sem duplicar textos. | P0 |
| A aula 1 da Loja Horizonte tem roteiro, requisitos, mecanismos, Mermaid, alternativas e aviso de cenário fictício. | Manter a sequência pedagógica e todos os limites. Dar navegação por seção e espaço ao diagrama. | P0 |
| O case 01 apresenta 23 seções e duas jornadas distintas: cartão e Pix. | Leitura guiada por objetivos e retomada por âncora; manter também a leitura integral. Não misturar estados das jornadas. | P0 |
| As fichas de LPs têm perguntas PT/EN, aprofundamentos e evidências. | Filtros e rodadas de prática são mais úteis que uma parede de 16 cartões equivalentes. | P1 |
| O checkout tem abertura separada, causa, variantes e cartões de evidência para o instrutor. | Separar rotas e apresentação. Não colocar o gabarito no HTML, nos snippets ou no preload da candidata por conveniência. | P0 |
| A matriz de competências exige evidência e separa teoria, laboratório e experiência profissional. | Não converter páginas visitadas em “domínio”, nota de carreira ou chance de aprovação. | P0 |

Fontes: [R1–R8]. As consequências são propostas, não defeitos demonstrados da interface atual.

**Hipóteses para testar no site real:** dificuldade em se orientar em artigos longos, excesso de menus, contraste insuficiente, tabelas que provocam rolagem global, diagramas reduzidos a texto ilegível e mistura de respostas de instrutor na busca. Não há evidência suficiente para afirmar que esses problemas já ocorrem.

**Informações que faltam para fechar a auditoria técnica:** URL, pasta/repositório do frontend, instruções de build e mecanismo atual de publicação. Não são necessários segredos, credenciais ou acesso de escrita à AWS.

## 3. Oito referências, cada uma com um trabalho específico

A inspeção externa foi de páginas públicas e documentação recuperável. Não inclui testes de áreas autenticadas ou pesquisa com usuários desses produtos.

| Referência | Padrão ou evidência consultada | Aplicação proposta | Limite |
|---|---|---|---|
| **Amazon/Koto + Press Center** [S1–S2] | O projeto de identidade publicado em 2025 reorganiza sorriso, tipografia e paleta. | Capa como identidade, laranja disciplinado e linguagem visual coerente. | O case não fornece uma especificação hexadecimal pública completa. Não inferir autorização de marca nem usar guia antigo como regra atual. |
| **Cloudscape** [S3–S5] | Tokens semânticos, hierarquia, regiões recolhíveis e modos visuais. | Um shell previsível, temas equivalentes e cores com função. | Referência de sistema, não obrigação de importar componentes React ou copiar o console. |
| **Microsoft Learn** [S6] | Módulo público com objetivos, pré-requisitos, unidades e avaliação. | Índice da trilha que explica o que será aprendido e por onde seguir. | Estrutura de módulo não prova eficácia de cada interação; não copiar XP/login. |
| **MDN** [S7] | Artigo público com sumário, seções e referências relacionadas. | Leitor com âncoras estáveis e busca por seção. | Não reproduzir a complexidade global de um portal muito maior. |
| **Documentação AWS** [S8] | Títulos descritivos, notas, tabelas e aprofundamentos vinculados. | Preservar requisitos, exceções e fontes em conteúdo técnico. | Uma documentação de consulta não é, sozinha, uma trilha pedagógica. |
| **AWS Skill Builder público** [S9] | Separação explícita entre aprender, praticar, preparar e validar. | Oferecer atividades diferentes, não um único indicador de conclusão. | Não auditadas áreas fechadas; nada de imitar credencial ou certificação oficial. |
| **W3C/WCAG 2.2** [S10–S13] | Critérios de contraste, reflow, foco e tamanho de alvo. | Critérios de aceite verificáveis desde o design. | Ferramenta automática e amostra de telas não equivalem a conformidade integral. |
| **Pesquisa de aprendizagem** [S14–S15] | Experimentos sobre recuperação ativa e espaçamento. | Perguntar antes de revelar, revisitar erros e retestar em outro cenário. | Estudos de vocabulário/fatos não demonstram, diretamente, aprovação em entrevista ou domínio de arquitetura. |

### Duas decisões que a pesquisa mudou

**Identidade atual, sem falsa precisão.** A paleta histórica `#FF9900`/`#232F3E` não deve ser anunciada como um manual universal atual. Nesta proposta, os hexadecimais são tokens autorais compatíveis com a arte enviada. Amazon corporativa, AWS e Cloudscape não são a mesma paleta. Cloudscape usa azul em interações; aproveitar sua organização não exige copiar essa cor. [S1, S3]

**Aprendizagem não é navegação.** Ler, explicar sem consulta e responder a uma variante são eventos distintos. A pesquisa de recuperação ativa justifica testar a recuperação do conhecimento; não justifica uma pontuação automática de prontidão. Revisão deve ser ajustável, sem vender uma sequência fixa de dias como cientificamente ideal para todos. [S14–S15]

## 4. Duas direções visuais; uma recomendada

### A — Editorial Âmbar — recomendada

Uma biblioteca técnica com personalidade. Abertura em duas colunas, texto e ação à esquerda, capa integral à direita. Conteúdo sobre branco suave, fundo externo neutro quente, títulos carvão e laranja em ações e pequenos marcadores. Os índices são listas hierárquicas, não mosaicos intermináveis. O leitor tem uma coluna principal com margens confortáveis.

O tema escuro mantém a mesma hierarquia, com carvão e superfícies discretas. Tema é preferência; não muda a organização nem a dificuldade do conteúdo. No primeiro acesso, “Sistema”; sem preferência detectável, claro. O protótipo abre em claro apenas para permitir a comparação visual.

**Por que escolher:** o acervo exige muita leitura técnica e tem caminhos já definidos. Esta direção organiza sem competir com o texto. Também permite uma área de prática mais funcional sem transformar todo o site em painel.

### B — Mesa de Prática

Abertura menor, shell de trabalho, painel lateral de sessões e área principal dividida entre cenário, evidências e notas. Carvão e laranja têm presença maior; a arte aparece como pequena peça de abertura, preservada. Serve melhor ao papel de instrutor e a sessões frequentes de simulação.

**Trade-off:** mais controles simultâneos e maior risco de sobrecarregar quem só quer ler uma aula. Não recomendo como experiência dominante de todo o site.

**Decisão proposta:** A como base. Incorporar de B apenas a organização funcional do instrutor, usando os mesmos tokens e a mesma navegação global. Não construir dois produtos desconectados.

## 5. Sistema visual proposto

Todos os valores abaixo são escolhas de projeto para validar, não especificações oficiais contemporâneas da Amazon.

| Token / função | Tema claro | Tema escuro |
|---|---|---|
| Fundo externo | `#FAF8F4` | `#15181C` |
| Superfície de leitura | `#FFFFFF` | `#1D2229` |
| Texto principal | `#15181C` | `#F5F7FA` |
| Texto secundário | `#5A626C` | `#B2BAC4` |
| Ação primária | `#FF9900` com texto `#15181C` | Igual |
| Link/foco | `#985000` | `#FFAD33` |
| Creme de identidade | `#FCE4A5`, preferencialmente na abertura | Arte preservada; não tingir toda a interface |
| Sucesso, aviso, erro | Verde, âmbar, vermelho com rótulo/ícone e contraste validado | Versões ajustadas ao fundo escuro |

### Contraste medido nesta pesquisa

Cálculo local com luminância relativa sRGB e fórmula WCAG. Valores arredondados apenas para exibição; não arredondar para aprovar um limiar.

| Par | Razão aproximada | Uso |
|---|---:|---|
| `#FF9900` sobre branco | **2,14:1** | Não usar para texto comum. |
| `#15181C` sobre `#FF9900` | **8,32:1** | Adequado para rótulo do botão principal. |
| `#985000` sobre branco | **6,03:1** | Link textual claro. |
| `#985000` sobre `#FAF8F4` | **5,68:1** | Link sobre fundo externo. |
| `#FFAD33` sobre `#15181C` | **9,56:1** | Link no fundo escuro. |
| `#5A626C` sobre branco | **6,18:1** | Texto secundário, não acinzentado demais. |

WCAG AA exige 4,5:1 para texto comum e 3:1 para texto grande, com exceções definidas. Avaliar também componentes, estados e gráficos. Um botão laranja sobre branco pode precisar de borda contrastante; o bom contraste do rótulo não resolve automaticamente todos os casos de identificação do componente. [S10]

### Tipografia e composição

**Proposta:** `system-ui, -apple-system, "Segoe UI", sans-serif`; código em `ui-monospace, SFMono-Regular, Consolas, monospace`. Não distribuir fontes proprietárias e não depender de downloads externos no P0.

Corpo 18 px/1,65 em desktop e 17–18 px em telas estreitas, ajustável pelo usuário. Metadados 14–15 px; controles 16 px. Coluna de texto em torno de 66–74 caracteres (`ch`), com largura maior apenas para tabelas/diagramas. Esses são pontos de partida, não normas universais.

Espaçamentos: 4, 8, 12, 16, 24, 32 e 48 px. Raios 8 px em controles, 12 px em superfícies e até 16 px na abertura. Uma família de ícones linear, sempre com rótulos nas ações importantes. Sombras apenas em overlays que precisam indicar sobreposição; não em todo bloco.

Estados: hover com mudança discreta; ativo com fundo + marcador + texto; foco contrastante de 2–3 px com afastamento; erro com mensagem específica. Links dentro de parágrafos sublinhados. Não usar apenas cor para comunicar dificuldade, status ou seleção.

## 6. Uso concreto da capa

**Desktop:** área de abertura aproximadamente 300–360 px de altura, conforme conteúdo e viewport. Imagem com 360–460 px de largura, proporção original, ao lado de título, descrição e ação. Nada de texto sobre o logotipo.

**Mobile:** imagem inteira em bloco proporcional, sem `object-fit: cover` que corte o sorriso. Título e ação podem vir antes da arte para não empurrar a tarefa principal para baixo. Ao retornar, “Continuar” deve preceder a abertura; a capa pode ser recolhida por escolha do usuário.

Nas aulas, não repetir a capa. Manter um identificador textual do projeto no cabeçalho e cor de identidade em pontos de navegação. A arte não deve funcionar como logotipo oficial do produto. Exibir aviso curto: **“Preparação independente. Sem vínculo oficial com Amazon ou AWS.”** Isso esclarece a apresentação, mas não substitui a verificação de condições de uso da arte em publicação pública.

**Assets:** reservar dimensões, usar `srcset`/`sizes` após implementação, evitar lazy-loading da imagem que estiver na área inicial e carregar imagens inferiores sob demanda. A variante WebP local de 21.220 bytes demonstra viabilidade de otimização, não é uma meta obrigatória de qualidade para todos os tamanhos.

## 7. Arquitetura da informação: tarefas primeiro

### Navegação global proposta

**Início | Trilhas | Praticar | Revisar | Biblioteca**

Busca, preferências e perfil local ficam no cabeçalho como utilidades. Não duplicar todas as mesmas categorias em três menus.

| Destino | Conteúdo / ação | Origem |
|---|---|---|
| Início | Retomar, escolher um objetivo, iniciar prática | Composição de conteúdo e estado local |
| Trilhas | Loja Horizonte; operações confiáveis; preparação de entrevista | Curadoria dos documentos existentes |
| Praticar | Troubleshooting, System Design, comportamental, inglês | `interview/` e `leadership-principles/` |
| Revisar | Itens sinalizados, retestes, histórico local mínimo | Estado do usuário, não Git público |
| Biblioteca | Fundamentos, cases FSI, LPs, referências e papel de SA | Índices existentes |

Papel de SA e preparação aparecem na trilha de entrevista e na Biblioteca. Referências permanecem junto do assunto e também têm índice próprio. Cases são consultáveis diretamente e reutilizáveis nas trilhas. Uma rota canônica por conteúdo.

### Dois percursos, sem obrigar ninguém

**Guiado:** objetivo → requisitos de entrada → sequência de seções → prática relacionada → registrar dificuldade → reteste.

**Consulta:** busca → seção relevante → explicação completa e fonte → exercício relacionado → retorno à consulta anterior.

O sumário local responde “onde estou nesta página?”. O painel lateral responde “onde estou nesta trilha?”. Não repetir o mesmo conjunto de links nos dois.

### Contrato de conteúdo proposto

Antes de mudar rotas, criar inventário: `id`, `sourcePath`, `type`, `title`, `canonicalUrl`, `existingAnchors`, `audience`, `topics`, `prerequisites`, `practiceLinks`, `reviewedAt`, `contentHash`.

Adicionar metadados em manifestos ou arquivos auxiliares quando isso evitar reescrever todo o Markdown. `audience` separa estudante/instrutor; `visibility` separa público/excluído da publicação. São dimensões distintas.

Percursos podem apontar para seções do mesmo documento. Por exemplo, um percurso de idempotência pode ligar F06 ao case 01, seção `#s08`, e ao simulado de pedido durante falha. A âncora `#s08` já aparece no conteúdo examinado. [R4]

Não gerar uma nova cópia do case para cada trilha, nem renomear todas as âncoras automaticamente. Para mudanças inevitáveis, manter aliases. Fragmentos `#...` não chegam ao servidor: redirecionar apenas o caminho não resolve uma âncora removida.

## 8. Especificação das telas

### 8.1 Início

**Primeiro acesso:** capa compacta, promessa objetiva, “Escolher trilha” e “Explorar biblioteca”. Abaixo, duas ou três entradas por propósito. Sem gráfico fictício, XP, ranking ou porcentagem de prontidão.

**Retorno:** faixa “Continuar de onde parei” com título e seção; ações “Retomar” e “Trocar assunto”. A recomendação seguinte precisa explicar a regra, por exemplo: “Você marcou este assunto para revisar”. Sem IA ou recomendação inexplicável.

**Mobile:** ação principal antes da arte, controles sem depender de hover e navegação recolhível.

### 8.2 Índice de trilha

Objetivo, público, pré-requisitos e sequência vertical. Cada item informa competência trabalhada e relação com o próximo. Estimativa de leitura é rotulada e não inclui automaticamente tempo de exercício. Sem estimativa confiável, não publicar minutos inventados.

Leitura concluída pode ser registrada manualmente, mas não bloqueia a navegação de quem quer consultar. Uma trilha não precisa virar curso obrigatório com cadeados.

### 8.3 Aula longa

Breadcrumbs, título, objetivo, pré-requisitos resumidos, seletor de tamanho e modo foco. Layout desktop: navegação de trilha recolhível, texto central e sumário à direita somente quando houver espaço. Em notebook, recolher primeiro o sumário lateral; em mobile, usar “Nesta página” acima do texto.

Modo foco oculta regiões secundárias, mantendo título, saída acessível e progresso da leitura por seção. Evitar múltiplas áreas de scroll. Salvar localização por `contentId` + âncora, não apenas por pixel; mudanças de conteúdo precisam de fallback.

Código usa bloco com rolagem local e cópia que anuncia sucesso. Tabelas mantêm cabeçalhos, legenda e foco; não virar cartões quando isso destruir comparações. Diagramas têm legenda, descrição, “Ampliar”, “Abrir original” quando aplicável e um enquadramento que não force o texto a ficar microscópico.

### 8.4 Case FSI

Página inicial do case explica problema, escopo, premissas e objetivo. Oferece “Leitura guiada” e “Documento completo”. Não cria resumo que apague limites regulatórios/técnicos.

Na leitura guiada do case 01, manter cartão e Pix distinguíveis. Sugestão de etapas: entender escopo → defender arquitetura → aprofundar falhas → praticar. Esses agrupamentos apontam para as seções originais. Diagramas e tabelas continuam acessíveis fora do modo guiado.

### 8.5 Simulado da candidata

Página limpa, com rótulo “cenário fictício”, abertura, arquitetura, restrições e resultado esperado. Não mostrar causa, lista das evidências ainda ocultas, dicas involuntárias no título da aba, próximos passos do gabarito ou soluções em resultados de busca.

Não forçar campo de resposta escrita: a prática é oral. Um botão opcional de temporização deve permitir pausar/ocultar, sem avaliações automáticas. A candidata encerra com impacto, hipótese sustentada, decisão, riscos e validação.

### 8.6 Instrutor

Cabeçalho explícito “Material do instrutor — contém respostas”. Seletor de cenário/variante antes da sessão; não misturar cartões de variantes. Coluna de evidências com estado “não compartilhado/compartilhado”; área de referência com critérios e perguntas.

Para mostrar uma evidência, abrir uma vista de apresentação **apenas com o cartão selecionado**, em janela ou rota dedicada. Não compartilhar a tela inteira contendo gabarito. No P1, se existir sincronização entre janelas no mesmo navegador, ela é local e não sincronização remota. Após atualizar, a candidata não deve herdar automaticamente o modo instrutor.

As rotas públicas evitam spoilers acidentais; não são autorização. Gabaritos públicos continuam acessíveis a quem navegar deliberadamente. Dados confidenciais ficam fora do build.

### 8.7 Busca

Resultado contém tipo, título, seção, trecho e destino. Filtros iniciais: assunto e tipo. Busca geral não inclui gabaritos; busca do instrutor é separada e explicitamente rotulada. Não registrar consultas em analytics por padrão.

Testar `idempotência`, `idempotencia`, `retry`, `retentativa`, `RTO`, `TLS` e termos em inglês dentro de páginas PT-BR. Siglas e equivalências precisam de vocabulário editorial, não só stemming. Usar trechos que levem à seção exata.

Sem resultados: manter a consulta, oferecer remover filtros e sugerir o índice do assunto. Não recomendar migração de infraestrutura para ter busca.

### 8.8 Revisão e progresso

Não usar um único status linear para tudo. A pessoa pode ter praticado e continuar com dificuldade.

Separar: **leitura** (não iniciada/em estudo/revisada), **necessidade de revisão** (sim/não + próximo teste), **explicação** (com apoio/sem consulta/autodeclarada) e **prática** (histórico por exercício/variante). A matriz de competência mantém sua escala própria, com evidência e natureza da experiência. [R8]

A tela principal mostra primeiro o que foi marcado para revisar e a próxima ação concreta. Favoritos não são revisões. Data de reteste é editável. Sem “90% pronta para L6”.

### 8.9 Leadership Principles

Lista por princípio e por tipo de situação: conflito, falha, entrega, aprendizado e cliente. Pergunta PT/EN sob demanda, com aprofundamentos após a tentativa. Contagem existente de perguntas é informação de catálogo, não meta de desempenho. [R5]

Templates pessoais são usados fora do conteúdo público. Se houver notas locais, a interface alerta sobre o dispositivo e o risco de compartilhar tela/backup. Não criar upload de histórias pessoais no P0.

## 9. Aprendizagem: menor unidade útil, não menor parágrafo

A unidade recomendada é uma competência observável: “explicar como distinguir timeout de falha definitiva”, e não um serviço por cartão. Cada unidade pode oferecer conceito, exemplo, falha, pergunta aberta e prática relacionada.

Fluxo de prática proposto: tentar responder antes de abrir a explicação → comparar com critérios → registrar uma lacuna → estudar o mecanismo → tentar uma variante. Recuperação ativa e revisão espaçada justificam investigar esse padrão; não demonstram que um componente de interface, sozinho, ensina arquitetura. [S14–S15]

Ao retestar, mudar uma condição do cenário sem avisar a causa. A interface do instrutor deve facilitar isso. O projeto já tem variantes no checkout; o redesign não precisa inventar um motor adaptativo. [R7]

Não fazer quiz de múltipla escolha substituir defesa técnica. Não recompensar memorização de serviços ou volume de páginas. O instrutor registra o que foi observado e a ajuda necessária.

## 10. Persistência e privacidade

**P0:** preferências visuais e leitura funcionam sem conta. **P1:** progresso mínimo local com exportação/importação explícita. Escolher `localStorage` para estado pequeno; IndexedDB só se a quantidade de registros justificar.

O armazenamento é ligado à origem e não fornece sincronização entre dispositivos. Mudar de domínio, limpar dados, usar navegador privado ou bloquear persistência pode afetar o estado. Tratar falhas e oferecer uso temporário sem impedir a leitura. [S16–S17]

Perfil local “Estudante A/Instrutor” separa registros por namespace, mas não constitui autenticação ou confidencialidade no mesmo navegador. Dispositivo compartilhado exige cuidado. Evitar conteúdo pessoal sensível no armazenamento simples.

Esquema proposto: `schemaVersion`, `profileId`, `contentId`, `sectionId`, `contentVersion`, `lastVisitedAt`, `reviewFlag`, `nextReviewAt`, `explanationSelfAssessment`, `practiceEvents`. Não armazenar transcrições por padrão.

Exportação inclui versão e data. Importação valida esquema, tamanho e tipos; mostra conflitos, não substitui tudo silenciosamente. Texto importado nunca é executado como HTML. A limpeza remove apenas as chaves do projeto, não todo o armazenamento da origem.

**Publicação:** manifesto explícito de conteúdo permitido. Excluir feedbacks individuais, anexos privados, notas, avaliações e originais confidenciais do HTML, JSON, índices, assets e source maps. Excluir da busca não basta se o arquivo continua público no bucket.

**Agenda:** não pressupor 3 horas por dia útil. Formulário distingue horas totais em dias úteis e horas por dia, com unidade visível e total calculado antes de confirmar. Mesma regra para sábado/domingo. Nenhuma data de entrevista presumida.

## 11. Implementação: preservar a stack até identificá-la

### Decisão condicionada ao frontend

| Situação encontrada | Estratégia proposta |
|---|---|
| Gerador estático já produz HTML de conteúdo | Manter gerador; alterar layouts/tokens e adicionar metadados/busca após build. |
| SPA renderiza Markdown no navegador | Manter inicialmente; avaliar índice de dados ou pré-renderização incremental. Pagefind não indexa conteúdo que só surge após execução no browser por simples varredura do HTML vazio. |
| Frontend em outro repositório ou apenas local | Auditar antes de nomear arquivos definitivos, dependências e integração de rotas. |
| Nenhum frontend recuperável nesta etapa | Entregar contratos de componentes e critérios, não escolher framework no escuro. |

### Busca sem backend novo

**Pagefind é candidato, não decisão fechada.** Ele gera um pacote estático a partir do HTML produzido; permite limitar conteúdo indexado e suporta português. [S18–S20]

Se o projeto já tiver busca adequada, reaproveitar e validar antes de substituir. Se o HTML não contiver o conteúdo no build, avaliar um índice estático compatível com o pipeline atual; não trocar framework para instalar Pagefind.

Manter um índice de estudo e outro de instrutor. Cabeçalhos PT/EN em uma mesma página PT-BR não devem ser perdidos por configuração equivocada de idioma. Não assumir que a biblioteca faz tradução semântica de `retry` para `retentativa`; testar e adicionar aliases editoriais.

### Componentes e arquivos prováveis — nomes propostos, não encontrados

`StudyShell`, `StudyHeader`, `HomeHero`, `TrackOutline`, `ArticleReader`, `ArticleToc`, `StudyCallout`, `CodeBlock`, `DataTable`, `DiagramViewer`, `SearchPanel`, `CandidateScenario`, `InstructorWorkspace`, `ReviewQueue`, `LocalProgressStore`.

Arquivos auxiliares possíveis: `design-tokens.css`, `content-registry`, `learning-paths`, `route-aliases`, `search-policy`, `progress-schema` e testes de navegação. A extensão e a localização dependem da stack.

### Rotas, cache e assets

Inventariar todas as rotas e âncoras antes da migração. Testar acesso direto, refresh e URL inválida. O `DefaultRootObject` do CloudFront não resolve automaticamente `index.html` de cada subdiretório; o comportamento depende do origin e de regras de roteamento. [S21]

Preferir a estratégia já funcional, verificando 404 real e assets. Não recomendar genericamente converter todo 403/404 em 200 com `index.html`, pois isso pode mascarar arquivos inexistentes. Se regras de borda forem necessárias, são proposta para aprovação posterior, não alteração executada.

Conteúdo/HTML/manifesto de busca precisam de atualização coerente; assets com hash podem ter cache longo. Verificar `MinimumTTL`, `DefaultTTL`, `MaximumTTL` e headers em conjunto, sem assumir que apenas mudar `Cache-Control` basta. [S22]

Mermaid deve carregar apenas onde necessário ou ser pré-renderizado quando compatível. SVG deve ser sanitizado conforme a cadeia de publicação. Diagramas Draw.io precisam de representação web legível e link para original; não inversão automática de todas as cores. Código e tabelas preservam conteúdo integral.

### Orçamento técnico inicial — metas para validar

Não há baseline de produção. Proponho estabelecer orçamento após medi-lo. Como orientação inicial: sem download do acervo inteiro na homepage; busca carregada sob demanda; fontes do sistema; imagem responsiva com dimensões; nenhum script de IA/analytics novo; sem biblioteca de diagrama em páginas que não a utilizam.

Métricas de laboratório devem registrar dispositivo, viewport, build, cache e condições. Não prometer nota Lighthouse ou melhoria percentual antes de medir.

## 12. Sequência de entregas

### P0 — núcleo de estudo, não apenas homepage

1. Localizar frontend e URL, inventariar rotas, instruções e baseline.
2. Implementar tokens, tema, cabeçalho, navegação, capa e leitor responsivo.
3. Garantir Markdown, âncoras, tabelas, código e diagramas com leitura integral.
4. Separar candidata/instrutor e validar política de publicação.
5. Dar acesso funcional ao percurso piloto; busca mínima ou catálogo filtrável pode entrar aqui porque encontrar o conteúdo é requisito do percurso, não enfeite.

### P1 — continuidade e prática

Busca por seção e aliases; retomada estável; favoritos separados de revisão; persistência robusta; exportação/importação; ferramenta de evidências do instrutor; estados vazios/erros e testes de teclado.

### P2 — melhorias após observação

Agenda configurável, planejamento de retestes, refinamento de curadoria e recursos de revisão validados em uso. Considerar somente o que resolver problemas observados. Fora do escopo inicial: PWA, colaboração remota em tempo real, tutor de IA, login obrigatório, backend novo e gamificação de prontidão.

### Primeira entrega a aprovar

**Percurso piloto “Operações confiáveis”:** escolher objetivo → abrir fundamento de transações → chegar ao case de pagamentos `#s08` → abrir simulado de pedido durante falha como candidata → registrar necessidade de revisão → retomar a seção.

Esse recorte testa identidade, navegação, leitor, links, prática e continuidade. Depois, aplicar o padrão ao restante do acervo. Não reescrever todo o conteúdo ou trocar framework como pré-condição.

## 13. Plano de validação

Usar Tomas e Vitória como participantes reais, em sessões separadas e depois em dupla. Isso valida o contexto de duas pessoas, não generaliza para todo público. Medir sucesso, erros, ajuda solicitada, passos e comentários; não apenas preferência estética.

| Tarefa | Critério de aceite proposto |
|---|---|
| Retomar última seção | Chega à seção, não apenas ao topo do documento; fallback inteligível se ela mudou. |
| Buscar `idempotência`/`idempotencia` | Resultado relevante com contexto e seção; acesso ao exercício relacionado. |
| Ler aula longa | Mantém orientação e consegue alternar foco/sumário sem perder posição. |
| Entender diagrama no celular | Pode ampliar e ler, sem rolagem horizontal global ou perda de legenda. |
| Conduzir simulado | Compartilha só enunciado/cartão, sem abrir causa ou critérios por acidente. |
| Registrar revisão | Item aparece em Revisar; não é confundido com favorito ou conclusão. |
| Trocar tema/aumentar texto | Controles e conteúdo continuam legíveis; tabela e menu não cobrem foco. |
| Entrar por link direto/refresh | Mantém documento e seção; endereço inexistente tem comportamento definido. |
| Escolher próximo assunto | A pessoa entende a justificativa, não recebe uma recomendação opaca. |
| Usar só teclado | Menu, busca, foco e diálogos têm entrada/saída previsíveis e rótulos. |
| Persistência indisponível | Aviso claro e estudo continua; não há erro silencioso de salvamento. |
| Importar progresso | Pré-visualiza conflitos e rejeita arquivo inválido sem perda do estado anterior. |

**Acessibilidade:** contraste AA; reflow em 320 CSS px; zoom e tamanho de texto; foco visível/não totalmente oculto; navegação por teclado; redução de movimento; targets AA de 24 × 24 CSS px com suas exceções, buscando 44 × 44 nos controles principais como escolha de projeto. [S10–S13]

**Viewports propostos:** 390, 768, 1366 e 1920 px, além de 320 px para reflow. Testar Chrome/Brave e Safari no contexto do usuário. Não declarar Safari testado sem execução.

**Qualidade de conteúdo:** resolver todas as referências internas existentes; preservar avisos de cenário fictício; comparar amostras antes/depois; teste negativo de busca do instrutor; nenhum dado privado no build. Não inferir domínio a partir de scroll.

## 14. O que o demonstrador contém e o que não contém

`Proposta_Visual_AWS_FSI.html` é um arquivo independente preparado para visualização no navegador, sem APIs, conta AWS, analytics ou fontes remotas. Usa uma derivação proporcional da capa fornecida. Mostra início, trilha, leitor, case, candidata, instrutor, busca, revisão e LPs.

Há navegação de amostra, temas, modo foco, ajuste de texto, respostas expansíveis e busca limitada aos exemplos incluídos. Tudo é demonstrativo. Não contém o acervo inteiro, não salva avaliações pessoais, não faz sincronização e não implementa a publicação S3/CloudFront.

Nenhum layout do demonstrador representa uma captura ou correção confirmada do site atual. A validação usou o HTML injetado em uma página isolada do Chromium, porque a navegação por arquivo e HTTP local estava bloqueada por política. Foram verificadas 90 combinações de tela, largura e tema, sem overflow horizontal global; interações demonstrativas também foram exercitadas. Isso não valida carregamento por URL, produção ou WCAG integral. O escopo e as limitações estão em `QA_Proposta_Visual_AWS_FSI.md`.

## 15. Como comparar com a pesquisa do Claude

Não escolher a proposta com mais telas, efeitos ou funcionalidades. Comparar por decisão e evidência.

| Dimensão | Peso sugerido | Pergunta decisiva |
|---|---:|---|
| Leitura técnica | 25% | O texto longo, a tabela e o diagrama realmente ficam utilizáveis? |
| Percurso de estudo | 20% | Consigo encontrar, continuar, praticar e revisar? |
| Simulados e papéis | 15% | Evita spoilers acidentais e respeita a condução oral? |
| Acessibilidade/mobile | 15% | Há critérios e teste, não só afirmação? |
| Preservação técnica e privacidade | 15% | Mantém stack/rotas/conteúdo e exclui dados privados? |
| Identidade visual | 10% | Usa bem a capa e parece consistente, sem copiar uma marca oficial? |

Pesos são uma proposta de comparação. Violações graves de privacidade, perda de conteúdo ou interface inacessível são bloqueadores, mesmo que a nota visual seja alta.

Para cada divergência, registrar: problema, proposta A, proposta B, fonte/evidência, custo, teste necessário e decisão. Ideias compatíveis podem ser combinadas; não é necessário escolher um pacote completo de um único modelo.

---

## Fontes e rastreabilidade

Todas as fontes externas abaixo foram consultadas em **02/11/2026**. Datas originais são mencionadas quando relevantes; leitura de páginas públicas não implica teste do produto completo.

### Repositório — snapshot de referência

Base: https://github.com/alric-corp/aws-solutions-architect-fsi/tree/39298e79fc762a88cf101b01cf45dbc414b1bcca

- **R1:** `README.md` — entradas por objetivo e índice do conteúdo.
- **R2:** `technical-knowledge/01-fundamentals/README.md` — módulos e relação com cases.
- **R3:** `technical-knowledge/02-system-design/ecommerce/01-from-click-to-catalog.md` — amostra inicial, linhas 1–170.
- **R4:** `cases/01-payment-processing-pix.md` — amostra inicial, linhas 1–130; sumário de 23 seções e escopo cartão/Pix.
- **R5:** `leadership-principles/README.md` — perguntas, aprofundamentos, templates e escopo.
- **R6:** `interview/simulations/04-troubleshooting/01-checkout-lento/candidato.md` — arquivo completo.
- **R7:** `interview/simulations/04-troubleshooting/01-checkout-lento/instrutor.md` — amostra inicial, linhas 1–130.
- **R8:** `progress/competencies.md` — template completo.

### Referências externas principais

- **S1 — Koto, Amazon, Global brand transformation, 2025:** https://koto.com/work/amazon/
- **S2 — Amazon Press Center, Logos:** https://press.aboutamazon.com/logos
- **S3 — Cloudscape, Colors:** https://cloudscape.design/foundation/visual-foundation/colors/
- **S4 — Cloudscape, Layout, atualização declarada em 07/03/2025:** https://cloudscape.design/foundation/visual-foundation/layout/
- **S5 — Cloudscape, Visual modes:** https://cloudscape.design/foundation/visual-foundation/visual-modes/
- **S6 — Microsoft Learn, Describe cloud computing:** https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/
- **S7 — MDN, HTTP response status codes:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
- **S8 — AWS RDS, exemplo de documentação técnica:** https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.Failover.html
- **S9 — AWS Skill Builder, página pública:** https://aws.amazon.com/training/digital/
- **S10 — W3C, Contrast (Minimum):** https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- **S11 — W3C, Target Size (Minimum):** https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- **S12 — W3C, Reflow:** https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- **S13 — W3C, Focus Not Obscured (Minimum):** https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- **S14 — Karpicke & Roediger, 2008, resumo do estudo original:** https://pubmed.ncbi.nlm.nih.gov/18276894/ — DOI 10.1126/science.1152408. Não foi feita revisão completa da literatura.
- **S15 — Cepeda et al., 2008, resumo na página do autor:** https://www.yorku.ca/ncepeda/publications/CVRWP2008.html — DOI 10.1111/j.1467-9280.2008.02209.x.

### Apoio técnico

- **S16 — MDN, localStorage:** https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **S17 — MDN, Using the Web Storage API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
- **S18 — Pagefind, Getting started:** https://pagefind.app/docs/
- **S19 — Pagefind, Multilingual search:** https://pagefind.app/docs/multilingual/
- **S20 — Pagefind, Indexing:** https://pagefind.app/docs/indexing/
- **S21 — CloudFront, Default root object:** https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DefaultRootObject.html
- **S22 — CloudFront, Cache expiration:** https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html

### Decisões ainda pendentes

Aprovar direção visual; localizar frontend e URL; verificar condições de uso público da arte; escolher política de armazenamento de notas; decidir quais vistas de instrutor serão publicadas; medir baseline; validar o percurso piloto. Nenhum desses itens foi resolvido por suposição neste relatório.
