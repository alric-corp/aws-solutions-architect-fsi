# 03 — Segurança, identidade e proteção de dados

**Base:** N01/N05 cobrem certificados, criptografia, TLS, WAF e segurança AWS. **Complemento:** separar identidade, autorização, transporte e proteção da informação ao longo do fluxo.

## Perguntas antes de serviços

Quem é o sujeito? Qual ação tenta executar? Sobre qual recurso? Em qual contexto? Como provamos a decisão e como ela pode ser revogada?

Distinguir autenticação de autorização evita tratar “tem login” como permissão para todas as contas. Distinguir autorização do usuário de permissão IAM do backend evita que uma aplicação privilegiada exponha qualquer dado a qualquer chamador.

## Controles com papéis diferentes

IAM estabelece permissões AWS. Para pessoas e workloads, avalie federação, credenciais temporárias e menor privilégio. Separe a identidade de implantação da identidade de execução. [Fonte T12](../../references/README.md#t12)

TLS protege o canal sob suas condições de validação; não decide se o usuário pode consultar uma conta. Certificados não dispensam validar nomes, cadeia, validade e os requisitos específicos da integração. Criptografia em repouso também não impede uma aplicação autorizada de ler e divulgar dados indevidamente.

WAF não substitui autorização de negócio. Security Groups não substituem identidade da aplicação. Segredos precisam de controle de leitura, rotação e procedimento de falha; não devem aparecer em logs, repositórios ou imagens.

## Como raciocinar sobre PII

Siga o dado: entrada, fila, banco, cache, modelo, log, resultado exportado e backup. A proteção não termina quando o banco está cifrado. No lake, por exemplo, acesso direto indevido ao S3 pode contornar o caminho governado pela engine integrada. [Fonte T18](../../references/README.md#t18)

Não use dados reais de clientes para demonstrar um controle. O teste pode criar dois sujeitos fictícios e verificar que um deles não vê o recurso do outro.

## Cenário de diagnóstico

“Uma pessoa autenticada trocou `accountId` na URL e recebeu informações de outra conta.”

Comece pelo impacto e contenção apropriada. Investigue a decisão de acesso ao objeto e quais cópias foram produzidas. Não prometa resolver só com um certificado novo ou uma regra genérica de WAF.

Use o [Case 02](../../cases/02-open-finance-apis.md) para examinar identidade do parceiro, token, consentimento e recurso. Use o [Case 06](../../cases/06-genai-financial-advisor.md) para perguntar o que muda quando a informação entra em contexto de geração.

## Aprofundamentos

“Quem valida o tenant?” “O que acontece quando a permissão muda durante a execução?” “Um administrador de infraestrutura precisa ler dados pessoais?” “Qual log sustenta uma investigação sem registrar o segredo?”

## Perguntas de entrevista

1. Que controles você usaria para proteger dados de clientes em trânsito e em repouso, e quem gerencia as chaves?
2. Como você organizaria contas, papéis e permissões para centenas de times sem perder o controle?
3. A API pública de um banco recebe um pico de tráfego malicioso. Que camadas de proteção você teria?
4. O CISO de um banco desconfia da nuvem. Como você conduziria essa conversa?

Para a pergunta 4, o modelo de responsabilidade compartilhada está em [F00](00-cloud-computing.md).

## Exercício

Desenhe uma tabela com sujeito, ação, recurso, controle e evidência para quatro operações do case. Acrescente uma tentativa negada e uma revogação. Diga o que ainda depende de revisão institucional de segurança e privacidade.

O resultado esperado é uma fronteira de confiança explicada, não a promessa de conformidade obtida por uma lista de produtos.
