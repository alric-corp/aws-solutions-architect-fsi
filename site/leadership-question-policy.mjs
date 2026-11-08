// Opt in only the sixteen principle pages; indexes, stories and instructor
// material retain their own language controls and publication policies.
export const principleQuestionSources = [
  '01-customer-obsession',
  '02-ownership',
  '03-invent-and-simplify',
  '04-are-right-a-lot',
  '05-learn-and-be-curious',
  '06-hire-and-develop-the-best',
  '07-insist-on-the-highest-standards',
  '08-think-big',
  '09-bias-for-action',
  '10-frugality',
  '11-earn-trust',
  '12-dive-deep',
  '13-have-backbone-disagree-and-commit',
  '14-deliver-results',
  '15-strive-to-be-earths-best-employer',
  '16-success-and-scale-bring-broad-responsibility',
].map(slug => `leadership-principles/${slug}.md`);
const sources = new Set(principleQuestionSources);
export const principleQuestionPrefix = source => sources.has(source) ? `lp${source.split('/').at(-1).slice(0, 2)}` : '';
