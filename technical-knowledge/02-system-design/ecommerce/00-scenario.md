# Cenário condutor — Loja Horizonte

A trilha de System Design a partir do zero usa uma loja fictícia, a **Loja Horizonte**, como fio condutor. Cada aula parte de uma cena concreta nessa loja e evolui a solução **somente quando surge uma necessidade nova**. Este documento registra as regras e premissas comuns; cada aula seleciona apenas o que precisa.

> Tudo aqui é fictício e didático. Números de tráfego, custo, preço e desempenho são **sintéticos**, salvo indicação explícita de medição real. Não há dados pessoais, cartões, contas bancárias ou tokens reais.

## A loja

A Loja Horizonte vende produtos físicos pela internet. Escopo inicial, propositalmente pequeno:

- um único vendedor (a própria loja);
- um estoque;
- produtos físicos;
- **sem** marketplace (não há outros vendedores);
- **sem** assinaturas;
- **sem** múltiplos centros de distribuição;
- **sem** detalhamento tributário.

Essas delimitações são **escolhas do cenário**, não regras universais de e-commerce. Lojas reais variam muito.

## Personagens

- **Ana** — uma pessoa que navega e compra na loja.
- **Bruno** — outra pessoa que também usa a loja (útil quando precisamos de dois usuários distintos, por exemplo para discutir o que um não pode ver do outro).

Ana e Bruno são **personagens fictícios**, não pessoas reais.

## Produto recorrente

Para manter os exemplos consistentes, usamos sempre o mesmo produto:

| Campo | Valor | Observação |
|---|---|---|
| identificador | `prod-001` | o mesmo em prosa, diagramas e código |
| nome | Fone de ouvido | — |
| preço | R$ 199,90 | preço ilustrativo |
| moeda | BRL | real brasileiro |
| fotografia | um arquivo do catálogo | representada por um arquivo, não por um dado dentro do cadastro |

Quando um exemplo precisar de representação numérica, usamos **centavos inteiros**, com a moeda em um campo separado:

```text
priceMinor = 19990     # 19990 centavos = R$ 199,90
currency   = "BRL"
```

Guardar dinheiro como centavos inteiros é a **convenção escolhida para o BRL neste material**; evita erros de arredondamento de números com casas decimais. Isso **não** generaliza "duas casas decimais" para toda moeda — moedas têm regras próprias de subdivisão.

## Regras de negócio da loja

Estas regras valem para toda a trilha. São **escolhas do cenário**, não regras universais:

1. **Adicionar ao carrinho não reserva estoque.** Colocar um produto no carrinho é uma intenção; não tira a unidade de ninguém.
2. **Criar um pedido não confirma o pagamento.** O pedido registra o que a pessoa quer comprar; o pagamento é um passo posterior.
3. **A reserva precisa impedir prometer duas vezes a última unidade.** Quando houver reserva, duas pessoas não podem receber a promessa da mesma última unidade.
4. **O pagamento usa um provedor externo fictício.** A loja não processa o pagamento sozinha.

A [Aula 6](06-last-unit.md) propõe a aquisição de uma reserva em uma disputa concorrente. Expiração, liberação e sua coordenação com outras transições ainda precisam de desenvolvimento e testes próprios. A [Aula 7](07-payment-uncertain.md) propõe o acompanhamento de um pagamento com resposta perdida, sob um contrato explícito de provedor fictício; não fornece coordenação completa com o ciclo de vida da reserva. A [Aula 8](08-async-work.md) propõe uma tarefa durável de acompanhamento, com outbox, fila e tratamento de reentregas; operação dos processos, retenção e intervenção ainda exigem validação. A [Aula 9](09-failure-recovery.md) compara continuidade após a queda de uma aplicação e recuperação de dados após erro lógico; Multi-AZ, backups, restauração e reconciliação são propostas, sem exercícios operacionais executados. A [Aula 10](10-safe-changes.md) propõe atualização gradual com contratos compatíveis entre versões; não executa implantação ou migração e não trata retorno de código como reversão de dados ou pagamentos.

## O que vale agora × o que vem depois

O quadro reúne as propostas didáticas desenvolvidas nas dez aulas; não representa capacidades implantadas ou validadas em produção.

| Propostas desenvolvidas nesta sequência |
|---|
| Consultar e exibir um produto do catálogo |
| Separar os dados do produto dos arquivos de imagem |
| Entender o caminho de uma consulta e uma falha simples |
| Guardar carrinhos e registrar pedidos pendentes das próximas etapas |
| Listar produtos por categoria e preço, com avaliação de um índice para a consulta |
| Propor duas cópias da aplicação e continuidade por sessão compartilhada |
| Propor cache compartilhado para listagens públicas e CloudFront para fotografias |
| Propor aquisição de reserva com alteração condicional e registro na mesma transação |
| Propor intenção de pagamento durável, repetição contratada e reconciliação |
| Propor acompanhamento assíncrono com tarefa, outbox e fila |
| Propor continuidade e recuperação de dados com validação e reconciliação |
| Propor atualização gradual com compatibilidade, observação e retorno de código condicionado ao estado atual |

Não trate um requisito futuro como garantia já atendida pela arquitetura inicial.

## Origem pedagógica

A **abordagem** de evoluir uma aplicação passo a passo, acrescentando um componente só quando uma necessidade aparece, foi inspirada em um vídeo didático que parte de uma aplicação de fotos. A **Loja Horizonte é um cenário fictício e autoral** criado para esta trilha: não é o exemplo original do vídeo nem reproduz traduções quase literais dele.

Algumas afirmações comuns em materiais introdutórios **não** são adotadas aqui porque são imprecisas: escala horizontal "infinita"; "acrescentar um componente nunca exige mudar o código"; "health check elimina todos os erros"; "a escolha entre SQL e NoSQL depende só do formato dos dados".
