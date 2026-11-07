import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { currentSourcePath } from './lib/project-paths.mjs';

// Standalone local regression; fresh contexts never open personal browser data.
const root = fileURLToPath(new URL('../', import.meta.url));
const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:4173';
const output = path.join(root, '.site/lesson10');
const screenshots = path.join(output, 'after');
await fs.mkdir(screenshots, { recursive: true });
const route = '/technical-knowledge/02-system-design/ecommerce/10-safe-changes.html';
const previousLesson = '/technical-knowledge/02-system-design/ecommerce/09-failure-recovery.html';
const overview = '/technical-knowledge/02-system-design/00-system-design-from-zero.html';
const assetPrefix = '/technical-knowledge/02-system-design/ecommerce/assets/10-safe-changes-aws';
const anchors = ['cena', 'requisitos', 'versoes', 'compatibilidade', 'caminho', 'mermaid', 'tradeoffs', 'aws', 'publicar', 'falha', 'perguntas', 'exercicio', 'resumo'];
const manifest = JSON.parse(await fs.readFile(path.join(root, 'dist/content-manifest.json'), 'utf8'));
const index = JSON.parse(await fs.readFile(path.join(root, 'dist/search-index.json'), 'utf8'));
const doc = manifest.find(item => item.canonicalUrl === route);
assert.ok(doc, 'Lesson 10 must be in the emitted manifest; build with the review index first');
assert.equal(doc.sourcePath, 'technical-knowledge/02-system-design/ecommerce/10-safe-changes.md');
assert.equal(doc.audience, 'student'); assert.equal(doc.standalone, false);
assert.equal(doc.search, true); assert.equal(doc.progress, true);
const lessonSource = await fs.readFile(path.join(root, doc.sourcePath));
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
const sourceSha = digest(lessonSource);
assert.equal(doc.contentVersion, sourceSha.slice(0, 16), 'The emitted lesson corresponds to the current Markdown source');
const report = { base, route, documents: manifest.length, sourceSha, contentVersion: doc.contentVersion, matrix: [], checks: [], screenshots: [], errors: [], requests: [], limits: ['Local Chromium only; Safari and physical mobile keyboards were not tested.', 'Local screenshots and checks are not a publication, performance benchmark or complete WCAG claim.', 'Change examples are checked as lesson text and copied code; no deployment, rollback, schema migration, backend, cloud resource or real browser zoom was exercised.'] };
const requestedOrigins = new Set();
const contexts = [];
let executablePath = process.env.CHROMIUM_PATH;
if (!executablePath) {
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  const version = (await fs.readdir(cache)).filter(name => name.startsWith('chromium_headless_shell-')).sort().at(-1);
  executablePath = path.join(cache, version, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
}
const browser = await chromium.launch({ executablePath, headless: true }); report.browser = browser.version();
const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
async function context(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', reducedMotion: 'reduce', ...options });
  contexts.push(ctx);
  await ctx.addInitScript(() => {
    window.__lessonDiagramReady = false;
    document.addEventListener('architecture-diagrams-ready', () => { window.__lessonDiagramReady = true; });
  });
  const page = await ctx.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) report.errors.push(request.url()); });
  page.on('request', request => { if (/^https?:/.test(request.url())) requestedOrigins.add(new URL(request.url()).origin); });
  return { ctx, page };
}
async function close(ctx) { await ctx.close(); contexts.splice(contexts.indexOf(ctx), 1); }
async function visit(page, url = route) {
  const response = await page.goto(base + url);
  if (response) assert.equal(response.status(), 200, url);
  else assert.equal(page.url(), new URL(base + url).href);
  await rendered(page);
  await noOverflow(page);
}
async function rendered(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => {
    const diagrams = [...document.querySelectorAll('.mermaid')];
    return (!diagrams.length || window.__lessonDiagramReady) && diagrams.every(element => element.querySelector('svg') || element.classList.contains('diagram-failed'));
  });
  assert.equal(await page.locator('.diagram-failed').count(), 0, `Mermaid renders: ${page.url()}`);
}
async function publicationAnchorReady(page) {
  // Observe completed app rendering and the actual lazy image without scrolling,
  // rewriting study records or accepting another saved section.
  await rendered(page);
  await page.locator(`.prose img[src="${assetPrefix}.svg"]`).evaluate(image => image.decode());
  await page.evaluate(async () => { for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame); });
  await assertAnchor(page, 'publicar');
}
async function noOverflow(page) { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No global horizontal overflow: ${page.url()}`); }
async function save(page, name, fullPage = false) {
  await page.evaluate(async () => { for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame); });
  await page.screenshot({ path: path.join(screenshots, name + '.png'), fullPage, animations: 'disabled' }); report.screenshots.push(name + '.png');
}
async function assertAnchor(page, id) {
  await page.waitForFunction(id => {
    const target = document.getElementById(id), header = document.querySelector('.topbar');
    return target && target.getBoundingClientRect().top >= (getComputedStyle(header).position === 'sticky' ? header.getBoundingClientRect().bottom : 0) - 1 && target.getBoundingClientRect().top < innerHeight;
  }, id);
}
async function diagramControls(page, screenshot) {
  const visual = page.locator('#diagram-dialog .diagram-stage svg, #diagram-dialog .diagram-stage img').first();
  if (await visual.evaluate(element => element instanceof HTMLImageElement)) await visual.evaluate(image => image.decode());
  await page.locator('[data-diagram-zoom="fit"]').click();
  const fittedWidth = await visual.evaluate(element => element.getBoundingClientRect().width);
  assert.ok(fittedWidth > 0, 'Ajustar displays the new diagram');
  await save(page, screenshot);
  await page.locator('[data-diagram-zoom="in"]').click();
  assert.ok(await visual.evaluate(element => element.getBoundingClientRect().width) > fittedWidth, 'Zoom enlarges the new diagram');
  assert.ok(await page.locator('.diagram-stage').evaluate(stage => {
    if (stage.scrollWidth <= stage.clientWidth + 1) return true;
    stage.scrollLeft = stage.scrollWidth;
    return stage.scrollLeft > 0;
  }), 'Zoomed drawing supports local horizontal panning when needed');
  assert.ok(await page.locator('.diagram-stage').evaluate(stage => {
    if (stage.scrollHeight <= stage.clientHeight + 1) return true;
    stage.scrollTop = stage.scrollHeight;
    return stage.scrollTop > 0;
  }), 'Tall drawings support local vertical panning when needed');
  await page.locator('[data-diagram-zoom="fit"]').click();
  await noOverflow(page);
}
try {
  const navigation = await context();
  await visit(navigation.page, overview);
  const lessonLinks = await navigation.page.locator('.prose a').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
  const overviewHeadings = await navigation.page.locator('.prose h2').evaluateAll(elements => elements.map(element => { const copy = element.cloneNode(true); copy.querySelectorAll('.heading-link').forEach(control => control.remove()); return copy.textContent.trim(); }));
  assert.equal(overviewHeadings.filter(title => title === 'Próximas etapas (planejadas)').length, 1, 'The historic planned-stages heading and its anchor remain preserved');
  assert.ok(lessonLinks.every(url => !url?.includes('/ecommerce/11-')), 'The complete ten-lesson index does not invent Lesson 11');
  const orderedLessons = ['01-from-click-to-catalog', '02-from-cart-to-order', '03-scaling-and-session', '04-catalog-queries', '05-cache-cdn', '06-last-unit', '07-payment-uncertain', '08-async-work', '09-failure-recovery', '10-safe-changes'].map(slug => `/technical-knowledge/02-system-design/ecommerce/${slug}.html`);
  for (const url of orderedLessons) assert.ok(lessonLinks.includes(url), `The study index links to ${url}`);
  assert.deepEqual(orderedLessons.map(url => lessonLinks.indexOf(url)), orderedLessons.map(url => lessonLinks.indexOf(url)).sort((a, b) => a - b), 'The study index keeps all ten lessons in order');
  for (const url of [overview, previousLesson]) {
    await visit(navigation.page, url);
    const entry = navigation.page.locator(`.prose a[href="${route}"]`);
    assert.ok(await entry.count() >= 1, `Existing lesson/index links to Lesson 10: ${url}`);
    await entry.first().click(); await navigation.page.waitForURL(base + route);
    assert.equal(new URL(navigation.page.url()).pathname, route);
  }
  assert.equal(await navigation.page.locator('.prose a[href*="/ecommerce/11-"], .article-pagination a[href*="/ecommerce/11-"]').count(), 0, 'The concluding lesson does not link to a nonexistent Lesson 11');
  const previous = navigation.page.locator(`.article-pagination a[href="${previousLesson}"]`);
  assert.equal(await previous.count(), 1, 'Lesson 10 previous navigation points to Lesson 9');
  await previous.click(); await navigation.page.waitForURL(base + previousLesson);
  const next = navigation.page.locator(`.article-pagination a[href="${route}"]`);
  assert.equal(await next.count(), 1, 'Lesson 9 next navigation points to Lesson 10');
  await next.click(); await navigation.page.waitForURL(base + route);
  assert.equal(await navigation.page.locator('.prose h1').innerText(), 'Aula 10 — A loja precisa mudar. Como atualizar com compras em andamento?');
  assert.equal(await navigation.page.locator('body').getAttribute('data-content-version'), doc.contentVersion, 'The real preview HTML matches the current source/manifest version');
  for (const anchor of anchors) assert.equal(await navigation.page.locator(`[id="${anchor}"]`).count(), 1, `Stable Lesson 10 anchor: ${anchor}`);
  const sectionIds = await navigation.page.locator('.prose h2[id], .prose h3[id]').evaluateAll(elements => elements.map(element => element.id));
  const tocIds = await navigation.page.locator('#page-toc nav a').evaluateAll(elements => elements.map(element => decodeURIComponent(element.hash.slice(1))));
  for (const id of sectionIds) assert.ok(tocIds.includes(id), `Lesson section is in the TOC: ${id}`);
  const visible = await navigation.page.locator('.prose').innerText();
  report.codeBlocks = await navigation.page.locator('.prose .code-block').evaluateAll(elements => elements.map(element => ({ language: element.querySelector('pre code').className, controls: element.querySelectorAll('.copy-code').length })));
  assert.ok(report.codeBlocks.length > 0 && report.codeBlocks.every(item => item.controls === 1), 'Every real code example has exactly one copy control');
  for (const literal of ['pending_reason']) assert.ok(visible.includes(literal), `Real lesson example: ${literal}`);
  assert.equal(await navigation.page.locator('.prose a[href^="/cases/"]').count(), 0, 'Lesson 10 does not recommend standalone FSI cases');
  const svg = navigation.page.locator(`.prose img[src="${assetPrefix}.svg"]`);
  assert.equal(await svg.count(), 1, 'The new architecture SVG is used in the lesson');
  await svg.scrollIntoViewIfNeeded(); await svg.evaluate(image => image.decode());
  assert.ok(await svg.evaluate(image => image.naturalWidth > 0 && image.naturalHeight > 0));
  const svgResource = await navigation.page.request.get(base + assetPrefix + '.svg');
  assert.equal(svgResource.status(), 200);
  assert.equal(digest(await svgResource.body()), digest(await fs.readFile(path.join(root, assetPrefix.slice(1) + '.svg'))), 'The preview SVG matches the current diagram source byte-for-byte');
  const drawio = await navigation.page.request.get(base + assetPrefix + '.drawio');
  assert.equal(drawio.status(), 200); assert.match(await drawio.text(), /<mxfile\b/);
  assert.equal(digest(await drawio.body()), digest(await fs.readFile(path.join(root, assetPrefix.slice(1) + '.drawio'))), 'The preview editable diagram matches the current drawio source byte-for-byte');
  assert.ok(await navigation.page.locator(`.prose a[href="${assetPrefix}.drawio"]`).count() >= 1, 'Editable diagram source is linked');
  const publicQuestionText = await navigation.page.locator('.prose').evaluate(prose => {
    let start = prose.querySelector('#perguntas');
    while (start?.parentElement !== prose) start = start.parentElement;
    const parts = [];
    for (let node = start.nextElementSibling; node && node.id !== 'exercicio' && !node.querySelector('#exercicio'); node = node.nextElementSibling) {
      if (node.matches('details')) continue;
      const copy = node.cloneNode(true); copy.querySelectorAll('details').forEach(item => item.remove()); parts.push(copy.textContent);
    }
    return parts.join(' ');
  });
  assert.equal((publicQuestionText.match(/Pergunta extra:/g) || []).length, 6, 'Each of the six questions has a visible follow-up');
  for (const part of ['Parte A', 'Parte B']) assert.ok(visible.includes(part), `The exercise includes ${part}`);
  await close(navigation.ctx);
  report.checks.push('Canonical Lesson 10 route, real index/Lesson 9 navigation, stable anchors/TOC, example values and new SVG/drawio assets');

  for (const width of [390, 768, 1440]) for (const theme of ['light', 'dark']) for (const focus of [false, true]) {
    const matrix = await context({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme });
    const page = matrix.page; await visit(page);
    if (focus) await page.locator('#focus-toggle').click();
    await noOverflow(page);
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    assert.ok(await page.locator('.prose .mermaid svg').count() >= 1, 'The Lesson 10 mechanism diagram renders');
    const image = page.locator(`img[src="${assetPrefix}.svg"]`); await image.scrollIntoViewIfNeeded(); await image.evaluate(image => image.decode());
    const answers = page.locator('.prose details:not(.diagram-source)');
    assert.equal(await answers.count(), 7, 'Six commented answers and one exercise solution');
    assert.equal(await answers.evaluateAll(elements => elements.every(element => !element.open)), true, 'Solutions start closed');
    assert.equal(await answers.filter({ has: page.locator('summary', { hasText: /^Ver resposta comentada$/i }) }).count(), 6);
    assert.equal(await answers.filter({ has: page.locator('summary', { hasText: /^Ver solução comentada$/i }) }).count(), 1);
    for (const table of await page.locator('.prose .table-scroll').all()) {
      assert.equal(await table.getAttribute('tabindex'), '0');
      assert.ok(await table.evaluate(element => { if (element.scrollWidth <= element.clientWidth + 1) return true; element.scrollLeft = element.scrollWidth; const works = element.scrollLeft > 0; element.scrollTo({ left: 0, behavior: 'instant' }); return works; }), 'Wide tables remain locally scrollable');
    }
    for (const anchor of ['cena', 'publicar', 'falha', 'exercicio']) { await visit(page, route + '#' + anchor); await assertAnchor(page, anchor); }
    assert.equal(await page.locator('body').evaluate(body => body.classList.contains('focus-mode')), focus, 'The captured matrix keeps the requested reading mode');
    await page.evaluate(() => scrollTo(0, 0));
    const suffix = `${width}-${theme}-${focus ? 'focus' : 'normal'}`;
    if (width !== 768 && !focus || width === 1440 && focus) await save(page, 'lesson10-' + suffix);
    if (theme === 'light' && !focus && [390, 1440].includes(width)) {
      await page.locator('.diagram').first().scrollIntoViewIfNeeded();
      await page.locator('.diagram .diagram-expand').first().click(); assert.equal(await page.locator('#diagram-dialog').evaluate(element => element.open), true); await diagramControls(page, `mermaid-modal-${width}`); await page.keyboard.press('Escape');
      const imageButton = page.locator('.diagram-image').filter({ has: page.locator(`img[src="${assetPrefix}.svg"]`) }).locator('.diagram-expand'); await imageButton.click();
      assert.equal(await page.locator('#diagram-dialog .diagram-stage img').count(), 1); await diagramControls(page, `svg-modal-${width}`); await page.keyboard.press('Escape');
      assert.equal(await imageButton.evaluate(element => element === document.activeElement), true, 'Diagram close restores focus');
      await answers.last().locator('summary').click(); assert.equal(await answers.last().evaluate(element => element.open), true); await noOverflow(page);
      if (width === 390) await save(page, `exercise-open-${width}`);
    }
    report.matrix.push({ width, theme, focus, answers: await answers.count(), tables: await page.locator('.table-scroll').count() });
    await close(matrix.ctx);
  }
  report.checks.push('390/768/1440 × light/dark × normal/focus: real diagrams with fit/zoom/local panning, closed/native answers, local table scrolling, direct anchors and no page overflow');

  const searchProfile = await context(); await visit(searchProfile.page);
  const hidden = await searchProfile.page.locator('.prose').evaluate(prose => {
    // The existing search policy keeps visible summary labels/questions while
    // excluding the hidden answer body. Preserve those labels in this comparison.
    const copy = prose.cloneNode(true); copy.querySelectorAll('details').forEach(element => element.replaceWith(element.querySelector('summary').cloneNode(true)));
    return { visible: copy.textContent, answers: [...prose.querySelectorAll('details:not(.diagram-source)')].map(element => { const answer = element.cloneNode(true); answer.querySelector('summary').remove(); return answer.textContent; }) };
  });
  const indexedLesson = normalize(index.filter(item => new URL(item.url, base).pathname === route).map(item => `${item.title} ${item.description} ${item.text}`).join(' '));
  assert.ok(indexedLesson.length > 100, 'Lesson 10 explanations remain globally searchable');
  const outsideAnswers = normalize(hidden.visible);
  let checkedFragments = 0;
  for (const answer of hidden.answers) {
    const words = normalize(answer).split(' '); let distinct = 0;
    for (let offset = 0; offset + 12 <= words.length; offset++) {
      const fragment = words.slice(offset, offset + 12).join(' ');
      if (outsideAnswers.includes(fragment)) continue;
      assert.equal(indexedLesson.includes(fragment), false, `Hidden answer/exercise explanation is not indexed: ${fragment}`); distinct++; checkedFragments++;
    }
    assert.ok(distinct > 0, 'Each hidden answer has a distinct explanation to verify');
  }
  const byUrl = new Map(manifest.map(item => [item.canonicalUrl, item]));
  for (const item of index) { const indexed = byUrl.get(new URL(item.url, base).pathname); assert.ok(indexed && indexed.search && indexed.audience === 'student' && !indexed.standalone, 'Global search preserves instructor/case exclusions'); }
  await searchProfile.page.locator('[data-search-open]').filter({ visible: true }).first().click(); await searchProfile.page.locator('#search-input').fill('loja precisa mudar');
  await searchProfile.page.waitForFunction(() => document.querySelector('.search-status').dataset.state === 'results');
  assert.ok((await searchProfile.page.locator('.search-result').evaluateAll(elements => elements.map(element => element.pathname))).includes(route), 'Global search finds the new lesson');
  await searchProfile.page.locator('#search-input').fill('compras em andamento');
  await searchProfile.page.waitForFunction(url => document.querySelector('.search-status').dataset.state === 'results' && document.querySelector('.search-result')?.pathname === url, route);
  await save(searchProfile.page, 'search-lesson10'); await close(searchProfile.ctx);
  report.checks.push(`Global search finds Lesson 10 but excludes ${checkedFragments} distinct hidden-answer fragments and all standalone/instructor documents`);

  const persistence = await context(); const page = persistence.page;
  await visit(page, route + '#publicar'); await publicationAnchorReady(page);
  await page.waitForFunction(id => JSON.parse(localStorage.getItem('architecture-practice:study:v2'))?.resume.student?.contentId === id, doc.id);
  await page.locator('.read-toggle').click();
  await page.waitForFunction(id => JSON.parse(localStorage.getItem('architecture-practice:study:v2')).reading[id]?.marked === true, doc.id);
  await visit(page, route + '#publicar'); await page.reload(); await publicationAnchorReady(page);
  assert.equal(await page.locator('.read-toggle').getAttribute('aria-pressed'), 'true');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')).resume.student.anchor === 'publicar');
  report.continuity = { beforePagehide: await page.evaluate(prefix => {
    const image = document.querySelector(`.prose img[src="${prefix}.svg"]`);
    const header = document.querySelector('.topbar');
    return {
      url: location.href, contentVersion: document.body.dataset.contentVersion,
      diagramsReady: window.__lessonDiagramReady, mermaidSvgs: document.querySelectorAll('.mermaid svg').length,
      fonts: document.fonts.status,
      image: { complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight },
      anchorTop: document.getElementById('publicar').getBoundingClientRect().top,
      headerBoundary: getComputedStyle(header).position === 'sticky' ? header.getBoundingClientRect().bottom : 0,
      resume: JSON.parse(localStorage.getItem('architecture-practice:study:v2')).resume.student
    };
  }, assetPrefix) };
  await visit(page, '/meu-estudo/index.html'); await page.locator('.resume-study').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#resume-link').getAttribute('href'), route + '#publicar');
  report.continuity.afterPagehide = { href: await page.locator('#resume-link').getAttribute('href'), resume: await page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')).resume.student) };
  assert.equal(report.continuity.afterPagehide.resume.anchor, 'publicar', 'Real pagehide preserves the exact ready-state publishing anchor');
  assert.equal(await page.locator(`.study-history a[href="${route}"]`).count(), 1);
  const resume = await page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')).resume.student);
  await visit(page, '/cases/01-payment-processing-pix.html');
  await visit(page, '/interview/simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/instrutor.html');
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')).resume.student), resume, 'Cases/instructor do not replace Lesson 10 continuity');
  await visit(page, '/meu-estudo/index.html'); await page.locator('.resume-study').waitFor({ state: 'visible' }); await save(page, 'lesson10-my-study');
  await close(persistence.ctx);
  report.checks.push('Lesson 10 read marking, reload, exact saved #publicar anchor, Meu estudo and isolation from cases/instructor visits');

  const copyProfile = await context({ permissions: ['clipboard-read', 'clipboard-write'] });
  await visit(copyProfile.page);
  const examples = copyProfile.page.locator('.prose .code-block');
  assert.ok(await examples.count() > 0, 'The real lesson has code examples with copy controls');
  for (const example of await examples.all()) {
    for (const details of await example.locator('xpath=ancestor::details').all()) if (!await details.evaluate(element => element.open)) await details.locator(':scope > summary').click();
    const expected = await example.locator('pre code').textContent();
    await example.locator('.copy-code').click();
    await example.locator('.copy-code').filter({ hasText: 'Copiado' }).waitFor();
    assert.equal(await copyProfile.page.evaluate(() => navigator.clipboard.readText()), expected, 'Copy writes the complete unmodified change example to the real browser clipboard');
  }
  await noOverflow(copyProfile.page);
  await close(copyProfile.ctx);
  report.checks.push('The existing copy controls copy every change example using the browser clipboard');

  const blocked = await context({ viewport: { width: 390, height: 844 } });
  await blocked.ctx.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
  });
  await visit(blocked.page);
  assert.match(await blocked.page.locator('body').innerText(), /temporári|armazenamento.*indisponível|não.*salv/i, 'The lesson explains blocked storage');
  await blocked.page.locator('.read-toggle').click();
  assert.match(await blocked.page.locator('body').innerText(), /temporári|não.*salv/i, 'Read marking does not promise persistence when storage is blocked');
  await noOverflow(blocked.page); await close(blocked.ctx);
  report.checks.push('The new lesson remains readable with storage blocked and communicates temporary progress');

  const staticProfile = await context({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  assert.equal((await staticProfile.page.goto(base + route)).status(), 200);
  assert.equal(await staticProfile.page.locator('.prose h1').count(), 1);
  await staticProfile.page.locator('.prose details:not(.diagram-source)').last().locator('summary').click();
  assert.equal(await staticProfile.page.locator('.prose details:not(.diagram-source)').last().evaluate(element => element.open), true);
  assert.ok(await staticProfile.page.locator(`a[href="${assetPrefix}.drawio"]`).count() >= 1);
  await noOverflow(staticProfile.page); await close(staticProfile.ctx);
  report.checks.push('Static lesson, native exercise disclosure and editable diagram link remain available without JavaScript');

  const baseline = await fs.readFile(path.join(output, 'baseline.json'), 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  if (baseline) {
    assert.equal(manifest.length, baseline.documents + 1, 'Only Lesson 10 adds a public document');
    assert.deepEqual(manifest.filter(item => !(item.sourcePath in baseline.sourceHashes)).map(item => item.sourcePath), [doc.sourcePath], 'No private or editorial notes enter the artifact');
    const changedSources = new Set(['technical-knowledge/02-system-design/00-system-design-from-zero.md', 'technical-knowledge/02-system-design/ecommerce/09-failure-recovery.md', 'technical-knowledge/02-system-design/ecommerce/00-scenario.md', 'technical-knowledge/learning-guide.md']);
    const sha = digest;
    const hash = async file => sha(await fs.readFile(path.join(root, currentSourcePath(file))));
    for (const [file, expected] of Object.entries(baseline.sourceHashes)) {
      assert.ok(manifest.some(item => item.sourcePath === file), `Existing document remains published: ${file}`);
      if (!changedSources.has(file)) assert.equal(await hash(file), expected, `Existing Markdown preserved: ${file}`);
    }
    for (const [file, expected] of Object.entries(baseline.runtimeHashes)) {
      let actual = await hash(file);
      if (file === 'scripts/check-site.mjs' && actual !== expected) {
        // Reverse only the three reviewed guide-only references; every other
        // byte of every validation, runtime and policy must match the baseline.
        const source = await fs.readFile(path.join(root, file), 'utf8');
        const block = source.match(/const horizonteReferences = new Set\(\[[\s\S]*?\]\.map\(canonical\)\);/)[0];
        const additions = [
          'https://aws.amazon.com/builders-library/ensuring-rollback-safety-during-deployments/',
          'https://aws.amazon.com/builders-library/automating-safe-hands-off-deployments/',
          'https://docs.aws.amazon.com/whitepapers/latest/overview-deployment-options/canary-deployments.html'
        ];
        let restored = block;
        for (const url of additions) {
          const line = restored.split('\n').find(item => item.includes(`'${url}'`));
          assert.ok(line && /^\s+'https:\/\/[^']+',?$/.test(line), `Only the exact reviewed guide reference is allowed: ${url}`);
          assert.equal(restored.split(url).length, 2, 'Each reviewed reference is added once');
          restored = restored.replace(line + '\n', '');
        }
        restored = restored.replace(/',\n(\s*\]\.map\(canonical\)\);)$/, "'\n$1");
        actual = sha(source.replace(block, restored));
      }
      assert.equal(actual, expected, `Runtime, styles, policies, old tests and CSP preserved: ${file}`);
    }
    for (const [file, expected] of Object.entries(baseline.assetHashes)) assert.equal(await hash(file), expected, `Existing editable diagrams/assets preserved: ${file}`);
    for (const before of baseline.manifest) {
      const now = manifest.find(item => item.sourcePath === before.sourcePath);
      assert.equal(now.canonicalUrl, before.canonicalUrl, `Old URL preserved: ${before.sourcePath}`);
      const html = await fs.readFile(path.join(root, 'dist', now.canonicalUrl), 'utf8');
      for (const id of before.existingAnchors) assert.ok(html.includes(`id="${id}"`), `Old anchor preserved: ${now.canonicalUrl}#${id}`);
    }
    const parsedRouteIds = JSON.parse(execFileSync('python3', ['-c', `
import json,sys
from pathlib import Path
from html.parser import HTMLParser
class IdParser(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.ids=[]
    def handle_starttag(self,tag,attrs):self.ids.extend(value for name,value in attrs if name=='id' and value is not None)
root=Path(sys.argv[1]);result={}
for url in json.load(sys.stdin):
    parser=IdParser();parser.feed((root/'dist'/url.lstrip('/')).read_text());parser.close();result[url]=parser.ids
print(json.dumps(result))
`, root], { input: JSON.stringify(Object.keys(baseline.routes)), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
    for (const [url, before] of Object.entries(baseline.routes)) {
      const ids = new Set(parsedRouteIds[url]);
      for (const id of before.ids) assert.ok(ids.has(id), `Every existing HTML route/ID remains available: ${url}#${id}`);
    }
    for (const [file, expected] of Object.entries(baseline.generatedHashes)) {
      // Navigation can legitimately gain Lesson 10; all old resources and cover
      // remain byte-identical, and every previous HTML route stays present.
      const content = await fs.readFile(path.join(root, 'dist', file));
      if (!file.endsWith('.html') && !['content-manifest.json', 'search-index.json'].includes(file)) assert.equal(sha(content), expected, `Emitted resource preserved: ${file}`);
    }
    assert.equal(sha(await fs.readFile(baseline.gitIndex.path)), baseline.gitIndex.sha256, 'The real Git index is unchanged');
    report.checks.push(`Task baseline: ${baseline.documents} old routes/anchors, all other Markdown, prior assets, runtime, policies, old tests, cover and real Git index preserved`);
  }
  assert.deepEqual(report.errors, [], 'No browser, CSP or network errors');
  assert.deepEqual([...requestedOrigins], [new URL(base).origin], 'Only existing self-hosted resources are requested');
  report.requests = [...requestedOrigins];
  await fs.writeFile(path.join(output, 'lesson10-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Horizonte Lesson 10 PASS: ${report.matrix.length} viewport/theme/focus states, ${report.screenshots.length} real captures, ${report.checks.length} focused groups. ${base}`);
} finally { for (const ctx of contexts) await ctx.close(); await browser.close(); }
