const locales = ['pt-BR', 'en-US'];
const headingsSelector = 'h2,h3,h4,h5,h6';

function anchorId(value) {
  try { return decodeURIComponent(String(value || '').replace(/^#/, '')); }
  catch { return ''; }
}

// Preserve both original translations and their anchors. Each H3 owns its
// answer and trailing notes; the other fragments belong to the story control.
function splitParts(panel) {
  const parts = [];
  let part = { kind: 'story', nodes: [] };
  for (const node of panel.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE && node.matches('h2,h3')) {
      if (part.nodes.length) parts.push(part);
      part = { kind: node.matches('h3') ? 'question' : 'story', nodes: [] };
    }
    part.nodes.push(node);
  }
  if (part.nodes.length) parts.push(part);
  return parts;
}

export function initStoryLocales({ onStorageError } = {}) {
  const wrapper = document.querySelector('[data-story-locales]');
  if (!wrapper || wrapper.dataset.storyLocalesInitialized === 'true') return null;
  const originals = new Map(locales.map(locale => [locale, wrapper.querySelector(`:scope > [data-story-locale="${locale}"]`)]));
  if ([...originals.values()].some(panel => !panel)) return null;
  const translations = locales.map(locale => splitParts(originals.get(locale)));
  if (translations[0].length !== translations[1].length || translations[0].some((part, index) => part.kind !== translations[1][index].kind)) return null;
  const headingPairs = locales.map(locale => [...originals.get(locale).querySelectorAll('h2,h3')]);
  if (headingPairs[0].length !== headingPairs[1].length || headingPairs[0].some((heading, index) => heading.tagName !== headingPairs[1][index].tagName)) return null;

  const prose = wrapper.closest('.prose');
  const heading = prose?.querySelector(':scope > h1');
  const titles = { 'pt-BR': wrapper.dataset.storyTitlePt || heading?.textContent.trim(), 'en-US': wrapper.dataset.storyTitleEn || heading?.textContent.trim() };
  const originalTitle = document.title;
  const suffix = titles['pt-BR'] && originalTitle.startsWith(titles['pt-BR']) ? originalTitle.slice(titles['pt-BR'].length) : '';
  // Choices belong to this story and one unit. The old global v1 preference is
  // left intact but is deliberately not inherited by these independent controls.
  const preferenceKey = `architecture-practice:story-languages:v2:${document.body.dataset.contentId || location.pathname}`;
  const units = new Map();
  const paneUnits = new WeakMap();
  let storageBlocked = false;
  let preferences = {};

  function unitFor(key, kind) {
    if (!units.has(key)) units.set(key, { key, kind, locale: 'pt-BR', manuallySelected: false, panels: new Map(locales.map(locale => [locale, []])), parts: [] });
    return units.get(key);
  }

  const story = unitFor('story', 'story');
  const fragments = [];
  for (const [index, originalPart] of translations[0].entries()) {
    const key = originalPart.kind === 'question' ? originalPart.nodes.find(node => node.nodeType === Node.ELEMENT_NODE && node.matches('h3')).id : 'story';
    const unit = unitFor(key, originalPart.kind);
    const part = document.createElement(unit.kind === 'question' ? 'section' : 'div');
    part.dataset.storyPart = '';
    part.dataset.storyBlockKey = key;
    if (unit.kind === 'question') { part.dataset.storyQuestion = ''; part.className = 'story-question'; }
    for (const [localeIndex, locale] of locales.entries()) {
      const panel = document.createElement('section');
      panel.dataset.storyLocale = locale;
      panel.lang = locale;
      panel.append(...translations[localeIndex][index].nodes);
      part.append(panel);
      unit.panels.get(locale).push(panel);
      paneUnits.set(panel, unit);
    }
    unit.parts.push(part);
    fragments.push(part);
  }
  wrapper.replaceChildren(...fragments);

  // Pair the original TOC links under shared parents. Hiding an H2 translation
  // must never hide its child questions that are using the other language.
  const toc = document.getElementById('page-toc');
  const tocNav = toc?.querySelector('nav');
  const tocLinks = new Map([...(tocNav?.querySelectorAll('a[href^="#"]') || [])].map(link => [anchorId(link.hash), link]));
  if (tocNav) {
    const list = document.createElement('ol');
    let children;
    for (const [index, source] of headingPairs[0].entries()) {
      const item = document.createElement('li');
      for (const [localeIndex, locale] of locales.entries()) {
        const link = tocLinks.get(headingPairs[localeIndex][index].id);
        if (link) { link.dataset.storyTocLink = ''; link.lang = locale; item.append(link); }
      }
      if (source.matches('h2')) {
        list.append(item);
        children = document.createElement('ol');
        item.append(children);
      } else (children || list).append(item);
    }
    for (const empty of list.querySelectorAll('ol:empty')) empty.remove();
    tocNav.replaceChildren(list);
  }

  function targetForAnchor(value) {
    const id = anchorId(value);
    return id ? document.getElementById(id) : null;
  }
  function panelForTarget(target) {
    const panel = target?.closest('[data-story-locale]');
    return paneUnits.has(panel) ? panel : null;
  }
  function storageFailure() { storageBlocked = true; onStorageError?.(); }
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) preferences = Object.fromEntries(Object.entries(saved).filter(([key, locale]) => units.has(key) && locales.includes(locale)));
  } catch (error) { if (!(error instanceof SyntaxError)) storageFailure(); }
  function savePreference(unit, locale) {
    preferences[unit.key] = locale;
    if (storageBlocked) return;
    try { localStorage.setItem(preferenceKey, JSON.stringify(preferences)); }
    catch { storageFailure(); }
  }
  function openAncestors(target) {
    for (let parent = target?.parentElement; parent && wrapper.contains(parent); parent = parent.parentElement) if (parent instanceof HTMLDetailsElement) parent.open = true;
  }
  function focusTarget(target) {
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  function updateToc() {
    for (const [id, link] of tocLinks) {
      const panel = panelForTarget(document.getElementById(id));
      link.hidden = Boolean(panel?.hidden);
      if (link.hidden) { link.classList.remove('active'); link.removeAttribute('aria-current'); }
    }
  }
  function showUnit(unit, locale, { announce = false, target = null } = {}) {
    const previous = unit.panels.get(unit.locale);
    const focusedInside = previous.some(panel => panel.contains(document.activeElement));
    unit.locale = locale;
    for (const [key, panels] of unit.panels) for (const panel of panels) panel.hidden = key !== locale;
    for (const [key, button] of unit.buttons) button.setAttribute('aria-pressed', String(key === locale));
    const label = unit.kind === 'story' ? (locale === 'pt-BR' ? 'Idioma da história' : 'Story language') : (locale === 'pt-BR' ? 'Idioma desta pergunta' : 'Question language');
    unit.controls.setAttribute('aria-label', label);
    unit.label.textContent = label;
    unit.label.lang = locale;
    unit.status.lang = locale;
    if (unit.kind === 'story') {
      wrapper.dataset.activeStoryLocale = locale;
      if (heading && titles[locale]) { heading.textContent = titles[locale]; heading.lang = locale; }
      document.title = suffix ? titles[locale] + suffix : originalTitle;
    } else {
      unit.parts[0].setAttribute('aria-labelledby', unit.panels.get(locale)[0].querySelector('h3').id);
      unit.parts[0].dataset.activeStoryLocale = locale;
    }
    updateToc();
    if (focusedInside && !unit.panels.get(locale).some(panel => panel.contains(document.activeElement))) {
      openAncestors(target);
      focusTarget(target || unit.buttons.get(locale));
    }
    if (announce) unit.status.textContent = `${label}: ${locale}.${storageBlocked ? (locale === 'pt-BR' ? ' Preferência temporária nesta página.' : ' This preference is temporary on this page.') : ''}`;
    document.dispatchEvent(new CustomEvent('architecture-story-language-change', { detail: { locale, unit: unit.key } }));
  }
  function correspondingAnchor(unit, target, locale) {
    const panel = panelForTarget(target);
    if (!panel) return target;
    const headings = unit.panels.get(panel.dataset.storyLocale).flatMap(part => [...part.querySelectorAll(headingsSelector)]);
    let index = headings.indexOf(target);
    if (index < 0 && !target.textContent.trim()) index = headings.findIndex(candidate => target.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING);
    return index < 0 ? target : unit.panels.get(locale).flatMap(part => [...part.querySelectorAll(headingsSelector)])[index] || target;
  }
  function chooseLocale(unit, locale) {
    unit.manuallySelected = true;
    savePreference(unit, locale);
    if (unit.locale === locale) return;
    const previousDetails = unit.panels.get(unit.locale).flatMap(panel => [...panel.querySelectorAll('details')]);
    const nextDetails = unit.panels.get(locale).flatMap(panel => [...panel.querySelectorAll('details')]);
    for (const [index, detail] of nextDetails.entries()) if (previousDetails[index]) detail.open = previousDetails[index].open;
    const oldTarget = targetForAnchor(location.hash);
    const target = paneUnits.get(panelForTarget(oldTarget)) === unit ? correspondingAnchor(unit, oldTarget, locale) : null;
    showUnit(unit, locale, { announce: true, target });
    if (target && target !== oldTarget) {
      const oldURL = location.href;
      const nextURL = new URL(oldURL); nextURL.hash = target.id;
      try {
        history.replaceState(history.state, '', nextURL.href);
        window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: nextURL.href }));
      } catch { /* Reading and local language selection work without history. */ }
    }
  }
  for (const unit of units.values()) {
    const controls = document.createElement('div');
    controls.className = 'story-language-controls';
    controls.dataset.storyLanguageControls = '';
    controls.dataset.storyBlockKey = unit.key;
    controls.setAttribute('role', 'group');
    const label = document.createElement('span'); label.className = 'story-language-label';
    const buttons = document.createElement('div'); buttons.className = 'story-language-buttons';
    const status = document.createElement('span'); status.className = 'sr-only';
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
    unit.controls = controls; unit.label = label; unit.status = status;
    unit.buttons = new Map(locales.map(locale => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = locale === 'pt-BR' ? 'PT-BR' : 'EN-US'; button.lang = locale;
      button.dataset.storyLanguageOption = locale;
      const subject = unit.kind === 'story' ? (locale === 'pt-BR' ? 'a história' : 'the story') : (locale === 'pt-BR' ? 'esta pergunta e sua resposta' : 'this question and its answer');
      button.setAttribute('aria-label', locale === 'pt-BR' ? `Ler ${subject} em português do Brasil` : `Read ${subject} in US English`);
      button.addEventListener('click', () => chooseLocale(unit, locale)); buttons.append(button);
      return [locale, button];
    }));
    controls.append(label, buttons, status);
    if (unit === story) wrapper.prepend(controls); else unit.parts[0].prepend(controls);
  }
  function revealAnchor(value) {
    const target = targetForAnchor(value);
    const panel = panelForTarget(target);
    if (!panel) return false;
    showUnit(paneUnits.get(panel), panel.dataset.storyLocale, { target });
    return true;
  }
  function resumeAnchor(value) {
    const target = targetForAnchor(value);
    const panel = panelForTarget(target);
    const unit = paneUnits.get(panel);
    return unit && (unit.manuallySelected || Object.hasOwn(preferences, unit.key)) ? correspondingAnchor(unit, target, unit.locale).id || value : value;
  }
  for (const unit of units.values()) showUnit(unit, preferences[unit.key] || 'pt-BR');
  revealAnchor(location.hash);
  wrapper.dataset.storyLocalesInitialized = 'true';
  window.addEventListener('hashchange', () => revealAnchor(location.hash), { capture: true });
  window.addEventListener('popstate', () => revealAnchor(location.hash), { capture: true });
  return { revealAnchor, resumeAnchor };
}
