import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import MarkdownIt from 'markdown-it';
import { publicRoots } from '../site/content.mjs';
import { isRetiredSource } from '../site/content-policy.mjs';
import { validatePublication } from '../site/loop-publication.mjs';

// Validation only: this script never builds, deploys, opens a real browser profile,
// runs the private generator, or reads private schedules/records.
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const sourceRoot = path.join(root, 'site/loop-training');
const review = path.join(root, '.site/loop-public-review');
const routeRoot = '/praticar/loop/';
const pageIds = ['dia-10', 'dia-11'];
const routes = pageIds.map(id => `${routeRoot}${id}/index.html`);
const namespace = 'loop-practice:v1';
// The presentation contract preserves legacy IDs while surfacing the six
// priority topics before the remaining twelve authorial questions.
const presentationIds = {
  T1: 'AP-02-01', T2: 'AP-02-06', T3: 'AP-02-03', T4: 'AP-03-06', T5: 'AP-03-07',
  T6: 'AP-03-01', T7: 'AP-03-03', T8: 'AP-03-08', T9: 'AP-06-01', T10: 'AP-04-01',
  B1: 'AP-01-01', B2: 'AP-01-05', B3: 'AP-01-06', B4: 'AP-02-04',
  B5: 'AP-05-06', B6: 'AP-05-03', B7: 'AP-05-04', B8: 'AP-06-02',
};
const priorityCodes = ['T1', 'T3', 'T6', 'T7', 'B1', 'B6'];
const presentationOrder = [...priorityCodes, 'T2', 'T4', 'T5', 'T8', 'T9', 'T10', 'B2', 'B3', 'B4', 'B5', 'B7', 'B8'];
const assessmentQualities = ['nao-observado', 'incompleta', 'regular', 'boa', 'excelente'];
const assessmentSupports = ['espontanea', 'apos-aprofundamento', 'apos-explicacao'];
const assessmentBases = ['fato-projeto', 'a-confirmar', 'hipotese', 'melhoria-hoje'];
const assessmentActions = ['melhorar-explicacao', 'confirmar-evidencia', 'revisar-conceito', 'variar-cenario'];
const legacyPresentationIds = [
  ...[['01', 4], ['02', 5], ['03', 5], ['04', 4], ['05', 5]].flatMap(([group, count]) =>
    Array.from({ length: count }, (_, index) => `AP-${group}-${String(index + 1).padStart(2, '0')}`)),
  'AP-RES-01', 'AP-RES-02',
];
// Captured before the presentation expansion. Canonical object keys make this
// content check independent of JSON formatting and property order.
const unchangedReserveHashes = {
  'AP-01-02': 'fedf03681e98773aa6d8716da3e88c6f6fdc78070c0cf073a72ce90695d8431f',
  'AP-01-03': '915760b393d8b408424e734f2917ef824ca50247d015b8781c96a09cc18c3be8',
  'AP-01-04': 'e909c6d65dae0ee3dd16831c77322828cd1b3589ced529f6c835587691ede7fe',
  'AP-02-02': 'af0ec218a851cc4181621fcf30a8a2d1d1a5f49cac92f4099982c36cc10bd568',
  'AP-02-05': '09387b2ce3b1119a396c147a252ba09bf9d432f7b3c51ca09325dc4e49ca6ce3',
  'AP-03-02': '9ee107f425586be1f0d1ad8a4028f35529ee9a24a6ab52acee6d981ab3375e35',
  'AP-03-04': '7e8befaa0750b6cd5b2a41a127abc56e1dbd08161c5762ba444105ce4c7e572d',
  'AP-03-05': '6ada563dc26e03c3f6a225d45ebff97c7b07d02f14bb4ee6a3c37167948eac07',
  'AP-04-02': '82e641d89941abee0fb06c76f4058dd9023166345ccee040157157e11646563f',
  'AP-04-03': 'e15f79bdbeab4d45c065eebf26091e7a84278535f919976f91c17fbbe6e052eb',
  'AP-04-04': 'ff3ebe2238c26629d4b0c4d4b74e7f378f685618704841232d748eea0b4b5175',
  'AP-05-01': '2e7b17a0365b09ed8781d3b092641d4a9a68e03bb664cf4621377ea600d8df25',
  'AP-05-02': 'c180846cbc20a834e7513f2fbca6d2ac91c8b68c57f2b42944b6b47c83dfe71e',
  'AP-05-05': 'df253f33911e8045864d7b525cb38e399e20ba1c0abcd1f24a1a140c0f3cdf3c',
  'AP-RES-01': '59aa6ea5825c907c6d3f240ca28cc0af34c9ba3a1827489474b83035930175f4',
  'AP-RES-02': '79f710e3b8d14dbb75f314223c90b83573b20bd46198b11a0118163a5ac67012',
};
const args = process.argv.slice(2);
assert.ok(args.every(arg => arg === '--browser'), 'Uso: node scripts/check-loop-public.mjs [--browser]');
const browserRequested = args.includes('--browser');
const base = process.env.LOOP_PUBLIC_TEST_URL || 'http://127.0.0.1:4322';
const target = new URL(base);
assert.ok(target.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname), 'Use somente um preview HTTP local');
assert.equal(target.pathname, '/', 'LOOP_PUBLIC_TEST_URL deve conter somente a origem');
const report = { base, browserRequested, checks: [], captures: [], limits: ['Validação documental e Chromium local em contextos descartáveis; não representa avaliação pedagógica, entrevista real ou execução AWS.'] };
const md = new MarkdownIt({ html: false, linkify: false });
md.renderer.rules.link_open = () => '<span>';
md.renderer.rules.link_close = () => '</span>';
const markdown = value => md.render(value || '');
const normalized = value => String(value).replace(/\s+/g, ' ').trim();
const folded = value => normalized(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const read = relative => fs.readFile(path.join(root, relative), 'utf8');
const readJSON = async relative => JSON.parse(await read(relative));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const without = (value, omitted) => Object.fromEntries(Object.entries(value).filter(([key]) => !omitted.includes(key)));
let agenda;
let behavioral;
let technical;
let pages;
let publicPolicy;

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalValue(value[key])]));
  return value;
}

function presentationCode(question) {
  const match = /^(?:Prioridade\s+(\d+)\s*·\s*)?([TB]\d+)(?:\s*·\s*|$)/.exec(question.category || '');
  assert.ok(match && presentationIds[match[2]], `Categoria precisa identificar o código de apresentação: ${question.id}`);
  return { code: match[2], priority: match[1] ? Number(match[1]) : null };
}

function checkEvaluatorGuides(session, approved) {
  const guide = session.evaluationGuide;
  assert.ok(guide, 'A apresentação precisa do guia geral de avaliação');
  assert.deepEqual(guide, approved.evaluationGuide);
  for (const field of ['title', 'notice', 'example', 'closing']) assert.ok(typeof guide[field] === 'string' && normalized(guide[field]), `Guia geral sem ${field}`);
  for (const [field, values] of [['levels', assessmentQualities], ['supports', assessmentSupports], ['bases', assessmentBases], ['actions', assessmentActions]]) {
    assert.deepEqual(guide[field]?.map(item => item.value), values, `Opções de avaliação divergentes: ${field}`);
    for (const option of guide[field]) {
      assert.ok(typeof option.label === 'string' && normalized(option.label));
      if (['levels', 'supports'].includes(field)) assert.ok(typeof option.description === 'string' && normalized(option.description));
    }
  }
  for (const field of ['instructions', 'pocketQuestions']) assert.ok(Array.isArray(guide[field]) && guide[field].length && guide[field].every(item => typeof item === 'string' && normalized(item)));
  assert.equal(guide.neutralPrompts?.length, 4, 'Quatro pares de condução devem contrastar indução e pergunta neutra');
  for (const prompt of guide.neutralPrompts) {
    assert.ok(typeof prompt.leading === 'string' && normalized(prompt.leading));
    assert.ok(typeof prompt.neutral === 'string' && normalized(prompt.neutral));
    assert.notEqual(folded(prompt.leading), folded(prompt.neutral));
  }
  const guidance = folded(JSON.stringify(guide));
  for (const pattern of [/honest|sincer/, /complet/, /nao observado|nao-observado/, /zero/, /oficial/, /media|somar|somatorio|pontuacao/, /perfei|gabarito unico/]) assert.match(guidance, pattern, 'O guia deve preservar os limites didáticos da avaliação');
  const signatures = Object.fromEntries(['expected', 'nextFollowup', ...assessmentQualities.slice(1)].map(key => [key, new Set()]));
  for (const question of session.questions) {
    const expected = approved.questions.find(item => item.id === question.id)?.evaluatorGuide;
    const item = question.evaluatorGuide;
    assert.ok(item && expected, `Guia específico ausente: ${question.id}`);
    assert.deepEqual(item, expected, 'O guia publicado deve preservar o guia aprovado da pergunta');
    assert.equal(item.code, presentationCode(question).code);
    assert.deepEqual(Object.keys(item.levels || {}).sort(), [...assessmentQualities.slice(1)].sort());
    for (const field of ['expected', 'nextFollowup']) {
      assert.ok(typeof item[field] === 'string' && normalized(item[field]), `Guia ${item.code} sem ${field}`);
      signatures[field].add(folded(item[field]));
    }
    const levels = Object.values(item.levels);
    assert.ok(levels.every(level => typeof level === 'string' && normalized(level)));
    assert.equal(new Set(levels.map(folded)).size, 4, 'Cada pergunta precisa de quatro níveis distintos');
    for (const quality of assessmentQualities.slice(1)) signatures[quality].add(folded(item.levels[quality]));
    for (const field of ['cautions', 'factsToConfirm']) assert.ok(Array.isArray(item[field]) && item[field].length && item[field].every(text => typeof text === 'string' && normalized(text)), `Guia ${item.code} sem limites/fatos a confirmar`);
  }
  for (const [field, values] of Object.entries(signatures)) assert.equal(values.size, 18, `Os 18 guias precisam de conteúdo específico em ${field}`);
  return { guides: 18, qualityOptions: assessmentQualities.length, supports: assessmentSupports.length, bases: assessmentBases.length, actions: assessmentActions.length };
}

function checkPresentation(page, approvedPage) {
  const session = page.sessions.find(item => item.id === 'apresentacao');
  const approved = approvedPage.sessions.find(item => item.id === 'apresentacao');
  assert.ok(session && approved, 'Apresentação do Dia10 ausente');
  assert.equal(session.questions.length, 18, 'A apresentação deve oferecer dez temas técnicos e oito de negócio');
  assert.deepEqual(session.questions.map(question => presentationCode(question).code), presentationOrder, 'As seis prioridades devem preceder os outros doze temas na ordem acordada');
  const all = [...session.questions, ...(session.reserves || [])];
  const expectedIds = [...new Set([...legacyPresentationIds, ...Object.values(presentationIds)])];
  assert.equal(all.length, 34, 'A expansão deve manter as perguntas legadas como reservas');
  assert.deepEqual(all.map(question => question.id).sort(), expectedIds.sort(), 'Cada ID antigo e novo deve aparecer exatamente uma vez');
  for (const [id, expectedHash] of Object.entries(unchangedReserveHashes)) {
    const reserve = (approved.reserves || []).find(question => question.id === id);
    assert.ok(reserve, `A pergunta legada precisa continuar disponível como reserva: ${id}`);
    assert.equal(digest(JSON.stringify(canonicalValue(reserve))), expectedHash, `Conteúdo da reserva legada alterado: ${id}`);
  }
  const evidenceSignatures = new Set();
  const followupSignatures = new Set();
  const objectiveSignatures = new Set();
  const priorityTopics = {
    T1: /memoria|freeablememory|oom|paginacao/,
    T3: /alternativa|snapshot|dms|viabilidade/,
    T6: /validacao|chave|contage|comparacao/,
    T7: /escrit|grava|delta|reconcilia|dados.*(?:produz|depois)/,
    B1: /conversao|impacto|cliente|jornada/,
    B6: /manutencao|metric|indicador/,
  };
  for (const [index, question] of session.questions.entries()) {
    const { code, priority } = presentationCode(question);
    assert.equal(question.id, presentationIds[code], 'O código precisa manter o ID definido no contrato');
    assert.equal(question.kind, 'presentation');
    assert.equal(priority, index < priorityCodes.length ? index + 1 : null, 'Somente as seis primeiras perguntas recebem uma prioridade numerada');
    const source = approved.questions.find(item => item.id === question.id);
    assert.ok(source);
    assert.deepEqual(question.followups, source.followups, 'Publicação deve preservar todos os aprofundamentos específicos');
    assert.deepEqual(question.notes, source.notes, 'Publicação deve preservar as notas específicas');
    for (const [values, minimum, label] of [[question.followups, 4, 'aprofundamentos'], [question.notes?.evidence, 2, 'evidências'], [question.notes?.limits, 2, 'limites']]) {
      assert.ok(Array.isArray(values) && values.length >= minimum, `${code} precisa de ${minimum} ${label}`);
      assert.ok(values.every(value => typeof value === 'string' && normalized(value)), `${code} contém ${label} vazios`);
      assert.ok(new Set(values.map(folded)).size >= minimum, `${code} não pode repetir itens para completar ${label}`);
    }
    assert.ok(typeof question.notes.objective === 'string' && normalized(question.notes.objective));
    evidenceSignatures.add(JSON.stringify(question.notes.evidence.map(folded)));
    followupSignatures.add(JSON.stringify(question.followups.map(folded)));
    objectiveSignatures.add(folded(question.notes.objective));
    if (priorityTopics[code]) assert.match(folded([question.prompt, ...question.followups, question.notes.objective, ...question.notes.evidence].join(' ')), priorityTopics[code], 'A prioridade deve aprofundar seu tema específico');
  }
  assert.equal(evidenceSignatures.size, 18, 'Os temas precisam de evidências específicas, além de notas comuns de condução');
  assert.equal(followupSignatures.size, 18, 'Os aprofundamentos não podem ser um único bloco genérico repetido');
  assert.equal(objectiveSignatures.size, 18, 'Cada tema deve explicar seu objetivo específico');
  const notes = folded(session.notesMarkdown);
  for (const pattern of [/(?:seis|6).{0,80}prioridad|prioridad.{0,80}(?:seis|6)/, /analise escrita/, /ambigu|penden|a confirmar/, /na epoca|naquele momento|decisao passada/, /verificad|verificacao|validacao/, /hoje|retrospect|reflexao/]) assert.match(notes, pattern, 'Notas gerais devem explicar escopo, prioridades e distinções da revisão');
  for (const code of presentationOrder) assert.match(notes, new RegExp(`\\b${code.toLowerCase()}\\b`), 'O mapa das notas deve incluir os 18 temas');
  const slideScope = session.notesMarkdown.split(/\n\s*\n/).find(paragraph => /slides?/i.test(paragraph));
  assert.ok(slideScope, 'A revisão precisa delimitar acesso a slides e à fala');
  const scope = folded(slideScope);
  assert.match(scope, /analise/);
  assert.match(scope, /somente|apenas|unica|so a analise/);
  assert.match(scope, /fala|oral|gravacao|transcricao/);
  assert.match(scope, /nao|sem/);
  assert.match(scope, /consult|analis|receb|disponib|acess/);
  return { primary: 18, technical: 10, business: 8, priorities: [...priorityCodes], totalWithReserves: all.length, unchangedReserves: Object.keys(unchangedReserveHashes).length, evaluation: checkEvaluatorGuides(session, approved) };
}

async function filesIn(folder) {
  const files = [];
  for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), 'A validação não segue links simbólicos');
    const file = path.join(folder, entry.name);
    files.push(...(entry.isDirectory() ? await filesIn(file) : [file]));
  }
  return files;
}

function embeddedData(html) {
  const matches = [...html.matchAll(/<script\b[^>]*\bid=["']loop-data["'][^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(matches.length, 1, 'Cada página deve conter exatamente um payload loop-data');
  return JSON.parse(matches[0][1]);
}

function assertNoFilledRecords(value, location = 'payload') {
  if (Array.isArray(value)) return value.forEach((item, index) => assertNoFilledRecords(item, `${location}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    assert.notEqual(key, 'privateMarker', 'Marcador da antiga publicação privada não pertence ao material publicado');
    assert.notEqual(key, 'questionAssessments', 'Fichas e histórico preenchidos pertencem somente ao navegador, não ao build');
    if (['episodio', 'duvida', 'ajuda', 'proxima', 'updatedAt', 'releasedAt'].includes(key)) {
      assert.ok(item === '' || item === null || item === undefined, `Registro preenchido em ${location}.${key}`);
    }
    if (['records', 'record', 'evidenceLog', 'exerciseDrafts'].includes(key)) {
      assert.ok(item === null || (typeof item === 'object' && Object.keys(item).length === 0), `Registro preenchido em ${location}.${key}`);
    }
    if (key === 'dimensions' && item && typeof item === 'object') {
      for (const dimension of Object.values(item)) {
        assert.equal(dimension.status, 'nao-observado');
        assert.ok(!dimension.note, 'Dimensões publicadas devem permanecer em branco');
      }
    }
    assertNoFilledRecords(item, `${location}.${key}`);
  }
}

async function bankQuestion(id) {
  const match = /^LP(\d{2})-Q\d{2}$/.exec(id);
  assert.ok(match, 'ID LP inválido');
  const files = (await fs.readdir(path.join(root, 'leadership-principles'))).filter(file => file.startsWith(`${match[1]}-`) && file.endsWith('.md'));
  assert.equal(files.length, 1, 'O princípio deve ter uma fonte inequívoca');
  const sourcePath = `leadership-principles/${files[0]}`;
  const lines = (await read(sourcePath)).split('\n');
  const anchor = id.toLowerCase();
  const line = lines.findIndex(text => text.includes(`id="${anchor}"`) && text.includes(`**${id}.**`));
  assert.ok(line >= 0, `Pergunta LP ausente: ${id}`);
  return { prompt: lines[line].split(`**${id}.**`)[1].trim(), path: sourcePath, anchor, line: line + 1 };
}

function assertProjection(exercise, expected, source) {
  assert.deepEqual(without(exercise, ['premisesHtml', 'instructorHtml', 'cards']), without(expected, ['cards']), 'O exercício publicado deve preservar sua fonte aprovada');
  assert.equal(exercise.cards.length, expected.cards.length);
  assert.equal(exercise.premisesHtml, markdown(expected.premisesMarkdown));
  assert.equal(exercise.instructorHtml, markdown(expected.instructorMarkdown));
  for (const [index, card] of exercise.cards.entries()) {
    const approved = expected.cards[index];
    assert.deepEqual(without(card, ['studentHtml', 'notesHtml']), approved, 'Cartão publicado diferente do cartão aprovado');
    assert.equal(card.studentHtml, markdown(approved.studentMarkdown), 'A projeção do aluno deve conter somente studentMarkdown');
    assert.equal(card.notesHtml, markdown(approved.notesMarkdown));
    assert.match(card.studentMarkdown, /sintétic/i, 'Toda observação deve identificar sua natureza sintética');
    assert.match(card.studentMarkdown, /não executad/i, 'Nenhum resultado narrado deve parecer um teste real');
    assert.ok(!/<(?:script|iframe|object|form|input|textarea)\b|\son\w+=/i.test(card.studentHtml), 'Projeção estudantil deve permanecer inerte');
    // Permit only the synthetic label and the E6 expectation label as added text.
    // Remaining nonempty lines must be excerpts of the existing exercise.
    const excerpt = card.studentMarkdown.replace(/^\*\*Informação sintética[^\n]*\*\*[^\n]*(?:\n\n)?/, '').replace(/^\*\*Resultados esperados de testes narrados, não executados:\*\*\s*/, '');
    for (const line of excerpt.split('\n').map(line => line.trim()).filter(Boolean)) {
      assert.ok(source.includes(line), `Texto adicional no cartão ${card.id}: a evidência precisa vir do cenário existente`);
    }
  }
}

async function checkStatic() {
  const configFiles = (await fs.readdir(sourceRoot)).filter(file => file.endsWith('.json')).sort();
  assert.deepEqual(configFiles, ['agenda.json', 'behavioral.json', 'technical.json'], 'Somente os três JSON aprovados devem compor a publicação');
  [agenda, behavioral, technical] = await Promise.all(['agenda', 'behavioral', 'technical'].map(name => readJSON(`site/loop-training/${name}.json`)));
  assert.doesNotThrow(() => validatePublication(agenda));
  assert.throws(() => validatePublication({ questionAssessments: {} }), /questionAssessments/);
  assert.throws(() => validatePublication({ pages: [{ sessions: [{ questionAssessments: { FIXTURE_AP: { draft: { said: 'FIXTURE_NAO_PUBLICAVEL' }, observations: [] } } }] }] }), /questionAssessments/);
  for (const source of [agenda, behavioral, technical]) assertNoFilledRecords(source, 'fonte aprovada');
  assert.deepEqual(agenda.pages.map(page => page.pageId), pageIds);
  assert.deepEqual(agenda.pages.flatMap(page => page.sessions.filter(session => session.id !== 'apresentacao').map(session => session.name)), ['Edu', 'Bru', 'Rica', 'Fer', 'Luca'], 'A publicação deve usar os cinco nomes abreviados aprovados');
  assert.deepEqual(agenda.pages.map(page => page.sessions.length), [2, 4], 'As duas páginas devem conter todas as seis rodadas aprovadas');
  const allFiles = await filesIn(dist);
  const loopFiles = allFiles.filter(file => file.startsWith(path.join(dist, 'praticar/loop') + path.sep));
  assert.deepEqual(loopFiles.filter(file => file.endsWith('.html')).map(file => '/' + path.relative(dist, file).split(path.sep).join('/')).sort(), [...routes].sort(), 'A publicação contém exatamente os dois HTML completos');
  const manifest = await readJSON('dist/content-manifest.json');
  const search = await readJSON('dist/search-index.json');
  // Match the build's actual Markdown selection, so adding legitimate study
  // material does not require changing this loop-specific regression check.
  const selectedSources = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(source =>
    source.endsWith('.md') && (source === 'README.md' || publicRoots.some(prefix => source.startsWith(prefix))) && !isRetiredSource(source));
  assert.deepEqual(manifest.map(doc => doc.sourcePath).sort(), selectedSources.sort(), 'O manifesto deve corresponder exatamente às fontes Markdown selecionadas pelo build');
  assert.ok(manifest.every(doc => !JSON.stringify(doc).includes(routeRoot) && !String(doc.sourcePath).startsWith('site/loop-training/')), 'Loop não entra no manifesto/progresso');
  assert.ok(search.every(item => !String(item.url).includes(routeRoot)), 'Loop não entra na busca de estudantes');
  const manifestByUrl = new Map(manifest.map(doc => [doc.canonicalUrl, doc]));
  for (const item of search) {
    const doc = manifestByUrl.get(item.url.split('#')[0]);
    assert.ok(doc?.search && doc.audience === 'student' && !doc.standalone && doc.publication === 'public', 'Busca deve preservar isolamento de instrutor e cases FSI');
  }
  for (const doc of manifest.filter(doc => doc.sourcePath.startsWith('cases/'))) {
    assert.ok(doc.collection === 'fsi-cases' && doc.standalone === true && doc.progress === false && doc.search === false, 'Cases FSI continuam isolados');
  }
  for (const doc of manifest.filter(doc => doc.audience === 'instructor')) assert.ok(!doc.search && !doc.progress);
  const sitemap = allFiles.filter(file => path.basename(file).startsWith('sitemap') && file.endsWith('.xml'));
  for (const file of sitemap) assert.ok(!(await fs.readFile(file, 'utf8')).includes(routeRoot), 'Roteiros de acesso deliberado não entram no sitemap');
  let deliberateLinks = 0;
  const htmlPages = new Map();
  for (const file of allFiles.filter(file => file.endsWith('.html'))) {
    const html = await fs.readFile(file, 'utf8');
    const route = '/' + path.relative(dist, file).split(path.sep).join('/');
    if (routes.includes(route)) {
      htmlPages.set(route, html);
      assert.match(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i, 'Roteiros completos são públicos, com acesso deliberado e noindex');
      assert.ok(!html.includes('PRIVATE_LOOP_TRAINING_') && !html.includes('.site/loop-privado/'), 'Artefato público não deve carregar marcadores/caminhos do painel privado');
      assert.ok(!/FIXTURE_|TESTE_REGISTRO_PUBLICO_/.test(html), 'Não publicar fixtures ou registros preenchidos');
      continue;
    }
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/g)].filter(match => match[1].includes(routeRoot));
    if (!links.length) continue;
    assert.equal(route, '/praticar/index.html', 'Links de entrada do loop pertencem somente a Praticar');
    const start = html.search(/<section\b[^>]*id=["']instrutor["']/);
    assert.ok(start >= 0, 'Entradas do loop devem ficar em Praticar#instrutor');
    const end = html.indexOf('</section>', start);
    assert.ok(end > start);
    const section = html.slice(start, end);
    assert.match(section, /<details\b[^>]*>/);
    assert.ok(!/<details\b[^>]*\bopen(?:\s|>|=)/.test(section), 'A entrada do instrutor começa fechada');
    assert.deepEqual(links.map(link => link[1]).sort(), [...routes].sort(), 'Praticar oferece exatamente duas entradas para os roteiros');
    for (const link of links) assert.ok(link.index >= start && link.index < end, 'Link do loop fora da área de instrutor');
    deliberateLinks += links.length;
  }
  assert.equal(deliberateLinks, 2);
  pages = routes.map(route => embeddedData(htmlPages.get(route)));
  const seenLP = [];
  let questions = 0;
  const sourceTexts = new Map();
  for (const exercise of Object.values(technical)) {
    assert.ok(exercise.sourcePath && !exercise.sourcePath.includes('..') && !path.isAbsolute(exercise.sourcePath));
    const source = await read(exercise.sourcePath);
    sourceTexts.set(exercise.sourcePath, source);
    if (exercise.expectedSourceSha) assert.equal(digest(source), exercise.expectedSourceSha, 'O cenário existente mudou: revisar as projeções aprovadas');
  }
  for (const [pageIndex, page] of pages.entries()) {
    const approved = agenda.pages[pageIndex];
    assert.equal(page.schemaVersion, 1);
    assert.equal(page.publication, 'public', 'O app deve selecionar explicitamente o namespace da publicação pública');
    assert.deepEqual(without(page, ['sessions', 'schemaVersion']), without(approved, ['sessions', 'schemaVersion']), 'Metadados publicados devem corresponder à agenda aprovada');
    assertNoFilledRecords(page);
    assert.equal(page.sessions.length, approved.sessions.length);
    for (const [sessionIndex, session] of page.sessions.entries()) {
      const recipe = approved.sessions[sessionIndex];
      const assessmentSession = page.pageId === 'dia-10' && session.id === 'apresentacao';
      assert.equal(Boolean(session.evaluationGuide), assessmentSession, 'Guia geral de avaliação pertence apenas à apresentação do Dia10');
      assert.deepEqual(without(session, ['questions', 'reserves', 'notesHtml']), without(recipe, ['questions', 'reserves']), 'Cada rodada deve preservar sua agenda completa');
      assert.equal(session.notesHtml, markdown(recipe.notesMarkdown));
      assert.equal(session.agenda.reduce((sum, phase) => sum + phase.minutes, 0), 60, 'O ensaio deve declarar seus 60 minutos, incluindo feedback');
      for (const collection of ['questions', 'reserves']) {
        assert.equal((session[collection] || []).length, (recipe[collection] || []).length);
        for (const [index, question] of (session[collection] || []).entries()) {
          const questionRecipe = recipe[collection][index];
          const assessmentQuestion = assessmentSession && collection === 'questions' && Object.values(presentationIds).includes(question.id);
          assert.equal(Boolean(question.evaluatorGuide), assessmentQuestion, 'Guia específico pertence apenas às 18 perguntas principais AP');
          questions++;
          assert.ok(question.notes?.objective && question.notes.evidence?.length && question.notes.limits?.length, 'Toda pergunta deve ter orientação e limites separados');
          if (questionRecipe.lpId) {
            const original = await bankQuestion(questionRecipe.lpId);
            assert.equal(question.id, questionRecipe.lpId);
            assert.equal(question.prompt, original.prompt, 'Não reescrever o enunciado LP do banco');
            for (const field of ['path', 'anchor', 'line']) assert.equal(question.source[field], original[field]);
            assert.deepEqual(question.notes, behavioral[question.id].notes);
            seenLP.push(question.id);
          } else if (questionRecipe.scenario) {
            const exercise = technical[questionRecipe.scenario];
            assert.ok(exercise && question.exercise);
            assert.equal(question.prompt, questionRecipe.prompt || exercise.prompt);
            assertProjection(question.exercise, exercise, sourceTexts.get(exercise.sourcePath));
          } else {
            assert.equal(question.prompt, questionRecipe.prompt);
            assert.deepEqual(question.notes, questionRecipe.notes);
            assert.match(question.source.label, /autoral/i);
          }
        }
      }
    }
  }
  assert.equal(seenLP.length, 19, 'As 19 perguntas LP principais e reservas precisam estar completas');
  const pedido = technical.pedido;
  assert.deepEqual(pedido.cards.map(card => card.id), ['P0', 'P1', 'E1', 'E2', 'E3', 'E5', 'E6']);
  assert.match(pedido.variantLabel, /B/);
  assert.match(pedido.premisesMarkdown, /PostgreSQL 16/);
  assert.match(pedido.premisesMarkdown, /Multi-AZ DB instance.*standby síncrono/s);
  const card = (exercise, id) => exercise.cards.find(item => item.id === id);
  assert.match(card(pedido, 'P1').studentMarkdown, /memória do processo.*não há outbox/s);
  assert.match(card(pedido, 'E1').studentMarkdown, /201.*depois do commit/s);
  assert.match(card(pedido, 'E1').studentMarkdown, /pedido confirmado.*registro durável.*pagamento.*pendente/s);
  assert.match(card(pedido, 'E2').studentMarkdown, /client_delivery=unconfirmed/);
  assert.match(card(pedido, 'E3').studentMarkdown, /P201 e P202/);
  for (const entry of pedido.cards) assert.ok(!/intencao-[AC]\b|P301\b|req-[AC]|janela [AC]\b/i.test(entry.studentMarkdown), 'Operações A/C não pertencem aos cartões fixos B');
  assert.equal(card(pedido, 'E6').conditional, true);
  assert.match(card(pedido, 'E6').studentMarkdown, /Resultados esperados.*não executados/s);
  const network = technical.conectividade;
  assert.deepEqual(network.cards.map(entry => entry.id), ['B1', 'B2', 'B3', 'B4']);
  for (const entry of network.cards) assert.ok(!/nat-[AB]|203\.0\.113\.40|frete\.parceiro|PostgreSQL\s*16|Multi-AZ|intencao-B|P201/.test(entry.studentMarkdown));
  assert.match(card(network, 'B2').studentMarkdown, /Não há NAT, Internet Gateway ou endpoint público/);
  assert.match(card(network, 'B3').studentMarkdown, /40000/);
  assert.match(card(network, 'B3').studentMarkdown, /32768.*60999/);
  assert.equal(card(network, 'B4').conditional, true);
  assert.deepEqual(technical.consultiva.cards.map(entry => entry.id), ['C1', 'C2', 'C3', 'C4', 'C5']);
  assert.match(card(technical.consultiva, 'C3').studentMarkdown, /possibilidade de negociar escopo ou data ainda não foi discutida/);
  assert.match(card(technical.consultiva, 'C2').studentMarkdown, /Não há um resultado de teste/);
  const presentation = pages.flatMap(page => page.sessions).find(session => session.questions.some(question => question.kind === 'presentation'));
  assert.ok(presentation, 'Apresentação completa ausente');
  for (const pattern of [/DMS\/snapshot/, /autoria/i, /novas escritas/i, /validação/i, /perda zero/i, /contingência/i, /Não escolher a versão verdadeira/]) assert.match(presentation.notesMarkdown, pattern);
  const presentationCheck = checkPresentation(pages.find(page => page.pageId === 'dia-10'), agenda.pages.find(page => page.pageId === 'dia-10'));
  assert.equal(questions, 59, 'As 18 perguntas de apresentação e as reservas legadas devem compor os 59 itens da agenda aprovada');
  const scripts = new Set([...htmlPages.values()].flatMap(html => [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/g)].map(match => match[1])));
  const appScripts = [];
  for (const url of scripts) {
    assert.ok(url.startsWith('/') && !url.startsWith('//'), 'Scripts publicados devem ser locais');
    const script = await read(`dist${url}`);
    if (script.includes(namespace)) appScripts.push(script);
  }
  assert.equal(appScripts.length, 1, 'Um app exclusivo deve usar o namespace público de treino');
  // The same app may serve the existing local tool. Public pages must choose
  // the public branch; browser checks also preserve every seeded foreign key.
  assert.match(appScripts[0], /(?:const|let) STORAGE_PREFIX\s*=\s*(?:isPublic\s*\?\s*)?['"]loop-practice:v1['"]/);
  const stack = await readJSON('site/aws-stack.json');
  publicPolicy = stack.Resources.ResponseHeaders.Properties.ResponseHeadersPolicyConfig.SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy;
  report.static = { pages: pages.length, sessions: pages.map(page => page.sessions.length), questions, lpQuestions: seenLP.length, manifestDocuments: manifest.length, deliberateLinks, filledRecords: 0, fixedVariants: ['SIM02-B PostgreSQL 16', 'SIM03-B', 'CONSULTIVA-BASE C1–C5'], presentation: presentationCheck };
  report.checks.push('Dois HTML completos, três JSON aprovados, 19 LP do banco, projeções fiéis, variantes fixas e pendências factuais preservadas.');
  report.checks.push('Apresentação: T1–T10/B1–B8 com aprofundamentos/notas específicos, seis prioridades primeiro e todos os IDs antigos preservados, incluindo 16 reservas sem alteração.');
  report.checks.push(`${manifest.length} documentos correspondem à seleção pública atual; roteiros fora da busca/progresso/sitemap; somente duas entradas em Praticar#instrutor; registros publicados em branco.`);
}

async function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const roots = [path.join(os.homedir(), 'Library/Caches/ms-playwright'), path.join(os.homedir(), '.cache/ms-playwright')];
  for (const folder of roots) for (const name of (await fs.readdir(folder).catch(() => [])).filter(name => /chromium/.test(name)).sort().reverse()) {
    for (const suffix of ['chrome-headless-shell-mac-arm64/chrome-headless-shell', 'chrome-headless-shell-mac-x64/chrome-headless-shell', 'chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux/chrome', 'chrome-linux64/chrome']) {
      const file = path.join(folder, name, suffix);
      if (await fs.access(file).then(() => true).catch(() => false)) return file;
    }
  }
  throw new Error('Defina CHROMIUM_PATH com Chromium já instalado. O teste não instala ferramentas.');
}

async function checkBrowser() {
  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ executablePath: await chromiumPath(), headless: true });
  const errors = [];
  const contexts = new Set();
  report.browser = { version: await browser.version(), widths: [390, 768, 1440], themes: ['light', 'dark', 'system'], csp: publicPolicy };
  const context = async options => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 }, ...options });
    contexts.add(ctx);
    return ctx;
  };
  function monitor(page) {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => {
      if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== target.origin) errors.push('Requisição externa no ensaio local');
    });
    page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) errors.push(`${request.url()}: ${request.failure()?.errorText}`); });
  }
  async function visit(page, id) {
    const response = await page.goto(`${base}${routeRoot}${id}/index.html`);
    assert.equal(response.status(), 200);
    assert.equal(response.headers()['content-security-policy'], publicPolicy, 'Preview deve aplicar exatamente a CSP pública, sem relaxamento para o loop');
    await page.locator('#loop-question-prompt').waitFor();
    await page.evaluate(() => document.fonts.ready);
  }
  async function noOverflow(page) { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow na largura ${page.viewportSize().width}`); }
  async function selectQuestion(page, id) {
    const option = page.locator(`#loop-question-select option[data-question-id="${id}"]`);
    assert.equal(await option.count(), 1);
    await page.locator('#loop-question-select').selectOption(await option.getAttribute('value'));
    assert.equal(await page.locator('#loop-question-area').getAttribute('data-question-id'), id);
  }
  async function assessmentForm(page, defaults = false) {
    const form = page.locator('details[data-assessment]');
    assert.equal(await form.count(), 1, 'A pergunta AP precisa de uma ficha própria');
    if (!await form.evaluate(element => element.open)) await form.locator(':scope > summary').click();
    assert.deepEqual(await form.locator('[data-assessment-field="quality"] option').evaluateAll(options => options.map(option => option.value)), assessmentQualities);
    assert.deepEqual(await form.locator('[data-assessment-field="support"] option').evaluateAll(options => options.map(option => option.value).filter(Boolean)), assessmentSupports);
    assert.deepEqual(await form.locator('[data-assessment-basis]').evaluateAll(elements => elements.map(element => element.dataset.assessmentBasis)), assessmentBases);
    assert.deepEqual(await form.locator('[data-assessment-action]').evaluateAll(elements => elements.map(element => element.dataset.assessmentAction)), assessmentActions);
    assert.equal(await form.locator('[data-assessment-history]').count(), 1);
    if (defaults) {
      for (const field of ['date', 'support', 'said', 'demonstrated', 'missing', 'nextTest']) assert.equal(await form.locator(`[data-assessment-field="${field}"]`).inputValue(), '', 'Ficha nova deve começar vazia');
      assert.equal(await form.locator('[data-assessment-field="quality"]').inputValue(), 'nao-observado');
      assert.equal(await form.locator('[data-assessment-basis]:checked, [data-assessment-action]:checked').count(), 0);
    }
    return form;
  }
  async function downloadRecord(page) {
    const pending = page.waitForEvent('download');
    await page.locator('[data-action="export-record"]').click();
    const download = await pending;
    return JSON.parse(await fs.readFile(await download.path(), 'utf8'));
  }
  async function present(page, action, expectedText, capture) {
    const pending = page.waitForEvent('popup');
    await action();
    const popup = await pending;
    monitor(popup);
    await popup.waitForSelector('iframe');
    assert.equal(await popup.evaluate(() => window.opener === null), true);
    assert.equal(await popup.locator('iframe').getAttribute('sandbox'), '');
    const frame = popup.frames().find(frame => frame !== popup.mainFrame());
    assert.ok(frame, 'Conteúdo selecionado deve ficar em um frame isolado');
    await frame.locator('main').waitFor();
    assert.equal(await frame.locator('script, input, textarea, button, form').count(), 0);
    assert.equal(await frame.evaluate(() => { try { return parent.document.body ? 'accessible' : 'empty'; } catch { return 'blocked'; } }), 'blocked');
    assert.equal(normalized(await frame.locator('main').innerText()), normalized(expectedText), 'A janela do aluno contém exatamente a seleção, sem notas ou futuros cartões');
    const html = await popup.content();
    for (const field of ['loop-data', 'evidenceLog', 'exerciseDrafts', 'Notas privadas do instrutor']) assert.ok(!html.includes(field));
    if (capture) { await popup.screenshot({ path: path.join(review, capture) }); report.captures.push(capture); }
    await popup.close();
  }
  async function checkAssessmentRecords(page) {
    const pageData = pages.find(item => item.pageId === 'dia-10');
    const session = pageData.sessions.find(item => item.id === 'apresentacao');
    const key = `${namespace}:${pageData.pageId}:${session.id}`;
    const legacy = {
      schemaVersion: 1, pageId: pageData.pageId, sessionId: session.id, updatedAt: '2026-11-08T12:00:00.000Z',
      episodio: 'FIXTURE_LEGADO_EPISODIO', duvida: 'FIXTURE_LEGADO_DUVIDA', ajuda: 'FIXTURE_LEGADO_AJUDA', proxima: 'FIXTURE_LEGADO_PROXIMA',
      dimensions: Object.fromEntries(['aderencia', 'responsabilidade', 'raciocinio', 'colaboracao', 'resultado', 'aprendizado'].map(name => [name, { status: 'parcial', note: `FIXTURE_LEGADO_${name}` }])),
      evidenceLog: [], exerciseDrafts: {},
    };
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key, value: legacy });
    const record = async () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
    async function select(code) {
      await page.locator(`[data-session-id="${session.id}"]`).click();
      await selectQuestion(page, presentationIds[code]);
    }
    await visit(page, pageData.pageId); await select('T6');
    assert.equal(await page.locator('[data-record-field="episodio"]').inputValue(), legacy.episodio);
    for (const question of session.questions) {
      await selectQuestion(page, question.id);
      assert.equal(await page.locator('details[data-evaluator-guide]').count(), 1);
      assert.equal(await page.locator('details[data-assessment]').count(), 1);
      assert.equal(await page.locator('details[data-assessment]').evaluate(element => element.open), false);
    }
    await selectQuestion(page, 'AP-RES-01');
    assert.equal(await page.locator('[data-assessment], [data-evaluator-guide]').count(), 0, 'Reservas sem guia não recebem ficha');
    await selectQuestion(page, presentationIds.T6);
    let form = await assessmentForm(page, true);
    const xss = 'FIXTURE_FICHA_T6 <img src=x onerror="window.__assessmentXss=true">';
    const firstDraft = { date: '2026-11-08', quality: 'excelente', support: 'apos-aprofundamento', said: xss, demonstrated: 'FIXTURE_MECANISMO_DEMONSTRADO', missing: 'FIXTURE_FALTA_DE_EVIDENCIA', bases: ['fato-projeto', 'a-confirmar'], actions: ['confirmar-evidencia', 'variar-cenario'], nextTest: 'FIXTURE_PROXIMO_TESTE' };
    for (const field of ['date', 'said', 'demonstrated', 'missing', 'nextTest']) await form.locator(`[data-assessment-field="${field}"]`).fill(firstDraft[field]);
    await form.locator('[data-assessment-field="quality"]').selectOption(firstDraft.quality);
    await form.locator('[data-assessment-field="support"]').selectOption(firstDraft.support);
    for (const value of firstDraft.bases) await form.locator(`[data-assessment-basis="${value}"]`).check();
    for (const value of firstDraft.actions) await form.locator(`[data-assessment-action="${value}"]`).check();
    let saved = await record();
    assert.deepEqual(saved.questionAssessments[presentationIds.T6].draft, firstDraft, 'Autosave deve preservar qualidade e apoio independentes');
    assert.equal(saved.questionAssessments[presentationIds.T6].observations.length, 0, 'Digitar não pode acrescentar uma observação ao histórico');
    await form.locator('[data-action="save-assessment"]').click();
    saved = await record();
    const first = saved.questionAssessments[presentationIds.T6].observations[0];
    assert.equal(saved.questionAssessments[presentationIds.T6].observations.length, 1);
    assert.deepEqual(without(first, ['savedAt']), firstDraft);
    assert.ok(typeof first.savedAt === 'string' && /T/.test(first.savedAt) && Number.isFinite(Date.parse(first.savedAt)), 'Observações precisam de instante ISO explícito');
    await form.locator('[data-assessment-field="said"]').fill('FIXTURE_SEGUNDA_RESPOSTA_T6');
    await form.locator('[data-assessment-field="quality"]').selectOption('boa');
    await form.locator('[data-assessment-field="support"]').selectOption('apos-explicacao');
    await form.locator('[data-assessment-basis="fato-projeto"]').uncheck();
    await form.locator('[data-assessment-basis="hipotese"]').check();
    await form.locator('[data-assessment-action="confirmar-evidencia"]').uncheck();
    await form.locator('[data-assessment-action="revisar-conceito"]').check();
    saved = await record();
    const secondDraft = saved.questionAssessments[presentationIds.T6].draft;
    assert.equal(saved.questionAssessments[presentationIds.T6].observations.length, 1);
    assert.deepEqual(saved.questionAssessments[presentationIds.T6].observations[0], first, 'Modificar texto, bases e ações não deve modificar o primeiro snapshot');
    await form.locator('[data-action="save-assessment"]').click();
    saved = await record();
    assert.equal(saved.questionAssessments[presentationIds.T6].observations.length, 2);
    assert.deepEqual(saved.questionAssessments[presentationIds.T6].observations[0], first);
    assert.deepEqual(without(saved.questionAssessments[presentationIds.T6].observations[1], ['savedAt']), secondDraft);
    assert.equal(await page.locator('[data-assessment] img').count(), 0);
    assert.equal(await page.evaluate(() => window.__assessmentXss), undefined, 'Rascunho e histórico devem permanecer texto inerte');
    await selectQuestion(page, presentationIds.T7);
    form = await assessmentForm(page, true);
    await form.locator('[data-assessment-field="said"]').fill('FIXTURE_T7_ISOLADA');
    await form.locator('[data-assessment-field="quality"]').selectOption('regular');
    await page.reload(); await page.locator('#loop-question-prompt').waitFor(); await select('T7');
    form = await assessmentForm(page);
    assert.equal(await form.locator('[data-assessment-field="said"]').inputValue(), 'FIXTURE_T7_ISOLADA');
    assert.equal(await form.locator('[data-assessment-field="quality"]').inputValue(), 'regular');
    await selectQuestion(page, presentationIds.T6);
    form = await assessmentForm(page);
    assert.equal(await form.locator('[data-assessment-field="said"]').inputValue(), secondDraft.said);
    assert.equal(await form.locator('[data-assessment-field="support"]').inputValue(), 'apos-explicacao');
    assert.ok((await form.locator('[data-assessment-history]').innerText()).includes('FIXTURE_FICHA_T6'));
    assert.ok((await form.locator('[data-assessment-history]').innerText()).includes(secondDraft.said));
    await page.locator('[data-instructor-notes] > summary').click();
    await page.locator('[data-evaluator-guide] > summary').click();
    await form.screenshot({ path: path.join(review, 'avaliador-T6-historico-recarregado-1440.png') }); report.captures.push('avaliador-T6-historico-recarregado-1440.png');
    await present(page, () => page.locator('[data-action="present-prompt"]').click(), session.questions.find(question => question.id === presentationIds.T6).prompt, 'avaliador-popup-ficha-preenchida-sem-vazamento.png');
    const exported = await downloadRecord(page);
    assert.equal(exported.schemaVersion, 1, 'O formato legado permanece versão1');
    for (const field of ['pageId', 'sessionId', 'episodio', 'duvida', 'ajuda', 'proxima', 'dimensions', 'evidenceLog', 'exerciseDrafts']) assert.deepEqual(exported[field], legacy[field], 'Adicionar fichas não deve apagar o registro legado');
    assert.equal(exported.questionAssessments[presentationIds.T6].observations.length, 2);
    assert.equal(exported.questionAssessments[presentationIds.T7].observations.length, 0);
    assert.equal(exported.questionAssessments[presentationIds.T7].draft.said, 'FIXTURE_T7_ISOLADA');
    assert.ok(Object.keys(exported.questionAssessments).every(id => Object.values(presentationIds).includes(id)), 'Apenas perguntas com guia podem ter fichas');
    for (const field of ['evaluationGuide', 'evaluatorGuide', 'sessions', 'questions', 'reserves', 'agenda']) assert.equal(exported[field], undefined, 'Exportação não inclui roteiro ou guias');
    const storage = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
    for (const [recordKey, value] of Object.entries(storage)) {
      if (!recordKey.startsWith(namespace + ':') || recordKey === `${namespace}:theme` || recordKey === key) continue;
      assert.equal(JSON.parse(value).questionAssessments, undefined, 'Edu e Dia11 não recebem o novo registro');
    }
    report.browser.assessments = { guides: 18, observations: 2, draftAutosave: true, explicitAppend: true, historyDeepCloned: true, reloadAndExport: true, legacySchema: 1, perQuestionIsolation: true, safeText: true };
    report.checks.push('Ficha por APid: opções5/3/4/4, autosave separado do append explícito, dois snapshots imutáveis, reload/export, texto inerte e campos legados preservados.');
  }
  try {
    for (const width of report.browser.widths) for (const preference of report.browser.themes) {
      const ctx = await context({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: 'dark' });
      for (const expected of pages) {
        const page = await ctx.newPage(); monitor(page);
        await visit(page, expected.pageId);
        await page.locator('#loop-theme').selectOption(preference);
        assert.equal(await page.locator('body').getAttribute('data-loop-theme'), preference === 'system' ? 'dark' : preference);
        assert.equal(await page.locator('h1').innerText(), expected.title);
        assert.equal(await page.locator('[data-session-id]').count(), expected.sessions.length);
        assert.equal(await page.locator('details[open]').count(), 0, 'Notas, gabaritos e aprofundamentos começam fechados');
        for (const session of expected.sessions) {
          await page.locator(`[data-session-id="${session.id}"]`).click();
          assert.equal(await page.locator('#loop-session-title').innerText(), session.name);
          assert.equal(await page.locator('details[open]').count(), 0);
          const evaluator = Boolean(session.evaluationGuide);
          assert.equal(await page.locator('details[data-evaluator-guide]').count(), evaluator ? 1 : 0);
          assert.equal(await page.locator('details[data-assessment]').count(), evaluator ? 1 : 0);
          for (const field of await page.locator('[data-record-field], [data-dimension-field="note"]').all()) assert.equal(await field.inputValue(), '');
          for (const field of await page.locator('[data-dimension-field="status"]').all()) assert.equal(await field.inputValue(), 'nao-observado');
          await noOverflow(page);
        }
        await page.locator('[data-session-id]').first().click();
        await page.evaluate(() => scrollTo(0, 0));
        const capture = `${expected.pageId}-${width}-${preference}.png`;
        await page.screenshot({ path: path.join(review, capture), fullPage: true });
        report.captures.push(capture);
        await page.evaluate(() => document.documentElement.style.fontSize = '200%');
        await noOverflow(page);
        await page.close();
      }
      await ctx.close(); contexts.delete(ctx);
    }
    report.checks.push('390/768/1440px, claro/escuro/Sistema, seis rodadas, texto ampliado, notas fechadas e registros vazios.');
    const ctx = await context({ acceptDownloads: true });
    const protectedStorage = {
      'loop-private:v1:theme': 'dark',
      'loop-private:v1:dia-10:fixture': 'FIXTURE_PRIVADA_INTACTA',
      'architecture-practice:study:v2': JSON.stringify({ version: 2, reading: {}, resume: {}, fixture: 'FIXTURE_ESTUDO_INTACTA' }),
      'public-study-fixture': 'FIXTURE_ALHEIA_INTACTA',
    };
    await ctx.addInitScript(values => {
      if (window !== window.top || location.origin === 'null') return;
      for (const [key, value] of Object.entries(values)) if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
    }, protectedStorage);
    const page = await ctx.newPage(); monitor(page);
    await visit(page, pages[0].pageId);
    const firstSession = pages[0].sessions[0];
    const prompt = await page.locator('#loop-question-prompt').innerText();
    await page.locator('[data-action="read-aloud"]').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#loop-readout').innerText(), prompt);
    assert.equal(await page.locator('#loop-readout').evaluate(element => element === document.activeElement), true);
    await page.locator('[data-followup-index="0"] summary').click();
    assert.equal(await page.locator('[data-followup-index="0"]').evaluate(element => element.open), true);
    if (await page.locator('[data-followup-index="1"]').count()) assert.equal(await page.locator('[data-followup-index="1"]').evaluate(element => element.open), false);
    await present(page, () => page.locator('[data-action="present-prompt"]').click(), prompt, 'somente-pergunta.png');
    const presentationPage = pages.find(item => item.pageId === 'dia-10');
    const presentation = presentationPage.sessions.find(item => item.id === 'apresentacao');
    const presentationSubset = ['T6', 'T7', 'B2', 'B6'];
    let presentationSelections = 0;
    for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
      const presentationContext = await context({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme });
      const presenter = await presentationContext.newPage(); monitor(presenter);
      await visit(presenter, presentationPage.pageId);
      await presenter.locator('#loop-theme').selectOption(theme);
      await presenter.locator(`[data-session-id="${presentation.id}"]`).click();
      for (const code of presentationSubset) {
        const question = presentation.questions.find(item => item.id === presentationIds[code]);
        await selectQuestion(presenter, question.id);
        assert.equal(await presenter.locator('details[open]').count(), 0, 'Aprofundamentos e notas da apresentação devem começar recolhidos em cada seleção');
        assert.equal(await presenter.locator('#loop-question-prompt').innerText(), question.prompt);
        assert.equal(await presenter.locator('[data-followup-index]').count(), question.followups.length);
        for (const [index, followup] of question.followups.entries()) assert.equal(await presenter.locator(`[data-followup-index="${index}"] p`).textContent(), followup);
        await noOverflow(presenter);
        if (code === 'T6') {
          const capture = `apresentacao-recolhida-${width}-${theme}.png`;
          await presenter.screenshot({ path: path.join(review, capture), fullPage: true }); report.captures.push(capture);
        }
        // Open actual instructor notes before presenting. Equality in present()
        // proves that even visible notes/follow-ups are excluded from the popup.
        const notes = presenter.locator('[data-instructor-notes]');
        await notes.locator(':scope > summary').click();
        assert.equal(await notes.evaluate(element => element.open), true);
        assert.ok((await notes.innerText()).includes(question.notes.objective));
        const evaluatorGuide = presenter.locator('details[data-evaluator-guide]');
        assert.equal(await evaluatorGuide.evaluate(element => element.open), false);
        await evaluatorGuide.locator(':scope > summary').click();
        const assessment = await assessmentForm(presenter, true);
        if (code === 'T6') {
          await assessment.locator('[data-assessment-field="date"]').fill('2026-11-08');
          await assessment.locator('[data-assessment-field="quality"]').selectOption('boa');
          await assessment.locator('[data-assessment-field="support"]').selectOption('espontanea');
          await assessment.locator('[data-assessment-field="said"]').fill('FIXTURE_T6_PRIMEIRA_OBSERVACAO');
          await assessment.locator('[data-assessment-field="demonstrated"]').fill('FIXTURE_LIMITE_DA_VERIFICACAO');
          await assessment.locator('[data-assessment-field="missing"]').fill('FIXTURE_CRITERIO_A_CONFIRMAR');
          await assessment.locator('[data-assessment-field="nextTest"]').fill('FIXTURE_VARIAR_O_CENARIO');
          await assessment.locator('[data-action="save-assessment"]').click();
          await assessment.locator('[data-assessment-field="quality"]').selectOption('excelente');
          await assessment.locator('[data-assessment-field="support"]').selectOption('apos-aprofundamento');
          await assessment.locator('[data-assessment-field="said"]').fill('FIXTURE_T6_SEGUNDA_OBSERVACAO');
          await assessment.locator('[data-action="save-assessment"]').click();
          assert.equal(await assessment.locator('[data-assessment-observation-index]').count(), 2);
          for (const [element, capture] of [[evaluatorGuide, `avaliador-cola-T6-${width}-${theme}.png`], [assessment, `avaliador-ficha-T6-duas-observacoes-${width}-${theme}.png`]]) {
            await element.screenshot({ path: path.join(review, capture) }); report.captures.push(capture);
          }
        }
        await noOverflow(presenter);
        if (code === 'T6') {
          const capture = `apresentacao-T6-nota-aberta-${width}-${theme}.png`;
          await notes.scrollIntoViewIfNeeded();
          await presenter.screenshot({ path: path.join(review, capture) }); report.captures.push(capture);
        }
        await presenter.locator('[data-followup-index="0"] summary').click();
        assert.equal(await presenter.locator('[data-followup-index="0"]').evaluate(element => element.open), true);
        await present(presenter, () => presenter.locator('[data-action="present-prompt"]').click(), question.prompt, `apresentacao-${code}-${width}-${theme}-somente-pergunta.png`);
        presentationSelections++;
      }
      await presentationContext.close(); contexts.delete(presentationContext);
    }
    report.browser.presentation = { codes: presentationSubset, widths: [390, 1440], themes: ['light', 'dark'], selections: presentationSelections, notesInitiallyClosed: true, popupOnlyPrompt: true, guideAndAssessmentInitiallyClosed: true };
    report.checks.push('Apresentação: T6/T7/B2/B6 em 390/1440px e claro/escuro; notas, cola e ficha começam fechadas; popup contém só a pergunta mesmo com notas, guia e ficha abertos.');
    // Exercise every evidence card, including a reserve and the original consultative flow.
    for (const pageData of pages) for (const session of pageData.sessions) {
      const exercises = [...session.questions, ...(session.reserves || [])].filter(question => question.exercise);
      if (!exercises.length) continue;
      await visit(page, pageData.pageId);
      await page.locator(`[data-session-id="${session.id}"]`).click();
      for (const exerciseQuestion of exercises) {
        await selectQuestion(page, exerciseQuestion.id);
        const exercise = exerciseQuestion.exercise;
        assert.equal(await page.locator('[data-evidence-card]').count(), exercise.cards.length);
        assert.equal(await page.locator('[data-action="present-evidence"]:visible').count(), 0);
        for (const evidence of exercise.cards) {
          const card = page.locator(`article[data-card-id="${evidence.id}"]`);
          await card.locator(':scope > details > summary').click();
          const release = card.locator('[data-action="release-evidence"]');
          assert.equal(await release.isDisabled(), true);
          await page.locator('[data-evidence-request]').fill(`FIXTURE_PEDIDO_SINTETICO: ${evidence.request}`);
          assert.equal(await release.isDisabled(), true);
          await card.locator('[data-confirm-relevant]').check();
          if (evidence.conditional) {
            assert.equal(await release.isDisabled(), true, 'Recuperação exige confirmação adicional da condição');
            await card.locator('[data-confirm-conditional]').check();
          }
          assert.equal(await release.isEnabled(), true);
          await card.locator('[data-card-preview] summary').click();
          const selection = await card.locator('[data-card-preview] .loop-markdown').innerText();
          await release.click();
          assert.equal(ctx.pages().length, 1, 'Liberação não deve abrir a janela do aluno automaticamente');
          await present(page, () => card.locator('[data-action="present-evidence"]').click(), selection, evidence.conditional ? `${exerciseQuestion.id}-${evidence.id}-selecionado.png` : undefined);
        }
      }
    }
    report.checks.push('Todos os cartões requerem pedido e pertinência; E6/B4 exigem condição; liberar e apresentar são ações separadas; aluno recebe somente a seleção.');
    await visit(page, pages[0].pageId);
    const timer = page.locator('#loop-timer-display');
    const initial = await timer.innerText();
    await page.waitForTimeout(1100); assert.equal(await timer.innerText(), initial);
    await page.locator('[data-action="timer-start"]').click();
    assert.equal(await page.locator('#loop-timer-status').innerText(), 'Em andamento');
    // Rendering uses a one-second interval and rounds the remaining time up.
    // Wait for the actual tick instead of assuming a particular interval phase.
    await page.waitForFunction(before => document.getElementById('loop-timer-display').textContent !== before, initial, { timeout: 5000 });
    assert.notEqual(await timer.innerText(), initial);
    await page.locator('[data-action="timer-pause"]').click();
    const paused = await timer.innerText();
    await page.waitForTimeout(1100); assert.equal(await timer.innerText(), paused);
    const fixture = 'TESTE_REGISTRO_PUBLICO_ <img src=x onerror="alert(1)">';
    await page.locator('[data-record-field="episodio"]').fill(fixture);
    await page.locator('[data-dimension="aderencia"][data-dimension-field="status"]').selectOption('demonstrado');
    await page.reload(); await page.locator('#loop-question-prompt').waitFor();
    assert.equal(await page.locator('[data-record-field="episodio"]').inputValue(), fixture);
    assert.equal(await page.locator('[data-session-record] img').count(), 0, 'Registro deve ser texto inerte');
    await page.locator(`[data-session-id="${pages[0].sessions[1].id}"]`).click();
    assert.equal(await page.locator('[data-record-field="episodio"]').inputValue(), '');
    await page.locator(`[data-session-id="${firstSession.id}"]`).click();
    const downloadPending = page.waitForEvent('download');
    await page.locator('[data-action="export-record"]').click();
    const download = await downloadPending;
    const exported = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
    assert.equal(exported.episodio, fixture);
    assert.equal(exported.questionAssessments, undefined, 'A sessão Edu preserva o formato legado sem fichas AP');
    assert.equal(exported.dimensions.aderencia.status, 'demonstrado');
    assert.equal(exported.pageId, pages[0].pageId); assert.equal(exported.sessionId, firstSession.id);
    for (const key of ['sessions', 'questions', 'reserves', 'agenda', 'notes', 'exercise']) assert.equal(exported[key], undefined, 'Exportação deve conter apenas o registro selecionado');
    await visit(page, pages[1].pageId);
    assert.equal(await page.locator('[data-record-field="episodio"]').inputValue(), '');
    await page.locator('[data-record-field="episodio"]').fill('FIXTURE_DIA_SEGUINTE');
    await page.locator(`[data-session-id="${pages[1].sessions[1].id}"]`).click();
    assert.equal(await page.locator('[data-record-field="episodio"]').inputValue(), '');
    await page.locator('#loop-theme').selectOption('system'); await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.body.dataset.loopTheme === 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.body.dataset.loopTheme === 'dark');
    await page.locator('#loop-theme').selectOption('light');
    assert.equal(await page.locator('body').getAttribute('data-loop-theme'), 'light');
    const storage = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
    for (const [key, value] of Object.entries(protectedStorage)) assert.equal(storage[key], value, 'Treino público não pode alterar storage privado ou do site');
    for (const key of Object.keys(storage)) assert.ok(key in protectedStorage || key.startsWith(namespace + ':'), 'Escrita fora do namespace exclusivo do treino');
    assert.ok(Object.keys(storage).some(key => key === `${namespace}:${pages[0].pageId}:${firstSession.id}`), 'O registro usa o namespace de prática pública');
    report.checks.push('Cronômetro manual, texto inerte, persistência e isolamento por rodada/dia, exportação só do registro e storage público/privado preservado.');
    await checkAssessmentRecords(page);
    for (const [key, value] of Object.entries(protectedStorage)) assert.equal(await page.evaluate(key => localStorage.getItem(key), key), value, 'Preencher fichas não altera namespaces privados ou do site');
    const blocked = await context();
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
    const blockedPage = await blocked.newPage(); monitor(blockedPage); await visit(blockedPage, pages[1].pageId);
    assert.equal(await blockedPage.locator('#loop-storage-warning').isVisible(), true);
    await blockedPage.locator('[data-record-field="episodio"]').fill('FIXTURE_APENAS_MEMORIA');
    await blockedPage.locator(`[data-session-id="${pages[1].sessions[1].id}"]`).click();
    await blockedPage.locator(`[data-session-id="${pages[1].sessions[0].id}"]`).click();
    assert.equal(await blockedPage.locator('[data-record-field="episodio"]').inputValue(), 'FIXTURE_APENAS_MEMORIA');
    const popupBlocked = await context();
    await popupBlocked.addInitScript(() => { window.open = () => null; });
    const popupPage = await popupBlocked.newPage(); monitor(popupPage); await visit(popupPage, pages[0].pageId);
    await popupPage.locator('[data-action="present-prompt"]').click();
    assert.match(await popupPage.locator('#loop-status').innerText(), /oralmente/);
    const nojs = await context({ javaScriptEnabled: false });
    const nojsPage = await nojs.newPage();
    const nojsResponse = await nojsPage.goto(`${base}${routes[0]}`);
    assert.equal(nojsResponse.headers()['content-security-policy'], publicPolicy);
    assert.match(await nojsPage.locator('noscript').innerText(), /condução oral/);
    report.checks.push('Storage bloqueado conserva memória e avisa; popup bloqueado oferece condução oral; sem JavaScript comunica o limite.');
    assert.deepEqual(errors, [], 'Nenhum erro JavaScript/CSP/rede ou request externo');
  } finally {
    for (const ctx of contexts) await ctx.close();
    await browser.close();
  }
}

await fs.mkdir(review, { recursive: true });
try {
  await checkStatic();
  if (browserRequested) await checkBrowser();
  report.ok = true;
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.ok = false;
  report.error = { name: error.name, message: error.message, stack: error.stack };
  throw error;
} finally {
  await fs.writeFile(path.join(review, browserRequested ? 'browser-results.json' : 'static-results.json'), JSON.stringify(report, null, 2) + '\n');
}
