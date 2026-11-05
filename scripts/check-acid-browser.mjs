import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

// Called by test:browser with the same local browser and emitted manifest.
// Each context has synthetic storage; no existing browser profile is opened.
export async function checkAcidBrowser({ browser, base, manifest, root }) {
  const prefix = '/technical-knowledge/01-fundamentals/acid/';
  const overview = prefix + 'index.html';
  const intro = prefix + '00-transacoes-do-zero.html';
  const isolation = prefix + '03-isolamento.html';
  const anomalies = prefix + '04-anomalias-e-niveis.html';
  const fundamentals = '/technical-knowledge/01-fundamentals/index.html';
  const docs = manifest.filter(doc => doc.canonicalUrl.startsWith(prefix));
  const lessons = docs.filter(doc => /^\d{2}-[^/]+\.html$/.test(doc.canonicalUrl.slice(prefix.length))).sort((a, b) => a.canonicalUrl.localeCompare(b.canonicalUrl));
  const output = path.join(root, '.site/integration');
  await fs.mkdir(path.join(output, 'visual'), { recursive: true });
  const report = { documents: docs.length, lessons: lessons.length, widths: [], queries: {}, checks: [], screenshots: [], errors: [] };
  const contexts = [];
  async function context(options = {}) {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'], ...options });
    contexts.push(ctx);
    return ctx;
  }
  async function visit(page, url) {
    const response = await page.goto(base + url);
    if (response) assert.equal(response.status(), 200, url);
    else assert.equal(page.url(), new URL(base + url).href, 'Navegação na mesma página preserva o fragmento');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.querySelectorAll('.mermaid')].every(el => el.querySelector('svg') || el.classList.contains('diagram-failed')));
    assert.equal(await page.locator('.diagram-failed').count(), 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow: ${page.url()}`);
  }
  function monitor(page) {
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
    page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) report.errors.push(request.url()); });
  }
  async function save(page, name) {
    await page.screenshot({ path: path.join(output, 'visual', name + '.png') });
    report.screenshots.push(name + '.png');
  }
  try {
    assert.equal(docs.length, 18);
    assert.equal(lessons.length, 10);
    const ctx = await context();
    const page = await ctx.newPage(); monitor(page);
    await visit(page, '/biblioteca/index.html');
    await page.locator(`main a[href="${fundamentals}"]`).click();
    await page.locator(`.prose a[href="${overview}"]`).click();
    assert.equal(new URL(page.url()).pathname, overview);
    assert.match(await page.locator('.breadcrumbs').innerText(), /Biblioteca.*Fundamentos.*Transações e ACID/s);
    await save(page, 'acid-overview-desktop');
    await page.locator(`.prose a[href="${intro}"]`).first().click();
    assert.match(await page.locator('h1').innerText(), /Antes de ACID.*transação/);
    await page.locator(`.article-pagination a[href="${lessons[1].canonicalUrl}"]`).click();
    await page.locator(`.article-pagination a[href="${intro}"]`).click();
    for (let i = 0; i < lessons.length; i++) {
      assert.equal(new URL(page.url()).pathname, lessons[i].canonicalUrl, 'Sequência 00–09');
      const targets = await page.locator('#navigation .nav-items a').evaluateAll(elements => elements.map(el => el.pathname));
      assert.deepEqual(targets.slice(0, 11), [overview, ...lessons.map(doc => doc.canonicalUrl)]);
      if (i + 1 < lessons.length) await page.locator(`.article-pagination a[href="${lessons[i + 1].canonicalUrl}"]`).click();
    }
    await visit(page, fundamentals);
    await save(page, 'fundamentals-desktop');
    report.checks.push('Biblioteca → Fundamentos → ACID → introdução; anterior/próximo 00–09 e navegação contextual');

    for (const width of [320, 390, 768, 1024, 1440, 1920]) for (const theme of ['light', 'dark']) {
      const matrixContext = await context({ viewport: { width, height: width < 768 ? 844 : 1000 }, colorScheme: theme });
      const reader = await matrixContext.newPage(); monitor(reader);
      const selected = [390, 1440].includes(width) ? docs : docs.filter(doc => [isolation, anomalies].includes(doc.canonicalUrl));
      const result = { width, theme, pages: 0, answers: 0, tables: 0, codeBlocks: 0 };
      for (const doc of selected) {
        await visit(reader, doc.canonicalUrl);
        assert.equal(await reader.locator('html').getAttribute('data-theme'), theme, 'Tema Sistema acompanha o contexto');
        assert.equal(await reader.locator('.prose h1').count(), 1);
        for (const answer of await reader.locator('.prose details:not(.diagram-source)').all()) {
          if (await answer.evaluate(el => el.open)) await answer.locator('summary').click();
          await answer.locator('summary').click();
          assert.equal(await answer.evaluate(el => el.open), true);
          assert.ok(await answer.locator('p').count() > 0, 'Resposta comentada renderizada');
          await answer.locator('summary').click(); result.answers++;
        }
        for (const table of await reader.locator('.prose .table-scroll').all()) {
          assert.equal(await table.getAttribute('tabindex'), '0');
          assert.ok(await table.evaluate(el => {
            if (el.scrollWidth <= el.clientWidth + 1) return true;
            el.scrollLeft = el.scrollWidth; const scrolled = el.scrollLeft > 0; el.scrollLeft = 0; return scrolled;
          }), 'Tabela larga permite rolagem interna');
          result.tables++;
        }
        result.codeBlocks += await reader.locator('.prose .code-block').count();
        assert.ok(await reader.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        if (doc.canonicalUrl === isolation && [390, 1440].includes(width)) {
          await reader.evaluate(() => scrollTo(0, 0)); await save(reader, `acid-isolation-${width}-${theme}`);
          await reader.locator('.prose code.language-sql').first().scrollIntoViewIfNeeded();
          await save(reader, `acid-sql-${width}-${theme}`);
        }
        if (doc.canonicalUrl === anomalies && width === 390) {
          await reader.locator('.prose .table-scroll').first().scrollIntoViewIfNeeded(); await save(reader, `acid-table-${width}-${theme}`);
        }
        result.pages++;
      }
      report.widths.push(result);
      await matrixContext.close(); contexts.splice(contexts.indexOf(matrixContext), 1);
    }
    report.checks.push('18 páginas ACID em 390/1440px e duas aulas em todas as seis larguras, nos dois temas; respostas, tabelas e código');

    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, overview);
      await page.locator('[data-search-open]').click();
      for (const query of ['ACID', 'atomicidade', 'isolamento', 'idempotência', 'idempotencia', 'deadlock']) {
        await page.locator('#search-input').fill(query);
        await page.waitForFunction(() => document.querySelector('.search-status').dataset.state === 'results');
        const targets = await page.locator('.search-result').evaluateAll(elements => elements.map(el => el.pathname));
        assert.ok(targets.some(url => url.startsWith(prefix)), `Busca encontra ACID: ${query}`);
        assert.ok(targets.every(url => manifest.some(doc => doc.canonicalUrl === url && doc.search && !doc.standalone && doc.audience === 'student')));
        report.queries[`${width}:${query}`] = targets.length;
        if (query === 'isolamento') await save(page, `search-acid-${width}`);
      }
      await page.keyboard.press('Escape');
    }
    report.checks.push('Busca desktop/mobile: ACID, atomicidade, isolamento, idempotência sem/com acento e deadlock; instrutor/FSI excluídos');

    await visit(page, isolation);
    const sql = page.locator('.prose .code-block').filter({ has: page.locator('code.language-sql') }).first();
    const codeText = await sql.locator('code').innerText();
    await sql.locator('.copy-code').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), codeText, 'SQL copiado sem alteração');
    const anchor = 'o-que-isolamento-quer-dizer';
    await visit(page, isolation + '#' + anchor); await page.reload();
    await page.waitForFunction(id => { const top = document.getElementById(id).getBoundingClientRect().top; return top >= 0 && top < 230; }, anchor);
    await page.locator('.read-toggle').click();
    await page.reload();
    await page.waitForFunction(() => document.querySelector('.read-toggle').getAttribute('aria-pressed') === 'true');
    const readState = await page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')));
    assert.equal(readState.reading[docs.find(doc => doc.canonicalUrl === isolation).id].marked, true);
    const resumeBefore = readState.resume.student;
    await visit(page, '/cases/01-payment-processing-pix.html');
    await visit(page, '/interview/simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/instrutor.html');
    await visit(page, '/index.html');
    await visit(page, '/meu-estudo/index.html');
    await page.locator('.resume-study').waitFor({ state: 'visible' });
    assert.ok((await page.locator('#resume-link').getAttribute('href')).startsWith(isolation));
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('architecture-practice:study:v2')).resume.student), resumeBefore);
    report.checks.push('SQL copiado, âncora ACID com refresh, leitura persistida e retomada ACID preservada após case/instrutor');

    const noJsContext = await context({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const noJs = await noJsContext.newPage();
    await visit(noJs, overview);
    await noJs.locator(`.prose a[href="${intro}"]`).first().click();
    assert.match(await noJs.locator('h1').innerText(), /Antes de ACID.*transação/);
    await visit(noJs, isolation);
    const answer = noJs.locator('.prose details').first(); await answer.locator('summary').click();
    assert.equal(await answer.evaluate(el => el.open), true);
    assert.ok(await noJs.locator('.prose code.language-sql').count() > 0);
    report.checks.push('Sem JavaScript: entrada, links, aula, respostas nativas e SQL acessíveis');
    assert.deepEqual(report.errors, []);
    await fs.writeFile(path.join(output, 'acid-browser-results.json'), JSON.stringify(report, null, 2) + '\n');
    return report;
  } finally { for (const ctx of contexts) await ctx.close(); }
}
