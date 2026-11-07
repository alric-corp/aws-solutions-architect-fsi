import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { currentSourcePath } from './lib/project-paths.mjs';

// Standalone local regression; fresh contexts never open personal browser data.
const root = fileURLToPath(new URL('../', import.meta.url));
const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:4173';
const output = path.join(root, '.site/lesson7');
const screenshots = path.join(output, 'after');
await fs.mkdir(screenshots, { recursive: true });
const route = '/technical-knowledge/02-system-design/ecommerce/07-payment-uncertain.html';
const previousLesson = '/technical-knowledge/02-system-design/ecommerce/06-last-unit.html';
const overview = '/technical-knowledge/02-system-design/00-system-design-from-zero.html';
const assetPrefix = '/technical-knowledge/02-system-design/ecommerce/assets/07-payment-uncertain-aws';
const anchors = ['cena', 'requisitos', 'pagamento', 'idempotencia', 'caminho', 'mermaid', 'tradeoffs', 'aws', 'arquitetura', 'falha', 'perguntas', 'exercicio', 'resumo'];
const manifest = JSON.parse(await fs.readFile(path.join(root, 'dist/content-manifest.json'), 'utf8'));
const index = JSON.parse(await fs.readFile(path.join(root, 'dist/search-index.json'), 'utf8'));
const doc = manifest.find(item => item.canonicalUrl === route);
assert.ok(doc, 'Lesson 7 must be in the emitted manifest; build with the review index first');
assert.equal(doc.sourcePath, 'technical-knowledge/02-system-design/ecommerce/07-payment-uncertain.md');
assert.equal(doc.audience, 'student'); assert.equal(doc.standalone, false);
assert.equal(doc.search, true); assert.equal(doc.progress, true);
const lessonSource = await fs.readFile(path.join(root, doc.sourcePath));
const sourceSha = crypto.createHash('sha256').update(lessonSource).digest('hex');
assert.equal(doc.contentVersion, sourceSha.slice(0, 16), 'The emitted lesson corresponds to the current Markdown source');
const report = { base, route, documents: manifest.length, sourceSha, contentVersion: doc.contentVersion, matrix: [], checks: [], screenshots: [], errors: [], requests: [], limits: ['Local Chromium only; Safari and physical mobile keyboards were not tested.', 'Local screenshots and checks are not a publication, performance benchmark or complete WCAG claim.', 'Payment examples are checked as lesson text and copied code; no payment provider, charge, backend, cloud resource or real browser zoom was exercised.'] };
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
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.querySelectorAll('.mermaid')].every(element => element.querySelector('svg') || element.classList.contains('diagram-failed')));
  assert.equal(await page.locator('.diagram-failed').count(), 0, `Mermaid renders: ${url}`);
  await noOverflow(page);
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
  await page.locator('[data-diagram-zoom="fit"]').click();
  await noOverflow(page);
}
try {
  const navigation = await context();
  await visit(navigation.page, overview);
  const lessonLinks = await navigation.page.locator('.prose a').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
  const orderedLessons = ['01-from-click-to-catalog', '02-from-cart-to-order', '03-scaling-and-session', '04-catalog-queries', '05-cache-cdn', '06-last-unit', '07-payment-uncertain'].map(slug => `/technical-knowledge/02-system-design/ecommerce/${slug}.html`);
  for (const url of orderedLessons) assert.ok(lessonLinks.includes(url), `The study index links to ${url}`);
  assert.deepEqual(orderedLessons.map(url => lessonLinks.indexOf(url)), orderedLessons.map(url => lessonLinks.indexOf(url)).sort((a, b) => a - b), 'The study index keeps all seven lessons in order');
  for (const url of [overview, previousLesson]) {
    await visit(navigation.page, url);
    const entry = navigation.page.locator(`.prose a[href="${route}"]`);
    assert.ok(await entry.count() >= 1, `Existing lesson/index links to Lesson 7: ${url}`);
    await entry.first().click(); await navigation.page.waitForURL(base + route);
    assert.equal(new URL(navigation.page.url()).pathname, route);
  }
  const previous = navigation.page.locator(`.article-pagination a[href="${previousLesson}"]`);
  assert.equal(await previous.count(), 1, 'Lesson 7 previous navigation points to Lesson 6');
  await previous.click(); await navigation.page.waitForURL(base + previousLesson);
  const next = navigation.page.locator(`.article-pagination a[href="${route}"]`);
  assert.equal(await next.count(), 1, 'Lesson 6 next navigation points to Lesson 7');
  await next.click(); await navigation.page.waitForURL(base + route);
  assert.equal(await navigation.page.locator('.prose h1').innerText(), 'Aula 7 — O pagamento ficou sem resposta. Como evitar cobrar duas vezes?');
  for (const anchor of anchors) assert.equal(await navigation.page.locator(`[id="${anchor}"]`).count(), 1, `Stable Lesson 7 anchor: ${anchor}`);
  const sectionIds = await navigation.page.locator('.prose h2[id], .prose h3[id]').evaluateAll(elements => elements.map(element => element.id));
  const tocIds = await navigation.page.locator('#page-toc nav a').evaluateAll(elements => elements.map(element => decodeURIComponent(element.hash.slice(1))));
  for (const id of sectionIds) assert.ok(tocIds.includes(id), `Lesson section is in the TOC: ${id}`);
  const visible = await navigation.page.locator('.prose').innerText();
  report.codeBlocks = await navigation.page.locator('.prose .code-block').evaluateAll(elements => elements.map(element => ({ language: element.querySelector('pre code').className, controls: element.querySelectorAll('.copy-code').length })));
  assert.ok(report.codeBlocks.length > 0 && report.codeBlocks.every(item => item.controls === 1), 'Every real code example has exactly one copy control');
  for (const literal of ['pay-001', 'order-002', 'res-001', 'pay-order-002-v1', '19990', 'BRL']) assert.ok(visible.includes(literal), `Real lesson example: ${literal}`);
  assert.equal(await navigation.page.locator('.prose a[href^="/cases/"]').count(), 0, 'Lesson 7 does not recommend standalone FSI cases');
  const svg = navigation.page.locator(`.prose img[src="${assetPrefix}.svg"]`);
  assert.equal(await svg.count(), 1, 'The new architecture SVG is used in the lesson');
  await svg.scrollIntoViewIfNeeded(); await svg.evaluate(image => image.decode());
  assert.ok(await svg.evaluate(image => image.naturalWidth > 0 && image.naturalHeight > 0));
  assert.equal((await navigation.page.request.get(base + assetPrefix + '.svg')).status(), 200);
  const drawio = await navigation.page.request.get(base + assetPrefix + '.drawio');
  assert.equal(drawio.status(), 200); assert.match(await drawio.text(), /<mxfile\b/);
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
  report.checks.push('Canonical Lesson 7 route, real index/Lesson 6 navigation, stable anchors/TOC, example values and new SVG/drawio assets');

  for (const width of [390, 768, 1440]) for (const theme of ['light', 'dark']) for (const focus of [false, true]) {
    const matrix = await context({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme });
    const page = matrix.page; await visit(page);
    if (focus) await page.locator('#focus-toggle').click();
    await noOverflow(page);
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    assert.equal(await page.locator('.prose .mermaid svg').count(), 1, 'The Lesson 7 mechanism diagram renders');
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
    for (const anchor of ['cena', 'idempotencia', 'falha', 'exercicio']) { await visit(page, route + '#' + anchor); await assertAnchor(page, anchor); }
    assert.equal(await page.locator('body').evaluate(body => body.classList.contains('focus-mode')), focus, 'The captured matrix keeps the requested reading mode');
    await page.evaluate(() => scrollTo(0, 0));
    const suffix = `${width}-${theme}-${focus ? 'focus' : 'normal'}`;
    if (width !== 768 && !focus || width === 1440 && focus) await save(page, 'lesson7-' + suffix);
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
  assert.ok(indexedLesson.length > 100, 'Lesson 7 explanations remain globally searchable');
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
  await searchProfile.page.locator('[data-search-open]').filter({ visible: true }).first().click(); await searchProfile.page.locator('#search-input').fill('cobrar duas vezes');
  await searchProfile.page.waitForFunction(() => document.querySelector('.search-status').dataset.state === 'results');
  assert.ok((await searchProfile.page.locator('.search-result').evaluateAll(elements => elements.map(element => element.pathname))).includes(route), 'Global search finds the new lesson');
  await searchProfile.page.locator('#search-input').fill('O pagamento ficou sem resposta');
  await searchProfile.page.waitForFunction(url => document.querySelector('.search-status').dataset.state === 'results' && document.querySelector('.search-result')?.pathname === url, route);
  await save(searchProfile.page, 'search-lesson7'); await close(searchProfile.ctx);
  report.checks.push(`Global search finds Lesson 7 but excludes ${checkedFragments} distinct hidden-answer fragments and all standalone/instructor documents`);

  const persistence = await context(); const page = persistence.page;
  await visit(page, route + '#idempotencia'); await assertAnchor(page, 'idempotencia');
  await page.waitForFunction(id => JSON.parse(localStorage.getItem('architecture-practice:study:v2'))?.resume.student?.contentId === id, doc.id);
  await page.locator('.read-toggle').click();
  await page.waitForFunction(id => JSON.parse(localStorage.getItem('architecture-practice:study:v2')).reading[id]?.marked === true, doc.id);
  await visit(page, route + '#idempotencia'); await page.reload(); await assertAnchor(page, 'idempotencia');
  assert.equal(await page.locator('.read-toggle').getAttribute('aria-pressed'), 'true');
  await visit(page, '/meu-estudo/index.html'); await page.locator('.resume-study').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#resume-link').getAttribute('href'), route + '#idempotencia');
  assert.equal(await page.locator(`.study-history a[href="${route}"]`).count(), 1);
  const resume = await page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')).resume.student);
  await visit(page, '/cases/01-payment-processing-pix.html');
  await visit(page, '/interview/simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/instrutor.html');
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')).resume.student), resume, 'Cases/instructor do not replace Lesson 7 continuity');
  await visit(page, '/meu-estudo/index.html'); await page.locator('.resume-study').waitFor({ state: 'visible' }); await save(page, 'lesson7-my-study');
  await close(persistence.ctx);
  report.checks.push('Lesson 7 read marking, reload, exact saved #idempotencia anchor, Meu estudo and isolation from cases/instructor visits');

  const copyProfile = await context({ permissions: ['clipboard-read', 'clipboard-write'] });
  await visit(copyProfile.page);
  const examples = copyProfile.page.locator('.prose .code-block');
  assert.ok(await examples.count() > 0, 'The real lesson has code examples with copy controls');
  for (const example of await examples.all()) {
    for (const details of await example.locator('xpath=ancestor::details').all()) if (!await details.evaluate(element => element.open)) await details.locator(':scope > summary').click();
    const expected = await example.locator('pre code').textContent();
    await example.locator('.copy-code').click();
    await example.locator('.copy-code').filter({ hasText: 'Copiado' }).waitFor();
    assert.equal(await copyProfile.page.evaluate(() => navigator.clipboard.readText()), expected, 'Copy writes the complete unmodified payment example to the real browser clipboard');
  }
  await noOverflow(copyProfile.page);
  await close(copyProfile.ctx);
  report.checks.push('The existing copy controls copy every payment example using the browser clipboard');

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
    assert.equal(manifest.length, baseline.documents + 1, 'Only Lesson 7 adds a public document');
    assert.deepEqual(manifest.filter(item => !(item.sourcePath in baseline.sourceHashes)).map(item => item.sourcePath), [doc.sourcePath], 'No private or editorial notes enter the artifact');
    const changedSources = new Set(['technical-knowledge/02-system-design/00-system-design-from-zero.md', 'technical-knowledge/02-system-design/ecommerce/06-last-unit.md', 'technical-knowledge/02-system-design/ecommerce/00-scenario.md', 'technical-knowledge/learning-guide.md']);
    const sha = data => crypto.createHash('sha256').update(data).digest('hex');
    const hash = async file => sha(await fs.readFile(path.join(root, currentSourcePath(file))));
    for (const [file, expected] of Object.entries(baseline.sourceHashes)) {
      assert.ok(manifest.some(item => item.sourcePath === file), `Existing document remains published: ${file}`);
      if (!changedSources.has(file)) assert.equal(await hash(file), expected, `Existing Markdown preserved: ${file}`);
    }
    for (const [file, expected] of Object.entries(baseline.runtimeHashes)) {
      let actual = await hash(file);
      if (file === 'scripts/check-site.mjs' && actual !== expected) {
        // Reverse only the one reviewed guide-only RFC reference in memory;
        // every other byte of every guard must match the prior task baseline.
        const source = await fs.readFile(path.join(root, file), 'utf8');
        const block = source.match(/const horizonteReferences = new Set\(\[[\s\S]*?\]\.map\(canonical\)\);/)[0];
        const url = 'https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2';
        const line = block.split('\n').find(item => item.includes(`'${url}'`));
        assert.ok(line && /^\s+'https:\/\/[^']+',?$/.test(line), 'Only the exact reviewed RFC reference is allowed');
        assert.equal(block.split(url).length, 2, 'The reviewed RFC reference is added once');
        const restored = block.replace(line + '\n', '').replace(/',\n(\s*\]\.map\(canonical\)\);)$/, "'\n$1");
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
    for (const [file, expected] of Object.entries(baseline.generatedHashes)) {
      // Navigation can legitimately gain Lesson 7; all old resources and cover
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
  await fs.writeFile(path.join(output, 'lesson7-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Horizonte Lesson 7 PASS: ${report.matrix.length} viewport/theme/focus states, ${report.screenshots.length} real captures, ${report.checks.length} focused groups. ${base}`);
} finally { for (const ctx of contexts) await ctx.close(); await browser.close(); }
