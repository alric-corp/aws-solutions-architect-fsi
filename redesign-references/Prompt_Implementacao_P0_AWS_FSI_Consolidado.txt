# Prompt — implementação local do P0 consolidado

**Uso:** enviar ao agente apenas depois de aprovar a direção. A existência deste arquivo não é autorização de commit, push ou publicação.

---

Implemente localmente o P0 do redesign da plataforma `alric-corp/aws-solutions-architect-fsi`, usando o documento **Consolidacao_Redesign_AWS_FSI.md** como referência principal. As pesquisas originais são evidência e contexto; em conflitos de proposta, prevalece a consolidação.

O objetivo é melhorar o percurso real de estudo. Não entregue apenas uma nova home e não substitua a aplicação pelo protótipo demonstrativo.

## Caminhos locais informados pelo proprietário

**Projeto:** `/Users/tomasalric/Desktop/aws-solutions-architect-fsi`

**Imagem da capa:** `/Users/tomasalric/Desktop/aws-solutions-architect-fsi/amazon.jpg`

Confirme esses caminhos no ambiente local antes de iniciar. Inspecione a imagem real e preserve o original. O caminho absoluto serve apenas para localizar a origem: não o utilize no HTML distribuído. Integre a capa por um caminho de assets compatível com o build, mantendo a proporção e sem recriar ou recortar o logotipo.

Este pacote também contém uma cópia da imagem enviada nesta conversa, como referência. Não sobrescreva silenciosamente uma versão diferente existente no projeto local.

Os relatórios originais e o QA são material de apoio. Em divergências de design, prevalece a consolidação; o escopo desta execução permanece limitado ao P0. As capturas e os wireframes citados em `assets/` no relatório do Claude não acompanharam o arquivo recebido e não fazem parte deste pacote. Não invente essas imagens nem bloqueie a implementação por sua ausência.

Mantenha os briefings e relatórios fora das pastas publicadas. Os documentos são instruções de trabalho, não conteúdo para incluir automaticamente no site, em `dist/` ou nos índices de busca.

## 1. Comece pelo checkout real

Leia AGENTS.md e instruções aplicáveis. Inspecione branch, commit, status e mudanças existentes. Preserve trabalho de outras pessoas/agentes. Não faça reset, clean, checkout destrutivo, commit, push, PR, deploy ou mudanças de infraestrutura.

As pesquisas anteriores usaram `39298e79fc762a88cf101b01cf45dbc414b1bcca` e `603dcf0`. Não volte a um commit antigo: use o checkout atual e registre diferenças relevantes. Os números 94 documentos, 111 páginas e 13.996 links pertencem à auditoria anterior; gere o inventário atual.

O código conferido em `603dcf0` tinha gerador próprio em Node >=22, Markdown, Mermaid, Source Sans 3, Manrope, CSS e JavaScript próprios. Confirme o estado atual. Preserve o gerador; não migre para React, Next.js, Astro ou outro framework sem nova decisão.

Execute baseline local de build e testes disponíveis, depois capture home, leitor, case, busca e simulado. Não execute `setup:aws`, `deploy` nem scripts que alterem AWS. Não leia credenciais ou segredos.

## 2. Referências e precedência

Use:
- Consolidacao_Redesign_AWS_FSI.md — contrato consolidado.
- redesign-plataforma-estudo-aws-sa-fsi.md — diagnóstico do Claude, atribuído ao snapshot anterior.
- Pesquisa_UX_UI_AWS_FSI.md — estrutura pedagógica, fluxo e limites.
- Proposta_Visual_AWS_FSI.html — referência visual, não código para substituir o frontend.
- amazon.jpg — capa real enviada pelo usuário.

Os materiais privados de recrutamento, transcrições e avaliações individuais NÃO entram no Git público ou em dist. Não copie este briefing para uma pasta publicada por conveniência.

## 3. Escopo visual aprovado para esta implementação

Direção: **Capa e carvão + leitor editorial**.

Preserve inicialmente o nome Arquitetura em prática. Use Source Sans 3 já hospedada; monoespaçada do sistema para código. Elimine Manrope apenas depois de confirmar que a substituição não quebra hierarquia ou layout. Preserve avisos de licença necessários. Não envie fontes como entregáveis separados.

Aplique os tokens da consolidação. Fonte do corpo inicial 1.125rem, entrelinha 1,65 e coluna próxima de 68ch. Não trate 68ch como contagem literal de caracteres. Tabelas e diagramas podem usar faixa mais larga.

Temas Claro/Escuro/Sistema; primeiro acesso Sistema, fallback Claro. Persistir preferência com tratamento de erro. Inicialização compatível com CSP, sem liberar unsafe-inline/unsafe-eval.

Tokens de foco precisam funcionar também sobre cabeçalho escuro. Não use laranja vivo como texto pequeno sobre branco. Sem glow, glassmorphism, carrossel, gráficos decorativos ou cartões para cada parágrafo.

Na home, mantenha a capa inteira e proporcional, com texto ao lado no desktop. No celular, coloque a tarefa principal antes da arte. Em retorno, priorize Continuar. Não repita a capa nas páginas de estudo. Se amazon.jpg não estiver disponível, não recrie o logo nem substitua a imagem: registre a pendência e conclua o restante.

O uso público de marca permanece sujeito à confirmação do proprietário; não publique o resultado.

## 4. P0.1 — leitor e busca sem spoilers

Implemente primeiro:
1. Cabeçalho, breadcrumbs e lateral contextual; não listar o acervo inteiro em todas as páginas.
2. Sumário H2/H3 hierárquico em todas as larguras, com botão Nesta página em mobile.
3. Modo foco, ajuste de texto e links copiáveis para títulos, mantendo IDs existentes.
4. Retomada por contentId + âncora + versão, com fallback. URL com fragmento explícito tem prioridade sobre histórico salvo.
5. Cópia de código com feedback acessível; tabelas rotuladas e rolagem local. Coluna fixa somente onde não esconder dados.
6. Diagramas ampliáveis, teclado, fechar por Esc e devolver foco. Preserve fonte Mermaid para tema e recuperação de falha. Não inverta SVGs indiscriminadamente.
7. Contraste, foco, controle por teclado, zoom, movimento reduzido e reflow.
8. Busca atual sem material do instrutor nem corpos das respostas; preservar perguntas e conteúdo explicativo público.
9. Correspondência por termos, não simples substring que faz STAR corresponder a estar. Preservar normalização de acentos e testar siglas.

A política de busca deve funcionar no build, não apenas esconder resultados com CSS. Não remover todo details indiscriminadamente. Classifique respostas com regra explícita; valide que títulos, descrições e trechos também não revelam causas.

Não instale Pagefind neste P0 nem altere CSP. A troca de motor é uma avaliação posterior.

## 5. P0.2 — home e percurso coerente

Navegação global: Início, Trilhas, Biblioteca, Praticar, Meu estudo.

Use endereços explícitos compatíveis com a distribuição atual, como /trilhas/index.html. Não presuma que CloudFront resolve qualquer subdiretório automaticamente. Preserve URLs .html e âncoras existentes.

Crie apenas o manifesto mínimo necessário para a navegação e o percurso, sem duplicar Markdown. Separe audience, política de publicação e política de busca.

Percurso piloto: Home → tema de transações/idempotência → F06 → seção equivalente no case de pagamentos → simulado de pedido durante falha como candidata → retorno à seção estudada.

Meu estudo neste P0 pode apresentar retomada e registros de leitura existentes. Não exiba controles de revisão/exportação sem implementação real. A consolidação multidimensional completa é P1; mantenha contrato compatível para não precisar remodelar depois.

O template compartilhado deve ser validado no acervo inteiro, não só no piloto. Não crie uma segunda versão isolada do site que pareça boa mas não carregue o conteúdo completo.

## 6. Preservação de dados e conteúdo

Não reescreva os fatos dos materiais. Não remova exemplos, condições, fontes ou advertências para reduzir altura.

Preserve marcações antigas de lido como registros de leitura com origem legacy. Não transforme lido em domínio nem apague a informação convertendo tudo para em estudo. Não invente datas.

Histórico de instrutor não deve contaminar Continuar da estudante. Perfis locais não são autenticação. Falha de armazenamento deve ser informada, sem impedir leitura.

Mantenha perguntas e candidato livres de atalhos acidentais para gabaritos. Gabaritos públicos continuam acessíveis deliberadamente; não diga que foram protegidos por autenticação.

A política de indexação externa/noindex não está autorizada por este prompt. Proponha a configuração, mas não altere robots, headers de produção ou CloudFront sem decisão explícita. Não confunda desindexação com privacidade.

## 7. Testes e critérios de conclusão

Use os scripts e ferramentas existentes. Atualize testes que dependiam de textos antigos, mas preserve a intenção dos testes; não os remova apenas para passar.

Verifique:
- Inventário de rotas e âncoras antes/depois sem perdas involuntárias.
- Markdown, tabelas, código, Mermaid, SVG e respostas renderizados.
- Busca por STAR, idempotência/idempotencia, retry, retentativa, TLS e checkout lento.
- Teste negativo que detecta conteúdo de instrutor/resposta no índice de estudante.
- Sumário disponível em 320, 390, ~820, 1440 e 1920 CSS px.
- Temas claro/escuro, texto ampliado e teclado.
- Foco visível e não encoberto; diálogo com saída e retorno de foco.
- Link direto e refresh; evitar salto posterior para histórico quando há hash explícito.
- Retomada sem JavaScript, no sentido de conteúdo ainda legível e links funcionando; recursos dependentes de JS devem degradar claramente.
- Armazenamento bloqueado sem quebra nem promessa falsa de salvamento.
- Nenhum dado pessoal nos arquivos de distribuição ou índices.
- Ausência de novos destinos externos e preservação da CSP.

Não declarar WCAG integral ou Safari testado sem execução. Não confundir capturas locais com produção. Rastreie bloqueios de ambiente e testes não executados.

## 8. Entrega

Entregue alterações locais, lista de arquivos, capturas reais de antes/depois, resumo do diff, comandos e resultados dos testes, pendências e instruções de preview.

Diferencie resultados medidos de metas. Não invente ganho de performance, aprovação de uso de marca ou eficácia pedagógica.

Não implemente P1/P2, login, backend, IA, sincronização remota ou publicação neste trabalho. Ao concluir o P0, pare para revisão.
