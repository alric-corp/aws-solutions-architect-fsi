# L3 — A conexão abriu, mas a resposta não chegou no orçamento

[Laboratórios](README.md) · [Curso](../README.md)

## Objetivo

Separar tempo para conectar de tempo até a resposta. Interpretar um timeout com evidência da etapa alcançada, em vez de concluir que “a rede caiu”.

## Ambiente e estado inicial

O mesmo servidor mínimo de loopback do L2. Ao receber `GET /slow`, o handler primeiro registra a requisição e depois espera 0,45 segundo antes de preparar HTTP 200. Esse atraso está **dentro do código da aplicação**, depois de TCP e da leitura HTTP. Não há descarte de SYN, emulação de link, proxy ou tráfego externo.

## Preveja

O cliente limita a execução total a 0,15 segundo. Outro permite dois segundos. Qual evidência poderia mostrar que o primeiro chegou ao servidor mesmo sem receber HTTP?

<details><summary>Resposta comentada</summary>

O evento `request_received` é escrito antes da espera, pelo handler que leu a requisição. Junto da conexão concluída e do limite do cliente, ele localiza esta espera depois da entrega HTTP ao processo. O código 28 sozinho não localiza a causa.

</details>

## Execute

```sh
# Compara os dois orçamentos e encerra o servidor próprio no final.
python3 -B technical-knowledge/01-fundamentals/redes/laboratorio/lab.py l3
```

O cliente usa `--connect-timeout 1` e, conforme a tentativa, `--max-time 0.15` ou `--max-time 2`. O segundo é orçamento total, não um timeout exclusivo da conexão. O relatório separa `time_connect`, `time_starttransfer`, `time_total` e os eventos recebidos no servidor.

## Esperado e observado

Na execução real de autoria de 06/11/2026, o orçamento curto terminou com curl 28 e HTTP `000`; o longo recebeu 200 e saída zero. O servidor registrou **as duas requisições** antes de suas respectivas esperas. A primeira conexão foi estabelecida, mas não houve primeiro byte HTTP de resposta no prazo do cliente. A segunda observou aproximadamente 0,45 segundo até a resposta; o JSON privado guarda os valores exatos daquela execução.

Quando o primeiro cliente encerra, o servidor pode encontrar um socket fechado ao tentar responder. Esse evento é esperado aqui e não deve ser confundido com queda espontânea da rede. O servidor não estende o prazo do cliente porque continuou trabalhando.

## Interpretação e transferência

Troque a hipótese: no lugar do `sleep` deste exercício, uma aplicação real poderia estar esperando pool, consulta ou dependência. Precisaríamos de logs/traces correlacionados para distinguir essas causas. Também poderíamos observar um timeout antes de a aplicação receber a requisição; esse seria outro conjunto de evidências.

Antes de aumentar um timeout, pergunte qual prazo a jornada admite e se a operação pode ter produzido efeito. Esperar mais pode aumentar concorrência e retenção de recursos. Este GET fictício não cria pedidos e não comprova a segurança de repetir uma escrita.

## Limites e limpeza

Não mede banda, jitter, retransmissões, latência WAN ou perda de pacotes. Não executa falhas de infraestrutura. O executor encerra somente seu filho e remove seu runtime marcado, inclusive após uma falha normal do teste. [Limites do curl](https://curl.se/docs/manpage.html) e [handler HTTP do Python](https://docs.python.org/3.15/library/http.server.html), consulta em 06/11/2026.
