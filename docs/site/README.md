# Portal de estudo — operação

O site está publicado em **https://d3vd6n3vhor88e.cloudfront.net**. Os Markdown continuam sendo a fonte do conteúdo; o build gera HTML estático em `dist/`, incluindo busca, navegação, tabelas, imagens e diagramas Mermaid. Fontes e JavaScript são servidos pelo próprio site.

## Atualizar o conteúdo

Na raiz do repositório, com Node.js 22 ou superior, AWS CLI v2 e o perfil local `default` configurado:

```bash
# Necessário no primeiro uso ou quando package-lock.json mudar.
npm ci

# Depois de editar os Markdown:
npm run deploy
```

Esse comando verifica a conta e os recursos de destino, gera o site, valida os links, executa `aws s3 sync` com `--delete` no bucket exclusivo do portal, cria uma invalidação `/*` no CloudFront e espera sua conclusão. Uma falha interrompe o processo e retorna código diferente de zero. Se houver falha depois do sync, corrija a causa e execute novamente.

Para conferir as alterações previstas no S3 sem publicar ou invalidar:

```bash
npm run deploy -- --dry-run
```

Os arquivos elegíveis são `README.md` e os Markdown e assets **rastreados pelo Git** nas pastas de estudo definidas em [content.mjs](../../site/content.mjs). Alterações locais em arquivos já rastreados entram no build, mesmo antes do commit. Para uma aula ou imagem nova, adicione explicitamente o arquivo ao Git antes do deploy:

```bash
git add technical-knowledge/caminho/da-nova-aula.md
npm run deploy
```

Notas ignoradas pelo Git, `scratchpad/`, credenciais, `site/`, `scripts/` e os metadados do repositório não são copiados para o site. Os templates de acompanhamento publicados permanecem em branco; preenchimentos pessoais devem continuar na área privada.

A capa global tem uma fonte explícita em `assets/amazon.jpg` e continua publicada em `/assets/amazon.jpg`. Mover a fonte não altera o endereço usado pela homepage.

## Recursos provisionados

| Recurso | Valor |
|---|---|
| Conta | `712107929769` |
| Perfil local padrão | `default` |
| Região do bucket e da stack | `sa-east-1` |
| Stack CloudFormation | `aws-sa-fsi-site` |
| Bucket exclusivo | `aws-sa-fsi-site-712107929769-sa-east-1` |
| Distribuição CloudFront | `EJ8JP2ZRAM5OT` |
| URL | https://d3vd6n3vhor88e.cloudfront.net |

O site é público pelo CloudFront, com HTTPS e redirecionamento de HTTP. O bucket bloqueia acesso público, usa criptografia SSE-S3 e permite leitura somente ao CloudFront desta distribuição por Origin Access Control. A configuração segue a [documentação de OAC da AWS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html).

Não é necessário configurar domínio ou certificado próprio: a distribuição usa seu endereço `cloudfront.net`. Os demais buckets e distribuições da conta não participam deste deploy. S3 e CloudFront seguem a cobrança de uso da conta; não há servidor de aplicação, banco de dados ou pipeline permanente.

Os IDs são lidos dos outputs do CloudFormation a cada execução. Uma cópia local sem credenciais fica em `.site/deployment.json`, ignorada pelo Git. A conta é conferida antes de qualquer escrita. Para selecionar outro perfil **da mesma conta**, use `AWS_PROFILE=nome npm run deploy`.

## Configuração inicial e mudanças na infraestrutura

O provisionamento inicial já foi executado. O template está em [aws-stack.json](../../site/aws-stack.json). Após uma alteração deliberada nesse template, aplique com:

```bash
npm run setup:aws
npm run deploy
```

O setup usa CloudFormation e pode ser repetido: uma configuração sem alterações não cria outra distribuição. O bucket tem política `Retain` para evitar a perda de conteúdo se a stack for removida. Remover a stack não remove o bucket nem seus objetos.

Para provisionar em outra conta ou região, informe explicitamente `SITE_ACCOUNT_ID`, `AWS_PROFILE`, `AWS_REGION` e, se necessário, `SITE_STACK_NAME` nos comandos de setup e deploy. O padrão continua preso à conta pessoal acima.

## Prévia e validação

```bash
npm run build
npm run check
npm run preview
```

A prévia abre em `http://127.0.0.1:4173`. A porta pode ser alterada com `PORT=4174 npm run preview`. Encerre o servidor com `Ctrl+C`.

`npm run check` verifica todas as páginas, links internos, âncoras, referências a assets, índice de busca e limites dos arquivos publicáveis. Ele é executado automaticamente no deploy.

Para testar a interface após mudanças no gerador, CSS, JavaScript ou diagramas, mantenha a prévia aberta e execute em outro terminal:

```bash
CHROMIUM_PATH=/caminho/do/chromium npm run test:browser
```

No macOS Apple Silicon, o teste também encontra um Chromium Headless Shell previamente instalado pelo Playwright. Ele verifica navegação, busca, respostas recolhidas, imagens, progresso de leitura, todos os diagramas Mermaid, leitura sem JavaScript e layout de celular. Não instala um navegador automaticamente. Capturas ficam em `.site/cases-isolation/after/`.

Para executar os mesmos testes no site publicado:

```bash
SITE_TEST_URL=https://d3vd6n3vhor88e.cloudfront.net npm run test:browser
```

O progresso de leitura fica no `localStorage` do navegador; ele não é enviado à AWS nem sincronizado entre dispositivos. O conteúdo continua legível sem JavaScript; busca, menu móvel, diagramas renderizados e progresso dependem dele.

## Cache e URLs

O sync publica apenas `dist/`. `--delete` remove do bucket os arquivos que saíram do build. Os objetos têm `Cache-Control: public,max-age=0,s-maxage=3600,must-revalidate`: o navegador revalida e o CloudFront pode manter o conteúdo por uma hora. A invalidação `/*` remove as versões anteriores do cache de borda após cada deploy. Veja as referências de [S3 sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html) e [CloudFront create-invalidation](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html).

As aulas têm URLs `.html`, e os índices de seção usam `/pasta/index.html`. Compartilhe os links produzidos pelo site. Uma URL inexistente retorna HTTP 404 com uma página de orientação. A raiz `/` abre a página inicial. Essa estrutura dispensa regras de reescrita ou fallback de SPA.

Se preferir executar manualmente o sync de um build já validado, os comandos equivalentes são:

```bash
aws s3 sync dist/ s3://aws-sa-fsi-site-712107929769-sa-east-1/ \
  --profile default --region sa-east-1 --delete --no-follow-symlinks \
  --cache-control 'public,max-age=0,s-maxage=3600,must-revalidate'

aws cloudfront create-invalidation \
  --profile default --distribution-id EJ8JP2ZRAM5OT --paths '/*'
```

O script `npm run deploy` acrescenta as verificações de destino e a espera pela invalidação; é o caminho normal para atualizações.
