import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

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
const screenshotDir = path.join(root, '.site/screenshots');
await fs.mkdir(screenshotDir, { recursive: true });

function monitor(page) {
  page.on('pageerror', error => failures.push(error.message));
  page.on('console', message => { if (message.type() === 'error') failures.push(`${page.url()}: ${message.text()}`); });
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failures.push(`${request.url()}: ${request.failure()?.errorText}`); });
}
async function diagramsReady(page) {
  await page.waitForFunction(() => [...document.querySelectorAll('.mermaid')].every(element => element.querySelector('svg') || element.classList.contains('diagram-failed')), undefined, { timeout: 90000 });
  const broken = await page.locator('.diagram-failed').allTextContents();
  assert.deepEqual(broken, [], `Diagrama inválido: ${page.url()}\n${failures.join('\n')}`);
}
async function noOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `Overflow horizontal: ${page.url()}`);
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  monitor(page);
  assert.equal((await page.goto(base)).status(), 200);
  await page.evaluate(() => document.fonts.ready);
  assert.match(await page.locator('h1').innerText(), /decisão de arquitetura/);
  assert.equal(await page.locator('.track-card').count(), 6);
  await noOverflow(page);
  await page.screenshot({ path: path.join(screenshotDir, 'desktop.png'), fullPage: true });
  await page.keyboard.press('/');
  await page.locator('#search-input').fill('pix');
  await page.waitForSelector('.search-result');
  assert.match(await page.locator('.search-result').first().innerText(), /Pix/i);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.search-dialog').evaluate(element => element.open), false);

  const lesson = '/technical-knowledge/02-system-design/ecommerce/01-from-click-to-catalog.html';
  assert.equal((await page.goto(base + lesson)).status(), 200);
  await diagramsReady(page);
  assert.match(await page.locator('h1').innerText(), /Você clicou/);
  assert.equal(await page.locator('nav a[aria-current="page"]').count(), 1);
  const answer = page.locator('.prose details').first();
  await answer.locator('summary').click();
  assert.equal(await answer.evaluate(element => element.open), true);
  assert.ok(await answer.locator('p').count() > 0, 'Conteúdo Markdown das respostas deve ser renderizado');
  const architecture = page.locator('img[src$="01-catalog-aws.svg"]');
  await architecture.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('img[src$="01-catalog-aws.svg"]').naturalWidth > 0);
  await noOverflow(page);
  await page.locator('.read-toggle').click();
  assert.equal(await page.locator('.read-toggle').getAttribute('aria-pressed'), 'true');
  await page.reload();
  assert.equal(await page.locator('.read-toggle').getAttribute('aria-pressed'), 'true');
  await diagramsReady(page);
  await page.screenshot({ path: path.join(screenshotDir, 'article.png'), fullPage: false });
  await page.goto(base);
  assert.equal(await page.locator('#read-count').innerText(), '1');
  assert.equal(await page.locator('#resume-link').getAttribute('href'), lesson);

  // Render every existing Mermaid block, not just the first lesson. This catches
  // differences between GitHub's Mermaid renderer and the version we host.
  const index = JSON.parse(await fs.readFile(path.join(root, 'dist/search-index.json'), 'utf8'));
  let diagrams = 0;
  let diagramPages = 0;
  for (const item of index) {
    const html = await fs.readFile(path.join(root, 'dist', item.url), 'utf8');
    if (!html.includes('class="mermaid"')) continue;
    await page.goto(base + item.url);
    await diagramsReady(page);
    diagrams += await page.locator('.mermaid svg').count();
    diagramPages++;
    await noOverflow(page);
  }
  console.log(`Desktop: busca, respostas, imagens, progresso persistido e ${diagrams} diagramas em ${diagramPages} páginas verificados.`);

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const phone = await mobile.newPage();
  monitor(phone);
  await phone.goto(base);
  await phone.evaluate(() => document.fonts.ready);
  await noOverflow(phone);
  assert.ok(await phone.locator('#next-heading').evaluate(element => element.getBoundingClientRect().width >= 200), 'A chamada da primeira aula precisa manter uma coluna legível no celular');
  await phone.screenshot({ path: path.join(screenshotDir, 'mobile.png'), fullPage: true });
  await phone.locator('.menu-toggle').click();
  assert.equal(await phone.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal(await phone.locator('#navigation').evaluate(element => element.inert), false);
  await phone.locator('.nav-backdrop').click({ position: { x: 330, y: 300 } });
  assert.equal(await phone.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  await phone.locator('.compact-search').click();
  await phone.locator('#search-input').fill('resiliencia');
  await phone.waitForSelector('.search-result');
  await phone.locator('[data-search-close]').click();
  await phone.goto(base + lesson + '#cena');
  await diagramsReady(phone);
  await noOverflow(phone);
  const anchorTop = await phone.locator('#cena').evaluate(element => element.getBoundingClientRect().top);
  assert.ok(anchorTop >= 60 && anchorTop <= 150, `Âncora fora da posição esperada: ${anchorTop}`);
  await phone.screenshot({ path: path.join(screenshotDir, 'mobile-article.png'), fullPage: false });
  console.log('Mobile: layout de 390px, navegação, busca sem acentos e acesso direto com âncora verificados.');

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  assert.equal((await staticPage.goto(base + lesson)).status(), 200);
  assert.match(await staticPage.locator('h1').innerText(), /Você clicou/);
  assert.ok(await staticPage.locator('.prose a[href$=".html"]').count() > 0);
  assert.deepEqual(failures, [], 'Erros de console, CSP ou rede');
  console.log(`Verificação concluída em ${base}. Capturas em .site/screenshots/.`);
} finally {
  await browser.close();
}
