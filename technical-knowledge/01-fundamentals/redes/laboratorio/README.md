# Laboratórios — observar antes de concluir

[Voltar ao curso](../README.md)

Estes cinco roteiros foram escritos para acompanhar a Loja Horizonte fictícia. Faça uma previsão, execute o recorte e compare o resultado com a hipótese. Um código de saída, uma rota ou uma conexão não substitui a verificação da operação que a pessoa quer concluir.

## O que você precisa

Um checkout completo deste repositório, Python 3 com biblioteca padrão, `curl` e `openssl` já disponíveis. Não é preciso conta AWS, Docker, privilégios administrativos nem instalação de pacotes. Na publicação estática atual, `.py` e `.json` **não são downloads**: os comandos abaixo são para o terminal na raiz do checkout, não para o navegador. Os caminhos de scripts e fixtures são apresentados como texto, sem links para recursos que o site não distribui.

| Roteiro | O que é executado | Pergunta principal |
|---|---|---|
| [L1 — CIDR e rotas](l1-cidr-rotas.md) | Cálculos locais com `ipaddress` | O endereço pertence a qual bloco e qual prefixo corresponde melhor? |
| [L2 — Processo e porta](l2-processo-porta.md) | HTTP mínimo em loopback | O cliente não conectou ou recebeu uma resposta HTTP? |
| [L3 — Conectou e demorou](l3-conectou-demorou.md) | Atraso deliberado no handler | A espera ocorreu depois que a requisição chegou? |
| [L4 — Nome e certificado](l4-nome-certificado.md) | HTTPS com CA efêmera | A cadeia é confiável para este cliente e o nome corresponde? |
| [L5 — Registros e topologias](l5-topologias-registros.md) | Leitura de fixtures sintéticas | O registro sustenta qual conclusão e o que ainda falta? |

## Execução completa

```sh
# Na raiz do checkout. -B impede a escrita de bytecode .pyc.
python3 -B technical-knowledge/01-fundamentals/redes/laboratorio/lab.py all

# Positivos, negativos, transferência e integrações locais.
python3 -B -m unittest discover \
  -s technical-knowledge/01-fundamentals/redes/laboratorio \
  -p test_lab.py -v
```

O executor imprime as portas efetivas e o JSON observado. Uma porta livre é escolhida pelo sistema, sempre acima de 1024. Não copie a porta de uma execução antiga nem tente os endereços fictícios das tabelas. Nenhum script aceita endereço externo para testes.

## Isolamento e limpeza

Os servidores usam `127.0.0.1`, três rotas fixas e respostas geradas em memória; **não servem o diretório do repositório**. O cliente chama `curl -q` com `-q` em primeiro lugar, `--noproxy '*'` e proxy explícito vazio. O ambiente de proxy, caminhos de CA do usuário e configurações de OpenSSL são ignorados. `SSLKEYLOGFILE` é descartado antes de criar contextos TLS e não é herdado pelos filhos, evitando gravar segredos de sessão fora do runtime. Uma regressão usa caminho sintético próprio para comprovar ausência de criação e de alteração de arquivo. Não são lidos `.env`, tokens ou arquivos de credenciais.

Cada processo filho é criado e encerrado pelo executor em `try/finally`, com espera e encerramento limitado. A limpeza só alcança a pasta criada por aquela execução, dentro de `.site/redes-review/runtime/`, com marcador de propriedade e nonce correspondente. Diretórios têm permissão 0700; chaves e certificados, 0600. O código nunca usa `killall`, altera `/etc/hosts`, instala uma CA ou muda DNS/rotas/firewall do sistema. `Ctrl+C` e término tratado acionam a limpeza; uma morte forçada do processo não oferece essa garantia. Nesse caso, não mate um PID antigo às cegas nem remova pastas sem confirmar a propriedade.

Relatórios ficam em `.site/redes-review/labs/`, fora da publicação. Chaves, certificados e arquivos temporários ficam apenas no runtime ignorado e são removidos no encerramento normal.

## Execução de autoria, não promessa de ambiente

Em **06/11/2026**, `lab.py all` foi executado e os **dez testes passaram**. Os diretórios temporários ficaram vazios e os processos próprios terminaram. Ferramentas observadas: Python 3.15.0; módulo `ssl` ligado a OpenSSL 3.5.9; `curl` 8.7.1 anunciando SecureTransport/LibreSSL e MultiSSL; OpenSSL de linha de comando 4.1.0. Essas bibliotecas não são intercambiáveis. L4 registra a versão realmente negociada, em vez de inferi-la pelo nome do executável.

Os tempos impressos são observações de uma máquina, não metas de desempenho. L1/L5 são cálculos ou registros fictícios; não demonstram funcionamento de AWS. Nos [simulados](../simulados/README.md), todo resultado de ferramenta também é sintético e deve ser solicitado ao instrutor.
