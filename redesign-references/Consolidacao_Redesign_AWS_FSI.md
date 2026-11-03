# Redesign AWS SA FSI — proposta consolidada
## Capa e carvão na identidade; leitura editorial; prática sem spoilers

**Data:** 3 de novembro de 2026.  
**Status:** consolidação para aprovação. Não é uma implementação. Nenhuma alteração no repositório, no site, no S3, no CloudFront ou em DNS foi realizada nesta etapa.  
**Público deste documento:** Tomas e Vitória. Não publicar este briefing de preparação automaticamente no site.

## 1. Decisão central

Combinar o diagnóstico do frontend apresentado pelo Claude com a organização de estudo, o tratamento da capa e os critérios de continuidade da pesquisa anterior do ChatGPT.

**Recomendação:** preservar o gerador estático existente; usar cabeçalho carvão, capa integral na home e leitor com superfície neutra; organizar o site por tarefa; corrigir spoilers imediatamente; separar leitura, revisão, autoavaliação e prática. Não migrar de framework, não reescrever o acervo e não transformar a plataforma em um dashboard de métricas decorativas.

O protótipo anterior do ChatGPT é uma referência de composição e interação. Não deve substituir o frontend: foi feito com conteúdo demonstrativo e não reproduz o build, a CSP ou a persistência reais.

## 2. Base de evidências e o que mudou

### Fontes comparadas

- **C1 — Claude:** `redesign-plataforma-estudo-aws-sa-fsi.md`, atualizado em 02/11/2026. Relata inspeção e build local do commit `603dcf0`, medições em Chromium e auditoria de conteúdo. A produção e a capa não estavam disponíveis nesse ambiente.
- **G1 — ChatGPT:** `Pesquisa_UX_UI_AWS_FSI.md`, de 02/11/2026. Inspeção de conteúdo no commit `39298e79fc762a88cf101b01cf45dbc414b1bcca`, pesquisa externa e proposta visual com a capa real. Não localizou o frontend naquele snapshot.
- **G2 — Demonstrador e QA:** `Proposta_Visual_AWS_FSI.html` e `QA_Proposta_Visual_AWS_FSI.md`. As verificações referem-se exclusivamente à proposta, não à aplicação publicada.
- **R1–R3 — Conferência independente nesta consolidação:** leitura de `package.json`, `site/site.js` e trechos de `scripts/build-site.mjs`, fixados em `603dcf0`.

### Confirmado novamente no código

O projeto declara Node **>=22**, módulos ES, gerador próprio, `markdown-it`, `github-slugger` e Mermaid. Source Sans 3 e Manrope já estão nas dependências. Existem scripts de build, check, preview e teste de navegador. [R1]

A busca utiliza normalização de acentos e correspondência por substring com `includes`. O índice é solicitado ao abrir a busca e baixado por inteiro; não é correto afirmar, a partir desse código, que a home já baixa todo o índice ao carregar. [R2]

O gerador adiciona todos os documentos elegíveis ao índice com o texto integral do Markdown, sem uma filtragem de audiência no ponto de inclusão examinado. O sumário renderizado filtra apenas H2; o registro recente guarda página e título, não seção. [R2–R3]

Essas verificações corroboram mecanismos relatados pelo Claude: correspondências como STAR dentro de palavras maiores, exposição de conteúdo de instrutor na busca e retomada apenas por página. A posição exata de resultados e os números de medições continuam sendo resultados **relatados pelo Claude**, não testes repetidos nesta etapa.

### Resultados que continuam atribuídos ao relatório do Claude

Linhas com cerca de 118 caracteres, 11 pares de texto secundário abaixo de 4,5:1, sumário ausente abaixo de 1020 px, diagramas pequenos no celular, 94 documentos, 111 páginas geradas e 13.996 links verificados são dados do relatório C1. Não foram reproduzidos aqui. Não transformar essas contagens em constantes dos novos testes: documentos-fonte, páginas de saída e links são universos diferentes.

O Markdown C1 aponta para oito imagens em `assets/`, mas esses arquivos não acompanham o material disponível nesta etapa. Portanto, as capturas do Claude não foram reinspecionadas. O diagnóstico textual é aproveitado com atribuição explícita.

A capa está disponível aqui: `amazon.jpg`, **2048 × 1360 pixels, 273.141 bytes**. Sua ausência no ambiente do Claude não é uma pendência deste ambiente. A produção continua sem uma auditoria nova nesta consolidação.

## 3. Matriz das decisões consolidadas

| Assunto | Decisão | Origem e razão |
|---|---|---|
| Stack | Preservar gerador estático, Node, Markdown, Mermaid e hospedagem atual. | Diagnóstico Claude, confirmado em R1–R3. Não há motivo demonstrado para migração. |
| Identidade | Capa e carvão com leitor editorial. | Convergência das propostas: marca na abertura, concentração no conteúdo. |
| Tipografia | Source Sans 3 já hospedada; monoespaçada do sistema para código; retirar Manrope apenas após regressão visual. | Preferir reaproveitamento real à minha sugestão anterior de fonte exclusivamente do sistema. |
| Capa | Integral na home, sem distorção ou texto sobre o logotipo. No retorno, Continuar vem primeiro. | Tratamento da capa real da pesquisa G1. |
| Navegação | Início, Trilhas, Biblioteca, Praticar e Meu estudo. | Cinco entradas de C1; Revisar é a primeira área de Meu estudo, sem sexto menu concorrente. |
| Leitor | Cerca de 68ch, H2/H3 hierárquicos, sumário em todas as larguras, foco e ajuste de texto. | C1 + G1. Ch é referência de largura, não garantia literal de quantidade de caracteres. |
| Busca | Remover spoilers e corrigir correspondência; avaliar troca de motor depois. | Defeito prioritário de C1 e política de G1. Pagefind não é pré-requisito. |
| Progresso | Dimensões independentes e evidências, não cinco opções mutuamente exclusivas. | Modelo G1 evita perder a informação de que alguém praticou e ainda precisa revisar. |
| Instrutor | Roteiro privado na sessão e janela que recebe somente a evidência selecionada. | C1 + G1, sem alegar autenticação ou sincronização entre computadores. |
| Privacidade | Lista explícita de publicação permitida; dados pessoais fora de todos os artefatos públicos. | Política G1 reforçada pelo diagnóstico C1. |
| Primeira entrega | Leitor e busca corrigidos, com um percurso piloto completo; depois expansão. | Combina a prioridade do leitor de C1 com a validação de jornada de G1. |
| Testes | Regressão do build real, testes com conteúdo completo e tarefas de Tomas/Vitória. | Resultados do demonstrador não substituem teste do produto. |

## 4. Identidade visual final proposta

### Composição e nome

Manter inicialmente o nome existente **Arquitetura em prática**, com subtítulo de preparação para Solutions Architect FSI. Não trocar automaticamente para o nome provisório “Estúdio FSI” do demonstrador, nem usar o logotipo Amazon como a marca própria do produto.

Cabeçalho carvão discreto; conteúdo com hierarquia editorial; laranja concentrado em ação principal e localização. Não obrigar a cor laranja em todo progresso: “Preciso revisar” e “Praticado” têm significados diferentes e sempre precisam de texto.

No desktop, texto e ações ficam ao lado da capa proporcional. No celular e em visitas de retorno, a tarefa prioritária vem antes da imagem. Não impor simultaneamente uma capa grande e todos os controles “acima da dobra” em qualquer tela; texto ampliado e orientação têm prioridade sobre altura fixa.

### Tokens unificados, autorais

Não apresentar estes valores como manual oficial vigente da Amazon. São escolhas deste projeto compatíveis com a arte, sujeitas à inspeção visual da aplicação real.

| Token/função | Claro | Escuro |
|---|---|---|
| Fundo da página | `#FAF8F5` | `#141210` |
| Superfície de leitura | `#FFFFFF` | `#1C1A17` |
| Cabeçalho | `#1C1A17` | `#0F0E0C` |
| Texto principal | `#1F1C19` | `#EEE8E0` |
| Texto secundário | `#5B544D` | `#B9B0A5` |
| Ação primária | `#FF9900`, texto `#1F1C19` | Igual |
| Link textual | `#8F4300`, sublinhado | `#FFB866`, sublinhado |
| Foco sobre superfície clara | `#1F1C19` | Não aplicável |
| Foco sobre superfície escura | `#FFC47A` | `#FFC47A` |

O foco precisa de token contextual: um anel escuro adequado ao leitor claro pode desaparecer sobre o cabeçalho carvão.

Cálculos locais de luminância sRGB, executados nesta consolidação: texto `#1F1C19` sobre `#FF9900`: **7,92:1**; secundário claro sobre branco: **7,45:1**; secundário escuro sobre a superfície escura: **8,12:1**; link claro sobre branco: **7,07:1**; link escuro sobre superfície escura: **10,17:1**. Laranja `#FF9900` sobre branco: **2,14:1**, portanto não utilizar como texto comum nesse fundo. São pares isolados, não aprovação de todos os componentes.

Definir bordas de campos, estados de seleção, alertas e cores de diagramas por função. Centralizar as cores da interface em tokens, mas não reescrever cores internas de imagens, diagramas exportados, ícones de serviço e bibliotecas apenas para satisfazer uma regra textual de “zero hexadecimal fora de tokens.css”. Revisar essas exceções separadamente.

### Tipografia e leitura

Source Sans 3 como família da interface e do texto. Corpo inicial de `1.125rem`, entrelinha 1,65; interface próxima de `1rem`; metadados próximos de `0.875rem`. Ajuste de tamanho independente do zoom do navegador. Tamanhos são decisões de produto, não requisitos numéricos da WCAG.

Texto em torno de 68ch. Tabelas e diagramas podem ocupar uma faixa maior, preservando cabeçalhos, legendas e relacionamento entre dados. A coluna fixa de tabelas é opcional: não a aplicar quando ela consome quase toda a largura do celular ou encobre colunas importantes.

### Temas e imagem

Recomendo **Sistema** no primeiro acesso, fallback claro quando não houver preferência detectável, e opções Claro/Escuro/Sistema persistidas. O tema claro continua sendo a referência editorial de desenho, sem sobrepor a escolha do sistema.

Inicialização do tema por arquivo próprio compatível com a CSP atual. Mermaid deve manter uma fonte de texto reutilizável para rerenderizar com segurança e sem perder o estado da leitura. Diagramas SVG exportados podem manter superfície própria clara; não aplicar inversão global.

Reutilizar o original da capa. Gerar apenas os tamanhos que atendem aos espaços reais; não exigir quatro resoluções em três formatos se uma combinação menor atingir qualidade e entrega adequadas. Reservar dimensões, sem filtros, distorção ou recorte do logotipo. A prioridade de carregamento depende de a imagem realmente estar na área inicial da home.

A capa permanece na proposta solicitada. O aviso de independência deve existir, mas não é autorização para publicar marcas. As condições do uso público da arte precisam de verificação separada; as diretrizes da AWS não são, sozinhas, uma licença para o logotipo corporativo Amazon. [W6]

## 5. Arquitetura da informação e leitor

### Navegação global

**Início → Trilhas → Biblioteca → Praticar → Meu estudo**

A ordem é de navegação, não uma obrigação linear. Busca e preferências são utilidades. Meu estudo abre pela fila de revisão e inclui favoritos, retomada, histórico de prática e preferências.

A lateral mostra a trilha ou área em uso, não o acervo inteiro. O sumário mostra seções do documento. Breadcrumb mostra localização estrutural, e a seção atual pode aparecer em uma indicação separada para não tornar o breadcrumb excessivamente longo.

### Manifesto de conteúdo

Usar um registro único, em extensão compatível com o gerador, com:

`id`, `sourcePath`, `canonicalUrl`, `type`, `audience`, `publication`, `existingAnchors`, `topics`, `tracks`, `prerequisites`, `relatedPractice`, `contentVersion` e metadados de revisão quando existentes.

`audience=instrutor` não significa `publication=private`. Audiência, permissão de publicação e presença no índice são dimensões diferentes. Metadados podem ficar fora do Markdown para preservar a leitura no GitHub.

Curadoria de trilhas deve explicar por que cada item vem depois. Não tornar “ler F00–F12 inteiro” pré-requisito obrigatório para todos os módulos. Não gerar minutos de simulado a partir de contagem de palavras; o tempo calculado pelo gerador atual é apenas estimativa de leitura.

### Conteúdo e rotas

Preservar Markdown, `.html`, âncoras, notas, exceções, código, Mermaid, SVG e detalhes recolhíveis. A nova apresentação não autoriza mudar fatos técnicos.

Usar inicialmente endereços explícitos como `/trilhas/index.html` para novas páginas, seguindo o contrato estático existente. Só adotar URLs sem o nome de arquivo quando o comportamento real de distribuição for confirmado. Nenhuma mudança de CloudFront está autorizada.

Agrupar H2/H3 em blocos editoriais nos cases com mapeamento explícito. Não depender só de números de seção: C1 e G1 usam snapshots diferentes, e o acervo muda. Manter sumário completo como fallback. Não esconder conteúdo simplesmente porque o gerador não reconheceu um padrão.

### Retomada

Salvar `contentId`, âncora e versão; deslocamento dentro da seção é auxiliar. Na ausência de âncora antiga, oferecer fallback claro. Um link direto com fragmento escolhido pela pessoa tem prioridade sobre posição salva. Não fazer a página saltar para o histórico depois que um diagrama terminou de carregar.

Leitura recente de instrutor fica separada da recente de estudante. Abrir um gabarito durante a preparação do Tomas não deve fazê-lo aparecer no botão Continuar da candidata.

## 6. Busca: separar correção obrigatória de troca de tecnologia

### P0 — preservar o motor e corrigir a experiência

1. Excluir material de instrutor e corpos identificados como respostas do índice padrão durante o build.
2. Preservar títulos das perguntas e conteúdo público explicativo, com destino para a seção correta.
3. Corrigir correspondências por substring: STAR não deve encontrar uma página apenas pela palavra “estar”. Tratar palavras, siglas e termos técnicos com testes.
4. Preservar normalização de acentos, já existente.
5. Não anunciar essa etapa como uma nova busca semântica.

Não remover indiscriminadamente todos os elementos `<details>`: alguns podem ser explicações públicas legítimas. A classificação deve se apoiar no conteúdo estruturado e em regras explícitas. Para blocos mistos, indexar a pergunta, não o corpo da resposta. Garantir também que títulos, descrições e metadados não revelem a solução.

A exclusão da busca evita spoilers; não impede acesso deliberado a gabaritos públicos. Material pessoal deve ser excluído do pacote público inteiro, não só do índice.

### P1 — testar Pagefind contra a alternativa mínima

Manter Pagefind como candidato. Comparar relevância, entrega por seção, tamanho transferido, comportamento em português/inglês, custo de manutenção e CSP com o índice próprio corrigido. [W1–W2]

A documentação atual registra uma necessidade de permitir WebAssembly em CSP restritiva. Workers são configuráveis, inclusive com `noWorker: true`; portanto, `worker-src 'self' blob:` não é uma obrigação universal da integração. Não liberar `unsafe-inline` ou `unsafe-eval` por conveniência. Qualquer mudança de CSP precisa de avaliação e autorização separadas. [W1]

Consultas de regressão: `STAR`, `idempotência`, `idempotencia`, `retry`, `retentativa`, `TLS`, `RTO`, `Multi-AZ` e `checkout lento`. Medir resultados com o acervo atual, sem prometer a mesma contagem entre versões.

## 7. Meu estudo: progresso sem falsa equivalência

Não usar “Não iniciado / Em estudo / Preciso revisar / Consigo explicar / Praticado” como um único campo. Os estados se sobrepõem.

Modelo conceitual mínimo:

| Dimensão | Exemplos de informação |
|---|---|
| Leitura | Estado, seção visitada, marcação manual de leitura |
| Revisão | Sinalizado, motivo breve não sensível, data opcional |
| Explicação | Autoavaliação com ou sem consulta, data |
| Prática | Exercício, variante, data e observação mínima |
| Favorito | Página ou seção salva para acesso |

Exemplo de resumo na interface: **“Leitura marcada · praticado em 03/11 · precisa revisar”**. Essa data é ilustrativa, não histórico da Vitória.

A matriz geral de competências e a rubrica de troubleshooting mantêm suas escalas próprias. Não somar seus números nem convertê-los em chance de aprovação ou nível L5/L6.

### Migrar dados antigos sem inventar nem apagar evidência

O campo antigo “lido” continua sendo um registro de leitura. Preservá-lo com origem `legacy`; ele não vira domínio, mas também não precisa ser rebaixado silenciosamente para “em estudo”. Se não existe data, não fabricar uma.

Importação deve validar schema, tamanho, tipos e IDs, mostrar conflitos e permitir escolha. Não usar simplesmente “o timestamp mais recente vence”: relógios e perfis podem divergir. Texto importado não deve ser executado como HTML. Fazer cópia exportável antes de substituir registros.

### Persistência e limitações

Preferências e progresso mínimo podem ser locais. Perfis separam registros, não autorizam acesso. Não persistir transcrições, pareceres de recrutamento, gabaritos privados ou histórias sensíveis por padrão.

Exportação é parte importante da confiabilidade, pois armazenamento do navegador pode ser limpo ou removido. A regra histórica de ITP fala em sete dias de **uso do Safari sem interação no site**, não um prazo universal de sete dias corridos; a política de remoção também depende de outras condições. Evitar uma promessa de duração garantida. [W4–W5]

Sem armazenamento disponível, continuar permitindo estudo e informar que a sessão é temporária. Sincronização remota fica fora deste escopo; não prometê-la por existir um perfil local.

## 8. Prática, instrutor e Leadership Principles

### Candidata

Abertura, arquitetura conhecida, restrições, objetivo e entrega. Nada de causa no título, próximo item, breadcrumb, resumo de busca ou carregamento antecipado de gabarito. Não forçar respostas digitadas para prática oral.

### Instrutor

Selecionar cenário e variante; consultar roteiro, perguntas neutras, evidências, critérios, riscos e debrief. O conteúdo existe: a interface deve facilitar sua condução, não inventar respostas ou evidências.

Criar janela/rota de apresentação com **apenas o cartão escolhido**. Compartilhar essa janela, não toda a tela. Limpar ao reiniciar, não restaurar o último cartão automaticamente após uma sessão diferente.

Uma comunicação local entre janelas pode usar BroadcastChannel. Ela fica limitada à mesma origem e partição de armazenamento; não conecta os computadores de Tomas e Vitória. [W3] Usar identificador de sessão para impedir mistura entre duas sessões locais, validar mensagens e nunca enviar o documento completo do instrutor à janela de apresentação.

A extração de cartões precisa de validação por cenário, e não somente regex para B1–B5/V1–V2. Se um cartão ou variante não for reconhecido, apresentar o material original ao instrutor e impedir uma liberação incompleta; não omitir evidência silenciosamente.

### LPs e inglês

Preservar português/inglês, perguntas abertas, aprofundamentos e exemplos claramente fictícios. Pergunta primeiro; critérios e resposta depois da tentativa. Templates públicos continuam em branco. Notas pessoais são uma expansão opcional posterior, não requisito de navegação.

Recomendo título neutro na página pública de inglês. A mudança de título não deve quebrar o endereço existente.

## 9. Descoberta pública, marca e segurança

Há três decisões distintas: material publicável, indexação por buscadores e acesso autorizado. Não confundir nenhuma delas.

Para um portal pessoal sem objetivo de SEO, recomendo avaliar `noindex` como política de publicação, mas **não aplicá-lo sem decisão do proprietário**. Gabaritos podem ter política separada. O Google precisa conseguir acessar a página para ler `noindex`; bloquear simultaneamente o rastreamento em `robots.txt` pode impedir essa leitura. Nenhum mecanismo equivale a autenticação. [W7]

Remover nomes de títulos e não indexar o site reduz exposição, mas não apaga conteúdo já público no GitHub nem torna confidencial o bucket. A lista permitida de publicação e uma revisão de `dist/` continuam necessárias.

A capa foi solicitada e permanece no desenho. Não substituí-la ou recortá-la sem pedido. Antes de publicação pública, verificar condições aplicáveis ao uso de marca e arte; um aviso de independência não é uma licença. [W6]

## 10. Plano de execução consolidado

### P0.0 — linha de base e contratos

Ler instruções do repositório, fixar o commit real de trabalho e preservar mudanças existentes. Gerar inventário de fontes, páginas, rotas e âncoras; executar os testes disponíveis; capturar amostras reais. Não usar números de C1 como resultados do novo checkout.

Registrar fronteiras: sem troca de framework; sem nova conta, backend, SSR, analytics ou IA; sem mudança de infraestrutura; sem commit/push/deploy.

### P0.1 — corrigir o estudo

Tokens, Source Sans 3, claro/escuro/sistema, texto ajustável, foco, contraste, leitor com largura adequada, sumário H2/H3 em todos os tamanhos, breadcrumbs, navegação contextual, cópia de código, tabelas e diagramas ampliáveis. Retomada por seção. Busca sem gabaritos e sem correspondência STAR/estar.

O template é compartilhado, então as mudanças precisam passar por regressão no acervo inteiro. O piloto define aceitação da jornada, não autorização para quebrar outras páginas.

### P0.2 — incorporar a identidade e validar o percurso

Home com capa real, ação principal antes da arte em mobile, Continuar em primeiro lugar no retorno e as cinco entradas globais. Manifesto mínimo suficiente para o piloto; curadoria completa pode vir depois.

**Percurso piloto:** Início → tema de transações/idempotência → fundamento F06 → seção correspondente do case de pagamentos → simulado de pedido durante falha como candidata → retornar à seção estudada.

A fila completa de revisão é P1. Se a marcação mínima “Preciso revisar” entrar no P0, deve ser explicitamente incluída no escopo e testada; não fingir que já existe uma área completa para fechar o percurso.

### P1 — continuidade, busca e condução

Meu estudo multidimensional, perfis locais, exportação/importação, favoritos, revisão; busca por seção e aliases; decisão fundamentada sobre Pagefind; manifesto completo; console do instrutor e janela de apresentação; assets versionados por hash.

Cache exige entrega coerente: não apagar assets ainda referenciados por HTML em cache durante um deploy. Uma simples sequência de dois `sync` não resolve, por si só, consistência entre versões. Planejar publicação e reversão separadamente; não executar nesta etapa.

### P2 — após uso real

Planejador semanal, retestes configuráveis, refinamento de curadoria, busca específica de instrutor, notas opcionais e pré-renderização de diagramas se houver benefício medido. Sem ranking, pontos de carreira, tutor de IA ou sincronização remota por padrão.

## 11. Critérios de aceite consolidados

| Área | Critério |
|---|---|
| Conteúdo | Fontes e âncoras preservadas; nenhum resumo substitui explicação técnica; nenhum conteúdo de pessoa entra no build público. |
| Navegação | Lateral contextual; sumário em mobile e desktop; link direto e refresh mantêm destino; 404 não é mascarado como sucesso. |
| Leitura | Texto confortável e ajustável; rolagem global horizontal ausente nas amostras; tabelas/diagramas têm tratamento local. |
| Diagramas | Ampliar, ajustar, fechar por teclado e retornar foco; alternativa de texto/original quando aplicável; tema não destrói os rótulos. |
| Busca | Instrutor e respostas não aparecem no índice padrão; perguntas continuam localizáveis; acentos funcionam; STAR não corresponde só a estar. |
| Retomada | Seção estável, prioridade para fragmento explícito e histórico separado por audiência. |
| Aprendizagem | Leitura, revisão e prática coexistem; nada de domínio automático por scroll; origem das avaliações identificada. |
| Persistência | Falhas visíveis e uso temporário; migração não perde lidos antigos; importação é validada e reversível. |
| Acessibilidade | Teclado, foco, reflow, labels, semântica, contraste, texto ampliado e movimento reduzido; revisão manual além de automação. |
| Engenharia | Build/check/testes reais; CSP preservada; nenhum novo serviço pago; testes existentes não removidos só para deixar tudo verde. |

Validar 320, 390, aproximadamente 820, 1440 e 1920 CSS px, temas claro e escuro, zoom e texto ampliado. Reflow e visualização de diagramas bidimensionais não são a mesma coisa. 44 px nos controles principais é uma meta de produto; AA tem requisito de 24 px com exceções. Anel de foco de 3 px é escolha de projeto; o critério específico de aparência do foco é AAA. Não declarar conformidade global por esses dois testes. [W8–W9]

Os mesmos testes de tarefa devem ser feitos antes/depois por Tomas e Vitória: retomar, buscar, orientar-se no case, ampliar diagrama, apresentar cartão, sinalizar revisão, alterar tema/texto e explicar o próximo passo. Registrar sucesso, ajuda, erros e comentários; qualquer meta de tempo é hipótese até teste.

## 12. Recomendações fechadas e decisões pendentes

**Direção recomendada:** Capa e carvão com leitura editorial; Source Sans 3; cinco entradas; leitor e spoilers como primeira prioridade; progresso multidimensional; preservar stack e URLs; Pagefind apenas depois de comparação.

**Pendências do proprietário:** aprovação para implementar P0; confirmação das condições de uso público da capa; política de indexação pública. Nenhum desses pontos autoriza deploy automaticamente.

O nome, perfis, tempo semanal e data de entrevista não precisam bloquear o leitor: preservar nome atual, oferecer perfis configuráveis depois e deixar agenda em branco até configuração explícita.

## 13. Fontes e rastreabilidade

### Arquivos recebidos

- **C1:** `redesign-plataforma-estudo-aws-sa-fsi.md`: método L17–39; diagnóstico L43–82; direção L108–127; arquitetura L129–172; visual L174–273; progresso L355–375; implementação L377–450; validação L464–539.
- **G1:** `Pesquisa_UX_UI_AWS_FSI.md`: §§ 4–10, 11–15; decisões de leitor, progresso, publicação, piloto e limites.
- **G2:** `QA_Proposta_Visual_AWS_FSI.md`: limites do HTML demonstrativo e testes isolados.

### Código consultado em 03/11/2026 — commit fixo 603dcf0

- **R1:** https://github.com/alric-corp/aws-solutions-architect-fsi/blob/603dcf0/package.json
- **R2:** https://github.com/alric-corp/aws-solutions-architect-fsi/blob/603dcf0/site/site.js
- **R3:** https://github.com/alric-corp/aws-solutions-architect-fsi/blob/603dcf0/scripts/build-site.mjs — trechos lidos: linhas 1–220 por janelas, especialmente 134–205.

### Conferências técnicas externas em 03/11/2026

- **W1 — Pagefind, hosting, CSP e workers:** https://pagefind.app/docs/hosting/
- **W2 — Pagefind, indexação e exclusões:** https://pagefind.app/docs/indexing/
- **W3 — MDN, Broadcast Channel:** https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
- **W4 — WebKit, política de armazenamento:** https://webkit.org/blog/14403/updates-to-storage-policy/
- **W5 — WebKit, explicação de ITP e sete dias, 2020:** https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- **W6 — AWS Trademark Guidelines, atualização exibida 17/07/2026:** https://aws.amazon.com/trademark-guidelines/ — escopo AWS; não presumir licença para arte Amazon.
- **W7 — Google Search Central, noindex:** https://developers.google.com/search/docs/crawling-indexing/block-indexing
- **W8 — W3C, tamanho mínimo de alvo, AA:** https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- **W9 — W3C, aparência do foco, AAA:** https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html

A página de diretrizes Amazon citada por C1 não pôde ser recuperada nesta conferência. Não a tratei como autorização nem emiti conclusão jurídica. Não houve nova execução de build ou auditoria visual da produção nesta etapa.
