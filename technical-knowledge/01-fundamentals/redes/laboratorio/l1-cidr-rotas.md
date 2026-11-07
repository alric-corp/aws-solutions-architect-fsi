# L1 — CIDR, pertencimento e escolha de rota

[Laboratórios](README.md) · [Curso](../README.md)

## Objetivo

Calcular os tamanhos de `/16`, `/20`, `/24` e `/28`, conferir alinhamento e pertencimento e justificar uma escolha por prefixo mais específico. Antes, leia IP como endereço e prefixo como tamanho de bloco; não use a aparência do terceiro octeto como regra de roteamento.

## Ambiente e estado inicial

Python com `ipaddress`, sem sockets ou mudanças de rede. As tabelas são fictícias. O bloco A é `10.20.0.0/16`, com aplicação em `10.20.2.0/24` e banco em `10.20.3.0/24`. Não envie tráfego para esses exemplos. O cenário AWS de capacidade é o caso comum de subnet IPv4, sem BYOIP; não é uma regra para qualquer rede ou para a VPC inteira.

## Preveja antes de executar

1. `10.20.3.20` pertence à subnet da aplicação?
2. `10.20.17.0/20` é um endereço de rede canônico?
3. Uma tabela contém `/16`, `/24` e rota padrão. Qual corresponde ao banco?

<details><summary>Resposta comentada</summary>

O banco está fora de `10.20.2.0/24`. Um `/20` nessa parte do espaço começa em `10.20.16.0`; a API estrita recusa host bits. Para o banco, `/24` ganha de `/16` e da rota padrão. Isso não diz se o próximo salto funciona nem se o acesso está permitido.

</details>

## Comandos comentados

```sh
# Calcula capacidades, pertencimento, subdivisões e consultas à tabela fictícia.
python3 -B technical-knowledge/01-fundamentals/redes/laboratorio/lab.py l1

# A função de rede estrita não corrige silenciosamente uma entrada desalinhada.
python3 -B -c "import ipaddress; print(ipaddress.ip_network('10.20.17.0/20', strict=True))"

# Uma interface aceita o endereço do host e permite consultar sua rede correspondente.
python3 -B -c "import ipaddress; print(ipaddress.ip_interface('10.20.17.0/20').network)"
```

O segundo comando deve terminar com `ValueError`. É o teste negativo, não motivo para instalar outro pacote. O terceiro deve mostrar `10.20.16.0/20`.

## Esperado e observado

Na execução real de autoria em 06/11/2026:

| Bloco usado como subnet | Total matemático | Hosts convencionais neste recorte | Atribuíveis no caso comum AWS |
|---|---:|---:|---:|
| `/16` | 65536 | 65534 | 65531 |
| `/20` | 4096 | 4094 | 4091 |
| `/24` | 256 | 254 | 251 |
| `/28` | 16 | 14 | 11 |

O executor encontrou 16 subnets `/24` dentro do `/20`. A consulta `10.20.3.20` escolheu `10.20.3.0/24 → inspecao-ficticia`; `10.20.2.10` escolheu a rota `/16`. O destino TEST-NET da fixture apenas participou de comparação matemática, sem pacote enviado.

`hosts()` implementa convenções de endereçamento do Python, incluindo exceções para prefixos pequenos. Não informa quais endereços a AWS disponibiliza. No caso comum AWS IPv4, reservam-se os quatro primeiros e o último de **cada subnet**; não subtraia cinco uma única vez da VPC para depois distribuí-la. [Documentação de subnets](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html).

## Interpretação e transferência

Adicione mentalmente uma rota `10.20.3.20/32`: só esse destino deve preferi-la; `.21` continua no `/24`. Os testes fazem essa transferência, rejeitam empates não modelados e verificam ausência de rota correspondente.

Dois CIDRs canônicos alinhados que se sobrepõem têm relação de contenção. `/20` ocupa parte de `/16`; não há cruzamento parcial entre esses prefixos alinhados. Intervalos arbitrários, como `.20–.80` e `.64–.100`, podem cruzar em `.64–.80` sem contenção completa. Não confunda os dois problemas.

## Limites e limpeza

A função LPM não implementa todos os desempates entre rotas AWS, propagação ou prefix lists. Não valida próximo salto, SG, NACL, TCP ou aplicação. L1 não cria processos/rotas nem arquivos de chave; só o relatório privado é mantido. [ipaddress](https://docs.python.org/3.15/library/ipaddress.html) e [prioridade de rotas](https://docs.aws.amazon.com/vpc/latest/userguide/route-tables-priority.html), consultados em 06/11/2026.
