const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Reading still works without local storage. */ } }
};
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

const menu = $('.menu-toggle');
const sidebar = $('#navigation');
const backdrop = $('.nav-backdrop');
function setMenu(open) {
  document.body.classList.toggle('nav-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação');
  backdrop.hidden = !open;
  sidebar.inert = matchMedia('(max-width: 760px)').matches && !open;
  if (open) sidebar.querySelector('a').focus();
}
menu.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
backdrop.addEventListener('click', () => { setMenu(false); menu.focus(); });
matchMedia('(max-width: 760px)').addEventListener('change', () => setMenu(false));
setMenu(false);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('nav-open')) { setMenu(false); menu.focus(); }
  if (event.key === 'Tab' && document.body.classList.contains('nav-open') && !$('.search-dialog').open) {
    const items = [...sidebar.querySelectorAll('a,button,summary')].filter(element => element.getClientRects().length);
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
  }
});

const dialog = $('.search-dialog');
const input = $('#search-input');
const status = $('.search-status');
const results = $('.search-results');
let indexPromise;
let lastSearchTrigger;
function getIndex() {
  if (!indexPromise) indexPromise = fetch('/search-index.json').then(response => {
    if (!response.ok) throw new Error('Busca indisponível');
    return response.json();
  }).then(items => items.map(item => ({ ...item, normalizedTitle: normalize(item.title), normalizedText: normalize(item.text), normalizedSection: normalize(item.section) }))).catch(error => { indexPromise = undefined; throw error; });
  return indexPromise;
}
function openSearch(event) {
  lastSearchTrigger = event?.currentTarget || document.activeElement;
  dialog.showModal();
  input.focus();
  getIndex().catch(() => {});
}
$$('[data-search-open]').forEach(button => button.addEventListener('click', openSearch));
$('[data-search-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog && event.clientY < dialog.getBoundingClientRect().top) dialog.close(); });
dialog.addEventListener('close', () => lastSearchTrigger?.focus());
document.addEventListener('keydown', event => {
  const isTyping = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if (event.key === 'Escape' && dialog.open) { event.preventDefault(); dialog.close(); return; }
  if ((!isTyping && event.key === '/') || ((event.ctrlKey || event.metaKey) && event.key === 'k')) {
    event.preventDefault();
    if (!dialog.open) openSearch();
  }
});
let searchSequence = 0;
async function search() {
  const sequence = ++searchSequence;
  const query = normalize(input.value.trim());
  results.replaceChildren();
  if (query.length < 2) { status.textContent = 'Digite pelo menos 2 caracteres para buscar em todo o material.'; return; }
  status.textContent = 'Buscando no material…';
  try {
    const index = await getIndex();
    if (sequence !== searchSequence) return;
    const terms = query.split(/\s+/);
    const matches = index.map(item => ({ item, score: terms.every(term => `${item.normalizedTitle} ${item.normalizedText} ${item.normalizedSection}`.includes(term)) ? terms.reduce((score, term) => score + (item.normalizedTitle.includes(term) ? 20 : 0) + (item.normalizedSection.includes(term) ? 5 : 0) + 1, 0) : 0 })).filter(match => match.score > 0).sort((a, b) => b.score - a.score);
    status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'material encontrado' : 'materiais encontrados'}${matches.length > 30 ? ' · exibindo os 30 mais relevantes' : ''}` : 'Nenhum resultado. Tente outro assunto ou serviço, como “rede”, “Pix” ou “RDS”.';
    for (const { item } of matches.slice(0, 30)) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = item.url;
      const section = document.createElement('small'); section.textContent = item.section;
      const title = document.createElement('strong'); title.textContent = item.title;
      const excerpt = document.createElement('p');
      const offset = item.normalizedText.indexOf(terms[0]);
      const start = Math.max(0, offset - 65);
      excerpt.textContent = (start ? '…' : '') + item.text.slice(start, start + 190) + '…';
      link.append(section, title, excerpt);
      results.append(link);
    }
  } catch { status.textContent = 'Não foi possível carregar a busca. Tente digitar novamente em instantes.'; }
}
input.addEventListener('input', search);
input.addEventListener('keydown', event => { if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); } });
results.addEventListener('keydown', event => {
  const links = [...results.querySelectorAll('a')];
  const current = links.indexOf(document.activeElement);
  if (event.key === 'ArrowDown') { event.preventDefault(); links[Math.min(current + 1, links.length - 1)]?.focus(); }
  if (event.key === 'ArrowUp') { event.preventDefault(); if (current <= 0) input.focus(); else links[current - 1].focus(); }
});

const currentDocument = document.body.dataset.document;
const readKey = 'architecture-practice:read:v1';
const storedRead = storage.get(readKey, []);
const read = new Set(Array.isArray(storedRead) ? storedRead.filter(item => typeof item === 'string') : []);
const readToggle = $('.read-toggle');
function updateReading() {
  if (readToggle) {
    readToggle.setAttribute('aria-pressed', String(read.has(currentDocument)));
    readToggle.querySelector('span').textContent = read.has(currentDocument) ? 'Leitura concluída' : 'Marcar como lido';
  }
  const counter = $('#read-count');
  if (counter) {
    const progress = $('.progress-track');
    const max = Number(progress.getAttribute('aria-valuemax'));
    const count = Math.min(read.size, max);
    counter.textContent = String(count);
    progress.setAttribute('aria-valuenow', String(count));
    $('#read-progress').style.width = `${count / max * 100}%`;
  }
}
updateReading();
readToggle?.addEventListener('click', () => {
  read.has(currentDocument) ? read.delete(currentDocument) : read.add(currentDocument);
  storage.set(readKey, [...read]);
  updateReading();
});
if (currentDocument) storage.set('architecture-practice:recent:v1', { url: currentDocument, title: document.body.dataset.title });
else {
  const recent = storage.get('architecture-practice:recent:v1', null);
  const link = $('#resume-link');
  if (link && recent && typeof recent.url === 'string' && /^\/(?!\/)[a-zA-Z0-9/_-]+\.html$/.test(recent.url) && typeof recent.title === 'string') {
    link.href = recent.url; link.textContent = recent.title; $('.resume-study').hidden = false;
  }
}

function revealAnchor() {
  if (!location.hash) return;
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  let parent = target.parentElement;
  while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
  requestAnimationFrame(() => target.scrollIntoView());
}
window.addEventListener('hashchange', revealAnchor);
revealAnchor();
const headingLinks = new Map($$('.toc nav a').map(link => [decodeURIComponent(link.hash.slice(1)), link]));
if (headingLinks.size) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) {
      headingLinks.forEach(link => link.classList.remove('active'));
      headingLinks.get(visible[0].target.id)?.classList.add('active');
    }
  }, { rootMargin: '-100px 0px -65% 0px' });
  $$('.prose h2[id]').forEach(heading => observer.observe(heading));
}

const diagrams = $$('.mermaid');
if (diagrams.length) {
  try {
    const { default: mermaid } = await import('/assets/mermaid/mermaid.esm.min.mjs');
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', fontFamily: 'Source Sans, sans-serif', themeVariables: { primaryColor: '#eef3e9', primaryTextColor: '#243d43', primaryBorderColor: '#a9bca7', lineColor: '#71898b', secondaryColor: '#f8efd9', tertiaryColor: '#edf4f4' }, flowchart: { useMaxWidth: true, htmlLabels: true } });
    for (const diagram of diagrams) {
      const source = diagram.textContent;
      try { await mermaid.run({ nodes: [diagram] }); }
      catch (error) {
        console.error('Falha ao renderizar Mermaid:', error.message || String(error));
        diagram.removeAttribute('data-processed');
        diagram.textContent = source;
        diagram.classList.add('diagram-failed');
        const notice = document.createElement('p');
        notice.className = 'diagram-error';
        notice.textContent = 'Não foi possível renderizar o diagrama. A definição original está disponível abaixo.';
        diagram.before(notice);
      }
    }
    // Diagram layout can move an anchor after the page first appears.
    revealAnchor();
  } catch {
    for (const diagram of diagrams) diagram.classList.add('diagram-failed');
  }
}
