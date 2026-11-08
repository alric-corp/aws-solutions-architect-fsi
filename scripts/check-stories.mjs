import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { authoredStories, storyLocaleMarkdown, isAuthoredStory, isAuthoredStoryUrl } from '../site/story-policy.mjs';
import { studentSearchMarkdown, detailsPolicy } from '../site/content-policy.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const review = path.join(root, '.site/stories-review');
const args = process.argv.slice(2);
assert.ok(args.every(value => value === '--browser'));
const browserRequested = args.includes('--browser');
const base = process.env.STORIES_TEST_URL || 'http://127.0.0.1:4322';
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname));
const read = source => fs.readFile(path.join(root, source), 'utf8');
const json = async source => JSON.parse(await read(source));
const normalize = value => String(value).replace(/\s+/g, ' ').trim();
const report = { checks: [], captures: [], limits: ['Leitura dos relatos fornecidos e Chromium local; não é auditoria das experiências ou métricas, teste com pessoas ou dispositivo físico.'] };
const locales = ['pt-BR', 'en-US'];
const localeKey = 'architecture-practice:story-language:v1';
const counts = [13, 25, 18, 26, 18, 35, 27, 6, 4, 15];

async function checkStatic() {
  assert.equal(authoredStories.length, 10);
  assert.equal(new Set(authoredStories.map(story => story.source)).size, 10);
  assert.equal(isAuthoredStory('leadership-principles/stories/perfil-privado.md'), false);
  assert.equal(isAuthoredStoryUrl('/index.html'), false);
  const manifest = await json('dist/content-manifest.json');
  const sources = manifest.filter(doc => doc.sourcePath.startsWith('leadership-principles/stories/'));
  assert.deepEqual(sources.map(doc => doc.sourcePath).sort(), authoredStories.map(story => story.source).sort(), 'Catálogo contém exatamente dez histórias, sem duplicar idConta');
  const search = await json('dist/search-index.json');
  for (const summary of ['Ver resposta preparada', 'Ver resposta: o que precisa aparecer', 'View prepared answer', 'View answer: what to include']) {
    assert.equal(detailsPolicy(summary, '', authoredStories[0].source), 'answer');
    const fixture = `# Question\n\n<details><summary>${summary}</summary>\n\nANSWER_STORY_FIXTURE_MUST_NOT_BE_INDEXED\n\n</details>`;
    assert.ok(!studentSearchMarkdown(fixture, authoredStories[0].source).includes('ANSWER_STORY_FIXTURE_MUST_NOT_BE_INDEXED'));
  }
  const scopedName = '# Autoria\n\nVitória relatou o episódio.';
  assert.ok(studentSearchMarkdown(scopedName, authoredStories[0].source).includes('Vitória'));
  assert.ok(!studentSearchMarkdown(scopedName, 'templates/star-story.md').includes('Vitória'), 'Autorização de nomes não se estende a outros materiais');
  const tokens = [
    ['Itaú', 'Projeção', 'Portal Manager', '1024', '2048', '40'],
    ['Itaú', 'CARMO', 'EQ3', 'Valkey', '189', '119'],
    ['Itaú', 'idConta', 'EQ3', 'DAC'], ['Itaú', 'CMDB', 'StackSpot', 'Mesh', '60%', '78'],
    ['Itaú', 'Cost Explorer', '6'], ['snapshot', 'DMS', '12'],
    ['Itaú', 'Open Finance', 'MCP', 'BFA', '50', '800'], [], ['Itaú', 'pom.xml'], ['Itaú', 'StackSpot', 'HN8', 'ECS', '200'],
  ];
  const baseline = await json('.site/stories-review/baseline.json').catch(() => null);
  let questions = 0;
  for (const [index, story] of authoredStories.entries()) {
    const markdown = await read(story.source);
    const html = await read(`dist${story.url}`);
    assert.ok(!/Versão anonimizada|Anonymized version/i.test(markdown));
    assert.equal((markdown.match(/data-story-locales(?:\s|>)/g) || []).length, 1);
    for (const locale of locales) {
      const content = storyLocaleMarkdown(markdown, locale);
      assert.ok(content.length > 900, `${story.id}/${locale}: história integral ausente`);
      assert.ok(content.includes('Vitória'), 'Autoria identificada nos dois idiomas');
      assert.equal((content.match(/^### /gm) || []).length, counts[index], `${story.id}/${locale}: perguntas ou aprofundamentos perdidos`);
      assert.equal((content.match(/<details\b/g) || []).length, counts[index]);
      assert.ok(!new RegExp(`<section[^>]*data-story-locale=["']${locale}["'][^>]*\\bhidden\\b`).test(markdown), 'Sem JavaScript, os dois conteúdos devem estar disponíveis');
      assert.ok(content.includes('STAR'));
      for (const token of tokens[index]) assert.ok(content.includes(token), `${story.id}/${locale}: nome ou número fornecido não pode desaparecer: ${token}`);
      questions += counts[index];
    }
    assert.equal((html.match(/data-story-locale="(?:pt-BR|en-US)"/g) || []).length, 2);
    const headingShapes = locales.map(locale => [...storyLocaleMarkdown(markdown, locale).matchAll(/^(#{2,6}) /gm)].map(match => match[1].length));
    assert.deepEqual(headingShapes[0], headingShapes[1], 'As seções correspondem entre idiomas para manter o contexto de leitura');
    assert.ok(html.includes('data-story-title-en='));
    const oldIds = baseline?.storyAnchors?.[story.url.slice(1)] || [];
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
    for (const id of oldIds) assert.ok(ids.has(id), `Âncora antiga removida: ${story.url}#${id}`);
    assert.ok(search.some(item => item.url.split('#')[0] === story.url));
  }
  assert.ok((await read(authoredStories[3].source)).includes('90%'));
  assert.match(await read(authoredStories[3].source), /pend[eê]ncia|confirmar|reconcile/i);
  assert.match(await read(authoredStories[5].source), /DMS.*snapshot|snapshot.*DMS/i);
  assert.match(await read(authoredStories[6].source), /projeção|projection/i);
  const index = await read('dist/leadership-principles/stories/index.html');
  for (const story of authoredStories) assert.ok(index.includes(story.url));
  const library = await read('dist/biblioteca/index.html');
  assert.ok(library.includes('/leadership-principles/stories/index.html'));
  report.static = { stories: 10, questionsAcrossLocales: questions, existingAnchorComparison: Boolean(baseline), documents: manifest.length };
  report.checks.push('Dez histórias identificadas, idConta único, versões completas e perguntas preservadas, respostas fora dos trechos de busca e nomes autorizados só nas rotas exatas.');
}

async function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  for (const name of (await fs.readdir(cache)).filter(name => name.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const file = path.join(cache, name, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
    if (await fs.access(file).then(() => true).catch(() => false)) return file;
  }
  throw new Error('Defina CHROMIUM_PATH para navegador já instalado; nenhum download é realizado.');
}

async function checkBrowser() {
  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ executablePath: await chromiumPath(), headless: true });
  const errors = [];
  const contexts = [];
  const context = async options => { const ctx = await browser.newContext({ reducedMotion: 'reduce', ...options }); contexts.push(ctx); return ctx; };
  const monitor = page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(base).origin) errors.push('Requisição externa não solicitada'); });
  };
  async function visit(page, story, hash = '') {
    const response = await page.goto(base + story.url + hash);
    // Chromium returns null for a same-document fragment navigation.
    if (response) assert.equal(response.status(), 200);
    else assert.equal(new URL(page.url()).pathname, story.url);
    await page.locator('[data-story-locales][data-story-locales-initialized="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
  }
  async function active(page, locale) {
    await page.waitForFunction(value => document.querySelector('[data-story-locales]')?.dataset.activeStoryLocale === value, locale);
    assert.equal(await page.locator('[data-story-locales]').getAttribute('data-active-story-locale'), locale);
    assert.equal(await page.locator('[data-story-locale]:visible').count(), 1);
    assert.equal(await page.locator(`[data-story-locale="${locale}"]`).isVisible(), true);
    assert.equal(await page.locator(`[data-story-language-option="${locale}"]`).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.prose > h1').getAttribute('lang'), locale);
    assert.equal(await page.locator(`[data-story-locale="${locale}"] h3`).count(), counts[authoredStories.findIndex(story => page.url().includes(story.url))]);
    const goodToc = await page.locator('#page-toc a[href^="#"]').evaluateAll(links => links.filter(link => link.getClientRects().length).every(link => {
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      return !target?.closest('[data-story-locale]')?.hidden;
    }));
    assert.ok(goodToc, 'Sumário não deve direcionar para painel oculto');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
  try {
    for (const [width, theme] of [[1440, 'light'], [390, 'light'], [390, 'dark'], [768, 'dark']]) {
      const ctx = await context({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme });
      const page = await ctx.newPage(); monitor(page);
      await ctx.addInitScript(() => {
        localStorage.setItem('architecture-practice:preferences:v1', JSON.stringify({ theme: 'system', textSize: 0, fixture: 'KEEP_PREFERENCES' }));
        localStorage.setItem('stories-fixture-private-record', 'KEEP_PRIVATE_RECORD');
      });
      for (const story of authoredStories) {
        await visit(page, story);
        await page.locator('[data-story-language-option="pt-BR"]').click();
        await active(page, 'pt-BR');
        await page.locator('[data-story-language-option="en-US"]').focus();
        await page.keyboard.press('Enter');
        await active(page, 'en-US');
        assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), localeKey), 'en-US');
        assert.equal(await page.evaluate(() => localStorage.getItem('stories-fixture-private-record')), 'KEEP_PRIVATE_RECORD');
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:preferences:v1')).fixture), 'KEEP_PREFERENCES');
        if (story.id === 'STAR-01' || story.id === 'STAR-10') {
          const capture = `${story.id.toLowerCase()}-${width}-${theme}-en.png`;
          await page.screenshot({ path: path.join(review, capture) }); report.captures.push(capture);
        }
        await page.locator('[data-story-language-option="pt-BR"]').click();
        await active(page, 'pt-BR');
        if (story.id === 'STAR-01') {
          const capture = `star-01-${width}-${theme}-pt.png`;
          await page.screenshot({ path: path.join(review, capture) }); report.captures.push(capture);
        }
      }
      await ctx.close();
    }
    const ctx = await context({ viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage(); monitor(page);
    await visit(page, authoredStories[0]);
    assert.equal(await page.locator('[data-story-locale="pt-BR"] details[open]').count(), 0, 'Respostas inicialmente recolhidas');
    await page.locator('[data-story-language-option="en-US"]').click();
    await page.reload(); await active(page, 'en-US');
    const enId = await page.locator('[data-story-locale="en-US"] h3').first().getAttribute('id');
    const ptId = await page.locator('[data-story-locale="pt-BR"] h3').first().getAttribute('id');
    await visit(page, authoredStories[0], '#' + encodeURIComponent(ptId)); await active(page, 'pt-BR');
    await page.locator('[data-story-language-option="en-US"]').click(); await active(page, 'en-US');
    assert.equal(decodeURIComponent(new URL(page.url()).hash.slice(1)), enId, 'Troca com fragmento preserva contexto e recarga no idioma escolhido');
    await page.reload(); await active(page, 'en-US');
    await page.evaluate(hash => { location.hash = hash; }, ptId); await active(page, 'pt-BR');
    await page.evaluate(hash => { location.hash = hash; }, enId); await active(page, 'en-US');
    await page.goBack(); await active(page, 'pt-BR');
    await page.goForward(); await active(page, 'en-US');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const targetVisible = await page.locator(`[id="${enId}"]`).evaluate(node => node.getBoundingClientRect().top >= (document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0) - 2);
    assert.ok(targetVisible, 'Título de destino não pode ficar encoberto pelo header');
    const storyDoc = (await json('dist/content-manifest.json')).find(doc => doc.sourcePath === authoredStories[0].source);
    const fixture = {
      schemaVersion: 2, extension: 'KEEP_EXTENSION',
      reading: { [storyDoc.id]: { marked: true, origin: 'manual', fixture: 'KEEP_READING' }, 'legacy:fixture': { marked: true, origin: 'legacy', legacyUrl: '/fixture-unavailable.html' } },
      resume: { student: { contentId: storyDoc.id, anchor: ptId, contentVersion: storyDoc.contentVersion }, instructor: { contentId: 'fixture-instructor', anchor: 'KEEP_PRIVATE_RESUME' } },
    };
    const saved = await context({ viewport: { width: 1440, height: 1000 } });
    await saved.addInitScript(value => {
      if (!localStorage.getItem('stories-fixture-initialized')) {
        localStorage.setItem('architecture-practice:study:v2', JSON.stringify(value));
        localStorage.setItem('architecture-practice:story-language:v1', JSON.stringify('en-US'));
        localStorage.setItem('stories-fixture-initialized', 'true');
      }
    }, fixture);
    const sp = await saved.newPage(); monitor(sp);
    await visit(sp, authoredStories[0]);
    await sp.locator('.read-toggle[aria-pressed="true"]').waitFor();
    await active(sp, 'pt-BR'); // Saved reading position selects its language.
    await sp.locator('[data-story-language-option="en-US"]').click(); await active(sp, 'en-US');
    await sp.locator('.read-toggle[aria-pressed="true"]').waitFor();
    const afterToggle = await sp.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')));
    assert.deepEqual(afterToggle.reading, fixture.reading, 'Alternar idioma preserva as leituras marcadas');
    assert.deepEqual(afterToggle.resume.instructor, fixture.resume.instructor);
    assert.equal(afterToggle.extension, fixture.extension);
    assert.equal(await sp.locator('body').getAttribute('data-content-id'), storyDoc.id, 'Uma história tem a mesma identidade nos dois idiomas');
    const delayed = await context({ viewport: { width: 1440, height: 1000 } });
    await delayed.addInitScript(value => localStorage.setItem('architecture-practice:study:v2', JSON.stringify(value)), fixture);
    const dp = await delayed.newPage(); monitor(dp);
    let releaseCatalog;
    const catalogGate = new Promise(resolve => { releaseCatalog = resolve; });
    await dp.route('**/content-manifest.json', async route => { await catalogGate; await route.continue(); });
    await visit(dp, authoredStories[0]);
    await dp.locator('[data-story-language-option="en-US"]').click(); await active(dp, 'en-US');
    releaseCatalog();
    await dp.waitForFunction(({ id, anchor }) => JSON.parse(localStorage.getItem('architecture-practice:study:v2'))?.resume?.student?.contentId === id && JSON.parse(localStorage.getItem('architecture-practice:study:v2'))?.resume?.student?.anchor === anchor, { id: storyDoc.id, anchor: enId });
    await active(dp, 'en-US');
    const blocked = await context({ viewport: { width: 390, height: 844 } });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
    const bp = await blocked.newPage(); monitor(bp); await visit(bp, authoredStories[2]);
    await bp.locator('[data-story-language-option="en-US"]').click(); await active(bp, 'en-US');
    const nojs = await context({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const np = await nojs.newPage(); await np.goto(base + authoredStories[0].url);
    assert.equal(await np.locator('[data-story-locale]:visible').count(), 2);
    assert.equal(await np.locator('[data-story-language-option]').count(), 0);
    assert.deepEqual(errors, [], 'Nenhum erro JS/CSP ou requisição externa no uso das histórias');
    report.browser = { version: await browser.version(), widths: [390, 768, 1440], themes: ['light', 'dark'], localeChecks: 80, directAnchors: true, reload: true, history: true, readingAndPrivateRecordsPreserved: true, storageBlocked: true, noJavaScript: true };
    report.checks.push('Toggle integral por teclado, idioma persistido, hash/retomada, sumário filtrado, mobile/temas e ausência de JavaScript ou storage bloqueado validados.');
  } finally { for (const ctx of contexts) await ctx.close().catch(() => {}); await browser.close(); }
}

await fs.mkdir(review, { recursive: true });
try {
  await checkStatic();
  if (browserRequested) await checkBrowser();
  report.ok = true;
  console.log(JSON.stringify(report, null, 2));
} catch (error) { report.ok = false; report.error = String(error.stack || error); throw error; }
finally { await fs.writeFile(path.join(review, browserRequested ? 'browser-results.json' : 'static-results.json'), JSON.stringify(report, null, 2) + '\n'); }
