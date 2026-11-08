/* Private, local interview practice. No analytics, remote calls, TTS, or shared site state. */
const STORAGE_PREFIX = 'loop-private:v1';
const THEME_KEY = `${STORAGE_PREFIX}:theme`;
const DIMENSIONS = [
  ['aderencia', 'Aderência à pergunta'],
  ['responsabilidade', 'Responsabilidade individual'],
  ['raciocinio', 'Raciocínio e decisão'],
  ['colaboracao', 'Colaboração e comunicação'],
  ['resultado', 'Resultado e evidência'],
  ['aprendizado', 'Aprendizado e limites'],
];
const RATINGS = [
  ['nao-observado', 'Não observado'],
  ['demonstrado', 'Demonstrado'],
  ['parcial', 'Parcial'],
  ['a-aprofundar', 'A aprofundar'],
];
const KIND_LABELS = {
  behavioral: 'Comportamental',
  technical: 'Técnica',
  consultative: 'Conversa consultiva',
  presentation: 'Apresentação',
};

function node(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value == null || value === false) continue;
    if (key === 'className') element.className = value;
    else if (key === 'text') element.textContent = String(value);
    else if (key === 'value') element.value = String(value);
    else if (key === 'checked') element.checked = Boolean(value);
    else if (key === 'disabled') element.disabled = Boolean(value);
    else if (key === 'hidden') element.hidden = Boolean(value);
    else element.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of [children].flat(Infinity)) {
    if (child != null && child !== false) element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return element;
}

function button(text, action, attributes = {}) {
  return node('button', { type: 'button', className: 'loop-button', 'data-action': action, text, ...attributes });
}

function replaceContent(element, ...children) {
  element.replaceChildren(...children.flat(Infinity).filter(child => child != null && child !== false));
}

function textList(values) {
  return node('ul', {}, (Array.isArray(values) ? values : []).map(value => node('li', { text: value })));
}

function details(title, children, attributes = {}) {
  return node('details', { className: 'loop-details', ...attributes }, [node('summary', { text: title }), node('div', { className: 'loop-stack' }, children)]);
}

function escaped(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

// Markdown is generated locally. Keep only inert markup, including in the isolated presentation.
function inertHtml(value) {
  const template = document.createElement('template');
  template.innerHTML = typeof value === 'string' ? value : '';
  const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'CODE', 'PRE', 'UL', 'OL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'HR', 'DL', 'DT', 'DD', 'SPAN', 'A', 'SUP', 'SUB']);
  for (const element of [...template.content.querySelectorAll('*')]) {
    if (!allowed.has(element.tagName)) {
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'LINK', 'META', 'BASE', 'IMG', 'SVG', 'MATH'].includes(element.tagName)) element.remove();
      else element.replaceWith(...element.childNodes);
      continue;
    }
    for (const attribute of [...element.attributes]) element.removeAttribute(attribute.name);
  }
  return template.innerHTML;
}

function htmlBlock(value, attributes = {}) {
  const element = node('div', { className: 'loop-markdown', ...attributes });
  element.innerHTML = inertHtml(value);
  return element;
}

function safeLocalUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '#';
  try {
    const target = new URL(value, location.origin);
    return target.origin === location.origin ? `${target.pathname}${target.search}${target.hash}` : '#';
  } catch { return '#'; }
}

const app = document.getElementById('app');
let data;
try {
  data = JSON.parse(document.getElementById('loop-data')?.textContent || '{}');
  if (data.schemaVersion !== 1 || !Array.isArray(data.sessions) || !data.sessions.length) throw new Error('Invalid private data');
} catch {
  if (app) app.replaceChildren(node('main', { className: 'loop-panel' }, [
    node('h1', { text: 'Não foi possível abrir o roteiro privado' }),
    node('p', { text: 'Confira a geração local do material. Conduza a conversa oralmente; não compartilhe esta tela.' }),
  ]));
}

if (data?.schemaVersion === 1 && Array.isArray(data.sessions) && data.sessions.length && app) startApp();

function startApp() {
  let storageBlocked = false;
  const recordCache = new Map();
  const runtime = new Map();
  let activeSessionIndex = 0;
  let questionSerial = 0;
  let themePreference = 'system';
  const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

  function warnStorage() {
    storageBlocked = true;
    const warning = document.getElementById('loop-storage-warning');
    if (warning) warning.hidden = false;
    updateSaveStatus();
  }

  function readStorage(key) {
    if (storageBlocked) return null;
    try { return localStorage.getItem(key); }
    catch { warnStorage(); return null; }
  }

  function writeStorage(key, value) {
    if (storageBlocked) return false;
    try { localStorage.setItem(key, value); return true; }
    catch { warnStorage(); return false; }
  }

  function recordKey(session) { return `${STORAGE_PREFIX}:${data.pageId}:${session.id}`; }

  function emptyRecord(session) {
    return {
      schemaVersion: 1, pageId: String(data.pageId), sessionId: String(session.id), updatedAt: null,
      episodio: '', dimensions: Object.fromEntries(DIMENSIONS.map(([key]) => [key, { status: 'nao-observado', note: '' }])),
      duvida: '', ajuda: '', proxima: '', evidenceLog: [], exerciseDrafts: {},
    };
  }

  function recordFor(session) {
    const key = recordKey(session);
    if (recordCache.has(key)) return recordCache.get(key);
    const record = emptyRecord(session);
    const stored = readStorage(key);
    if (stored) {
      try {
        const saved = JSON.parse(stored);
        if (saved?.schemaVersion === 1 && saved.pageId === String(data.pageId) && saved.sessionId === String(session.id)) {
          for (const field of ['episodio', 'duvida', 'ajuda', 'proxima']) if (typeof saved[field] === 'string') record[field] = saved[field];
          for (const [dimension] of DIMENSIONS) {
            const item = saved.dimensions?.[dimension];
            if (RATINGS.some(([value]) => value === item?.status)) record.dimensions[dimension].status = item.status;
            if (typeof item?.note === 'string') record.dimensions[dimension].note = item.note;
          }
          record.updatedAt = typeof saved.updatedAt === 'string' ? saved.updatedAt : null;
          record.evidenceLog = Array.isArray(saved.evidenceLog) ? saved.evidenceLog.filter(entry => entry && typeof entry.questionId === 'string' && typeof entry.cardId === 'string' && typeof entry.releasedAt === 'string').map(entry => ({
            questionId: entry.questionId, cardId: entry.cardId, releasedAt: entry.releasedAt,
            request: typeof entry.request === 'string' ? entry.request : '', conditionalConfirmed: entry.conditionalConfirmed === true,
          })) : [];
          if (saved.exerciseDrafts && typeof saved.exerciseDrafts === 'object' && !Array.isArray(saved.exerciseDrafts)) {
            for (const question of [...(session.questions || []), ...(session.reserves || [])]) {
              const draft = saved.exerciseDrafts[question.id];
              if (draft && typeof draft.request === 'string') {
                record.exerciseDrafts[question.id] = { request: draft.request };
              }
            }
          }
        }
      } catch { announce('O registro local anterior não pôde ser lido. Um registro vazio está disponível nesta sessão.'); }
    }
    recordCache.set(key, record);
    return record;
  }

  function saveRecord(session) {
    const record = recordFor(session);
    record.updatedAt = new Date().toISOString();
    writeStorage(recordKey(session), JSON.stringify(record));
    updateSaveStatus();
  }

  function updateSaveStatus() {
    const status = document.getElementById('loop-save-status');
    if (!status) return;
    status.textContent = storageBlocked
      ? 'Registro mantido apenas nesta aba. Exporte o JSON antes de fechar.'
      : 'Registro privado salvo neste navegador a cada alteração. Você pode exportá-lo em JSON.';
  }

  function announce(message) {
    const status = document.getElementById('loop-status');
    if (status) status.textContent = message;
  }

  function applyTheme() {
    document.body.dataset.loopTheme = themePreference === 'system' ? (media?.matches ? 'dark' : 'light') : themePreference;
  }

  const savedTheme = readStorage(THEME_KEY);
  if (['system', 'light', 'dark'].includes(savedTheme)) themePreference = savedTheme;
  applyTheme();
  media?.addEventListener?.('change', () => { if (themePreference === 'system') applyTheme(); });

  const themeSelect = node('select', { id: 'loop-theme', 'data-action': 'theme', 'aria-label': 'Tema da página privada' }, [
    node('option', { value: 'system', text: 'Sistema' }), node('option', { value: 'light', text: 'Claro' }), node('option', { value: 'dark', text: 'Escuro' }),
  ]);
  themeSelect.value = themePreference;
  themeSelect.addEventListener('change', () => {
    themePreference = themeSelect.value;
    applyTheme();
    writeStorage(THEME_KEY, themePreference);
  });

  const header = node('header', { className: 'loop-header' }, [
    node('div', { className: 'loop-brand' }, [
      node('span', { className: 'loop-eyebrow', text: 'Roteiro privado · instrutor' }),
      node('h1', { text: data.title }),
      node('p', { className: 'loop-muted', text: data.dateLabel }),
    ]),
    node('nav', { className: 'loop-nav', 'aria-label': 'Páginas do roteiro privado', 'data-private-pages': '' }, [
      node('a', { className: 'loop-page-link', href: `${location.pathname}${location.search}`, 'aria-current': 'page', text: data.title }),
      node('a', { className: 'loop-page-link', href: safeLocalUrl(data.otherPage?.url), text: data.otherPage?.title || 'Outra agenda' }),
    ]),
    node('label', { className: 'loop-theme', for: 'loop-theme' }, [node('span', { text: 'Tema' }), themeSelect]),
  ]);
  const sessionNav = node('nav', { className: 'loop-sessions', 'aria-label': 'Selecionar sessão' }, [
    node('h2', { className: 'loop-eyebrow', text: 'Sessões' }),
    ...data.sessions.map((session, index) => {
      const control = button('', 'select-session', {
        id: `loop-session-${index}`, className: 'loop-session-button', 'data-session-id': session.id,
        'aria-pressed': String(index === 0), 'aria-controls': 'loop-session-panel',
      });
      control.append(node('span', { text: session.time }), node('strong', { text: session.name }), node('span', { text: session.role }));
      control.addEventListener('click', () => selectSession(index));
      return control;
    }),
  ]);
  const main = node('main', { id: 'loop-session-panel', className: 'loop-main', 'aria-labelledby': 'loop-session-title' });
  const warning = node('p', { id: 'loop-storage-warning', className: 'loop-warning', role: 'status', hidden: !storageBlocked, text: 'O armazenamento do navegador está indisponível. As alterações ficam apenas nesta aba; exporte o registro em JSON antes de fechar.' });
  app.replaceChildren(
    node('a', { className: 'loop-skip', href: '#loop-session-title', text: 'Ir para a sessão ativa' }),
    header,
    node('div', { className: 'loop-private-notice', 'data-private-notice': '' }, [
      node('strong', { text: 'Tela exclusiva de quem conduz. Não compartilhe esta página inteira.' }),
      node('p', { text: data.privacyNotice || 'Apresente somente a pergunta ou a evidência escolhida usando o botão de apresentação. O restante contém notas privadas.' }),
    ]),
    node('p', { className: 'loop-intro', text: data.intro }), warning,
    node('p', { id: 'loop-status', className: 'loop-status', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }),
    node('div', { className: 'loop-layout' }, [sessionNav, main]),
    node('footer', { className: 'loop-footer', text: 'Material local de preparação. Hipóteses, tempos e dimensões de observação não são critérios oficiais nem previsão de resultado.' }),
  );

  function sessionRuntime(session) {
    if (!runtime.has(session.id)) runtime.set(session.id, { questionIndex: 0, phaseIndex: 0, elapsedMs: 0, startedAt: null, running: false });
    return runtime.get(session.id);
  }

  function selectedSession() { return data.sessions[activeSessionIndex]; }

  function allQuestions(session) {
    return [...(session.questions || []).map(question => ({ question, reserve: false })), ...(session.reserves || []).map(question => ({ question, reserve: true }))];
  }

  function selectSession(index, focus = true) {
    activeSessionIndex = index;
    const session = selectedSession();
    for (const control of sessionNav.querySelectorAll('[data-session-id]')) control.setAttribute('aria-pressed', String(control.dataset.sessionId === session.id));
    main.dataset.activeSessionId = session.id;
    const state = sessionRuntime(session);
    const hypothesis = node('section', { className: 'loop-card loop-hypothesis', 'aria-labelledby': 'loop-hypothesis-title' }, [
      node('h3', { id: 'loop-hypothesis-title', text: 'Hipótese de preparação' }),
      textList(session.hypothesis),
      node('p', { className: 'loop-muted', 'data-hypothesis-disclaimer': '', text: 'Hipótese de treino, não confirmada: não representa atribuição oficial de LPs, roteiro oficial da entrevista ou critério de aprovação.' }),
    ]);
    main.replaceChildren(
      node('section', { className: 'loop-panel' }, [
        node('div', { className: 'loop-session-heading' }, [
          node('div', {}, [node('p', { className: 'loop-eyebrow', text: session.time }), node('h2', { id: 'loop-session-title', tabindex: '-1', text: session.name }), node('p', { className: 'loop-meta', text: session.role })]),
          node('p', { className: 'loop-muted', text: session.objective }),
        ]),
        node('div', { className: 'loop-grid' }, [hypothesis, renderTimer(session, state)]),
      ]),
      node('section', { id: 'loop-question-area', className: 'loop-panel', 'aria-label': 'Condução da pergunta' }),
      renderRegistration(session),
    );
    renderQuestion(session, state.questionIndex, false);
    updateSaveStatus();
    if (focus) document.getElementById('loop-session-title')?.focus();
  }

  function durationFor(session, state) {
    return Math.max(0, Number(session.agenda?.[state.phaseIndex]?.minutes) || 0) * 60_000;
  }

  function elapsedFor(state) {
    return state.elapsedMs + (state.running && state.startedAt != null ? Date.now() - state.startedAt : 0);
  }

  function timerText(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  function refreshTimer() {
    const session = selectedSession();
    const state = sessionRuntime(session);
    const duration = durationFor(session, state);
    const elapsed = elapsedFor(state);
    if (state.running && elapsed >= duration) {
      state.running = false;
      state.startedAt = null;
      state.elapsedMs = duration;
      announce('O tempo da fase terminou. Selecione manualmente a próxima fase quando desejar.');
    }
    const display = document.getElementById('loop-timer-display');
    if (!display) return;
    const phase = session.agenda?.[state.phaseIndex];
    display.textContent = timerText(duration - elapsedFor(state));
    display.setAttribute('aria-label', `${phase?.label || 'Fase'}: ${display.textContent} restantes`);
    const start = document.querySelector('[data-action="timer-start"]');
    const pause = document.querySelector('[data-action="timer-pause"]');
    const reset = document.querySelector('[data-action="timer-reset"]');
    if (start) { start.disabled = state.running || duration <= 0 || elapsedFor(state) >= duration; start.textContent = state.elapsedMs > 0 ? 'Retomar' : 'Iniciar'; }
    if (pause) pause.disabled = !state.running;
    if (reset) reset.disabled = !state.running && state.elapsedMs === 0;
    const status = document.getElementById('loop-timer-status');
    if (status) status.textContent = elapsedFor(state) >= duration && duration > 0 ? 'Tempo concluído. A próxima fase depende da sua escolha.' : state.running ? 'Em andamento' : state.elapsedMs > 0 ? 'Pausado' : 'Pronto para iniciar';
  }

  function renderTimer(session, state) {
    const phases = Array.isArray(session.agenda) ? session.agenda : [];
    const phaseList = node('div', { className: 'loop-phase-list', 'aria-label': 'Escolher fase da agenda' }, phases.map((phase, index) => {
      const control = button(`${phase.label} · ${phase.minutes} min`, 'select-phase', { className: 'loop-phase-button', 'data-phase-index': index, 'aria-pressed': String(index === state.phaseIndex) });
      control.addEventListener('click', () => {
        state.phaseIndex = index; state.running = false; state.startedAt = null; state.elapsedMs = 0;
        for (const phaseButton of phaseList.querySelectorAll('button')) phaseButton.setAttribute('aria-pressed', String(Number(phaseButton.dataset.phaseIndex) === index));
        document.getElementById('loop-phase-label').textContent = phase.label;
        refreshTimer();
        announce(`Fase selecionada: ${phase.label}. O cronômetro está parado.`);
      });
      return control;
    }));
    const start = button('Iniciar', 'timer-start', { className: 'loop-button loop-button-primary' });
    start.addEventListener('click', () => { if (!state.running && elapsedFor(state) < durationFor(session, state)) { state.startedAt = Date.now(); state.running = true; refreshTimer(); } });
    const pause = button('Pausar', 'timer-pause', { disabled: !state.running });
    pause.addEventListener('click', () => { if (state.running) { state.elapsedMs = elapsedFor(state); state.startedAt = null; state.running = false; refreshTimer(); } });
    const reset = button('Reiniciar fase', 'timer-reset');
    reset.addEventListener('click', () => { state.elapsedMs = 0; state.startedAt = null; state.running = false; refreshTimer(); });
    return node('section', { className: 'loop-card loop-timer', 'aria-labelledby': 'loop-agenda-title' }, [
      node('h3', { id: 'loop-agenda-title', text: 'Agenda e cronômetro' }), phaseList,
      node('strong', { id: 'loop-phase-label', text: phases[state.phaseIndex]?.label || 'Sem fase' }),
      node('output', { id: 'loop-timer-display', className: 'loop-timer-display', role: 'timer', 'aria-live': 'off', text: timerText(durationFor(session, state) - elapsedFor(state)) }),
      node('div', { className: 'loop-timer-actions' }, [start, pause, reset]),
      node('p', { id: 'loop-timer-status', className: 'loop-muted', text: 'Pronto para iniciar' }),
      node('p', { className: 'loop-muted', text: 'Fases e evidências só avançam por escolha explícita de quem conduz.' }),
    ]);
  }

  function renderQuestion(session, index, focus = true) {
    const questions = allQuestions(session);
    const entry = questions[Math.min(Math.max(0, index), questions.length - 1)];
    const area = document.getElementById('loop-question-area');
    if (!entry) { replaceContent(area, node('p', { text: 'Nenhuma pergunta disponível nesta sessão.' })); return; }
    const state = sessionRuntime(session);
    state.questionIndex = questions.indexOf(entry);
    const question = entry.question;
    questionSerial += 1;
    const serial = questionSerial;
    area.dataset.questionId = question.id;
    area.dataset.questionKind = question.kind;
    area.dataset.isReserve = String(entry.reserve);
    const select = node('select', { id: 'loop-question-select', 'data-action': 'select-question' });
    for (const [isReserve, label] of [[false, 'Perguntas principais'], [true, 'Reservas — usar como substituta']]) {
      const group = node('optgroup', { label });
      questions.forEach((item, itemIndex) => { if (item.reserve === isReserve) group.append(node('option', { value: itemIndex, 'data-question-id': item.question.id, text: `${item.question.id} · ${item.question.category || KIND_LABELS[item.question.kind] || 'Pergunta'}` })); });
      if (group.childElementCount) select.append(group);
    }
    select.value = String(state.questionIndex);
    select.addEventListener('change', () => renderQuestion(session, Number(select.value)));
    const previous = button('← Anterior', 'previous-question', { disabled: state.questionIndex === 0 });
    previous.addEventListener('click', () => renderQuestion(session, state.questionIndex - 1));
    const next = button('Próxima →', 'next-question', { disabled: state.questionIndex === questions.length - 1 });
    next.addEventListener('click', () => renderQuestion(session, state.questionIndex + 1));
    const readout = node('section', { id: 'loop-readout', className: 'loop-readout', hidden: true, 'aria-label': 'Leitura em voz alta — somente a pergunta', 'data-student-prompt': '' }, [node('p', { text: question.prompt })]);
    const readButton = button('Ler em voz alta', 'read-aloud', { 'aria-controls': 'loop-readout', 'aria-expanded': 'false' });
    readButton.addEventListener('click', () => {
      readout.hidden = !readout.hidden;
      readButton.setAttribute('aria-expanded', String(!readout.hidden));
      readButton.textContent = readout.hidden ? 'Ler em voz alta' : 'Fechar leitura';
      if (!readout.hidden) { readout.tabIndex = -1; readout.focus(); }
    });
    const present = button('Apresentar pergunta', 'present-prompt');
    present.addEventListener('click', () => presentSelection(`<p>${escaped(question.prompt)}</p>`));
    const notesSections = [
      ['Objetivo da observação', question.notes?.objective],
      ['Evidências a procurar', question.notes?.evidence],
      ['Limites e cuidados', question.notes?.limits],
      ['Esclarecimentos possíveis', question.notes?.clarifications],
      ['Observações para condução', question.notes?.observations],
    ].filter(([, value]) => Array.isArray(value) ? value.length : value);
    const notes = details('Notas privadas do instrutor', [
      ...notesSections.map(([title, value]) => node('section', { className: 'loop-stack' }, [node('h4', { text: title }), Array.isArray(value) ? textList(value) : node('p', { text: value })])),
      question.exercise?.premisesHtml ? node('section', { className: 'loop-stack', 'data-exercise-premises': '' }, [node('h4', { text: 'Premissas privadas do exercício' }), htmlBlock(question.exercise.premisesHtml)]) : null,
      question.exercise?.instructorHtml ? details('Orientações privadas do exercício', htmlBlock(question.exercise.instructorHtml), { 'data-exercise-instructor': '' }) : null,
      question.source ? node('p', { className: 'loop-source', text: `Fonte: ${question.source.label || ''} · ${question.source.path || ''}${question.source.anchor ? `#${question.source.anchor.replace(/^#/, '')}` : ''}${question.source.line ? ` · linha ${question.source.line}` : ''}` }) : null,
    ], { 'data-instructor-notes': '' });
    const kindLabel = KIND_LABELS[question.kind] || 'Pergunta';
    const contextParts = [entry.reserve ? 'Reserva substituta' : 'Pergunta principal', kindLabel];
    if (question.category && question.category !== kindLabel) contextParts.push(question.category);
    replaceContent(area,
      node('div', { className: 'loop-question-nav' }, [node('div', { className: 'loop-field' }, [node('label', { for: 'loop-question-select', text: 'Pergunta ou reserva substituta' }), select]), node('div', { className: 'loop-question-actions' }, [previous, next])]),
      node('p', { className: 'loop-question-context', 'data-question-context': '', text: contextParts.join(' · ') }),
      node('h3', { id: 'loop-question-heading', tabindex: '-1', text: question.kind === 'presentation' ? 'Contexto e tarefa de apresentação' : 'Pergunta para a candidata' }),
      node('p', { id: 'loop-question-prompt', className: 'loop-prompt', 'data-prompt': '', text: question.prompt }),
      node('div', { className: 'loop-question-actions' }, [readButton, present]), readout,
      node('section', { className: 'loop-stack', 'aria-label': 'Aprofundamentos privados' }, (question.followups || []).map((followup, followupIndex) => details(`Aprofundamento ${followupIndex + 1}`, node('p', { text: followup }), { className: 'loop-details loop-followup', 'data-followup-index': followupIndex }))),
      notes,
      question.exercise ? renderExercise(session, question, serial) : null,
      session.candidateQuestion ? details('Pergunta de encerramento da candidata', node('p', { text: session.candidateQuestion }), { 'data-candidate-question': '' }) : null,
      session.notesHtml ? details('Notas gerais da sessão', htmlBlock(session.notesHtml), { 'data-session-notes': '' }) : null,
    );
    if (focus) document.getElementById('loop-question-heading')?.focus();
  }

  function renderExercise(session, question, serial) {
    const exercise = question.exercise;
    const record = recordFor(session);
    const savedDraft = record.exerciseDrafts[question.id];
    if (!savedDraft || typeof savedDraft.request !== 'string') record.exerciseDrafts[question.id] = { request: '' };
    const draft = record.exerciseDrafts[question.id];
    const requestId = `loop-request-${serial}`;
    const requestInput = node('textarea', { id: requestId, rows: 3, 'data-evidence-request': '', 'data-question-id': question.id, value: draft.request, placeholder: 'Registre o pedido feito pela candidata, sem completar ou antecipar a investigação.' });
    const cardsArea = node('div', { className: 'loop-evidence-grid' });
    const log = node('section', { className: 'loop-log', 'aria-label': 'Registro de liberações de evidência', 'data-evidence-log': '' });
    const releaseControls = [];
    const wasReleased = card => record.evidenceLog.some(entry => entry.questionId === question.id && entry.cardId === card.id);

    function updateLog() {
      const entries = record.evidenceLog.filter(entry => entry.questionId === question.id);
      log.replaceChildren(node('h4', { text: 'Registro de liberações' }), entries.length ? node('ol', {}, entries.map(entry => {
        const card = exercise.cards?.find(item => item.id === entry.cardId);
        return node('li', {}, [node('strong', { text: card?.label || entry.cardId }), node('span', { text: ` · ${new Date(entry.releasedAt).toLocaleTimeString('pt-BR')} · Pedido: ${entry.request}` })]);
      })) : node('p', { className: 'loop-muted', text: 'Nenhuma evidência liberada. O cronômetro não libera cartões.' }));
    }

    function updateControls() {
      for (const item of releaseControls) {
        const released = wasReleased(item.card);
        item.release.disabled = released || !requestInput.value.trim() || !item.relevant.checked || (item.card.conditional && !item.conditional?.checked);
        item.release.textContent = released ? 'Evidência liberada' : 'Liberar evidência';
        item.present.hidden = !released;
        item.wrapper.dataset.released = String(released);
        item.status.hidden = !released;
      }
    }

    requestInput.addEventListener('input', () => {
      draft.request = requestInput.value;
      // A revised request needs a fresh confirmation of its relevance and conditions.
      for (const item of releaseControls) {
        item.relevant.checked = false;
        if (item.conditional) item.conditional.checked = false;
      }
      saveRecord(session);
      updateControls();
    });
    for (const [cardIndex, card] of (exercise.cards || []).entries()) {
      const cardId = `loop-card-${serial}-${cardIndex}`;
      const relevantId = `${cardId}-relevant`;
      const conditionalId = `${cardId}-conditional`;
      const relevant = node('input', { type: 'checkbox', id: relevantId, 'data-confirm-relevant': '', 'data-card-id': card.id });
      const conditional = card.conditional ? node('input', { type: 'checkbox', id: conditionalId, 'data-confirm-conditional': '', 'data-card-id': card.id }) : null;
      relevant.addEventListener('change', updateControls);
      conditional?.addEventListener('change', updateControls);
      const release = button('Liberar evidência', 'release-evidence', { className: 'loop-button loop-button-primary', 'data-card-id': card.id, disabled: true });
      const present = button('Apresentar evidência', 'present-evidence', { 'data-card-id': card.id, hidden: true });
      present.addEventListener('click', () => { if (wasReleased(card)) presentSelection(inertHtml(card.studentHtml)); });
      const status = node('p', { className: 'loop-released', 'data-evidence-released': '', hidden: true, text: 'Liberada. Use “Apresentar evidência” para abrir somente este conteúdo.' });
      const wrapper = node('article', { className: 'loop-evidence-card', 'data-card-id': card.id, 'data-conditional': String(Boolean(card.conditional)) }, [
        details(card.label || `Cartão ${cardIndex + 1}`, [
          card.conditional ? node('p', { className: 'loop-condition', 'data-release-condition': '', text: `Condição privada de liberação: ${card.condition || 'A candidata precisa propor a recuperação e definir os critérios de sucesso e de interrupção antes de receber esta evidência.'}` }) : null,
          node('p', { className: 'loop-muted', text: card.request || 'Libere somente quando houver um pedido relevante.' }),
          card.notesHtml ? details('Orientação privada deste cartão', htmlBlock(card.notesHtml), { 'data-card-notes': '' }) : null,
          node('label', { className: 'loop-check', for: relevantId }, [relevant, node('span', { text: 'Confirmo que a candidata fez um pedido relevante para esta evidência.' })]),
          details('Consultar informação deste cartão — somente instrutor', htmlBlock(card.studentHtml), { 'data-card-preview': '' }),
          conditional ? node('label', { className: 'loop-check', for: conditionalId }, [conditional, node('span', { text: card.confirmation || 'Confirmo que a candidata propôs a recuperação e definiu critérios de sucesso e de interrupção.' })]) : null,
          node('div', { className: 'loop-question-actions' }, [release, present]), status,
        ], { 'data-evidence-card': '', id: cardId }),
      ]);
      release.addEventListener('click', () => {
        if (wasReleased(card) || !requestInput.value.trim() || !relevant.checked || (card.conditional && !conditional?.checked)) return;
        record.evidenceLog.push({ questionId: String(question.id), cardId: String(card.id), releasedAt: new Date().toISOString(), request: requestInput.value.trim(), conditionalConfirmed: Boolean(conditional?.checked) });
        saveRecord(session); updateControls(); updateLog();
        announce('Evidência liberada. Para mostrá-la à candidata, escolha Apresentar evidência.');
        present.focus();
      });
      releaseControls.push({ card, relevant, conditional, release, present, wrapper, status });
      cardsArea.append(wrapper);
    }
    updateControls(); updateLog();
    return node('section', { className: 'loop-card loop-stack', 'data-exercise': '', 'aria-label': 'Controle privado do exercício' }, [
      node('h4', { text: `Exercício · ${exercise.variantLabel || 'evidências sob solicitação'}` }),
      node('p', { className: 'loop-muted', text: 'Registre o pedido e confirme sua pertinência. A liberação registra a decisão; a apresentação exige outro clique. Não antecipe os próximos cartões.' }),
      node('div', { className: 'loop-field' }, [node('label', { for: requestId, text: 'Solicitação feita pela candidata — campo privado' }), requestInput]),
      cardsArea, log,
    ]);
  }

  function renderRegistration(session) {
    const record = recordFor(session);
    const sessionNumber = activeSessionIndex;
    function recordField(key, label, rows = 3) {
      const id = `loop-record-${sessionNumber}-${key}`;
      const input = node('textarea', { id, rows, value: record[key], 'data-record-field': key });
      input.addEventListener('input', () => { record[key] = input.value; saveRecord(session); });
      return node('div', { className: 'loop-field' }, [node('label', { for: id, text: label }), input]);
    }
    const dimensions = DIMENSIONS.map(([key, label]) => {
      const selectId = `loop-dimension-${sessionNumber}-${key}`;
      const noteId = `${selectId}-note`;
      const select = node('select', { id: selectId, 'data-dimension': key, 'data-dimension-field': 'status' }, RATINGS.map(([value, text]) => node('option', { value, text })));
      select.value = record.dimensions[key].status;
      select.addEventListener('change', () => { record.dimensions[key].status = select.value; saveRecord(session); });
      const note = node('textarea', { id: noteId, rows: 2, value: record.dimensions[key].note, 'data-dimension': key, 'data-dimension-field': 'note' });
      note.addEventListener('input', () => { record.dimensions[key].note = note.value; saveRecord(session); });
      return node('div', { className: 'loop-dimension loop-stack' }, [node('label', { for: selectId, text: label }), select, node('label', { for: noteId, text: `Evidência observada — ${label.toLowerCase()}` }), note]);
    });
    const exportButton = button('Exportar registro da sessão (JSON)', 'export-record');
    exportButton.addEventListener('click', () => {
      const exported = JSON.stringify(recordFor(session), null, 2);
      const url = URL.createObjectURL(new Blob([exported], { type: 'application/json;charset=utf-8' }));
      const link = node('a', { href: url, download: `loop-privado-${String(data.pageId).replace(/[^a-z0-9_-]/gi, '-')}-${String(session.id).replace(/[^a-z0-9_-]/gi, '-')}.json`, hidden: true });
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      announce('Exportação do registro privado iniciada.');
    });
    return node('section', { className: 'loop-panel loop-registration loop-stack', 'aria-labelledby': 'loop-registration-title', 'data-session-record': session.id }, [
      node('h3', { id: 'loop-registration-title', text: 'Registro privado da sessão' }),
      node('p', { className: 'loop-muted', text: 'Registre fatos e dúvidas antes do feedback. As dimensões abaixo organizam a observação do treino; não são uma rubrica oficial.' }),
      recordField('episodio', 'Episódio e evidências observadas', 5),
      node('div', { className: 'loop-dimension-grid' }, dimensions),
      recordField('duvida', 'Dúvida que permanece'), recordField('ajuda', 'Ajuda oferecida durante o treino'), recordField('proxima', 'Próxima reformulação ou tentativa'),
      node('p', { id: 'loop-save-status', className: 'loop-muted' }), exportButton,
    ]);
  }

  function presentSelection(selectedHtml) {
    // A fresh window receives only the explicit selection. Never copy parent DOM, data, or state.
    let popup;
    try { popup = window.open('about:blank', '_blank', 'popup,width=1100,height=780'); }
    catch { popup = null; }
    if (!popup) { announce('A janela de apresentação foi bloqueada. Conduza oralmente usando apenas a pergunta ou a evidência selecionada; não compartilhe esta tela privada.'); return; }
    try {
      popup.opener = null;
      const content = inertHtml(selectedHtml);
      const policy = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'";
      const studentDocument = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${escaped(policy)}"><title>Apresentação</title><style>html{color-scheme:light}body{margin:0;padding:clamp(1.25rem,5vw,4rem);background:#FAF8F5;color:#1F1C19;font:clamp(1.15rem,2vw,1.55rem)/1.6 system-ui,sans-serif;overflow-wrap:anywhere}main{max-width:65rem;margin:auto}h1,h2,h3,h4{line-height:1.25}p{white-space:pre-wrap}pre{white-space:pre-wrap;padding:1rem;background:#F1EDE7}table{border-collapse:collapse;width:100%;font-size:.85em}th,td{border:1px solid #CCC3B8;padding:.6rem;text-align:left;vertical-align:top}code{font-family:ui-monospace,monospace}li+li{margin-top:.5rem}</style></head><body><main>${content}</main></body></html>`;
      const popupDocument = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src about:; style-src 'unsafe-inline'; script-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>Apresentação</title><style>html,body{margin:0;height:100%;background:#FAF8F5}iframe{display:block;width:100%;height:100%;border:0}</style></head><body><iframe title="Conteúdo selecionado para apresentação" sandbox referrerpolicy="no-referrer" srcdoc="${escaped(studentDocument)}"></iframe></body></html>`;
      popup.document.open(); popup.document.write(popupDocument); popup.document.close();
      popup.focus();
      announce('Janela aberta somente com o conteúdo selecionado. Confira essa janela antes de compartilhar.');
    } catch {
      try { popup.close(); } catch { /* The oral fallback remains available. */ }
      announce('Não foi possível abrir a apresentação isolada. Conduza oralmente sem compartilhar esta tela privada.');
    }
  }

  selectSession(0, false);
  refreshTimer();
  setInterval(refreshTimer, 1000);
}
