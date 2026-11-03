import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { publicRoots } from '../site/content.mjs';
import { metadataFor, studentSearchMarkdown } from '../site/content-policy.mjs';
import { rankSearch } from '../site/search.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'dist');
const files = [];
async function walk(folder) {
  for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
    const target = path.join(folder, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Link simbólico no artefato: ${target}`);
    if (entry.isDirectory()) await walk(target);
    else files.push(path.relative(directory, target).split(path.sep).join('/'));
  }
}
await walk(directory);
const fileSet = new Set(files);
const html = new Map();
const ids = new Map();
const errors = [];
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
for (const file of files.filter(file => file.endsWith('.html'))) {
  const content = await fs.readFile(path.join(directory, file), 'utf8');
  html.set(file, content);
  ids.set(file, new Set([...content.matchAll(/\bid="([^"]+)"/g)].map(match => decode(match[1]))));
  if (!content.includes('<html lang="pt-BR">')) errors.push(`${file}: idioma ausente`);
  if (!content.includes('name="viewport"')) errors.push(`${file}: viewport ausente`);
  if (!content.includes('<h1')) errors.push(`${file}: título principal ausente`);
}
let links = 0;
for (const [file, content] of html) {
  for (const match of content.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const value = decode(match[1]);
    if (/^(?:mailto:|tel:|data:)/i.test(value)) continue;
    const url = new URL(value, `https://site.invalid/${file}`);
    if (url.origin !== 'https://site.invalid') continue;
    links++;
    let target = decodeURIComponent(url.pathname).slice(1);
    if (!target || target.endsWith('/')) target += 'index.html';
    if (!fileSet.has(target)) errors.push(`${file}: arquivo inexistente → ${value}`);
    else if (url.hash && target.endsWith('.html') && !ids.get(target).has(decodeURIComponent(url.hash.slice(1)))) errors.push(`${file}: âncora inexistente → ${value}`);
  }
}
const inventory = JSON.parse(await fs.readFile(path.join(root, '.site/build.json'), 'utf8'));
const tracked = new Set(execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0'));
for (const source of inventory.sourceFiles) {
  if (!tracked.has(source) || !(source === 'README.md' || publicRoots.some(prefix => source.startsWith(prefix)))) errors.push(`Fonte fora da seleção pública: ${source}`);
}
for (const file of files) {
  if (/(^|\/)(?:\.aws|\.git|\.env|scratchpad|node_modules)(\/|$)|\.(?:md|map|pem|key)$/.test(file)) errors.push(`Arquivo não publicável: ${file}`);
  if (/(?:compensation-and-benefits|xx-xx-xx-|auditoria-pos-push|redesign-references|Consolidacao_Redesign|Prompt_Implementacao|Pesquisa_UX_UI|QA_Proposta)/.test(file)) errors.push(`Anotação local no artefato: ${file}`);
}
const index = JSON.parse(await fs.readFile(path.join(directory, 'search-index.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(directory, 'content-manifest.json'), 'utf8'));
const manifestByUrl = new Map(manifest.map(item => [item.canonicalUrl, item]));
if (manifest.length !== inventory.documents) errors.push('Manifesto incompleto em relação ao inventário de documentos');
for (const item of manifest) {
  for (const field of ['id', 'sourcePath', 'canonicalUrl', 'type', 'audience', 'publication', 'existingAnchors', 'contentVersion']) if (item[field] === undefined) errors.push(`Campo ${field} ausente no manifesto: ${item.canonicalUrl}`);
  if (!Array.isArray(item.existingAnchors)) errors.push(`Âncoras inválidas no manifesto: ${item.id}`);
  if (!fileSet.has(item.canonicalUrl.slice(1))) errors.push(`Rota do manifesto ausente: ${item.canonicalUrl}`);
  if (item.audience === 'instructor' && item.search) errors.push(`Instrutor habilitado para busca de estudante: ${item.id}`);
}
for (const item of index) {
  const url = new URL(item.url, 'https://site.invalid');
  if (!fileSet.has(url.pathname.slice(1)) || !item.text || !item.title) errors.push(`Entrada de busca inválida: ${item.url}`);
  const content = manifestByUrl.get(url.pathname);
  if (!content || !content.search || content.audience === 'instructor' || content.publication !== 'public') errors.push(`Conteúdo fora da política de busca de estudante: ${item.url}`);
  if (url.hash && !ids.get(url.pathname.slice(1))?.has(decodeURIComponent(url.hash.slice(1)))) errors.push(`Destino da busca inexistente: ${item.url}`);
}
for (const item of manifest.filter(item => item.search)) if (!index.some(row => row.url.split('#')[0] === item.canonicalUrl)) errors.push(`Documento elegível ausente da busca: ${item.canonicalUrl}`);

// Negative policy fixtures use distinct content rather than matching the
// implementation's regular expressions. A harmless explanatory disclosure must
// survive; marked answers and mixed question/answer blocks must not leak.
const fixture = '# Estudo público\n\n## Conceito\n<details><summary>Como ler a legenda</summary>EXPLICACAO_PUBLICA_UNICA</details>\n<details><summary>Resposta comentada</summary>RESPOSTA_OCULTA_UNICA</details>\n## Perguntas de entrevista com respostas comentadas\n<details><summary>1. Como distinguir tentativa de efeito?</summary>GABARITO_MISTO_UNICO</details>\n';
const safeFixture = studentSearchMarkdown(fixture, 'cases/fixture.md');
assert.ok(safeFixture.includes('EXPLICACAO_PUBLICA_UNICA'), 'Detalhes explicativos públicos precisam continuar na busca');
assert.ok(safeFixture.includes('Como distinguir tentativa de efeito?'), 'A pergunta deve ser preservada');
assert.ok(!safeFixture.includes('RESPOSTA_OCULTA_UNICA') && !safeFixture.includes('GABARITO_MISTO_UNICO'), 'Corpos de resposta não podem entrar na busca');
assert.equal(metadataFor('interview/simulations/04-troubleshooting/02-pedido-durante-falha-do-banco/instrutor.md').search, false, 'Instrutor excluído no build');
const matchingFixture = [
  { title: 'Estar disponível', section: 'Leitura', description: 'A pessoa pode estar aqui', text: 'Estar é uma palavra completa.' },
  { title: 'Método STAR', section: 'Prática', description: 'Situação e tarefa', text: 'Método STAR para organizar histórias.' },
  { title: 'Repetições', section: 'Operação', description: 'Tentativa limitada', text: 'Retries e retentativas. TLS e idempotência.' }
];
assert.deepEqual(rankSearch(matchingFixture, 'STAR').map(match => match.item.title), ['Método STAR'], 'STAR nunca corresponde apenas a estar');
assert.equal(rankSearch(matchingFixture, 'idempotencia').length, 1, 'Busca normaliza acentos');
assert.equal(rankSearch(matchingFixture, 'TLS').length, 1, 'Busca preserva siglas');
assert.equal(rankSearch(matchingFixture, 'retentativa').length, 1, 'Flexão limitada de retentativa(s) preserva limite de termo');
const serializedIndex = JSON.stringify(index).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
for (const sentinel of ['Pelo papel da instituição e pela operação: autorizar cartão', 'O timeout não me diz se a compra foi gravada.', 'EXPLICACAO_PUBLICA_UNICA', 'RESPOSTA_OCULTA_UNICA', 'GABARITO_MISTO_UNICO']) {
  if (serializedIndex.includes(sentinel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())) errors.push(`Resposta, instrutor ou fixture presente no índice: ${sentinel}`);
}
if (!serializedIndex.includes('por onde você começaria este desenho?'.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) errors.push('Pergunta pública do case de pagamentos ausente da busca');

// Baseline comparison is optional on a fresh checkout; when this local audit is
// present it verifies the actual pre-redesign routes, content anchors, external
// destinations and infrastructure, instead of hard-coding historic counts.
const baseline = await fs.readFile(path.join(root, '.site/p0/baseline.json'), 'utf8').then(JSON.parse).catch(() => null);
if (baseline) {
  for (const route of baseline.routes) if (!fileSet.has(route.slice(1))) errors.push(`Rota anterior perdida: ${route}`);
  for (const [route, before] of Object.entries(baseline.pages)) {
    for (const id of before.ids) if (!ids.get(route.slice(1))?.has(decode(id))) errors.push(`Âncora anterior perdida: ${route}#${id}`);
  }
  for (const [file, expected] of Object.entries(baseline.hashes)) {
    const actual = crypto.createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex');
    if (actual !== expected) errors.push(`Arquivo fora do escopo alterado: ${file}`);
  }
  const canonical = value => new URL(decode(value)).href;
  const beforeExternal = new Set(baseline.externalDestinations.map(canonical));
  for (const [file, content] of html) for (const match of content.matchAll(/(?:href|src)=["'](https?:[^"']+)/g)) if (!beforeExternal.has(canonical(match[1]))) errors.push(`Novo destino externo em ${file}: ${match[1]}`);
}
for (const [file, content] of html) {
  if (/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?\S[\s\S]*?<\/script>/i.test(content)) errors.push(`Script inline incompatível com CSP: ${file}`);
  if (file.includes('/candidato.html') && /href=["'][^"']*(?:instrutor\.html|guia-do-instrutor\.html|diagnostico-inicial\.html)/.test(content)) errors.push(`Atalho para gabarito na página da candidata: ${file}`);
  if (/(?:Vitória|Vitória|Tomas e Vitória|\/Users\/tomasalric)/.test(content)) errors.push(`Dado pessoal ou caminho local no HTML: ${file}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} falha(s). Deploy bloqueado.`);
  process.exit(1);
}
console.log(`Verificado: ${html.size} páginas, ${links} links/recursos internos, ${index.length} entradas de busca. Somente fontes e assets selecionados no artefato.`);
