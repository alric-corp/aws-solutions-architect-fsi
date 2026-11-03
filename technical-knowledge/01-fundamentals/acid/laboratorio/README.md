# Laboratório — observar antes de explicar

[Índice da trilha](../README.md) · [Preparar PostgreSQL](postgresql/README.md) · [Roteiro A/B](postgresql/roteiro.md) · [SQL completo para copiar](postgresql/sql-executavel.md) · [Comparativo MySQL](mysql-comparativo/README.md)

Aqui você controla duas conexões para ver o que acontece entre uma leitura e uma escrita. Os dados são fictícios. Na Loja Horizonte, o carrinho não reserva estoque; uma compra aprovada baixa a unidade e registra seu pedido na mesma transação. A transferência entre Ana e Bruno ocorre no mesmo banco, sem tarifas, câmbio ou efeitos externos.

Leia primeiro os capítulos 00–02. Faça os exercícios na ordem do roteiro, prevendo o resultado antes de executar. Os números monetários são centavos inteiros: 100000 representa R$ 1.000,00. Assim os exemplos não usam aproximações de ponto flutuante, inadequadas para estes saldos.

## O que foi realmente executado

Em 03/11/2026 foram executados **14 grupos de testes em PostgreSQL 18.1**, compilado para macOS ARM64, com três conexões distintas, `READ COMMITTED` padrão, `fsync=on`, `synchronous_commit=on` e `full_page_writes=on`. Passaram commit/rollback, falha intermediária e recuperação, zero linhas, visibilidade própria/externa, ausência de dirty read, non-repeatable read, phantom por INSERT/UPDATE, snapshot e conflito em Repeatable Read, venda insegura, compra condicional segura, espera por lock, versão, deadlock e ordem consistente, idempotência e write skew/Serializable. O incremento de relatório confirmou detalhes/total misturados em RC, mudança do conjunto, snapshot em RR READ ONLY e ausência de leitura suja.

Os resultados são observações locais dessas intercalações. Não são medição de desempenho, teste de queda de energia, certificação de infraestrutura ou prova de entrega de e-mail. O apêndice MySQL foi revisado na documentação, **não executado**. O relatório detalhado de execução fica fora das raízes públicas; o executor reproduz os testes no seu ambiente.

## Arquivos e publicação

Em `postgresql/` estão `00-schema.sql`, `01-seed.sql`, `02-operacoes.sql`, `03-reset.sql`, `04-verificar.sql`, `local.sh` e `testar.py`. O script de teste usa Python padrão e o cliente `psql`; não precisa de pacote Python. SQL e comandos também estão nas páginas para leitura e cópia. Downloads dos arquivos dependem de uma integração posterior do gerador; os nomes nesta página identificam arquivos do repositório.

**Limpeza separada:** termine as transações com `ROLLBACK`, saia dos clientes e execute `local.sh stop`. O reset mexe somente nas seis tabelas nomeadas do schema `acid_lab`, depois de verificar o banco e o marcador. Nenhum comando do roteiro remove banco, schema ou volume. Conserve o diretório local até decidir explicitamente descartá-lo.
