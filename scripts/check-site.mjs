import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { publicRoots } from '../site/content.mjs';
import { metadataFor, studentSearchMarkdown } from '../site/content-policy.mjs';
import { rankSearch } from '../site/search.mjs';
import { continuityScopeFor } from '../site/collection-policy.mjs';

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
if (serializedIndex.includes('por onde você começaria este desenho?'.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) errors.push('Pergunta do case de pagamentos vazou para a busca global');

// Isolation is checked at metadata, emitted HTML and index levels. A missing
// card alone cannot prove that the collection is absent from the main journey.
const caseDocuments = manifest.filter(item => item.sourcePath.startsWith('cases/'));
if (!caseDocuments.length) errors.push('A coleção de cases foi removida do manifesto');
for (const item of caseDocuments) {
  if (item.collection !== 'fsi-cases' || item.standalone !== true || item.search !== false || item.progress !== false || continuityScopeFor(item) !== 'fsi-cases') errors.push(`Política de isolamento incompleta: ${item.id}`);
  if (item.tracks?.length || item.prerequisites?.length || item.relatedPractice?.length) errors.push(`Case conectado ao percurso principal por metadados: ${item.id}`);
}
const caseIds = new Set(caseDocuments.map(item => item.id));
const caseUrls = new Set(caseDocuments.map(item => item.canonicalUrl));
for (const item of manifest.filter(item => !caseIds.has(item.id))) {
  for (const field of ['tracks', 'prerequisites', 'relatedPractice', 'related', 'recommendations']) {
    for (const reference of item[field] || []) {
      const value = typeof reference === 'string' ? reference : JSON.stringify(reference);
      if (/cases\/|fsi-cases|FSI(?:0[1-9]|10)\b/.test(value) || caseIds.has(value) || caseUrls.has(value.split('#')[0])) errors.push(`Referência externa à coleção em ${item.id}.${field}: ${value}`);
    }
  }
}
const collectionMention = /\bcases\s+(?:(?:do\s+setor\s+)?financeir[oa]s?|fsi)\b|\bfsi cases\b|\bpara um case\b/i;
if (/(?:\/cases\/|cases\/\d{2}-|\bcase\s*\d{1,2}\b|\bFSI(?:0[1-9]|10)\b|cases fsi)/i.test(serializedIndex) || collectionMention.test(serializedIndex)) errors.push('Referência a cases presente nos textos/metadados do índice global');
let collectionEntries = 0;
for (const [file, content] of html) {
  if (file.startsWith('cases/')) continue;
  for (const match of content.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const target = new URL(decode(match[1]), `https://site.invalid/${file}`);
    if (!/(^|\/)cases(?:\/|$)/.test(target.pathname)) continue;
    if (file === 'biblioteca/index.html' && target.origin === 'https://site.invalid' && target.pathname === '/cases/index.html' && !target.hash) collectionEntries++;
    else errors.push(`Link para cases fora do ponto de entrada permitido: ${file} → ${match[1]}`);
  }
  const visibleText = decode(content.replace(/<[^>]*>/g, ' '));
  if (file !== 'biblioteca/index.html' && (/\bCases FSI\b|\bFSI(?:0[1-9]|10)\b|\bCase\s+\d{1,2}\b/i.test(visibleText) || collectionMention.test(visibleText))) errors.push(`Recomendação ou identificação de case apresentada fora da coleção: ${file}`);
}
if (collectionEntries !== 1) errors.push(`Biblioteca deve ter um único ponto de entrada para cases; encontrado: ${collectionEntries}`);
const collectionHtml = html.get('cases/index.html') || '';
if (!collectionHtml.includes('data-study-scope="fsi-cases"')) errors.push('Índice da coleção sem escopo próprio de progresso');
for (const doc of caseDocuments) {
  if (!collectionHtml.includes(`href="${doc.canonicalUrl}"`)) errors.push(`Case ausente do índice independente: ${doc.canonicalUrl}`);
  const content = html.get(doc.canonicalUrl.slice(1)) || '';
  if (!/coleção|colecao/i.test(decode(content.replace(/<[^>]*>/g, ' ')))) errors.push(`Case sem indicação da coleção opcional: ${doc.id}`);
  const pagination = content.match(/<nav class="article-pagination"[\s\S]*?<\/nav>/)?.[0] || '';
  for (const link of pagination.matchAll(/href="([^"]+)"/g)) {
    if (!/^\/cases\//.test(link[1]) && link[1] !== '/biblioteca/index.html') errors.push(`Continuidade de case escapa da coleção: ${doc.id} → ${link[1]}`);
  }
}

// Check the emitted course, not just copied files: git ls-files must include
// every new Markdown, and neither answers nor lab assets may leak into search.
const acidPrefix = 'technical-knowledge/01-fundamentals/acid/';
const acidDocuments = manifest.filter(item => item.sourcePath.startsWith(acidPrefix));
const acidFiles = [];
async function findAcidMarkdown(folder) {
  for (const entry of await fs.readdir(path.join(root, folder), { withFileTypes: true })) {
    const file = `${folder}/${entry.name}`;
    if (entry.isDirectory()) await findAcidMarkdown(file);
    else if (file.endsWith('.md')) acidFiles.push(file);
  }
}
await findAcidMarkdown(acidPrefix.slice(0, -1));
const acidSearch = index.filter(item => item.url.startsWith(`/${acidPrefix}`));
const acidSearchText = acidSearch.map(item => item.text).join(' ');
const searchPlain = value => value.replace(/<[^>]*>/g, '').replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`#]/g, '').replace(/\s+/g, ' ').trim();
for (const source of acidFiles) {
  const item = acidDocuments.find(item => item.sourcePath === source);
  if (!item || !inventory.sourceFiles.includes(source)) { errors.push(`Aula/apoio ACID não renderizado: ${source}`); continue; }
  if (!item.search || !item.progress || item.standalone || item.audience !== 'student' || !item.tracks.includes('acid-do-zero')) errors.push(`Política da trilha ACID incorreta: ${source}`);
  const markdown = await fs.readFile(path.join(root, source), 'utf8');
  if (crypto.createHash('sha256').update(markdown).digest('hex').slice(0, 16) !== item.contentVersion) errors.push(`Build ACID desatualizado: ${source}`);
  for (const answer of markdown.matchAll(/<details\b[^>]*>\s*<summary>(.*?)<\/summary>([\s\S]*?)<\/details>/g)) {
    const sample = searchPlain(answer[2]).slice(0, 120);
    if (sample.length > 80 && acidSearchText.includes(sample)) errors.push(`Resposta ACID vazou no índice: ${source}`);
  }
  const content = html.get(item.canonicalUrl.slice(1)) || '';
  const pagination = content.match(/<nav class="article-pagination"[\s\S]*?<\/nav>/)?.[0] || '';
  for (const link of pagination.matchAll(/href="([^"]+)"/g)) if (!link[1].startsWith(`/${acidPrefix}`)) errors.push(`Paginação ACID escapou da trilha: ${source}`);
}
const lessons = acidFiles.filter(source => /^\d{2}-[^/]+\.md$/.test(source.slice(acidPrefix.length))).sort();
if (lessons.length !== 10) errors.push(`Aulas ACID 00–09 incompletas: ${lessons.length}`);
const acidUrl = source => `/${source.replace(/README\.md$/, 'index.html').replace(/\.md$/, '.html')}`;
for (let position = 0; position < lessons.length; position++) {
  const content = html.get(acidUrl(lessons[position]).slice(1)) || '';
  const pagination = content.match(/<nav class="article-pagination"[\s\S]*?<\/nav>/)?.[0] || '';
  const previous = position ? lessons[position - 1] : `${acidPrefix}README.md`;
  if (!pagination.includes(`href="${acidUrl(previous)}"`)) errors.push(`Anterior ACID incorreto: ${lessons[position]}`);
  if (position < lessons.length - 1 && !pagination.includes(`href="${acidUrl(lessons[position + 1])}"`)) errors.push(`Próximo ACID incorreto: ${lessons[position]}`);
}
for (const file of ['technical-knowledge/01-fundamentals/index.html', 'technical-knowledge/01-fundamentals/06-databases-transactions-consistency.html']) {
  if (!html.get(file)?.includes(`href="/${acidPrefix}index.html"`)) errors.push(`Entrada ACID ausente: ${file}`);
}
for (const query of ['ACID', 'atomicidade', 'isolamento', 'idempotência', 'idempotencia', 'deadlock']) {
  if (!rankSearch(acidSearch, query).length) errors.push(`ACID não encontrado pela busca: ${query}`);
}
const sqlPage = await fs.readFile(path.join(root, acidPrefix, 'laboratorio/postgresql/sql-executavel.md'), 'utf8');
const sqlCopies = [...sqlPage.matchAll(/^## ([\w-]+\.sql)\n\n```sql\n([\s\S]*?)\n```/gm)];
if (sqlCopies.length !== 5) errors.push('SQL completo do laboratório deve conter os cinco scripts');
for (const [, filename, sql] of sqlCopies) if (sql.trim() !== (await fs.readFile(path.join(root, acidPrefix, 'laboratorio/postgresql', filename), 'utf8')).trim()) errors.push(`SQL copiável diverge do arquivo: ${filename}`);
for (const file of files) if (/\.(?:sql|sh|py)$/.test(file)) errors.push(`Script executável fora da distribuição revisada: ${file}`);

const isolationBaseline = await fs.readFile(path.join(root, '.site/cases-isolation/baseline.json'), 'utf8').then(JSON.parse).catch(() => null);
if (isolationBaseline) {
  for (const route of isolationBaseline.routes) if (!fileSet.has(route.slice(1))) errors.push(`Rota anterior ao isolamento perdida: ${route}`);
  for (const [route, before] of Object.entries(isolationBaseline.pages)) {
    for (const id of before.ids) if (!ids.get(route.slice(1))?.has(decode(id))) errors.push(`Âncora anterior ao isolamento perdida: ${route}#${id}`);
  }
  for (const [source, expected] of Object.entries(isolationBaseline.caseSources)) {
    if (crypto.createHash('sha256').update(await fs.readFile(path.join(root, source))).digest('hex') !== expected) errors.push(`Markdown original de case alterado: ${source}`);
  }
  for (const [route, before] of Object.entries(isolationBaseline.casePages)) {
    if (!before.proseHash) continue;
    const prose = html.get(route.slice(1))?.match(/<article class="prose">([\s\S]*?)<\/article>/)?.[1];
    if (typeof prose !== 'string' || crypto.createHash('sha256').update(prose).digest('hex') !== before.proseHash) errors.push(`Conteúdo renderizado original do case alterado: ${route}`);
  }
  for (const [asset, expected] of Object.entries(isolationBaseline.assetHashes)) {
    if (crypto.createHash('sha256').update(await fs.readFile(path.join(directory, asset))).digest('hex') !== expected) errors.push(`Asset visual existente alterado: ${asset}`);
  }
  for (const [file, expected] of Object.entries(isolationBaseline.hashes)) {
    if (crypto.createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex') !== expected) errors.push(`Infraestrutura/contrato fora do escopo alterado: ${file}`);
  }
}

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
