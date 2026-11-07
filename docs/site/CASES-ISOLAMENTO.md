# Isolamento dos Cases FSI — entrega local

> Relatório histórico, reunido em `docs/site/` em 05/11/2026. Os resultados abaixo correspondem à entrega descrita; para a operação atual, consulte [README.md](README.md).

Implementação sobre `main`, commit `dcfd6830b9d98d5797761ec6a6081bc6b9fc9cab`. A working tree estava limpa na inspeção inicial. O redesign existente foi preservado; não houve commit, staging, push, PR, deploy, consulta de credenciais ou comando AWS.

Prévia: **http://127.0.0.1:4173/biblioteca/index.html**. A coleção está em **http://127.0.0.1:4173/cases/index.html**.

## Resultado

Os dez cases continuam publicados no artefato local, com suas URLs, âncoras, diagramas, tabelas, exemplos, código, perguntas, respostas e referências originais. Seus artigos renderizados são idênticos ao baseline, conferidos por SHA-256 do conteúdo de `article.prose`; os arquivos Markdown e assets também foram conferidos por hash.

Fora da coleção, existe exatamente um link de entrada: **Biblioteca → Cases FSI**. Home, trilhas, percurso guiado, navegação contextual das outras áreas, recomendações, pré-requisitos, busca e progresso principal não direcionam mais para os cases.

O percurso de transações/idempotência agora segue **Home → tema → F06 → simulado de pedido durante falha do banco → seção estudada no F06**. Nenhum case é necessário para completar esse percurso.

Dentro da coleção, o índice mostra título e descrição de cada case, navegação entre os cases e indicação de consulta opcional. O leitor mantém o sumário e todos os recursos existentes. A saída explícita retorna à Biblioteca. Não foi criado outro aplicativo ou motor de busca.

## Política centralizada

`site/collection-policy.mjs` é compartilhado pelo gerador, templates e navegador. Os documentos da coleção recebem:

```js
{
  collection: 'fsi-cases',
  standalone: true,
  search: false,
  progress: false
}
```

`search` reaproveita a política de busca existente. Publicação e audiência continuam sendo dimensões independentes: os cases são públicos e opcionais, não privados.

Os helpers `isStandalone`, `participatesInMainStudy`, `mainSections` e `continuityScopeFor` controlam participação no percurso, indicadores e retomada. O escopo de continuidade é derivado da coleção; não foi duplicado em outra propriedade do manifesto. Tópicos, trilhas, pré-requisitos e práticas relacionadas dos cases não os conectam à jornada principal.

O índice global contém apenas fontes elegíveis da área principal, preservando também a exclusão dos materiais do instrutor e corpos de respostas. Não há títulos, trechos ou identificadores de cases nesse índice.

## Registros existentes

As leituras mantêm os mesmos IDs e a mesma chave de armazenamento. Os registros anteriores, datas já existentes e campos adicionais são preservados. Apenas a apresentação e a contagem são filtradas pela coleção.

A retomada de cases usa `resume['fsi-cases']`. Uma visita a um case não altera `resume.student`, comprovado com um registro anterior do F06. Histórico e contagem da coleção ficam dentro de `/cases/index.html`; Meu estudo e a home exibem somente o estudo principal.

Se a versão anterior salvou um case em `resume.student`, esse ponteiro é preservado no armazenamento e fica oculto na área principal. Na coleção, ele pode ser apresentado como fallback de leitura, sem movê-lo ou apagá-lo. Registros legacy não resolvidos de cases também ficam fora da visualização principal. As preferências gerais de tema e texto continuam compartilhadas, como antes.

## Referências nas fontes, no código e na interface

A varredura distinguiu três universos:

| Universo | Resultado |
|---|---|
| Fontes publicáveis fora da coleção | 152 linhas de referência em 48 arquivos: 45 recomendações, 37 contextos técnicos, 36 referências de estudo e 34 linhas de navegação/metadados. |
| Código anterior | 23 linhas de referências de configuração, descritas no inventário. As referências necessárias para identificar e renderizar a coleção continuam existindo no código. |
| Interface gerada | Um único link externo à coleção, na Biblioteca; zero links para cases nas demais páginas; zero referências a cases no índice de busca global. |

A busca ampla também encontrou documentação operacional/histórica, usos genéricos em inglês/NIST e o namespace distinto de histórias STAR. Esses resultados não foram confundidos com recomendações apresentadas ao estudante.

Os Markdown originais não foram alterados. `site/case-reference-policy.mjs` aplica uma projeção explícita de apresentação, compartilhada pelo HTML e pela busca: 159 regras curadas cobrem 165 linhas físicas em 48 fontes. Algumas linhas adicionais são cabeçalhos e colunas de tabelas que precisam permanecer válidas após retirar uma referência.

A projeção removeu:

- O card da home e a entrada de Cases FSI nas trilhas.
- A etapa de pagamentos do percurso piloto e os links de continuação F06/candidata → case.
- Referências de estudo nos índices, plano de preparação, checklist, perguntas, exercícios e fichas de Leadership Principles.
- A coluna de aplicação nos cases do índice de fundamentos, mantendo os módulos e suas descrições.
- A presença dos cases em contagens, histórico e retomada principais.

Cabeçalhos originais continuam sendo usados para calcular IDs. Quando necessário, somente o título visível é neutralizado depois desse cálculo, preservando links antigos como `#cases-fsi` sem fazê-los apontar para a coleção.

### Tratamento dos vínculos técnicos

As 37 linhas de contexto técnico foram revisadas individualmente. Não ficou uma dependência técnica indispensável sem tratamento. Exemplos:

| Contexto anterior | Tratamento na apresentação |
|---|---|
| F04 dependia de abrir o case de cartões para fazer o exercício | As duas workloads, restrições, perguntas e critérios já descritos no módulo foram preservados; o exercício usa essas próprias premissas. |
| F06 remetia aos cases para autoridade financeira, reserva e idempotência | A distinção entre autoridade, projeção, concorrência e repetição permanece explícita no fundamento. Quando adequado, o aprofundamento aponta para SD03/CQRS. |
| SD02 remetia ao internet banking para atraso de projeção e resultado confirmado | O contrato do exemplo e os limites técnicos continuam no próprio módulo; recuperação regional é aprofundada em F12. |
| SD03 herdava o contrato financeiro e regras de reserva de outro documento | O contrato didático continua explícito no próprio módulo: atomicidade no core, referência estável, resultado autoritativo e reconciliação. Fontes técnicas e ressalvas foram mantidas. |
| F12/SD01 remetiam à modernização do core para transferência de autoridade | O aprofundamento usa SD03 na âncora existente `#leader-election`, que contém leases e fencing. |
| Referências a segurança, conectividade e dados | Foram mantidos ou propostos os módulos pertinentes F01, F03, F06, F10 e F12, sem equiparar fundamentos a uma arquitetura inteira. |

O inventário local `.site/cases-isolation/source-references.json` contém arquivo, linha, contexto, destino, classificação, proposta de substituição e texto projetado. O resumo legível está em `.site/cases-isolation/source-reference-review.md`.

## Arquivos alterados

| Arquivo | Finalidade |
|---|---|
| `site/collection-policy.mjs` | Nova política central de coleção, progresso e continuidade. |
| `site/case-reference-policy.mjs` | Projeção curada das referências nas outras áreas, sem editar os Markdown. |
| `site/content-policy.mjs` | Integra a coleção à política de busca e aos metadados do percurso. |
| `site/content.mjs` | Descrição da área como coleção independente e opcional. |
| `site/templates.mjs` | Entrada única, percurso principal sem cases, índice independente e navegação interna dos cases. |
| `site/site.js` | Filtragem de progresso e histórico, retomada independente e preservação dos dados anteriores. |
| `scripts/build-site.mjs` | Aplica projeção e metadados; preserva slugs; gera a coleção e o índice global filtrado. |
| `scripts/check-site.mjs` | Guardas de isolamento, busca, referências, URLs, âncoras, hashes e privacidade. |
| `scripts/check-browser.mjs` | Regressão da jornada e do armazenamento, coleção e capturas desktop/mobile. |
| `docs/site/CASES-ISOLAMENTO.md` | Este relatório de entrega. |

Paleta, CSS, tipografia, capa, assets existentes, temas, CSP, robots, infraestrutura e scripts de publicação não foram modificados.

## Testes executados

```bash
npm run build
npm run check
npm run test:browser
```

Todos passaram no build final. `node --check` dos módulos alterados e `git diff --check` também passaram.

- 94 documentos e 116 páginas HTML; todas as rotas e IDs anteriores preservados.
- 10 cases, com Markdown, conteúdo renderizado e assets preservados por hash.
- 7.091 referências internas verificadas.
- 73 fontes no estudo e na busca principais; 941 entradas de busca por seção. Cases no índice global: zero.
- 89 diagramas Mermaid em 20 páginas, percorrendo o acervo completo.
- Chromium 153.0.8010.12; larguras 320, 390, 820, 1440 e 1920 CSS px; temas claro/escuro/sistema, texto ampliado, teclado, cópia, SVG/Mermaid ampliáveis e reflow.
- Treze grupos de verificações, incluindo os critérios de isolamento, fixtures de registros v1/v2, dados adicionais/datas preservados, ponteiro antigo de case, ausência de contaminação da retomada, navegação móvel, armazenamento bloqueado, leitura sem JavaScript e 404.
- Nenhum erro de console, CSP ou rede no ensaio final. Materiais do instrutor e dados pessoais continuam fora da busca e da distribuição conforme a política existente.

Os resultados estruturados estão em `.site/cases-isolation/browser-results.json`; o inventário anterior está em `.site/cases-isolation/baseline.json`.

## Capturas reais

Caminhos relativos à raiz do projeto:

| Amostra | Captura |
|---|---|
| Biblioteca desktop | `.site/cases-isolation/after/library-desktop.png` |
| Biblioteca mobile | `.site/cases-isolation/after/library-mobile.png` |
| Case desktop | `.site/cases-isolation/after/case-desktop.png` |
| Case mobile | `.site/cases-isolation/after/case-mobile.png` |

Há capturas adicionais da home, leitor, busca e diagramas no mesmo diretório. Todas são locais; não representam publicação.

## Pendências e impactos futuros

- A projeção é deliberadamente verificável: se uma linha curada mudar no Markdown, o build solicita a revisão da regra correspondente. Novas referências são fiscalizadas por `npm run check`, também chamado pelo fluxo de deploy existente. Autores precisam manter fonte e regra de apresentação coerentes.
- A varredura de arquivos-fonte continuará encontrando os vínculos originais preservados e referências operacionais/históricas. O isolamento aplicado é o da experiência do site e do índice gerado, não uma reescrita da documentação no GitHub.
- Consultas que tinham resultados apenas em cases podem ficar vazias. No acervo atual, isso ocorre com retentativa/retentativas; o estado vazio e a correspondência por termos continuam testados. Não foram adicionados aliases para forçar resultados artificiais.
- A busca local da coleção não existia; nenhum motor separado foi criado.
- Safari e Firefox não foram executados; não se declara conformidade WCAG integral nem eficácia pedagógica. A revisão do proprietário permanece pendente.
- Nenhuma alteração foi publicada. Para reiniciar a prévia, execute `npm run build` e `npm run preview` na raiz do projeto.
