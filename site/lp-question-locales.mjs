const locales = ['pt-BR', 'en-US'];

// The Markdown already contains each question and its translation. Enhance only
// those pairs, leaving the principle's narrative and the canonical anchors alone.
export function initLpQuestionLocales({ onStorageError } = {}) {
  const article = document.querySelector('[data-lp-question-bank]');
  if (!article || article.dataset.lpQuestionLocalesInitialized === 'true') return;
  const prefix = article.dataset.lpQuestionBank;
  if (!/^lp(?:0[1-9]|1[0-6])$/.test(prefix)) return;
  const units = new Map();
  const idPattern = new RegExp(`^${prefix}-(?:q(?:0[1-9]|1[0-2])|f0[1-6])$`);
  const storageKey = `architecture-practice:lp-question-languages:v1:${document.body.dataset.contentId}`;
  let preferences = {};
  let storageBlocked = false;
  function storageFailure() { storageBlocked = true; onStorageError?.(); }

  for (const anchor of article.querySelectorAll('a[id]')) {
    if (!idPattern.test(anchor.id)) continue;
    const item = anchor.closest('li');
    const paragraphs = [...(item?.children || [])].filter(node => node.matches('p'));
    const pt = paragraphs.find(paragraph => paragraph.contains(anchor));
    const en = paragraphs.find(paragraph => paragraph.querySelector(':scope > strong')?.textContent.trim() === 'EN:');
    if (!item || !pt || !en || paragraphs.length !== 2) continue;
    const marker = en.querySelector(':scope > strong');
    marker.remove();
    const identifier = pt.querySelector(':scope > strong');
    if (identifier?.textContent.trim() === `${anchor.id.toUpperCase()}.`) en.prepend(identifier.cloneNode(true), document.createTextNode(' '));

    item.dataset.lpQuestion = anchor.id;
    item.classList.add('lp-question');
    anchor.classList.add('lp-question-anchor');
    // A shared anchor remains outside both translated panes. Old links and
    // saved reading positions therefore work in either language, without aliases.
    item.prepend(anchor);
    const panels = new Map(locales.map((locale, index) => {
      const panel = document.createElement('div');
      panel.dataset.lpQuestionLocale = locale; panel.lang = locale;
      panel.append(index === 0 ? pt : en);
      item.append(panel);
      return [locale, panel];
    }));
    const controls = document.createElement('div');
    controls.className = 'story-language-controls lp-question-language-controls';
    controls.dataset.lpLanguageControls = '';
    controls.setAttribute('role', 'group');
    const label = document.createElement('span'); label.className = 'story-language-label';
    const group = document.createElement('div'); group.className = 'story-language-buttons';
    const status = document.createElement('span'); status.className = 'sr-only';
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
    const unit = { id: anchor.id, panels, controls, label, status, locale: 'pt-BR', followUp: anchor.id.includes('-f') };
    unit.buttons = new Map(locales.map(locale => {
      const button = document.createElement('button');
      button.type = 'button'; button.lang = locale; button.textContent = locale === 'pt-BR' ? 'PT-BR' : 'EN-US';
      button.dataset.lpLanguageOption = locale;
      button.setAttribute('aria-label', locale === 'pt-BR' ? `Ler ${unit.id.toUpperCase()} em português do Brasil` : `Read ${unit.id.toUpperCase()} in US English`);
      button.addEventListener('click', () => {
        show(unit, locale, true);
        preferences[unit.id] = locale;
        if (storageBlocked) return;
        try { localStorage.setItem(storageKey, JSON.stringify(preferences)); }
        catch { storageFailure(); }
      });
      group.append(button);
      return [locale, button];
    }));
    controls.append(label, group, status);
    anchor.after(controls);
    units.set(unit.id, unit);
  }
  function show(unit, locale, announce = false) {
    const previous = unit.panels.get(unit.locale);
    const focusWasInside = previous.contains(document.activeElement);
    unit.locale = locale;
    for (const [key, panel] of unit.panels) panel.hidden = key !== locale;
    for (const [key, button] of unit.buttons) button.setAttribute('aria-pressed', String(key === locale));
    const label = unit.followUp ? (locale === 'pt-BR' ? 'Idioma do aprofundamento' : 'Follow-up language') : (locale === 'pt-BR' ? 'Idioma desta pergunta' : 'Question language');
    unit.label.textContent = label; unit.label.lang = locale;
    unit.controls.lang = locale;
    unit.controls.setAttribute('aria-label', `${label}: ${unit.id.toUpperCase()}`);
    unit.status.lang = locale;
    if (focusWasInside && previous.hidden) unit.buttons.get(locale).focus({ preventScroll: true });
    if (announce) unit.status.textContent = `${label}: ${locale}.`;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) preferences = Object.fromEntries(Object.entries(saved).filter(([id, locale]) => units.has(id) && locales.includes(locale)));
  } catch (error) { if (!(error instanceof SyntaxError)) storageFailure(); }
  for (const unit of units.values()) show(unit, preferences[unit.id] || 'pt-BR');
  article.dataset.lpQuestionLocalesInitialized = 'true';
}
