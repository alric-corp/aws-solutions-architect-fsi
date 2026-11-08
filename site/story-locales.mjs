const locales = ['pt-BR', 'en-US'];
const preferenceKey = 'architecture-practice:story-language:v1';

function anchorId(value) {
  try { return decodeURIComponent(String(value || '').replace(/^#/, '')); }
  catch { return ''; }
}

// Only authored stories opt in. The reader's preferences and study records
// remain owned by site.js; this module stores one independent locale string.
export function initStoryLocales({ onStorageError } = {}) {
  const wrapper = document.querySelector('[data-story-locales]');
  if (!wrapper || wrapper.dataset.storyLocalesInitialized === 'true') return null;
  const panels = new Map(locales.map(locale => [locale, wrapper.querySelector(`[data-story-locale="${locale}"]`)]));
  if ([...panels.values()].some(panel => !panel)) return null;
  const prose = wrapper.closest('.prose');
  const heading = prose?.querySelector(':scope > h1') || prose?.querySelector('h1');
  const titles = {
    'pt-BR': wrapper.dataset.storyTitlePt || heading?.textContent.trim() || '',
    'en-US': wrapper.dataset.storyTitleEn || heading?.textContent.trim() || '',
  };
  const originalTitle = document.title;
  const titleSuffix = titles['pt-BR'] && originalTitle.startsWith(titles['pt-BR'])
    ? originalTitle.slice(titles['pt-BR'].length) : '';
  const toc = document.getElementById('page-toc');
  const tocSummary = toc?.querySelector(':scope > summary');
  const tocNav = toc?.querySelector('nav');
  const backTop = toc?.querySelector('.back-top');
  let storageBlocked = false;
  let activeLocale = 'pt-BR';
  let manuallySelected = false;

  function storageFailure() {
    storageBlocked = true;
    onStorageError?.();
  }

  function readPreference() {
    try {
      const stored = localStorage.getItem(preferenceKey);
      if (locales.includes(stored)) return stored;
      const parsed = stored ? JSON.parse(stored) : null;
      return locales.includes(parsed) ? parsed : 'pt-BR';
    } catch (error) {
      // Invalid JSON is not a storage outage and must not reset unrelated data.
      if (!(error instanceof SyntaxError)) storageFailure();
      return 'pt-BR';
    }
  }

  function savePreference(locale) {
    if (storageBlocked) return;
    try { localStorage.setItem(preferenceKey, JSON.stringify(locale)); }
    catch { storageFailure(); }
  }

  function panelForTarget(target) {
    const panel = target?.closest('[data-story-locale]');
    return panel && wrapper.contains(panel) && locales.includes(panel.dataset.storyLocale) ? panel : null;
  }

  function targetForAnchor(value) {
    const id = anchorId(value);
    return id ? document.getElementById(id) : null;
  }

  const controls = document.createElement('div');
  controls.className = 'story-language-controls';
  controls.dataset.storyLanguageControls = '';
  controls.setAttribute('role', 'group');
  const label = document.createElement('span');
  label.className = 'story-language-label';
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'story-language-buttons';
  const status = document.createElement('span');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const buttons = new Map(locales.map(locale => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = locale === 'pt-BR' ? 'PT-BR' : 'EN-US';
    button.lang = locale;
    button.dataset.storyLanguageOption = locale;
    button.setAttribute('aria-label', locale === 'pt-BR' ? 'Ler a história em português do Brasil' : 'Read the story in US English');
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => chooseLocale(locale));
    buttonGroup.append(button);
    return [locale, button];
  }));
  controls.append(label, buttonGroup, status);
  wrapper.before(controls);

  function filterToc(locale) {
    if (!toc) return;
    for (const item of toc.querySelectorAll('li')) {
      const link = [...item.children].find(child => child.matches('a[href^="#"]'));
      const panel = link && panelForTarget(targetForAnchor(link.hash));
      item.hidden = Boolean(panel && panel.dataset.storyLocale !== locale);
      if (item.hidden) for (const descendant of item.querySelectorAll('a')) {
        descendant.classList.remove('active');
        descendant.removeAttribute('aria-current');
      }
    }
    // The existing TOC can contain a list wrapper before its first H2.
    for (const item of [...toc.querySelectorAll('li')].reverse()) {
      if ([...item.children].some(child => child.matches('a[href^="#"]'))) continue;
      const children = [...item.querySelectorAll('li')];
      if (children.length) item.hidden = children.every(child => child.hidden);
    }
    if (tocSummary) tocSummary.textContent = locale === 'pt-BR' ? 'Nesta página' : 'On this page';
    toc.lang = locale;
    tocNav?.setAttribute('aria-label', locale === 'pt-BR' ? 'Sumário do documento' : 'Document contents');
    if (backTop) backTop.textContent = locale === 'pt-BR' ? 'Voltar ao início ↑' : 'Back to top ↑';
  }

  function focusTarget(target) {
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }

  function showLocale(locale, { announce = false, focusIfHidden = false, target = null } = {}) {
    if (!locales.includes(locale)) return false;
    const previous = panels.get(activeLocale);
    const focusedInside = previous?.contains(document.activeElement);
    activeLocale = locale;
    for (const [key, panel] of panels) panel.hidden = key !== locale;
    for (const [key, button] of buttons) button.setAttribute('aria-pressed', String(key === locale));
    wrapper.dataset.activeStoryLocale = locale;
    controls.setAttribute('aria-label', locale === 'pt-BR' ? 'Idioma da história' : 'Story language');
    label.textContent = locale === 'pt-BR' ? 'Idioma da história' : 'Story language';
    label.lang = locale;
    status.lang = locale;
    if (heading && titles[locale]) {
      heading.textContent = titles[locale];
      heading.lang = locale;
    }
    document.title = titleSuffix ? titles[locale] + titleSuffix : originalTitle;
    filterToc(locale);
    if (focusIfHidden && focusedInside && previous !== panels.get(locale)) {
      openAncestors(target);
      focusTarget(target || heading || panels.get(locale));
    }
    if (announce) status.textContent = locale === 'pt-BR'
      ? `História em português do Brasil.${storageBlocked ? ' Preferência temporária nesta página.' : ''}`
      : `Story in US English.${storageBlocked ? ' This preference is temporary on this page.' : ''}`;
    document.dispatchEvent(new CustomEvent('architecture-story-language-change', { detail: { locale } }));
    return true;
  }

  function openAncestors(target) {
    for (let parent = target?.parentElement; parent && wrapper.contains(parent); parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
    }
  }

  function contextHeading(panel) {
    const hashTarget = targetForAnchor(location.hash);
    if (hashTarget && panel.contains(hashTarget)) {
      const hashHeading = hashTarget.closest('h2,h3,h4,h5,h6');
      if (hashHeading) return hashHeading;
      // Legacy aliases can be empty anchors immediately before a heading.
      if (!hashTarget.textContent.trim()) {
        const following = [...panel.querySelectorAll('h2,h3,h4,h5,h6')].find(candidate =>
          hashTarget.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING);
        if (following) return following;
      }
    }
    const offset = document.body.classList.contains('header-unpinned') ? 0
      : document.querySelector('.topbar')?.getBoundingClientRect().height || 0;
    if (panel.getBoundingClientRect().top > offset + 80) return null;
    let chosen = null;
    for (const candidate of panel.querySelectorAll('h2,h3,h4,h5,h6')) {
      if (!candidate.getClientRects().length) continue;
      if (candidate.getBoundingClientRect().top <= offset + 80) chosen = candidate;
      else break;
    }
    return chosen;
  }

  function chooseLocale(locale) {
    manuallySelected = true;
    if (locale === activeLocale) { savePreference(locale); return; }
    const previousPanel = panels.get(activeLocale);
    const nextPanel = panels.get(locale);
    const previousHeadings = [...previousPanel.querySelectorAll('h2,h3,h4,h5,h6')];
    const headingIndex = previousHeadings.indexOf(contextHeading(previousPanel));
    const nextHeading = headingIndex >= 0 ? nextPanel.querySelectorAll('h2,h3,h4,h5,h6')[headingIndex] : null;
    const openDetails = [...previousPanel.querySelectorAll('details')].map(item => item.open);
    for (const [index, item] of [...nextPanel.querySelectorAll('details')].entries()) if (index < openDetails.length) item.open = openDetails[index];
    savePreference(locale);
    showLocale(locale, { announce: true });
    if (nextHeading) {
      openAncestors(nextHeading);
      // Keep direct links coherent on refresh without changing the route,
      // creating a history entry, or touching the reader's saved data.
      if (location.hash && panelForTarget(targetForAnchor(location.hash))) {
        const oldURL = location.href;
        const nextURL = new URL(oldURL);
        nextURL.hash = nextHeading.id;
        try {
          history.replaceState(history.state, '', nextURL.href);
          window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: nextURL.href }));
        } catch { /* Locale and visible context still work if history is unavailable. */ }
      }
      requestAnimationFrame(() => {
        nextHeading.scrollIntoView({ block: 'start', behavior: 'instant' });
        focusTarget(nextHeading);
      });
    }
  }

  // site.js calls this before revealing both direct links and saved positions.
  // It selects a pane only; the reader retains ownership of scrolling/resume.
  function revealAnchor(value) {
    const target = targetForAnchor(value);
    const panel = panelForTarget(target);
    if (!panel) return false;
    showLocale(panel.dataset.storyLocale, { focusIfHidden: true, target });
    return true;
  }

  // A saved position can arrive after a manual language choice because the
  // reader loads its catalog asynchronously. Restore its corresponding section
  // in the chosen language rather than undoing that more recent choice.
  function resumeAnchor(value) {
    const target = targetForAnchor(value);
    const panel = panelForTarget(target);
    if (!manuallySelected || !panel || panel.dataset.storyLocale === activeLocale) return value;
    const headings = [...panel.querySelectorAll('h2,h3,h4,h5,h6')];
    let index = headings.indexOf(target);
    if (index < 0 && !target.textContent.trim()) index = headings.findIndex(candidate =>
      target.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING);
    return index < 0 ? value : panels.get(activeLocale).querySelectorAll('h2,h3,h4,h5,h6')[index]?.id || value;
  }

  wrapper.dataset.storyLocalesInitialized = 'true';
  const preference = readPreference();
  const initialTarget = targetForAnchor(location.hash);
  const initialPanel = panelForTarget(initialTarget);
  showLocale(initialPanel?.dataset.storyLocale || preference);
  window.addEventListener('hashchange', () => revealAnchor(location.hash), { capture: true });
  window.addEventListener('popstate', () => revealAnchor(location.hash), { capture: true });
  return { revealAnchor, resumeAnchor, get locale() { return activeLocale; } };
}
