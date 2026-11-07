# L2 — Processo, porta e resposta são observações diferentes

[Laboratórios](README.md) · [Curso](../README.md)

## Objetivo

Distinguir uma resposta HTTP 200, uma recusa de conexão e uma resposta HTTP 503. Processo em execução não prova listener no endereço e na porta procurados; porta acessível não prova sucesso da operação.

## Ambiente e estado inicial

Python, `curl` e uma porta livre acima de 1024. O executor inicia seu próprio servidor em `127.0.0.1`; ele só conhece `/ok`, `/unavailable` e `/slow`, sem acesso a arquivos do projeto. Ao final, encerra esse filho e tenta novamente **o endpoint que acabou de fechar**. Nenhum alvo de rede do trabalho é usado.

## Previsão

Um `curl` sem `--fail-with-body` recebe HTTP 503. O código de saída será necessariamente diferente de zero?

<details><summary>Resposta comentada</summary>

Não. O cliente pode ter realizado a troca HTTP com sucesso e receber um erro do serviço. No modo usado aqui, 503 com transporte concluído retorna zero. Com `--fail-with-body`, esse status provoca saída 22 e o corpo continua disponível. A interpretação precisa considerar ambos os campos.

</details>

## Execute

```sh
# Inicia servidor próprio, executa clientes, fecha o processo e testa a porta fechada.
python3 -B technical-knowledge/01-fundamentals/redes/laboratorio/lab.py l2
```

Internamente, o executor monta `curl -q --noproxy '*' --proxy ''` e limites de tempo para URLs loopback da execução. `-q` é o primeiro argumento para não ler `~/.curlrc`. A porta é informada no JSON; quando o comando termina, aquele servidor já não está ativo. Não use uma porta copiada como se fosse um serviço permanente.

## Resultado esperado e observação real

Execução de autoria em 06/11/2026:

| Estado controlado | Saída curl observada | HTTP observado | Leitura correta |
|---|---:|---:|---|
| Servidor próprio `/ok` | 0 | 200 | O handler respondeu neste recorte |
| Servidor próprio `/unavailable` | 0 | 503 | Houve resposta HTTP de indisponibilidade |
| Mesma rota, `--fail-with-body` | 22 | 503 | Opção converteu o status em falha do comando |
| Processo próprio encerrado | 7 | `000` | Não foi recebida resposta HTTP; o endpoint não aceitou a conexão |

`000` é um marcador do relatório do curl para ausência de status, não um código definido pelo HTTP. O PID informado pertence ao filho criado pelo executor. O teste negativo confirma que a porta deixa de aceitar conexões após o encerramento.

## Por que o controle importa

Nesta máquina, reservar um socket sem chamar `listen()` não produziu a recusa desejada: a tentativa expirou. O roteiro foi ajustado para encerrar o próprio listener antes da tentativa negativa. Uma diferença do sistema operacional não autoriza chamar qualquer timeout de “porta fechada”.

Transfira a interpretação: se a porta da aplicação muda, refaça origem, endereço e porta; se recebe 403, houve uma resposta HTTP que exige investigar seu emissor e a autorização. Nem 200 de um endpoint simples nem 503 localizado identifica sozinho toda a cadeia do negócio.

## Limites e limpeza

Não há ping nem captura de pacotes; não atribuímos a recusa a um equipamento observado no fio. O servidor fecha em `finally` e só seu diretório marcado é removido. Não use `pkill`, `killall` ou mudanças de firewall. Não é servidor de produção: [http.server](https://docs.python.org/3.15/library/http.server.html). Flags e códigos: [manual do curl](https://curl.se/docs/manpage.html), consulta em 06/11/2026.
