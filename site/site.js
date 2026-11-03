import { normalize, tokenize, rankSearch } from './search.mjs';
import { participatesInMainStudy, continuityScopeFor, isStandalone, isStandaloneReference } from './collection-policy.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const readKey = 'architecture-practice:study:v2';
const preferenceKey = 'architecture-practice:preferences:v1';
const memory = new Map();
let storageUnavailable = Boolean(window.__architectureStorageUnavailable);

function notice(className, message) {
  let element = $(`.${className}`);
  if (!element) {
    element = document.createElement('p'); element.className = className;
    element.setAttribute('role', 'status'); ($('main') || document.body).prepend(element);
  }
  element.hidden = false; element.textContent = message; return element;
}
function storageWarning() {
  storageUnavailable = true;
  notice('storage-notice', 'O armazenamento do navegador está indisponível. Você pode continuar estudando, mas as preferências e os registros desta página são temporários e podem se perder ao sair.');
}
const storage = {
  get(key, fallback) {
    if (memory.has(key)) return memory.get(key);
    let raw;
    try { raw = localStorage.getItem(key); } catch { storageWarning(); return fallback; }
    if (!raw) return fallback;
    try { const value = JSON.parse(raw); memory.set(key, value); return value; } catch { return fallback; }
  },
  set(key, value) {
    memory.set(key, value);
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { storageWarning(); return false; }
  }
};
if (storageUnavailable) storageWarning();
try { localStorage.setItem('architecture-practice:storage-check', '1'); localStorage.removeItem('architecture-practice:storage-check'); }
catch { storageWarning(); }
const feedback = message => notice('interaction-status', message);
let preferences = storage.get(preferenceKey, {});
if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) preferences = {};
const savePreferences = () => storage.set(preferenceKey, preferences);

const themeSelect = $('#theme-preference');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let themePreference = ['light', 'dark', 'system'].includes(preferences.theme) ? preferences.theme : (window.__architectureThemePreference || 'system');
function applyTheme() {
  const theme = themePreference === 'system' ? (systemTheme.matches ? 'dark' : 'light') : themePreference;
  const previous = document.documentElement.dataset.theme;
  document.documentElement.dataset.theme = theme;
  if (themeSelect) themeSelect.value = themePreference;
  if (previous !== theme) document.dispatchEvent(new CustomEvent('architecture-theme-change', { detail: { theme } }));
}
themeSelect?.addEventListener('change', () => {
  themePreference = ['light', 'dark', 'system'].includes(themeSelect.value) ? themeSelect.value : 'system';
  preferences.theme = themePreference; savePreferences(); applyTheme();
});
systemTheme.addEventListener('change', () => { if (themePreference === 'system') applyTheme(); });
applyTheme();
const sizes = ['normal', 'large', 'larger'];
const sizeLabels = ['Texto padrão', 'Texto ampliado', 'Texto maior'];
let textSize = Number.isInteger(preferences.textSize) ? Math.max(0, Math.min(2, preferences.textSize)) : 0;
function applyTextSize() {
  document.body.dataset.textSize = sizes[textSize];
  $$('.text-size-label').forEach(label => { label.textContent = sizeLabels[textSize]; });
  $$('[data-text-size="decrease"]').forEach(button => { button.disabled = textSize === 0; });
  $$('[data-text-size="increase"]').forEach(button => { button.disabled = textSize === sizes.length - 1; });
}
$$('button[data-text-size]').forEach(button => button.addEventListener('click', () => {
  textSize = Math.max(0, Math.min(2, textSize + (button.dataset.textSize === 'increase' ? 1 : -1)));
  preferences.textSize = textSize; savePreferences(); applyTextSize();
}));
applyTextSize();
const focusToggle = $('#focus-toggle');
function setFocusMode(value) {
  value = Boolean(value && focusToggle);
  document.body.classList.toggle('focus-mode', value); focusToggle?.setAttribute('aria-pressed', String(value));
  if (focusToggle) focusToggle.textContent = value ? 'Sair do modo foco' : 'Modo foco';
  const pageToc = $('#page-toc');
  if (pageToc instanceof HTMLDetailsElement) pageToc.open = !value && matchMedia('(min-width: 1200px)').matches;
}
setFocusMode(Boolean(preferences.focusMode));
focusToggle?.addEventListener('click', () => {
  preferences.focusMode = !document.body.classList.contains('focus-mode'); setFocusMode(preferences.focusMode); savePreferences();
});

const menu = $('.menu-toggle');
const sidebar = $('#navigation');
const backdrop = $('.nav-backdrop');
const drawerMedia = matchMedia('(max-width: 1020px)');
function setMenu(open) {
  if (open) for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close();
  document.body.classList.toggle('nav-open', open);
  menu?.setAttribute('aria-expanded', String(open)); menu?.setAttribute('aria-label', open ? 'Fechar área da aula' : 'Abrir área da aula');
  if (backdrop) backdrop.hidden = !open;
  if (sidebar) sidebar.inert = drawerMedia.matches && !open;
  if (open) sidebar?.querySelector('a,button,summary')?.focus();
}
menu?.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
backdrop?.addEventListener('click', () => { setMenu(false); menu?.focus(); });
drawerMedia.addEventListener('change', () => setMenu(false)); setMenu(false);
// Header presentation is independent of study storage and search ranking.
const header = $('.topbar');
const headerInner = $('.header-inner');
const globalNav = $('.global-nav');
const themeControl = $('#theme-control');
const globalMenu = $('#global-menu-panel');
const globalMenuButton = $('#global-menu-toggle');
const globalMenuContent = globalMenu?.querySelector('.global-menu-content');
const globalNavHome = document.createComment('Global navigation desktop position');
const themeHome = document.createComment('Theme desktop position');
globalNav?.before(globalNavHome); themeControl?.before(themeHome);
let headerFrame = 0;
let lastHeaderOffset = -1;
let globalReturnFocus;
function isVisibleControl(element) {
  return Boolean(element?.isConnected && element.getClientRects().length && !element.closest('[inert], [hidden]'));
}
function focusVisible(preferred) {
  const target = [preferred, $('[data-search-open]'), globalMenuButton, $('.brand')].find(isVisibleControl);
  if (target) {
    const rect = target.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > innerHeight) target.scrollIntoView({ block: 'nearest' });
    target.focus({ preventScroll: true });
  }
}
function restoreOverlayFocus(preferred) {
  if (!document.querySelector('dialog[open]') && !document.body.classList.contains('nav-open')) focusVisible(preferred);
}
function updateModalState() {
  document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
}
// Keep the site's modal tab sequence inside the dialog, including at its
// boundaries where browser chrome can otherwise receive focus.
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('keydown', event => {
  if (!dialog.open || event.key !== 'Tab' || event.defaultPrevented) return;
  const controls = [...dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
  const first = controls[0], last = controls.at(-1);
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
function prepareDialog(next) {
  setMenu(false);
  for (const dialog of document.querySelectorAll('dialog[open]')) if (dialog !== next) dialog.close();
}
function placeHeaderControls(compact) {
  if (compact && globalMenuContent) {
    if (globalNav && globalNav.parentElement !== globalMenuContent) globalMenuContent.append(globalNav);
    if (themeControl && themeControl.parentElement !== globalMenuContent) globalMenuContent.append(themeControl);
  } else {
    if (globalNav && globalNavHome.parentNode && globalNav.previousSibling !== globalNavHome) globalNavHome.after(globalNav);
    if (themeControl && themeHome.parentNode && themeControl.previousSibling !== themeHome) themeHome.after(themeControl);
  }
}
function measureHeader() {
  headerFrame = 0;
  if (!header || !headerInner || !globalMenuButton || !globalMenuContent) return;
  const focused = document.activeElement;
  const wasCompact = document.body.classList.contains('header-compact');
  let compact = innerWidth < 1024 || document.body.classList.contains('focus-mode');
  if (!compact) {
    document.body.classList.remove('header-compact');
    placeHeaderControls(false);
    const regions = [$('.brand'), $('.desktop-nav-slot'), $('.header-utilities')].filter(Boolean);
    compact = regions.some(region => region.scrollWidth > region.clientWidth + 1)
      || headerInner.scrollWidth > headerInner.clientWidth + 1;
    const links = [...(globalNav?.querySelectorAll('a') || [])];
    if (links.length) compact ||= links.some(link => Math.abs(link.getBoundingClientRect().top - links[0].getBoundingClientRect().top) > 2);
  }
  document.body.classList.toggle('header-compact', compact);
  placeHeaderControls(compact);
  document.body.classList.add('header-ready');
  globalMenuButton.hidden = false;
  document.body.classList.remove('header-stacked');
  const brand = $('.brand'), utilities = $('.header-utilities');
  const headerGap = parseFloat(getComputedStyle(headerInner).columnGap) || 0;
  const stacked = compact && brand && utilities && brand.scrollWidth + utilities.scrollWidth + headerGap > headerInner.clientWidth + 1;
  document.body.classList.toggle('header-stacked', Boolean(stacked));
  if (!compact && globalMenu.open) {
    globalReturnFocus = isVisibleControl(focused) ? focused : $('.brand');
    globalMenu.close();
  } else if (!isVisibleControl(focused) && focused !== document.body && !document.querySelector('dialog[open]')) {
    focusVisible(compact ? globalMenuButton : $('.brand'));
  } else if (globalMenu.open && (wasCompact !== compact || document.activeElement !== focused) && globalMenu.contains(focused)) {
    focused.focus({ preventScroll: true });
  }
  const height = header.getBoundingClientRect().height;
  // Very large text must remain scrollable instead of becoming an oversized
  // sticky obstruction. Measuring height never controls the header's own size.
  const unpinned = height > (window.visualViewport?.height || innerHeight) / 2;
  document.body.classList.toggle('header-unpinned', unpinned);
  const offset = unpinned ? 0 : height;
  if (Math.abs(offset - lastHeaderOffset) > .25) {
    document.documentElement.style.setProperty('--header-offset', `${offset}px`);
    lastHeaderOffset = offset;
  }
}
function scheduleHeaderLayout() { if (!headerFrame) headerFrame = requestAnimationFrame(measureHeader); }
function updateViewportGeometry() {
  const viewport = window.visualViewport;
  document.documentElement.style.setProperty('--visual-viewport-height', `${viewport?.height || innerHeight}px`);
  document.documentElement.style.setProperty('--visual-viewport-top', `${viewport?.offsetTop || 0}px`);
}
if (globalMenuButton && globalMenu) {
  globalMenuButton.addEventListener('click', () => {
    if (globalMenu.open) { globalMenu.close(); return; }
    prepareDialog(globalMenu);
    globalReturnFocus = globalMenuButton;
    globalMenu.showModal(); updateModalState();
    globalMenuButton.setAttribute('aria-expanded', 'true');
    globalMenu.querySelector('[data-global-menu-close]')?.focus();
  });
  globalMenu.querySelector('[data-global-menu-close]')?.addEventListener('click', () => globalMenu.close());
  globalMenu.addEventListener('close', () => {
    globalMenuButton.setAttribute('aria-expanded', 'false'); updateModalState();
    restoreOverlayFocus(globalReturnFocus || globalMenuButton); globalReturnFocus = undefined;
  });
  globalMenu.addEventListener('click', event => {
    if (event.target !== globalMenu) return;
    const rect = globalMenu.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) globalMenu.close();
  });
}
if (header) {
  new ResizeObserver(scheduleHeaderLayout).observe(header);
  if (headerInner) new ResizeObserver(scheduleHeaderLayout).observe(headerInner);
  let headerFocusMode = document.body.classList.contains('focus-mode');
  new MutationObserver(() => {
    const focused = document.body.classList.contains('focus-mode');
    if (focused !== headerFocusMode) { headerFocusMode = focused; scheduleHeaderLayout(); }
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.fonts?.ready.then(scheduleHeaderLayout);
  addEventListener('resize', scheduleHeaderLayout);
  updateViewportGeometry(); window.visualViewport?.addEventListener('resize', updateViewportGeometry); window.visualViewport?.addEventListener('scroll', updateViewportGeometry);
  measureHeader();
}
const searchHint = $('.search-hint');
const platform = navigator.userAgentData?.platform || navigator.platform || '';
const mobilePlatform = navigator.userAgentData?.mobile || /iPad|iPhone|Android/i.test(navigator.userAgent) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1);
if (searchHint && !mobilePlatform && /Mac|Win|Linux|Chrome OS/i.test(platform)) {
  const mac = /Mac/i.test(platform);
  searchHint.textContent = mac ? '⌘ K' : 'Ctrl K'; searchHint.hidden = false;
  searchHint.setAttribute('aria-label', mac ? 'Command mais K' : 'Control mais K');
  $('[data-search-open]')?.setAttribute('aria-keyshortcuts', mac ? 'Meta+K' : 'Control+K');
  scheduleHeaderLayout();
}
const toc = $('#page-toc');
const tocMedia = matchMedia('(min-width: 1200px)');
function setTocDefault() { if (toc instanceof HTMLDetailsElement) toc.open = tocMedia.matches && !document.body.classList.contains('focus-mode'); }
setTocDefault(); tocMedia.addEventListener('change', setTocDefault);
$$('.toc-toggle').forEach(button => button.addEventListener('click', () => {
  if (toc instanceof HTMLDetailsElement) { toc.open = !toc.open; button.setAttribute('aria-expanded', String(toc.open)); }
}));

const searchDialog = $('.search-dialog');
const input = $('#search-input');
const searchStatus = $('.search-status');
const results = $('.search-results');
let indexPromise;
let lastSearchTrigger;
let searchLayoutFrame = 0;
function measureSearchLayout() {
  searchLayoutFrame = 0;
  if (!searchDialog?.open) return;
  const style = getComputedStyle(searchDialog);
  const viewportHeight = window.visualViewport?.height || innerHeight;
  const maximum = parseFloat(style.maxHeight);
  const available = Number.isFinite(maximum) ? Math.min(viewportHeight, maximum) : viewportHeight - (parseFloat(style.marginTop) || 0) - 16;
  const fixedHeight = [...searchDialog.children].filter(element => element !== results).reduce((height, element) => {
    const computed = getComputedStyle(element);
    return height + element.getBoundingClientRect().height + (parseFloat(computed.marginTop) || 0) + (parseFloat(computed.marginBottom) || 0);
  }, (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0));
  searchDialog.classList.toggle('search-scroll-all', fixedHeight + Math.min(128, viewportHeight / 4) > available);
}
function scheduleSearchLayout() { if (!searchLayoutFrame) searchLayoutFrame = requestAnimationFrame(measureSearchLayout); }
if (searchDialog) {
  const searchObserver = new ResizeObserver(scheduleSearchLayout);
  for (const element of searchDialog.children) if (element !== results) searchObserver.observe(element);
  addEventListener('resize', scheduleSearchLayout);
  window.visualViewport?.addEventListener('resize', scheduleSearchLayout);
}

function getIndex() {
  if (!indexPromise) indexPromise = fetch('/search-index.json').then(response => {
    if (!response.ok) throw new Error('Busca indisponível'); return response.json();
  }).catch(error => { indexPromise = undefined; throw error; });
  return indexPromise;
}
function openSearch(event) {
  if (!searchDialog) return;
  lastSearchTrigger = event?.currentTarget || document.activeElement;
  prepareDialog(searchDialog);
  if (!searchDialog.open) searchDialog.showModal();
  updateModalState(); input?.focus(); scheduleSearchLayout();
  getIndex().catch(() => {});
}
$$('[data-search-open]').forEach(button => button.addEventListener('click', openSearch));
$('[data-search-close]')?.addEventListener('click', () => searchDialog?.close());
searchDialog?.addEventListener('click', event => {
  if (event.target !== searchDialog) return;
  const rect = searchDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) searchDialog.close();
});
searchDialog?.addEventListener('close', () => { updateModalState(); restoreOverlayFocus(lastSearchTrigger); });
const retrySearch = $('[data-search-retry]');
function setSearchState(state, message) {
  if (searchStatus) { searchStatus.dataset.state = state; searchStatus.textContent = message; }
  if (retrySearch) retrySearch.hidden = state !== 'error';
}
retrySearch?.addEventListener('click', () => { search(); input?.focus(); });
let searchSequence = 0;
async function search() {
  const sequence = ++searchSequence; const query = input.value.trim(); results.replaceChildren();
  if (normalize(query).length < 2) { setSearchState('initial', 'Digite pelo menos 2 caracteres. A busca preserva perguntas e não inclui os roteiros de instrutor ou respostas recolhidas.'); return; }
  setSearchState('loading', 'Buscando no material…');
  try {
    const index = await getIndex(); if (sequence !== searchSequence) return;
    const matches = rankSearch(index, query);
    setSearchState(matches.length ? 'results' : 'empty', matches.length ? `${matches.length} ${matches.length === 1 ? 'material encontrado' : 'materiais encontrados'}${matches.length > 30 ? ' · exibindo os 30 mais relevantes' : ''}` : 'Nenhum resultado. Tente um tema ou serviço, como “idempotência”, “STAR” ou “TLS”.');
    const term = tokenize(query)[0];
    for (const { item } of matches.slice(0, 30)) {
      const url = new URL(item.url, location.origin); if (url.origin !== location.origin || !url.pathname.endsWith('.html')) continue;
      const link = document.createElement('a'); link.className = 'search-result'; link.href = url.pathname + url.hash;
      const section = document.createElement('small'); section.textContent = item.section;
      const title = document.createElement('strong'); title.textContent = item.title;
      const excerpt = document.createElement('p'); const text = item.text || item.description || '';
      const offset = normalize(text).search(new RegExp(`(^|[^\\p{L}\\p{N}])${term}(?=$|[^\\p{L}\\p{N}])`, 'u'));
      const start = Math.max(0, offset - 65);
      excerpt.textContent = (start ? '…' : '') + text.slice(start, start + 190) + (text.length > start + 190 ? '…' : '');
      link.append(section, title, excerpt); results.append(link);
    }
  } catch { setSearchState('error', 'Não foi possível carregar a busca. A leitura continua disponível. Tente novamente.'); }
}
input?.addEventListener('input', search);
input?.addEventListener('keydown', event => { if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); } });
results?.addEventListener('keydown', event => {
  const links = [...results.querySelectorAll('a')]; const current = links.indexOf(document.activeElement);
  if (event.key === 'ArrowDown') { event.preventDefault(); links[Math.min(current + 1, links.length - 1)]?.focus(); }
  if (event.key === 'ArrowUp') { event.preventDefault(); if (current <= 0) input.focus(); else links[current - 1].focus(); }
});
document.addEventListener('keydown', event => {
  const isTyping = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if (event.isComposing || event.keyCode === 229) return;
  if (event.key === 'Escape' && searchDialog?.open) { event.preventDefault(); searchDialog.close(); return; }
  if (event.key === 'Escape' && document.body.classList.contains('nav-open')) { setMenu(false); menu?.focus(); }
  if (!isTyping && !event.repeat && (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
    event.preventDefault(); if (!searchDialog?.open) openSearch();
  }
  if (event.key === 'Tab' && document.body.classList.contains('nav-open') && !document.querySelector('dialog[open]')) {
    const items = [...(sidebar?.querySelectorAll('a,button,summary') || [])].filter(element => element.getClientRects().length);
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
    else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
  }
});

async function copyText(text, button, success) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text); feedback(success);
    if (button && button.tagName === 'BUTTON') {
      const original = button.textContent; button.textContent = 'Copiado';
      setTimeout(() => { if (button.isConnected) button.textContent = original; }, 1800);
    }
  } catch { feedback('A cópia automática não está disponível neste navegador. Selecione o texto ou copie o endereço da página.'); }
}
$$('.copy-code').forEach(button => button.addEventListener('click', () => {
  const code = button.closest('.code-block')?.querySelector('pre code') || button.closest('pre')?.querySelector('code');
  if (code) copyText(code.textContent, button, 'Código copiado.');
}));
$$('.heading-link').forEach(link => link.addEventListener('click', event => {
  const heading = link.closest('[id]');
  const id = link.dataset.headingId || link.dataset.anchor || (link instanceof HTMLAnchorElement ? decodeURIComponent(link.hash.slice(1)) : '') || heading?.id;
  if (!id) return; event.preventDefault();
  const url = new URL(location.href); url.hash = id; copyText(url.href, link, 'Link desta seção copiado.');
}));

const current = { url: document.body.dataset.document, id: document.body.dataset.contentId, version: document.body.dataset.contentVersion, audience: document.body.dataset.audience === 'instructor' ? 'instructor' : 'student', scope: 'student' };
let studyScope = document.body.dataset.studyScope || 'main';
let manifest = [];
let state = { schemaVersion: 2, reading: {}, resume: {} };
let catalogReady = false;
let currentAnchor = '';
let resumeInitialized = false;
let userInteracted = false;
let userInputVersion = 0;
['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(type => window.addEventListener(type, () => { userInteracted = true; userInputVersion++; }, { passive: true }));
let explicitHash = location.hash;
let restoredAnchor = '';
const getAnchor = hash => { try { return decodeURIComponent(hash.replace(/^#/, '')); } catch { return ''; } };
function revealAnchor(id, scroll = true) {
  const target = id ? document.getElementById(id) : null; if (!target) return false;
  let parent = target.parentElement;
  while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
  if (scroll) target.scrollIntoView({ block: 'start', behavior: 'instant' }); return true;
}
function validResume(record) {
  return record && typeof record.contentId === 'string' && (record.anchor === undefined || typeof record.anchor === 'string') && (record.contentVersion === undefined || typeof record.contentVersion === 'string');
}
function persistStudy() { storage.set(readKey, state); }
function saveResume(anchor = currentAnchor) {
  if (!resumeInitialized || !current.id) return;
  state.resume[current.scope] = { ...(state.resume[current.scope] || {}), contentId: current.id, anchor, contentVersion: current.version || '' }; persistStudy();
}
function includedInStudyView(doc) {
  return studyScope === 'main'
    ? participatesInMainStudy(doc)
    : isStandalone(doc) && doc.collection === studyScope && doc.audience !== 'instructor' && doc.publication !== 'private';
}
function resolveResume(record) {
  if (!validResume(record)) return null;
  const doc = manifest.find(item => item.id === record.contentId && includedInStudyView(item)); if (!doc) return null;
  const anchors = Array.isArray(doc.existingAnchors) ? doc.existingAnchors : [];
  const anchor = record.anchor && anchors.includes(record.anchor) ? record.anchor : '';
  return { doc, anchor, fallback: Boolean(record.anchor && !anchor), url: doc.canonicalUrl + (anchor ? `#${encodeURIComponent(anchor)}` : '') };
}
let resumePresentationVersion = 0;
let resumePresentationAbort;
function renderHomeResume(resume, link) {
  const block = link.closest('.home-resume');
  if (!block) { link.textContent = resume.doc.title; return; }
  const title = block.querySelector('[data-resume-title]');
  const section = block.querySelector('[data-resume-section]');
  if (title) title.textContent = resume.doc.title;
  link.setAttribute('aria-label', `Retomar ${resume.doc.title}`);
  if (section) { section.hidden = true; section.textContent = ''; }
  document.body.classList.add('has-resume');
  // Only show a section label when it can be read from the real saved target.
  // Do not manufacture a label from an opaque anchor or fetch unrelated pages.
  const version = ++resumePresentationVersion;
  resumePresentationAbort?.abort();
  if (!resume.anchor || !section) return;
  const target = new URL(resume.doc.canonicalUrl, location.origin);
  if (target.origin !== location.origin) return;
  resumePresentationAbort = new AbortController();
  fetch(target.pathname, { signal: resumePresentationAbort.signal }).then(response => response.ok ? response.text() : '').then(html => {
    if (!html || version !== resumePresentationVersion || !block.isConnected || link.getAttribute('href') !== resume.url) return;
    const page = new DOMParser().parseFromString(html, 'text/html');
    const anchor = page.getElementById(resume.anchor);
    const paragraph = anchor?.closest('p');
    const sibling = anchor?.nextElementSibling || (paragraph && !paragraph.textContent.trim() ? paragraph.nextElementSibling : null);
    const heading = anchor?.matches('h1,h2,h3,h4,h5,h6') ? anchor : sibling?.matches('h1,h2,h3,h4,h5,h6') ? sibling : null;
    if (!heading) return;
    heading.querySelectorAll('.heading-link').forEach(button => button.remove());
    const label = heading.textContent.trim();
    if (label) { section.textContent = label; section.hidden = false; link.setAttribute('aria-label', `Retomar ${resume.doc.title}, ${label}`); }
  }).catch(() => { /* The page title and real URL remain sufficient. */ });
}
function renderStudy() {
  const readToggle = $('.read-toggle'); const isMarked = Boolean(state.reading[current.id]?.marked);
  readToggle?.setAttribute('aria-pressed', String(isMarked));
  const readLabel = readToggle?.querySelector('span'); if (readLabel) readLabel.textContent = isMarked ? 'Leitura marcada' : 'Marcar como lido';
  const studentDocuments = manifest.filter(includedInStudyView);
  const marked = studentDocuments.filter(doc => state.reading[doc.id]?.marked);
  const counter = $('#read-count'); if (counter) counter.textContent = String(marked.length);
  const progress = $('.progress-track');
  if (progress) {
    progress.setAttribute('aria-valuemax', String(studentDocuments.length)); progress.setAttribute('aria-valuenow', String(marked.length));
    const bar = $('#read-progress'); if (bar) bar.style.width = `${studentDocuments.length ? marked.length / studentDocuments.length * 100 : 0}%`;
  }
  const viewScope = studyScope === 'main' ? 'student' : studyScope;
  // An older application may have stored a case under the student pointer.
  // Show it read-only inside its own collection until a new case visit records
  // a collection position. Do not relocate, delete or surface it in main study.
  const resume = resolveResume(state.resume[viewScope])
    || (viewScope !== 'student' ? resolveResume(state.resume.student) : null);
  if (resume) {
    [...new Set([$('#resume-link'), ...$$('[data-resume-link]')].filter(Boolean))].forEach(link => { link.href = resume.url; renderHomeResume(resume, link); });
    $$('.resume-study').forEach(block => { block.hidden = false; });
    if (resume.fallback) notice('resume-notice', 'A seção salva não está mais disponível. Continuar abre o início do material.');
  }
  const history = $('.study-history');
  if (history) {
    history.replaceChildren();
    if (!marked.length) { const empty = document.createElement('p'); empty.textContent = 'Nenhuma leitura marcada neste navegador. Ao estudar, use “Marcar como lido” para registrar a leitura.'; history.append(empty); }
    for (const doc of marked) {
      const row = document.createElement('div'); row.className = 'history-row';
      const link = document.createElement('a'); link.href = doc.canonicalUrl; link.textContent = doc.title;
      const info = document.createElement('span'); info.textContent = state.reading[doc.id].origin === 'legacy' ? 'Leitura marcada · registro anterior, sem data' : 'Leitura marcada manualmente';
      row.append(link, info); history.append(row);
    }
    const unavailable = Object.values(state.reading).filter(record => record?.marked && record.origin === 'legacy' && typeof record.legacyUrl === 'string' && (studyScope === 'main' ? !isStandaloneReference(record.legacyUrl) : isStandaloneReference(record.legacyUrl)));
    for (const record of unavailable) { const row = document.createElement('p'); row.textContent = `Registro anterior preservado: ${record.legacyUrl} · material indisponível no catálogo atual.`; history.append(row); }
  }
}
const studyReady = fetch('/content-manifest.json').then(response => {
  if (!response.ok) throw new Error('Catálogo indisponível'); return response.json();
}).then(data => {
  manifest = Array.isArray(data) ? data : (data.items || data.documents || []);
  if (!manifest.length || !manifest.every(item => item && typeof item.id === 'string' && typeof item.canonicalUrl === 'string')) throw new Error('Catálogo inválido');
  const saved = storage.get(readKey, null);
  if (saved?.schemaVersion === 2 && saved.reading && typeof saved.reading === 'object' && !Array.isArray(saved.reading)) {
    // Collection isolation changes only which records the current view presents.
    // Preserve existing reading records, resume pointers and extension fields;
    // an old student pointer to a case is ignored here, never silently moved.
    state = {
      ...saved,
      reading: { ...saved.reading },
      resume: saved.resume && typeof saved.resume === 'object' && !Array.isArray(saved.resume) ? { ...saved.resume } : {}
    };
  }
  const legacy = storage.get('architecture-practice:read:v1', []);
  if (Array.isArray(legacy)) for (const url of legacy.filter(value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//'))) {
    const doc = manifest.find(item => item.canonicalUrl === url.split('#')[0]); const id = doc?.id || `legacy:${url}`;
    if (!state.reading[id]) state.reading[id] = { marked: true, origin: 'legacy', ...(doc ? {} : { legacyUrl: url }) };
  }
  const recent = storage.get('architecture-practice:recent:v1', null);
  if (recent && typeof recent.url === 'string') {
    const doc = manifest.find(item => item.canonicalUrl === recent.url.split('#')[0]);
    const scope = doc ? continuityScopeFor(doc) : null;
    if (scope && !state.resume[scope]) state.resume[scope] = { contentId: doc.id, anchor: getAnchor(recent.url.includes('#') ? recent.url.slice(recent.url.indexOf('#')) : ''), contentVersion: doc.contentVersion };
  }
  if (current.url) {
    const doc = manifest.find(item => item.id === current.id || item.canonicalUrl === current.url);
    if (doc) {
      current.id = doc.id; current.version = doc.contentVersion;
      current.audience = doc.audience === 'instructor' ? 'instructor' : 'student';
      current.scope = continuityScopeFor(doc);
      if (isStandalone(doc)) studyScope = doc.collection;
    }
  }
  catalogReady = true;
  if (current.id) {
    const record = state.resume[current.scope]; const hashId = getAnchor(explicitHash);
    if (explicitHash) {
      currentAnchor = hashId;
      if (!revealAnchor(hashId, !userInteracted)) notice('resume-notice', 'A seção deste link não foi encontrada. O material está disponível desde o início.');
    } else if (validResume(record) && record.contentId === current.id && record.anchor) {
      if (revealAnchor(record.anchor, !userInteracted)) { restoredAnchor = record.anchor; currentAnchor = record.anchor; }
      else notice('resume-notice', 'A seção salva mudou ou não está mais disponível. A leitura foi aberta no início do material.');
      if (record.contentVersion && current.version && record.contentVersion !== current.version) notice('resume-notice', 'Este material foi atualizado desde sua última visita. A seção foi retomada quando ainda disponível.');
    }
    resumeInitialized = true; saveResume();
  } else persistStudy();
  renderStudy();
}).catch(() => { notice('resume-notice', 'Não foi possível carregar os registros de leitura. O material e seus links continuam disponíveis.'); });
$('.read-toggle')?.addEventListener('click', async () => {
  await studyReady;
  if (!catalogReady || !current.id) { feedback('O registro de leitura está indisponível nesta página. Seus registros anteriores foram preservados.'); return; }
  const previous = state.reading[current.id]; state.reading[current.id] = { ...(previous && typeof previous === 'object' ? previous : {}), marked: !previous?.marked, origin: 'manual' };
  persistStudy(); renderStudy();
  feedback(storageUnavailable ? 'Marcação temporária nesta página. O navegador não permitiu salvá-la.' : (state.reading[current.id].marked ? 'Leitura marcada neste navegador.' : 'Marcação de leitura removida.'));
});
const readingHeadings = $$('.prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id], .prose a[id]');
const tocLinks = new Map($$('.toc a[href^="#"]').map(link => [getAnchor(link.hash), link]));
let scrollTimer;
function trackReadingPosition() {
  if (!resumeInitialized || !current.id) return;
  const threshold = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-offset')) || 0;
  // An explicit anchor may precede a short heading or an H4 absent from the
  // TOC. Keep that exact destination while it remains at the reading position,
  // including refresh/pagehide; a nearest H2/H3 must not erase it.
  const selected = currentAnchor ? document.getElementById(currentAnchor) : null;
  if (selected?.getClientRects().length) {
    const top = selected.getBoundingClientRect().top;
    if (top >= -5 && top <= threshold + 110) return;
  }
  let heading;
  for (const candidate of readingHeadings) {
    if (!candidate.getClientRects().length) continue;
    if (candidate.getBoundingClientRect().top <= threshold + 50) heading = candidate;
    else break;
  }
  if (heading) {
    currentAnchor = heading.id;
    tocLinks.forEach(link => { const active = getAnchor(link.hash) === currentAnchor; link.classList.toggle('active', active); active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'); });
    if (state.resume[current.scope]?.anchor !== currentAnchor) saveResume();
  }
}
window.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(trackReadingPosition, 200); }, { passive: true });
window.addEventListener('pagehide', () => { clearTimeout(scrollTimer); trackReadingPosition(); saveResume(); });
window.addEventListener('hashchange', () => { explicitHash = location.hash; const id = getAnchor(location.hash); revealAnchor(id); currentAnchor = id; saveResume(); });

const diagramDialog = $('#diagram-dialog');
const diagramStage = diagramDialog?.querySelector('.diagram-stage');
let diagramTrigger;
let diagramScale = 1;
let diagramCanvas;
function setDiagramScale(value) {
  if (!diagramCanvas || !diagramStage) return;
  diagramScale = Math.max(0.25, Math.min(4, value)); diagramCanvas.style.zoom = String(diagramScale);
  const label = diagramDialog.querySelector('.diagram-zoom-label'); if (label) label.textContent = `${Math.round(diagramScale * 100)}%`;
}
function openDiagram(trigger) {
  const container = trigger.closest('.diagram, .diagram-image') || trigger.parentElement;
  const visual = container.querySelector('.mermaid svg') || container.querySelector('img[src$=".svg"], svg');
  if (!visual || !diagramDialog || !diagramStage) { feedback('O desenho ainda está sendo preparado. Você pode consultar a definição original abaixo.'); return; }
  prepareDialog(diagramDialog);
  diagramTrigger = trigger; diagramStage.replaceChildren();
  diagramCanvas = document.createElement('div'); diagramCanvas.className = 'diagram-canvas';
  const copy = visual.cloneNode(true);
  if (copy instanceof SVGElement) {
    const viewBox = copy.viewBox.baseVal;
    if (viewBox?.width) { copy.style.width = `${viewBox.width}px`; copy.style.maxWidth = 'none'; copy.style.height = 'auto'; }
    // SVG marker/label IDs must stay unique when the same drawing is shown in
    // the document and in the dialog. Preserve references within the clone.
    const prefix = `expanded-${Date.now()}-`;
    const elements = [copy, ...copy.querySelectorAll('*')];
    const ids = elements.filter(element => element.id).map(element => element.id).sort((a, b) => b.length - a.length);
    for (const element of elements) {
      for (const attribute of [...element.attributes]) {
        let value = attribute.value;
        if (attribute.name === 'id') value = prefix + value;
        else if (['aria-labelledby', 'aria-describedby'].includes(attribute.name)) value = value.split(/\s+/).map(id => ids.includes(id) ? prefix + id : id).join(' ');
        else for (const id of ids) value = value.replaceAll(`#${id}`, `#${prefix}${id}`);
        if (attribute.value !== value) element.setAttribute(attribute.name, value);
      }
      if (element.tagName.toLowerCase() === 'style') for (const id of ids) element.textContent = element.textContent.replaceAll(`#${id}`, `#${prefix}${id}`);
    }
  } else { copy.removeAttribute('loading'); copy.style.maxWidth = 'none'; }
  diagramCanvas.append(copy); diagramStage.append(diagramCanvas);
  if (!diagramDialog.open) diagramDialog.showModal();
  updateModalState(); setDiagramScale(1);
  diagramDialog.querySelector('[data-diagram-close]')?.focus();
}
$$('.diagram-expand').forEach(button => button.addEventListener('click', () => openDiagram(button)));
$$('.prose img[src$=".svg"]').filter(image => !image.closest('table') && !image.closest('.diagram-image') && !image.hasAttribute('width')).forEach(image => {
  const frame = document.createElement('div'); frame.className = 'diagram-image'; image.before(frame); frame.append(image);
  const button = document.createElement('button'); button.className = 'diagram-expand'; button.type = 'button'; button.textContent = 'Ampliar diagrama';
  frame.append(button); button.addEventListener('click', () => openDiagram(button));
});
diagramDialog?.querySelectorAll('[data-diagram-close]').forEach(button => button.addEventListener('click', () => diagramDialog.close()));
diagramDialog?.addEventListener('close', () => { diagramStage?.replaceChildren(); updateModalState(); restoreOverlayFocus(diagramTrigger); });
diagramDialog?.addEventListener('click', event => {
  if (event.target !== diagramDialog) return;
  const rect = diagramDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) diagramDialog.close();
});
diagramDialog?.querySelectorAll('[data-diagram-zoom]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.diagramZoom === 'in') setDiagramScale(diagramScale + 0.25);
  else if (button.dataset.diagramZoom === 'out') setDiagramScale(diagramScale - 0.25);
  else { setDiagramScale(1); const width = diagramCanvas?.scrollWidth || 1; setDiagramScale(Math.min(1, (diagramStage.clientWidth - 40) / width)); diagramStage.scrollTo(0, 0); }
}));
diagramDialog?.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); diagramDialog.close(); }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); setDiagramScale(diagramScale + 0.25); }
  if (event.key === '-') { event.preventDefault(); setDiagramScale(diagramScale - 0.25); }
});
const diagrams = $$('.mermaid');
const diagramSources = new Map(diagrams.map(diagram => [diagram, diagram.textContent]));
for (const [diagram, source] of diagramSources) {
  const container = diagram.closest('.diagram') || diagram.parentElement;
  if (!container.querySelector('.diagram-source')) {
    const details = document.createElement('details'); details.className = 'diagram-source';
    const summary = document.createElement('summary'); summary.textContent = 'Definição original do diagrama';
    const pre = document.createElement('pre'); const code = document.createElement('code'); code.textContent = source;
    pre.append(code); details.append(summary, pre); container.append(details);
  }
}
let renderChain = Promise.resolve();
let mermaid;
let firstDiagramRender = true;
function scheduleDiagrams() {
  if (!diagrams.length) return;
  renderChain = renderChain.then(async () => {
    const scrollPosition = window.scrollY; const inputVersion = userInputVersion; const theme = document.documentElement.dataset.theme;
    try {
      if (!mermaid) ({ default: mermaid } = await import('/assets/mermaid/mermaid.esm.min.mjs'));
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', fontFamily: 'Source Sans, sans-serif', themeVariables: theme === 'dark' ? { darkMode: true, background: '#1C1A17', primaryColor: '#36312b', primaryTextColor: '#EEE8E0', primaryBorderColor: '#B9B0A5', lineColor: '#B9B0A5', secondaryColor: '#3c3022', tertiaryColor: '#282520', textColor: '#EEE8E0' } : { primaryColor: '#FAF8F5', primaryTextColor: '#1F1C19', primaryBorderColor: '#5B544D', lineColor: '#5B544D', secondaryColor: '#fff0d9', tertiaryColor: '#f0ebe5', textColor: '#1F1C19' }, flowchart: { useMaxWidth: true, htmlLabels: true } });
      for (const [diagram, source] of diagramSources) {
        diagram.removeAttribute('data-processed'); diagram.classList.remove('diagram-failed'); diagram.textContent = source;
        const container = diagram.closest('.diagram') || diagram.parentElement; container.querySelector('.diagram-error')?.remove();
        try { await mermaid.run({ nodes: [diagram] }); }
        catch { diagram.textContent = source; diagram.classList.add('diagram-failed'); const error = document.createElement('p'); error.className = 'diagram-error'; error.textContent = 'O diagrama não pôde ser desenhado. A definição original continua disponível abaixo.'; diagram.before(error); }
      }
    } catch { for (const [diagram, source] of diagramSources) { diagram.textContent = source; diagram.classList.add('diagram-failed'); } }
    await studyReady;
    if (firstDiagramRender && !userInteracted) {
      const anchor = explicitHash ? getAnchor(explicitHash) : restoredAnchor; if (anchor) revealAnchor(anchor);
    } else if (!firstDiagramRender && inputVersion === userInputVersion) window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    if (diagramDialog?.open && diagramTrigger?.isConnected) {
      const previousScale = diagramScale;
      openDiagram(diagramTrigger); setDiagramScale(previousScale);
    }
    firstDiagramRender = false; document.dispatchEvent(new CustomEvent('architecture-diagrams-ready'));
  });
}
document.addEventListener('architecture-theme-change', scheduleDiagrams); scheduleDiagrams();
