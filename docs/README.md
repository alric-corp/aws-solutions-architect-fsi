# Organização do repositório

Esta pasta reúne a documentação interna de operação e os relatórios do site. Ela não faz parte das páginas de estudo nem do índice de busca publicado.

## Documentação do site

- [Operação, prévia, validação e publicação](site/README.md).
- [Relatório histórico da implementação P0](site/P0-LOCAL.md).
- [Relatório histórico do isolamento dos cases FSI](site/CASES-ISOLAMENTO.md).

## Diretórios e arquivos principais

| Caminho | Responsabilidade |
|---|---|
| `site/` | Código do frontend, templates, estilos, metadados e configuração do site |
| `scripts/` | Geração, prévia, validação e ferramentas operacionais |
| `assets/` | Assets globais de origem usados pelo site |
| `docs/site/` | Operação e relatórios históricos |
| `technical-knowledge/`, `leadership-principles/`, `interview/`, `cases/`, `role/`, `progress/`, `templates/`, `references/` | Fontes Markdown e assets das áreas de estudo, preservando seus caminhos e URLs |
| `assets/amazon.jpg` | Fonte única da capa original, publicada pelo build em `/assets/amazon.jpg` |
| `dist/` | Site gerado, ignorado pelo Git |
| `.site/` | Evidências, capturas e arquivos auxiliares de validação local, ignorados pelo Git |
| `node_modules/` | Dependências instaladas, ignoradas pelo Git |

O antigo pacote `redesign-references/`, incluindo a cópia duplicada da capa, foi removido após sua implementação. A capa original foi organizada em `assets/amazon.jpg`, preservando seus bytes e sua URL pública. Os assets específicos de cada aula continuam junto do respectivo conteúdo.

Os comandos da documentação operacional são executados a partir da raiz do repositório.
