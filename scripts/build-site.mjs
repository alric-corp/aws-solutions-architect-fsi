import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import MarkdownIt from 'markdown-it';
import GithubSlugger from 'github-slugger';
import { createHash } from 'node:crypto';
import { metadataFor, studentSearchMarkdown } from '../site/content-policy.mjs';
import { layout, tocFor, articleBody, homeBody, collectionBody, hubs } from '../site/templates.mjs';
import { siteName, firstLesson, sections, publicRoots, allowedAssetExtensions, sectionFor } from '../site/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const publicPath = file => file === 'README.md' || publicRoots.some(prefix => file.startsWith(prefix));
const sources = tracked.filter(file => publicPath(file) && file.endsWith('.md'));
if (sources.length < 10) throw new Error('Conteúdo de estudo ausente. Execute o build no checkout completo do Git.');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const plain = value => value.replace(/<[^>]*>/g, '').replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`#]/g, '').replace(/\s+/g, ' ').trim();
const urlFor = file => file === 'README.md' ? '/guia.html' : `/${file.replace(/README\.md$/, 'index.html').replace(/\.md$/, '.html')}`;
const documents = new Map();
const directories = new Set();

for (const source of sources) {
  if ((await fs.lstat(path.join(root, source))).isSymbolicLink()) throw new Error(`Link simbólico não publicável: ${source}`);
  let markdown = await fs.readFile(path.join(root, source), 'utf8');
  // A few source notes use plain text on the first line instead of a heading.
  if (!/^#\s+/m.test(markdown)) markdown = `# ${markdown.trimStart()}`;
  if (/(?:AKIA|ASIA)[A-Z0-9]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(markdown)) throw new Error(`Possível credencial em ${source}. Build interrompido.`);
  const metadata = metadataFor(source);
  const title = source.endsWith('/english-practice-60-min.md') ? 'English speaking practice — 60-minute session' : plain(markdown.match(/^#\s+(.+)$/m)?.[1] || source);
  const searchableMarkdown = metadata.search ? studentSearchMarkdown(markdown, source) : '';
  const contentVersion = createHash('sha256').update(markdown).digest('hex').slice(0,16);
  const description = plain((searchableMarkdown || title).split('\n\n').find(block => !/^(#|\||```|<|\[|\*\*ID)/.test(block) && block.length > 70) || title).slice(0, 220);
  documents.set(source, { ...metadata, source, markdown, searchableMarkdown, contentVersion, title, description, url: urlFor(source), section: sectionFor(source), minutes: Math.max(1, Math.ceil(plain(markdown).split(' ').length / 220)), headings: [] });
  let directory = path.posix.dirname(source);
  while (directory !== '.') {
    directories.add(directory);
    directory = path.posix.dirname(directory);
  }
}

const directoryUrl = directory => directory === '.' ? '/index.html' : `/${directory}/index.html`;
function resolveLink(href, source) {
  if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) return href;
  const match = href.match(/^([^?#]*)(.*)$/);
  const relative = decodeURIComponent(match[1]);
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(source), relative));
  const target = documents.get(resolved)?.url || (directories.has(resolved.replace(/\/$/, '')) || resolved === '.' ? directoryUrl(resolved.replace(/\/$/, '')) : `/${resolved}`);
  return target + match[2];
}

const md = new MarkdownIt({ html: true, linkify: true });
md.core.ruler.push('site-links-and-headings', state => {
  const slugger = new GithubSlugger();
  const doc = state.env.doc;
  for (let index = 0; index < state.tokens.length; index++) {
    const token = state.tokens[index];
    if (token.type === 'heading_open') {
      const inline = state.tokens[index + 1];
      const title = inline.children.filter(child => ['text', 'code_inline'].includes(child.type)).map(child => child.content).join('');
      const id = slugger.slug(title);
      token.attrSet('id', id);
      if (token.tag === 'h2' || token.tag === 'h3') doc.headings.push({ title, id, level: token.tag });
    }
    for (const child of token.children || []) {
      if (child.type === 'link_open') {
        child.attrSet('href', resolveLink(child.attrGet('href'), doc.source));
        if (/^https?:/.test(child.attrGet('href'))) child.attrSet('rel', 'noreferrer');
      }
      if (child.type === 'image') {
        child.attrSet('src', resolveLink(child.attrGet('src'), doc.source));
        child.attrSet('loading', 'lazy');
      }
    }
  }
});
const originalHeadingClose = md.renderer.rules.heading_close || ((tokens, index, options, env, self) => self.renderToken(tokens, index, options));
md.renderer.rules.heading_close = (tokens, index, options, env, self) => {
  const opening = tokens[index - 2];
  const copy = ['h2', 'h3'].includes(opening?.tag) ? `<button class="heading-link" data-heading-id="${escape(opening.attrGet('id'))}" aria-label="Copiar link para ${escape(env.doc.headings.find(h => h.id === opening.attrGet('id'))?.title || 'esta seção')}">#</button>` : '';
  return copy + originalHeadingClose(tokens,index,options,env,self);
};
const originalFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, index, options, env, self) => tokens[index].info.trim() === 'mermaid'
  ? `<figure class="diagram"><button class="diagram-expand">Ampliar diagrama</button><pre class="mermaid">${escape(tokens[index].content)}</pre><details class="diagram-source"><summary>Ver definição Mermaid</summary><pre><code>${escape(tokens[index].content)}</code></pre></details></figure>`
  : `<div class="code-block"><button class="copy-code" aria-label="Copiar código">Copiar código</button>${originalFence(tokens, index, options, env, self)}</div>`;
const rewriteHtml = (tokens, index, options, env) => tokens[index].content.replace(/\b(href|src)=(['"])(.*?)\2/g, (_, attr, quote, href) => `${attr}=${quote}${escape(resolveLink(href, env.doc.source))}${quote}`);
md.renderer.rules.html_block = rewriteHtml;
md.renderer.rules.html_inline = rewriteHtml;
md.renderer.rules.table_open = (tokens,index,options,env) => {
  let heading = env.doc.title;
  for(let i=index-1;i>=0;i--) if(tokens[i].type==='heading_open') { heading=plain(tokens[i+1].content); break; }
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="Tabela: ${escape(heading)}"><table>\n`;
};
md.renderer.rules.table_close = () => '</table></div>\n';

async function write(relative, content) {
  const file = path.join(output, relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

// Only this generated directory is replaced. The source Markdown stays intact.
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
const searchIndex = [];
for (const doc of documents.values()) {
  let html = md.render(doc.markdown, { doc });
  // Keep all legacy heading/explicit IDs. Neutralize this named English lesson
  // only in the presentation and index, leaving the source Markdown untouched.
  if (doc.source.endsWith('/english-practice-60-min.md')) {
    html = html.replace(/Vitória(?:'s|&#39;s)?/g, 'the candidate').replace('>English speaking practice — the candidate 60-minute session<', `>${escape(doc.title)}<`);
    doc.headings.forEach(heading => { heading.title = heading.title.replace(/Vitória(?:'s)?/g, 'the candidate'); });
  }
  doc.existingAnchors = [...new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]))];
  await write(doc.url.slice(1), layout({ title: doc.title, description: doc.description, body: articleBody(doc, html, documents), active: doc, toc: tocFor(doc), global:doc.type==='practice'||doc.audience==='instructor'?'/praticar/index.html':'/biblioteca/index.html', docs: documents }));
  if(doc.search) {
    const headings = [...doc.searchableMarkdown.matchAll(/^(#{1,3})\s+(.+)$/gm)];
    const used = new Set();
    for(let index=0;index<headings.length;index++) {
      const heading=headings[index];
      const label=plain(heading[2]);
      const original=heading[1].length===1?null:doc.headings.find(item=>plain(item.title)===label&&!used.has(item.id));
      if(original) used.add(original.id);
      const text=plain(doc.searchableMarkdown.slice(heading.index,headings[index+1]?.index));
      if(!text) continue;
      searchIndex.push({title:original?`${doc.title} · ${label}`:doc.title,url:doc.url+(original?`#${original.id}`:''),section:doc.section.label,description:original?text.slice(0,190):doc.description,text,contentId:doc.id});
    }
  }
}

for (const directory of directories) {
  if (documents.has(`${directory}/README.md`)) continue;
  const section = sectionFor(`${directory}/`);
  const title = sections.find(item => item.index === `${directory}/`)?.label || directory.split('/').at(-1).replace(/^\d+-/, '').replaceAll('-', ' ');
  const children = [...documents.values()].filter(doc => doc.source.startsWith(`${directory}/`) && doc.audience === 'student');
  const body = collectionBody(title, section.description || 'Explore o material e escolha seu próximo assunto.', children);
  await write(`${directory}/index.html`, layout({ title, description: `Material de ${title}`, body, docs: documents }));
}
await write('index.html', layout({ title: 'Sua biblioteca de arquitetura', description: 'Trilhas de arquitetura AWS, cases financeiros e prática de entrevista.', body: homeBody(documents), isHome: true, docs: documents }));
await write('404.html', layout({ title: 'Página não encontrada', description: 'Volte à biblioteca para continuar seu estudo.', body: '<section class="not-found"><h1>Vamos voltar ao percurso.</h1><p>Esta página não está disponível. Explore a biblioteca ou use a busca.</p><a href="/index.html">Voltar ao início →</a></section>', docs: documents }));
for(const hub of hubs(documents)) await write(hub.url.slice(1), layout({ title:hub.title,description:hub.title,body:hub.body,global:hub.url,docs:documents }));
await write('search-index.json', JSON.stringify(searchIndex));
await write('content-manifest.json', JSON.stringify([...documents.values()].map(({id,sourcePath,title,url:canonicalUrl,type,audience,publication,search,existingAnchors,topics,tracks,prerequisites,relatedPractice,contentVersion}) => ({id,sourcePath,title,canonicalUrl,type,audience,publication,search,existingAnchors,topics,tracks,prerequisites,relatedPractice,contentVersion})),null,2));

for (const asset of tracked.filter(file => publicPath(file) && allowedAssetExtensions.has(path.extname(file)))) {
  if ((await fs.lstat(path.join(root, asset))).isSymbolicLink()) throw new Error(`Link simbólico não publicável: ${asset}`);
  await write(asset, await fs.readFile(path.join(root, asset)));
}
for (const name of ['site.css', 'site.js', 'theme-init.js', 'search.mjs', 'favicon.svg']) await write(`assets/${name}`, await fs.readFile(path.join(root, 'site', name)));
for (const [family, name] of [['source-sans-3', 'source-sans']]) {
  const filename = `${family}-latin-wght-normal.woff2`;
  await write(`assets/${name}.woff2`, await fs.readFile(path.join(root, 'node_modules', '@fontsource-variable', family, 'files', filename)));
  await write(`assets/licenses/${name}.txt`, await fs.readFile(path.join(root, 'node_modules', '@fontsource-variable', family, 'LICENSE')));
}
// The original cover is explicit, independent of tracked Markdown selection.
await write('assets/amazon.jpg', await fs.readFile(path.join(root, 'amazon.jpg')));
// Mermaid stays self-hosted; no third-party CDN or runtime dependency on GitHub.
const mermaidDir = path.join(root, 'node_modules/mermaid/dist');
await write('assets/licenses/mermaid.txt', await fs.readFile(path.join(root, 'node_modules/mermaid/LICENSE')));
await write('assets/mermaid/mermaid.esm.min.mjs', await fs.readFile(path.join(mermaidDir, 'mermaid.esm.min.mjs')));
async function copyModules(directory, destination) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) await copyModules(path.join(directory, entry.name), `${destination}/${entry.name}`);
    else if (/\.m?js$/.test(entry.name)) await write(`${destination}/${entry.name}`, await fs.readFile(path.join(directory, entry.name)));
  }
}
await copyModules(path.join(mermaidDir, 'chunks/mermaid.esm.min'), 'assets/mermaid/chunks/mermaid.esm.min');
await write('robots.txt', 'User-agent: *\nAllow: /\n');
const inventory = { documents: documents.size, sourceFiles: sources, sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() };
await fs.mkdir(path.join(root, '.site'), { recursive: true });
await fs.writeFile(path.join(root, '.site/build.json'), JSON.stringify(inventory, null, 2) + '\n');
console.log(`Site gerado: ${documents.size} documentos + índices, imagens e busca → dist/`);
