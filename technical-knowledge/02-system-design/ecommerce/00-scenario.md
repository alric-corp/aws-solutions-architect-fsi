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

Os **mecanismos** de reserva e de pagamento (como garantir a regra 3, como lidar com uma resposta de pagamento perdida) ficam para **aulas posteriores**. Aqui eles são apenas regras declaradas.

## O que vale agora × o que vem depois

| Agora (primeiras aulas) | Desenvolvido depois |
|---|---|
| Consultar e exibir um produto do catálogo | Carrinho e pedido |
| Separar os dados do produto dos arquivos de imagem | Reserva da última unidade |
| Entender o caminho de uma consulta e uma falha simples | Pagamento com resposta perdida |
| | Escala, sessão, consultas e índices |
| | Cache e CDN |
| | Processamento assíncrono e recuperação de falhas |
| | Implantação de mudanças |

Não trate um requisito futuro como garantia já atendida pela arquitetura inicial.

## Origem pedagógica

A **abordagem** de evoluir uma aplicação passo a passo, acrescentando um componente só quando uma necessidade aparece, foi inspirada em um vídeo didático que parte de uma aplicação de fotos. A **Loja Horizonte é um cenário fictício e autoral** criado para esta trilha: não é o exemplo original do vídeo nem reproduz traduções quase literais dele.

Algumas afirmações comuns em materiais introdutórios **não** são adotadas aqui porque são imprecisas: escala horizontal "infinita"; "acrescentar um componente nunca exige mudar o código"; "health check elimina todos os erros"; "a escolha entre SQL e NoSQL depende só do formato dos dados".
