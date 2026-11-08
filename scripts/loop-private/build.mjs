import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import MarkdownIt from 'markdown-it';
import { publicRoots } from '../../site/content.mjs';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const privateRoot = path.join(root, '.site/loop-privado');
export const output = path.join(privateRoot, 'output');
const sourceRoot = path.join(privateRoot, 'source');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = new MarkdownIt({ html: false, linkify: false });
// Source references are displayed as text in this local tool. Do not navigate
// from the private interview panel into a public site while sharing a screen.
md.renderer.rules.link_open = () => '<span>';
md.renderer.rules.link_close = () => '</span>';
const markdown = value => md.render(value || '');
const sourceHashes = new Map();
async function readSource(relative, hashes = sourceHashes) {
  if (!relative || path.isAbsolute(relative) || relative.split('/').includes('..')) throw new Error('Caminho de fonte inválido.');
  const target = path.join(root, relative);
  if ((await fs.lstat(target)).isSymbolicLink()) throw new Error('Fonte simbólica não aceita.');
  const text = await fs.readFile(target, 'utf8');
  hashes.set(relative, createHash('sha256').update(text).digest('hex'));
  return text;
}
export async function questionFromBank(id, hashes = sourceHashes) {
  const match = /^LP(\d{2})-Q\d{2}$/.exec(id);
  if (!match) throw new Error(`ID inválido: ${id}`);
  const names = (await fs.readdir(path.join(root, 'leadership-principles'))).filter(name => name.startsWith(`${match[1]}-`) && name.endsWith('.md'));
  if (names.length !== 1) throw new Error(`Arquivo de princípio ambíguo: ${id}`);
  const relative = `leadership-principles/${names[0]}`;
  const lines = (await readSource(relative, hashes)).split('\n');
  const anchor = id.toLowerCase();
  const lineIndex = lines.findIndex(line => line.includes(`id="${anchor}"`) && line.includes(`**${id}.**`));
  if (lineIndex < 0) throw new Error(`Pergunta não encontrada: ${id}`);
  const prompt = lines[lineIndex].split(`**${id}.**`)[1]?.trim();
  if (!prompt) throw new Error(`Enunciado vazio: ${id}`);
  return { id, prompt, kind: 'behavioral', category: 'Comportamental', source: { label: `Banco do repositório · ${id}`, path: relative, anchor, line: lineIndex + 1 } };
}
async function readPrivateJson(name) {
  if (!/^[\w-]+\.json$/.test(name)) throw new Error('Configuração deve estar na pasta privada de fontes.');
  const file = path.join(sourceRoot, name);
  if ((await fs.lstat(file)).isSymbolicLink()) throw new Error('Configuração simbólica não aceita.');
  return JSON.parse(await fs.readFile(file, 'utf8'));
}
async function ensurePrivateBoundary() {
  if (publicRoots.some(prefix => '.site/loop-privado/'.startsWith(prefix))) throw new Error('Raiz privada incluída na publicação.');
  execFileSync('git', ['check-ignore', '--quiet', '.site/loop-privado/source/agenda.json'], { cwd: root });
  await fs.mkdir(privateRoot, { recursive: true });
  for (const folder of [path.join(root, '.site'), privateRoot, sourceRoot]) {
    if ((await fs.lstat(folder)).isSymbolicLink()) throw new Error('Raiz privada não pode ser link simbólico.');
  }
  if (await fs.lstat(output).then(stat => stat.isSymbolicLink()).catch(() => false)) throw new Error('Saída não pode ser link simbólico.');
}
function renderExercise(exercise) {
  if (!exercise) return undefined;
  return {
    ...exercise,
    premisesHtml: markdown(exercise.premisesMarkdown),
    instructorHtml: markdown(exercise.instructorMarkdown),
    cards: exercise.cards.map(card => ({ ...card, studentHtml: markdown(card.studentMarkdown), notesHtml: markdown(card.notesMarkdown) }))
  };
}
export function serializeLoopData(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
export async function compileLoopPages({ agenda, behavioral, technical, urlForPage = id => `/${id}/` }) {
  const hashes = new Map();
  if (agenda.pages?.length !== 2) throw new Error('A configuração privada precisa definir exatamente duas páginas.');
  const pageIds = agenda.pages.map(page => page.pageId);
  if (new Set(pageIds).size !== 2 || pageIds.some(id => typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id === 'assets')) throw new Error('Identificadores de páginas inválidos ou repetidos.');
  for (const page of agenda.pages) {
    const otherId = pageIds.find(id => id !== page.pageId);
    if (page.otherPage?.url !== urlForPage(otherId) || typeof page.title !== 'string' || !page.title.trim() || !Array.isArray(page.sessions) || !page.sessions.length) throw new Error('Navegação ou conteúdo da página privada inválido.');
  }
  const sources = [];
  const pages = [];
  for (const page of agenda.pages) {
    const sessions = [];
    for (const session of page.sessions) {
      async function resolveQuestion(recipe) {
        let question = recipe;
        if (recipe.lpId) {
          if (!behavioral[recipe.lpId]) throw new Error(`Notas ausentes: ${recipe.lpId}`);
          question = { ...behavioral[recipe.lpId], ...await questionFromBank(recipe.lpId, hashes) };
          sources.push({ page: page.pageId, session: session.id, id: question.id, ...question.source, replacement: null });
        }
        if (recipe.scenario) {
          const exercise = technical[recipe.scenario];
          if (!exercise) throw new Error(`Simulado ausente: ${recipe.scenario}`);
          const currentSource = await readSource(exercise.sourcePath, hashes);
          if (createHash('sha256').update(currentSource).digest('hex') !== exercise.expectedSourceSha) throw new Error(`O simulado mudou; revise a projeção privada antes de gerar: ${exercise.sourcePath}`);
          question = { ...recipe, prompt: recipe.prompt || exercise.prompt, exercise: renderExercise(exercise), source: { label: 'Roteiro autoral do repositório · adaptação de condução · variante fixa', path: exercise.sourcePath, anchor: '', line: 1 } };
          sources.push({ page: page.pageId, session: session.id, id: question.id, ...question.source, variant: exercise.variantLabel });
        }
        if (!recipe.lpId && !recipe.scenario) sources.push({ page: page.pageId, session: session.id, id: question.id, ...question.source, authorial: true });
        if (!question.id || !question.prompt || !question.source?.label) throw new Error('Pergunta sem ID, enunciado ou proveniência.');
        return question;
      }
      const questions = [];
      for (const recipe of session.questions) questions.push(await resolveQuestion(recipe));
      const reserves = [];
      for (const recipe of session.reserves || []) reserves.push(await resolveQuestion(recipe));
      if (new Set([...questions, ...reserves].map(q => q.id)).size !== questions.length + reserves.length) throw new Error(`IDs repetidos na rodada: ${session.id}`);
      sessions.push({ ...session, questions, reserves, notesHtml: markdown(session.notesMarkdown) });
    }
    pages.push({ ...page, schemaVersion: 1, sessions });
  }
  return { pages, sources, sourceHashes: Object.fromEntries(hashes) };
}
async function build() {
  await ensurePrivateBoundary();
  const agenda = await readPrivateJson('agenda.json');
  const behavioral = await readPrivateJson('behavioral.json');
  const technical = await readPrivateJson('technical.json');
  const { pages, sources, sourceHashes: hashes } = await compileLoopPages({ agenda, behavioral, technical });
  // No configurable output path: private content can never target dist/assets.
  for (const folder of [output, path.join(output, 'assets'), ...pages.map(page => path.join(output, page.pageId))]) {
    if (await fs.lstat(folder).then(stat => stat.isSymbolicLink()).catch(() => false)) throw new Error('Destino privado simbólico não aceito.');
    await fs.mkdir(folder, { recursive: true });
  }
  async function writePrivate(relative, bytes) {
    const file = path.join(output, relative);
    if (await fs.lstat(file).then(stat => stat.isSymbolicLink()).catch(() => false)) throw new Error('Arquivo de saída simbólico não aceito.');
    await fs.writeFile(file, bytes);
  }
  for (const [from, to] of [['site/site.css','site.css'],['dist/assets/source-sans.woff2','source-sans.woff2'],['scripts/loop-private/app.js','app.js'],['scripts/loop-private/app.css','app.css']]) {
    await writePrivate(`assets/${to}`, await fs.readFile(path.join(root, from)));
  }
  for (const page of pages) {
    const folder = path.join(output, page.pageId);
    await fs.mkdir(folder, { recursive: true });
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escape(page.title)} · Treino local privado</title><link rel="icon" href="data:,"><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/app.css"></head><body class="loop-app"><a class="skip-link" href="#loop-session-panel">Pular para a rodada</a><div id="app"></div><noscript><main class="loop-noscript"><h1>${escape(page.title)}</h1><p>Esta é uma ferramenta privada de preparação. JavaScript é necessário para os controles e a liberação de evidências. Não compartilhe esta página inteira. Faça a condução oral a partir dos roteiros locais, sem abrir respostas na tela da participante.</p><p><a href="${escape(page.otherPage.url)}">${escape(page.otherPage.title)}</a></p></main></noscript><script id="loop-data" type="application/json">${serializeLoopData(page)}</script><script type="module" src="/assets/app.js"></script></body></html>`;
    await writePrivate(`${page.pageId}/index.html`, html);
  }
  const manifest = { private: true, createdAt: new Date().toISOString(), pages: pages.map(page => `${page.pageId}/index.html`), sources, sourceHashes: hashes, officialInterview: false };
  await fs.mkdir(path.join(privateRoot, 'review'), { recursive: true });
  await fs.writeFile(path.join(privateRoot, 'review/source-map.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Somente local: ${pages.length} páginas → ${output}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length > 2) throw new Error('Este gerador usa somente .site/loop-privado/source; não aceita destino ou fonte públicos.');
  await build();
}
