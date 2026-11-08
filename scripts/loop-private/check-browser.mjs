import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright-core';
import { privateRoot } from './build.mjs';

const base = process.env.LOOP_TEST_URL || 'http://127.0.0.1:4321';
assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname), 'Os testes privados devem usar somente loopback');
const review = path.join(privateRoot, 'review');
const expectations = JSON.parse(await fs.readFile(path.join(privateRoot, 'source/check-expectations.json'), 'utf8'));
assert.equal(expectations.schemaVersion, 1, 'Versão inválida das expectativas privadas');
const expectedPages = expectations.pages;
const targets = expectations.browser;
assert.equal(expectedPages.length, expectations.counts.pages);
assert.deepEqual(expectedPages.map(page => page.sessions.length), expectations.counts.sessions);
let executablePath = process.env.CHROMIUM_PATH;
if (!executablePath) {
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  for (const name of (await fs.readdir(cache)).filter(name => name.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const target = path.join(cache, name, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
    if (await fs.access(target).then(() => true).catch(() => false)) { executablePath = target; break; }
  }
}
if (!executablePath) throw new Error('Defina CHROMIUM_PATH com um Chromium já instalado; o teste não instala ferramentas.');
const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];
const report = { browser: await browser.version(), base, pages: expectedPages.length, widths: [390,768,1440], themes: ['light','dark'], checks: [], captures: [], limits: ['Chromium local; não Safari, dispositivo físico, zoom real ou avaliação com pessoas.', 'Dados de teste fictícios em contextos descartáveis. Nenhum recurso AWS executado.'] };
function monitor(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(base).origin) errors.push('Requisição externa: ' + request.url()); });
}
async function visit(page, pageId) {
  assert.equal((await page.goto(`${base}/${pageId}/`)).status(), 200);
  await page.locator('#loop-question-prompt').waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(page) { assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, page.url()); }
async function selectQuestion(page, id) {
  const value = await page.locator(`#loop-question-select option[data-question-id="${id}"]`).getAttribute('value');
  assert.notEqual(value, null, id);
  await page.locator('#loop-question-select').selectOption(value);
  assert.equal(await page.locator('#loop-question-area').getAttribute('data-question-id'), id);
}
async function popupSelection(page, action) {
  const wait = page.waitForEvent('popup');
  await action();
  const popup = await wait;
  await popup.waitForSelector('iframe');
  assert.equal(await popup.evaluate(() => window.opener === null), true);
  assert.equal(await popup.locator('iframe').getAttribute('sandbox'), '');
  const frame = popup.frames().find(item => item !== popup.mainFrame());
  await frame.locator('main').waitFor();
  assert.equal(await frame.evaluate(() => { try { return parent.document.body ? 'accessible' : 'empty'; } catch { return 'blocked'; } }), 'blocked');
  assert.equal(await frame.locator('script').count(), 0);
  const text = await frame.locator('main').innerText();
  const html = await popup.content();
  for (const value of ['loop-data','privateMarker','evidenceLog','dimensions','Notas privadas do instrutor']) assert.ok(!html.includes(value), value);
  return { popup, frame, text };
}
try {
  for (const width of report.widths) for (const theme of report.themes) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'reduce' });
    for (const expected of expectedPages) {
      const page = await context.newPage(); monitor(page);
      await visit(page, expected.pageId);
      await page.locator('#loop-theme').selectOption(theme);
      assert.equal(await page.locator('body').getAttribute('data-loop-theme'), theme);
      assert.equal(await page.locator('h1').innerText(), expected.title);
      assert.equal(await page.locator('[data-session-id]').count(), expected.sessions.length);
      assert.equal(await page.locator('details[open]').count(), 0, 'Notas e follow-ups começam recolhidos');
      assert.equal(await page.locator('#loop-question-area').evaluate(element => [...element.childNodes].some(child => child.nodeType === Node.TEXT_NODE && /^(?:null|undefined)$/.test(child.textContent.trim()))), false, 'Blocos opcionais não podem aparecer como texto residual');
      assert.equal(await page.locator('[data-private-notice]').isVisible(), true);
      for (const session of expected.sessions) {
        const button = page.locator(`[data-session-id="${session.id}"]`);
        assert.ok((await button.innerText()).includes(session.time));
        assert.ok((await button.innerText()).includes(session.role));
        await button.click();
        assert.equal(await page.locator('#loop-session-title').innerText(), session.name);
        assert.equal(await page.locator('details[open]').count(), 0);
        await noOverflow(page);
      }
      await page.locator('[data-session-id]').first().click();
      await page.evaluate(() => scrollTo(0, 0));
      const capture = `${expected.pageId}-${width}-${theme}.png`;
      await page.screenshot({ path: path.join(review, `top-${capture}`) });
      await page.screenshot({ path: path.join(review, capture), fullPage: true });
      report.captures.push(capture);
      await page.evaluate(() => document.documentElement.style.fontSize = '200%');
      await noOverflow(page);
      await page.close();
    }
    await context.close();
  }
  report.checks.push(`${expectedPages.length} páginas, ${expectedPages.reduce((sum, item) => sum + item.sessions.length, 0)} sessões, agenda/cargos, 390/768/1440px, claro/escuro, texto ampliado e recolhimento inicial`);
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage(); monitor(page);
  await visit(page, targets.entry.pageId);
  assert.equal(await page.locator('#loop-question-area').getAttribute('data-question-id'), targets.entry.questionId);
  assert.equal(await page.locator('#loop-session-title').innerText(), expectedPages.find(item => item.pageId === targets.entry.pageId).sessions.find(item => item.id === targets.entry.sessionId).name);
  const prompt = await page.locator('#loop-question-prompt').textContent();
  await page.locator('[data-action="read-aloud"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#loop-readout').textContent(), prompt);
  assert.equal(await page.locator('#loop-readout').evaluate(element => element === document.activeElement), true);
  await page.locator('[data-followup-index="0"] summary').click();
  assert.equal(await page.locator('[data-followup-index="0"]').evaluate(element => element.open), true);
  assert.equal(await page.locator('[data-followup-index="1"]').evaluate(element => element.open), false);
  let selection = await popupSelection(page, () => page.locator('[data-action="present-prompt"]').click());
  assert.equal(selection.text.trim(), prompt.trim());
  assert.ok(!selection.text.includes(targets.entry.questionId));
  await selection.popup.screenshot({ path: path.join(review, 'janela-pergunta.png') });
  await selection.popup.close();
  for (const exercise of targets.exercises) {
    await selectQuestion(page, exercise.questionId);
    assert.equal(await page.locator('#loop-question-area').getAttribute('data-is-reserve'), String(exercise.isReserve));
    assert.equal(await page.locator('[data-evidence-card]').count(), exercise.cardCount);
    if (exercise.assertNoPresentedEvidenceInitially) assert.equal(await page.locator('[data-action="present-evidence"]:visible').count(), 0);
    for (const step of exercise.steps) {
      const card = page.locator(`article[data-card-id="${step.cardId}"]`);
      await card.locator(':scope > details > summary').click();
      assert.equal(await card.locator('[data-action="release-evidence"]').isDisabled(), true);
      await page.locator('[data-evidence-request]').fill(step.requestFixture);
      await card.locator('[data-confirm-relevant]').check();
      if (step.conditional) {
        assert.equal(await card.locator('[data-action="release-evidence"]').isDisabled(), true);
        await card.locator('[data-confirm-conditional]').check();
      }
      assert.equal(await card.locator('[data-action="release-evidence"]').isEnabled(), true);
      if (step.previewPatterns?.length) {
        await card.locator('[data-card-preview] summary').click();
        for (const pattern of step.previewPatterns) assert.match(await card.locator('[data-card-preview]').innerText(), new RegExp(pattern));
      }
      await card.locator('[data-action="release-evidence"]').click();
      if (step.assertReleaseDoesNotPresent) assert.equal(context.pages().length, 1, 'Liberar não deve apresentar automaticamente');
      selection = await popupSelection(page, () => card.locator('[data-action="present-evidence"]').click());
      for (const pattern of step.selectionPatterns || []) assert.match(selection.text, new RegExp(pattern));
      for (const pattern of step.selectionForbiddenPatterns || []) assert.ok(!new RegExp(pattern).test(selection.text), 'A apresentação não pode revelar conteúdo privado ou de outra variante');
      if (step.capture) await selection.popup.screenshot({ path: path.join(review, step.capture) });
      await selection.popup.close();
    }
  }
  report.checks.push('Leitura só enunciado; follow-ups individuais; pedido+confirmação; recuperação condicional; alternativas em reservas; aluno sem opener, scripts, pai ou conteúdo futuro');
  const initialTimer = await page.locator('#loop-timer-display').innerText();
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('#loop-timer-display').innerText(), initialTimer);
  await page.locator('[data-action="timer-start"]').click();
  await page.waitForTimeout(1200);
  assert.notEqual(await page.locator('#loop-timer-display').innerText(), initialTimer);
  await page.locator('[data-action="timer-pause"]').click();
  const paused = await page.locator('#loop-timer-display').innerText();
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('#loop-timer-display').innerText(), paused);
  await page.evaluate(() => localStorage.setItem('public-study-fixture', 'KEEP'));
  const fixture = 'FIXTURE_TESTE_LOCAL <img src=x onerror="alert(1)">';
  await page.locator('[data-record-field="episodio"]').fill(fixture);
  await page.locator('[data-dimension="aderencia"][data-dimension-field="status"]').selectOption('demonstrado');
  await page.reload(); await page.locator('#loop-question-prompt').waitFor();
  assert.equal(await page.locator('[data-record-field="episodio"]').inputValue(), fixture);
  assert.equal(await page.locator('img').count(), 0, 'Anotações devem permanecer texto inerte');
  await page.locator(`[data-session-id="${targets.recordIsolation.samePageSessionId}"]`).click();
  assert.equal(await page.locator('[data-record-field="episodio"]').inputValue(), '');
  await page.locator('[data-session-id]').first().click();
  assert.equal(await page.locator('[data-record-field="episodio"]').inputValue(), fixture);
  const downloadWait = page.waitForEvent('download');
  await page.locator('[data-action="export-record"]').click();
  const download = await downloadWait;
  const exported = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
  assert.equal(exported.episodio, fixture); assert.equal(exported.dimensions.aderencia.status, 'demonstrado'); assert.equal(exported.sessions, undefined);
  await visit(page, targets.recordIsolation.otherPageId);
  await page.locator('[data-record-field="episodio"]').fill('FIXTURE_DIA_SEGUINTE');
  await page.locator(`[data-session-id="${targets.recordIsolation.otherSessionId}"]`).click();
  assert.equal(await page.locator('[data-record-field="episodio"]').inputValue(), '');
  assert.equal(await page.evaluate(() => localStorage.getItem('public-study-fixture')), 'KEEP');
  await page.locator('#loop-theme').selectOption('system'); await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForFunction(() => document.body.dataset.loopTheme === 'dark');
  assert.equal(await page.locator('body').getAttribute('data-loop-theme'), 'dark');
  await page.locator('#loop-theme').selectOption('light'); await page.emulateMedia({ colorScheme: 'dark' });
  assert.equal(await page.locator('body').getAttribute('data-loop-theme'), 'light');
  report.checks.push('Cronômetro só manual; registro persistido e isolado por rodada/dia; exportação limitada ao registro; texto inerte; dados alheios preservados; Sistema e escolha explícita');
  await context.close();
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
  const blockedPage = await blocked.newPage(); monitor(blockedPage); await visit(blockedPage, targets.recordIsolation.otherPageId);
  assert.equal(await blockedPage.locator('#loop-storage-warning').isVisible(), true);
  await blockedPage.locator('[data-record-field="episodio"]').fill('FIXTURE_MEMORIA');
  await blockedPage.locator(`[data-session-id="${targets.recordIsolation.otherSessionId}"]`).click(); await blockedPage.locator(`[data-session-id="${targets.recordIsolation.otherInitialSessionId}"]`).click();
  assert.equal(await blockedPage.locator('[data-record-field="episodio"]').inputValue(), 'FIXTURE_MEMORIA');
  await blocked.close();
  const popupBlocked = await browser.newContext();
  await popupBlocked.addInitScript(() => { window.open = () => null; });
  const popupPage = await popupBlocked.newPage(); monitor(popupPage); await visit(popupPage, targets.entry.pageId);
  await popupPage.locator('[data-action="present-prompt"]').click();
  assert.match(await popupPage.locator('#loop-status').innerText(), /oralmente/);
  await popupBlocked.close();
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const nojsPage = await nojs.newPage();
  await nojsPage.goto(`${base}/${targets.entry.pageId}/`);
  assert.match(await nojsPage.locator('noscript').innerText(), /condução oral/);
  await nojs.close();
  report.checks.push('Storage bloqueado com memória e aviso; popup bloqueado com condução oral; JavaScript desabilitado com limitação explícita');
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(review, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
