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

// Validation only: this script never builds, deploys, opens a real browser profile,
// imports the private generator, or reads private schedules/records.
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const sourceRoot = path.join(root, 'site/loop-training');
const review = path.join(root, '.site/loop-public-review');
const routeRoot = '/praticar/loop/';
const pageIds = ['dia-10', 'dia-11'];
const routes = pageIds.map(id => `${routeRoot}${id}/index.html`);
const namespace = 'loop-practice:v1';
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
const read = relative => fs.readFile(path.join(root, relative), 'utf8');
const readJSON = async relative => JSON.parse(await read(relative));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const without = (value, omitted) => Object.fromEntries(Object.entries(value).filter(([key]) => !omitted.includes(key)));
let agenda;
let behavioral;
let technical;
let pages;
let publicPolicy;

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
      assert.deepEqual(without(session, ['questions', 'reserves', 'notesHtml']), without(recipe, ['questions', 'reserves']), 'Cada rodada deve preservar sua agenda completa');
      assert.equal(session.notesHtml, markdown(recipe.notesMarkdown));
      assert.equal(session.agenda.reduce((sum, phase) => sum + phase.minutes, 0), 60, 'O ensaio deve declarar seus 60 minutos, incluindo feedback');
      for (const collection of ['questions', 'reserves']) {
        assert.equal((session[collection] || []).length, (recipe[collection] || []).length);
        for (const [index, question] of (session[collection] || []).entries()) {
          const questionRecipe = recipe[collection][index];
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
  report.static = { pages: pages.length, sessions: pages.map(page => page.sessions.length), questions, lpQuestions: seenLP.length, manifestDocuments: manifest.length, deliberateLinks, filledRecords: 0, fixedVariants: ['SIM02-B PostgreSQL 16', 'SIM03-B', 'CONSULTIVA-BASE C1–C5'] };
  report.checks.push('Dois HTML completos, três JSON aprovados, 19 LP do banco, projeções fiéis, variantes fixas e pendências factuais preservadas.');
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
