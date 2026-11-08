// Exact collection approved by the owner for named, bilingual publication.
// This does not authorize publishing other profiles, filled evaluations or secrets.
export const authoredStories = [
  ['01', 'scaling-incident', 'Investigação do pico de tráfego da Projeção no Itaú, capacidade e validação da jornada.'],
  ['02', 'cache-latency', 'Cache-aside com Valkey para CARMO e EQ3, latência, TTL e invalidação.'],
  ['03', 'account-id-migration', 'Migração gradual para idConta do EQ3 com compatibilidade entre contratos.'],
  ['04', 'cmdb-ownership', 'Automação de ownership no CMDB com StackSpot, Mesh, Python e revisão humana.'],
  ['05', 'unused-solution', 'Descontinuação controlada de uma solução sem consumo e verificação de custos AWS.'],
  ['06', 'emergency-db-migration', 'Relato de migração com snapshot, decisões, validação e divergências a confirmar.'],
  ['07', 'open-finance-agent', 'Integração de saldo Open Finance, comportamento do agente e validação em homologação.'],
  ['08', 'missed-deadline', 'Feedback após atraso e evolução no planejamento e na comunicação de impedimentos.'],
  ['09', 'exposed-credentials', 'Identificação e comunicação de credenciais expostas sem intervenção indevida nas dependências.'],
  ['10', 'disagree-terraform', 'Discordância fundamentada sobre StackSpot e adoção dos módulos Terraform do HN8.'],
].map(([id, slug, description]) => ({
  id: `STAR-${id}`, source: `leadership-principles/stories/star-${id}-${slug}.md`,
  url: `/leadership-principles/stories/star-${id}-${slug}.html`, description,
}));
const bySource = new Map(authoredStories.map(story => [story.source, story]));
const urls = new Set(authoredStories.map(story => story.url));
export const authoredStoryFor = source => bySource.get(source);
export const isAuthoredStory = source => bySource.has(source);
export const isAuthoredStoryUrl = value => urls.has(`/${String(value).replace(/^\//, '').split(/[?#]/, 1)[0]}`);
export function storyLocaleMarkdown(markdown, locale = 'pt-BR') {
  if (!['pt-BR', 'en-US'].includes(locale)) return '';
  const section = new RegExp(`<section\\b[^>]*\\bdata-story-locale=["']${locale}["'][^>]*>([\\s\\S]*?)<\\/section>`, 'i');
  return markdown.match(section)?.[1] || '';
}
