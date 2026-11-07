# L4 — Nome do serviço, confiança e certificado

[Laboratórios](README.md) · [Curso](../README.md)

## Objetivo

Comparar falta de confiança na CA, HTTPS validado e nome incompatível. Explicar o que um teste controlado com `--resolve` preserva e o que ele deixa de testar.

## Ambiente e estado inicial

O executor cria uma CA local e um certificado de servidor com SAN `DNS:loja.test`, em `.site/redes-review/runtime/`. Chaves e certificados não existem no conteúdo publicado, têm permissão 0600 e são removidos ao terminar. O listener usa somente loopback e porta livre acima de 1024. A CA **não** é instalada no sistema. Não há mudança em `/etc/hosts`, DNS, Keychain ou outros repositórios de confiança.

## Antes de executar

Se a mesma CA explícita for usada, `loja.test` e `outra.test` devem validar o mesmo certificado?

<details><summary>Resposta comentada</summary>

Não. Confiar na cadeia não substitui conferir o nome. Neste certificado, só `loja.test` está no SAN. Mudar o nome da URL para `outra.test`, mesmo apontando para o mesmo IP, deve falhar na verificação de identidade.

</details>

## Execute o roteiro completo

```sh
# Gera o material efêmero, faz as três tentativas e limpa seus processos/arquivos.
python3 -B technical-knowledge/01-fundamentals/redes/laboratorio/lab.py l4
```

O formato interno da tentativa bem-sucedida é mostrado abaixo **como texto ilustrativo**, não como outro comando para copiar depois do encerramento. O executor preenche os valores efetivos enquanto seu filho existe:

```text
curl -q --noproxy '*' --proxy '' \
  --resolve loja.test:<porta>:127.0.0.1 \
  --cacert <runtime-da-execucao>/ca.crt \
  https://loja.test:<porta>/ok
```

`--resolve` muda a associação nome/endereço usada por esse cliente. A URL continua identificando `loja.test`, preservando o nome HTTP e o nome usado no TLS. Isso **contorna** a resolução normal; não cria uma zona nem demonstra que o DNS foi corrigido. Um cabeçalho `Host` arbitrário sobre uma URL por IP não é uma substituição geral para manter também SNI e a identidade validada. [Manual do curl](https://curl.se/docs/manpage.html).

## Esperado e observado em 06/11/2026

| Tentativa controlada | Resultado real |
|---|---|
| `loja.test` sem fornecer a CA criada | Curl 60; cadeia não validada pelo cliente |
| `loja.test` com `--cacert` da execução | Curl 0 e HTTP 200 |
| `outra.test` com a mesma CA correta | Curl 60; SAN não corresponde ao nome |

O código 60 serve a mais de uma falha de certificado. Diferenciamos os casos pela entrada controlada e pela mensagem: falta de emissor confiável no primeiro, nome incompatível no terceiro. Um cliente Python adicional, ainda com verificação habilitada e CA explícita, observou `verify_code=62` no nome errado.

O servidor registrou a negociação real do curl: **TLSv1.3**, `TLS_AES_256_GCM_SHA384`, Host `loja.test:<porta>`. O cliente Python também negociou TLSv1.3. O curl instalado se apresenta como 8.7.1 com SecureTransport/LibreSSL e MultiSSL; Python usa OpenSSL 3.5.9 e o utilitário `openssl` informa 4.1.0. Não inferimos o backend efetivo de uma conexão nem sua versão TLS pela versão de outro componente.

## Limites e limpeza

Certificados de laboratório usam RSA 2048 e extensões CA/SKI/AKI/SAN adequadas à validação estrita observada. Não são uma recomendação universal de PKI para produção. O script não usa `-k`, não remove verificações de nome/cadeia e não executa uma API externa. Não prova autorização de negócio, configuração de DNS ou proteção do próximo trecho. [SSL do Python](https://docs.python.org/3.15/library/ssl.html) e [extensões via OpenSSL req](https://docs.openssl.org/master/man1/openssl-req/), consultados em 06/11/2026.
