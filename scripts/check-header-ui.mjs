import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright-core';

// UI-only local regression. No network service, credentials or personal profile.
const root = process.cwd();
const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:4191';
const output = path.join(root, '.site/header-refinement');
const pictures = path.join(output, 'after');
await fs.mkdir(pictures, { recursive: true });
const manifest = JSON.parse(await fs.readFile('dist/content-manifest.json', 'utf8'));
const foundation = manifest.find(item => item.canonicalUrl.includes('06-databases-transactions-consistency'));
const lesson = '/technical-knowledge/02-system-design/ecommerce/01-from-click-to-catalog.html';
const candidate = manifest.find(item => item.canonicalUrl.includes('02-pedido-durante-falha-do-banco/candidato.html'));
const caseDoc = manifest.find(item => item.canonicalUrl.includes('/cases/01-payment'));
const sizes = [[320,740], [390,844], [768,1024], [820,1180], [1024,768], [1280,800], [1440,900], [1920,1080]];
const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const version = (await fs.readdir(cache)).filter(name => name.startsWith('chromium_headless_shell-')).sort().at(-1);
const executablePath = process.env.CHROMIUM_PATH || path.join(cache, version, 'chrome-headless-shell-mac-arm64/chrome-headless-shell');
const browser = await chromium.launch({ executablePath, headless: true });
const report = { base, browserVersion: browser.version(), fixture: 'Synthetic isolated browser storage; no personal data.', screenshots: [], matrix: [], checks: [], limits: ['Chromium local only; Safari and physical mobile keyboards were not tested.', 'Root font-size enlargement tests are reflow tests, not browser zoom.', 'No performance, usability-with-people or complete WCAG claim.'] };
const failures = [];
const requestedOrigins = new Set();
const targets = ['Início', 'Biblioteca', 'Praticar', 'Meu estudo'];
const fixtureState = { schemaVersion: 2, reading: { [foundation.id]: { marked:true, origin:'manual', markedAt:'2020-01-01T00:00:00Z' } }, resume:{ student:{ contentId:foundation.id, anchor:'idempotencia-concorrencia', contentVersion:foundation.contentVersion } } };
function monitor(page) {
  page.on('request', request => { if(/^https?:/.test(request.url())) requestedOrigins.add(new URL(request.url()).origin); });
  page.on('pageerror', error => failures.push(`${page.url()}: ${error.message}`));
  page.on('console', message => { if(message.type()==='error') failures.push(`${page.url()}: ${message.text()}`); });
  page.on('requestfailed', request => { if(!request.failure()?.errorText.includes('ERR_ABORTED')) failures.push(`${request.url()}: ${request.failure()?.errorText}`); });
}
async function context({width=1440,height=900,theme='light',history=false,platform,blocked=false,javaScriptEnabled=true}={}) {
  const ctx = await browser.newContext({ viewport:{width,height}, colorScheme:theme, reducedMotion:'reduce', javaScriptEnabled, permissions:['clipboard-read','clipboard-write'] });
  if(javaScriptEnabled) await ctx.addInitScript(({theme,history,fixtureState,platform,blocked})=>{
    if(platform){Object.defineProperty(navigator,'platform',{get:()=>platform});Object.defineProperty(navigator,'userAgentData',{get:()=>({platform,mobile:false})});}
    if(blocked) { Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked fixture','SecurityError');}}); return; }
    if(sessionStorage.getItem('header-ui-fixture-installed'))return;
    localStorage.setItem('architecture-practice:preferences:v1',JSON.stringify({theme,headerFixture:'preserve',textSize:0}));
    if(history) localStorage.setItem('architecture-practice:study:v2',JSON.stringify(fixtureState));
    sessionStorage.setItem('header-ui-fixture-installed','true');
  }, {theme,history,fixtureState,platform,blocked});
  const page=await ctx.newPage();monitor(page);return{ctx,page};
}
async function visit(page,url='/index.html') {
  assert.equal((await page.goto(base+url)).status(),200,url);
  await page.evaluate(()=>document.fonts.ready);
  if(await page.locator('.mermaid').count())await page.waitForFunction(()=>[...document.querySelectorAll('.mermaid')].every(el=>el.querySelector('svg')||el.classList.contains('diagram-failed')));
  assert.equal(await page.locator('.diagram-failed').count(),0);
}
async function save(page,name) { await page.screenshot({path:path.join(pictures,name+'.png')});report.screenshots.push(name+'.png'); }
async function geometry(page) {
  return page.evaluate(()=>{
    const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
    const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const selected=['.brand','[data-search-open]','#global-menu-toggle'];
    if(visible(document.querySelector('.topbar .global-nav')))selected.push('.topbar .global-nav','#theme-control');
    const controls=selected.map(selector=>({selector,element:document.querySelector(selector)})).filter(({element})=>visible(element)).map(({selector,element})=>({selector,...rect(element)}));
    const row=document.querySelector('.header-inner')||document.querySelector('.topbar');
    return{width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+1,header:{...rect(document.querySelector('.topbar')),position:getComputedStyle(document.querySelector('.topbar')).position},inner:rect(row),controls,offset:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-offset')),searchHint:visible(document.querySelector('.search-hint')),globalPanel:!!document.querySelector('#global-menu-panel')?.open,resume:visible(document.querySelector('.home-resume'))?rect(document.querySelector('.home-resume')):null,hero:rect(document.querySelector('.hero'))};
  });
}
async function assertHeader(page) {
  await page.waitForFunction(()=>{const header=document.querySelector('.topbar');const expected=getComputedStyle(header).position==='sticky'?header.getBoundingClientRect().height:0;return Math.abs(expected-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-offset')))<2;});
  const value=await geometry(page);
  assert.equal(value.overflow,false,`Global overflow ${JSON.stringify(value)}`);
  for(const item of value.controls){assert.ok(item.x>=-1&&item.right<=value.width+1,`Header control outside viewport: ${JSON.stringify(item)}`);assert.ok(item.height>=43,`Header target too short: ${JSON.stringify(item)}`);}
  for(let a=0;a<value.controls.length;a++)for(let b=a+1;b<value.controls.length;b++){
    const first=value.controls[a],second=value.controls[b];
    const overlapX=Math.min(first.right,second.right)-Math.max(first.x,second.x);
    const overlapY=Math.min(first.bottom,second.bottom)-Math.max(first.y,second.y);
    assert.ok(overlapX<=1||overlapY<=1,`Header collision ${first.selector}/${second.selector}: ${JSON.stringify(value)}`);
  }
  assert.ok(Math.abs((value.header.position==='sticky'?value.header.height:0)-value.offset)<2,`Sticky offset != actual header: ${JSON.stringify(value)}`);
  return value;
}
async function openGlobal(page){const toggle=page.locator('#global-menu-toggle');await toggle.click();await page.waitForFunction(()=>document.querySelector('#global-menu-panel')?.open);}
async function closeGlobal(page){if(await page.locator('#global-menu-panel').evaluate(e=>e.open))await page.locator('[data-global-menu-close]').click();}
async function ensureThemeVisible(page){if(!await page.locator('#theme-preference').isVisible())await openGlobal(page);}
async function selectTheme(page,value){await ensureThemeVisible(page);await page.locator('#theme-preference').selectOption(value);await closeGlobal(page);}
async function assertDestinations(page){
  const visible=await page.locator('.global-nav').isVisible();
  if(!visible)await openGlobal(page);
  for(const label of targets)assert.equal(await page.locator('.global-nav').getByRole('link',{name:label,exact:true}).isVisible(),true,label);
  assert.equal(await page.locator('#theme-preference').count(),1,'Theme has one source of truth');
  if(!visible){const panel=await page.locator('#global-menu-panel').evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth}));assert.ok(panel.scroll<=panel.client+1,`Global panel local reflow: ${JSON.stringify(panel)}`);await closeGlobal(page);}
}
async function openSearch(page){await page.locator('[data-search-open]').filter({visible:true}).first().click();await page.waitForFunction(()=>document.querySelector('.search-dialog')?.open);assert.equal(await page.locator('#search-input').evaluate(e=>e===document.activeElement),true);}
async function keyModifiers(page,key='k'){await page.keyboard.press(process.platform==='darwin'?'Meta+'+key:'Control+'+key);}
async function assertAnchor(page,id){const positions=await page.locator(`[id="${id}"]`).evaluate(e=>({top:e.getBoundingClientRect().top,header:document.querySelector('.topbar').getBoundingClientRect().bottom}));assert.ok(positions.top>=positions.header-1,`Anchor hidden ${id} ${JSON.stringify(positions)}`);}
try {
  for(const [width,height]of sizes)for(const theme of ['light','dark'])for(const history of [false,true]){
    const{ctx,page}=await context({width,height,theme,history});await visit(page);
    if(history){await page.locator('.home-resume').waitFor({state:'visible'});await page.locator('[data-resume-section]').waitFor({state:'visible'});assert.match(await page.locator('[data-resume-section]').innerText(),/Idempotência.*concorrência/,'Real saved section label resolved from target HTML');}
    const metrics=await assertHeader(page);metrics.theme=theme;metrics.history=history;report.matrix.push(metrics);
    await assertDestinations(page);
    assert.equal(await page.locator('.home-resume').isVisible(),history,'No empty resume banner');
    const cover=page.locator('.hero-cover');assert.ok(await cover.evaluate(e=>Math.abs(e.width/e.height-e.naturalWidth/e.naturalHeight)<.01),'Cover ratio');
    const hierarchy=await page.evaluate(()=>{const sample=document.createElement('span');sample.style.backgroundColor='var(--action)';document.body.append(sample);const action=getComputedStyle(sample).backgroundColor;sample.remove();return{action,hero:getComputedStyle(document.querySelector('.hero .button')).backgroundColor,resume:document.querySelector('.home-resume:not([hidden])')?getComputedStyle(document.querySelector('#resume-link')).backgroundColor:null};});
    assert.equal(history?hierarchy.resume:hierarchy.hero,hierarchy.action,'Primary action corresponds to actual history state');
    if(history){assert.notEqual(hierarchy.hero,hierarchy.action,'Resume must not compete with primary hero');const reading=await page.evaluate(id=>JSON.parse(localStorage.getItem('architecture-practice:study:v2')).reading[id],foundation.id);assert.deepEqual(reading,fixtureState.reading[foundation.id],'UI does not rewrite existing reading data');}

    if(history){assert.equal(await page.locator('#resume-link').getAttribute('href'),foundation.canonicalUrl+'#idempotencia-concorrencia');assert.match(await page.locator('[data-resume-title]').innerText(),/Bancos, transações/);assert.match(await page.locator('#resume-link').innerText(),/Retomar/);}
    const align=await page.evaluate(()=>{const x=s=>document.querySelector(s).getBoundingClientRect().left;return{breadcrumb:x('.breadcrumbs')+parseFloat(getComputedStyle(document.querySelector('.breadcrumbs')).paddingLeft),resume:document.querySelector('.home-resume:not([hidden])')?x('.home-resume'):null,hero:x('.hero'),cta:x('.hero-actions .button'),secondary:x('.hero-secondary'),coverY:document.querySelector('.hero-cover').getBoundingClientRect().top,actionsBottom:document.querySelector('.hero-actions').getBoundingClientRect().bottom};});
    assert.ok(Math.abs(align.hero-align.breadcrumb)<2,'Home/breadcrumb shared alignment');
    if(align.resume!==null)assert.ok(Math.abs(align.hero-align.resume)<2,'Home/resume shared alignment');
    assert.ok(Math.abs(align.cta-align.secondary)<2||width>=768,'Hero stacked actions align');
    if(width<1024)assert.ok(align.actionsBottom<=align.coverY,'Task before cover');
    await save(page,`home-${width}x${height}-${theme}-${history?'resume':'empty'}`);
    if([390,1440].includes(width)&&!history){await openSearch(page);await page.locator('#search-input').fill('idempotência');await page.waitForSelector('.search-result');await save(page,`search-${width}-${theme}`);await page.keyboard.press('Escape');assert.equal(await page.locator('[data-search-open]').evaluate(e=>e===document.activeElement),true,'Search focus return');}
    if([390,820].includes(width)&&theme==='light'&&!history){await openGlobal(page);await save(page,`menu-${width}`);await page.keyboard.press('Escape');assert.equal(await page.locator('#global-menu-toggle').evaluate(e=>e===document.activeElement),true);}
    await ctx.close();
  }
  report.checks.push('Eight requested viewports × light/dark × empty/fixture history; header targets/collisions, alignment, cover, menu, search, captures');

  for(const width of [767,769,1023,1025,1199,1201]){
    const{ctx,page}=await context({width,height:900});await visit(page);await assertHeader(page);await assertDestinations(page);await ctx.close();
  }
  report.checks.push('One pixel either side of 768/1024/1200 transitions');
  for(const [platform,expected]of [['MacIntel','Meta+K'],['Win32','Control+K'],['Unrecognized fixture',null]]){const platformContext=await context({platform});await visit(platformContext.page);const trigger=platformContext.page.locator('[data-search-open]');assert.equal(await trigger.getAttribute('aria-keyshortcuts'),expected,'Shortcut hint matches recognized platform');if(!expected)assert.equal(await platformContext.page.locator('.search-hint').isVisible(),false);await platformContext.ctx.close();}
  report.checks.push('Synthetic Mac/Windows/unrecognized platform fixtures match supported modifier shortcut hints');


  const{ctx,page}=await context();await visit(page);await selectTheme(page,'system');await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await selectTheme(page,'light');await page.emulateMedia({colorScheme:'dark'});assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.reload();assert.equal(await page.locator('#theme-preference').inputValue(),'light');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('architecture-practice:preferences:v1')).headerFixture),'preserve');
  await keyModifiers(page);assert.equal(await page.locator('.search-dialog').evaluate(e=>e.open),true);await page.keyboard.press('Escape');
  await page.evaluate(()=>{for(const [tag,id]of[['input','fixture-input'],['textarea','fixture-textarea'],['select','fixture-select'],['div','fixture-editable']]){const el=document.createElement(tag);el.id=id;if(tag==='div')el.contentEditable='true';document.body.append(el);}});
  for(const selector of ['#fixture-input','#fixture-textarea','#fixture-select','#fixture-editable']){await page.locator(selector).focus();await keyModifiers(page);assert.equal(await page.locator('.search-dialog').evaluate(e=>e.open),false,'Shortcut must not interrupt '+selector);}
  await page.locator('body').click({position:{x:5,y:500}});await page.evaluate(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',metaKey:true,ctrlKey:true,isComposing:true,bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',metaKey:true,ctrlKey:true,repeat:true,bubbles:true}));});assert.equal(await page.locator('.search-dialog').evaluate(e=>e.open),false);
  await page.keyboard.press('/');assert.equal(await page.locator('.search-dialog').evaluate(e=>e.open),false,'No mandatory character shortcut');
  await page.setViewportSize({width:390,height:844});await openGlobal(page);await keyModifiers(page);assert.equal(await page.locator('#global-menu-panel').evaluate(e=>e.open),false);assert.equal(await page.locator('.search-dialog').evaluate(e=>e.open),true);assert.equal(await page.locator('dialog[open]').count(),1);await page.keyboard.press('Escape');
  await openGlobal(page);
  await page.evaluate(()=>document.querySelector('.hero .button').focus());assert.equal(await page.locator('#global-menu-panel').evaluate(panel=>panel.contains(document.activeElement)),true,'Background is inert while global panel modal');
  for(let index=0;index<10;index++){await page.keyboard.press('Tab');assert.equal(await page.locator('#global-menu-panel').evaluate(panel=>panel.contains(document.activeElement)),true,'Global panel traps Tab');}
  await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(100);assert.equal(await page.locator('#global-menu-panel').evaluate(e=>e.open),false);assert.equal(await page.locator('dialog[open]').count(),0);assert.ok(await page.evaluate(()=>{const e=document.activeElement;return e&&e.matches('a[href],button,input,select,textarea,[tabindex]')&&e.getClientRects().length>0;}),'Visible focus after resize');assert.equal(await page.evaluate(()=>getComputedStyle(document.body).overflow),'visible');
  report.checks.push('Theme system/explicit/persistence, unknown preference field, modifier shortcuts, editable/IME/repeat exclusion, modal exclusivity and resize focus');
  await visit(page,lesson+'#cena');await assertAnchor(page,'cena');await page.setViewportSize({width:390,height:844});await page.reload();await assertAnchor(page,'cena');
  const expand=page.locator('.diagram-expand').first();await expand.click();assert.equal(await page.locator('#diagram-dialog').evaluate(e=>e.open),true);await keyModifiers(page);assert.ok(await page.locator('dialog[open]').count()<=1);await page.keyboard.press('Escape');await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  report.checks.push('Reader direct fragment after resize, contextual navigation separate from global menu, diagram modal coordination');
  for(const percent of [200,400]){await page.evaluate(size=>document.documentElement.style.fontSize=size+'%',percent);await assertHeader(page);await assertDestinations(page);await page.locator('#page-toc summary').scrollIntoViewIfNeeded();await save(page,`reader-font-${percent}`);await page.evaluate(()=>document.documentElement.style.fontSize='');}
  await ctx.close();

  for(const percent of [200,400]){
    const enlarged=await context({width:390,height:844});await visit(enlarged.page);await enlarged.page.evaluate(percent=>document.documentElement.style.fontSize=percent+'%',percent);await openSearch(enlarged.page);await enlarged.page.locator('#search-input').fill('idempotência');await enlarged.page.waitForSelector('.search-result');
    const metrics=await enlarged.page.evaluate(()=>{const dialog=document.querySelector('.search-dialog'),input=document.querySelector('#search-input'),close=document.querySelector('[data-search-close]'),results=document.querySelector('.search-results');const rect=e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};return{dialog:rect(dialog),input:rect(input),close:rect(close),overflowY:getComputedStyle(dialog).overflowY,dialogScrolls:dialog.scrollHeight>dialog.clientHeight+1,resultsScrolls:results.scrollHeight>results.clientHeight+1};});
    assert.ok(metrics.input.width>=44,'Enlarged search input remains usable');assert.ok(metrics.input.left>=metrics.dialog.left&&metrics.input.right<=metrics.dialog.right,'Search input stays inside dialog');assert.ok(metrics.input.top>=metrics.dialog.top&&metrics.input.bottom<=844,'Focused enlarged input is reachable');assert.ok(metrics.close.top>=metrics.dialog.top&&metrics.close.bottom<=844,'Enlarged close remains reachable');if(metrics.dialogScrolls)assert.ok(['auto','scroll'].includes(metrics.overflowY),'Enlarged text must not be cropped');assert.ok(!(metrics.dialogScrolls&&metrics.resultsScrolls),'One active vertical scrolling region in enlarged search');
    await save(enlarged.page,`search-font-${percent}`);await enlarged.page.keyboard.press('Escape');await enlarged.ctx.close();
  }
  report.checks.push('Search at root-font200/400%: nonzero input, visible close/focus and one reachable scrolling region');

  const low=await context({width:844,height:390,history:true});await visit(low.page);await assertHeader(low.page);await openSearch(low.page);assert.ok(await low.page.locator('[data-search-close]').isVisible());await save(low.page,'landscape-low-search');await low.ctx.close();
  const missing=await context({history:true});await visit(missing.page);await missing.page.evaluate(()=>{const key='architecture-practice:study:v2';const data=JSON.parse(localStorage.getItem(key));data.resume.student.anchor='';localStorage.setItem(key,JSON.stringify(data));});await missing.page.reload();await missing.page.locator('.home-resume').waitFor({state:'visible'});assert.equal(await missing.page.locator('[data-resume-section]').isVisible(),false);await missing.ctx.close();
  const long=await context({width:390,height:844,history:true});await long.ctx.route('**/content-manifest.json',async route=>{const response=await route.fetch();const items=await response.json();items.find(item=>item.id===foundation.id).title='Título de fixture longo: bancos, transações, consistência, escala e recuperação de operações em uma arquitetura distribuída com vários componentes';await route.fulfill({response,json:items});});await visit(long.page);await long.page.locator('.home-resume').waitFor({state:'visible'});assert.ok((await long.page.locator('[data-resume-title]').innerText()).includes('vários componentes'));await assertHeader(long.page);await save(long.page,'long-resume-title');await long.ctx.close();
  report.checks.push('Low/landscape viewport, absent metadata, complete long title fixture and root-font 200/400% reflow (not browser zoom)');

  const errorFixture=await context({width:390,height:844});
  errorFixture.page.removeAllListeners('console');errorFixture.page.on('console',message=>{if(message.type()==='error'&&!(message.location().url.endsWith('/search-index.json')&&message.text().includes('503')))failures.push(message.text());});
  let failSearch=true,releaseInitialSearch;const initialSearchGate=new Promise(resolve=>{releaseInitialSearch=resolve;});
  await errorFixture.ctx.route('**/search-index.json',async route=>{if(failSearch){await initialSearchGate;await route.fulfill({status:503,contentType:'application/json',body:'[]'});}else await route.continue();});
  await visit(errorFixture.page);await openSearch(errorFixture.page);assert.match(await errorFixture.page.locator('.search-status').innerText(),/Digite pelo menos/);await errorFixture.page.locator('#search-input').fill('idempotência');await errorFixture.page.waitForFunction(()=>document.querySelector('.search-status').dataset.state==='loading');releaseInitialSearch();await errorFixture.page.waitForFunction(()=>document.querySelector('.search-status').dataset.state==='error');assert.equal(await errorFixture.page.locator('[data-search-retry]').isVisible(),true);await save(errorFixture.page,'search-error-fixture');
  failSearch=false;await errorFixture.page.locator('[data-search-retry]').click();await errorFixture.page.waitForSelector('.search-result');assert.equal(await errorFixture.page.locator('#search-input').evaluate(e=>e===document.activeElement),true,'Retry returns focus to input');
  await errorFixture.page.locator('#search-input').fill('zxqv-nothing-found-fixture');await errorFixture.page.waitForFunction(()=>document.querySelector('.search-status').dataset.state==='empty');await save(errorFixture.page,'search-empty-fixture');
  for(let count=0;count<6;count++){await errorFixture.page.keyboard.press('Tab');assert.equal(await errorFixture.page.locator('.search-dialog').evaluate(dialog=>dialog.contains(document.activeElement)),true,'Search traps Tab');}
  await errorFixture.ctx.close();report.checks.push('Search initial/loading/empty/error/retry presentation, explicit503fixture, input focus and native modal Tab trapping');

  const blocked=await context({width:390,height:844,blocked:true});await visit(blocked.page);assert.match(await blocked.page.locator('.storage-notice').innerText(),/temporári|indisponível/);await openGlobal(blocked.page);await blocked.page.locator('#theme-preference').selectOption('dark');await closeGlobal(blocked.page);assert.equal(await blocked.page.locator('html').getAttribute('data-theme'),'dark');await blocked.ctx.close();
  const noJs=await context({width:320,height:740,javaScriptEnabled:false});await visit(noJs.page);for(const label of targets)assert.equal(await noJs.page.locator('.global-nav-fallback').getByRole('link',{name:label,exact:true}).isVisible(),true,'No-JS destination '+label);await save(noJs.page,'no-javascript-320');await noJs.ctx.close();
  report.checks.push('Storage-blocked theme remains usable, no-JavaScript global destinations remain available');
  const baseline=JSON.parse(await fs.readFile(path.join(output,'baseline.json'),'utf8'));for(const [url,entry]of Object.entries(baseline.routes)){const html=await fs.readFile(path.join(root,'dist',url),'utf8');for(const id of entry.ids)assert.ok(html.includes(`id="${id}"`),`Original route/anchor ${url}#${id}`);}
  const integration=await fs.readFile(path.join(output,'integration-baseline.json'),'utf8').then(JSON.parse).catch(()=>null);
  const preserved=integration||baseline;
  for(const [file,expected]of Object.entries(preserved.hashes||{}))assert.equal(crypto.createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex'),expected,`Policy/asset unchanged: ${file}`);
  for(const [file,expected]of Object.entries(preserved.artifactHashes||{}))assert.equal(crypto.createHash('sha256').update(await fs.readFile(path.join(root,'dist',file))).digest('hex'),expected,`Generated content/search policy unchanged: ${file}`);
  for(const [file,expected]of Object.entries(preserved.contentHashes||{}))assert.equal(crypto.createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex'),expected,`Study source unchanged: ${file}`);
  report.checks.push(integration?'Frozen integration policies, content, index, manifest, assets and CSP preserved':'Committed-base policies, content, index, manifest, assets and CSP preserved; uncommittedFSI integration not copied');
  assert.deepEqual(failures,[],'No console/CSP/network failures');
  const pairedBefore=await fs.readFile(path.join(output,'integration-ui-baseline.json'),'utf8').then(JSON.parse).catch(()=>baseline);
  const externalDomains=new Set();
  async function inspectDestinations(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await inspectDestinations(file);else if(file.endsWith('.html')){const text=await fs.readFile(file,'utf8');for(const match of text.matchAll(/\b(?:href|src)=["'](https?:[^"']+)/g))externalDomains.add(new URL(match[1]).host);}}}
  await inspectDestinations(path.join(root,'dist'));
  if(pairedBefore.externalDomains)for(const domain of externalDomains)assert.ok(pairedBefore.externalDomains.includes(domain),`No new external destination: ${domain}`);
  assert.deepEqual([...requestedOrigins],[new URL(base).origin],'UI uses only its existing same-origin resources');
  report.externalDomains={before:pairedBefore.externalDomains||null,after:[...externalDomains].sort(),requestedOrigins:[...requestedOrigins]};
  report.checks.push('No new external destination domains; focused UI requests remain same-origin');
  report.beforeAfter=report.matrix.map(after=>{const before=pairedBefore.metrics.find(item=>item.width===after.width&&item.height===after.height&&item.theme===after.theme&&item.history===(after.history?'resume':'empty'));return{width:after.width,height:after.height,theme:after.theme,history:after.history,beforeHeaderHeight:before?.header.height,afterHeaderHeight:after.header.height,beforeResumeHeight:after.history?before?.resume.height:null,afterResumeHeight:after.resume?.height??null};});
  await fs.writeFile(path.join(output,'ui-results.json'),JSON.stringify(report,null,2));
  console.log(`Header UI PASS: ${report.matrix.length} matrix states; ${report.screenshots.length} actual captures; ${report.checks.length} focused groups. ${base}`);
}finally{await browser.close();}
