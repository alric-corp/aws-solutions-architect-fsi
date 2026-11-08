import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { principleQuestionSources } from '../site/leadership-question-policy.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const review = path.join(root, '.site/lp-question-review');
const args = process.argv.slice(2);
assert.ok(args.every(value => value === '--browser'));
const browserRequested = args.includes('--browser');
const base = process.env.LP_QUESTIONS_TEST_URL || 'http://127.0.0.1:4322';
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname));
const read = source => fs.readFile(path.join(root, source), 'utf8');
const json = async source => JSON.parse(await read(source));
const normalize = value => String(value).replace(/[*`]/g, '').replace(/\s+/g, ' ').trim();
const urlFor = source => '/' + source.replace(/\.md$/, '.html');
const prefixFor = source => 'lp' + path.basename(source).slice(0, 2);
const localeKeyPrefix = 'architecture-practice:lp-question-languages:v1:';
const report = { checks: [], captures: [], limits: ['Chromium local e verificações do conteúdo versionado; não é teste com pessoas ou dispositivo físico.'] };

function pairs(markdown) {
  return [...markdown.matchAll(/^\d+\.\s+<a id="(lp\d{2}-[qf]\d{2})"><\/a>\s+(.+)\n\n\s+\*\*EN:\*\*\s+(.+)$/gm)]
    .map(([, id, pt, en]) => ({ id, pt, en }));
}
function followupText(markdown) {
  const section = markdown.split(/^## Aprofundamentos\s*$/m)[1]?.split(/^## /m)[0] || '';
  return [...section.matchAll(/^\d+\.\s+(?:<a id="[^"]+"><\/a>\s+)?(.+)$/gm)].map(match => match[1]);
}

async function checkStatic() {
  assert.equal(principleQuestionSources.length, 16);
  assert.equal(new Set(principleQuestionSources).size, 16);
  assert.deepEqual(principleQuestionSources.map(prefixFor).sort(), Array.from({ length: 16 }, (_, i) => `lp${String(i + 1).padStart(2, '0')}`));
  const manifest = await json('dist/content-manifest.json');
  const search = await json('dist/search-index.json');
  const baseline = await json('.site/lp-question-review/baseline.json').catch(() => null);
  const index = await read('dist/leadership-principles/index.html');
  let primary = 0, followups = 0;
  for (const source of principleQuestionSources) {
    const markdown = await read(source);
    const html = await read('dist' + urlFor(source));
    const prefix = prefixFor(source);
    const expectedIds = [
      ...Array.from({ length: 12 }, (_, i) => `${prefix}-q${String(i + 1).padStart(2, '0')}`),
      ...Array.from({ length: 6 }, (_, i) => `${prefix}-f${String(i + 1).padStart(2, '0')}`),
    ];
    const translations = pairs(markdown);
    assert.deepEqual(translations.map(pair => pair.id), expectedIds, `${source}: doze perguntas e seis aprofundamentos completos`);
    assert.ok(translations.every(pair => pair.pt.length > 15 && pair.en.length > 15));
    const old = execFileSync('git', ['show', `${baseline?.head || 'HEAD'}:${source}`], { cwd: root, encoding: 'utf8' });
    assert.deepEqual(translations.filter(pair => pair.id.includes('-q')), pairs(old).filter(pair => pair.id.includes('-q')), `${source}: preservar PT/EN e IDs primários`);
    assert.deepEqual(followupText(markdown), followupText(old), `${source}: preservar o PT dos aprofundamentos`);
    const doc = manifest.find(item => item.sourcePath === source);
    assert.equal(doc?.id, source.replace(/\.md$/, ''));
    assert.equal(doc?.canonicalUrl, urlFor(source));
    assert.equal(doc?.progress, true);
    assert.equal(doc?.search, true);
    assert.ok(html.includes(`data-lp-question-bank="${prefix}"`));
    assert.equal((html.match(/data-lp-question-bank=/g) || []).length, 1);
    for (const id of expectedIds) {
      assert.equal((html.match(new RegExp(`\\bid="${id}"`, 'g')) || []).length, 1, `${id}: uma âncora canônica`);
      assert.ok(doc.existingAnchors.includes(id), `${id}: âncora registrada para retomada`);
    }
    const oldIds = baseline?.pages?.[path.basename(urlFor(source))]?.ids || baseline?.lpAnchors?.[urlFor(source).slice(1)] || baseline?.anchors?.[urlFor(source).slice(1)] || [];
    const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
    for (const id of oldIds) assert.ok(htmlIds.has(id), `Âncora anterior removida: ${source}#${id}`);
    const indexed = normalize(search.filter(entry => entry.url.split('#')[0] === urlFor(source)).map(entry => entry.text).join(' '));
    for (const pair of translations) {
      assert.ok(indexed.includes(normalize(pair.pt)), `${pair.id}: pergunta PT pesquisável`);
      assert.ok(indexed.includes(normalize(pair.en)), `${pair.id}: pergunta EN pesquisável`);
    }
    assert.ok(index.includes(urlFor(source)), `${source}: acessível pelo índice dos princípios`);
    primary += 12; followups += 6;
  }
  const htmlFiles = manifest.filter(doc => principleQuestionSources.includes(doc.sourcePath));
  assert.equal(htmlFiles.length, 16);
  assert.ok(!(await read('dist/search-index.json')).includes('KEEP_LP_PRIVATE_RECORD'));
  report.static = { principles: 16, primaryQuestions: primary, followups, bilingualUnits: primary + followups, documents: manifest.length, originalContentCompared: true, baselineAnchorsCompared: Boolean(baseline) };
  report.checks.push('16 princípios, 192 pares primários preservados, 96 aprofundamentos bilíngues, âncoras canônicas, busca e progresso preservados.');
}

async function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  for (const name of (await fs.readdir(cache)).filter(name => name.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const file = path.join(cache, name, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
    if (await fs.access(file).then(() => true).catch(() => false)) return file;
  }
  throw new Error('Defina CHROMIUM_PATH para um navegador já instalado; nenhum download é realizado.');
}

async function checkBrowser() {
  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ executablePath: await chromiumPath(), headless: true });
  const errors = [], contexts = [];
  const context = async options => { const ctx = await browser.newContext({ reducedMotion: 'reduce', ...options }); contexts.push(ctx); return ctx; };
  const monitor = page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(base).origin) errors.push('Requisição externa não solicitada'); });
  };
  const question = (page, id) => page.locator(`li[data-lp-question=${JSON.stringify(id)}]`);
  const button = (page, id, locale) => question(page, id).locator(`[data-lp-language-option="${locale}"]`);
  async function visit(page, source, hash = '') {
    const response = await page.goto(base + urlFor(source) + hash);
    if (response) assert.equal(response.status(), 200);
    else assert.equal(new URL(page.url()).pathname, urlFor(source));
    await page.locator('[data-lp-question-bank][data-lp-question-locales-initialized="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
  }
  async function active(page, id, locale) {
    await button(page, id, locale).locator('xpath=self::*[@aria-pressed="true"]').waitFor();
    assert.equal(await question(page, id).locator('[data-lp-language-controls]').count(), 1);
    const state = await question(page, id).locator('[data-lp-question-locale]').evaluateAll(nodes => nodes.map(node => ({ locale: node.dataset.lpQuestionLocale, lang: node.lang, hidden: node.hidden })));
    assert.equal(state.length, 2);
    assert.ok(state.every(panel => panel.lang === panel.locale && panel.hidden === (panel.locale !== locale)), `${id}: somente a tradução escolhida fica acessível`);
    assert.equal(await question(page, id).locator('[data-lp-question-locale]:visible').count(), 1);
    assert.ok(await page.locator(`[id=${JSON.stringify(id)}]`).evaluate(anchor => !anchor.closest('[data-lp-question-locale]') && !anchor.closest('[hidden]')), `${id}: âncora canônica fora das traduções`);
  }
  async function choose(page, id, locale, keyboard = false) {
    if (keyboard) { await button(page, id, locale).focus(); await page.keyboard.press('Enter'); }
    else await button(page, id, locale).click();
    await active(page, id, locale);
  }
  async function capture(page, name) {
    await page.screenshot({ path: path.join(review, name) }); report.captures.push(name);
  }
  async function preservedFixtures(page) {
    const result = await page.evaluate(() => ({
      privateRecord: localStorage.getItem('lp-fixture-private-record'),
      storyGlobal: localStorage.getItem('architecture-practice:story-language:v1'),
      storyUnits: localStorage.getItem('architecture-practice:story-languages:v2:fixture'),
      preference: JSON.parse(localStorage.getItem('architecture-practice:preferences:v1')).fixture,
    }));
    assert.deepEqual(result, { privateRecord: 'KEEP_LP_PRIVATE_RECORD', storyGlobal: '"en-US"', storyUnits: '{"story":"en-US","fixture":"KEEP_STAR"}', preference: 'KEEP_PREFERENCES' });
  }
  try {
    let mixedChecks = 0;
    for (const [width, theme] of [[1440, 'light'], [390, 'light'], [390, 'dark'], [768, 'dark']]) {
      const ctx = await context({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme });
      await ctx.addInitScript(() => {
        localStorage.setItem('architecture-practice:preferences:v1', JSON.stringify({ theme: 'system', textSize: 0, fixture: 'KEEP_PREFERENCES' }));
        localStorage.setItem('lp-fixture-private-record', 'KEEP_LP_PRIVATE_RECORD');
        localStorage.setItem('architecture-practice:story-language:v1', JSON.stringify('en-US'));
        localStorage.setItem('architecture-practice:story-languages:v2:fixture', JSON.stringify({ story: 'en-US', fixture: 'KEEP_STAR' }));
      });
      const page = await ctx.newPage(); monitor(page);
      for (const source of principleQuestionSources) {
        const prefix = prefixFor(source);
        const ids = ['q01', 'q02', 'q03', 'f01', 'f02'].map(suffix => `${prefix}-${suffix}`);
        await visit(page, source);
        assert.equal(await page.locator('li[data-lp-question]').count(), 18);
        assert.equal(await page.locator('[data-lp-language-controls]').count(), 18);
        assert.equal(await page.locator('[data-story-language-controls]').count(), 0, 'Não há toggle global ou de história no princípio');
        for (const id of ids) await active(page, id, 'pt-BR');
        const title = await page.title();
        const heading = await page.locator('.prose > h1').innerText();
        await choose(page, ids[1], 'en-US', true);
        await active(page, ids[0], 'pt-BR'); await active(page, ids[2], 'pt-BR');
        await choose(page, ids[3], 'en-US'); await active(page, ids[4], 'pt-BR');
        assert.equal(await page.title(), title);
        assert.equal(await page.locator('.prose > h1').innerText(), heading, 'Perguntas não alteram a narrativa ou o título');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        const contentId = await page.locator('body').getAttribute('data-content-id');
        const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), localeKeyPrefix + contentId);
        assert.equal(saved[ids[1]], 'en-US'); assert.equal(saved[ids[3]], 'en-US');
        assert.ok(saved[ids[0]] === undefined || saved[ids[0]] === 'pt-BR');
        await preservedFixtures(page);
        if (prefix === 'lp01' || prefix === 'lp12') {
          await question(page, ids[1]).scrollIntoViewIfNeeded();
          await capture(page, `${prefix}-${width}-${theme}-mixed.png`);
        }
        mixedChecks++;
      }
      await ctx.close();
    }
    const ctx = await context({ viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage(); monitor(page);
    const source = principleQuestionSources[0], prefix = prefixFor(source);
    const first = `${prefix}-q01`, second = `${prefix}-q02`, followup = `${prefix}-f01`;
    await visit(page, source);
    await choose(page, second, 'en-US'); await choose(page, followup, 'en-US');
    await page.reload(); await active(page, second, 'en-US'); await active(page, first, 'pt-BR'); await active(page, followup, 'en-US');
    await visit(page, principleQuestionSources[1]);
    for (const suffix of ['q01', 'q02', 'f01']) await active(page, `${prefixFor(principleQuestionSources[1])}-${suffix}`, 'pt-BR');
    await visit(page, source, '#' + second); await active(page, second, 'en-US'); await active(page, first, 'pt-BR');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.ok(await page.locator(`[id="${second}"]`).evaluate(anchor => anchor.getBoundingClientRect().top >= (document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0) - 2), 'Âncora da pergunta não fica encoberta pelo header');
    await page.evaluate(id => { location.hash = id; }, followup); await active(page, followup, 'en-US');
    await page.goBack(); assert.equal(new URL(page.url()).hash, '#' + second); await active(page, second, 'en-US');
    await page.goForward(); assert.equal(new URL(page.url()).hash, '#' + followup); await active(page, followup, 'en-US');
    const doc = (await json('dist/content-manifest.json')).find(item => item.sourcePath === source);
    const fixture = {
      schemaVersion: 2, extension: 'KEEP_EXTENSION',
      reading: { [doc.id]: { marked: true, origin: 'manual', fixture: 'KEEP_READING' }, 'legacy:lp-fixture': { marked: true, origin: 'legacy', legacyUrl: '/fixture-unavailable.html' } },
      resume: { student: { contentId: doc.id, anchor: second, contentVersion: doc.contentVersion }, instructor: { contentId: 'lp-fixture-instructor', anchor: 'KEEP_PRIVATE_RESUME' } },
    };
    const saved = await context({ viewport: { width: 1440, height: 1000 } });
    await saved.addInitScript(value => {
      if (!localStorage.getItem('lp-fixture-initialized')) {
        localStorage.setItem('architecture-practice:study:v2', JSON.stringify(value));
        localStorage.setItem('lp-fixture-initialized', 'true');
      }
    }, fixture);
    const sp = await saved.newPage(); monitor(sp); await visit(sp, source);
    await sp.locator('.read-toggle[aria-pressed="true"]').waitFor();
    await choose(sp, second, 'en-US'); await choose(sp, followup, 'en-US');
    await sp.reload(); await sp.locator('.read-toggle[aria-pressed="true"]').waitFor();
    await active(sp, second, 'en-US'); await active(sp, first, 'pt-BR'); await active(sp, followup, 'en-US');
    const state = await sp.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')));
    assert.deepEqual(state.reading, fixture.reading); assert.deepEqual(state.resume.instructor, fixture.resume.instructor); assert.equal(state.extension, fixture.extension);
    assert.equal(await sp.locator('body').getAttribute('data-content-id'), doc.id);
    const blocked = await context({ viewport: { width: 390, height: 844 } });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
    const bp = await blocked.newPage(); monitor(bp); await visit(bp, source);
    await choose(bp, second, 'en-US'); await active(bp, first, 'pt-BR'); await choose(bp, followup, 'en-US');
    const malformed = await context({ viewport: { width: 390, height: 844 } });
    await malformed.addInitScript(key => localStorage.setItem(key, '{'), localeKeyPrefix + doc.id);
    const mp = await malformed.newPage(); monitor(mp); await visit(mp, source);
    await active(mp, second, 'pt-BR'); await choose(mp, second, 'en-US'); await active(mp, first, 'pt-BR');
    const nojs = await context({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const np = await nojs.newPage(); await np.goto(base + urlFor(source));
    assert.equal(await np.locator('[data-lp-language-controls]').count(), 0);
    assert.equal(await np.locator('a[id^="lp01-"]').count(), 18);
    assert.equal(await np.locator('.prose strong').filter({ hasText: /^EN:$/ }).count(), 18, 'Sem JS, ambos os textos continuam disponíveis');
    assert.deepEqual(errors, [], 'Sem erros JS/CSP ou requisições externas');
    report.browser = { version: await browser.version(), widths: [390, 768, 1440], themes: ['light', 'dark'], mixedChecks, independentUnits: 288, perPrinciplePersistence: true, reload: true, canonicalAnchors: true, history: true, recordsPreserved: true, storageBlocked: true, malformedStorage: true, noJavaScript: true };
    report.checks.push('Toggles independentes nas16páginas, idiomas mistos, persistência por pergunta/LP, teclado, layout, âncoras, histórico e registros preservados.');
  } finally { for (const ctx of contexts) await ctx.close().catch(() => {}); await browser.close(); }
}

await fs.mkdir(review, { recursive: true });
try {
  await checkStatic();
  if (browserRequested) await checkBrowser();
  report.ok = true; console.log(JSON.stringify(report, null, 2));
} catch (error) { report.ok = false; report.error = String(error.stack || error); throw error; }
finally { await fs.writeFile(path.join(review, browserRequested ? 'browser-results.json' : 'static-results.json'), JSON.stringify(report, null, 2) + '\n'); }
