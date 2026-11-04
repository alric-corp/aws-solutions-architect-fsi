import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { checkAcidBrowser } from './check-acid-browser.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:4173';
let executablePath = process.env.CHROMIUM_PATH;
if (!executablePath) {
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  const versions = (await fs.readdir(cache).catch(() => [])).filter(name => name.startsWith('chromium_headless_shell-')).sort().reverse();
  for (const version of versions) {
    const candidate = path.join(cache, version, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
    if (await fs.access(candidate).then(() => true).catch(() => false)) { executablePath = candidate; break; }
  }
}
if (!executablePath) throw new Error('Defina CHROMIUM_PATH com o caminho de um Chromium instalado.');
const browser = await chromium.launch({ executablePath, headless: true });
const failures = [];
const screenshotDir = path.join(root, '.site/cases-isolation/after');
await fs.mkdir(screenshotDir, { recursive: true });
const manifest = JSON.parse(await fs.readFile(path.join(root, 'dist/content-manifest.json'), 'utf8'));
const report = { base, browser: 'Chromium', documents: 0, diagrams: 0, diagramPages: 0, widths: [], queries: {}, checks: [] };
report.browserVersion = await browser.version();
report.queryCountMeaning = 'Resultados exibidos no diálogo; máximo de 30 por consulta.';
report.limits = ['Verificação local em Chromium; Safari não executado.', 'Contraste medido nos pares de tokens indicados, sem declaração de conformidade WCAG integral.', 'Capturas e verificações locais não representam publicação nem avaliação pedagógica com pessoas.'];
report.contrast = [];
const routes = {
  home: '/index.html',
  library: '/biblioteca/index.html',
  collection: '/cases/index.html',
  lesson: '/technical-knowledge/02-system-design/ecommerce/01-from-click-to-catalog.html',
  foundation: '/technical-knowledge/01-fundamentals/06-databases-transactions-consistency.html',
  case: '/cases/01-payment-processing-pix.html',
  candidate: '/interview/simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/candidato.html',
  instructor: '/interview/simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/instrutor.html',
  topic: '/temas/transacoes-idempotencia.html'
};
function monitor(page) {
  page.on('pageerror', error => failures.push(`${page.url()}: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') failures.push(`${page.url()}: ${message.text()}`); });
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failures.push(`${request.url()}: ${request.failure()?.errorText}`); });
}
async function diagramsReady(page) {
  await page.waitForFunction(() => [...document.querySelectorAll('.mermaid')].every(element => element.querySelector('svg') || element.classList.contains('diagram-failed')), undefined, { timeout: 90000 });
  const broken = await page.locator('.diagram-failed').allTextContents();
  assert.deepEqual(broken, [], `Diagrama inválido: ${page.url()}\n${failures.join('\n')}`);
}
// The theme control keeps one DOM identity and moves into the global panel
// at compact widths. Open that panel rather than interacting with a hidden field.
async function selectTheme(page, value) {
  const compact = !await page.locator('#theme-preference').isVisible();
  if (compact) await page.locator('#global-menu-toggle').click();
  await page.locator('#theme-preference').selectOption(value);
  if (compact) await page.locator('[data-global-menu-close]').click();
}
async function noOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `Overflow horizontal: ${page.url()}`);
}
async function visit(page, url, diagrams = true) {
  assert.equal((await page.goto(base + url)).status(), 200, `Rota não servida: ${url}`);
  await page.evaluate(() => document.fonts.ready);
  if (diagrams) await diagramsReady(page);
}
async function tocAvailable(page) {
  const toc = page.locator('#page-toc');
  assert.equal(await toc.count(), 1, 'Sumário único');
  assert.equal(await toc.locator('summary').isVisible(), true, `Sumário disponível: ${page.viewportSize().width}`);
  if (!await toc.evaluate(element => element.open)) await toc.locator('summary').click();
  const headings = await page.locator('.prose h2[id], .prose h3[id]').evaluateAll(elements => elements.map(element => element.id));
  const links = await toc.locator('a[href^="#"]').evaluateAll(elements => elements.map(element => decodeURIComponent(element.hash.slice(1))));
  for (const id of headings) assert.ok(links.includes(id), `Seção H2/H3 ausente do sumário: ${id}`);
  if (headings.length) assert.equal(await toc.locator('nav a').first().isVisible(), true);
}
async function search(page, query, requireResult = true) {
  if (!await page.locator('.search-dialog').evaluate(element => element.open)) await page.locator('[data-search-open]').filter({ visible: true }).first().click();
  await page.locator('#search-input').fill(query);
  await page.waitForFunction(() => !document.querySelector('.search-status').textContent.includes('Buscando'));
  const count = await page.locator('.search-result').count();
  if (requireResult) assert.ok(count > 0, `Sem resultados para ${query}`);
  else if (!count) assert.match(await page.locator('.search-status').innerText(), /Nenhum resultado/, 'Estado vazio explícito');
  return count;
}
async function save(page, name, fullPage = false) { await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage }); }
async function contrast(page) {
  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(['ink', 'surface', 'muted', 'link', 'header', 'header-ink', 'action', 'action-ink'].map(name => [name, style.getPropertyValue(`--${name}`).trim()]));
  });
  const luminance = value => {
    const channels = value.replace('#', '').match(/.{2}/g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const pairs = [['ink', 'surface'], ['muted', 'surface'], ['link', 'surface'], ['header-ink', 'header'], ['action-ink', 'action']];
  const ratios = pairs.map(([foreground, background]) => {
    const a = luminance(tokens[foreground]), b = luminance(tokens[background]);
    const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    assert.ok(ratio >= 4.5, `Contraste insuficiente em ${foreground}/${background}: ${ratio}`);
    return { pair: `${foreground}/${background}`, ratio: Number(ratio.toFixed(2)) };
  });
  report.contrast.push({ theme: await page.locator('html').getAttribute('data-theme'), ratios });
}
async function assertAnchor(page, id) {
  const top = await page.locator(`[id="${id}"]`).evaluate(element => element.getBoundingClientRect().top);
  assert.ok(top >= 0 && top < 230, `Âncora encoberta ou fora do topo: ${id}: ${top}`);
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 }, reducedMotion: 'reduce', colorScheme: 'light', permissions: ['clipboard-read', 'clipboard-write'] });
  // A deliberately irrelevant fixture proves that STAR cannot match only estar.
  await context.route('**/search-index.json', async route => {
    const response = await route.fetch();
    const index = await response.json();
    await route.fulfill({ response, json: [...index, { title: 'Falso positivo: estar disponível', url: routes.lesson, section: 'Fixture de regressão', description: 'Pode estar aqui.', text: 'Uma pessoa pode estar disponível para estudar.' }] });
  });
  const page = await context.newPage();
  monitor(page);
  await visit(page, routes.home);
  const cover = page.locator('img[src*="amazon"]');
  assert.equal(await cover.count(), 1, 'Capa real na home');
  assert.ok(await cover.evaluate(element => element.naturalWidth > 0));
  assert.ok(await cover.evaluate(element => Math.abs(element.width / element.height - element.naturalWidth / element.naturalHeight) < .02), 'Proporção da capa preservada');
  for (const label of ['Início', 'Trilhas', 'Biblioteca', 'Praticar', 'Meu estudo']) assert.ok(await page.locator('.topbar').getByRole('link', { name: label, exact: true }).count(), `Navegação global: ${label}`);
  assert.ok(await page.locator('.track-card').count() >= 1, 'Percursos acessíveis na home');
  await noOverflow(page);
  await save(page, 'home', true);
  assert.equal(await page.locator('#theme-preference').inputValue(), 'system');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.keyboard.press('ControlOrMeta+k');
  for (const query of ['STAR', 'idempotência', 'idempotencia', 'retry', 'retentativa', 'retentativas', 'TLS', 'RTO', 'Multi-AZ', 'checkout lento']) {
    // These words currently occur only in optional cases in the source corpus.
    // Their empty global state is valid; the pure matcher fixture still checks
    // the grammatical inflection independently of collection membership.
    report.queries[query] = await search(page, query, !['retentativa', 'retentativas'].includes(query));
    const resultTexts = await page.locator('.search-result').allTextContents();
    assert.ok(!resultTexts.some(value => value.includes('Falso positivo: estar')), 'STAR não corresponde a estar');
    const resultUrls = await page.locator('.search-result').evaluateAll(links => links.map(link => link.getAttribute('href')));
    for (const url of resultUrls) {
      const item = manifest.find(item => item.canonicalUrl === url.split('#')[0]);
      assert.ok(item?.search && item.audience === 'student' && !item.standalone && item.collection !== 'fsi-cases', `Instrutor e cases fora da busca global: ${url}`);
    }
    if (query === 'STAR') await save(page, 'search-star');
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.search-dialog').evaluate(element => element.open), false);
  report.checks.push('Busca: termos, acentos, siglas, STAR/estar e exclusão de instrutor/cases');

  // The old real lesson checks remain: Markdown disclosure, self-hosted SVG,
  // persistent manual reading, code and Mermaid, independent of new home copy.
  await visit(page, routes.lesson);
  assert.match(await page.locator('h1').innerText(), /Você clicou/);
  const answer = page.locator('.prose details:not(.diagram-source)').first();
  await answer.locator('summary').click();
  assert.equal(await answer.evaluate(element => element.open), true);
  assert.ok(await answer.locator('p').count() > 0, 'Resposta Markdown renderizada');
  const architecture = page.locator('img[src$="01-catalog-aws.svg"]');
  await architecture.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('img[src$="01-catalog-aws.svg"]').naturalWidth > 0);
  await noOverflow(page);
  await page.locator('.read-toggle').click();
  assert.equal(await page.locator('.read-toggle').getAttribute('aria-pressed'), 'true');
  await page.reload();
  assert.equal(await page.locator('.read-toggle').getAttribute('aria-pressed'), 'true');
  await diagramsReady(page);
  const code = page.locator('.prose .code-block').first();
  const codeText = await code.locator('code').innerText();
  await code.locator('.copy-code').click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), codeText);
  assert.match((await page.locator('[role="status"]').allTextContents()).join(' ') + await code.innerText(), /copiad/i, 'Feedback acessível de cópia');
  const headingLink = page.locator('.heading-link').first();
  await headingLink.click();
  assert.ok((await page.evaluate(() => navigator.clipboard.readText())).endsWith('#' + encodeURIComponent(await headingLink.getAttribute('data-heading-id'))), 'Link do título copiável');
  const expand = page.locator('.diagram .diagram-expand').first();
  await expand.click();
  assert.equal(await page.locator('#diagram-dialog').evaluate(element => element.open), true);
  await page.locator('[data-diagram-zoom="in"]').click();
  await page.locator('[data-diagram-zoom="out"]').click();
  await page.locator('[data-diagram-zoom="fit"]').click();
  await save(page, 'diagram-expanded');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#diagram-dialog').evaluate(element => element.open), false);
  assert.equal(await expand.evaluate(element => element === document.activeElement), true, 'Foco devolvido ao botão de ampliação');
  const svgExpand = page.locator('.diagram-image .diagram-expand').first();
  await svgExpand.click();
  assert.equal(await page.locator('#diagram-dialog .diagram-stage img').count(), 1, 'SVG exportado ampliado sem conversão ou inversão');
  await page.keyboard.press('Escape');
  assert.equal(await svgExpand.evaluate(element => element === document.activeElement), true, 'Foco devolvido após SVG ampliado');
  report.checks.push('Markdown, respostas, SVG, cópia de código/título, ampliação por teclado e leitura persistida');

  // Every public document still loads the shared template, not only the pilot.
  for (const item of manifest) {
    await visit(page, item.canonicalUrl);
    assert.ok(await page.locator('.prose').count() === 1, `Leitor real: ${item.canonicalUrl}`);
    await tocAvailable(page);
    await noOverflow(page);
    assert.ok(await page.locator('#navigation a').count() < manifest.length, 'Lateral contextual, sem o acervo inteiro');
    const diagrams = await page.locator('.mermaid svg').count();
    report.diagrams += diagrams;
    if (diagrams) report.diagramPages++;
    report.documents++;
  }
  report.checks.push('Template, sumário H2/H3 e diagramas no acervo completo');

  await visit(page, routes.foundation);
  await contrast(page);
  await save(page, 'reader-f06');
  await visit(page, routes.case);
  await save(page, 'case-payments');
  await selectTheme(page, 'dark');
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await diagramsReady(page);
  await contrast(page);
  await save(page, 'case-payments-dark');
  await page.reload();
  assert.equal(await page.locator('#theme-preference').inputValue(), 'dark');
  await diagramsReady(page);
  await selectTheme(page, 'system');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await diagramsReady(page);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await page.locator('[data-text-size="increase"]').click();
  assert.ok(await page.locator('.prose').evaluate(element => parseFloat(getComputedStyle(element).fontSize) > 18));
  await page.reload();
  assert.ok(await page.locator('.prose').evaluate(element => parseFloat(getComputedStyle(element).fontSize) > 18));
  await page.locator('#focus-toggle').click();
  assert.equal(await page.locator('#focus-toggle').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('body').evaluate(element => element.classList.contains('focus-mode')), true);
  await visit(page, routes.home);
  assert.equal(await page.locator('body').evaluate(element => element.classList.contains('focus-mode')), false, 'Home não herda foco sem controle para sair');
  assert.equal(await page.locator('.global-nav').isVisible(), true, 'Navegação global disponível ao retornar de modo foco');
  await visit(page, routes.case);
  assert.equal(await page.locator('#focus-toggle').getAttribute('aria-pressed'), 'true', 'Modo foco de leitura preservado ao reabrir leitor');
  assert.equal(await page.locator('#focus-toggle').isVisible(), true, 'Controle para sair do foco permanece disponível');
  await page.locator('#focus-toggle').click();
  await noOverflow(page);
  report.checks.push('Claro, escuro, sistema, persistência de preferência, texto ampliado e foco');

  // Explicit fragment wins even after all diagrams have finished rendering.
  const foundation = manifest.find(item => item.canonicalUrl === routes.foundation);
  await page.evaluate(({ foundation }) => {
    const key = 'architecture-practice:study:v2';
    const state = JSON.parse(localStorage.getItem(key)) || { schemaVersion: 2, reading: {}, resume: {} };
    state.resume ||= {};
    state.resume.student = { contentId: foundation.id, anchor: 'base-pacelc', contentVersion: foundation.contentVersion };
    localStorage.setItem(key, JSON.stringify(state));
  }, { foundation });
  await visit(page, routes.foundation + '#idempotencia-concorrencia');
  await assertAnchor(page, 'idempotencia-concorrencia');
  await page.reload();
  await diagramsReady(page);
  await assertAnchor(page, 'idempotencia-concorrencia');
  await visit(page, '/meu-estudo/index.html');
  const resumeHref = await page.locator('#resume-link').getAttribute('href');
  assert.ok(resumeHref.includes(routes.foundation) && resumeHref.includes('#idempotencia-concorrencia'), `Retomada por seção: ${resumeHref}`);
  await visit(page, routes.instructor);
  await visit(page, '/meu-estudo/index.html');
  const afterInstructor = await page.locator('#resume-link').getAttribute('href');
  assert.ok(!afterInstructor.includes('instrutor'), 'Histórico de instrutor separado');
  report.checks.push('Prioridade de hash explícito, refresh, contentId/âncora/versão e histórico de instrutor separado');

  // Pilot is traversed through real links, including a return to the exact section.
  await visit(page, routes.home);
  await page.locator(`a[href="${routes.topic}"]`).first().click();
  await page.locator(`a[href="${routes.foundation}#idempotencia-concorrencia"]`).first().click();
  await diagramsReady(page);
  await assertAnchor(page, 'idempotencia-concorrencia');
  await page.locator(`a[href="${routes.candidate}"]`).first().click();
  assert.equal(await page.locator('a[href*="instrutor.html"]').count(), 0, 'Candidata sem atalho acidental ao gabarito');
  await save(page, 'candidate');
  await page.locator(`a[href="${routes.foundation}#idempotencia-concorrencia"]`).first().click();
  await diagramsReady(page);
  await assertAnchor(page, 'idempotencia-concorrencia');
  report.checks.push('Percurso principal: início → tema → F06 → candidata → seção estudada, sem cases');

  for (const width of [320, 390, 820, 1440, 1920]) {
    const viewport = { width, height: 1000 };
    await page.setViewportSize(viewport);
    await visit(page, routes.foundation);
    await tocAvailable(page);
    await noOverflow(page);
    await selectTheme(page, 'dark');
    await diagramsReady(page);
    await noOverflow(page);
    await save(page, `reader-${width}-dark`);
    await selectTheme(page, 'light');
    await diagramsReady(page);
    await save(page, `reader-${width}`);
    await visit(page, routes.home);
    await noOverflow(page);
    if (width <= 390) {
      const coverY = await page.locator('img[src*="amazon"]').evaluate(element => element.getBoundingClientRect().top);
      const mainAction = page.locator('.hero a').first();
      assert.ok(await mainAction.evaluate(element => element.getBoundingClientRect().bottom) <= coverY, 'Tarefa principal antes da capa no celular');
      await save(page, `home-${width}`, true);
    }
    report.widths.push(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, routes.lesson + '#cena');
  await assertAnchor(page, 'cena');
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#navigation').evaluate(element => element.inert), false);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const element = document.activeElement, rect = element.getBoundingClientRect(), style = getComputedStyle(element);
    return { top: rect.top, bottom: rect.bottom, outline: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  assert.ok(focus.top >= 0 && focus.bottom <= 844 && focus.outline !== 'none' && focus.width >= 2, 'Foco de teclado visível e não encoberto');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await noOverflow(page);
  await save(page, 'reader-390-200pct');
  report.checks.push('320/390/820/1440/1920, dois temas, teclado, zoom por texto e reflow');

  const legacy = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  await legacy.addInitScript(({ lesson, instructor, optionalCase }) => {
    if (localStorage.getItem('fixture-installed')) return;
    localStorage.setItem('architecture-practice:read:v1', JSON.stringify([lesson, instructor, optionalCase]));
    localStorage.setItem('architecture-practice:recent:v1', JSON.stringify({ url: instructor, title: 'Roteiro do instrutor' }));
    localStorage.setItem('fixture-installed', 'true');
  }, { lesson: routes.lesson, instructor: routes.instructor, optionalCase: routes.case });
  const migratedPage = await legacy.newPage();
  monitor(migratedPage);
  await visit(migratedPage, '/meu-estudo/index.html');
  const migrated = await migratedPage.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')));
  const lessonId = manifest.find(item => item.canonicalUrl === routes.lesson).id;
  const optionalCase = manifest.find(item => item.canonicalUrl === routes.case);
  assert.equal(migrated.reading[optionalCase.id].marked, true, 'Leitura legacy do case preservada');
  assert.equal(migrated.reading[optionalCase.id].origin, 'legacy', 'Origem legacy do case preservada');
  assert.equal(migrated.reading[lessonId].marked, true);
  assert.equal(migrated.reading[lessonId].origin, 'legacy');
  assert.ok(!('date' in migrated.reading[lessonId]) && !('markedAt' in migrated.reading[lessonId]), 'Migração não inventa datas');
  assert.equal(await migratedPage.locator('#read-count').innerText(), '1', 'Leitura de instrutor não entra no contador de estudante');
  assert.equal(await migratedPage.locator('.resume-study').isVisible(), false, 'Recente legacy de instrutor não contamina Continuar');
  await visit(migratedPage, '/meu-estudo/index.html');
  assert.match(await migratedPage.locator('main').innerText(), /leitura|lido/i);
  await migratedPage.evaluate(foundation => {
    const key = 'architecture-practice:study:v2', state = JSON.parse(localStorage.getItem(key));
    state.resume.student = { contentId: foundation.id, anchor: 'secao-antiga-removida', contentVersion: 'versao-antiga' };
    localStorage.setItem(key, JSON.stringify(state));
  }, foundation);
  await visit(migratedPage, routes.foundation);
  assert.match(await migratedPage.locator('.resume-notice').innerText(), /seção.*(mudou|disponível|encontrada)/i, 'Fallback de seção removida informado');
  // Write this fixture from a hub so the current reader's pagehide handler does
  // not legitimately replace it with its own reading position during navigation.
  await visit(migratedPage, '/meu-estudo/index.html');
  await migratedPage.evaluate(foundation => {
    const key = 'architecture-practice:study:v2', state = JSON.parse(localStorage.getItem(key));
    state.resume.student = { contentId: foundation.id, anchor: 'idempotencia-concorrencia', contentVersion: 'versao-antiga' };
    localStorage.setItem(key, JSON.stringify(state));
  }, foundation);
  await visit(migratedPage, routes.foundation);
  await assertAnchor(migratedPage, 'idempotencia-concorrencia');
  assert.match(await migratedPage.locator('.resume-notice').innerText(), /atualizado/i, 'Versão alterada informada sem perder âncora válida');
  report.checks.push('Lidos legacy de módulos, instrutor e cases preservados, sem data inventada e com contador principal isolado');

  // Seed records from the previous published implementation. Opening a case
  // may add only its independent continuity entry; it must not move, delete or
  // rewrite the existing principal resume or case reading evidence.
  const isolated = await browser.newContext({ viewport: { width: 1440, height: 1080 }, reducedMotion: 'reduce', colorScheme: 'light' });
  const caseReading = { marked: true, origin: 'legacy', markedAt: '2026-10-30T12:00:00Z' };
  const principalResume = { contentId: foundation.id, anchor: 'idempotencia-concorrencia', contentVersion: foundation.contentVersion };
  await isolated.addInitScript(({ lessonId, caseId, caseReading, principalResume }) => {
    if (localStorage.getItem('isolation-fixture-installed')) return;
    localStorage.setItem('architecture-practice:study:v2', JSON.stringify({ schemaVersion: 2, reading: { [lessonId]: { marked: true, origin: 'manual' }, [caseId]: caseReading }, resume: { student: principalResume } }));
    localStorage.setItem('isolation-fixture-installed', 'true');
  }, { lessonId, caseId: optionalCase.id, caseReading, principalResume });
  const isolatedPage = await isolated.newPage(); monitor(isolatedPage);
  await visit(isolatedPage, routes.home);
  assert.equal(await isolatedPage.locator('a[href^="/cases/"]').count(), 0, 'Home sem ponto de entrada nem retomada de case');
  await visit(isolatedPage, '/meu-estudo/index.html');
  assert.equal(await isolatedPage.locator('#read-count').innerText(), '1', 'Contagem principal exclui case já marcado');
  const mainProgressMax = manifest.filter(item => item.progress === true && !item.standalone && item.audience === 'student').length;
  assert.equal(Number(await isolatedPage.locator('.progress-track').getAttribute('aria-valuemax')), mainProgressMax, 'Denominador principal exclui a coleção independente');
  assert.equal(await isolatedPage.locator('main a[href^="/cases/"]').count(), 0, 'Histórico principal sem cases');
  let stored = await isolatedPage.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')));
  assert.deepEqual(stored.reading[optionalCase.id], caseReading, 'Registro anterior do case preservado sem migração silenciosa');
  await visit(isolatedPage, routes.case + '#s08');
  await assertAnchor(isolatedPage, 's08');
  assert.equal(await isolatedPage.locator('.pilot-links').count(), 0, 'Case não recomenda continuação da jornada principal');
  assert.equal(await isolatedPage.locator('#navigation a').evaluateAll(links => links.every(link => new URL(link.href).pathname.startsWith('/cases/') || new URL(link.href).pathname === '/biblioteca/index.html')), true, 'Navegação contextual independente dos cases');
  stored = await isolatedPage.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')));
  assert.deepEqual(stored.resume.student, principalResume, 'Visitar case não substitui a retomada principal');
  assert.equal(stored.resume['fsi-cases'].contentId, optionalCase.id, 'Retomada do case separada por coleção');
  assert.deepEqual(stored.reading[optionalCase.id], caseReading, 'Visitar case mantém evidência de leitura anterior');
  await save(isolatedPage, 'case-desktop');
  const nextCaseLink = isolatedPage.locator('.article-pagination a[href^="/cases/"]').last();
  const nextCaseUrl = await nextCaseLink.getAttribute('href');
  await nextCaseLink.click();
  await diagramsReady(isolatedPage);
  assert.equal(new URL(isolatedPage.url()).pathname, nextCaseUrl, 'Navegação entre cases continua funcional');
  await visit(isolatedPage, routes.collection);
  assert.equal(await isolatedPage.locator('body').getAttribute('data-study-scope'), 'fsi-cases');
  assert.equal(await isolatedPage.locator('#read-count').innerText(), '1', 'Contagem independente mostra apenas o case marcado');
  assert.ok(await isolatedPage.locator('.study-history a[href^="/cases/"]').count() >= 1, 'Histórico de case disponível somente dentro da coleção');
  assert.equal(await isolatedPage.locator('.study-history a:not([href^="/cases/"])').count(), 0, 'Histórico independente não mistura leituras principais');
  await visit(isolatedPage, '/meu-estudo/index.html');
  assert.equal(await isolatedPage.locator('#read-count').innerText(), '1');
  assert.ok(!(await isolatedPage.locator('#resume-link').getAttribute('href')).startsWith('/cases/'));

  // A principal resume that already points to a case is left intact in storage,
  // but it is not offered as Continue in the main learner experience.
  await isolatedPage.evaluate(({ caseId, version }) => {
    const key = 'architecture-practice:study:v2', state = JSON.parse(localStorage.getItem(key));
    state.resume.student = { contentId: caseId, anchor: 's08', contentVersion: version };
    localStorage.setItem(key, JSON.stringify(state));
  }, { caseId: optionalCase.id, version: optionalCase.contentVersion });
  await visit(isolatedPage, '/meu-estudo/index.html');
  assert.equal(await isolatedPage.locator('.resume-study').isVisible(), false, 'Retomada antiga de case não reaparece em Meu estudo');
  stored = await isolatedPage.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')));
  assert.equal(stored.resume.student.contentId, optionalCase.id, 'Retomada antiga não é removida nem migrada silenciosamente');
  assert.deepEqual(stored.reading[optionalCase.id], caseReading, 'Registro do case permanece intacto após filtro de retomada');
  report.checks.push('Cases: progresso/retomada próprios, preservação de registros anteriores e ausência na jornada principal');

  await visit(isolatedPage, routes.library);
  assert.equal(await isolatedPage.locator('a[href^="/cases/"]').count(), 1, 'Biblioteca mantém uma única entrada explícita para a coleção');
  assert.equal(await isolatedPage.locator('a[href="/cases/index.html"]').count(), 1);
  await save(isolatedPage, 'library-desktop', true);
  await isolatedPage.setViewportSize({ width: 390, height: 844 });
  await visit(isolatedPage, routes.library);
  await noOverflow(isolatedPage);
  await save(isolatedPage, 'library-mobile', true);
  await isolatedPage.locator('a[href="/cases/index.html"]').click();
  await isolatedPage.locator(`a[href="${routes.case}"]`).first().click();
  await diagramsReady(isolatedPage);
  await noOverflow(isolatedPage);
  await tocAvailable(isolatedPage);
  // Collapse the small-screen TOC again for a representative reader capture.
  if (await isolatedPage.locator('#page-toc').evaluate(element => element.open)) await isolatedPage.locator('#page-toc summary').click();
  await isolatedPage.locator('.menu-toggle').click();
  assert.equal(await isolatedPage.locator('#navigation').evaluate(element => element.inert), false);
  assert.ok(await isolatedPage.locator('#navigation a[href^="/cases/"]').count() > 1);
  await isolatedPage.keyboard.press('Escape');
  const mobileDiagram = isolatedPage.locator('.diagram .diagram-expand').first();
  await mobileDiagram.click();
  assert.equal(await isolatedPage.locator('#diagram-dialog').evaluate(element => element.open), true);
  await isolatedPage.keyboard.press('Escape');
  assert.equal(await mobileDiagram.evaluate(element => element === document.activeElement), true);
  await isolatedPage.evaluate(() => scrollTo(0, 0));
  await save(isolatedPage, 'case-mobile');
  report.checks.push('Biblioteca: entrada única; case desktop/mobile com navegação, sumário e diagramas funcionais');

  const legacyCaseContext = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  await legacyCaseContext.addInitScript(({ url, title }) => {
    if (localStorage.getItem('legacy-case-fixture')) return;
    localStorage.setItem('architecture-practice:read:v1', JSON.stringify([url]));
    localStorage.setItem('architecture-practice:recent:v1', JSON.stringify({ url, title }));
    localStorage.setItem('legacy-case-fixture', 'true');
  }, { url: routes.case, title: optionalCase.title });
  const legacyCasePage = await legacyCaseContext.newPage(); monitor(legacyCasePage);
  await visit(legacyCasePage, '/meu-estudo/index.html');
  assert.equal(await legacyCasePage.locator('#read-count').innerText(), '0', 'Leitura legacy somente de case não aumenta progresso principal');
  assert.equal(await legacyCasePage.locator('.resume-study').isVisible(), false, 'Recente v1 de case não contamina Continuar principal');
  const legacyCaseState = await legacyCasePage.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')));
  assert.equal(legacyCaseState.reading[optionalCase.id].marked, true);
  assert.equal(legacyCaseState.reading[optionalCase.id].origin, 'legacy');
  assert.equal(legacyCaseState.resume['fsi-cases'].contentId, optionalCase.id, 'Recente v1 associado somente à coleção independente');
  assert.equal(await legacyCasePage.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:recent:v1')).url), routes.case, 'Registro antigo de origem não foi apagado');
  report.checks.push('Recente v1 de case preservado e excluído de progresso/retomada principal');

  const blocked = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await blocked.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
  });
  const blockedPage = await blocked.newPage();
  monitor(blockedPage);
  await visit(blockedPage, routes.lesson);
  assert.match(await blockedPage.locator('body').innerText(), /temporári|armazenamento.*indisponível|não.*salv/i, 'Falha de armazenamento informada');
  await blockedPage.locator('.read-toggle').click();
  assert.match(await blockedPage.locator('body').innerText(), /temporári|não.*salv/i, 'Nenhuma promessa de persistência com storage bloqueado');
  report.checks.push('Armazenamento bloqueado: leitura disponível e aviso de sessão temporária');

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await noJs.newPage();
  assert.equal((await staticPage.goto(base + routes.lesson)).status(), 200);
  assert.match(await staticPage.locator('h1').innerText(), /Você clicou/);
  assert.ok(await staticPage.locator('.prose a[href$=".html"]').count() > 0);
  if (!await staticPage.locator('#page-toc').evaluate(element => element.open)) await staticPage.locator('#page-toc summary').click();
  assert.ok(await staticPage.locator('#page-toc a').first().isVisible());
  assert.match(await staticPage.locator('body').innerText(), /JavaScript/i, 'Limite dos recursos sem JavaScript explícito');
  assert.equal((await page.request.get(base + '/pagina-inexistente-p0.html')).status(), 404);
  report.checks.push('Leitura, links e sumário sem JavaScript; rota inexistente retorna 404');
  report.acid = await checkAcidBrowser({ browser, base, manifest, root });
  report.checks.push(...report.acid.checks);
  assert.deepEqual(failures, [], 'Erros de console, CSP ou rede');
  await fs.writeFile(path.join(root, '.site/cases-isolation/browser-results.json'), JSON.stringify(report, null, 2));
  console.log(`Chromium local: ${report.documents} documentos, ${report.diagrams} diagramas em ${report.diagramPages} páginas; larguras ${report.widths.join(', ')}px.`);
  console.log(`Busca: ${Object.keys(report.queries).join(', ')}. ${report.checks.length} grupos de verificações aprovados.`);
  console.log(`Capturas em .site/cases-isolation/after/; resultados em .site/cases-isolation/browser-results.json. ${base}`);
} finally {
  await browser.close();
}
