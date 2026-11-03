// Princípios destacados na conversa de preparação para o loop final.
// A ênfase resume a orientação recebida; não é uma lista oficial de perguntas
// nem o mapa de princípios por entrevistador, que não foi informado.
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export const focusMark = '★';
export const focusHub = 'leadership-principles/loop-focus.md';
export const focusPrinciples = new Map([
  ['leadership-principles/01-customer-obsession.md', 'atuação consultiva, feedback de clientes e interações difíceis, inclusive dizer não.'],
  ['leadership-principles/02-ownership.md', 'assumir responsabilidades além do escopo inicial em benefício do resultado.'],
  ['leadership-principles/05-learn-and-be-curious.md', 'identificar o que aprender, escolher recursos e aplicar o aprendizado.'],
  ['leadership-principles/08-think-big.md', 'adoção, replicação e legado além da entrega imediata.'],
  ['leadership-principles/09-bias-for-action.md', 'responder com prazo curto, dados incompletos e risco calculado.'],
  ['leadership-principles/11-earn-trust.md', 'autocrítica, feedback difícil, confiança e influência.'],
  ['leadership-principles/12-dive-deep.md', 'análise profunda, por camadas, com métricas e causa raiz. Associado à entrevista técnica.'],
  ['leadership-principles/13-have-backbone-disagree-and-commit.md', 'discordâncias, contrapontos e apoio a uma decisão diferente da preferida.'],
  ['leadership-principles/14-deliver-results.md', 'resultados expressivos ou alcançados apesar de obstáculos importantes.']
]);

export const isFocus = source => focusPrinciples.has(source);
// Títulos aparecem escapados na navegação; por isso a marca é texto, não HTML.
export const focusTitle = (title, source) => isFocus(source) ? `${title} ${focusMark}` : title;

// Inserido no lugar do </h1> da ficha. Usa os tokens de tema existentes, então
// funciona nos modos claro e escuro; a CSP do site permite estilo inline.
export function focusHeading(source, hubUrl) {
  const emphasis = focusPrinciples.get(source);
  if (!emphasis) return '';
  return ` <span class="focus-mark" aria-hidden="true" style="color: var(--action)">${focusMark}</span></h1>`
    + `<aside class="audience-notice focus-notice" role="note" style="border-left: 4px solid var(--action)">`
    + `<strong><span aria-hidden="true">${focusMark}</span> Foco do loop.</strong> Ênfase indicada na preparação: ${escape(emphasis)} `
    + `<a href="${escape(hubUrl)}">Ver as histórias e as rodadas de treino →</a></aside>`;
}
