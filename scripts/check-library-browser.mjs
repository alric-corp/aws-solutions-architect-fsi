import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { retiredDocuments, isRetiredSource, isRetiredUrl } from '../site/content-policy.mjs';
import { libraryGroups } from '../site/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:4173';
const retirementOutput = path.join(root, '.site/library-reorg');
const output = path.join(root, '.site/library-blocks');
const pictures = path.join(output, 'after');
await fs.mkdir(pictures, { recursive: true });
const baseline = await fs.readFile(path.join(retirementOutput, 'baseline.json'), 'utf8').then(JSON.parse).catch(() => null);
const beforeUI = await fs.readFile(path.join(retirementOutput, 'before-results.json'), 'utf8').then(JSON.parse).catch(() => null);
const layoutBaseline = await fs.readFile(path.join(output, 'baseline.json'), 'utf8').then(JSON.parse).catch(() => null);
const manifest = JSON.parse(await fs.readFile(path.join(root, 'dist/content-manifest.json'), 'utf8'));
const index = JSON.parse(await fs.readFile(path.join(root, 'dist/search-index.json'), 'utf8'));
const retired = [
  { source: 'interview/checklist.md', url: '/interview/checklist.html', title: 'Checklist da reta final' },
  { source: 'interview/common-questions.md', url: '/interview/common-questions.html', title: 'Perguntas comuns: “Fale sobre você” e “Por que a Amazon?”' },
  { source: 'interview/interview-preparation-plan.md', url: '/interview/interview-preparation-plan.html', title: 'Cronograma integrado — preparação AWS Solutions Architect FSI' }
];
const retiredSources = new Set(retired.map(item => item.source));
const retiredUrls = new Set(retired.map(item => item.url));
const library = '/biblioteca/index.html';
const readerRoute = '/technical-knowledge/02-system-design/ecommerce/03-scaling-and-session.html';
const foundation = manifest.find(item => item.sourcePath === 'technical-knowledge/01-fundamentals/06-databases-transactions-consistency.md');
const hasLoop = manifest.some(item => item.sourcePath === 'leadership-principles/loop-focus.md');
const specifications = [
  ['technical', 'Aprendizagem técnica', [
    ['technical-knowledge/02-system-design/00-system-design-from-zero.md', 'Loja Horizonte — comece do zero'],
    ['technical-knowledge/01-fundamentals/README.md', 'Fundamentos'],
    ['technical-knowledge/01-fundamentals/redes/README.md', 'Redes do zero'],
    ['technical-knowledge/01-fundamentals/acid/README.md', 'Transações e ACID do zero'],
    ['technical-knowledge/02-system-design/README.md', 'System Design'],
    ['templates/technical-module.md', 'Template de módulo técnico', true], ['templates/poc.md', 'Template de PoC', true]
  ]],
  ['non-technical', 'Aprendizagem não técnica', [
    ['leadership-principles/README.md', 'Leadership Principles'],
    ['leadership-principles/00-star-and-evidence.md', 'STAR, evidências e contribuição individual'],
    ['leadership-principles/stories/', 'Histórias STAR'],
    ['leadership-principles/practice-guide.md', 'Guia de prática dos Leadership Principles'],
    ['leadership-principles/english-practice-60-min.md', 'Comunicação em inglês'],
    ['templates/star-story.md', 'Template de história STAR', true],
    ['progress/leadership-principles-story-matrix.md', 'Matriz LP × histórias', true]
  ]],
  ['amazon-role', 'Amazon e a vaga', [
    ['role/solutions-architect-role.md', 'O papel de um Solutions Architect na AWS'],
    ['role/job-description.md', 'Descrição da vaga'], ['role/career-levels.md', 'Níveis de carreira — anotações'],
    ['interview/interview-process.md', 'O que esperar da entrevista na AWS'],
    ['interview/tips-and-strategies.md', 'Dicas e estratégias para a entrevista'],
    ['leadership-principles/loop-focus.md', 'Foco do loop']
  ]],
  ['practice', 'Testes e simulações', [
    ['/praticar/index.html', 'Simulados de troubleshooting'],
    ['interview/simulations/README.md', 'Simulações de entrevista'],
    ['interview/simulations/03-system-design/design-questions.md', 'Perguntas de design arquitetural'],
    ['progress/competencies.md', 'Autoavaliação de competências'],
    ['interview/simulations/04-troubleshooting/modelo-registro-sessao.md', 'Registro de sessão', true],
    ['templates/mock-interview-feedback.md', 'Feedback de simulação', true]
  ]]
];
const expectedGroups = specifications.map(([id, title, entries]) => ({ id, title, entries: entries.flatMap(([source, label, support = false]) => {
  if (source === 'leadership-principles/stories/' && !manifest.some(item => item.sourcePath.startsWith(source))) {
    assert.equal(Boolean(baseline), false, 'Production stories must survive the release baseline'); return [];
  }
  if (source === 'leadership-principles/loop-focus.md' && !hasLoop) {
    assert.equal(Boolean(baseline), false, 'Production Foco do loop must survive the release baseline'); return [];
  }
  if (source.startsWith('/')) return [{ label, url: source, support }];
  if (source.endsWith('/')) return [{ label, url: '/' + source + 'index.html', support }];
  const doc = manifest.find(item => item.sourcePath === source);
  assert.ok(doc && doc.audience === 'student' && !doc.standalone, 'Required public/student library resource: ' + source);
  return [{ label, url: doc.canonicalUrl, support }];
}) }));
const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const hashFile = async file => digest(await fs.readFile(path.join(root, file)));
const report = { base, documents: manifest.length, baseline: Boolean(baseline), layoutBaseline: Boolean(layoutBaseline), matrix: [], breakpoints: [], anchorChecks: [], readerStates: [], screenshots: [], checks: [], errors: [], limits: ['Local Chromium with isolated synthetic storage; no personal profile, AWS, build or publication.', 'Viewport and root-font 200% reflow checks do not claim actual browser zoom, Safari, physical-device or complete WCAG coverage.'] };
const requestedOrigins = new Set();
const contexts = [];
const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const version = (await fs.readdir(cache)).filter(name => name.startsWith('chromium_headless_shell-')).sort().at(-1);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || path.join(cache, version, 'chrome-headless-shell-mac-arm64/chrome-headless-shell'), headless: true });
report.browser = browser.version();
async function profile(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', reducedMotion: 'reduce', ...options }); contexts.push(ctx);
  const page = await ctx.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) report.errors.push(request.url()); });
  page.on('request', request => { if (/^https?:/.test(request.url())) requestedOrigins.add(new URL(request.url()).origin); });
  return { ctx, page };
}
async function close(ctx) { await ctx.close(); contexts.splice(contexts.indexOf(ctx), 1); }
async function noOverflow(page) { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No global overflow: ' + page.url()); }
async function visit(page, url = library) {
  const response = await page.goto(base + url);
  if (response) { assert.equal(response.status(), 200, url); if (baseline) assert.equal(response.headers()['content-security-policy'], baseline.csp, 'CSP stays unchanged'); }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.querySelectorAll('.mermaid')].every(element => element.querySelector('svg') || element.classList.contains('diagram-failed')));
  assert.equal(await page.locator('.diagram-failed').count(), 0); await noOverflow(page);
}
async function save(page, name, fullPage = false, settle = true) {
  // Keep the six paired Library screenshots; other regressions still execute.
  if (!/^library-(390|768|1440)-(light|dark)$/.test(name)) return;
  if (settle) await page.evaluate(async () => { for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame); });
  await page.screenshot({ path: path.join(pictures, name + '.png'), fullPage, animations: 'disabled' }); report.screenshots.push(name + '.png');
}
async function assertLibrary(page, expectedColumns = page.viewportSize().width >= 1024 ? 2 : 1) {
  const actual = await page.locator('.library-grid > section.library-group[data-library-group]').evaluateAll(groups => groups.map(group => ({ id: group.dataset.libraryGroup, title: group.querySelector(':scope > .library-group-heading h2').textContent, entries: [...group.querySelectorAll('.library-materials > li > a, .library-support-list > li > a')].map(entry => ({ label: entry.closest('.library-support') ? entry.querySelector(':scope > span').textContent : entry.querySelector('h3').textContent, url: entry.getAttribute('href'), support: Boolean(entry.closest('.library-support')) })) })));
  assert.deepEqual(actual, expectedGroups, 'Exactly four ordered purpose groups and their reviewed destinations');
  const jumps = page.locator('nav.library-jump-links');
  assert.equal(await jumps.count(), 1); assert.ok((await jumps.getAttribute('aria-label'))?.trim());
  assert.equal(await jumps.locator(':scope > ul > li').count(), 4);
  assert.deepEqual(await jumps.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href'))), expectedGroups.map(group => '#library-' + group.id), 'Four native anchor links follow the category order');
  for (const group of expectedGroups) {
    const section = page.locator(`[data-library-group="${group.id}"]`);
    assert.equal(await section.locator(':scope > header.library-group-heading h2').getAttribute('id'), 'library-' + group.id);
    assert.equal(await section.locator(':scope > header.library-group-heading h2').getAttribute('tabindex'), '-1', 'Native anchor destination can receive focus');
    assert.equal(await section.locator(':scope > ul.library-materials > li').count(), group.entries.filter(entry => !entry.support).length);
    const supports = group.entries.filter(entry => entry.support).length;
    assert.equal(await section.locator(':scope > footer.library-support').count(), supports ? 1 : 0);
    if (supports) { assert.equal(await section.locator('.library-support > h3').innerText(), 'Materiais de apoio'); assert.equal(await section.locator('.library-support-list > li > a').count(), supports); }
  }
  assert.doesNotMatch(await page.locator('.library-catalog > p').first().innerText(), /gabarito|instrutor/i, 'Instructor note does not precede the study categories');
  assert.match(await page.locator('[data-library-group="practice"]').innerText(), /gabarito|instrutor/i, 'Instructor note stays near practice');
  assert.equal(await page.locator('.library-group a[href^="/cases/"]').count(), 0);
  assert.equal(await page.locator('main a[href^="/cases/"]').count(), 1);
  assert.equal(await page.locator('aside.library-standalone a[href="/cases/index.html"]').count(), 1, 'One independent FSI entry outside categories');
  assert.equal(await page.locator('main a[href*="instrutor"], main a[href*="guia-do-instrutor"], main a[href*="diagnostico-inicial"], main a[href*="rubrica.html"]').count(), 0, 'Library does not expose instructor entries');
  for (const link of await page.locator('.library-materials > li > a, .library-support-list > li > a').all()) {
    const box = await link.boundingBox(); assert.ok(box && box.height >= 44 && box.width > 0, 'Library entries have usable targets');
    assert.equal(await link.locator(':scope > svg[aria-hidden="true"]').count(), 1, 'Every row retains its decorative destination arrow');
    if (await link.locator('h3').count()) assert.ok((await link.locator('p').innerText()).trim().length > 10, 'Main material descriptions remain informative');
  }
  const layout = await page.locator('.library-grid').evaluate(grid => ({ columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length, groups: [...grid.children].map(element => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width }; }) }));
  assert.equal(layout.columns, expectedColumns, 'Two desktop columns and one tablet/mobile column');
  const boxes = layout.groups;
  if (expectedColumns === 2) { assert.ok(Math.abs(boxes[0].top - boxes[1].top) < 1 && Math.abs(boxes[2].top - boxes[3].top) < 1); assert.ok(boxes[0].right <= boxes[1].left && boxes[2].right <= boxes[3].left); assert.ok(Math.abs(boxes[0].left - boxes[2].left) < 1 && Math.abs(boxes[1].left - boxes[3].left) < 1); assert.ok(Math.max(boxes[0].bottom, boxes[1].bottom) <= boxes[2].top + 1); }
  else for (let n = 1; n < boxes.length; n++) assert.ok(Math.abs(boxes[n].left - boxes[0].left) < 1 && Math.abs(boxes[n].right - boxes[0].right) < 1 && boxes[n].top >= boxes[n - 1].bottom - 1, 'Single-column groups align without overlap');
  await noOverflow(page); return layout;
}
async function nativeAnchors(page, width, theme) {
  for (let n = 0; n < expectedGroups.length; n++) {
    const group = expectedGroups[n], target = '#library-' + group.id;
    const link = page.locator('.library-jump-links a').nth(n); await link.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(target => location.hash === target && document.activeElement === document.querySelector(target), target);
    const position = await page.locator(target).evaluate(element => { const r = element.getBoundingClientRect(), header = document.querySelector('.topbar'); return { top: r.top, bottom: r.bottom, obstruction: getComputedStyle(header).position === 'sticky' ? header.getBoundingClientRect().bottom : 0 }; });
    assert.ok(position.top >= position.obstruction - 1 && position.top < page.viewportSize().height, 'Native category heading focus is visible below the header');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(`[data-library-group="${group.id}"] .library-materials > li > a`).first().evaluate(element => element === document.activeElement), true, 'Next Tab reaches the selected category materials');
    report.anchorChecks.push({ width, theme, target, ...position });
  }
}
try {
  const expectedSupport = specifications.flatMap(([, , entries]) => entries.filter(([, , support]) => support).map(([source]) => source)).sort();
  assert.deepEqual(libraryGroups.flatMap(group => group.entries.filter(entry => entry.support === true).map(entry => entry.source)).sort(), expectedSupport, 'Exactly six reviewed resources have support metadata');
  assert.deepEqual(retiredDocuments.map(item => item.source).sort(), [...retiredSources].sort(), 'The retirement policy names only the three owner-approved documents');
  for (const item of retired) { assert.ok(isRetiredSource(item.source)); assert.ok(isRetiredUrl(item.url + '#saved')); assert.equal(manifest.some(doc => doc.sourcePath === item.source || doc.canonicalUrl === item.url), false); }
  assert.equal(isRetiredSource('interview/checklist.md.other'), false); assert.equal(isRetiredUrl(readerRoute), false); assert.equal(isRetiredUrl('/cases/index.html'), false);
  if (baseline) assert.equal(manifest.length, baseline.documents - 3, 'Release keeps all documents except exactly three retired pages');
  const htmlFiles = [];
  async function walk(directory) { for (const entry of await fs.readdir(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); if (entry.isDirectory()) await walk(file); else if (file.endsWith('.html')) htmlFiles.push(file); } }
  await walk(path.join(root, 'dist'));
  let externalCaseEntries = 0;
  for (const file of htmlFiles) {
    const html = await fs.readFile(file, 'utf8'), relative = '/' + path.relative(path.join(root, 'dist'), file);
    for (const item of retired) { assert.equal(html.includes(item.url), false, 'No generated old URL: ' + relative); assert.equal(normalize(html.replace(/<[^>]*>/g, ' ')).includes(normalize(item.title)), false, 'No generated retired title: ' + relative); }
    for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
      const destination = new URL(match[1].replaceAll('&amp;', '&'), base + relative).pathname;
      assert.equal(retiredUrls.has(destination), false);
      if (destination.startsWith('/cases/') && !relative.startsWith('/cases/')) { assert.equal(relative, library, 'Only Library points into standalone cases'); assert.equal(destination, '/cases/index.html'); externalCaseEntries++; }
    }
  }
  assert.equal(externalCaseEntries, 1, 'Exactly one FSI entry across all generated pages outside the collection');
  const indexed = normalize(index.map(item => `${item.title} ${item.description} ${item.text}`).join(' '));
  for (const row of index) { assert.equal(retiredUrls.has(new URL(row.url, base).pathname), false); assert.equal(retired.some(item => row.contentId === item.source.replace(/\.md$/, '')), false); assert.equal(new URL(row.url, base).pathname.startsWith('/cases/'), false); const doc = manifest.find(item => item.canonicalUrl === new URL(row.url, base).pathname); assert.ok(doc && doc.search && !doc.standalone && doc.audience === 'student'); }
  for (const item of retired) assert.equal(indexed.includes(normalize(item.title)), false, 'Retired title/snippet absent from global index');
  if (baseline) for (const fragments of Object.values(baseline.retiredFragments)) for (const fragment of fragments) assert.equal(indexed.includes(fragment), false, 'Unique retired excerpt is not reindexed elsewhere');
  const status = await profile();
  for (const item of retired) { assert.equal((await status.page.request.get(base + item.url)).status(), 404, 'Retired direct URL returns real 404'); assert.equal(await fs.access(path.join(root, 'dist', item.url)).then(() => true).catch(() => false), false); assert.equal(await fs.access(path.join(root, item.source)).then(() => true).catch(() => false), false); }
  for (const group of expectedGroups) for (const entry of group.entries) assert.equal((await status.page.request.get(base + entry.url)).status(), 200, 'Reviewed library destination works: ' + entry.url);
  for (const doc of manifest.filter(item => item.canonicalUrl.startsWith('/cases/'))) { assert.equal(doc.standalone, true); assert.equal(doc.progress, false); assert.equal(doc.search, false); assert.equal((await status.page.request.get(base + doc.canonicalUrl)).status(), 200); }
  await close(status.ctx);
  report.checks.push('Central three-page lifecycle, actual 404s, complete HTML/navigation/title/snippet scan, working targets and one isolated FSI entry');

  for (const width of [390, 768, 1440]) for (const theme of ['light', 'dark']) {
    const state = await profile({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme }); const page = state.page;
    await visit(page); const layout = await assertLibrary(page); assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    await save(page, `library-${width}-${theme}`, true); report.matrix.push({ width, theme, columns: layout.columns, groups: expectedGroups.map(group => ({ id: group.id, entries: group.entries.length })) });
    await nativeAnchors(page, width, theme);
    if (width === 390 && theme === 'light') {
      // Start the full sequential walk on a fresh fragment-free page; the
      // independent anchor checks above intentionally finish in the last group.
      await visit(page);
      const links = page.locator('.library-materials > li > a, .library-support-list > li > a'); await links.first().scrollIntoViewIfNeeded(); await links.first().focus();
      for (let n = 1; n < await links.count(); n++) { await page.keyboard.press('Tab'); assert.equal(await links.nth(n).evaluate(element => element === document.activeElement), true, 'Library keyboard order'); const focused = await links.nth(n).evaluate(element => { const r = element.getBoundingClientRect(), style = getComputedStyle(element); return { top: r.top, bottom: r.bottom, outline: style.outlineStyle, width: parseFloat(style.outlineWidth) }; }); assert.ok(focused.top >= 0 && focused.top < 844 && focused.bottom > 65 && focused.outline !== 'none' && focused.width >= 2, 'Focused entry is visible with an outline'); }
      await save(page, 'library-keyboard-390'); await page.keyboard.press('Enter'); await page.waitForURL(base + expectedGroups.at(-1).entries.at(-1).url);
    }
    let normalWidth;
    for (const focus of [false, true]) {
      await visit(page, readerRoute + '#sessao'); if (focus) { await page.locator('#focus-toggle').click(); await visit(page, readerRoute + '#sessao'); }
      await page.waitForFunction(() => { const element = document.getElementById('sessao'), header = document.querySelector('.topbar'); const top = element.getBoundingClientRect().top; return top >= header.getBoundingClientRect().bottom - 1 && top < innerHeight; });
      assert.equal(await page.locator('body').evaluate(body => body.classList.contains('focus-mode')), focus);
      const measure = await page.locator('.prose').evaluate(element => ({ width: element.getBoundingClientRect().width, fontSize: parseFloat(getComputedStyle(element).fontSize) })); assert.ok(measure.fontSize >= 18);
      if (!focus) normalWidth = measure.width; else if (width === 1440) { assert.ok(measure.width > normalWidth); assert.ok(measure.width <= 1153); }
      await noOverflow(page); report.readerStates.push({ width, theme, focus, ...measure });
      if (focus && ((width === 390 && theme === 'light') || (width === 1440 && theme === 'dark'))) await save(page, `reader-${width}-${theme}-focus`);
    }
    await close(state.ctx);
  }
  for (const width of [320, 820, 1023, 1024, 1025]) for (const theme of ['light', 'dark']) {
    const state = await profile({ viewport: { width, height: 1000 }, colorScheme: theme }); await visit(state.page); const layout = await assertLibrary(state.page); report.breakpoints.push({ width, theme, columns: layout.columns }); await close(state.ctx);
  }
  const enlarged = await profile(); await visit(enlarged.page); await enlarged.page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const enlargedLayout = await assertLibrary(enlarged.page, 1); await nativeAnchors(enlarged.page, 1440, 'light-root-font-200'); report.enlargedText = { width: 1440, rootFontPercent: 200, columns: enlargedLayout.columns, actualBrowserZoom: false }; await close(enlarged.ctx);
  report.checks.push('Six paired light/dark screenshots, 320/820/1023/1024/1025 layout boundaries, native anchor focus/keyboard and 200% root-font reflow; twelve reader/focus checks remain');

  const retiredRecords = Object.fromEntries(retired.map(item => [item.source.replace(/\.md$/, ''), { marked: true, origin: 'manual', markedAt: '2020-01-01T00:00:00Z' }]));
  const planFixture = { 'redes-adassa': false, logistica: true, 'unknown-fixture-task': true };
  for (const item of retired) {
    const state = await profile({ viewport: { width: 390, height: 844 } });
    const fixture = { schemaVersion: 2, reading: { ...retiredRecords, [foundation.id]: { marked: true, origin: 'manual' } }, resume: { student: { contentId: item.source.replace(/\.md$/, ''), anchor: 'previous-saved-section', contentVersion: 'synthetic-old-version' } }, libraryFixture: 'preserve extension data' };
    await state.ctx.addInitScript(({ fixture, planFixture }) => { if (sessionStorage.getItem('library-fixture-installed')) return; localStorage.setItem('architecture-practice:study:v2', JSON.stringify(fixture)); localStorage.setItem('architecture-practice:plan:v1', JSON.stringify(planFixture)); sessionStorage.setItem('library-fixture-installed', 'yes'); }, { fixture, planFixture });
    for (const url of [library, '/meu-estudo/index.html', '/index.html']) { await visit(state.page, url); assert.deepEqual(await state.page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2'))), fixture, 'Hubs preserve retired read/resume data rather than deleting or migrating it'); assert.equal(await state.page.locator('a[href="' + item.url + '"]').count(), 0); }
    await visit(state.page, '/meu-estudo/index.html'); await state.page.waitForFunction(() => !document.querySelector('.study-history').textContent.includes('Ative JavaScript'));
    assert.equal(await state.page.locator('.resume-study').isVisible(), false, 'Unavailable retired resume is not recommended'); assert.equal(await state.page.locator('.study-history .history-row').count(), 1, 'Only the legitimate marked lesson enters principal history');
    if (await state.page.locator('#read-count').count()) assert.equal(await state.page.locator('#read-count').innerText(), '1');
    const plan = state.page.locator('[data-plan]');
    if (await plan.count()) {
      const ids = await plan.locator('[data-plan-task]').evaluateAll(elements => elements.map(element => element.dataset.planTask)); if (beforeUI) assert.deepEqual(ids, beforeUI.planTaskIds, 'All twenty saved task identities are preserved');
      assert.equal(await plan.locator('[data-plan-task="redes-adassa"]').isChecked(), false); assert.equal(await plan.locator('[data-plan-task="logistica"]').isChecked(), true);
      assert.deepEqual(await state.page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:plan:v1'))), planFixture);
      await plan.locator('[data-plan-task="logistica"]').uncheck(); await state.page.reload(); assert.equal(await plan.locator('[data-plan-task="logistica"]').isChecked(), false); assert.equal(await state.page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:plan:v1'))['unknown-fixture-task']), true);
      if (item === retired[0]) await save(state.page, 'my-study-retired-fixture-390');
    } else assert.equal(Boolean(baseline), false, 'The published study plan must remain in the release');
    await close(state.ctx);
  }
  report.checks.push('Three retired-resume fixtures retain all reading records, versions and extension data while disappearing from recommendations; existing plan IDs/checks persist');

  const search = await profile(); await visit(search.page); await search.page.locator('[data-search-open]').click();
  for (const query of ['atomicidade', ...retired.map(item => item.title)]) { await search.page.locator('#search-input').fill(query); await search.page.waitForFunction(() => ['results', 'empty'].includes(document.querySelector('.search-status').dataset.state)); const paths = await search.page.locator('.search-result').evaluateAll(elements => elements.map(element => element.pathname)); assert.ok(paths.every(url => !retiredUrls.has(url) && !url.startsWith('/cases/'))); if (query === 'atomicidade') assert.ok(paths.length > 0, 'Unrelated global search still works'); }
  await save(search.page, 'global-search-retired'); await search.page.keyboard.press('Escape'); await visit(search.page, '/index.html'); assert.equal(await search.page.locator('.track-card').count(), hasLoop ? 6 : 5); if (hasLoop) assert.equal(await search.page.locator('.track-card-focus').count(), 1); await save(search.page, 'home-preserved', true); await close(search.ctx);
  const noJS = await profile({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false }); assert.equal((await noJS.page.goto(base + library)).status(), 200); await assertLibrary(noJS.page); await noOverflow(noJS.page); await save(noJS.page, 'library-no-js-390', true, false); await close(noJS.ctx);
  report.checks.push('Global search still works without retired/FSI results; approved home and static library links remain accessible');

  if (baseline) {
    const changedSources = new Set(['README.md', 'interview/interview-process.md', 'interview/simulations/01-behavioral/mock-script.md']);
    const changedRuntime = new Set(['site/content.mjs', 'site/content-policy.mjs', 'site/case-reference-policy.mjs', 'site/templates.mjs', 'site/site.css', 'scripts/build-site.mjs', 'scripts/check-site.mjs']);
    assert.deepEqual(manifest.map(doc => doc.sourcePath).sort(), Object.keys(baseline.sourceHashes).filter(source => !retiredSources.has(source)).sort(), 'Only the approved three documents leave publication');
    for (const [source, expected] of Object.entries(baseline.sourceHashes)) { if (retiredSources.has(source)) continue; const text = await fs.readFile(path.join(root, source), 'utf8'); for (const item of retired) assert.equal(text.includes(path.basename(item.source)), false, 'Remaining Markdown has no retired destination: ' + source); if (!changedSources.has(source)) assert.equal(digest(text), expected, 'Unrelated Markdown remains byte-identical: ' + source); }
    for (const [file, expected] of Object.entries(baseline.runtimeHashes)) if (!changedRuntime.has(file)) assert.equal(await hashFile(file), expected, 'Runtime, storage schema, plan, CSP, dependencies and helper preserved: ' + file);
    for (const [url, entry] of Object.entries(baseline.routes)) { if (retiredUrls.has(url)) continue; const html = await fs.readFile(path.join(root, 'dist', url), 'utf8'); for (const id of entry.ids) assert.ok(html.includes(`id="${id}"`), 'Unrelated URL/anchor remains: ' + url + '#' + id); }
    for (const [url, entry] of Object.entries(baseline.cases)) { assert.equal(await hashFile(entry.sourcePath), entry.sourceSha256, 'Original case Markdown preserved'); const html = await fs.readFile(path.join(root, 'dist', url), 'utf8'); const article = html.match(/<article class="prose">([\s\S]*?)<\/article>/)?.[1]; assert.equal(digest(article), entry.articleSha256, 'Every original case article remains byte-identical'); }
    assert.equal(await hashFile('assets/amazon.jpg'), baseline.cover.sha256); assert.equal(await hashFile('dist/assets/amazon.jpg'), baseline.cover.sha256);
    assert.equal(await hashFile('dist/index.html'), baseline.generated['index.html'], 'Approved production home stays byte-identical');
    const indexPath = path.isAbsolute(baseline.gitIndex.path) ? baseline.gitIndex.path : path.join(root, baseline.gitIndex.path); assert.equal(digest(await fs.readFile(indexPath)), baseline.gitIndex.sha256, 'The real Git index stays unchanged');
    report.checks.push('Exact source/runtime allowlist; preserved non-retired URLs/anchors, all ten case articles, production LPs/home/plan/capa/CSP and real Git index');
  }
  if (layoutBaseline) {
    assert.equal(manifest.length, layoutBaseline.documents, 'The block refinement does not add or remove content');
    assert.deepEqual(manifest, layoutBaseline.manifest, 'All document identities, audience, progress and search metadata stay unchanged');
    for (const [file, expected] of Object.entries(layoutBaseline.sourceHashes)) assert.equal(await hashFile(file), expected, 'Every Markdown remains byte-identical: ' + file);
    const allowedSourceChanges = new Set(['site/content.mjs', 'site/templates.mjs', 'site/site.css', 'scripts/check-library-browser.mjs']);
    for (const [file, expected] of Object.entries(layoutBaseline.runtimeHashes)) if (!allowedSourceChanges.has(file)) assert.equal(await hashFile(file), expected, 'Unrelated runtime/tooling/CSP stays byte-identical: ' + file);
    const files = [];
    async function allFiles(directory) { for (const entry of await fs.readdir(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); if (entry.isDirectory()) await allFiles(file); else files.push(path.relative(path.join(root, 'dist'), file)); } }
    await allFiles(path.join(root, 'dist'));
    assert.deepEqual(files.sort(), Object.keys(layoutBaseline.generatedHashes).sort(), 'No generated resource is added or removed');
    const allowedOutputs = new Set(['biblioteca/index.html', 'assets/site.css']);
    report.changedOutputs = [];
    for (const [file, expected] of Object.entries(layoutBaseline.generatedHashes)) { const actual = await hashFile(path.join('dist', file)); if (actual !== expected) { assert.ok(allowedOutputs.has(file), 'Only Library HTML and CSS may change: ' + file); report.changedOutputs.push(file); } }
    assert.deepEqual(report.changedOutputs.sort(), [...allowedOutputs].sort());
    const indexPath = path.isAbsolute(layoutBaseline.gitIndex.path) ? layoutBaseline.gitIndex.path : path.join(root, layoutBaseline.gitIndex.path);
    const indexHash = layoutBaseline.gitIndex.sha256 || layoutBaseline.gitIndex.hash;
    assert.ok(indexHash); assert.equal(digest(await fs.readFile(indexPath)), indexHash, 'The real Git index stays unchanged');
    report.checks.push('New block baseline: every Markdown, manifest/search, cover and all outputs except Library HTML/CSS retain their exact hashes');
  }
  assert.deepEqual(report.errors, [], 'No console/network/CSP failures'); assert.deepEqual([...requestedOrigins], [new URL(base).origin], 'No new external request origin');
  await fs.writeFile(path.join(output, 'blocks-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Library blocks PASS: ${manifest.length} documents, ${report.matrix.length} paired states, ${report.breakpoints.length} boundary states, ${report.anchorChecks.length} anchor checks, ${report.readerStates.length} reader states, ${report.screenshots.length} captures. ${base}`);
} finally { for (const ctx of contexts) await ctx.close(); await browser.close(); }
