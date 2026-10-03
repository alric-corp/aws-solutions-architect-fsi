# Perguntas de design arquitetural

Exercícios para treinar o desenho e a defesa de uma arquitetura. O que se avalia nessa etapa está em [O que esperar da entrevista](../../interview-process.md).

1. Desenhe uma API serverless de consulta de extrato para o app de um banco, com picos no início do mês. — [F04](../../../technical-knowledge/fundamentals/04-compute-containers.md), [F03](../../../technical-knowledge/fundamentals/03-security-identity.md)
2. O internet banking precisa continuar atendendo se uma região AWS ficar indisponível. Proponha a arquitetura e diga o que continua funcionando. — [F12](../../../technical-knowledge/fundamentals/12-resilience-migration.md), [Case 09](../../../cases/09-multi-region-internet-banking.md)
3. Saldo e limite de um cliente são consultados em mais de uma região. Como evitar que duas operações usem o mesmo saldo? — [F06](../../../technical-knowledge/fundamentals/06-databases-transactions-consistency.md), [SD02](../../../technical-knowledge/system-design/02-data-at-scale.md)
4. Publique um portal de conteúdo estático para clientes, com baixa latência e sem acesso direto à origem. — [F02](../../../technical-knowledge/fundamentals/02-http-rest-openapi.md)
5. Uma campanha de cashback vai gerar um pico de acessos em poucos minutos. O que você muda antes do lançamento? — [SD05](../../../technical-knowledge/system-design/05-scale-capacity-deployment.md), [F02](../../../technical-knowledge/fundamentals/02-http-rest-openapi.md)

Para aprofundar em padrões que a própria Amazon usa: [Amazon Builders' Library](https://aws.amazon.com/builders-library/).

A base teórica de cada tema está na [trilha de system design](../../../technical-knowledge/system-design/README.md#trilha).
