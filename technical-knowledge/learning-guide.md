# Guia editorial — aulas de arquitetura para iniciantes

> Este guia é para quem escreve ou mantém o material. Para estudar, comece pela [trilha System Design a partir do zero](02-system-design/00-system-design-from-zero.md).

Este guia é a referência curta para escrever as aulas da trilha de System Design a partir do zero, usando um cenário concreto como fio condutor. As regras valem para qualquer capítulo; escolhas de uma aula específica ficam na própria aula ou, quando interessam só à manutenção, nas [notas de manutenção](#manutencao) ao final.

A pessoa que lê **começa sem experiência**. Escreva para alguém que ainda não sabe o que é cliente, servidor, API, banco de dados ou um serviço AWS. A meta de cada aula é que essa pessoa consiga **explicar o que acontece** em um fluxo real e também ler a aula sozinha.

## Cinco funções de uma página de estudo

Toda página de estudo precisa cumprir cinco funções. Elas são critérios de qualidade, não títulos obrigatórios:

1. **Orientar** — dizer onde a pessoa está, o que vai conseguir explicar ao final e como voltar ao índice.
2. **Construir compreensão** — apresentar cada conceito quando ele se torna necessário, a partir de uma situação concreta.
3. **Permitir raciocínio** — mostrar escolhas, alternativas e limites, não apenas respostas prontas.
4. **Verificar entendimento** — oferecer perguntas ou tarefas respondíveis com o que foi ensinado, com respostas recolhidas.
5. **Dar continuidade** — indicar o próximo passo que existe, o que está apenas planejado e onde aprofundar.

## Tipos de página

Nem toda página precisa da mesma estrutura. Cenário, diagrama, seis perguntas e exercício são esperados nas aulas guiadas, não em todo documento do repositório.

| Tipo | Para que serve | O que costuma ter |
|---|---|---|
| Introdução conceitual | Apresentar uma ideia ou um percurso | Situação, explicação, poucos exemplos e links de continuidade |
| Aula de decisão arquitetural | Construir uma decisão a partir de uma necessidade | Os oito blocos descritos abaixo |
| Referência para revisão | Consultar ou rever um tema já estudado | Organização por assunto, tabelas e links; não exige cenário nem exercício |
| Laboratório | Executar algo de forma controlada | Pré-requisitos, passos, resultado esperado e limites do que foi testado |
| Simulação | Treinar uma resposta como na entrevista | Enunciado, tempo sugerido, critérios de autoavaliação e perguntas de aprofundamento |

## A sequência de raciocínio

Toda aula guiada segue a mesma linha, da situação concreta até a verificação:

**situação → requisitos, regras e premissas → conceitos e funcionamento → alternativas e trade-offs → implementação possível na AWS → falhas e validação → perguntas e exercício**

Essa linha se materializa nos oito blocos abaixo. Nem todo bloco precisa de muitas palavras; o que importa é a ordem e a honestidade sobre o que foi decidido, assumido ou ainda não verificado.

## Os oito blocos

Os oito blocos são o modelo recomendado para as aulas guiadas da Loja Horizonte. Os títulos de cada aula podem ser diferentes, desde que a ordem e as cinco funções sejam preservadas.

1. **O que aconteceu na loja?** — Abra com uma cena concreta (uma pessoa fazendo algo no sistema). A pergunta da aula nasce dessa cena, não de um serviço.
2. **Entenda a ideia.** — Nomeie e explique os conceitos que a cena exige, cada um na primeira vez que aparece. Aqui entram também os **requisitos** da etapa (veja abaixo), primeiro em linguagem concreta: o que precisamos entregar e com que qualidade. A forma quantitativa vem quando a pessoa já entende o que está sendo medido.
3. **Acompanhe o funcionamento.** — Mostre o caminho normal, passo a passo. Um diagrama de comportamento (Mermaid) ajuda quando esclarece a ordem dos eventos.
4. **Como isso poderia funcionar na AWS?** — Só agora apareçam os serviços, cada um mapeado a um papel já explicado. Antes disso, compare **alternativas e trade-offs** da decisão. Um diagrama de arquitetura (Draw.io) ajuda quando mostra uma implementação.
5. **O que acontece quando algo falha?** — Um cenário de falha concreto, depois do caminho normal. O que o sintoma prova, o que não prova, e o que observar.
6. **Verifique seu entendimento.** — Perguntas respondíveis com o que foi ensinado, com a pergunta principal e uma pergunta extra visíveis e a resposta recolhida.
7. **Aplique o que aprendeu.** — Um exercício curto, com solução recolhida. Pode ter duas partes: consolidar a situação da aula e aplicar o mesmo raciocínio a uma pequena variação, sem exigir tecnologia ainda não apresentada. A correção avalia o raciocínio, aceita alternativas justificadas e não exige uma classificação única quando mais de uma leitura é defensável.
8. **O que aprendemos e o que vem depois?** — Resumo curto, checklist observável e a próxima etapa apenas como planejada. Só crie link para uma aula que já existe e mantenha o caminho de volta ao índice.

## Requisitos, regras e trade-offs

Esses termos entram no bloco 2 e são explicados na primeira utilização. Não são compartimentos estanques: um mesmo item pode ser lido de mais de uma forma, e a sobreposição é normal.

- **Requisito funcional** — uma capacidade ou comportamento que o sistema precisa oferecer. Exemplo: "mostrar o preço de um produto".
- **Requisito não funcional** — uma qualidade ou condição exigida dessa capacidade. Exemplo: "responder dentro de um tempo definido sob uma carga definida". Requisitos não funcionais **não são** secundários nem opcionais; costumam decidir a arquitetura.
- **Regra de negócio** — uma regra específica que o cenário precisa respeitar. Exemplo: "adicionar ao carrinho não reserva estoque".
- **Restrição** — um limite imposto à solução. Exemplo: "usar um banco relacional gerenciado". Uma restrição tecnológica é uma **decisão**, não algo que a pessoa usuária pediu.
- **Premissa** — uma informação assumida, ainda sujeita a confirmação. Exemplo: "o pico é de X acessos por minuto". Marque premissas como tais.

**Escreva requisitos verificáveis.** Evite "rápido", "seguro", "escalável", "barato", "disponível" sem definição. Para uma meta quantitativa, diga: a **operação**, a **medida**, o **limite**, a **carga**, a **janela** de avaliação, o **ponto de medição** e o **tratamento dos erros**. Explique cada unidade e termo usado, como milissegundos ou percentil. Uma meta numérica usada para ensino é uma **hipótese do cenário**, não um padrão da indústria nem um resultado medido. Não confunda o tempo de resposta da aplicação com o tempo de carregamento completo da página no navegador, e não presuma que um número de usuários equivale a um número fixo de requisições por segundo.

**Ligue requisito a decisão com honestidade.** Use a cadeia: **necessidade → decisão → consequência → evidência**. Evite reflexos como "lentidão = cache", "disponibilidade = Multi-AZ", "crescimento = microsserviços" ou "segurança = um serviço específico". Uma necessidade admite soluções diferentes; uma solução atende só parte de uma necessidade. Prefira estados de validação honestos: *decisão proposta*, *coerência analisada*, *ainda não testado*, *não atendido pelo desenho atual*, *planejado para etapa futura*. Não escreva "atendido" para desempenho, recuperação ou segurança só porque um serviço aparece no diagrama.

**Trade-offs em linguagem acessível.** Ao escolher entre opções, responda: que problema queremos resolver? Quais alternativas consideramos? O que a escolha favorece? Que custo, risco ou limite ela introduz? Por que foi escolhida neste estágio? Que evidência ou novo requisito faria reconsiderar? Na aula, organize cada decisão de forma enxuta: **escolha → ganho e limite → quando reconsiderar**. Separe **custo financeiro**, **trabalho operacional** e **simplicidade didática** — não são a mesma coisa. Nenhuma opção é sempre mais barata, rápida ou simples, e nem todo ganho exige uma perda equivalente. Um trade-off nunca justifica violar um requisito obrigatório.

## Regras de escrita

- Situação concreta antes da definição.
- Termo explicado na primeira utilização; nenhuma sigla explicada apenas por outra sigla.
- Caminho normal antes do cenário de falha.
- Linguagem natural e respeitosa, sem infantilizar.
- Identificadores consistentes entre prosa, diagrama e código (mesmo nome, mesmo valor).
- Analogia é opcional; se usar uma, volte logo ao mecanismo real.
- Links externos e módulos anteriores são **aprofundamento**, não obstáculos obrigatórios à compreensão.
- Cada link contextual tem um propósito claro; evite repetir a mesma lista de links em seções próximas.
- O essencial fica visível; respostas e soluções ficam recolhidas em `<details>` (sem o atributo `open`), com um resumo que diga o que será revelado.
- Detalhes avançados entram só quando são necessários para entender o exemplo ou evitar uma conclusão errada.
- Informações de manutenção — proveniência, datas de consulta, versões de ferramentas, histórico de validações — ficam fora da leitura principal.
- Não apresente uma revisão editorial como prova de aprendizado: melhor retenção ou desempenho em entrevista só podem ser afirmados com evidência.
- Sem meta de linhas e sem obrigação de adicionar componentes para "parecer completo".

## Diferencie o que você afirma

Deixe sempre claro de que tipo é cada afirmação:

- **mecanismo genérico** — como a tecnologia funciona em geral;
- **comportamento documentado de um produto** — com fonte oficial rastreável: link contextual na aula quando ajuda o estudo, ou registro nas notas de manutenção;
- **escolha do cenário** — uma decisão deste material;
- **hipótese didática** — um número ou premissa para ensinar;
- **resultado realmente testado** — algo que foi medido ou executado (raro nestas aulas; diga quando não houve).

## Regras visuais

- **Mermaid explica comportamento** (a ordem dos eventos, quem fala com quem).
- **Draw.io mostra uma implementação arquitetural** (quais componentes e como se ligam).
- Escolha cada desenho pela **pergunta** que ele responde e diga qual é.
- Não duplique o mesmo desenho só trocando caixas por ícones.
- Ícones **não substituem** nomes: escreva o nome do serviço ao lado.
- O arquivo `.drawio` é a **fonte** da exportação; o `.svg`/`.png` é gerado a partir dele.
- Não exija um diagrama em capítulos onde ele não acrescenta compreensão.

## Ícones

Use apenas AWS Architecture Icons de fonte oficial, copiados **sem alteração gráfica** (cores, geometria e `viewBox` originais). Reutilize os ícones já presentes no repositório quando couber. Para um ícone novo, registre origem, variante e hash. Em tabelas, apresente a cerca de 24 px, com proporção preservada, nome do serviço ao lado e `alt=""` (decorativo e redundante com o texto). No Draw.io, o ícone pode ser maior para legibilidade. Não importe o pacote inteiro para o repositório.

## Fontes

Afirmações técnicas se apoiam em fontes primárias (documentação oficial do produto, RFCs, especificações). Quando ajudar o estudo, mantenha um link contextual perto da afirmação. Aulas guiadas não terminam com uma seção extensa de fontes: proveniência e datas de consulta ficam nas notas de manutenção abaixo ou em [Referências e proveniência](../references/README.md). Um código HTTP 200 ao abrir uma página **não** é prova de uma afirmação técnica. Diferencie inspiração metodológica, cenário autoral, comportamento documentado, escolha didática e número sintético.

<a id="manutencao"></a>
## Notas de manutenção

Registros que não fazem parte da leitura das aulas, mas precisam ser preservados por quem edita o material.

### [Aula 1](02-system-design/ecommerce/01-from-click-to-catalog.md) — ícones, diagrama e fontes de produto

- **Ícones.** O ícone de EC2 reutiliza `01-fundamentals/assets/aws-ec2-32.svg`, de F04, sem cópia local. Os de RDS e S3 (`02-system-design/ecommerce/assets/aws-rds-32.svg` e `aws-s3-32.svg`) foram copiados sem alteração gráfica do pacote oficial AWS Architecture Icons, release `Icon-package_07312026`, variante *Architecture-Service-Icons / Arch_32* (categorias Databases e Storage). Não há variante específica para RDS for PostgreSQL: usa-se o ícone genérico de RDS, com o nome completo no texto, e não o de Aurora.
- **Exceção no diagrama.** Dentro de `01-catalog-aws.drawio`, os três ícones estão embutidos como PNG de 256×256 px derivados desses SVGs, por compatibilidade com o editor. Esses PNG não são idênticos byte a byte aos SVG oficiais, e a exportação `01-catalog-aws.svg` contém as imagens rasterizadas; portanto, não é integralmente vetorial. Componentes, rótulos e conectores continuam editáveis. É uma exceção deste piloto, não uma regra para novos diagramas.
- **Fontes das afirmações de produto** (consultadas em 11/10/2026; revalide antes de um laboratório): [What is Amazon RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html), para o RDS como serviço gerenciado que automatiza tarefas de administração do banco; [S3 Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/configuring-block-public-access-bucket.html), para buckets e objetos privados por padrão.
