# Condução local e privada

A interface também atende os dois roteiros públicos aprovados em `site/loop-training/`. `npm run build` gera seus acessos completos em Praticar → Instrutor, com identificação abreviada dos entrevistadores. Os roteiros e as notas são públicos sem autenticação; somente os registros preenchidos permanecem no navegador, em namespace separado. O build público não lê a configuração local descrita abaixo.

O gerador lê exclusivamente `.site/loop-privado/source/agenda.json`, `behavioral.json` e `technical.json`. As configurações personalizadas, a saída e os relatórios ficam sob `.site/`, ignorada pelo Git e fora da seleção pública. Não copie esses arquivos para conteúdo, assets, issues ou commits do repositório público.

O código desta pasta é reutilizável. A publicação aprovada usa somente os três JSON versionados em `site/loop-training/`. Preserve os demais arquivos privados em `.site/loop-privado/` no checkout principal; eles não são recuperados de um checkout limpo do Git. Trabalhe diretamente em `main`, sem criar worktrees para este projeto.

Depois de um build público local para disponibilizar a fonte existente:

```sh
npm run build
node scripts/loop-private/build.mjs
node scripts/loop-private/preview.mjs --port 4321
```

O preview abre somente em `127.0.0.1`. Os identificadores e endereços dos dois documentos vêm da configuração privada e são exibidos ao iniciar. Não serve `dist/`, o repositório, configurações ou registros. Ctrl+C encerra o servidor. Não crie túnel público nem sirva a raiz do projeto.

Com a prévia em execução:

```sh
node scripts/loop-private/check.mjs
node scripts/loop-private/check-browser.mjs
```

Os testes também leem `.site/loop-privado/source/check-expectations.json`, um snapshot privado da agenda e dos casos selecionados. As expectativas personalizadas não fazem parte do código versionado.

O painel contém notas e agenda privadas. Compartilhe somente a janela de apresentação com a seleção conferida ou conduza oralmente se popups forem bloqueados. A janela recebe somente uma pergunta ou evidência, em iframe sem scripts ou acesso à origem do painel. Isso não é autenticação nem proteção contra acesso ao computador/perfil de quem conduz.

O registro usa um namespace próprio de localStorage por dia e sessão. Não altera o armazenamento do site de estudos. Bloqueio do armazenamento mantém dados só na memória da aba; exporte antes de fechar. A exportação contém apenas o registro selecionado, não é enviada a um serviço. Quem tem acesso ao perfil do navegador pode ler esses registros.

Não há GenAI, telemetria ou chamadas externas. A ferramenta é exclusivamente de preparação; não use assistência durante a entrevista real. Roteiros, tempos e estados de observação não são critérios oficiais, nota de nível ou previsão de contratação.

O gerador recusa fonte técnica alterada desde a seleção dos cartões; reconfira a projeção privada antes de atualizar seu hash. Não misture variantes para acomodar uma resposta. As divergências de experiência devem permanecer pendências, sem completar fatos com resultados de simulados.
