# Rodada 5 — Material de condução

Use este roteiro para conduzir a conversa e liberar a matriz e os registros quando solicitados. Toda a topologia e seus resultados são sintéticos; não representam recursos existentes.

## Objetivos de observação

A pessoa deve verificar quem pode conversar com quem antes de reparar uma tentativa, explicar a não transitividade de peering e evitar transformar isolamento em incidente. Para uma evolução hipotética, precisa considerar ida, volta, controles e operação, em vez de apenas citar um serviço.

## Estado reservado ao instrutor

A matriz aprovada permite A ↔ B e mantém A ↔ C isoladas. B ↔ C tem uso próprio aprovado, que não autoriza trânsito de A. A mudança da aplicação tentou A → C sem revisão dessa matriz e presumiu que os dois peerings criavam trânsito por B. Portanto há uma expectativa técnica incorreta e uma necessidade ainda não aprovada, não uma conectividade A–C que deva ser aberta automaticamente.

A aula de múltiplas redes preserva esse mesmo isolamento. Se o candidato perguntar pelo requisito cedo, entregue-o cedo: não esconda a informação para obrigá-lo a propor uma abertura indevida.

## Cartões

| Solicitação ou equivalente | Informação liberada — sintética | Conclusão possível | Ainda incerto |
|---|---|---|---|
| A nova conversa está aprovada? Qual a matriz? | A ↔ B permitidas; B ↔ C permitidas para outro uso; A ↔ C devem permanecer isoladas. A nova chamada não passou pela revisão de requisito. | A falha observada não autoriza abertura de A–C; é preciso tratar a mudança da aplicação e o requisito. | Se o negócio vai solicitar e obter aprovação para um fluxo novo. |
| Quais caminhos existem de fato? | Peering direto A–B e B–C; não existe A–C, proxy ou TGW. | Há dois relacionamentos diretos, não um trânsito geral entre três redes. | Rotas e controles das conversas já permitidas ainda podem ser verificados. |
| Qual era a expectativa da equipe? | Ela esperava alcançar C de A “passando pelo peering de B”. | A expectativa depende de trânsito não suportado por esse conjunto de peerings. | Mesmo com outro mecanismo técnico, a política ainda precisaria autorizar a conversa. |
| A conversa antiga continua íntegra? | Teste controlado A → B:443 e resposta funcionam; a matriz inversa e os controles permanecem conforme a configuração aprovada. | Não há evidência de regressão da comunicação antiga no recorte amostrado. | Isso não prova C ou outros serviços. |
| Como conter a mudança sem violar a matriz? | É possível desativar a nova chamada pela configuração da aplicação, preservando a função anterior; qualquer dependência nova será revisada com os responsáveis. | A contenção mantém o isolamento e reduz o impacto da mudança. | O requisito funcional e uma arquitetura futura não estão decididos. |

## Evolução hipotética depois da aprovação

Só após resolver o caso atual, entregue uma condição nova e explícita: “O responsável aprovou uma chamada restrita A → C:443 e seu retorno, sem abrir as demais conversas. Compare alternativas.” Isto é uma transferência de requisito, não um fato secreto que já valia na rodada.

Um peering A–C direto pode atender a um relacionamento simples, com rotas dos dois lados e controles correspondentes. Um [Transit Gateway com tabelas seletivas](https://docs.aws.amazon.com/vpc/latest/tgw/tgw-route-tables.html) pode organizar relações adicionais, mas attachment não basta: verificar associação, propagação ou rotas estáticas, tabelas da VPC, retorno e controles. Não habilitar propagação indiscriminada nem supor isolamento apenas pelo desenho.

A [documentação de peering](https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html) explica que a relação não é transitiva. Um proxy em B seria uma aplicação que recebe e inicia outra comunicação, com suas próprias responsabilidades de autorização, operação e disponibilidade; não torna peering transitivo. Não o introduza como um “jeitinho” sem requisito.

Aceite alternativas sustentadas por escala de relacionamentos, capacidade operacional, segurança e modelo de cobrança, sem preços ou limiares universais inventados. Os CIDRs deste exercício são distintos; não adicione um problema de sobreposição para forçar NAT.

## Critérios e debrief

Evidências desejadas: pedir a matriz; distinguir tentativa de requisito aprovado; explicar o caminho e sua limitação; preservar A–B; conter a nova chamada sem abrir A–C; explicar uma evolução com as duas direções e limites. “Colocaria TGW” é insuficiente sem tabela e política. “Peering não é transitivo” é correto, mas precisa ser ligado à decisão operacional do caso.

Comunicação para negócio: “A nova integração exige uma conversa que ainda não foi aprovada. Os acessos antigos continuam no recorte verificado; conteremos a mudança e submeteremos a necessidade à revisão.” Para operação: relacionamentos atuais, matriz, controle de mudança da aplicação, teste de preservação e condições para uma proposta futura.

Transferência: se A–C já estivesse aprovada, seria legítimo projetar um caminho direto ou outro mecanismo compatível. O diagnóstico técnico da não transitividade continuaria; a decisão sobre abrir a conversa mudaria. Pergunte qual fato alterou essa decisão.

[Praticar L5](../../laboratorio/l5-topologias-registros.md) · [Voltar ao curso](../../README.md) · [Voltar aos simulados](../README.md)
