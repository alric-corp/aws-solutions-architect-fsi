# O que esperar da entrevista na AWS

Mapa das etapas e de onde cada uma é treinada neste repositório. O formato muda com a vaga e o nível; confirme etapas, duração e ferramentas com o recrutador.

## Visão geral

| Etapa | Foco provável | Onde se preparar |
|---|---|---|
| Triagem inicial | Trajetória, motivação, base técnica e uma ou duas perguntas comportamentais | [Perguntas comuns](common-questions.md) · [Fundamentals](../technical-knowledge/fundamentals/README.md) |
| Entrevistas técnicas | Profundidade nos fundamentos e capacidade de desenhar e defender uma arquitetura | [Fundamentals](../technical-knowledge/fundamentals/README.md) · [System Design](../technical-knowledge/system-design/README.md) · [cases](../cases/) |
| Entrevistas comportamentais | Evidência dos Leadership Principles em experiências reais | [Leadership Principles](../leadership-principles/README.md) |

Na prática as etapas se misturam: conversas técnicas costumam incluir perguntas comportamentais, e o contrário também acontece.

## Triagem inicial

Conversa curta para confirmar aderência antes do restante do processo. **Neste processo, a entrevista inicial será pelo Zoom.**

Leve preparado:

- uma apresentação de cerca de um minuto que ligue sua trajetória à vaga ([roteiro](common-questions.md));
- os motivos para AWS e para FSI, com exemplos concretos;
- explicações curtas de conceitos de nuvem e dos serviços que você já usou, sem inflar a experiência;
- duas ou três histórias STAR que aguentem aprofundamento;
- perguntas suas para o fim da conversa ([sugestões](tips-and-strategies.md)).

## Entrevistas técnicas

As perguntas tendem a começar simples e se aprofundar até o limite do seu conhecimento: o caminho de uma requisição, a escolha de um banco, o comportamento sob falha. Dizer onde termina o que você sabe, e como investigaria o resto, vale mais do que improvisar.

Quando a conversa virar desenho de arquitetura:

1. comece pelos requisitos e pelas restrições, inclusive regulatórias;
2. desenhe o caminho principal antes dos detalhes;
3. justifique cada componente pela necessidade que ele atende;
4. trate falhas, segurança e custo como parte do desenho;
5. nomeie o trade-off de cada escolha e o que mudaria a decisão.

Treine com o [roteiro técnico](simulations/02-technical/mock-script.md) e as [perguntas de design](simulations/03-system-design/design-questions.md). Se houver exercício de código, confirme o formato e o ambiente com o recrutador.

## O que pesa para Solutions Architect

A função combina profundidade técnica com conversa de negócio. Além de acertar a arquitetura, mostre que você:

- traduz o problema do cliente em requisitos antes de escolher serviços;
- explica a mesma decisão para públicos técnicos e executivos;
- reconhece riscos e limites, inclusive regulatórios, em FSI;
- sabe quando a resposta é “depende” e do que ela depende.

Os fundamentos de TI (redes, computação, bancos de dados, armazenamento e segurança) sustentam essas conversas. Veja o [papel do SA](../role/solutions-architect-role.md).

### Perguntas por domínio

| Domínio | Arquivo |
|---|---|
| Nuvem | [F00 — Computação em nuvem](../technical-knowledge/fundamentals/00-computacao-em-nuvem.md) |
| Rede | [F01 — Redes, DNS e conectividade](../technical-knowledge/fundamentals/01-redes-dns-conectividade.md) |
| Segurança | [F03 — Segurança e identidade](../technical-knowledge/fundamentals/03-seguranca-identidade.md) |
| Computação | [F04 — Computação e containers](../technical-knowledge/fundamentals/04-computacao-containers.md) |
| Armazenamento | [F05 — Armazenamento](../technical-knowledge/fundamentals/05-armazenamento.md) |
| Bancos de dados | [F06 — Bancos e consistência](../technical-knowledge/fundamentals/06-bancos-consistencia.md) |
| Migração | [F12 — Resiliência e migração](../technical-knowledge/fundamentals/12-resiliencia-migracao.md) |
| Design arquitetural | [Perguntas de design](simulations/03-system-design/design-questions.md) |
| Simulação técnica completa | [Roteiro técnico](simulations/02-technical/mock-script.md) |

Para aprofundar: [Amazon Builders' Library](https://aws.amazon.com/builders-library/).

## Entrevistas comportamentais

As perguntas pedem situações vividas: o que aconteceu, o que você fez e qual foi o resultado. Os entrevistadores aprofundam até entender o seu papel real, e por isso histórias infladas se desmontam rápido. Segundo Andy Jassy, CEO da Amazon, nos loops de contratação cada entrevistador fica com um princípio de liderança, e a decisão final pergunta se a pessoa eleva a barra. Veja [Hire and Develop the Best](../leadership-principles/06-hire-and-develop-the-best.md).

Como se preparar:

- faça o inventário de experiências antes de associá-las aos princípios ([STAR e evidências](../leadership-principles/00-star-e-evidencias.md));
- traga números quando existirem e saiba como foram medidos;
- inclua histórias de erro, com o que mudou depois;
- treine com o [roteiro comportamental](simulations/01-behavior/mock-script.md).

Para a reta final, use o [checklist](checklist.md).
