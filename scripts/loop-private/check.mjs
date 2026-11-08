import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root, privateRoot, output, questionFromBank } from './build.mjs';

const review = path.join(privateRoot, 'review');
const agenda = JSON.parse(await fs.readFile(path.join(privateRoot, 'source/agenda.json'), 'utf8'));
const expectations = JSON.parse(await fs.readFile(path.join(privateRoot, 'source/check-expectations.json'), 'utf8'));
assert.equal(expectations.schemaVersion, 1, 'Versão inválida das expectativas privadas');
const mapping = JSON.parse(await fs.readFile(path.join(review, 'source-map.json'), 'utf8'));
const pageFields = ['pageId','title','date','dateLabel','otherPage','intro','privacyNotice','privateMarker'];
const sessionFields = ['id','name','role','time','objective','agenda','candidateQuestion','hypothesis'];
const pick = (record, fields) => Object.fromEntries(fields.filter(field => field in record).map(field => [field, record[field]]));
function scheduleSnapshot(pages) {
  return pages.map(page => ({
    ...pick(page, pageFields),
    sessions: page.sessions.map(session => ({
      ...pick(session, sessionFields),
      questionIds: session.questions.map(question => question.lpId || question.id),
      reserveIds: (session.reserves || []).map(question => question.lpId || question.id),
    })),
  }));
}
assert.deepEqual(scheduleSnapshot(agenda.pages), expectations.pages, 'A agenda deve corresponder ao snapshot privado revisado');
assert.equal(expectations.pages.length, expectations.counts.pages);
assert.deepEqual(expectations.pages.map(page => page.sessions.length), expectations.counts.sessions);
async function filesIn(folder) {
  const result = [];
  for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), `Link simbólico inesperado em ${folder}`);
    const target = path.join(folder, entry.name);
    result.push(...(entry.isDirectory() ? await filesIn(target) : [target]));
  }
  return result;
}
const privateFiles = await filesIn(output);
assert.deepEqual(privateFiles.filter(file => file.endsWith('.html')).map(file => path.relative(output, file)).sort(), [...expectations.htmlFiles].sort());
assert.deepEqual(mapping.pages, expectations.htmlFiles);
assert.ok(output.startsWith(path.join(root, '.site') + path.sep));
for (const file of [...expectations.htmlFiles.map(file => path.join('.site/loop-privado/output', file)), '.site/loop-privado/source/check-expectations.json']) {
  execFileSync('git', ['check-ignore', '--quiet', file], { cwd: root });
}
assert.equal(execFileSync('git', ['ls-files', '.site/loop-privado'], { cwd: root, encoding: 'utf8' }).trim(), '');
let lpCount = 0;
let questionCount = 0;
const lpIds = [];
const pages = [];
for (const expected of expectations.pages) {
  const html = await fs.readFile(path.join(output, expected.pageId, 'index.html'), 'utf8');
  const data = JSON.parse(html.match(/<script id="loop-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  pages.push(data);
  assert.equal(data.schemaVersion, 1);
  const date = new Date(`${data.date}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' }).format(date);
  assert.ok(data.dateLabel.toLowerCase().includes(weekday));
  assert.ok(data.dateLabel.includes(data.date.split('-').reverse().join('/')));
  assert.equal(data.sessions.length, expected.sessions.length);
  for (const [index, session] of data.sessions.entries()) {
    assert.deepEqual(pick(session, sessionFields), pick(expected.sessions[index], sessionFields));
    assert.equal(session.agenda.reduce((sum, phase) => sum + phase.minutes, 0), expected.sessions[index].agenda.reduce((sum, phase) => sum + phase.minutes, 0));
    for (const question of [...session.questions, ...session.reserves]) {
      questionCount++;
      if (/^LP/.test(question.id)) {
        const original = await questionFromBank(question.id);
        assert.equal(question.prompt, original.prompt, question.id);
        assert.deepEqual(question.source, original.source);
        lpIds.push(question.id);
        lpCount++;
      } else {
        assert.match(question.source.label, /autoral/i, 'Perguntas adaptadas e propostas devem identificar origem autoral');
      }
      assert.ok(question.notes?.objective && question.notes?.evidence?.length && question.notes?.limits?.length);
    }
  }
}
assert.deepEqual(scheduleSnapshot(pages), expectations.pages, 'O artefato privado deve preservar metadados e IDs ordenados');
assert.equal(pages.length, expectations.counts.pages);
assert.deepEqual(pages.map(page => page.sessions.length), expectations.counts.sessions);
assert.equal(lpCount, expectations.counts.lpIds, 'Todos os IDs principais e reservas solicitados foram conferidos');
assert.deepEqual(lpIds, expectations.lpIds);
assert.equal(questionCount, expectations.counts.questions, 'Todos os itens esperados devem permanecer no artefato privado');
assert.equal(mapping.sources.length, questionCount);
assert.ok(mapping.sources.filter(item => /^LP/.test(item.id)).every(item => item.replacement === null));
function expectedSession(expectation) {
  const page = pages.find(page => page.pageId === expectation.pageId);
  assert.ok(page, 'Página privada esperada ausente');
  const session = page.sessions.find(session => session.id === expectation.sessionId);
  assert.ok(session, 'Sessão privada esperada ausente');
  return session;
}
for (const expected of expectations.exerciseChecks) {
  assert.ok(['questions','reserves'].includes(expected.collection));
  const question = expectedSession(expected)[expected.collection].find(question => question.id === expected.questionId);
  assert.ok(question?.exercise, 'Exercício privado esperado ausente');
  const exercise = question.exercise;
  for (const pattern of expected.variantPatterns || []) assert.match(exercise.variantLabel, new RegExp(pattern));
  for (const pattern of expected.premisesPatterns || []) assert.match(exercise.premisesHtml, new RegExp(pattern));
  assert.deepEqual(exercise.cards.map(card => card.id), expected.cardIds);
  for (const [id, patterns] of Object.entries(expected.cardTextPatterns || {})) {
    const card = exercise.cards.find(card => card.id === id);
    assert.ok(card, 'Cartão privado esperado ausente');
    for (const pattern of patterns) assert.match(card.studentHtml, new RegExp(pattern));
  }
  for (const card of exercise.cards) if (expected.forbiddenCardPattern) assert.ok(!new RegExp(expected.forbiddenCardPattern).test(card.studentHtml), `Variante alheia vazou em ${card.id}`);
  for (const id of expected.conditionalCardIds || []) assert.equal(exercise.cards.find(card => card.id === id)?.conditional, true);
  if (expected.lastCardConditional) assert.equal(exercise.cards.at(-1).conditional, true);
}
for (const expected of expectations.sessionChecks) {
  const session = expectedSession(expected);
  assert.equal(session.questions.length, expected.questionCount, 'Todas as perspectivas esperadas devem ser preservadas');
  for (const pattern of expected.notesPatterns) assert.match(session.notesHtml, new RegExp(pattern));
}
for (const [source, hash] of Object.entries(mapping.sourceHashes)) assert.equal(createHash('sha256').update(await fs.readFile(path.join(root, source))).digest('hex'), hash);
const after = {};
const publicText = [];
// Verify the effect of the private generator itself, rather than freezing the
// entire public site at the date this local exercise was first created.
const before = {};
for (const file of await filesIn(path.join(root, 'dist'))) before[path.relative(path.join(root, 'dist'), file)] = createHash('sha256').update(await fs.readFile(file)).digest('hex');
execFileSync(process.execPath, ['scripts/loop-private/build.mjs'], { cwd: root, stdio: 'pipe' });
for (const file of await filesIn(path.join(root, 'dist'))) {
  const bytes = await fs.readFile(file);
  const relative = path.relative(path.join(root, 'dist'), file);
  after[relative] = createHash('sha256').update(bytes).digest('hex');
  if (/\.(html|json|xml|js|css|txt)$/.test(file)) publicText.push(bytes.toString('utf8'));
}
assert.deepEqual(after, before, 'A geração privada não pode alterar o artefato público, incluindo busca e assets');
const combined = publicText.join('\n');
for (const text of expectations.publicForbiddenText) assert.ok(!combined.includes(text), 'Dado personalizado no artefato público');
let rejected = false;
try { execFileSync(process.execPath, ['scripts/loop-private/build.mjs', '--output', 'dist'], { cwd: root, stdio: 'pipe' }); }
catch (error) { rejected = error.status !== 0; }
assert.ok(rejected, 'O gerador privado não deve aceitar redirecionamento de saída para dist');
const base = process.env.LOOP_TEST_URL || 'http://127.0.0.1:4321';
assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname), 'Os testes privados devem usar somente loopback');
assert.deepEqual(expectations.http.allowedRoutes, expectations.pages.map(page => `/${page.pageId}/`));
for (const route of expectations.http.allowedRoutes) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
}
for (const route of expectations.http.deniedRoutes) assert.equal((await fetch(base + route)).status, 404, route);
const report = { pages: pages.length, sessions: pages.map(page => page.sessions.length), lpIdsChecked: lpCount, questions: questionCount, exactSourceReferences: true, originalVariantsPreserved: true, publicArtifactIdentical: Object.keys(after).length, privateHttpBoundary: true, outputOverrideRejected: true };
await fs.writeFile(path.join(review, 'check-results.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
