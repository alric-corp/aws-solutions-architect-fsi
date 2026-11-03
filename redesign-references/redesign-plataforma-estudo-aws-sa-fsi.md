# Redesign da plataforma de estudo AWS SA FSI — diagnóstico, pesquisa e proposta

Atualizado em 2 de novembro de 2026.

## Sumário executivo

O conteúdo é forte e o site já tem base técnica confiável; faltam orientação em páginas longas, conforto de leitura, prática sem spoiler e uma identidade ligada à capa. Recomendo a direção A, **Capa e carvão**, e uma primeira entrega centrada no leitor, não na home.

- **Verificado:** repositório, build e testes locais do commit `603dcf0`, com capturas reais em quatro larguras. O site publicado e a capa não estavam acessíveis.
- **Problemas principais:** linhas de cerca de 118 caracteres; nenhum sumário abaixo de 1020 px num case de 78 telas no celular; 11 combinações de texto secundário abaixo de 4,5:1; diagramas reduzidos a até 24% no celular; busca que exibe trecho do gabarito.
- **Direção:** capa só na home, sobre faixa carvão; leitura em papel claro; laranja só em ação, local e progresso; uma família tipográfica; temas claro e escuro.
- **Estrutura:** cinco entradas (Início, Trilhas, Biblioteca, Prática e Meu estudo) e um manifesto que liga as 94 páginas às trilhas sem mudar nenhum endereço.
- **Prática e progresso:** janela de apresentação nos simulados; cinco estados de estudo, sem percentual de domínio; dados só no navegador, com exportação.
- **Primeira entrega:** o leitor completo e a correção do spoiler na busca, validados com tarefas reais.
- **Decisões suas:** uso do logotipo, motor de busca, indexação, nome na página de inglês e direção visual, detalhados no fim do documento.

## Método e legenda de evidências

A auditoria usou o commit `603dcf0` do `main` (2/11/2026, 23h01 BRT), gerado e testado localmente com a mesma CSP de produção. O site publicado e a capa `amazon.jpg` não estavam acessíveis neste ambiente.

Cada afirmação deste documento usa uma das quatro marcas abaixo.

| Marca | Significado | Exemplo |
| --- | --- | --- |
| **Confirmado** | Verificado no código, na build local ou por medição | O sumário da página some abaixo de 1020 px |
| **Fornecido** | Informado no briefing, sem verificação independente | Disponibilidade semanal de estudo |
| **Hipótese** | Plausível, mas depende de inspeção ou teste | Comportamento do site publicado igual ao da build local |
| **Proposta** | Recomendação deste documento, sujeita à sua aprovação | Paleta laranja, carvão e creme |

| Fonte inspecionada | Como | Limite |
| --- | --- | --- |
| Repositório `alric-corp/aws-solutions-architect-fsi` | Árvore, histórico, `site/`, `scripts/`, `aws-stack.json` e 94 Markdown | A primeira listagem da API veio desatualizada; a análise fixou o commit `603dcf0` |
| Build local | `npm ci`, `npm run build`, `npm run check` e o teste de navegador do projeto | Pode diferir do publicado se o deploy saiu de alterações não commitadas |
| Capturas e medições | Chromium headless em 1440×900, 820×1180, 390×844 e 320×700 | Sem leitor de tela real nem dispositivos físicos |
| Site publicado (CloudFront) | Tentativa de acesso | Bloqueado pela rede deste ambiente |
| Capa `amazon.jpg` | Pasta de envios verificada duas vezes | Arquivo não recebido; integração especificada sem uso da imagem |
| Referências externas | Páginas públicas extraídas como texto, sem renderização visual | Áreas com login não foram acessadas |

Nenhum teste com a Vitória ou o Tomas foi executado. Tempos e taxas citados como metas são hipóteses. Nada foi alterado no repositório, no bucket, no CloudFront ou em DNS, e nenhuma credencial foi lida.

## Diagnóstico

O conteúdo e a base técnica são sólidos. O que mais atrapalha o estudo é a orientação em páginas longas, a largura de leitura, os diagramas no celular, o contraste de textos secundários e uma busca que expõe trechos do material do instrutor. Tudo abaixo é **confirmado** na build local do commit `603dcf0`.

| # | Problema | Evidência | Tarefa afetada | Prioridade |
| --- | --- | --- | --- | --- |
| D1 | Linhas longas demais | Cerca de 118 caracteres por linha a 1440 px (texto 17 px, coluna até 850 px) | Leituras de 60–90 min sem perder a linha | P0 |
| D2 | Sem navegação interna fora do desktop | Sumário só com títulos de nível 2, oculto abaixo de 1020 px. Case 01: 54 telas no desktop, 78 em 390 px, 106 em 320 px | Retomar e se localizar num case de 25 seções e até 157 subseções | P0 |
| D3 | Orientação fraca | Breadcrumb mostra só "Biblioteca / seção". A lateral repete 96 links em toda página e tem dois itens "Visão geral" no mesmo grupo | Saber onde estou e o que vem depois | P0 |
| D4 | Contraste e tamanho de textos secundários | 11 pares de cor entre 2,06:1 e 3,83:1 em textos de 9–11 px. 12% dos caracteres da home desktop abaixo de 12 px; rótulos de 7 e 8 px no celular | Leitura confortável; WCAG 1.4.3 | P0 |
| D5 | Foco pouco visível | Contorno `#df9a3e` com 2,29:1 sobre o fundo; referência de 3:1 | Navegação por teclado; WCAG 1.4.11 e 2.4.7 | P0 |
| D6 | Diagramas ilegíveis no celular | No case 01, os 6 diagramas renderizados em 390 px ficam entre 24% e 80% do tamanho original, sem ampliação | Entender uma arquitetura no celular | P0 |
| D7 | Sem tema escuro nem ajuste de texto | A preferência de tema do sistema é ignorada. O CSS tem 135 tamanhos em px, 1 em rem, 162 cores fixas e 8 variáveis | Conforto visual; toda mudança visual custa caro | P0 |
| D8 | Busca revela gabarito | "checkout lento" traz o material do instrutor em 2º lugar, com trecho que revela a causa. Instrutor também aparece em "rede" (7 resultados), "TLS" (4) e "idempotência" (1) | Conduzir simulado sem spoiler | P0 |
| D9 | Busca imprecisa e pesada | "STAR" retorna 71 de 94 documentos; 40 só por trechos como "estar". O resultado leva ao topo do documento. Índice de 2,2 MB (702 KB comprimido), baixado inteiro | Encontrar um conceito e chegar ao exercício | P1 |
| D10 | Progresso mede leitura, não domínio | Único estado é "Marcar como lido"; a home mostra "X de 94 lidos". A retomada guarda só a última página, inclusive de instrutor | Revisar e acompanhar evolução | P1 |
| D11 | Home sem prioridade de ação | O hero ocupa a primeira tela no celular. "Seu primeiro passo" é sempre a aula 1; seis cartões de trilha com o mesmo peso | Por onde começo e onde parei | P1 |
| D12 | Tabelas e código no celular | No case 01, 15 de 15 tabelas e 10 de 11 blocos de código rolam lateralmente sem aviso visual. Não há botão de copiar; toda tabela tem o rótulo "Tabela de conteúdo" | Consultar comparações e exemplos | P1 |
| D13 | Identidade sem relação com a Amazon | Marca "ap" em azul-marinho e âmbar; capa ausente | Objetivo visual do projeto | P0 |
| D14 | Ruído no topo dos cases | Bloco com "Caminho sugerido no repositório" e um "Sumário" que duplica o lateral | Começar a leitura | P2 |
| D15 | Cache sem versionamento | CSS e JS com nome fixo e `max-age=0`: revalidação a cada página | Desempenho, sem falha funcional | P2 |

Captura real · case 01 em 1440 px: três colunas, linha longa e sumário com 25 itens sem agrupamento.

![Case 01 no desktop, build local](assets/captura-case-desktop.png)

Captura real · busca por “checkout lento”. O trecho do material do instrutor foi desfocado neste documento para não revelar o exercício.

![Busca com material do instrutor em segundo lugar](assets/captura-busca-instrutor.png)

Captura real · primeiro diagrama do case 01 em 390 px, reduzido a cerca de 42%.

![Diagrama reduzido no celular](assets/captura-diagrama-celular.png)

**Preservar.** O gerador próprio, sem framework, mantém URLs `.html` estáveis e âncoras compatíveis com o GitHub. O build checa 13.996 links internos, e o teste de navegador cobre desktop, 390 px, leitura sem JavaScript e 89 diagramas. A CSP é restritiva, fontes e Mermaid são servidos pelo próprio site, e já existem estilos de impressão e respeito a movimento reduzido. A busca ignora acentos: “idempotencia” encontra “idempotência”. No conteúdo, os cases seguem um roteiro estável, têm 300 respostas recolhíveis, e os simulados separam candidata e instrutor em arquivos distintos.

**Privacidade — decisões suas.**

- Os arquivos do instrutor são públicos no repositório e no site, como o README da trilha já informa. A separação evita spoiler, mas não protege informação.
- O `robots.txt` permite indexar todo o site, inclusive as páginas de instrutor. Bloquear a indexação reduz a exposição em buscadores, mas também não é controle de acesso.
- A página de prática de inglês usa o primeiro nome da candidata no título. O conteúdo é um modelo em branco, mas o título associa o nome à preparação.
- Nos arquivos verificados (matriz de competências, plano, registro de sessão e prática de inglês), os campos pessoais estão em branco ou usam apenas IDs.

## Pesquisa aplicada

Nove referências orientam a proposta. As diretrizes de marca mudam a direção visual: a AWS proíbe imitar o visual dos seus sites, então a paleta sai da capa enviada, não do console. Todas foram consultadas em 2/11/2026, extraídas como texto, sem renderização visual.

| Fonte e versão | Padrão observado | Problema que resolve | Aplicação neste projeto | Limite ou risco | Natureza |
| --- | --- | --- | --- | --- | --- |
| [AWS Trademark Guidelines](https://aws.amazon.com/trademark-guidelines/), atualizada em 17/7/2026 | Proíbe insinuar afiliação, alterar logotipos e imitar o visual de sites da AWS, inclusive combinações de cores e fontes | Portal parecer oficial | Paleta derivada da capa; aviso de material independente; nenhum logotipo da AWS como marca do site | Não autoriza o uso de logotipos | Documentado |
| [Amazon Trademark Usage Guidelines](https://digprjsurvey.amazon.com/csad/help/node/GNYNL3A8HPATWCH8), sem data visível | Vale para quem tem permissão expressa: logotipo sem alteração, com espaço livre, sem fundo que atrapalhe e com aviso de marca | Tratamento da capa | Capa sem recorte, filtro ou texto por cima; aviso de marca abaixo dela | Página sem data; não é parecer jurídico | Documentado |
| [Cloudscape — Visual modes](https://cloudscape.design/foundation/visual-foundation/visual-modes/), publicada em 16/2/2021, e [Typography](https://cloudscape.design/foundation/visual-foundation/typography/) | Claro para muito texto, escuro para pouca luz, escolha da pessoa e tokens no lugar de cores fixas. Corpo de texto em 14 px | Temas e manutenção visual | Tokens com valor claro e escuro; tema claro como padrão, com escolha salva | 14 px é densidade de console, não de leitura longa; a biblioteca exige React | Documentado |
| [AWS Docs — Well-Architected](https://docs.aws.amazon.com/wellarchitected/latest/framework/reliability.html) | Breadcrumb completo, lista de tópicos filhos, anterior e próximo, versão em PDF e em Markdown | Saber onde estou | Breadcrumb até a página; índices com tópicos filhos; link para o arquivo no GitHub | Inspeção só textual | Observado |
| [Microsoft Learn — tipos de conteúdo](https://learn.microsoft.com/en-us/training/support/learn-content-types), atualizada em 29/7/2026 | Trilha, módulo e unidade, com público e tempo por módulo; crédito por unidade; temas claro, escuro e alto contraste; modo de leitura | Percurso guiado | Trilhas com tempo e pré-requisitos por item; seletor de tema; modo foco | Crédito por unidade lida mede leitura, não domínio | Documentado |
| [AWS Training FAQ (Skill Builder)](https://aws.amazon.com/training/faqs/), atualizada em 26/10/2026 | Planos com dificuldade crescente, progresso e liberdade para pular. O AWS Educate mantém o conteúdo em andamento à vista | Por onde começo e onde parei | Trilha recomendada que permite saltos; "Continuar" no topo da home | Área logada não inspecionada | Documentado |
| [MDN — Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API), modificada em 21/2/2025 | Breadcrumb, selo de status no topo, "In this article", títulos com link próprio, data de modificação e link de origem | Leitura técnica e links estáveis | Título com link copiável; ficha do item no topo; data e arquivo de origem no rodapé | Inspeção só textual | Observado |
| [WCAG 2.2 — novidades](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), recomendação de 5/10/2023 | Foco não encoberto (AA); foco com 2 px e 3:1 (AAA); alvo mínimo de 24×24 px (AA) | Critérios de aceite | Cabeçalho fixo sem cobrir o foco; anel de foco de 3 px; alvos de 24 px, 44 px no toque | Ferramenta automática não prova conformidade | Documentado |
| [Dunlosky et al., 2013](https://fds.duke.edu/db/aas/pn/faculty/emarsh/publications/252743); [Roediger e Karpicke, 2006](https://pubmed.ncbi.nlm.nih.gov/16507066/); [Cepeda et al., 2006](https://pubmed.ncbi.nlm.nih.gov/16719566/) | Testar-se e espaçar têm alta utilidade; reler e grifar, baixa. Testar-se retém mais após dias, embora reestudar aumente a confiança. O intervalo ideal entre revisões cresce com o prazo | Confundir leitura com domínio | Estados autodeclarados separados de "praticado"; "responda antes de abrir"; revisão com intervalo configurável | Estudos com textos e listas, não com entrevistas; a transferência é interpretação minha | Documentado e interpretação |

Fontes técnicas de apoio, também de 2/11/2026:

- [Pagefind — hospedagem](https://pagefind.app/docs/hosting), [indexação](https://pagefind.app/docs/indexing/) e [idiomas](https://pagefind.app/docs/multilingual/): busca estática com stemming em português e exclusão de páginas do índice. Exige liberar WebAssembly e workers na CSP.
- [MDN — cotas de armazenamento](https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria): cerca de 5 MiB de localStorage por origem e pedido de armazenamento persistente.
- [Didomi — limite de 7 dias no Safari](https://docs.didomi.io/releases-and-announcements/announcements/apple-implements-7-day-cap-on-script-writable-storage): o Safari apaga dados do site após 7 dias de uso sem interação. É fonte secundária; vale conferir no blog do WebKit.

Não usei prêmios, galerias de design ou popularidade como evidência de facilidade de uso.

## Direções visuais

Recomendo a direção A, **Capa e carvão**. A capa e o cabeçalho carvão carregam a identidade; a leitura acontece em papel claro, e o laranja fica reservado a ação, localização e progresso. A direção B, **Creme editorial**, é mais calma, mas a capa marca menos e o creme desaparece no tema escuro.

![Direções A e B: cores, tipografia e componentes (proposta)](assets/direcoes-visuais.svg)

*Direções A e B · cores, tipografia e componentes · proposta*

As duas usam a mesma capa, com o mesmo tratamento, e nenhuma repete a capa nas páginas de estudo. Os valores são provisórios até a amostragem da `amazon.jpg`.

| Critério | A · Capa e carvão | B · Creme editorial |
| --- | --- | --- |
| Reconhecimento da capa | Alto: a capa fica sobre faixa carvão, da mesma família de cores | Médio: capa sobre creme, laranja só em fios e marcadores |
| Leitura longa | Papel claro, texto com contraste de 16:1 | Creme na página inteira, sensação de livro |
| Tema escuro | Coerente: carvão quente e laranja de ação | Perde o creme, que é a própria identidade |
| Tipografia | Uma família: Source Sans 3, já no projeto, licença OFL 1.1 | Duas famílias: Source Sans 3 e Source Serif 4, licença a confirmar; mais bytes |
| Risco de parecer oficial | Moderado; mitigado com carvão quente, não o azul-escuro dos sites AWS, e aviso de independência | Baixo |
| Manutenção | Menos tokens e um só conjunto tipográfico | Dois conjuntos tipográficos e mais estados de cor |

**Por que A.** As sessões são longas, inclusive à noite, e só A mantém a identidade no tema escuro. A também atende ao pedido de identidade reconhecível sem pintar a tela de laranja: a cor fica em poucos pontos de decisão. E custa menos, porque remove a Manrope e usa uma única família já hospedada.

## Arquitetura da informação

A navegação principal passa de 11 grupos para cinco entradas: Início, Trilhas, Biblioteca, Prática e Meu estudo, além da busca. Nenhuma página muda de endereço; um manifesto liga cada página às trilhas e práticas em que ela aparece.

![Navegação proposta: 5 entradas, 1 manifesto, 94 páginas](assets/arquitetura-informacao.svg)

*Navegação proposta · 5 entradas, 1 manifesto, 94 páginas*

**Dois percursos, um conteúdo.** O percurso guiado, em Trilhas, responde o que estudar agora: ordem, pré-requisitos, tempo e o próximo item, com o motivo. A consulta direta, em Biblioteca e na busca, responde onde está um conceito, por tipo, tema e seção. A lateral mostra só o contexto atual, a trilha ou o tipo, e nunca as 94 páginas de uma vez.

| Trilha | Conteúdo existente | Ordem |
| --- | --- | --- |
| Comece do zero | Visão da trilha e Loja Horizonte: cenário e aula 1 | Já definida no material |
| Fundamentos | F00 a F12 | Numérica |
| System Design | SD01 a SD05 e padrões | Numérica, depois dos fundamentos citados em cada módulo |
| Cases FSI | FSI01 a FSI10, cada um agrupado em Entender, Desenhar, Aprofundar, Operar e Praticar | 01 a 10, com saltos livres |
| Troubleshooting | Seis simulados, guia e rubrica | 1 e 2, depois 3 a 6, como o README da trilha recomenda |
| Comportamental | STAR, 16 LPs, guia de prática e prática de inglês | STAR primeiro |
| Entrevista | Papel do SA, processo, plano, perguntas comuns, dicas e checklist | Reta final |

**Foco atual, privado no navegador.** Em Meu estudo, a pessoa escolhe até três focos, e cada um aponta para leitura e prática que já existem. Nenhuma página pública diz que um assunto é lacuna.

| Foco (prioridade informada) | Estudar | Praticar |
| --- | --- | --- |
| Troubleshooting ponta a ponta | F08 Observabilidade | Simulados 1 a 6 |
| Transações e idempotência | F06; Case 01, seção 8 | Simulado 2 |
| Redes, DNS e conectividade privada | F01 | Simulado 3 |
| Segurança, TLS e autorização | F03 | Simulado 4 |
| Alta disponibilidade e recuperação | F12, SD04 e Case 09 | Simulado 5 |
| Capacidade e migração de banco | SD05 e F12 | Simulado 6 |
| Leadership Principles e histórias | STAR e 16 LPs | Roteiro comportamental |

O case de recuperação da jornada de recomendações de investimentos não está no repositório público e deve continuar fora dele.

| Rota | Situação |
| --- | --- |
| Páginas `.html` atuais | Mantidas |
| Âncoras dos títulos | Mantidas; cada título ganha link copiável |
| `/guia.html` e `/progress/` | Mantidas; Meu estudo usa outra rota |
| `/trilhas/`, `/trilhas/<id>.html`, `/pratica/`, `/pratica/apresentacao.html`, `/meu-estudo/` | Novas, sem conflito com as pastas atuais |

Se um arquivo for renomeado no futuro, o build gera uma página de redirecionamento no endereço antigo, porque o S3 e o CloudFront não têm regra de reescrita hoje. A verificação do build passa a conferir esses redirecionamentos.

**Instrutor separado.** As páginas do instrutor ficam marcadas no manifesto. Saem da busca padrão e do menu da candidata, e se abrem por Prática › Modo instrutor, com aviso antes. Isso evita spoiler, mas não protege informação: os arquivos continuam públicos.

## Sistema visual

Todos os pares de texto propostos passam de 4,5:1 nos dois temas, calculados com a fórmula do WCAG. O laranja nunca aparece como texto sobre fundo claro, porque ali teria 2,24:1. As cores são provisórias até a amostragem da `amazon.jpg`.

### Cor

| Token | Função | Claro | Escuro | Contraste calculado (claro / escuro) |
| --- | --- | --- | --- | --- |
| `--bg-page` | Fundo da página | #FAF8F5 | #141210 | Referência |
| `--bg-surface` | Coluna de leitura e cartões | #FFFFFF | #1C1A17 | Referência |
| `--bg-sunken` | Creme: blocos e faixa do aviso | #F4EEE4 | #23201C | Referência |
| `--bg-chrome` | Cabeçalho e faixa da capa | #1C1A17 | #0F0E0C | Texto sobre ele: 15,45:1 no claro |
| `--text` | Texto principal | #1F1C19 | #EEE8E0 | 14,69 a 16,96 / 13,33 a 15,35 |
| `--text-muted` | Texto secundário | #5B544D | #B9B0A5 | 6,45 a 7,45 / 7,58 a 8,74 |
| `--accent` | Botão principal, local atual, progresso | #F29111 | #F7A541 | Texto sobre ele: 7,13 / 9,27 |
| `--accent-text` | Rótulos de destaque | #8F4300 | #FFB866 | 6,13 a 6,67 / 9,50 a 10,95 |
| `--border-control` | Bordas de campos e botões secundários | #8A8178 | #8C8379 | 3,61 / 5,02 (mínimo 3:1) |
| `--focus` | Anel de foco de 3 px | #1F1C19 | #FFC47A | 16,00 / 11,95 |
| `--info` sobre `--info-bg` | Bloco Exemplo | #1D5FA7 / #EAF2FB | #8DB8EA / #16263A | 5,73 / 7,42 |
| `--risk` sobre `--risk-bg` | Bloco Risco e erros | #B42318 / #FDECEA | #F2867C / #3A1A17 | 5,75 / 6,33 |
| `--tradeoff` sobre `--tradeoff-bg` | Bloco Trade-off | #8F4300 / #FFF3E2 | #FFB866 / #3A2A14 | 6,45 / 8,09 |
| `--ok` sobre `--ok-bg` | Estado Praticado | #1E7A45 / #E8F5EC | #7CCB97 / #15301F | 4,77 / 7,36 |

O laranja tem no máximo três papéis por tela: ação principal, local atual e progresso. Links usam a cor do texto com sublinhado laranja de 2 px, então o sublinhado, e não só a cor, identifica o link. SVGs exportados do Draw.io ficam sobre um cartão claro também no tema escuro, sem inversão de cores.

### Tipografia

Uma única família, Source Sans 3 variável, já hospedada pelo site e sob licença SIL OFL 1.1. A Manrope sai, o que economiza 24,8 KB de fonte. Código usa a fonte monoespaçada do sistema. A escala é em rem, para respeitar o tamanho de texto escolhido no navegador.

| Uso | Tamanho | Altura de linha | Peso |
| --- | --- | --- | --- |
| Texto de leitura | 1,125 rem (18 px) no desktop; 1,0625 rem (17 px) no celular | 1,65 | 400 |
| Interface e navegação | 0,9375 rem (15 px) | 1,4 | 400 e 600 |
| Rótulos e metadados | 0,875 rem (14 px); mínimo absoluto de 0,8125 rem (13 px) | 1,4 | 600 |
| H1 | 2,25 rem no desktop; 1,75 rem no celular | 1,2 | 700 |
| H2 | 1,625 rem; 1,375 rem | 1,25 | 700 |
| H3 | 1,3125 rem; 1,1875 rem | 1,3 | 600 |
| Código | 0,9375 rem | 1,6 | 400 |

A coluna de leitura tem no máximo 68ch, cerca de 70 caracteres por linha. O ajuste de texto tem três passos, salvos no navegador.

### Espaço, borda, raio, elevação e movimento

| Token | Valores |
| --- | --- |
| Espaço, base 4 | 4, 8, 12, 16, 24, 32, 48, 64 e 96 px, de `--space-1` a `--space-9` |
| Borda | 1 px padrão; 2 px para seleção; 3 px só no foco |
| Raio | 4 px em campos e código; 8 px em cartões e blocos; 12 px na faixa da capa; 999 px em etiquetas |
| Elevação | Nível 0 para conteúdo; nível 1 é a linha do cabeçalho fixo; nível 2, uma única sombra em diálogos e folhas |
| Movimento | 120 a 200 ms para abrir e fechar; zero com movimento reduzido |
| Alvos | Mínimo de 24 px; 44 px em controles de toque |

### Estados interativos

| Estado | Tratamento |
| --- | --- |
| Passar o cursor | Fundo creme e sublinhado mais grosso em links |
| Foco visível | Anel de 3 px com 2 px de afastamento, nunca removido |
| Página ou seção atual | Barra laranja de 3 px à esquerda, peso 600 e `aria-current` |
| Alternância ativa | Fundo laranja com texto escuro e `aria-pressed` |
| Desabilitado | Opacidade de 55%, sem efeito ao passar o cursor e texto que explica o motivo |
| Erro | Ícone e texto em vermelho, nunca só a cor |

### Temas

O claro é o padrão, como o Cloudscape recomenda para leitura extensa; escuro e "seguir o sistema" ficam no cabeçalho e são salvos no navegador. Como a CSP bloqueia script inline, um arquivo pequeno, `theme-init.js`, carrega de forma síncrona no `<head>` e evita o flash de tema errado. O Mermaid ganha variáveis próprias para o escuro e é redesenhado na troca de tema.

### Aplicação da capa

| Aspecto | Especificação |
| --- | --- |
| Onde aparece | Só na página inicial; páginas de estudo usam apenas o cabeçalho carvão |
| Desktop | Faixa carvão de 240 a 360 px. Texto e ações à esquerda; capa inteira à direita, sem texto por cima |
| Celular | Capa no topo, largura total, até 34% da altura da tela; título e "Continuar" logo abaixo, ainda na primeira tela |
| Visitas de retorno | Com progresso salvo, a faixa cai para cerca de 120 px; a capa diminui, nunca é recortada |
| Estabilidade | `width` e `height` do original declarados, sem deslocamento do layout |
| Arquivo | `<picture>` com AVIF, WebP e JPEG de reserva, em 640, 960, 1280 e 1920 px, gerados uma vez e versionados. Meta, hipótese: até 150 KB na versão de 1280 px |
| Carregamento | Prioridade alta só na home, sem carregamento tardio; as outras páginas não baixam a imagem |
| Logotipo | Sem recorte, filtro, sombra ou sobreposição, com espaço livre ao redor; nunca vira favicon nem marca do site |
| Aviso | Logo abaixo: "Material independente de estudo, sem afiliação com a Amazon ou a AWS. Amazon e o logotipo da Amazon são marcas da Amazon.com, Inc. ou de suas afiliadas." |
| Texto alternativo | `alt=""`, porque título e aviso já estão em texto |
| Pendência | Amostrar laranja, preto e creme da capa e recalcular o contraste no build |

### Componentes base

| Componente | Especificação |
| --- | --- |
| Cabeçalho | Carvão, 56 px, marca em texto, cinco entradas, busca, tema e tamanho do texto |
| Breadcrumb | Início › trilha ou tipo › página › seção atual; no celular, só os dois últimos níveis |
| Ficha da página | Tempo, pré-requisitos, trilhas, estado de estudo e data do arquivo |
| Sumário | Títulos de nível 2 e 3, agrupados por fase nos cases, com a seção atual destacada; folha "Nesta página" no celular |
| Blocos semânticos | Conceito, Exemplo, Trade-off e Risco, com ícone e rótulo em texto. No Markdown, a sintaxe de alertas do GitHub, que o GitHub também exibe. Hoje nenhum arquivo usa esses blocos, então a adoção é gradual |
| Resposta recolhível | `<details>` com o rótulo "Responda antes de abrir" e estado anunciado |
| Código | Rótulo da linguagem, botão "Copiar" com confirmação anunciada e rolagem própria |
| Tabela | Rolagem própria com sombra indicativa, primeira coluna fixa e nome acessível tirado do título anterior |
| Diagrama | "Ampliar" abre um visualizador com zoom por botão e teclado, arrastar e "Ajustar à tela" |
| Estado de estudo | Grupo de cinco opções, com texto e ícone |
| Etiqueta de tipo | Fundamento, System Design, Case, LP, Simulado e Referência, sempre em texto |

Os ícones continuam sendo os SVGs de traço do projeto, sempre ao lado de texto; emoji não é sistema de ícones.

## Especificação de telas

Oito telas cobrem o percurso de escolher a revisar; três têm wireframe e as demais reutilizam os mesmos componentes. Tudo nesta seção é proposta, e os dados mostrados são exemplos.

| Pergunta | Tela | Recurso |
| --- | --- | --- |
| Por onde começo? | Home sem histórico | Comece por aqui, com três portas |
| Onde parei? | Home e leitor | Continuar até a seção, com a posição salva |
| O que estudar agora? | Home e Trilhas | Próximo da trilha e revisões devidas, sempre com o motivo |
| Onde encontro um conceito? | Busca e Biblioteca | Resultado por seção, com tipo |
| Como pratico sem ver a resposta? | Leitor e simulados | Responda antes de abrir; janela de apresentação |
| O que revisar depois do exercício? | Meu estudo | Preciso revisar, com data escolhida |
| Como acompanho sem confundir leitura com domínio? | Meu estudo | Estados separados, sem percentual de domínio |

### 1. Home

![Home: desktop e celular (wireframe proposto)](assets/wireframe-home.svg)

*Home · desktop e celular · wireframe proposto*

- **Ordem:** cabeçalho, faixa da capa, aviso, Continuar, três cartões (Revisão devida, Próximo da trilha, Praticar) e trilhas.
- **Sem histórico:** Comece por aqui oferece as três portas que o README já usa: aprender do zero, consultar e revisar, praticar.
- **Com histórico:** a faixa da capa encolhe, e Continuar abre a seção e a posição salvas.
- **Sem invenção:** nada de percentuais, sequências de dias ou recomendação "inteligente"; cada cartão diz o motivo.
- **Atalhos:** busca visível, com `Ctrl+K`; o atalho `/`, de uma tecla só, pode ser desligado nas preferências, como pede o critério 2.1.4 do WCAG.

### 2. Índice de trilha

- Descrição tirada do README da pasta, tempo total estimado e público.
- Lista ordenada com número, título, tempo, pré-requisitos e estado em texto e ícone; botão Começar ou Continuar.
- Uma linha "por que esta ordem", vinda do manifesto.
- Itens de outras trilhas entram como pré-requisito com link, sem cópia da página.

### 3. Aula longa de System Design

![Leitor de case FSI: desktop e celular (wireframe proposto)](assets/wireframe-leitor.svg)

*Leitor de case FSI · desktop e celular · wireframe proposto*

- Ficha no topo com tempo, pré-requisitos, trilhas e estado de estudo.
- Breadcrumb até a seção atual; cada título tem link copiável.
- Sumário com níveis 2 e 3 no desktop. Abaixo de 1024 px, uma barra fixa mostra a seção atual, a posição e o botão Nesta página.
- Modo foco esconde as laterais; tamanho do texto e tema ficam no cabeçalho.
- Rodapé com anterior e próxima da trilha, estado de estudo e link para o arquivo no GitHub.

### 4. Case FSI com diagrama

- Sumário agrupado em Entender (1–4), Desenhar (5–7), Aprofundar (8–12), Operar (13–18), Praticar (19–22) e Referências. A numeração foi confirmada no case 01; o build valida os outros nove e, se não bater, usa o sumário simples.
- O bloco Foco, Idioma e Formato vira a ficha do case; o caminho no repositório vai para o rodapé.
- O "Sumário" do arquivo continua no Markdown, mas aparece recolhido, porque repete o sumário lateral.
- Ampliar abre um diálogo com zoom de 50% a 400% por botões e pelas teclas + − 0, além de arrastar, ajustar à tela e ver a definição em texto.
- Tabelas com primeira coluna fixa e sombra indicando rolagem. O atalho Praticar este case leva às perguntas comentadas e à simulação de 45 minutos.

### 5. Simulado: visão da candidata

- Só o conteúdo do `candidato.md`: objetivo, contexto e impacto, arquitetura mínima, informações disponíveis, restrições e entrega.
- Nenhum link para o material do instrutor nesta página.
- Opção de fonte grande para compartilhar a tela e versão para impressão.

### 6. Interface do instrutor

![Console do instrutor e janela de apresentação (wireframe proposto)](assets/wireframe-simulado.svg)

*Console do instrutor e janela de apresentação · wireframe proposto*

- Entrada por Prática › Modo instrutor, com aviso antes de abrir o gabarito.
- O console reúne o roteiro com os tempos sugeridos no README da trilha, as evidências em cartões, as perguntas neutras do guia, as dimensões da rubrica, as alternativas válidas e o debrief.
- Os cartões vêm dos rótulos B1 a B5 e V1 a V2 do `instrutor.md`. Se o padrão não existir, o arquivo é exibido como hoje.
- Revelar envia só a evidência escolhida para a janela de apresentação; Reiniciar limpa a apresentação.
- As duas janelas precisam estar no mesmo navegador. Sem isso, o instrutor compartilha a página da candidata e lê as evidências em voz alta.
- O registro da sessão é um modelo em branco, salvo e exportado localmente, nunca publicado.

### 7. Busca

- Diálogo no desktop e tela cheia no celular, aberto por botão, `Ctrl+K` ou `/`.
- Resultados agrupados por página, com subresultados por seção, tipo, breadcrumb e trecho com o termo destacado.
- Filtros por tipo: Fundamento, System Design, Case, LP, Simulado e Referência.
- Ficam fora do índice padrão as páginas do instrutor e o conteúdo das respostas recolhíveis.
- Sem resultado, a busca sugere termos próximos e mostra os tipos disponíveis.

### 8. Meu estudo: revisão e progresso

| Estado | Como entra | Significado |
| --- | --- | --- |
| Não iniciado | Padrão | Nada registrado |
| Em estudo | Automático, quando há posição de leitura salva | Leu parte do conteúdo; não indica domínio |
| Preciso revisar | Escolha da pessoa, com data de retorno | Quer voltar ao assunto |
| Consigo explicar | Escolha da pessoa, após explicar em voz alta sem consulta | Autoavaliação |
| Praticado em simulado | Ao fim de um simulado ou manualmente, com data | Aplicou em prática oral |

- Chegar ao fim da página não muda nenhum estado.
- A tela lista revisões devidas com data e motivo, itens em estudo com retomada, favoritos por seção e práticas com data.
- Contagens por estado e por trilha, sem percentual de domínio nem previsão de nível.
- Preferências: perfil local, tema, tamanho do texto, disponibilidade, exportar, importar e apagar.
- O estado vazio explica onde os dados ficam e que eles não saem do navegador.

### Leadership Principles

- Índice dos 16 princípios com o número de perguntas. Cada página traz as perguntas em português e inglês, os aprofundamentos recolhidos e o guia STAR.
- Os templates públicos continuam em branco. Respostas pessoais ficam só no navegador, exportáveis e rotuladas como privadas.
- Nenhum nível de carreira é atribuído pela quantidade de histórias ou perguntas.

## Plano técnico de implementação

A proposta mantém o gerador próprio em Node 22, o S3 e o CloudFront, sem framework, backend, login ou serviço pago. A única mudança de infraestrutura possível é na CSP, e só se a busca com Pagefind for aprovada.

### Fases

| Fase | Entregas | Diagnóstico resolvido |
| --- | --- | --- |
| P0 | Tokens e temas; cabeçalho e breadcrumb; leitor com largura de leitura, sumário em todos os tamanhos, posição salva e link por seção; tabelas, código e diagramas; home com capa; contraste, foco e alvos; busca sem material do instrutor nem respostas, ainda no índice atual; testes atualizados | D1 a D8, D12 e D13 |
| P1 | Busca por seção; estados de estudo, revisão, favoritos, perfis e exportação; trilhas e manifesto; console do instrutor e janela de apresentação; cache com hash | D9, D10, D11 e D15 |
| P2 | Modo perguntas com revisão espaçada; planejador semanal; Mermaid pré-renderizado; busca só do instrutor; anotações privadas de LP | Depois do teste com tarefas reais |

Ajustei a divisão pedida em um ponto: a correção do spoiler na busca entrou em P0, porque o vazamento de gabarito foi confirmado; a nova busca continua em P1.

### Arquivos

| Arquivo | Mudança | Fase |
| --- | --- | --- |
| `site/tokens.css`, novo | Tokens claro e escuro, escala em rem, espaço, raio e elevação | P0 |
| `site/site.css` | Reescrito sobre os tokens, sem as 162 cores fixas | P0 |
| `site/theme-init.js`, novo | Aplica tema e tamanho de texto antes da pintura, carregado de forma síncrona no `<head>` | P0 |
| `site/site.js` | Dividido em módulos: navegação, leitor, busca, estudo e apresentação | P0 e P1 |
| `site/content.mjs` | Seções viram as cinco entradas; páginas do instrutor marcadas | P0 |
| `site/curriculum.mjs`, novo | Trilhas, ordem, pré-requisitos, relacionados, tempo e público | P1 |
| `scripts/build-site.mjs` | Layout, breadcrumb, sumário agrupado, link nos títulos, blocos semânticos, botão de copiar, nome das tabelas, visualizador de diagrama, novas páginas, índice por seção e nomes com hash | P0 e P1 |
| `scripts/check-site.mjs` | Verifica instrutor fora da busca, contraste dos tokens, manifesto e redirecionamentos | P0 e P1 |
| `scripts/check-browser.mjs` | Testa tema, texto, folha do sumário, 320 px, diagrama, busca e apresentação | P0 e P1 |
| `scripts/deploy_frontend.sh` | Dois `sync`: assets com hash e cache imutável; HTML e índices com a política atual | P1, com sua aprovação |
| `site/aws-stack.json` | CSP com `'wasm-unsafe-eval'` e `worker-src 'self' blob:` | P1, só se D2 aprovar o Pagefind |
| `site/assets/capa/`, novo | Variantes da capa em AVIF, WebP e JPEG | P0, quando a imagem chegar |

P0 não adiciona dependências. As variantes da capa são geradas uma vez, fora do build, e versionadas, para evitar uma dependência nativa.

### Busca: duas opções

| Critério | Pagefind | Índice próprio por seção |
| --- | --- | --- |
| Português | Stemming em português | Acentos normalizados e palavra inteira, sem stemming |
| Carga | Fragmentos baixados conforme a busca | Um arquivo único; tamanho a medir sem instrutor e respostas |
| Exclusões | `data-pagefind-body` e `data-pagefind-ignore` | Regra no build |
| CSP | Precisa liberar WebAssembly e workers | Sem mudança |
| Manutenção | Binário instalado pelo npm | Código próprio, testado no build |

Recomendo o Pagefind depois de um spike de um dia que meça tamanho do índice e tempo de resposta neste conteúdo. Se a mudança de CSP não for aceita, o índice próprio cobre o essencial.

### Persistência no navegador

| Questão | Resposta |
| --- | --- |
| Onde ficam os dados | No `localStorage` da origem do site, numa chave versionada por perfil, como `ap:v2:vitoria` |
| Limite | Cerca de 5 MiB por origem; estimo poucas dezenas de KB para as 94 páginas |
| Dispositivos, navegadores e origens | Nada sincroniza. Cada aparelho, navegador e domínio tem dados próprios; um domínio novo começa vazio, salvo importação |
| Limpar dados do site | Apaga tudo; Meu estudo avisa e lembra de exportar |
| Safari | Pode apagar os dados após 7 dias de uso sem visitar o site |
| Pessoas no mesmo aparelho | Perfis locais (Vitória, Tomas, convidado) separam as chaves; isso não é segurança |
| Exportar e importar | Arquivo JSON com validação de esquema; na importação, vale o registro mais recente |
| Versões | Campo `schema`. A marcação atual de "lido" migra para Em estudo, nunca para Consigo explicar |
| Falhas | Sem armazenamento, o site funciona e avisa que nada será salvo |
| Privacidade | Nenhum dado vai para analytics, APIs ou serviços externos |

A sincronização entre Tomas e Vitória fica fora do escopo: exigiria backend. A troca de arquivos exportados é o único mecanismo real.

### Planejamento de estudo

- A configuração é explícita e editável: dias da semana, minutos por sessão, divisão entre leitura, prática e revisão, e data da entrevista opcional.
- A disponibilidade informada, cerca de 3 h "na semana" e pelo menos 6 h "no fim de semana", entra como sugestão a confirmar, não como 21 ou 27 h semanais.
- A Sessão de hoje combina o próximo item da trilha, as revisões devidas e uma prática, dentro do tempo configurado.
- Sem data confirmada, não há contagem regressiva.

### Cache e desempenho

- Hoje todos os arquivos usam `max-age=0, s-maxage=3600`, com invalidação `/*` a cada deploy.
- A proposta põe hash no nome de CSS, JS, fontes e imagens, com `max-age=31536000, immutable`; HTML, índices e manifesto mantêm a política atual.
- Metas, ainda hipóteses: CSS e JS próprios até 40 KB comprimidos; Mermaid só nas páginas com diagrama, como já acontece; capa só na home.

### Riscos

| Risco | Mitigação |
| --- | --- |
| O logotipo sugerir afiliação | Aviso visível, logotipo só na capa e decisão D1 registrada |
| Mudança de CSP para a busca | Spike antes da decisão; alternativa sem mudar a CSP |
| Perda de progresso | Exportação, importação e aviso sobre o limite do Safari |
| Testes atuais quebrarem, porque verificam o texto do hero e seis cartões | Atualizar `check-browser.mjs` na mesma entrega |
| Agrupamento falhar em algum case | Validação no build, com sumário simples de reserva |
| Mermaid ilegível no escuro | Variáveis próprias e revisão das 20 páginas com diagrama |
| Escopo crescer | P2 só depois do teste com tarefas reais |

## Plano de validação com tarefas reais

Nove tarefas, feitas pela Vitória e pelo Tomas no site atual e depois no novo, mostram se o percurso melhorou. Nenhum teste com pessoas foi executado ainda; as metas abaixo são hipóteses.

- **Participantes:** Vitória, no estudo individual, e Tomas, na condução. Uma sessão de 30 a 40 minutos por pessoa, pensando em voz alta, no notebook e no celular.
- **Linha de base:** as mesmas tarefas no site atual, antes da mudança. Sem essa comparação, não dá para afirmar melhora.
- **Registro:** conclusão (sim, parcial ou não), erros, momentos de "onde estou?", ajuda pedida e passos comparados ao caminho mínimo.
- **Automação:** os testes de navegador cobrem as tarefas 7 e 8 em 320, 390, 820, 1440 e 1920 px, mas não substituem as pessoas.

| # | Tarefa | Ponto de partida | Sucesso observável | Meta (hipótese) |
| --- | --- | --- | --- | --- |
| 1 | Retomar a última seção estudada | Home, um dia depois de estudar | Chega à seção certa, na posição salva | Sem ajuda, em até 2 ações |
| 2 | Encontrar "idempotência" e chegar a um exercício relacionado | Qualquer página | Abre a seção do conceito e, dali, uma pergunta ou simulado | Sem passar pelo material do instrutor |
| 3 | Percorrer uma aula longa sem se perder | Case 01, seção 1 | Diz em que seção está e volta a uma anterior pelo sumário | Nenhuma busca por seção rolando às cegas |
| 4 | Abrir e entender um diagrama no celular | Case 01 no celular | Amplia o diagrama e lê os rótulos | Rótulos legíveis sem o zoom do sistema |
| 5 | Conduzir um simulado sem mostrar respostas | Tomas compartilhando a tela | Apresenta o caso e libera duas evidências | Nenhum trecho de gabarito na tela compartilhada |
| 6 | Marcar dificuldade e achar o assunto na revisão | Uma seção qualquer | Marca Preciso revisar e encontra o item em Meu estudo | Até 3 ações |
| 7 | Trocar o tema e aumentar o texto | Case 01 | Tema escuro e texto maior, sem rolagem lateral da página | Tabelas rolam só dentro do bloco |
| 8 | Abrir uma seção por link direto e recarregar | Link copiado de um título | A seção aparece abaixo do cabeçalho, também depois de recarregar | Nenhuma seção escondida pelo cabeçalho |
| 9 | Identificar o próximo assunto e o motivo | Home | Diz qual é o próximo item e por quê | Explica o motivo com as palavras do cartão |

## Critérios de aceite

A primeira entrega só é aceita quando todos os itens aplicáveis abaixo estiverem marcados, com evidência de teste ou revisão.

### Funcional

- [ ] As 111 páginas atuais respondem nos mesmos endereços, e a verificação de links continua sem falhas.
- [ ] As âncoras atuais funcionam por link direto e depois de recarregar.
- [ ] A home sem histórico mostra Comece por aqui; com histórico, Continuar leva à seção salva.
- [ ] O sumário fica disponível em 320, 390, 820, 1440 e 1920 px.
- [ ] Os diagramas das 20 páginas que os têm abrem no visualizador ampliado.
- [ ] Blocos de código têm botão Copiar, com confirmação anunciada.
- [ ] A busca encontra "idempotência" e "idempotencia" e leva à seção.
- [ ] O conteúdo continua legível sem JavaScript.

### Visual

- [ ] Nenhuma cor fixa fora de `tokens.css`.
- [ ] Laranja apenas em ação, local atual e progresso.
- [ ] Capa só na home, inteira, sem texto por cima e com espaço reservado.
- [ ] Temas claro, escuro e do sistema, salvos e sem flash ao carregar.
- [ ] Linha de leitura com no máximo 75 caracteres no desktop.

### Pedagógico

- [ ] Nenhum percentual de domínio, sequência de dias ou recomendação sem motivo.
- [ ] Chegar ao fim da página não muda o estado de estudo.
- [ ] Respostas recolhidas por padrão, com o rótulo Responda antes de abrir.
- [ ] Nenhum conteúdo técnico removido ou resumido para caber no layout.

### Acessibilidade, com o WCAG 2.2 AA como referência

- [ ] Texto com pelo menos 4,5:1 e componentes com 3:1, nos dois temas, verificados no build.
- [ ] Nenhum texto abaixo de 13 px; corpo de leitura com 17 px ou mais.
- [ ] Foco visível em todos os controles, com 3 px e 3:1, nunca coberto pelo cabeçalho fixo.
- [ ] Alvos de pelo menos 24 px, e 44 px nos controles de toque.
- [ ] Tarefas 2, 3 e 6 concluídas só com teclado.
- [ ] O atalho `/` pode ser desligado.
- [ ] Sem rolagem lateral da página em 320 px nem com texto em 200%.
- [ ] Movimento reduzido respeitado; diálogos e menus com foco controlado e saída por Esc.
- [ ] Revisão manual com leitor de tela, porque ferramenta automática não comprova conformidade.

### Privacidade

- [ ] A busca padrão exclui páginas do instrutor e respostas recolhíveis, e um teste falha se elas aparecerem.
- [ ] A página da candidata não tem links para o material do instrutor.
- [ ] Nenhum dado de estudo sai do navegador, e a CSP não ganha novos destinos de conexão.
- [ ] Templates publicados continuam em branco; nenhum feedback, transcrição ou história privada entra em `dist/`.
- [ ] As decisões D1, D3 e D4 estão registradas antes do deploy.

### Preservação

- [ ] Markdown inalterado, salvo mudanças de conteúdo aprovadas.
- [ ] Mermaid, SVG, Draw.io e respostas recolhíveis renderizados como hoje ou melhor.
- [ ] Nenhum commit, push, deploy ou invalidação sem sua autorização.

## Próximo passo e decisões

Depois da sua aprovação, a primeira entrega é o leitor completo aplicado às 94 páginas, validado no percurso de estudar um case FSI do começo ao fim, no notebook e no celular. Ela muda a experiência de estudo, não só a home.

1. Tokens, temas claro, escuro e do sistema, e ajuste de texto.
2. Novo cabeçalho, breadcrumb até a seção e lateral só com o contexto atual.
3. Leitor com 68ch, sumário em todos os tamanhos, folha Nesta página no celular, posição salva, link por seção, anterior e próxima.
4. Diagramas ampliáveis, tabelas com primeira coluna fixa e código com Copiar.
5. Busca atual sem páginas do instrutor e sem respostas, eliminando o spoiler.
6. Contraste, foco e alvos corrigidos, com os testes de navegador atualizados.

A validação usa as tarefas 3, 4, 7 e 8, antes e depois, além das verificações automáticas. Entrego numa branch local, com capturas da prévia; commit, push e deploy só com sua autorização. A home com a capa vem na segunda fatia do P0, assim que a `amazon.jpg` chegar.

| # | Decisão | Opções | Recomendação |
| --- | --- | --- | --- |
| D1 | Uso da capa com o logotipo da Amazon | Manter com aviso de independência, ou uma versão sem logotipo | Manter com aviso, se você aceitar o risco de marca; isto não é parecer jurídico |
| D2 | Motor de busca | Pagefind, com mudança de CSP, ou índice próprio | Pagefind, depois do spike |
| D3 | Indexação por buscadores | Manter, bloquear o site todo ou só as páginas do instrutor | Bloquear o site todo; isso não é controle de acesso |
| D4 | Nome da candidata na página de prática de inglês | Manter ou trocar por título neutro | Título neutro |
| D5 | Direção visual | A ou B | A, Capa e carvão |
| D6 | Perfis locais | Vitória, Tomas e convidado, ou perfil único | Três perfis |
| D7 | Data da entrevista | Informar ou deixar em branco | Informar só quando confirmada |

**Pendência:** o arquivo `amazon.jpg` não chegou em três verificações. Sem ele, cores e composição da capa seguem provisórias.
