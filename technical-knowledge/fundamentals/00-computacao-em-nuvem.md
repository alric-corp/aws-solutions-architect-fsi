# 00 — Computação em nuvem e por que AWS

**Base:** definição do NIST (SP 800-145) e materiais públicos da AWS sobre responsabilidade compartilhada e benefícios da nuvem.

Uma definição precisa de nuvem costuma abrir conversas técnicas e com executivos. Vale saber explicá-la em um minuto, com os limites de cada benefício.

## O que caracteriza a nuvem

Nuvem não é “o servidor de outra empresa”: é um modelo de consumo de TI. O NIST descreve cinco características essenciais:

| Característica | Na prática |
|---|---|
| Autoatendimento sob demanda | Criar recursos por console ou API, sem abrir pedido a um fornecedor |
| Amplo acesso pela rede | Serviços acessíveis por protocolos padrão, a partir de vários tipos de cliente |
| Pool de recursos | Infraestrutura compartilhada e alocada dinamicamente entre clientes |
| Elasticidade rápida | Aumentar e reduzir capacidade conforme a demanda |
| Serviço medido | Uso medido e cobrado pelo consumo |

## Modelos de serviço e responsabilidade compartilhada

IaaS (por exemplo, EC2), serviços gerenciados ou PaaS (por exemplo, RDS) e SaaS mudam quanto da pilha fica com o provedor. A segurança segue o modelo de responsabilidade compartilhada: a AWS responde pela segurança **da** nuvem, a infraestrutura que executa os serviços; o cliente, pela segurança **na** nuvem, como identidades, permissões, configurações e dados. Quanto mais gerenciado o serviço, menor a parte do cliente, mas identidade e dados continuam sempre com ele. Veja [F03](03-seguranca-identidade.md).

## Benefícios e o que eles não garantem

| Benefício | O que muda | O que não garante sozinho |
|---|---|---|
| Custo variável | Troca investimento antecipado por pagamento pelo uso | Custo menor: recurso ocioso continua custando |
| Elasticidade | A capacidade acompanha a demanda, sem adivinhar picos | Escala da aplicação: estado, banco e cotas podem limitar |
| Velocidade | Ambientes em minutos e experimentos baratos | Entrega rápida: processo e aprovações continuam valendo |
| Alcance global | Regiões e zonas de disponibilidade perto dos usuários | Resiliência: a arquitetura precisa usar várias AZs ou regiões |
| Segurança gerenciada | Controles, criptografia e certificações do provedor | Conformidade da carga: configuração e dados são do cliente |

## Nuvem em FSI

Para bancos e instituições de pagamento, os argumentos mais comuns são agilidade para lançar produtos, elasticidade para picos (início de mês, campanhas, Pix), resiliência com várias zonas e regiões e controles de segurança auditáveis. A conversa muda quando entram exigências regulatórias de contratação de nuvem, residência de dados e continuidade de negócio; por isso a descoberta vem antes da escolha de serviços.

## Perguntas de entrevista

1. Como você explicaria computação em nuvem para a diretoria de um banco tradicional, em um minuto?
2. Em que situação levar uma carga para a nuvem aumenta o custo, e como você evitaria isso?
