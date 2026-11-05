import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { currentSourcePath } from './lib/project-paths.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:4173';
const output = path.join(root, '.site/homepage-simplification');
const pictures = path.join(output, 'after');
await fs.mkdir(pictures, { recursive: true });
const manifest = JSON.parse(await fs.readFile(path.join(root, 'dist/content-manifest.json'), 'utf8'));
const expectedCards = [
  ['Comece do zero', 'technical-knowledge/02-system-design/00-system-design-from-zero.md'],
  ['Fundamentos', 'technical-knowledge/01-fundamentals/README.md'],
  ['System Design', 'technical-knowledge/02-system-design/README.md'],
  ['Leadership Principles', 'leadership-principles/README.md'],
  ['Entrevistas e simulações', 'interview/'],
  ['Foco do loop', 'leadership-principles/loop-focus.md']
].map(([title, source]) => {
  // This existing section is a generated directory index, not a Markdown page.
  if (source === 'interview/') return { title, url: '/interview/index.html' };
  const doc = manifest.find(item => item.sourcePath === source);
  assert.ok(doc, `Existing homepage destination: ${source}`);
  return { title, url: doc.canonicalUrl };
});
const foundation = manifest.find(item => item.sourcePath === 'technical-knowledge/01-fundamentals/06-databases-transactions-consistency.md');
const optionalCase = manifest.find(item => item.sourcePath === 'cases/01-payment-processing-pix.md');
const instructor = manifest.find(item => item.canonicalUrl.endsWith('/02-pedido-durante-falha-do-banco/instrutor.html'));
const studyKey = 'architecture-practice:study:v2';
const preferencesKey = 'architecture-practice:preferences:v1';
const fixture = {
  schemaVersion: 2,
  reading: {
    [foundation.id]: { marked: true, origin: 'manual', markedAt: '2020-01-01T00:00:00Z' },
    [optionalCase.id]: { marked: true, origin: 'legacy' },
    [instructor.id]: { marked: true, origin: 'manual' }
  },
  resume: {
    student: { contentId: foundation.id, anchor: 'idempotencia-concorrencia', contentVersion: foundation.contentVersion },
    'fsi-cases': { contentId: optionalCase.id, anchor: 's08', contentVersion: optionalCase.contentVersion },
    instructor: { contentId: instructor.id, anchor: '', contentVersion: instructor.contentVersion }
  },
  homepageFixture: 'preserve extension fields'
};
let executablePath = process.env.CHROMIUM_PATH;
if (!executablePath) {
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  const version = (await fs.readdir(cache)).filter(name => name.startsWith('chromium_headless_shell-')).sort().at(-1);
  executablePath = path.join(cache, version, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
}
const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];
const report = {
  base, browser: browser.version(), fixture: 'Synthetic isolated profiles; no personal browser data.',
  matrix: [], captures: [], checks: [],
  limits: ['Local Chromium only; Safari and physical mobile devices were not tested.', 'Root font-size enlargement is a reflow check, not actual browser zoom.', 'No complete WCAG, performance or testing-with-people claim.']
};
async function profile({ width = 1440, height = 900, theme = 'light', history = false, javaScriptEnabled = true } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: 'reduce', javaScriptEnabled });
  if (javaScriptEnabled) await context.addInitScript(({ theme, history, fixture, studyKey, preferencesKey }) => {
    if (sessionStorage.getItem('homepage-fixture-installed')) return;
    localStorage.setItem(preferencesKey, JSON.stringify({ theme, homepageFixture: 'preserve', textSize: 0 }));
    if (history) localStorage.setItem(studyKey, JSON.stringify(fixture));
    sessionStorage.setItem('homepage-fixture-installed', 'true');
  }, { theme, history, fixture, studyKey, preferencesKey });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  return { context, page };
}
async function visit(page, url = '/index.html') {
  assert.equal((await page.goto(base + url)).status(), 200, url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.body.classList.contains('header-ready'));
}
async function capture(page, name) {
  await page.screenshot({ path: path.join(pictures, name), fullPage: true });
  report.captures.push(name);
}
async function assertHome(page, width) {
  assert.deepEqual(await page.locator('main.home-main > *').evaluateAll(elements => elements.map(element => `${element.tagName.toLowerCase()}.${element.className}`)), ['section.hero', 'section.tracks'], 'Homepage has exactly two content sections');
  assert.equal(await page.locator('main > section.tracks#trilhas').count(), 1);
  assert.equal(await page.locator('.home-resume, .resume-study, .next-lesson, .study-bottom, #resume-link, #read-count, #read-progress, #next-heading').count(), 0, 'Retired blocks are absent from the DOM');
  assert.equal(await page.locator('main a[href^="/cases/"], main a[href*="instrutor"]').count(), 0, 'No isolated collection or instructor entry');
  const cards = await page.locator('a.track-card').evaluateAll(elements => elements.map(element => ({ title: element.querySelector('h3').textContent, url: element.getAttribute('href') })));
  assert.deepEqual(cards, expectedCards, 'Six cards retain explicit order and existing canonical URLs');
  assert.equal(await page.locator('.track-card').nth(3).locator('p').innerText(), 'Transforme experiências reais em histórias claras, com método STAR.');
  assert.equal(await page.locator('.track-card').nth(4).locator('p').innerText(), 'Pratique a explicação, investigue falhas e prepare sua próxima conversa.');
  assert.equal(await page.locator('.track-card').nth(5).locator('p').innerText(), 'Os nove princípios em destaque, suas oito histórias e rodadas no formato das entrevistas.');
  assert.equal(await page.locator('.track-card-focus').count(), 1, 'The approved focus card is preserved exactly once');
  assert.equal(await page.locator('.track-card-focus').getAttribute('href'), expectedCards[5].url);
  assert.equal(await page.locator('.hero-study-action').getAttribute('href'), '/temas/transacoes-idempotencia.html');
  assert.equal(await page.locator('.hero-secondary').getAttribute('href'), expectedCards[0].url);
  const geometry = await page.evaluate(() => {
    const cardElements = [...document.querySelectorAll('.track-card')];
    const cards = cardElements.map(element => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width }; });
    const cover = document.querySelector('.hero-cover'), coverStyle = getComputedStyle(cover), coverRect = cover.getBoundingClientRect();
    const sample = document.createElement('span'); sample.style.backgroundColor = 'var(--action)'; document.body.append(sample); const action = getComputedStyle(sample).backgroundColor; sample.remove();
    const button = document.querySelector('.hero-study-action');
    return {
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      columns: getComputedStyle(document.querySelector('.track-grid')).gridTemplateColumns.split(' ').length,
      cards, action, primary: getComputedStyle(button).backgroundColor,
      buttonHeight: button.getBoundingClientRect().height,
      image: { width: coverRect.width, height: coverRect.height, ratio: cover.naturalWidth / cover.naturalHeight, fit: coverStyle.objectFit, filter: coverStyle.filter, transform: coverStyle.transform },
      taskBottom: document.querySelector('.hero-actions').getBoundingClientRect().bottom, coverTop: coverRect.top
    };
  });
  assert.equal(geometry.overflow, false, `No global overflow at ${width}`);
  // Match the approved release layout, rather than the MAIN-only breakpoints.
  const columns = width > 1020 ? 3 : width > 500 ? 2 : 1;
  assert.equal(geometry.columns, columns, `Card grid columns at ${width}`);
  for (let index = 0; index < 6; index++) {
    const card = geometry.cards[index];
    assert.ok(card.left >= 0 && card.right <= width + 1, 'Cards fit viewport');
    if (index % columns) assert.ok(Math.abs(card.top - geometry.cards[index - 1].top) < 1, 'Cards share the row');
    if (index >= columns) assert.ok(card.top >= geometry.cards[index - columns].bottom, 'Card rows do not overlap');
  }
  const rows = [];
  for (const card of geometry.cards) {
    const row = rows.find(row => Math.abs(row.top - card.top) < 1);
    if (row) row.count++; else rows.push({ top: card.top, count: 1 });
  }
  assert.deepEqual(rows.map(row => row.count), Array(6 / columns).fill(columns), 'Six cards form exactly 3×2, 2×3 or 1×6');
  assert.equal(geometry.primary, geometry.action, 'Hero stays orange with or without study history');
  assert.ok(geometry.buttonHeight >= 47, 'Hero action has a comfortable target');
  assert.ok(Math.abs(geometry.image.width / geometry.image.height - geometry.image.ratio) < .01, 'Full cover keeps its natural proportion');
  assert.equal(geometry.image.fit, 'contain');
  assert.equal(geometry.image.filter, 'none');
  assert.equal(geometry.image.transform, 'none');
  if (width < 1024) assert.ok(geometry.taskBottom <= geometry.coverTop, 'Text and actions precede the cover');
  return geometry;
}
try {
  const html = await fs.readFile(path.join(root, 'dist/index.html'), 'utf8');
  for (const retired of ['home-resume', 'next-lesson', 'study-bottom', 'id="resume-link"', 'id="read-count"', 'id="read-progress"', 'id="next-heading"']) assert.equal(html.includes(retired), false, `Retired component absent from generated HTML: ${retired}`);
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) for (const theme of ['light', 'dark']) {
    const { context, page } = await profile({ width, height, theme });
    await visit(page);
    const geometry = await assertHome(page, width);
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    await capture(page, `home-${width}x${height}-${theme}-empty.png`);
    report.matrix.push({ width, height, theme, ...geometry });
    await context.close();
  }
  report.checks.push('Six viewports × light/dark; exactly two sections, six approved ordered cards including Foco do loop, canonical destinations, exact grid rows, full cover and no global overflow');

  for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
    const { context, page } = await profile({ width, height: width === 390 ? 844 : 900, theme, history: true });
    await visit(page);
    await assertHome(page, width);
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), studyKey), fixture, 'Home preserves all reading/resume/extension records');
    await capture(page, `home-${width}x${width === 390 ? 844 : 900}-${theme}-history.png`);
    await visit(page, '/meu-estudo/index.html');
    await page.locator('.resume-study').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#resume-link').getAttribute('href'), foundation.canonicalUrl + '#idempotencia-concorrencia');
    assert.equal(await page.locator('.study-history .history-row').count(), 1, 'Only the principal reading appears in Meu estudo');
    assert.equal(await page.locator('.study-history a').getAttribute('href'), foundation.canonicalUrl);
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), studyKey), fixture, 'Meu estudo preserves original storage records');
    await capture(page, `my-study-${width}-${theme}.png`);
    await page.reload();
    await page.locator('.resume-study').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#resume-link').getAttribute('href'), foundation.canonicalUrl + '#idempotencia-concorrencia');
    await context.close();
  }
  report.checks.push('History fixtures leave the hero orange and home unchanged; anchored resume, principal history and all stored records survive in Meu estudo and reload');

  for (const width of [499, 500, 501, 1019, 1020, 1021]) {
    const { context, page } = await profile({ width }); await visit(page); await assertHome(page, width); await context.close();
  }
  report.checks.push('One-pixel checks around the approved 500/1020 grid transitions');

  const keyboard = await profile({ width: 390, height: 844 }); await visit(keyboard.page);
  await keyboard.page.locator('.hero-study-action').focus();
  for (const selector of ['.hero-secondary', '.section-heading > a', ...expectedCards.map((_, index) => `.track-card:nth-child(${index + 1})`)]) {
    await keyboard.page.keyboard.press('Tab');
    assert.equal(await keyboard.page.locator(selector).evaluate(element => element === document.activeElement), true, `Keyboard order: ${selector}`);
    const focused = await keyboard.page.locator(selector).evaluate(element => { const r = element.getBoundingClientRect(), s = getComputedStyle(element); return { top: r.top, bottom: r.bottom, outline: s.outlineStyle, width: parseFloat(s.outlineWidth), header: document.querySelector('.topbar').getBoundingClientRect().bottom }; });
    assert.ok(focused.top >= focused.header - 1 && focused.top < 844, 'Focused control is visible below header');
    assert.ok(focused.outline !== 'none' && focused.width >= 2, 'Visible keyboard focus');
  }
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.waitForURL(base + expectedCards.at(-1).url);
  assert.equal(new URL(keyboard.page.url()).pathname, expectedCards.at(-1).url, 'Card activation follows its real route');
  await keyboard.context.close();
  report.checks.push('Sequential keyboard access, visible focus and activation of a real card destination');

  const focus = await profile(); await visit(focus.page);
  await focus.page.locator('.track-card-focus').click();
  await focus.page.waitForURL(base + expectedCards[5].url);
  assert.equal(new URL(focus.page.url()).pathname, expectedCards[5].url);
  assert.match(await focus.page.locator('.prose h1').innerText(), /Foco do loop/);
  const stories = await focus.page.locator('.prose a[href^="/leadership-principles/stories/"]').evaluateAll(links => [...new Set(links.map(link => link.pathname).filter(url => /\/stories\/star-0[1-8]-/.test(url)))]);
  const expectedStories = manifest.filter(item => /^leadership-principles\/stories\/star-0[1-8]-[^/]+\.md$/.test(item.sourcePath)).map(item => item.canonicalUrl).sort();
  assert.equal(expectedStories.length, 8, 'The approved release preserves eight STAR stories');
  assert.deepEqual(stories.sort(), expectedStories, 'The focus card reaches all eight original stories');
  assert.equal(await focus.page.locator('.prose a[href^="/cases/"], .prose a[href*="instrutor"]').count(), 0, 'No case or instructor recommendation appears in the focus hub');
  await focus.context.close();
  report.checks.push('Foco do loop activation preserves the release destination and eight original STAR stories without optional-case or instructor links');

  for (const width of [390, 1024]) {
    const { context, page } = await profile({ width, history: true }); await visit(page);
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    await assertHome(page, width);
    await capture(page, `home-${width}-font-200.png`);
    await context.close();
  }
  const noJs = await profile({ width: 390, height: 844, javaScriptEnabled: false });
  assert.equal((await noJs.page.goto(base + '/index.html')).status(), 200);
  assert.deepEqual(await noJs.page.locator('.track-card h3').allTextContents(), expectedCards.map(card => card.title));
  for (const card of expectedCards) assert.equal(await noJs.page.locator(`a.track-card[href="${card.url}"]`).isVisible(), true);
  await capture(noJs.page, 'home-390-no-javascript.png'); await noJs.context.close();
  report.checks.push('Root font-size 200% reflow and static six-card navigation without JavaScript');

  const requests = await browser.newContext();
  for (const { url } of expectedCards) assert.equal((await requests.request.get(base + url)).status(), 200, `Existing destination serves 200: ${url}`);
  await requests.close();
  // Historical comparisons are explicitly opt-in. A stale local snapshot must
  // not change the default release test or become a prerequisite for running it.
  // Optional audit: HOME_BASELINE=/absolute/path/to/baseline.json node scripts/check-homepage.mjs
  const baselineFile = process.env.HOME_BASELINE ? path.resolve(root, process.env.HOME_BASELINE) : null;
  const baseline = baselineFile ? JSON.parse(await fs.readFile(baselineFile, 'utf8')) : null;
  report.baselineFile = baselineFile;
  if (baseline) {
    const digest = async file => crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
    for (const [file, hash] of Object.entries(baseline.hashes)) assert.equal(await digest(path.join(root, currentSourcePath(file))), hash, `Policy/asset preserved: ${file}`);
    for (const [file, hash] of Object.entries(baseline.artifacts)) assert.equal(await digest(path.join(root, 'dist', file)), hash, `Manifest/index/asset preserved: ${file}`);
    for (const [file, hash] of Object.entries(baseline.contentHashes || {})) assert.equal(await digest(path.join(root, currentSourcePath(file))), hash, `Content unchanged: ${file}`);
    const retired = new Set(['resume-link', 'next-heading', 'read-count', 'read-progress']);
    for (const [route, { ids }] of Object.entries(baseline.routes)) {
      const pageHtml = await fs.readFile(path.join(root, 'dist', route), 'utf8');
      for (const id of ids) if (!(route === 'index.html' && retired.has(id))) assert.ok(pageHtml.includes(`id="${id}"`), `Existing route/anchor: ${route}#${id}`);
    }
    report.checks.push('Baseline content, policies, search index, manifest, cover and every route/content anchor preserved; only four retired homepage component IDs excluded');
  }
  if (!baseline) report.checks.push('Current UI, storage, audience and routing assertions run without any historical baseline');
  assert.deepEqual(errors, [], 'No runtime or console errors');
  await fs.writeFile(path.join(output, 'homepage-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Homepage PASS: ${report.matrix.length} requested viewport/theme states, ${report.captures.length} actual captures, ${report.checks.length} focused groups. ${base}`);
} finally { await browser.close(); }
