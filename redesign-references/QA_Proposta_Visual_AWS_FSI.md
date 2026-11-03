# Validação do demonstrador — Estúdio FSI

**Data:** 2 de novembro de 2026.  
**Objeto:** `Proposta_Visual_AWS_FSI.html`.  
**Escopo:** proposta visual independente. Não é a aplicação publicada, um build do repositório ou uma certificação de acessibilidade.

## 1. Método e limitações

O HTML foi renderizado com Playwright e o Chromium disponível no ambiente. Como a navegação para `file://` e para um servidor HTTP de loopback foi bloqueada por política do navegador, o conteúdo foi carregado em uma página isolada com `page.set_content`. Não foram alteradas políticas nem controles do ambiente.

Assim, os testes cobrem **renderização e interações no DOM do demonstrador**, mas não validam carregamento por URL, abertura por arquivo em outro dispositivo, atualização de rotas HTTP, hospedagem S3/CloudFront, cache ou entrega de assets em produção.

A proposta contém toda a imagem no próprio HTML e não depende de fonte, biblioteca, API ou imagem remota. Seu funcionamento fora do ambiente ainda deve ser conferido no navegador de uso. Nenhum arquivo da aplicação ou recurso AWS foi modificado.

## 2. Renderização responsiva

Foram verificadas 90 combinações: nove telas × cinco larguras × dois temas.

**Telas:** início, trilha, aula, case, candidata, instrutor, busca, revisão e Leadership Principles.

**Larguras:** 320, 390, 768, 1366 e 1920 CSS px. Temas claro e escuro. Altura de referência de 960 px; capturas adicionais em outros tamanhos estão no pacote.

**Resultado observado:** nenhuma combinação apresentou largura de documento maior que a viewport além de 1 px de tolerância. Em todas, apenas a tela selecionada estava visível. Isso não garante ausência de todo possível problema de reflow, zoom ou conteúdo real mais longo.

## 3. Interações verificadas

| Verificação | Resultado |
|---|---|
| Menu mobile expande a navegação | Passou |
| Alternância claro/escuro | Passou |
| Entrada e saída do modo foco | Passou |
| Aumento do corpo da aula para 21 px | Passou |
| Ausência de overflow global após aumento, na amostra mobile | Passou |
| Abertura do diálogo de diagrama | Passou |
| Fechamento por Escape | Passou |
| Retorno do foco ao botão que abriu o diálogo | Passou |
| Marcação de revisão aparece na tela de revisão | Passou |
| Busca por `idempotencia`, sem acento | Passou: três resultados na amostra |
| Busca por `retry` | Passou: dois resultados na amostra |
| Filtro de simulados | Passou |
| Mensagem de busca sem resultados | Passou |
| Abertura da vista demonstrativa de evidência | Passou |
| Alternância PT/EN da pergunta de liderança | Passou |
| Um título principal na vista ativa da homepage | Passou |
| Erros JavaScript não tratados, nos fluxos executados | Nenhum observado |
| Requisições HTTP(S) externas após injeção do HTML | Nenhuma observada |

A ausência de gravação persistente foi verificada no código: o estado de revisão fica em uma variável da página; o arquivo não chama `localStorage.setItem`. Não foi feito teste de persistência por recarregamento de URL, pois essa navegação estava bloqueada. Preferências e revisão no demonstrador são temporárias; exportação/importação e sincronização não foram implementadas.

## 4. Inspeção visual

Foram examinadas capturas da homepage e do leitor em desktop, e da homepage em mobile. O leitor escuro e o leitor mobile também foram capturados para comparação. Ajustes feitos no demonstrador após essa inspeção: remover contorno de foco do contêiner não interativo e recolher a navegação em mobile. O foco dos controles permanece estilizado.

Arquivos no pacote:
- `previews/proposta_inicio_desktop.png`
- `previews/proposta_leitor_desktop.png`
- `previews/proposta_leitor_escuro.png`
- `previews/proposta_inicio_mobile.png`
- `previews/proposta_leitor_mobile.png`

As imagens são capturas de uma **proposta**, não do site atual.

## 5. Contraste calculado

Usou-se luminância relativa sRGB e a fórmula de contraste da WCAG. Resultados apresentados com arredondamento de exibição:

| Cores | Razão |
|---|---:|
| Laranja `#FF9900` / branco `#FFFFFF` | 2,14:1 |
| Carvão `#15181C` / laranja `#FF9900` | 8,32:1 |
| Link `#985000` / branco `#FFFFFF` | 6,03:1 |
| Link `#985000` / fundo `#FAF8F4` | 5,68:1 |
| Link escuro `#FFAD33` / fundo `#15181C` | 9,56:1 |
| Texto secundário `#5A626C` / branco `#FFFFFF` | 6,18:1 |

Esses cálculos não substituem a avaliação dos demais estados, bordas, gráficos, tamanho de texto, semântica ou navegação. Não há declaração de conformidade WCAG integral.

## 6. O que continua pendente

URL e frontend da aplicação real; integração com conteúdo completo; preservação de todas as âncoras; teste de build; busca real do corpus; testes de privacidade do pacote de publicação; performance de rede/cache; atualização direta de rotas; todos os percursos de teclado; leitor de tela; zoom de 200%/400%; Safari/Brave reais; dispositivos físicos; teste de usabilidade com Tomas e Vitória.

A tela do instrutor usa um diálogo apenas para demonstrar um cartão. Na implementação final, o compartilhamento deve usar uma vista/janela isolada. O arquivo único de proposta contém todas as telas e não deve ser interpretado como proteção de gabarito ou autenticação.

Não foram executados Lighthouse, auditoria completa automatizada de acessibilidade ou teste de desempenho de produção. Não foi feita publicação.
