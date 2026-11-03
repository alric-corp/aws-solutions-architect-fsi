import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import MarkdownIt from 'markdown-it';
import GithubSlugger from 'github-slugger';
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
  const title = plain(markdown.match(/^#\s+(.+)$/m)?.[1] || source);
  const description = plain(markdown.split('\n\n').find(block => !/^(#|\||```|<|\[|\*\*ID)/.test(block) && block.length > 70) || title).slice(0, 220);
  documents.set(source, { source, markdown, title, description, url: urlFor(source), section: sectionFor(source), minutes: Math.max(1, Math.ceil(plain(markdown).split(' ').length / 220)), headings: [] });
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
const originalFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, index, options, env, self) => tokens[index].info.trim() === 'mermaid'
  ? `<div class="diagram"><pre class="mermaid">${escape(tokens[index].content)}</pre></div>`
  : originalFence(tokens, index, options, env, self);
const rewriteHtml = (tokens, index, options, env) => tokens[index].content.replace(/\b(href|src)=(['"])(.*?)\2/g, (_, attr, quote, href) => `${attr}=${quote}${escape(resolveLink(href, env.doc.source))}${quote}`);
md.renderer.rules.html_block = rewriteHtml;
md.renderer.rules.html_inline = rewriteHtml;
md.renderer.rules.table_open = () => '<div class="table-scroll" tabindex="0" role="region" aria-label="Tabela de conteúdo"><table>\n';
md.renderer.rules.table_close = () => '</table></div>\n';

const icons = {
  route: '<path d="M5 5h10a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h10"/><circle cx="5" cy="5" r="2"/><path d="m16 16 3 3-3 3"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-9 9 9 5 9-5M3 17l9 5 9-5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M14 6h4v5M6 14v4h5"/>',
  bank: '<path d="m3 8 9-5 9 5H3Zm2 3v7m7-7v7m7-7v7M3 21h18"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 11v-4a5 5 0 0 0-2-4"/>',
  chat: '<path d="M21 11a9 9 0 0 1-9 9H4l-3 3V11a10 10 0 0 1 20 0Z"/><path d="M6 8h10M6 12h7"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
  chart: '<path d="M4 3v17h17M8 15l4-5 4 2 5-7"/>',
  file: '<path d="M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8M8 16h6"/>',
  book: '<path d="M12 5c-3-3-7-3-10-2v16c4-1 7-1 10 2 3-3 6-3 10-2V3c-3-1-7-1-10 2Zm0 0v16"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  home: '<path d="m3 10 9-8 9 8v11h-7v-7h-4v7H3V10Z"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.file}</svg>`;
const hrefFor = source => documents.get(source)?.url || directoryUrl(source.replace(/\/$/, ''));
const sectionDocuments = section => [...documents.values()].filter(doc => doc.section.id === section.id);
const labelFor = doc => doc.source.endsWith('/README.md') ? 'Visão geral' : doc.title.replace(/^\d+\s*[—–-]\s*/, '').replace(/^Case \d+\s*[—–-]\s*/, '').replace(/^AWS Solutions Architect FSI — /, '');

function navigation(active) {
  return `<aside class="sidebar" id="navigation" aria-label="Navegação principal">
    <a class="brand" href="/index.html" aria-label="Arquitetura em prática — início"><span class="brand-mark">a<span>p</span><i></i></span><span>Arquitetura<small>em prática</small></span></a>
    <button class="search-trigger" data-search-open>${icon('search')}<span>Buscar no material</span><kbd>/</kbd></button>
    <nav><a class="nav-home ${!active ? 'active' : ''}" href="/index.html" ${!active ? 'aria-current="page"' : ''}>${icon('home')}<span>Visão geral</span></a>
    <p class="nav-label">SEU PERCURSO</p>${sections.map((section, index) => `${index === 6 ? '<p class="nav-label support-label">APOIO AO ESTUDO</p>' : ''}<details class="nav-group" ${active?.section.id === section.id ? 'open' : ''}><summary>${icon(section.icon)}<span>${section.label}</span><span class="chevron">›</span></summary><div class="nav-items">${sectionDocuments(section).sort((a, b) => (a.source === section.index ? -1 : b.source === section.index ? 1 : a.source.localeCompare(b.source))).map(doc => `<a href="${doc.url}" title="${escape(doc.title)}" ${active?.source === doc.source ? 'class="active" aria-current="page"' : ''}>${escape(labelFor(doc))}</a>`).join('')}</div></details>`).join('')}</nav>
    <div class="sidebar-footer"><span class="status-dot"></span>Um passo de cada vez.<small>Estude. Conecte. Explique.</small></div>
  </aside>`;
}

function layout({ title, description, body, active, toc = '', isHome = false }) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} · ${siteName}</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#142c38"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"><script type="module" src="/assets/site.js"></script></head>
  <body class="${isHome ? 'home-page' : 'reading-page'}" ${active ? `data-document="${escape(active.url)}" data-title="${escape(active.title)}"` : ''}>
  <a class="skip-link" href="#main">Pular para o conteúdo</a>${navigation(active)}<button class="nav-backdrop" aria-label="Fechar navegação" tabindex="-1" hidden></button>
  <div class="workspace"><header class="topbar"><div class="breadcrumbs"><button class="menu-toggle icon-button" aria-controls="navigation" aria-expanded="false" aria-label="Abrir navegação">${icon('menu')}</button><a href="/index.html">Biblioteca</a><span>/</span><span>${active ? escape(active.section.label) : 'Visão geral'}</span></div><div class="topbar-right"><span class="edition">AWS SOLUTIONS ARCHITECT <b>FSI</b></span><button class="icon-button compact-search" data-search-open aria-label="Buscar no material">${icon('search')}</button></div></header>
  <main id="main" tabindex="-1" class="${isHome ? 'home-main' : 'reading-main'}">${body}${toc}</main>
  <footer class="page-footer"><span>${siteName}<span class="footer-divider">/</span>AWS & Financial Services</span><span>Material independente de estudo · <a href="/references/index.html">Fontes e referências</a></span></footer></div>
  <dialog class="search-dialog" aria-labelledby="search-title"><div class="search-heading"><span id="search-title">Encontre seu próximo assunto</span><button class="icon-button" data-search-close aria-label="Fechar busca">${icon('close')}</button></div><div class="search-input-wrap">${icon('search')}<input id="search-input" type="search" autocomplete="off" placeholder="Busque por tema, serviço ou pergunta…" aria-label="Buscar no material"></div><p class="search-status" role="status">Digite pelo menos 2 caracteres para buscar em todo o material.</p><div class="search-results"></div><div class="search-footer">Fundamentos, cases, princípios e simulações em um só lugar.<kbd>esc</kbd></div></dialog>
  </body></html>`;
}

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
  const html = md.render(doc.markdown, { doc });
  const sequence = sectionDocuments(doc.section);
  const position = sequence.indexOf(doc);
  const next = sequence[position + 1];
  const previous = sequence[position - 1];
  const body = `<div class="article-column"><div class="article-kicker"><a href="${hrefFor(doc.section.index)}">${icon(doc.section.icon)}${doc.section.label}</a><span>${icon('clock')}${doc.minutes} min de leitura</span></div><article class="prose">${html}</article><div class="study-actions"><div><strong>Um passo a mais no seu percurso.</strong><span>Marque a leitura para acompanhar seu estudo neste navegador.</span></div><button class="read-toggle" aria-pressed="false">${icon('check')}<span>Marcar como lido</span></button></div><nav class="article-pagination" aria-label="Continuidade de leitura">${previous ? `<a href="${previous.url}"><small>← ANTERIOR</small>${escape(labelFor(previous))}</a>` : '<span></span>'}${next ? `<a href="${next.url}"><small>PRÓXIMO →</small>${escape(labelFor(next))}</a>` : `<a href="/index.html"><small>CONTINUAR EXPLORANDO →</small>Voltar à biblioteca</a>`}</nav></div>`;
  const toc = `<aside class="toc" aria-label="Nesta página"><p>NESTA PÁGINA</p><nav>${doc.headings.filter(h => h.level === 'h2').map(heading => `<a href="#${escape(heading.id)}">${escape(heading.title)}</a>`).join('')}</nav><a class="back-top" href="#main">Voltar ao início ↑</a></aside>`;
  await write(doc.url.slice(1), layout({ title: doc.title, description: doc.description, body, active: doc, toc }));
  searchIndex.push({ title: doc.title, url: doc.url, section: doc.section.label, description: doc.description, text: plain(doc.markdown) });
}

for (const directory of directories) {
  if (documents.has(`${directory}/README.md`)) continue;
  const section = sectionFor(`${directory}/`);
  const title = sections.find(item => item.index === `${directory}/`)?.label || directory.split('/').at(-1).replace(/^\d+-/, '').replaceAll('-', ' ');
  const children = [...documents.values()].filter(doc => doc.source.startsWith(`${directory}/`));
  const body = `<div class="collection"><span class="eyebrow">BIBLIOTECA DE ESTUDO</span><h1>${escape(title)}</h1><p>${section.description || 'Explore o material e escolha seu próximo assunto.'}</p><div class="collection-list">${children.map(doc => `<a href="${doc.url}"><div><small>${escape(doc.section.label)}</small><h2>${escape(doc.title)}</h2><p>${escape(doc.description)}</p></div>${icon('arrow')}</a>`).join('')}</div></div>`;
  await write(`${directory}/index.html`, layout({ title, description: `Material de ${title}`, body }));
}

const lesson = documents.get(firstLesson);
const homeBody = `<div class="home-heading"><span class="eyebrow">SUA BIBLIOTECA DE ARQUITETURA</span><span class="library-count"><span class="status-dot"></span>${documents.size} materiais para explorar</span></div>
<section class="hero"><div class="hero-copy"><span class="hero-tag">DA PRIMEIRA IDEIA À DECISÃO TÉCNICA</span><h1>Conhecimento que vira<br><em>decisão de arquitetura.</em></h1><p>Construa sua base, conecte os conceitos e pratique para uma conversa de Solutions Architect com foco em serviços financeiros.</p><a class="button button-primary" href="${lesson.url}">Começar a estudar ${icon('arrow')}</a><a class="hero-secondary" href="#trilhas">Explorar as trilhas ↓</a></div><div class="hero-map" aria-hidden="true"><div class="map-label">SEU CAMINHO, NA PRÁTICA</div><div class="map-step"><span>01</span><div>Entenda as peças<small>Fundamentos</small></div>${icon('layers')}</div><div class="map-connector"></div><div class="map-step"><span>02</span><div>Conecte as ideias<small>System Design</small></div>${icon('grid')}</div><div class="map-connector"></div><div class="map-step last"><span>03</span><div>Defenda as escolhas<small>Cases & entrevistas</small></div>${icon('chat')}</div><span class="map-note">O raciocínio vem antes do serviço.</span></div></section>
<section class="next-lesson" aria-labelledby="next-heading"><span class="lesson-icon">${icon('route')}</span><div><span class="eyebrow">SEU PRIMEIRO PASSO</span><h2 id="next-heading">Você clicou em um produto. O que aconteceu?</h2><p>Acompanhe a Loja Horizonte e descubra o caminho entre o navegador, a aplicação e os dados.</p></div><a href="${lesson.url}" class="lesson-link">Abrir aula 1 ${icon('arrow')}<small>${lesson.minutes} min de leitura</small></a></section>
<div class="resume-study" hidden><span>${icon('book')}Continue de onde parou</span><a id="resume-link" href="${lesson.url}"></a>${icon('arrow')}</div>
<section class="tracks" id="trilhas"><div class="section-heading"><div><span class="eyebrow">DO CONCEITO À PRÁTICA</span><h2>Escolha seu ponto de partida</h2></div><span>Um percurso. Diferentes formas de aprender.</span></div><div class="track-grid">${sections.slice(0, 6).map((section, index) => `<a class="track-card track-${section.id}" href="${hrefFor(section.index)}"><div class="track-card-top"><span class="track-icon">${icon(section.icon)}</span><span class="track-number">0${index + 1}</span></div><h3>${section.label}</h3><p>${section.description}</p><div class="track-card-bottom"><span>${section.id === 'guided' ? 'Trilha guiada' : section.id === 'fundamentals' ? '13 fundamentos · F00–F12' : section.id === 'design' ? '5 módulos · SD01–SD05' : section.id === 'cases' ? '10 cenários financeiros' : section.id === 'leadership' ? '16 princípios + método STAR' : 'Roteiros e prática de troubleshooting'}</span>${icon('arrow')}</div></a>`).join('')}</div></section>
<section class="practice-banner"><div><span class="eyebrow">APRENDER É TAMBÉM EXPLICAR</span><h2>Consegue contar o porquê da sua escolha?</h2><p>Use as simulações para organizar o raciocínio, testar hipóteses e responder aos próximos “e se?”.</p></div><a href="/interview/simulations/index.html">Praticar uma entrevista ${icon('arrow')}</a></section>
<section class="study-bottom"><div><span class="eyebrow">SEU DESENVOLVIMENTO</span><h2>Cada leitura conta.</h2><p><strong id="read-count">0</strong> de ${documents.size} materiais marcados como lidos neste navegador.</p><div class="progress-track" role="progressbar" aria-label="Materiais lidos" aria-valuemin="0" aria-valuemax="${documents.size}" aria-valuenow="0"><span id="read-progress"></span></div><a href="/progress/index.html">Explorar as matrizes de competências ${icon('arrow')}</a></div><div><span class="eyebrow">PREPARE SUA PRÓXIMA SESSÃO</span><a class="resource-row" href="/interview/interview-preparation-plan.html">Plano de preparação em 16 sessões ${icon('arrow')}</a><a class="resource-row" href="/templates/index.html">Templates para praticar ${icon('arrow')}</a><a class="resource-row" href="/guia.html">Como este material está organizado ${icon('arrow')}</a></div></section>`;
await write('index.html', layout({ title: 'Sua biblioteca de arquitetura', description: 'Trilhas de arquitetura AWS, cases financeiros, Leadership Principles e prática de entrevista. Dos fundamentos à decisão técnica.', body: homeBody, isHome: true }));
await write('404.html', layout({ title: 'Página não encontrada', description: 'Volte à biblioteca para continuar seu estudo.', body: `<section class="not-found"><span class="eyebrow">404 · CAMINHO NÃO ENCONTRADO</span><h1>Vamos voltar ao percurso.</h1><p>Esta página não está disponível. Explore a biblioteca ou use a busca para encontrar o assunto.</p><a class="button button-primary" href="/index.html">Voltar à biblioteca ${icon('arrow')}</a></section>` }));
await write('search-index.json', JSON.stringify(searchIndex));

for (const asset of tracked.filter(file => publicPath(file) && allowedAssetExtensions.has(path.extname(file)))) {
  if ((await fs.lstat(path.join(root, asset))).isSymbolicLink()) throw new Error(`Link simbólico não publicável: ${asset}`);
  await write(asset, await fs.readFile(path.join(root, asset)));
}
for (const name of ['site.css', 'site.js', 'favicon.svg']) await write(`assets/${name}`, await fs.readFile(path.join(root, 'site', name)));
for (const [family, name] of [['manrope', 'manrope'], ['source-sans-3', 'source-sans']]) {
  const filename = `${family}-latin-wght-normal.woff2`;
  await write(`assets/${name}.woff2`, await fs.readFile(path.join(root, 'node_modules', '@fontsource-variable', family, 'files', filename)));
  await write(`assets/licenses/${name}.txt`, await fs.readFile(path.join(root, 'node_modules', '@fontsource-variable', family, 'LICENSE')));
}
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
