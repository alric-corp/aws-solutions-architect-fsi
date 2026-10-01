# 11 — Git, CI/CD e infraestrutura como código

**Base:** perguntas do mock sobre controle de versão, operações Git, workflow e CLI. **Complemento:** relacionar histórico, automação, identidade e segurança da mudança.

## Versionar não é só guardar código

Controle de versão acompanha mudanças e permite comparar estados. Git é distribuído; cada clone pode manter histórico local, diferentemente de uma mera pasta sincronizada. [Fonte T19](../../referencias/README.md#t19)

Também é possível versionar contratos de API, infraestrutura, documentação e testes. Isso não torna segredos, dados de clientes ou todo artefato binário apropriados para o repositório.

## Saber explicar as operações

No treino, diferencie área de trabalho, staging, commit e remoto. Explique branch, merge, conflito, revert, fetch e push com um episódio ou laboratório identificados como tal.

Não proponha rebase ou reescrita de histórico compartilhado sem considerar a colaboração. “Escolhi CLI” precisa de contexto: repetibilidade, inspeção, automação ou preferência são motivos diferentes; interface gráfica não é automaticamente menos profissional.

## Pipeline como mecanismo de confiança

Descreva validação, testes, build, identificação de artefato, promoção, aprovação aplicável, implantação e verificação. A imagem testada deve ser identificável no deploy. Infraestrutura como código ajuda a revisar alterações, mas não impede que um plano tecnicamente válido contenha uma decisão perigosa.

Inclua controles para segredos, dependências e permissão de implantação. Não grave credenciais permanentes só para simplificar um laboratório. OIDC entre GitHub Actions e AWS permite assumir papel com credenciais temporárias; a trust policy deve restringir contexto, como repositório e referência autorizados. [Fonte T24](../../referencias/README.md#t24)

<a id="rollback"></a>
## Rollback e compatibilidade

Voltar um commit é uma operação de código. Reverter uma migração de dados, um evento já publicado ou um efeito financeiro é outra coisa. Defina compatibilidade entre versões e recuperação de trabalho em andamento.

Exercício: um deploy muda o schema e o consumidor antigo ainda existe. O que precisa ser compatível? Qual evidência antecede a remoção do campo antigo? Como o teste detecta mistura de versões?

## Perguntas de aprofundamento

“Somente código entra no Git?” “Qual workflow você realmente utilizou?” “Como sabe qual versão está no ambiente?” “Que permissão o pipeline não deveria ter?” “Por que escolher CLI em vez de SDK ou ferramenta declarativa neste caso?”

## Prática segura com este próprio repositório

Inspecione `git status --short`, compare mudanças rastreadas com `git diff` e abra os arquivos novos. Selecione explicitamente o conteúdo. Confira o diff do staging antes de commit.

`.gitignore` não desfaz rastreamento existente. [Fonte T13](../../referencias/README.md#t13) Não execute `git add .` por hábito em uma árvore que contém histórias e anotações privadas.

## Entrega

Use [PoC](../../templates/poc.md) para um pipeline de laboratório. Registre o que foi executado, o que apenas foi planejado e qual falha foi testada. Não apresente o laboratório como implantação em ambiente bancário real.
