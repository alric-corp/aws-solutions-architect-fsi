# P0 local — entrega para revisão

Implementação feita a partir de `603dcf03bf9db74e89931a9b703c5c4234509b0a`, usando `redesign-references/Consolidacao_Redesign_AWS_FSI.md` como especificação principal e o prompt do pacote para delimitar o P0. Os arquivos de referência e a capa recebidos foram preservados. Trabalho local, sem commit, staging, push, PR, deploy, consulta de credenciais ou execução de comandos AWS.

## Abrir a prévia

O servidor local está em **http://127.0.0.1:4173**. Para iniciá-lo novamente, na raiz do projeto:

```bash
npm run build
npm run preview
```

O build gera somente `dist/`. Nenhum comando de publicação é necessário para revisar. Os documentos desta entrega e os briefings não são incluídos no site ou na busca.

## O que foi implementado

- Identidade capa e carvão com a imagem original inteira, proporcional, exclusiva da home; ação antes da capa no celular e Continuar antes da apresentação em visitas de retorno.
- Source Sans 3, tokens claros/escuros, preferência Sistema no primeiro acesso, inicialização por arquivo externo compatível com a CSP existente. Manrope deixou de ser servido pelo frontend; sua dependência instalada foi preservada, sem inclusão no artefato.
- Cinco entradas globais: Início, Trilhas, Biblioteca, Praticar e Meu estudo, com rotas explícitas `.html`.
- Leitor editorial de aproximadamente 68ch, fonte inicial 18px/1,65, sumário hierárquico H2/H3 em todas as larguras, lateral contextual, modo foco com saída, ajuste de texto e cópia de links e código com feedback acessível.
- Tabelas rotuladas com rolagem local, sem coluna fixa que encubra dados. Mermaid e SVG ampliáveis com ajuste, zoom, Esc e retorno de foco; definição Mermaid preservada para recuperação e troca de tema. As imagens SVG existentes mantêm suas próprias cores.
- Manifesto com ID, caminho, URL, tipo, audiência, publicação, busca, âncoras, versão e vínculos mínimos do percurso. Contratos por case conferem títulos antes de oferecer os agrupamentos editoriais; o sumário completo permanece disponível.
- Busca filtrada durante o build: roteiros do instrutor fora do índice de estudante; corpos de respostas classificados e excluídos; perguntas e detalhes explicativos preservados. Resultados apontam para seções existentes. Termos completos, acentos e siglas; STAR não corresponde a estar. A flexão retentativa/retentativas é tratada explicitamente, sem adicionar outro motor de busca.
- Retomada por contentId, âncora e versão, com prioridade para fragmentos explícitos, fallback informado e histórico de instrutor separado. Registros antigos de leitura migrados com origem legacy, sem inventar datas. Falha de armazenamento informa o uso temporário; falha de catálogo impede sobrescrever registros existentes.
- Meu estudo apresenta retomada e leituras marcadas. Não há equivalência entre leitura e domínio, nem controles fictícios de revisão ou exportação.
- Percurso piloto completo: Início → tema de transações/idempotência → F06 na seção correspondente → case de pagamentos na seção s08 → simulado de pedido durante falha do banco como candidata → retorno à seção do F06.
- O texto apresentado da aula de inglês foi neutralizado para retirar a referência nominal, mantendo o Markdown original e todos os IDs anteriores para compatibilidade de links.

Gabaritos publicáveis continuam acessíveis por escolha explícita em Praticar. A exclusão da busca não equivale a autenticação. A candidata não recebe atalhos ao roteiro do instrutor em sua lateral, breadcrumb ou paginação.

## Arquivos da implementação

| Arquivo | Alteração |
|---|---|
| `scripts/build-site.mjs` | Integra templates, política, manifesto, índice por seção e capa; preserva o gerador e os slugs existentes. |
| `site/templates.mjs` | Layout compartilhado, leitor, navegação, hubs e percurso piloto. |
| `site/content-policy.mjs` | Audiência, publicação e busca independentes; classificação de respostas e contratos de seções dos cases. |
| `site/site.css` | Tokens, tipografia, temas, leitor responsivo e estilos das interações. |
| `site/site.js` | Preferências, navegação, cópia, diagramas, registros e retomada. |
| `site/theme-init.js` | Aplica o tema antes da folha de estilo sem script inline. |
| `site/search.mjs` | Normalização e correspondência por termos, compartilhadas pelos testes. |
| `site/favicon.svg` | Cores alinhadas à identidade do projeto. |
| `scripts/check-site.mjs` | Rotas/âncoras, política, fixtures negativas, privacidade do artefato e contrato de infraestrutura. |
| `scripts/check-browser.mjs` | Regressão de todo o acervo e tarefas do P0. |
| `site/P0-LOCAL.md` | Este relatório local de implementação e revisão. |

Os Markdown de estudo não foram modificados. `amazon.jpg` é a entrada fornecida pelo proprietário. `redesign-references/` permanece como material de trabalho, fora do pacote público.

## Verificação executada

```bash
npm run build
npm run check
npm run test:browser
```

Todos passaram. Também passaram `node --check` dos módulos alterados e `git diff --check`.

| Universo medido | Antes | Depois |
|---|---:|---:|
| Fontes Markdown | 94 | 94 |
| Rotas HTML | 111 | 116 |
| IDs anteriores globais e de conteúdo preservados | 3.625 inventariados | Nenhuma perda |
| Fontes elegíveis para busca | 94 sem filtro | 83 de estudante |
| Entradas do índice | 94 páginas integrais | 2.355 trechos por seção, sem gabaritos |

`npm run check` conferiu **7.190 referências internas** no novo artefato. As contagens de páginas, fontes e trechos são universos distintos. As cinco rotas acrescentadas são Trilhas, Biblioteca, Praticar, Meu estudo e o tema piloto.

A regressão em **Chromium 153.0.8010.12** visitou os 94 documentos e renderizou **89 diagramas Mermaid em 20 páginas**. Verificou as larguras **320, 390, 820, 1440 e 1920 CSS px**, temas claro/escuro/sistema, texto ampliado, reflow com fonte raiz em 200%, teclado e foco, cópia, ampliação de Mermaid/SVG, percurso piloto, prioridade do hash, refresh, retomada com versão alterada/âncora ausente, leitura legacy e armazenamento bloqueado. Conteúdo, links e sumário foram conferidos sem JavaScript. Uma rota inexistente retorna 404.

As consultas STAR, idempotência/idempotencia, retry, retentativa/retentativas, TLS, RTO, Multi-AZ e checkout lento tiveram resultados. Os testes incluem um falso positivo sintético para estar e sentinelas de respostas/instrutor que devem estar ausentes do índice. Não houve erros de console, CSP ou rede no ensaio final.

Foram medidos os pares de contraste dos tokens de texto principal, secundário, links, cabeçalho e ação; os números estão no JSON de resultados. Esses pares isolados não demonstram conformidade WCAG integral.

O SHA-256 da capa original e do asset distribuído coincide: `f27b0347e682ff17a8fd35806ad9c44644bb3b37c292efc0a08795a54c531754`; ambos têm 273.141 bytes. Não houve recorte, recriação do logotipo ou alteração do original.

## Capturas e evidências reais

Todos os caminhos abaixo são locais, relativos à raiz do projeto:

| Amostra | Antes | Depois |
|---|---|---|
| Home desktop | `.site/p0/before/home.png` | `.site/p0/after/home.png` |
| Home celular | `.site/p0/before/home-mobile.png` | `.site/p0/after/home-390.png` |
| Leitor F06 | `.site/p0/before/reader-f06.png` | `.site/p0/after/reader-f06.png` |
| Case de pagamentos | `.site/p0/before/case-payments.png` | `.site/p0/after/case-payments.png` |
| Busca STAR | `.site/p0/before/search-star.png` | `.site/p0/after/search-star.png` |
| Simulado candidata | `.site/p0/before/candidate.png` | `.site/p0/after/candidate.png` |

Há ainda capturas do leitor nos cinco tamanhos e dois temas, de texto ampliado e do diálogo em `.site/p0/after/diagram-expanded.png`. São seis capturas anteriores e vinte posteriores. O inventário e os resultados estruturados ficam em `.site/p0/baseline.json` e `.site/p0/browser-results.json`.

## Limites e decisões posteriores

- A execução foi local em Chromium. Safari e Firefox não foram executados; não foi declarada conformidade WCAG integral, ganho de performance ou eficácia pedagógica. A revisão por Tomas e Vitória continua necessária.
- Perfis, revisão multidimensional, importação/exportação, favoritos, console do instrutor, apresentação entre janelas e troca do motor de busca permanecem fora deste P0.
- A infraestrutura, os scripts de publicação, a CSP e `robots.txt` conservaram seus contratos. Os testes comparam os hashes do baseline. Nenhum recurso AWS foi alterado.
- Proposta para uma decisão posterior sobre indexação: se desejado, avaliar `noindex,follow` por página, incluindo política própria para gabaritos, mantendo o rastreamento necessário para ler essa indicação. Nada foi aplicado; desindexação não controla acesso.
- A confirmação de condições de uso público da capa continua pendente do proprietário, conforme o briefing. A entrega está pronta para revisão local.
