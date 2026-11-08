# STAR-09 — Credenciais expostas

<div data-story-locales data-story-title-pt="STAR-09 — Credenciais expostas" data-story-title-en="STAR-09 — Exposed credentials">

<section data-story-locale="pt-BR" lang="pt-BR">

> Relato autoral de Vitória, fornecido pelo proprietário. Tradução de estudo; execução e métricas não auditadas nesta página.

**Preparação:** Ownership é a associação principal sugerida. Earn Trust e Bias for Action podem ajudar a explorar comunicação, julgamento e rapidez na sinalização; não são atribuições oficiais de entrevistadores.

[Ownership](../02-ownership.md) · [Earn Trust](../11-earn-trust.md) · [Bias for Action](../09-bias-for-action.md) · [Foco do loop](../loop-focus.md)

## STAR

**Situação.** Durante uma investigação técnica no **Itaú**, eu analisava uma biblioteca para entender se poderia ser útil em uma solução que desenvolvia. Ao explorar o código, identifiquei **um usuário e uma senha expostos no arquivo pom.xml**.

Ao investigar melhor, percebi que a biblioteca estava relacionada à atualização de diferentes módulos ou aplicações do banco. Além da exposição das credenciais, uma alteração indevida poderia afetar aplicações que dependiam daquela configuração.

**Tarefa.** Embora a biblioteca não estivesse sob minha responsabilidade direta, entendi que não poderia ignorar o problema. Precisava garantir que a vulnerabilidade fosse tratada sem provocar um impacto operacional que eu não conseguia dimensionar.

Meu desafio era avaliar o risco, compreender até onde poderia atuar com segurança e envolver as pessoas certas.

**Ação.** Investiguei a finalidade da configuração e quais aplicações poderiam depender dela. Percebi que não tinha visibilidade suficiente para determinar quantos sistemas seriam afetados por uma alteração.

Eu poderia simplesmente remover as credenciais do arquivo, mas isso não garantiria que o risco estivesse resolvido e poderia interromper processos de atualização. Por isso, decidi **não alterar diretamente uma configuração compartilhada sem conhecer suas dependências e riscos**.

Ainda no mesmo dia, comuniquei a descoberta à liderança, começando pelo coordenador e pela gerência. A situação também foi escalonada até a superintendência.

Em paralelo, acionei a equipe especializada em segurança, compartilhei as evidências e expliquei o contexto técnico. Disponibilizei-me para apoiar a investigação e a correção. Minha participação concentrou-se em esclarecer como encontrei as credenciais e o que havia levantado; o time especializado conduziu o tratamento.

**Resultado.** Posteriormente, recebi confirmação do time responsável de que **as credenciais eram válidas e a vulnerabilidade havia sido corrigida**. Em uma reunião posterior, a liderança mencionou a situação e agradeceu a iniciativa de identificar e comunicar o problema.

Eu não executei a correção diretamente. Minha contribuição foi identificar a exposição, avaliar o risco de intervir sem conhecer todas as dependências e fazer o problema chegar aos responsáveis **ainda no mesmo dia**. Não conhecia o número exato de aplicações dependentes nem o impacto financeiro potencial e não consigo quantificá-los.

**Aprendizado.** Ownership não significa executar tudo sozinha. Significa assumir responsabilidade pelo problema, reconhecer os riscos de uma decisão e envolver as pessoas certas para chegar a uma solução segura.

> **Escopo do relato.** Esta página não contém usuário, senha, endpoint, arquivo interno ou evidência operacional. A validade e a correção são confirmações recebidas dos responsáveis, segundo o relato; não são verificações executadas pelo site.

## Follow-ups de preparação

Responda antes de abrir. As perguntas são de estudo, não questões oficiais da AWS.

### 1. Por que você não corrigiu a vulnerabilidade imediatamente?

<details><summary>Ver resposta preparada</summary>

Porque eu não conhecia todas as dependências daquela biblioteca. Remover uma credencial não necessariamente elimina o risco e poderia interromper aplicações que dependiam daquela autenticação. Encaminhei o problema para que a correção fosse planejada com segurança.

</details>

### 2. Você sempre escalaria uma vulnerabilidade em vez de corrigir?

<details><summary>Ver resposta preparada</summary>

Não necessariamente. Se estivesse dentro da minha autonomia e eu conseguisse avaliar as dependências e o impacto, poderia implementar a correção seguindo os processos de segurança. Nesse caso, havia dependências compartilhadas que eu não conseguia dimensionar.

</details>

### 3. Qual foi o impacto mensurável da sua atuação?

<details><summary>Ver resposta preparada</summary>

O que consigo sustentar é que identifiquei uma credencial válida exposta, comuniquei o risco no mesmo dia e recebi posteriormente a confirmação da correção. Não tenho dados suficientes para quantificar aplicações afetadas ou prejuízo potencial evitado.

</details>

### 4. Por que envolver a liderança até a superintendência?

<details><summary>Ver resposta preparada</summary>

Havia um risco de segurança em uma biblioteca compartilhada e eu não tinha visibilidade completa de suas dependências. Comuniquei inicialmente minha liderança direta; a situação foi escalonada conforme a avaliação de criticidade e o envolvimento dos responsáveis.

</details>

## Como preparar a apresentação oral

Dê mais ênfase à decisão técnica, aos limites de autonomia, às evidências e ao envolvimento da equipe responsável do que à hierarquia dos cargos. Não invente número de aplicações, prejuízo evitado ou detalhes de rotação/revogação que não acompanhou. A força do relato é a iniciativa segura e a comunicação no mesmo dia, sem absorver a autoria da correção.

</section>

<section data-story-locale="en-US" lang="en-US">

> Story authored by Vitória, supplied by the owner. Study translation; execution and metrics have not been audited on this page.

**Preparation:** Ownership is the main suggested association. Earn Trust and Bias for Action can help explore communication, judgment and prompt escalation; these are not official interviewer assignments.

[Ownership](../02-ownership.md) · [Earn Trust](../11-earn-trust.md) · [Bias for Action](../09-bias-for-action.md) · [Loop focus](../loop-focus.md)

## STAR

**Situation.** During a technical investigation at **Itaú**, I was examining a library to understand whether it could help with a solution I was developing. While reading its code, I found **a username and password exposed in its pom.xml file**.

Investigating further, I realized the library was involved in updating different bank modules or applications. Besides the exposed credentials, an inappropriate change could affect applications that depended on that configuration.

**Task.** Although the library was not directly owned by me, I knew I should not ignore the problem. I needed to help ensure the vulnerability was addressed without causing an operational impact I could not yet assess.

My responsibility was to understand the risk, establish where I could act safely and involve the right people.

**Action.** I investigated the configuration's purpose and its possible application dependencies. I realized I did not have enough visibility to determine how many systems a change could affect.

Simply removing the credentials from the file would not necessarily resolve the risk and could interrupt update processes. I therefore decided **not to change a shared configuration directly without understanding its dependencies and risks**.

I reported the finding to my leadership on the same day, starting with my coordinator and management. The situation was also escalated to senior leadership.

In parallel, I involved the specialist security team, shared the evidence and explained the technical context. I offered to support the investigation and correction. My contribution focused on explaining how I had found the credentials and what I had learned, while the specialist team handled remediation.

**Result.** I later received confirmation from the responsible team that **the credentials were valid and the vulnerability had been corrected**. In a later leadership meeting, the finding was mentioned and I was thanked for identifying and reporting it.

I did not implement the correction myself. My contribution was identifying the exposure, assessing the risk of acting without complete dependency information and ensuring the issue reached the responsible people **on the day it was discovered**. I did not know the exact number of dependent applications or potential financial impact and cannot quantify them.

**Learning.** Ownership does not mean doing everything alone. It means taking responsibility for a problem, recognizing decision risks and involving the right people to reach a safe solution.

> **Account scope.** This page contains no actual username, password, endpoint, internal file or operational evidence. Credential validity and remediation are confirmations received from the responsible team according to the supplied account, not checks performed by this website.

## Preparation follow-ups

Answer before opening. These are study questions, not official AWS questions.

### 1. Why did you not fix the vulnerability immediately?

<details><summary>View prepared answer</summary>

I did not understand all of the library's dependencies. Removing a credential would not necessarily eliminate the risk and could interrupt applications using that authentication. I involved the responsible teams so remediation could be planned safely.

</details>

### 2. Would you always escalate a vulnerability instead of fixing it?

<details><summary>View prepared answer</summary>

Not necessarily. If the change were within my authority and I could assess the dependencies and impact, I could implement the correction through the security process. In this case, there were shared dependencies whose impact I could not assess.

</details>

### 3. What measurable impact can you support?

<details><summary>View prepared answer</summary>

What I can support is that I identified an exposed valid credential, reported the risk on the same day and later received confirmation of remediation. I do not have enough data to quantify affected applications or potential losses avoided.

</details>

### 4. Why was the issue escalated through senior leadership?

<details><summary>View prepared answer</summary>

There was a security risk in a shared library, and I did not have complete visibility of its dependencies. I initially informed my direct leadership, and the issue was escalated according to the assessment of criticality and the involvement needed from the responsible teams.

</details>

## Preparing the oral account

Emphasize technical judgment, limits of authority, evidence and involvement of the responsible team rather than the reporting hierarchy. Do not invent application counts, avoided losses or rotation/revocation details you did not observe. The account's strength is safe initiative and same-day reporting, without claiming authorship of the remediation.

</section>

</div>
