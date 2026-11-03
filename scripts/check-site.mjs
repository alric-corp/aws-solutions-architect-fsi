import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { publicRoots } from '../site/content.mjs';

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
  if (/(?:compensation-and-benefits|xx-xx-xx-|auditoria-pos-push)/.test(file)) errors.push(`Anotação local no artefato: ${file}`);
}
const index = JSON.parse(await fs.readFile(path.join(directory, 'search-index.json'), 'utf8'));
if (index.length !== inventory.documents) errors.push('Busca incompleta em relação ao inventário de documentos');
for (const item of index) if (!fileSet.has(item.url.slice(1)) || !item.text || !item.title) errors.push(`Entrada de busca inválida: ${item.url}`);
if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} falha(s). Deploy bloqueado.`);
  process.exit(1);
}
console.log(`Verificado: ${html.size} páginas, ${links} links/recursos internos, ${index.length} documentos na busca. Nenhum arquivo privado no artefato.`);
