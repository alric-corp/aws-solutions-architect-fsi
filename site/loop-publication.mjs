import fs from 'node:fs/promises';
import path from 'node:path';
import { compileLoopPages, serializeLoopData, root } from '../scripts/loop-private/build.mjs';

const readText = async source => {
  const file = path.join(root, source);
  if ((await fs.lstat(file)).isSymbolicLink()) throw new Error('Fonte pública do loop não pode ser link simbólico.');
  return fs.readFile(file, 'utf8');
};
const read = async name => JSON.parse(await readText(`site/loop-training/${name}`));
const agenda = await read('agenda.json');
export const loopPageUrl = id => `/praticar/loop/${id}/index.html`;
// Only these supplied assessments can be read into the public instructor pages.
const reviewSources = new Map([
  [loopPageUrl('dia-10'), { source: 'site/loop-training/dia-10-avaliacao.md', title: 'Dia 10 — Entrevista técnica com Edu' }],
  ['/praticar/loop/dia-10/apresentacao/index.html', { source: 'site/loop-training/dia-10-apresentacao.md', title: 'Dia 10 — Apresentação do case' }],
  ['/praticar/loop/dia-11/ricardo/index.html', { source: 'site/loop-training/dia-11-ricardo.md', title: 'Dia 11 — Entrevista com Ricardo' }],
  ['/praticar/loop/dia-11/fernanda/index.html', { source: 'site/loop-training/dia-11-fernanda.md', title: 'Dia 11 — Entrevista com Fernanda Spinardi' }],
]);
export const loopPublicPages = agenda.pages.map(page => ({
  id: page.pageId, title: page.title, url: loopPageUrl(page.pageId), entryLabel: page.entryLabel,
  interactive: page.sessions.some(session => session.questions?.length),
}));
const interactivePages = loopPublicPages.filter(page => page.interactive);
export const loopReviewSessions = agenda.pages.flatMap(day => {
  const trainingUrl = id => `${loopPageUrl(day.pageId)}?sessao=${encodeURIComponent(id)}`;
  const sessions = day.sessions.map(({ id, name, time, role, reviewUrl }) => ({
    id, name, time, role, url: reviewUrl || trainingUrl(id),
  }));
  return day.sessions.filter(session => session.reviewUrl).map(session => {
    const source = reviewSources.get(session.reviewUrl);
    if (!source) throw new Error(`Avaliação sem fonte pública autorizada: ${session.id}`);
    return { ...source, id: session.id, name: session.name, dayId: day.pageId, url: session.reviewUrl,
      trainingUrl: session.questions?.length ? trainingUrl(session.id) : null, sessions, otherPage: day.otherPage };
  });
});
export const isInteractiveLoopRoute = value => interactivePages.some(page => page.url === `/${String(value).replace(/^\//, '')}`);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const recordKeys = new Set(['evidenceLog','exerciseDrafts','questionAssessments','deepDiveRuns','dimensions','episodio','duvida','ajuda','proxima','updatedAt','privateMarker']);
export function validatePublication(value) {
  if (Array.isArray(value)) { value.forEach(validatePublication); return; }
  if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
    if (recordKeys.has(key)) throw new Error(`Dados locais não publicáveis no loop: ${key}`);
    validatePublication(child);
  }
  if (typeof value === 'string' && /\/Users\/|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:AKIA|ASIA)[A-Z0-9]{16}/.test(value)) throw new Error('Caminho local ou possível credencial na publicação do loop.');
}
export async function compilePublishedLoop() {
  const inputs = { agenda, behavioral: await read('behavioral.json'), technical: await read('technical.json'), urlForPage: loopPageUrl };
  validatePublication(inputs);
  if (!agenda.pages.every(page => page.publication === 'public')) throw new Error('Publicação do loop exige configuração explicitamente pública.');
  return (await compileLoopPages(inputs)).pages.filter(page => isInteractiveLoopRoute(loopPageUrl(page.pageId)));
}
export async function readLoopReviews() {
  return Promise.all(loopReviewSessions.map(async session => {
    const markdown = await readText(session.source);
    validatePublication(markdown);
    return { ...session, markdown };
  }));
}
export function renderPublishedLoop(page) {
  const reviews = page.sessions.filter(session => session.reviewUrl).map(session =>
    `<p><a href="${escape(session.reviewUrl)}">${escape(session.name)} · avaliação da entrevista</a></p>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${escape(page.title)} · Arquitetura em prática</title><meta name="description" content="Roteiro público de preparação para entrevista. Material do instrutor, com perguntas e evidências sob consulta."><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/loop-app.css"></head><body class="loop-app" data-loop-publication="public"><a class="skip-link" href="#app">Pular para o roteiro</a><div id="app" tabindex="-1"></div><noscript><main class="loop-noscript"><h1>${escape(page.title)}</h1><p>Roteiro completo e público do instrutor, sem autenticação. JavaScript é necessário para os controles e a liberação manual das evidências. Compartilhe somente a seleção ou faça a condução oral; os registros preenchidos ficam no navegador.</p>${reviews}<p><a href="${escape(page.otherPage.url)}">${escape(page.otherPage.title)}</a> · <a href="/praticar/index.html#instrutor">Voltar a Praticar</a></p></main></noscript><script id="loop-data" type="application/json">${serializeLoopData(page)}</script><script type="module" src="/assets/loop-app.js"></script></body></html>`;
}
// Keep executable inline scripts banned. Only escaped data exactly matching
// an approved page is allowed, on that page's explicit route.
export function isApprovedLoopData(file, attributes, raw, pages) {
  const descriptor = interactivePages.find(page => page.url === `/${String(file).replace(/^\//, '')}`);
  if (!descriptor || !/^\s+id="loop-data"\s+type="application\/json"\s*$/.test(attributes) || /[<>&]/.test(raw)) return false;
  const expected = pages.find(page => page.pageId === descriptor.id);
  return Boolean(expected && raw === serializeLoopData(expected));
}
