# Guia editorial — aulas de arquitetura para iniciantes

Este guia é a referência curta para escrever as aulas da trilha de System Design a partir do zero, usando um cenário concreto como fio condutor. Ele vale para qualquer capítulo; não descreve escolhas de uma aula específica.

A pessoa que lê **começa sem experiência**. Escreva para alguém que ainda não sabe o que é cliente, servidor, API, banco de dados ou um serviço AWS. A meta de cada aula é que essa pessoa consiga **explicar o que acontece** em um fluxo real e também ler a aula sozinha.

## A sequência de raciocínio

Toda aula segue a mesma linha, da situação concreta até a verificação:

**situação → requisitos, regras e premissas → conceitos e funcionamento → alternativas e trade-offs → implementação possível na AWS → falhas e validação → perguntas e exercício**

Essa linha se materializa nos oito blocos abaixo. Nem todo bloco precisa de muitas palavras; o que importa é a ordem e a honestidade sobre o que foi decidido, assumido ou ainda não verificado.

## Os oito blocos

1. **O que aconteceu na loja?** — Abra com uma cena concreta (uma pessoa fazendo algo no sistema). A pergunta da aula nasce dessa cena, não de um serviço.
2. **Entenda a ideia.** — Nomeie e explique os conceitos que a cena exige, cada um na primeira vez que aparece. Aqui entram também os **requisitos** da etapa (veja abaixo): o que precisamos entregar e com que qualidade.
3. **Acompanhe o funcionamento.** — Mostre o caminho normal, passo a passo. Um diagrama de comportamento (Mermaid) ajuda quando esclarece a ordem dos eventos.
4. **Como isso poderia funcionar na AWS?** — Só agora apareçam os serviços, cada um mapeado a um papel já explicado. Antes disso, compare **alternativas e trade-offs** da decisão. Um diagrama de arquitetura (Draw.io) ajuda quando mostra uma implementação.
5. **O que acontece quando algo falha?** — Um cenário de falha concreto, depois do caminho normal. O que o sintoma prova, o que não prova, e o que observar.
6. **Verifique seu entendimento.** — Perguntas respondíveis com o que foi ensinado, com pergunta e follow-up visíveis e resposta recolhida.
7. **Resolva uma pequena mudança.** — Um exercício curto que reusa os conceitos da aula, com solução recolhida.
8. **O que aprendemos e o que vem depois?** — Resumo curto, checklist observável e a próxima etapa apenas como planejada.

## Requisitos, regras e trade-offs

Esses termos entram no bloco 2 e são explicados na primeira utilização. Não são compartimentos estanques: um mesmo item pode ser lido de mais de uma forma, e a sobreposição é normal.

- **Requisito funcional** — uma capacidade ou comportamento que o sistema precisa oferecer. Exemplo: "mostrar o preço de um produto".
- **Requisito não funcional** — uma qualidade ou condição exigida dessa capacidade. Exemplo: "responder dentro de um tempo definido sob uma carga definida". Requisitos não funcionais **não são** secundários nem opcionais; costumam decidir a arquitetura.
- **Regra de negócio** — uma regra específica que o cenário precisa respeitar. Exemplo: "adicionar ao carrinho não reserva estoque".
- **Restrição** — um limite imposto à solução. Exemplo: "usar um banco relacional gerenciado". Uma restrição tecnológica é uma **decisão**, não algo que a pessoa usuária pediu.
- **Premissa** — uma informação assumida, ainda sujeita a confirmação. Exemplo: "o pico é de X acessos por minuto". Marque premissas como tais.

**Escreva requisitos verificáveis.** Evite "rápido", "seguro", "escalável", "barato", "disponível" sem definição. Para uma meta quantitativa, diga: a **operação**, a **medida**, o **limite**, a **carga**, a **janela** de avaliação, o **ponto de medição** e o **tratamento dos erros**. Uma meta numérica usada para ensino é uma **hipótese do cenário**, não um padrão da indústria nem um resultado medido. Não confunda o tempo de resposta da aplicação com o tempo de carregamento completo da página no navegador, e não presuma que um número de usuários equivale a um número fixo de requisições por segundo.

**Ligue requisito a decisão com honestidade.** Use a cadeia: **necessidade → decisão → consequência → evidência**. Evite reflexos como "lentidão = cache", "disponibilidade = Multi-AZ", "crescimento = microsserviços" ou "segurança = um serviço específico". Uma necessidade admite soluções diferentes; uma solução atende só parte de uma necessidade. Prefira estados de validação honestos: *decisão proposta*, *coerência analisada*, *ainda não testado*, *não atendido pelo desenho atual*, *planejado para etapa futura*. Não escreva "atendido" para desempenho, recuperação ou segurança só porque um serviço aparece no diagrama.

**Trade-offs em linguagem acessível.** Ao escolher entre opções, responda: que problema queremos resolver? Quais alternativas consideramos? O que a escolha favorece? Que custo, risco ou limite ela introduz? Por que foi escolhida neste estágio? Que evidência ou novo requisito faria reconsiderar? Separe **custo financeiro**, **trabalho operacional** e **simplicidade didática** — não são a mesma coisa. Nenhuma opção é sempre mais barata, rápida ou simples, e nem todo ganho exige uma perda equivalente. Um trade-off nunca justifica violar um requisito obrigatório.

## Regras de escrita

- Situação concreta antes da definição.
- Termo explicado na primeira utilização; nenhuma sigla explicada apenas por outra sigla.
- Caminho normal antes do cenário de falha.
- Linguagem natural e respeitosa, sem infantilizar.
- Identificadores consistentes entre prosa, diagrama e código (mesmo nome, mesmo valor).
- Analogia é opcional; se usar uma, volte logo ao mecanismo real.
- Links externos e módulos anteriores são **aprofundamento**, não obstáculos obrigatórios à compreensão.
- O essencial fica visível; respostas e soluções ficam recolhidas em `<details>` (sem o atributo `open`).
- Sem meta de linhas e sem obrigação de adicionar componentes para "parecer completo".

## Diferencie o que você afirma

Deixe sempre claro de que tipo é cada afirmação:

- **mecanismo genérico** — como a tecnologia funciona em geral;
- **comportamento documentado de um produto** — com link à documentação oficial;
- **escolha do cenário** — uma decisão deste material;
- **hipótese didática** — um número ou premissa para ensinar;
- **resultado realmente testado** — algo que foi medido ou executado (raro nestas aulas; diga quando não houve).

## Regras visuais

- **Mermaid explica comportamento** (a ordem dos eventos, quem fala com quem).
- **Draw.io mostra uma implementação arquitetural** (quais componentes e como se ligam).
- Cada desenho responde a **uma** pergunta; diga qual é.
- Não duplique o mesmo desenho só trocando caixas por ícones.
- Ícones **não substituem** nomes: escreva o nome do serviço ao lado.
- O arquivo `.drawio` é a **fonte** da exportação; o `.svg`/`.png` é gerado a partir dele.
- Não exija um diagrama em capítulos onde ele não acrescenta compreensão.

## Ícones

Use apenas AWS Architecture Icons de fonte oficial, copiados **sem alteração gráfica** (cores, geometria e `viewBox` originais). Reutilize os ícones já presentes no repositório quando couber. Para um ícone novo, registre origem, variante e hash. Em tabelas, apresente a cerca de 24 px, com proporção preservada, nome do serviço ao lado e `alt=""` (decorativo e redundante com o texto). No Draw.io, o ícone pode ser maior para legibilidade. Não importe o pacote inteiro para o repositório.

## Fontes

Afirmações técnicas se apoiam em fontes primárias (documentação oficial do produto, RFCs, especificações). Mantenha a fonte próxima da afirmação e uma lista curta ao final da aula. Um código HTTP 200 ao abrir uma página **não** é prova de uma afirmação técnica. Diferencie inspiração metodológica, cenário autoral, comportamento documentado, escolha didática e número sintético.
