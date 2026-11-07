import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:4307';
assert.ok(['127.0.0.1','localhost','[::1]'].includes(new URL(base).hostname),'Somente preview local');
const prefix='/technical-knowledge/01-fundamentals/redes/';
const output=path.join(root,'.site/redes-review/browser');await fs.mkdir(output,{recursive:true});
const manifest=JSON.parse(await fs.readFile(path.join(root,'dist/content-manifest.json'),'utf8'));
const index=JSON.parse(await fs.readFile(path.join(root,'dist/search-index.json'),'utf8'));
const docs=manifest.filter(d=>d.sourcePath.includes('/redes/'));
assert.ok(docs.length>=35,'Novas aulas e apoios precisam estar no build');
const report={base,documents:docs.length,matrix:[],pages:[],captures:[],checks:[],errors:[],limitations:['Chromium local; não Safari/dispositivo físico/zoom real/WCAG integral.','Configuração, diagramas e fixtures não são testes de serviços AWS.','Entrada externa, curso curado e navegação compartilhada dependem de integração posterior.']};
const origins=new Set();
const installed=(await fs.readdir(path.join(os.homedir(),'Library/Caches/ms-playwright'))).filter(n=>n.startsWith('chromium_headless_shell-')).sort().at(-1);
const executablePath=process.env.CHROMIUM_PATH||path.join(os.homedir(),'Library/Caches/ms-playwright',installed,'chrome-headless-shell-mac-arm64/chrome-headless-shell');
const browser=await chromium.launch({executablePath,headless:true});report.browser=browser.version();
const normalize=t=>t.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
async function profile(width=1440,theme='light',js=true){
 const ctx=await browser.newContext({viewport:{width,height:width===390?844:1000},colorScheme:theme,reducedMotion:'reduce',javaScriptEnabled:js});
 await ctx.addInitScript(()=>{window.__redesReady=false;document.addEventListener('architecture-diagrams-ready',()=>window.__redesReady=true);});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('request',r=>{if(/^https?:/.test(r.url()))origins.add(new URL(r.url()).origin);});
 return {ctx,page};
}
async function noOverflow(page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow global: '+page.url());}
async function visit(page,url){const r=await page.goto(base+url);if(r)assert.equal(r.status(),200,url);await page.evaluate(()=>document.fonts.ready);if(await page.locator('.mermaid').count())await page.waitForFunction(()=>window.__redesReady&&[...document.querySelectorAll('.mermaid')].every(d=>d.querySelector('svg')));assert.equal(await page.locator('.diagram-failed').count(),0);await noOverflow(page);}
async function save(page,name,fullPage=false){await page.screenshot({path:path.join(output,name+'.png'),fullPage,animations:'disabled'});report.captures.push(name+'.png');}
let fragments=0;
try{
 const all=await profile();
 for(const doc of docs){
  await visit(all.page,doc.canonicalUrl);
  assert.equal(await all.page.locator('.prose h1').count(),1,doc.sourcePath);
  const answers=all.page.locator('.prose details:not(.diagram-source)');
  assert.ok(await answers.evaluateAll(a=>a.every(e=>!e.open)),'Respostas recolhidas: '+doc.sourcePath);
  if(doc.sourcePath.endsWith('/instrutor.md')){assert.equal(doc.audience,'instructor');assert.equal(doc.search,false);assert.equal(doc.progress,false);}
  else{
   assert.equal(doc.audience,'student');
   const texts=await all.page.locator('.prose').evaluate(p=>{const c=p.cloneNode(true);c.querySelectorAll('details').forEach(d=>d.replaceWith(d.querySelector('summary').cloneNode(true)));return{visible:c.textContent,hidden:[...p.querySelectorAll('details:not(.diagram-source)')].map(d=>{const c=d.cloneNode(true);c.querySelector('summary').remove();return c.textContent;})};});
   const indexed=normalize(index.filter(i=>new URL(i.url,base).pathname===doc.canonicalUrl).map(i=>i.text).join(' ')),visible=normalize(texts.visible);
   for(const text of texts.hidden){const w=normalize(text).split(' ');for(let i=0;i+12<=w.length;i++){const f=w.slice(i,i+12).join(' ');if(!visible.includes(f)){assert.ok(!indexed.includes(f),'Resposta vazou: '+doc.sourcePath);fragments++;}}}
  }
  if(doc.sourcePath.endsWith('/candidato.md'))assert.equal(await all.page.locator('.prose a[href*="instrutor"]').count(),0,'Abertura sem gabarito');
  report.pages.push({url:doc.canonicalUrl,audience:doc.audience,mermaid:await all.page.locator('.mermaid svg').count(),answers:await answers.count()});
 }
 await all.ctx.close();report.hiddenAnswerFragments=fragments;
 report.checks.push('Todas novas páginas renderizadas; Mermaid real, disclosures fechados, metadata aluno/instrutor e respostas fora da busca');
 const chapters=['00-clique-resposta','01-ip-cidr-subnets','03-dns-nomes','05-https-tls','07-sg-nacl','10-peering-tgw','12-falha-recuperacao-dns','13-revisao-desafios'];
 for(const width of [390,1440])for(const theme of ['light','dark']){
  const p=await profile(width,theme);
  for(const name of chapters){await visit(p.page,prefix+name+'.html');assert.equal(await p.page.locator('html').getAttribute('data-theme'),theme);
   for(const table of await p.page.locator('.table-scroll').all())assert.ok(await table.evaluate(e=>{if(e.scrollWidth<=e.clientWidth+1)return true;e.scrollLeft=e.scrollWidth;return e.scrollLeft>0;}),'Tabela rola localmente');
  }
  await visit(p.page,prefix+'README.md'.replace('README.md','index.html'));await save(p.page,`indice-${width}-${theme}`);
  await visit(p.page,prefix+'01-ip-cidr-subnets.html');await save(p.page,`cidr-${width}-${theme}`);
  await p.page.locator('.diagram-expand').first().click();const stage=p.page.locator('#diagram-dialog .diagram-stage');assert.ok(await p.page.locator('#diagram-dialog').evaluate(d=>d.open));await p.page.locator('[data-diagram-zoom="in"]').click();assert.ok(await stage.evaluate(e=>{if(e.scrollHeight<=e.clientHeight+1)return true;e.scrollTop=e.scrollHeight;return e.scrollTop>0;}));await save(p.page,`diagrama-${width}-${theme}`);await p.page.keyboard.press('Escape');
  await p.page.locator('.prose details:not(.diagram-source)').first().locator('summary').focus();await p.page.keyboard.press('Enter');assert.equal(await p.page.locator('.prose details:not(.diagram-source)').first().evaluate(d=>d.open),true);
  report.matrix.push({width,theme,chapters:chapters.length});await p.ctx.close();
 }
 report.checks.push('390/1440 claro/escuro, tabelas semoverflowglobal, visualizador, teclado e respostas nativas');
 const p=await profile();await visit(p.page,prefix+'01-ip-cidr-subnets.html');const anchor=await p.page.locator('.prose h2[id]').first().getAttribute('id');
 await visit(p.page,prefix+'01-ip-cidr-subnets.html#'+encodeURIComponent(anchor));
 await p.page.waitForFunction(id=>JSON.parse(localStorage.getItem('architecture-practice:study:v2'))?.resume.student?.anchor===id,anchor);
 await visit(p.page,'/meu-estudo/index.html');await p.page.locator('#resume-link').waitFor({state:'visible'});assert.equal(await p.page.locator('#resume-link').getAttribute('href'),prefix+'01-ip-cidr-subnets.html#'+encodeURIComponent(anchor));
 await visit(p.page,prefix+'index.html');await p.page.locator('[data-search-open]').filter({visible:true}).first().click();await p.page.locator('#search-input').fill('Redes do zero');await p.page.waitForFunction(()=>document.querySelector('.search-status')?.dataset.state==='results');assert.ok((await p.page.locator('.search-result').evaluateAll(a=>a.map(a=>a.pathname))).includes(prefix+'index.html'));assert.equal(await p.page.locator('.search-result[href*="instrutor"], .search-result[href^="/cases/"]').count(),0);await save(p.page,'busca');await p.ctx.close();
 report.checks.push('Busca pública encontra nova trilha sem instrutor/FSI; retomada com âncora real preservada');
 const nojs=await profile(390,'light',false);assert.equal((await nojs.page.goto(base+prefix+'01-ip-cidr-subnets.html')).status(),200);const answer=nojs.page.locator('.prose details:not(.diagram-source)').first();await answer.locator('summary').click();assert.equal(await answer.evaluate(d=>d.open),true);await noOverflow(nojs.page);await save(nojs.page,'sem-js');await nojs.ctx.close();
 assert.deepEqual(report.errors,[]);assert.deepEqual([...origins],[new URL(base).origin]);report.status='PASS';await fs.writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,pages:report.pages.length,states:report.matrix.length,fragments,captures:report.captures.length,checks:report.checks.length,errors:report.errors}));
}finally{await browser.close();}
